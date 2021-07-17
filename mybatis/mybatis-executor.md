# MyBatis 核心配置综述之Executor

* [MyBatis 核心配置综述之Executor](#mybatis-核心配置综述之executor)
   * [MyBatis四大组件之 Executor执行器](#mybatis四大组件之-executor执行器)
      * [Executor的继承结构](#executor的继承结构)
      * [Executor创建过程以及源码分析](#executor创建过程以及源码分析)
      * [Executor接口的主要方法](#executor接口的主要方法)
         * [大致流程](#大致流程)
         * [query()方法](#query方法)
         * [update() 方法](#update-方法)
         * [queryCursor()方法](#querycursor方法)
         * [flushStatements() 方法](#flushstatements-方法)
         * [createCacheKey() 方法](#createcachekey-方法)
         * [Executor 中的其他方法](#executor-中的其他方法)
      * [Executor 的现实抽象](#executor-的现实抽象)

上一篇我们对**SqlSession**和**SqlSessionFactory**的创建过程有了一个详细的了解，但上述的创建过程只是为SQL执行和SQL映射做了基础的铺垫而已，就和我们Spring源码为Bean容器的加载进行许多初始化的工作相同，那么做好前期的准备工作接下来该做什么了？该做数据库连接驱动管理和SQL解析工作了！那么本篇本章就来讨论一下数据库驱动连接管理和SQL解析的管理组件之 Executor执行器。

## MyBatis四大组件之 Executor执行器

每一个SqlSession都会拥有一个Executor对象，这个对象负责增删改查的具体操作，我们可以简单的将它理解为JDBC中Statement的封装版。

### Executor的继承结构

![](https://img2018.cnblogs.com/blog/1515111/201907/1515111-20190712212021056-370260467.png)


如图所示，位于继承体系最顶层的是Executor执行器，它有两个实现类，分别是`BaseExecutor`和 `CachingExecutor`。

`BaseExecutor` 是一个抽象类，这种通过抽象的实现接口的方式是`适配器设计模式之接口适配`的体现，是Executor的默认实现，实现了大部分Executor接口定义的功能，降低了接口实现的难度。BaseExecutor的子类有三个，分别是`SimpleExecutor`、`ReuseExecutor`和`BatchExecutor`。

**SimpleExecutor**: 简单执行器，是MyBatis中默认使用的执行器，每执行一次update或select，就开启一个Statement对象，用完就直接关闭Statement对象(可以是Statement或者是PreparedStatment对象)

**ReuseExecutor**: 可重用执行器，这里的重用指的是重复使用Statement，它会在内部使用一个Map把创建的Statement都缓存起来，每次执行SQL命令的时候，都会去判断是否存在基于该SQL的Statement对象，如果存在Statement对象并且**对应的connection还没有关闭的情况下**就继续使用之前的Statement对象，**并将其缓存起来**。因为每一个SqlSession都有一个新的Executor对象，所以我们缓存在ReuseExecutor上的Statement作用域是同一个SqlSession。

**BatchExecutor**: 批处理执行器，用于将多个SQL一次性输出到数据库

`CachingExecutor`: 缓存执行器，先从缓存中查询结果，如果存在，就返回；如果不存在，再委托给Executor delegate 去数据库中取，delegate可以是上面任何一个执行器

### Executor创建过程以及源码分析

上面我们分析完SqlSessionFactory的创建过程的准备工作后，我们下面就开始分析会话的创建以及Executor的执行过程。

在创建完SqlSessionFactory之后，调用其`openSession`方法:

```java
SqlSession sqlSession = factory.openSession();
```

SqlSessionFactory的默认实现是DefaultSqlSessionFactory，所以我们需要关心的就是DefaultSqlSessionFactory中的openSession()方法

openSession调用的是`openSessionFromDataSource`方法，传递执行器的类型，方法传播级别，是否自动提交，然后在openSessionFromDataSource方法中会创建一个执行器

```java
public SqlSession openSession() {
  return openSessionFromDataSource(configuration.getDefaultExecutorType(), null, false);
}

private SqlSession openSessionFromDataSource(ExecutorType execType, TransactionIsolationLevel level, boolean autoCommit) {
    Transaction tx = null;
    try {
      // 得到configuration 中的environment
      final Environment environment = configuration.getEnvironment();
      // 得到configuration 中的事务工厂
      final TransactionFactory transactionFactory = getTransactionFactoryFromEnvironment(environment);
      tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
      // 获取执行器
      final Executor executor = configuration.newExecutor(tx, execType);
      // 返回默认的SqlSession
      return new DefaultSqlSession(configuration, executor, autoCommit);
    } catch (Exception e) {
      closeTransaction(tx); // may have fetched a connection so lets call close()
      throw ExceptionFactory.wrapException("Error opening session.  Cause: " + e, e);
    } finally {
      ErrorContext.instance().reset();
    }
  }
```

调用newExecutor方法，根据传入的ExecutorType类型来判断是哪种执行器，然后执行相应的逻辑

```java
public Executor newExecutor(Transaction transaction, ExecutorType executorType) {
    // defaultExecutorType默认是简单执行器, 如果不传executorType的话，默认使用简单执行器
    executorType = executorType == null ? defaultExecutorType : executorType;
    executorType = executorType == null ? ExecutorType.SIMPLE : executorType;
    Executor executor;
    // 根据执行器类型生成对应的执行器逻辑
    if (ExecutorType.BATCH == executorType) {
      executor = new BatchExecutor(this, transaction);
    } else if (ExecutorType.REUSE == executorType) {
      executor = new ReuseExecutor(this, transaction);
    } else {
      executor = new SimpleExecutor(this, transaction);
    }
    // 如果允许缓存，则使用缓存执行器
  	// 默认是true，如果不允许缓存的话，需要手动设置
    if (cacheEnabled) {
      executor = new CachingExecutor(executor);
    }
  	// 插件开发。
    executor = (Executor) interceptorChain.pluginAll(executor);
    return executor;
  }
```

> ExecutorType的选择：
>
> ExecutorType来决定Configuration对象创建何种类型的执行器，它的赋值可以通过两个地方进行赋值：
>
> - 可以通过<settings>标签来设置当前工程中所有的SqlSession对象使用默认的Executor
>
> ```xml
> <settings>
> <!--取值范围 SIMPLE, REUSE, BATCH -->
> 	<setting name="defaultExecutorType" value="SIMPLE"/>
> </settings>
> ```
>
> - 另外一种直接通过Java对方法赋值的方式
>
> ```java
> session = factory.openSession(ExecutorType.BATCH);
> ```
>
> ExecutorType是一个枚举，它只有三个值SIMPLE, REUSE, BATCH

创建完成Executor之后，会把Executor执行器放入一个DefaultSqlSession对象中来对四个属性进行赋值，他们分别是 `configuration`、`executor`、 `dirty`、`autoCommit`。

### Executor接口的主要方法

Executor接口的方法还是比较多的，这里我们就几个主要的方法和调用流程来做一个简单的描述

#### 大致流程

Executor中的大部分方法的调用链其实是差不多的，下面都是深入源码分析执行过程，如果你没有时间或者暂时不想深入研究的话，给你下面的执行流程图作为参考。

![](https://img2018.cnblogs.com/blog/1515111/201907/1515111-20190712212051749-963201761.png)


#### query()方法

query方法有两种形式，一种是**直接查询**；一种是**从缓存中查询**，下面来看一下源码

```java
<E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey cacheKey, BoundSql boundSql) throws SQLException;

<E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException;
```

当有一个查询请求访问的时候，首先会经过Executor的实现类**CachingExecutor**，先从缓存中查询SQL是否是第一次执行，如果是第一次执行的话，那么就直接执行SQL语句，**并创建缓存**，如果第二次访问相同的SQL语句的话，那么就会直接从缓存中提取

CachingExecutor.j

```java
	// 第一次查询，并创建缓存
public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException {
  BoundSql boundSql = ms.getBoundSql(parameterObject);
  CacheKey key = createCacheKey(ms, parameterObject, rowBounds, boundSql);
  return query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
}
```

> `MapperStatement`**维护了一条<select|update|delete|insert>节点的封装**，包括资源(resource)，配置(configuration)，SqlSource(sql源文件)等。使用Configuration的getMappedStatement方法来获取MappedStatement对象
>
> ![](https://img2018.cnblogs.com/blog/1515111/201907/1515111-20190712212110273-112823282.png)

>
>`BoundSql`这个类包括SQL的基本信息，基本的SQL语句，参数映射，参数类型等
>
>![](https://img2018.cnblogs.com/blog/1515111/201907/1515111-20190712212123894-1966786410.png)


上述的query方法会调用到CachingExecutor类中的query查询缓存的方法

```java
public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql)
  throws SQLException {
  // 得到缓存
  Cache cache = ms.getCache();
  if (cache != null) {
    // 如果需要的话刷新缓存
    flushCacheIfRequired(ms);
    if (ms.isUseCache() && resultHandler == null) {
      ensureNoOutParams(ms, boundSql);
      @SuppressWarnings("unchecked")
      List<E> list = (List<E>) tcm.getObject(cache, key);
      if (list == null) {
        list = delegate.<E> query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
        tcm.putObject(cache, key, list); 
      }
      return list;
    }
  }
  // 委托模式，交给SimpleExecutor等实现类去实现方法。
  return delegate.<E> query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
}
```

由delegate执行query方法，delegate即是**BaseExecutor**，然后由具体的执行器去真正执行query方法

> 注意：源码中一般以do** 开头的方法都是真正加载执行的方法

```java
// 经过一系列的调用，会调用到下面的方法(与主流程无关，故省略)
// 以SimpleExecutor简单执行器为例
public <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException {
  Statement stmt = null;
  try {
    // 获取环境配置
    Configuration configuration = ms.getConfiguration();
    // 创建StatementHandler，解析SQL语句
    StatementHandler handler = configuration.newStatementHandler(wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
    stmt = prepareStatement(handler, ms.getStatementLog());
    // 由handler来对SQL语句执行解析工作
    return handler.<E>query(stmt, resultHandler);
  } finally {
    closeStatement(stmt);
  }
}
```

由上面的源码可以看出，Executor执行器所起的作用相当于是管理StatementHandler 的整个生命周期的工作，包括创建、初始化、解析、关闭。

**ReuseExecutor**完成的doQuery 工作：几乎和SimpleExecutor完成的工作一样，其内部不过是使用一个Map来存储每次执行的查询语句，为后面的SQL重用作准备。

**BatchExecutor**完成的doQuery 工作：和SimpleExecutor完成的工作一样。

#### update() 方法

在分析完上面的查询方法后，我们再来聊一下update()方法，update()方法不仅仅指的是**update()**方法，它是一条update链，什么意思呢？就是*insert、update、delete在语义上其实都是更新的意思，而查询在语义上仅仅只是表示的查询，那么我们来偷窥一下update方法的执行流程，与select的主要执行流程很相似，所以一次性贴出。

```java
// 首先在顶级接口中定义update 方法，交由子类或者抽象子类去实现

// 也是首先去缓存中查询是否具有已经执行过的相同的update语句
public int update(MappedStatement ms, Object parameterObject) throws SQLException {
  flushCacheIfRequired(ms);
  return delegate.update(ms, parameterObject);
}

// 然后再交由BaseExecutor 执行update 方法
public int update(MappedStatement ms, Object parameter) throws SQLException {
  ErrorContext.instance().resource(ms.getResource()).activity("executing an update").object(ms.getId());
  if (closed) {
    throw new ExecutorException("Executor was closed.");
  }
  clearLocalCache();
  return doUpdate(ms, parameter);
}

// 往往do* 开头的都是真正执行解析的方法，所以doUpdate 应该就是真正要执行update链的解析方法了
// 交给具体的执行器去执行
public int doUpdate(MappedStatement ms, Object parameter) throws SQLException {
  Statement stmt = null;
  try {
    Configuration configuration = ms.getConfiguration();
    StatementHandler handler = configuration.newStatementHandler(this, ms, parameter, RowBounds.DEFAULT, null, null);
    stmt = prepareStatement(handler, ms.getStatementLog());
    return handler.update(stmt);
  } finally {
    closeStatement(stmt);
  }
}
```

**ReuseExecutor**完成的doUpdate 工作：几乎和SimpleExecutor完成的工作一样，其内部不过是使用一个Map来存储每次执行的更新语句，为后面的SQL重用作准备。

**BatchExecutor**完成的doUpdate 工作：和SimpleExecutor完成的工作相似，只是其内部有一个List列表来一次行的存储多个Statement，**用于将多个sql语句一次性输送到数据库执行.**

#### queryCursor()方法

我们查阅其源码的时候，在执行器的执行过程中并没有发现其与query方法有任何不同之处，但是在**doQueryCursor** 方法中我们可以看到它返回了一个cursor对象，网上搜索cursor的相关资料并查阅其基本结构，得出来的结论是：用于逐条读取SQL语句，应对数据量

```java
// 查询可以返回Cursor<T>类型的数据，类似于JDBC里的ResultSet类，
// 当查询百万级的数据的时候，使用游标可以节省内存的消耗，不需要一次性取出所有数据，可以进行逐条处理或逐条取出部分批量处理。
public interface Cursor<T> extends Closeable, Iterable<T> {

    boolean isOpen();

    boolean isConsumed();
  
    int getCurrentIndex();
}
```

#### flushStatements() 方法

flushStatement()的主要执行流程和query，update 的执行流程差不多，我们这里就不再详细贴代码了，简单说一下flushStatement()的主要作用，flushStatement()主要用来释放statement，或者用于ReuseExecutor和BatchExecutor来刷新缓存

#### createCacheKey() 方法

createCacheKey()方法主要由BaseExecutor来执行并创建缓存，MyBatis中的缓存分为一级缓存和二级缓存，关于缓存的讨论我们将在Mybatis系列的缓存章节

#### Executor 中的其他方法

Executor 中还有其他方法，提交commit，回滚rollback，判断是否时候缓存isCached，关闭close，获取事务getTransaction一级清除本地缓存clearLocalCache等

### Executor 的现实抽象

在上面的分析过程中我们了解到，Executor执行器是MyBatis中很重要的一个组件，Executor相当于是外包的boss，它定义了甲方(SQL)需要干的活(Executor的主要方法)，这个外包公司是个小公司，没多少人，每个人都需要干很多工作，boss接到开发任务的话，一般都找项目经理(CachingExecutor)，项目经理几乎不懂技术，它主要和技术leader(BaseExecutor)打交道，技术leader主要负责框架的搭建，具体的工作都会交给下面的程序员来做，程序员的技术也有优劣，高级程序员(BatchExecutor)、中级程序员(ReuseExecutor)、初级程序员(SimpleExecutor)，它们干的活也不一样。一般有新的项目需求传达到项目经理这里，项目经理先判断自己手里有没有现成的类库或者项目直接套用(Cache)，有的话就直接让技术leader拿来直接套用就好，没有的话就需要搭建框架，再把框架存入本地类库中，再进行解析。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


# MyBatis 核心配置综述之StatementHandler

* [MyBatis 核心配置综述之StatementHandler](#mybatis-核心配置综述之statementhandler)
   * [MyBatis 四大组件之StatementHandler](#mybatis-四大组件之statementhandler)
      * [StatementHandler 的基本构成](#statementhandler-的基本构成)
      * [StatementHandler 对象创建以及源码分析](#statementhandler-对象创建以及源码分析)
         * [prepare方法调用流程分析](#prepare方法调用流程分析)
         * [parametersize 方法调用流程分析](#parametersize-方法调用流程分析)
         * [update 方法调用流程分析](#update-方法调用流程分析)

## MyBatis 四大组件之StatementHandler

`StatementHandler` 是四大组件中最重要的一个对象，负责操作 Statement 对象与数据库进行交流，在工作时还会使用 ParameterHandler 和 ResultSetHandler 对参数进行映射，对结果进行实体类的绑定

我们在搭建原生JDBC的时候，会有这样一行代码

```java
Statement stmt = conn.createStatement(); //也可以使用PreparedStatement来做
```

这行代码创建的 Statement 对象或者是 PreparedStatement 对象就是由StatementHandler进行管理的。

### StatementHandler 的基本构成

来看一下StatementHandler中的主要方法：

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190803171249525-1383615224.png)


- **prepare**: 用于创建一个具体的 Statement 对象的实现类或者是 Statement 对象
- **parametersize**: 用于初始化 Statement 对象以及对sql的占位符进行赋值
- **update**: 用于通知 Statement 对象将 insert、update、delete 操作推送到数据库
- **query**: 用于通知 Statement 对象将 select 操作推送数据库并返回对应的查询结果

**StatementHandler**的继承结构

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190803171258049-449567015.png)


有没有感觉和  `Executor` 的继承体系很相似呢？最顶级接口是四大组件对象，分别有两个实现类 `BaseStatementHandler`  和  `RoutingStatementHandler `，BaseStatementHandler 有三个实现类, 他们分别是 SimpleStatementHandler、PreparedStatementHandler 和 CallableStatementHandler。

**RoutingStatementHandler**: RoutingStatementHandler 并没有对 Statement 对象进行使用，只是根据StatementType 来创建一个代理，代理的就是对应Handler的三种实现类。**在MyBatis工作时,使用的StatementHandler 接口对象实际上就是 RoutingStatementHandler 对象.**我们可以理解为

```java
StatementHandler statmentHandler = new RountingStatementHandler();
```

```java
public RoutingStatementHandler(Executor executor, MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {

  // 根据 statementType 创建对应的 Statement 对象
  switch (ms.getStatementType()) {
    case STATEMENT:
      delegate = new SimpleStatementHandler(executor, ms, parameter, rowBounds, resultHandler, boundSql);
      break;
    case PREPARED:
      delegate = new PreparedStatementHandler(executor, ms, parameter, rowBounds, resultHandler, boundSql);
      break;
    case CALLABLE:
      delegate = new CallableStatementHandler(executor, ms, parameter, rowBounds, resultHandler, boundSql);
      break;
    default:
      throw new ExecutorException("Unknown statement type: " + ms.getStatementType());
  }

}
```

**BaseStatementHandler**: 是 StatementHandler 接口的另一个实现类.本身是一个抽象类.用于简化StatementHandler 接口实现的难度,属于**适配器设计模式**体现，它主要有三个实现类

- **SimpleStatementHandler**: 管理 Statement 对象并向数据库中推送不需要预编译的SQL语句
- **PreparedStatementHandler**: 管理 Statement 对象并向数据中推送需要预编译的SQL语句，
- **CallableStatementHandler**：管理 Statement 对象并调用数据库中的存储过程

### StatementHandler 对象创建以及源码分析

StatementHandler 对象是在 SqlSession 对象接收到命令操作时，由 Configuration 对象中的newStatementHandler 负责调用的，也就是说 Configuration 中的 newStatementHandler 是由执行器中的查询、更新(插入、更新、删除)方法来提供的，StatementHandler 其实就是由 Executor 负责管理和创建的。

SimpleExecutor.java

```java
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

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190803171315178-1209653485.png)


> 由图中可以看出，StatementHandler 默认创建一个 RoutingStatementHandler ，这也就是 StatementHandler 的默认实现，由 RoutingStatementHandler 负责根据 StatementType 创建对应的StatementHandler 来处理调用。

#### prepare方法调用流程分析

prepare 方法的调用过程是这样的，在上面的源码分析过程中，我们分析到了执行器 Executor 在执行SQL语句的时候会创建 StatementHandler 对象，进而经过一系列的 StatementHandler 类型的判断并初始化。再拿到StatementHandler 返回的 statementhandler 对象的时候，会调用其`prepareStatement()`方法，下面就来一起看一下 `preparedStatement()` 方法(我们以简单执行器为例，因为创建其 StatementHandler 对象的流程和执行 preparedStatement() 方法的流程是差不多的)：

SimpleExecutor.java

```java
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


private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
  Statement stmt;
  Connection connection = getConnection(statementLog);
  
  stmt = handler.prepare(connection, transaction.getTimeout());
  
  handler.parameterize(stmt);
  return stmt;
}

// prepare方法调用到 StatementHandler 的实现类RoutingStatementHandler，再由RoutingStatementHandler调用BaseStatementHandler中的prepare 方法

// RoutingStatementHandler.java
@Override
  public Statement prepare(Connection connection, Integer transactionTimeout) throws SQLException {
    return delegate.prepare(connection, transactionTimeout);
  }

//  BaseStatementHandler.java
 @Override
  public Statement prepare(Connection connection, Integer transactionTimeout) throws SQLException {
    ErrorContext.instance().sql(boundSql.getSql());
    Statement statement = null;
    try {
      statement = instantiateStatement(connection);
      setStatementTimeout(statement, transactionTimeout);
      setFetchSize(statement);
      return statement;
    } ...
```

其中最重要的方法就是  `instantiateStatement()` 方法了，在得到数据库连接 connection 的对象的时候，会去调用 `instantiateStatement()` 方法，instantiateStatement 方法位于 StatementHandler 中，是一个抽象方法由子类去实现，实际执行的是三种 StatementHandler 中的一种，我们还以 `SimpleStatementHandler` 为例

```java
protected Statement instantiateStatement(Connection connection) throws SQLException {
    if (mappedStatement.getResultSetType() != null) {
      return connection.createStatement(mappedStatement.getResultSetType().getValue(), ResultSet.CONCUR_READ_ONLY);
    } else {
      return connection.createStatement();
    }
  }
```

从上面代码我们可以看到，instantiateStatement() 最终返回的也是Statement对象，**经过一系列的调用会把statement 对象返回到 SimpleExecutor 简单执行器中，为 parametersize 方法所用**。也就是说，prepare 方法负责生成 Statement 实例对象，而 parameterize 方法用于处理 Statement 实例多对应的参数。

#### parametersize 方法调用流程分析

parametersize 方法看的就比较畅快了，也是经由执行器来管理 parametersize 的方法调用，这次我们还想以SimpleStatementHandler 为例但是却不行了？为什么呢？因为 SimpleStatementHandler 是个空实现了，为什么是null呢？因为 SimpleStatementHandler 只负责处理简单SQL，能够直接查询得到结果的SQL，例如:

```sql
select studenname from Student
```

而 SimpleStatementHandler 又不涉及到参数的赋值问题，那么参数赋值该在哪里进行呢？实际上为参数赋值这步操作是在 `PreparedStatementHandler` 中进行的，因此我们的主要关注点在 PreparedStatementHandler 中的parameterize 方法

```java
public void parameterize(Statement statement) throws SQLException {
  parameterHandler.setParameters((PreparedStatement) statement);
}
```

我们可以看到，为参数赋值的工作是由一个叫做 parameterHandler 对象完成的，都是这样的吗？来看一下CallableStatementHandler

```java
public void parameterize(Statement statement) throws SQLException {
  registerOutputParameters((CallableStatement) statement);
  parameterHandler.setParameters((CallableStatement) statement);
}
```

上面代码可以看到，CallableStatementHandler 也是由 parameterHandler 进行参数赋值的。

那么这个 parameterHandler 到底是什么呢？这个问题能想到说明老兄你已经上道了，这也就是我们执行器的第三个组件。这个组件我们在下一节进行分析

#### update 方法调用流程分析

用一幅流程图来表示一下这个调用过程：

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190803171333257-1822082319.png)


简单描述一下update 方法的执行过程：

1. MyBatis 接收到 update 请求后会先找到 CachingExecutor 缓存执行器查询是否需要刷新缓存，然后找到BaseExecutor 执行 update 方法；
2. BaseExecutor 基础执行器会清空一级缓存，然后交给再根据执行器的类型找到对应的执行器，继续执行 update 方法；
3. 具体的执行器会先创建 Configuration 对象，根据 Configuration 对象调用 newStatementHandler 方法，返回 statementHandler 的句柄；
4. 具体的执行器会调用 prepareStatement 方法，找到本类的 prepareStatement 方法后，再有prepareStatement 方法调用 StatementHandler 的子类 BaseStatementHandler 中的 prepare 方法
5. BaseStatementHandler 中的 prepare 方法会调用 instantiateStatement 实例化具体的 Statement 对象并返回给具体的执行器对象
6. 由具体的执行器对象调用 parameterize 方法给参数进行赋值。

续上上面的 `parameter`方法，具体交给 `ParameterHandler` 进行进一步的赋值处理

> Query 查询方法几乎和 update 方法相同，这里就不再详细的举例说明了

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


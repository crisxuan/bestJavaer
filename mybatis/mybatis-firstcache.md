# MyBatis 一级缓存

* [MyBatis 一级缓存](#mybatis-一级缓存)
   * [什么是缓存](#什么是缓存)
   * [什么是MyBatis中的缓存](#什么是mybatis中的缓存)
   * [MyBatis 中的一级缓存](#mybatis-中的一级缓存)
      * [初探一级缓存](#初探一级缓存)
      * [探究一级缓存是如何失效的](#探究一级缓存是如何失效的)
   * [一级缓存原理探究](#一级缓存原理探究)
   * [还有其他要补充的吗？](#还有其他要补充的吗)
   * [总结](#总结)

## 什么是缓存

缓存就是内存中的一个对象，用于对数据库查询结果的保存，用于减少与数据库的交互次数从而降低数据库的压力，进而提高响应速度。

## 什么是MyBatis中的缓存

**MyBatis 中的缓存就是说 MyBatis 在执行一次SQL查询或者SQL更新之后，这条SQL语句并不会消失，而是被MyBatis 缓存起来，当再次执行相同SQL语句的时候，就会直接从缓存中进行提取，而不是再次执行SQL命令。**

MyBatis中的缓存分为一级缓存和二级缓存，一级缓存又被称为 SqlSession 级别的缓存，二级缓存又被称为表级缓存。

> SqlSession是什么？SqlSession 是SqlSessionFactory会话工厂创建出来的一个会话的对象，这个SqlSession对象用于执行具体的SQL语句并返回给用户请求的结果。
>
> SqlSession级别的缓存是什么意思？SqlSession级别的缓存表示的就是每当执行一条SQL语句后，默认就会把该SQL语句缓存起来，也被称为会话缓存

## MyBatis 中的一级缓存

一级缓存是 **SqlSession级别** 的缓存。在操作数据库时需要构造 sqlSession 对象，在对象中有一个(内存区域)数据结构（HashMap）用于存储缓存数据。不同的 sqlSession 之间的缓存数据区域（HashMap）是互相不影响的。用一张图来表示一下一级缓存，其中每一个 SqlSession 的内部都会有一个一级缓存对象。

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213428708-881945789.png)


在应用运行过程中，我们有可能在一次数据库会话中，执行多次查询条件完全相同的SQL，**MyBatis 提供了一级缓存的方案优化这部分场景，如果是相同的SQL语句，会优先命中一级缓存，避免直接对数据库进行查询，提高性能。**

### 初探一级缓存

我们继续使用 MyBatis基础搭建以及配置详解中的例子(https://mp.weixin.qq.com/s/Ys03zaTSaOakdGU4RlLJ1A)进行 一级缓存的探究。

在对应的 resources 根目录下加上日志的输出信息 `log4j.properties`

```properties
##define an appender named console
log4j.appender.console=org.apache.log4j.ConsoleAppender
#The Target value is System.out or System.err
log4j.appender.console.Target=System.out
#set the layout type of the apperder
log4j.appender.console.layout=org.apache.log4j.PatternLayout
#set the layout format pattern
log4j.appender.console.layout.ConversionPattern=[%-5p] %m%n

##define a logger
log4j.rootLogger=debug,console
```

**模拟思路**： 既然每个 SqlSession 都会有自己的一个缓存，那么我们用同一个 SqlSession 是不是就能感受到一级缓存的存在呢？调用多次 `getMapper` 方法，生成对应的SQL语句，判断每次SQL语句是从缓存中取还是对数据库进行操作，下面的例子来证明一下

```java
@Test
public void test(){
  DeptDao deptDao = sqlSession.getMapper(DeptDao.class);
  Dept dept = deptDao.findByDeptNo(1);
  System.out.println(dept);

  DeptDao deptDao2 = sqlSession.getMapper(DeptDao.class);
  Dept dept2 = deptDao2.findByDeptNo(1);
  System.out.println(dept2);
  System.out.println(deptDao2.findByDeptNo(1));
}
```

输出：

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213459179-1765982525.png)


可以看到，上面代码执行了三条相同的SQL语句，但是只有一条SQL语句进行了输出，其他两条SQL语句都是从缓存中查询的，所以它们生成了相同的 Dept 对象。

### 探究一级缓存是如何失效的

上面的一级缓存初探让我们感受到了 MyBatis 中一级缓存的存在，那么现在你或许就会有疑问了，那么什么时候缓存失效呢？ 这个问题也就是我们接下来需要详细讨论的议题之一。

**探究更新对一级缓存失效的影响**

上面的代码执行了三次相同的查询操作，返回了相同的结果，那么，如果我在第一条和第二条SQL语句之前插入更新的SQL语句，是否会对一级缓存产生影响呢？代码如下：

```java
@Test
public void testCacheLose(){
  DeptDao deptDao = sqlSession.getMapper(DeptDao.class);
  Dept dept = deptDao.findByDeptNo(1);
  System.out.println(dept);

  // 在两次查询之间使用 更新 操作，是否会对一级缓存产生影响
  deptDao.insertDept(new Dept(7,"tengxun","shenzhen"));
  //        deptDao.updateDept(new Dept(1,"zhongke","sjz"));
  //        deptDao.deleteByDeptNo(7);

  DeptDao deptDao2 = sqlSession.getMapper(DeptDao.class);
  Dept dept2 = deptDao2.findByDeptNo(1);
  System.out.println(dept2);
}
```

> 为了演示效果，就不贴出 insertDept 的代码了，就是一条简单的插入语句。
>
> 分别放开不同的更新语句，发现执行效果如下

输出结果：

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213526530-1041977048.png)


如图所示，在两次查询语句中使用插入，会对一级缓存进行刷新，会导致一级缓存失效。

**探究不同的 SqlSession 对一级缓存的影响**

如果你看到这里了，那么你应该知道一级缓存就是 SqlSession 级别的缓存，而同一个 SqlSession 会有相同的一级缓存，那么使用不同的 SqlSession 是不是会对一级缓存产生影响呢？ 显而易见是的，那么下面就来演示并且证明一下

```java
private SqlSessionFactory factory; // 把factory设置为全局变量

@Test
public void testCacheLoseWithSqlSession(){
  DeptDao deptDao = sqlSession.getMapper(DeptDao.class);
  Dept dept = deptDao.findByDeptNo(1);
  System.out.println(dept);

  SqlSession sqlSession2 = factory.openSession();
  DeptDao deptDao2 = sqlSession2.getMapper(DeptDao.class);
  Dept dept2 = deptDao2.findByDeptNo(1);
  System.out.println(dept2);

}
```

输出：

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213538163-1040521495.png)


上面代码使用了不同的 SqlSession 对同一个SQL语句执行了相同的查询操作，却对数据库执行了两次相同的查询操作，生成了不同的 dept 对象，由此可见，不同的 SqlSession 是肯定会对一级缓存产生影响的。

**同一个 SqlSession 使用不同的查询操作**

使用不同的查询条件是否会对一级缓存产生影响呢？可能在你心里已经有这个答案了，再来看一下代码吧

```java
@Test
public void testWithDifferentParam(){
  DeptDao deptDao = sqlSession.getMapper(DeptDao.class);
  Dept dept = deptDao.findByDeptNo(1);
  System.out.println(dept);

  DeptDao deptDao2 = sqlSession.getMapper(DeptDao.class);
  Dept dept2 = deptDao2.findByDeptNo(5);
  System.out.println(dept2);
}
```

输出结果

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213556093-14025110.png)


我们在两次查询SQL分别使用了不同的查询条件，查询出来的数据不一致，那就肯定会对一级缓存产生影响了。

**手动清理缓存对一级缓存的影响**

我们在两次查询的SQL语句之间使用 `clearCache` 是否会对一级缓存产生影响呢？下面例子证实了这一点

```java
@Test
public void testClearCache(){
  DeptDao deptDao = sqlSession.getMapper(DeptDao.class);
  Dept dept = deptDao.findByDeptNo(1);
  System.out.println(dept);

	//在两次相同的SQL语句之间使用查询操作，对一级缓存的影响。
  sqlSession.clearCache();

  DeptDao deptDao2 = sqlSession.getMapper(DeptDao.class);
  Dept dept2 = deptDao2.findByDeptNo(1);
  System.out.println(dept2);
}
```

输出：

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213606276-1822208891.png)


我们在两次查询操作之间，使用了 sqlSession 的 clearCache() 方法清除了一级缓存，所以使用 clearCache 也会对一级缓存产生影响。

## 一级缓存原理探究

一级缓存到底是什么？一级缓存的工作流程是怎样的？一级缓存何时消失？相信你现在应该会有这几个疑问，那么我们本节就来研究一下一级缓存的本质

嗯。。。。。。该从何处入手呢？

你可以这样想，上面我们一直提到一级缓存，那么提到一级缓存就绕不开 SqlSession，所以索性我们就直接从 SqlSession ，看看有没有创建缓存或者与缓存有关的属性或者方法

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213628825-1101297961.png)


调研了一圈，发现上述所有方法中，好像只有 `clearCache()` 和缓存沾点关系，那么就直接从这个方法入手吧，分析源码时,**我们要看它(此类)是谁，它的父类和子类分别又是谁**，对如上关系了解了，你才会对这个类有更深的认识，分析了一圈，你可能会得到如下这个流程图

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213656063-467330727.png)


再深入分析，流程走到`Perpetualcache` 中的 clear() 方法之后，会调用其 `cache.clear()` 方法，那么这个cache 是什么东西呢？ 点进去发现，cache 其实就是 `private Map<Object, Object> cache = new HashMap<Object, Object>();` 也就是一个Map，所以说 cache.clear() 其实就是 map.clear() ，也就是说，缓存其实就是本地存放的一个 map 对象，每一个SqlSession 都会存放一个 map 对象的引用，那么这个 cache 是何时创建的呢？

你觉得最有可能创建缓存的地方是哪里呢？ 我觉得是 `Executor`，为什么这么认为？ 因为 Executor 是执行器，用来执行SQL请求，而且清除缓存的方法也在 Executor 中执行，所以很可能缓存的创建也很有可能在 Executor 中，看了一圈发现 Executor 中有一个 `createCacheKey` 方法，这个方法很像是创建缓存的方法啊，跟进去看看，你发现 createCacheKey 方法是由 `BaseExecutor` 执行的，代码如下

```java
CacheKey cacheKey = new CacheKey();
//MappedStatement的id
// id 就是Sql语句的所在位置 包名 + 类名 + SQL名称
cacheKey.update(ms.getId());
// offset 就是 0
cacheKey.update(rowBounds.getOffset());
// limit 就是 Integer.MAXVALUE
cacheKey.update(rowBounds.getLimit());
// 具体的SQL语句
cacheKey.update(boundSql.getSql());
//后面是update了sql中带的参数
cacheKey.update(value);
...
if (configuration.getEnvironment() != null) {
  // issue #176
  cacheKey.update(configuration.getEnvironment().getId());
}
```

创建缓存key会经过一系列的 update 方法，update 方法由一个 `CacheKey` 这个对象来执行的，这个 update 方法最终由 `updateList` 的 list 来把五个值存进去，对照上面的代码和下面的图示，你应该能理解这五个值都是什么了

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213659335-267738794.png)


> 这里需要注意一下最后一个值， configuration.getEnvironment().getId() 这是什么，这其实就是定义在 `mybatis-config.xml` 中的 <environment> 标签，见如下。
>
> ```xml
> <environments default="development">
> <environment id="development">
> <transactionManager type="JDBC"/>
> <dataSource type="POOLED">
> <property name="driver" value="${jdbc.driver}"/>
> <property name="url" value="${jdbc.url}"/>
> <property name="username" value="${jdbc.username}"/>
> <property name="password" value="${jdbc.password}"/>
> </dataSource>
> </environment>
> </environments>
> ```

那么我们回归正题，那么创建完缓存之后该用在何处呢？总不会凭空创建一个缓存不使用吧？绝对不会的，经过我们对一级缓存的探究之后，我们发现一级缓存更多是用于**查询操作**，**毕竟一级缓存也叫做查询缓存吧，为什么叫查询缓存我们一会儿说**。我们先来看一下这个缓存到底用在哪了，我们跟踪到 query 方法如下：

```java
@Override
public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException {
  BoundSql boundSql = ms.getBoundSql(parameter);
  // 创建缓存
  CacheKey key = createCacheKey(ms, parameter, rowBounds, boundSql);
  return query(ms, parameter, rowBounds, resultHandler, key, boundSql);
}

@SuppressWarnings("unchecked")
@Override
public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
  ...
  list = resultHandler == null ? (List<E>) localCache.getObject(key) : null;
  if (list != null) {
      // 这个主要是处理存储过程用的。
      handleLocallyCachedOutputParameters(ms, key, parameter, boundSql);
      } else {
      list = queryFromDatabase(ms, parameter, rowBounds, resultHandler, key, boundSql);
  }
  ...
}

// queryFromDatabase 方法
private <E> List<E> queryFromDatabase(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
  List<E> list;
  localCache.putObject(key, EXECUTION_PLACEHOLDER);
  try {
    list = doQuery(ms, parameter, rowBounds, resultHandler, boundSql);
  } finally {
    localCache.removeObject(key);
  }
  localCache.putObject(key, list);
  if (ms.getStatementType() == StatementType.CALLABLE) {
    localOutputParameterCache.putObject(key, parameter);
  }
  return list;
}
```

如果查不到的话，就从数据库查，在`queryFromDatabase`中，会对`localcache`进行写入。localcache 对象的put 方法最终交给 Map 进行存放

```java
private Map<Object, Object> cache = new HashMap<Object, Object>();

@Override
public void putObject(Object key, Object value) {
  cache.put(key, value);
}
```

那么再说一下为什么一级缓存也叫做查询缓存呢？

我们先来看一下 update 更新方法，先来看一下 update 的源码

```java
@Override
public int update(MappedStatement ms, Object parameter) throws SQLException {
  ErrorContext.instance().resource(ms.getResource()).activity("executing an update").object(ms.getId());
  if (closed) {
    throw new ExecutorException("Executor was closed.");
  }
  clearLocalCache();
  return doUpdate(ms, parameter);
}
```

由 `BaseExecutor` 在每次执行 update 方法的时候，都会先 clearLocalCache() ，所以更新方法并不会有缓存，这也就是说为什么一级缓存也叫做查询缓存了，这也就是为什么我们没有探究多次执行更新方法对一级缓存的影响了。

## 还有其他要补充的吗？

我们上面分析了一级缓存的执行流程，为什么一级缓存要叫查询缓存以及一级缓存组成条件

那么，你可能看到这感觉这些知识还是不够连贯，那么我就帮你把 `一级缓存的探究 `小结中的原理说一下吧，为什么一级缓存会失效

1. 探究更新对一级缓存失效的影响： 由上面的分析结论可知，我们每次执行 update 方法时，都会先刷新一级缓存，因为是同一个 SqlSession, 所以是由同一个 Map 进行存储的，所以此时一级缓存会失效
2. 探究不同的 SqlSession 对一级缓存的影响： 这个也就比较好理解了，因为不同的 SqlSession 会有不同的Map 存储一级缓存，然而 SqlSession 之间也不会共享，所以此时也就不存在相同的一级缓存
3. 同一个 SqlSession 使用不同的查询操作： 这个论点就需要从缓存的构成角度来讲了，我们通过 cacheKey 可知，一级缓存命中的必要条件是两个 cacheKey 相同，要使得 cacheKey 相同，就需要使 cacheKey 里面的值相同，也就是

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213705670-1645309001.png)


![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808213719100-1494073573.png)


看出差别了吗？第一个SQL 我们查询的是部门编号为1的值，而第二个SQL我们查询的是编号为5的值，两个缓存对象不相同，所以也就不存在缓存。

4. 手动清理缓存对一级缓存的影响： 由程序员自己去调用`clearCache`方法，这个方法就是清除缓存的方法，所以也就不存在缓存了。

## 总结

所以此文章到底写了点什么呢？抛给你几个问题了解一下

1. 什么是缓存？什么是 MyBatis 缓存？
2. 认识MyBatis缓存，MyBatis 一级缓存的失效方式
3. MyBatis 一级缓存的执行流程，MyBatis 一级缓存究竟是什么？

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


# MyBatis 核心配置综述之 ResultSetHandler

* [MyBatis 核心配置综述之 ResultSetHandler](#mybatis-核心配置综述之-resultsethandler)
   * [ResultSetHandler 简介](#resultsethandler-简介)
   * [ResultSetHandler 创建](#resultsethandler-创建)
   * [ResultSetHandler 处理结果映射](#resultsethandler-处理结果映射)
   * [DefaultResultSetHandler 源码解析](#defaultresultsethandler-源码解析)

我们之前介绍过了MyBatis 四大核心配置之 Executor、StatementHandler、 ParameterHandler，今天本文的主题是介绍一下 MyBatis 最后一个神器也就是 ResultSetHandler。那么开始我们的讨论

## ResultSetHandler 简介

回想一下，一条 SQL 的请求过程会经过哪几个步骤？ 首先会经过 Executor 执行器，它主要负责管理创建 StatementHandler 对象，然后由 StatementHandler 对象做数据库的连接以及生成 Statement 对象，并解析 SQL 参数，由 ParameterHandler 对象负责把 Mapper 方法中的参数映射到 XML 中的 SQL 语句中，那么是不是还少了一个步骤，就能完成一个完整的 SQL 请求了？没错，这最后一步就是 SQL 结果集的处理工作，也就是 `ResultSetHandler` 的主要工作

要了解 ResultSetHandler 之前，首先需要了解 ResultSetHandler的继承关系以及基本方法

```java
public interface ResultSetHandler {

  // 处理结果集
  <E> List<E> handleResultSets(Statement stmt) throws SQLException;

  // 批量处理结果集
  <E> Cursor<E> handleCursorResultSets(Statement stmt) throws SQLException;

  // 处理存储过程的结果集
  void handleOutputParameters(CallableStatement cs) throws SQLException;

}
```

> ResultSetHandler是一个接口，它只有一个默认的实现类，像是 ParameterHandler 一样，它的默认实现类是DefaultResultSetHandler

## ResultSetHandler 创建

ResultSetHandler 是在处理查询请求的时候由 Configuration 对象负责创建，示例如下

```java
protected BaseStatementHandler(Executor executor, MappedStatement mappedStatement, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
  this.configuration = mappedStatement.getConfiguration();
  this.executor = executor;
  this.mappedStatement = mappedStatement;
  this.rowBounds = rowBounds;

  this.typeHandlerRegistry = configuration.getTypeHandlerRegistry();
  this.objectFactory = configuration.getObjectFactory();

  if (boundSql == null) { // issue #435, get the key before calculating the statement
    generateKeys(parameterObject);
    boundSql = mappedStatement.getBoundSql(parameterObject);
  }

  this.boundSql = boundSql;

  // 创建参数处理器
  this.parameterHandler = configuration.newParameterHandler(mappedStatement, parameterObject, boundSql);
  // 创建结果映射器
  this.resultSetHandler = configuration.newResultSetHandler(executor, mappedStatement, rowBounds, parameterHandler, resultHandler, boundSql);
}

public ResultSetHandler newResultSetHandler(Executor executor, MappedStatement mappedStatement, RowBounds rowBounds, ParameterHandler parameterHandler,
      ResultHandler resultHandler, BoundSql boundSql) {
  // 由 DefaultResultSetHandler 进行初始化
  ResultSetHandler resultSetHandler = new DefaultResultSetHandler(executor, mappedStatement, parameterHandler, resultHandler, boundSql, rowBounds);
  resultSetHandler = (ResultSetHandler) interceptorChain.pluginAll(resultSetHandler);
  return resultSetHandler;
}

```

> 上述的创建过程是对 ResultSetHandler 创建过程以及初始化的简单解释，下面是对具体的查询请求进行分析

## ResultSetHandler 处理结果映射

回想一下，我们在进行传统crud操作的时候，哪些方法是需要返回值的？当然我们说的返回值指的是从数据库中查询出来的值，而不是标识符，应该只有查询方法吧？所以 MyBatis 只针对 query 方法做了返回值的映射，代码如下：

PreparedStatementHandler.java  

```java
@Override
public <E> List<E> query(Statement statement, ResultHandler resultHandler) throws SQLException {
  PreparedStatement ps = (PreparedStatement) statement;
  ps.execute();
  // 处理结果集
  return resultSetHandler.<E> handleResultSets(ps);
}

@Override
public <E> Cursor<E> queryCursor(Statement statement) throws SQLException {
  PreparedStatement ps = (PreparedStatement) statement;
  ps.execute();
  // 批量处理结果集
  return resultSetHandler.<E> handleCursorResultSets(ps);
}
```

CallableStatementHandler.java 处理存储过程的SQL

```java
@Override
public <E> List<E> query(Statement statement, ResultHandler resultHandler) throws SQLException {
  CallableStatement cs = (CallableStatement) statement;
  cs.execute();
  List<E> resultList = resultSetHandler.<E>handleResultSets(cs);
  resultSetHandler.handleOutputParameters(cs);
  return resultList;
}

@Override
public <E> Cursor<E> queryCursor(Statement statement) throws SQLException {
  CallableStatement cs = (CallableStatement) statement;
  cs.execute();
  Cursor<E> resultList = resultSetHandler.<E>handleCursorResultSets(cs);
  resultSetHandler.handleOutputParameters(cs);
  return resultList;
}
```

## DefaultResultSetHandler 源码解析

MyBatis 只有一个默认的实现类就是 `DefaultResultSetHandler`，ResultSetHandler 主要负责处理两件事

1. 处理 Statement 执行后产生的结果集，生成结果列表
2. 处理存储过程执行后的输出参数

按照 Mapper 文件中配置的 ResultType 或 ResultMap 来封装成对应的对象，最后将封装的对象返回即可。

来看一下主要的源码：

```java
@Override
public List<Object> handleResultSets(Statement stmt) throws SQLException {
  ErrorContext.instance().activity("handling results").object(mappedStatement.getId());

  final List<Object> multipleResults = new ArrayList<Object>();

  int resultSetCount = 0;
  // 获取第一个结果集
  ResultSetWrapper rsw = getFirstResultSet(stmt);
  // 获取结果映射
  List<ResultMap> resultMaps = mappedStatement.getResultMaps();
  // 结果映射的大小
  int resultMapCount = resultMaps.size();
  // 校验结果映射的数量
  validateResultMapsCount(rsw, resultMapCount);
  // 如果ResultSet 包装器不是null， 并且 resultmap 的数量  >  resultSet 的数量的话
  // 因为 resultSetCount 第一次肯定是0，所以直接判断 ResultSetWrapper 是否为 0 即可
  while (rsw != null && resultMapCount > resultSetCount) {
    // 从 resultMap 中取出 resultSet 数量
    ResultMap resultMap = resultMaps.get(resultSetCount);
    // 处理结果集, 关闭结果集
    handleResultSet(rsw, resultMap, multipleResults, null);
    rsw = getNextResultSet(stmt);
    cleanUpAfterHandlingResultSet();
    resultSetCount++;
  }

  // 从 mappedStatement 取出结果集
  String[] resultSets = mappedStatement.getResultSets();
  if (resultSets != null) {
    while (rsw != null && resultSetCount < resultSets.length) {
      ResultMapping parentMapping = nextResultMaps.get(resultSets[resultSetCount]);
      if (parentMapping != null) {
        String nestedResultMapId = parentMapping.getNestedResultMapId();
        ResultMap resultMap = configuration.getResultMap(nestedResultMapId);
        handleResultSet(rsw, resultMap, null, parentMapping);
      }
      rsw = getNextResultSet(stmt);
      cleanUpAfterHandlingResultSet();
      resultSetCount++;
    }
  }

  return collapseSingleResultList(multipleResults);
}
```

其中涉及的主要对象有：

`ResultSetWrapper` : 结果集的包装器，主要针对结果集进行的一层包装，它的主要属性有

- ResultSet : Java JDBC ResultSet接口表示数据库查询的结果。 有关查询的文本显示了如何将查询结果作为java.sql.ResultSet返回。 然后迭代此ResultSet以检查结果。
- TypeHandlerRegistry: 类型注册器，TypeHandlerRegistry 在初始化的时候会把所有的 Java类型和类型转换器进行注册。
- ColumnNames: 字段的名称，也就是查询操作需要返回的字段名称
- ClassNames: 字段的类型名称，也就是 ColumnNames 每个字段名称的类型
- JdbcTypes:  JDBC 的类型，也就是java.sql.Types 类型 

`ResultMap`: 负责处理更复杂的映射关系

`multipleResults`: 

其中的主要方法是 handleResultSet 

```java
private void handleResultSet(ResultSetWrapper rsw, ResultMap resultMap, List<Object> multipleResults, ResultMapping parentMapping) throws SQLException {
  try {
    if (parentMapping != null) {
      // 处理多行结果的值
      handleRowValues(rsw, resultMap, null, RowBounds.DEFAULT, parentMapping);
    } else {
      if (resultHandler == null) {
        DefaultResultHandler defaultResultHandler = new DefaultResultHandler(objectFactory);
        handleRowValues(rsw, resultMap, defaultResultHandler, rowBounds, null);
        multipleResults.add(defaultResultHandler.getResultList());
      } else {
        handleRowValues(rsw, resultMap, resultHandler, rowBounds, null);
      }
    }
  } finally {
    // issue #228 (close resultsets)
    closeResultSet(rsw.getResultSet());
  }
}

// 如果有嵌套的ResultMap 的话
  // 确保没有行绑定
  // 检查结果处理器
  // 如果没有的话，直接处理简单的ResultMap
  public void handleRowValues(ResultSetWrapper rsw, ResultMap resultMap, ResultHandler<?> resultHandler, RowBounds rowBounds, ResultMapping parentMapping) throws SQLException {
    if (resultMap.hasNestedResultMaps()) {
      ensureNoRowBounds();
      checkResultHandler();
      handleRowValuesForNestedResultMap(rsw, resultMap, resultHandler, rowBounds, parentMapping);
    } else {
      handleRowValuesForSimpleResultMap(rsw, resultMap, resultHandler, rowBounds, parentMapping);
    }
  }
```

handleResultSets 方法返回的是 collapseSingleResultList(multipleResults) ，它是什么呢？

```java
private List<Object> collapseSingleResultList(List<Object> multipleResults) {
  return multipleResults.size() == 1 ? (List<Object>) multipleResults.get(0) : multipleResults;
}
```

它是判断的 multipleResults 的数量，如果数量是 1 ，就直接取位置为0的元素，如果不是1，那就返回 multipleResults 的真实数量

那么 multipleResults 的数量是哪来的呢？

它的值其实是处理结果集中传递进去的

```java
handleResultSet(rsw, resultMap, multipleResults, null);
```

然后在处理结果集的方法中对 multipleResults 进行添加

```java
multipleResults.add(defaultResultHandler.getResultList());
```

下面我们来看一下返回的真实实现类 DefaultResultSetHandler 中的结构组成

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190808064024845-640445981.png)


在 DefaultResultSetHandler 中处理完结果映射，并把上述结构返回给调用的客户端，从而执行完成一条完整的SQL语句。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)




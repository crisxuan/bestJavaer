# MyBatis 核心配置综述之 ParameterHandler

* [MyBatis 核心配置综述之 ParameterHandler](#mybatis-核心配置综述之-parameterhandler)
   * [ParameterHandler 简介](#parameterhandler-简介)
   * [ParameterHandler 创建](#parameterhandler-创建)
   * [ParameterHandler 中的参数从何而来](#parameterhandler-中的参数从何而来)
   * [ParameterHandler 解析](#parameterhandler-解析)

MyBatis 四大核心组件我们已经了解到了两种，一个是 Executor ，它是MyBatis 解析SQL请求首先会经过的第一道关卡，它的主要作用在于创建缓存，管理 StatementHandler 的调用，为 StatementHandler 提供 Configuration 环境等。StatementHandler 组件最主要的作用在于创建 Statement 对象与数据库进行交流，还会使用 ParameterHandler 进行参数配置，使用 ResultSetHandler 把查询结果与实体类进行绑定。那么本篇就来了解一下第三个组件 ParameterHandler。

## ParameterHandler 简介

`ParameterHandler` 相比于其他的组件就简单很多了，ParameterHandler 译为参数处理器，负责为 PreparedStatement 的 sql 语句参数动态赋值，这个接口很简单只有两个方法

```java
/**
 * A parameter handler sets the parameters of the {@code PreparedStatement}
 * 参数处理器为 PreparedStatement 设置参数
 */
public interface ParameterHandler {

  Object getParameterObject();

  void setParameters(PreparedStatement ps)
      throws SQLException;

}
```

ParameterHandler 只有一个实现类 `DefaultParameterHandler` ， 它实现了这两个方法。

- getParameterObject： 用于读取参数
- setParameters: 用于对 PreparedStatement 的参数赋值

## ParameterHandler 创建

参数处理器对象是在创建 StatementHandler 对象的同时被创建的，由 Configuration 对象负责创建

BaseStatementHandler.java

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
```

在创建 ParameterHandler 时，需要传入SQL的mappedStatement 对象，读取的参数和SQL语句

> 注意：一个 BoundSql 对象，就代表了一次sql语句的实际执行，而 SqlSource 对象的责任，就是根据传入的参数对象，动态计算这个 BoundSql， 也就是 Mapper 文件中节点的计算，是由 SqlSource 完成的，SqlSource 最常用的实现类是 DynamicSqlSource

Configuration.java

```java
public ParameterHandler newParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql) {
  // 创建ParameterHandler
  ParameterHandler parameterHandler = mappedStatement.getLang().createParameterHandler(mappedStatement, parameterObject, boundSql);
  parameterHandler = (ParameterHandler) interceptorChain.pluginAll(parameterHandler);
  return parameterHandler;
}
```

上面是 Configuration 创建 ParameterHandler 的过程，它实际上是交由 `LanguageDriver` 来创建具体的参数处理器，LanguageDriver 默认的实现类是 `XMLLanguageDriver`，由它调用 `DefaultParameterHandler` 中的构造方法完成 ParameterHandler 的创建工作

```java
public ParameterHandler createParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql) {
  return new DefaultParameterHandler(mappedStatement, parameterObject, boundSql);
}

public DefaultParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql) {
  this.mappedStatement = mappedStatement;
  this.configuration = mappedStatement.getConfiguration();
  // 获取 TypeHandlerRegistry 注册
  this.typeHandlerRegistry = mappedStatement.getConfiguration().getTypeHandlerRegistry();
  this.parameterObject = parameterObject;
  this.boundSql = boundSql;
}
```

上面的流程是创建 ParameterHandler 的过程，创建完成之后，该进行具体的解析工作，那么 ParameterHandler 如何解析SQL中的参数呢？SQL中的参数从哪里来的？

## ParameterHandler 中的参数从何而来

你可能知道 Parameter 中的参数是怎么来的，无非就是从 Mapper 配置文件中映射过去的啊，就比如如下例子

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190807231123882-227673915.png)


参数肯定就是图中标红的 1 ，然后再传到XML对应的 SQL 语句中，用 `#{}` 或者 `${}` 来进行赋值啊，

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190807231133268-1219817070.png)


嗯，你讲的没错，可是你知道这个参数是如何映射过来的吗？或者说你知道 Parameter 的解析过程吗？或许你不是很清晰了，我们下面就来探讨一下 **ParameterHandler** 对参数的解析，这其中涉及到 MyBatis 中的动态代理模式

在MyBatis 中，当 **deptDao.findByDeptNo(1)** 将要执行的时候，会被 JVM 进行拦截，交给 MyBatis 中的代理实现类 MapperProxy 的 invoke 方法中，这也是执行 SQL 语句的主流程。

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190807231142981-835042774.png)


然后交给 Executor 、StatementHandler进行对应的参数解析和执行，因为是带参数的 SQL 语句，最终会创建 **PreparedStatement** 对象并创建参数解析器进行参数解析

SimpleExecutor.java

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190807231153862-1689775186.png)


handler.parameterize(stmt) 最终会调用到 `DefaultParameterHandler` 中的 `setParameters` 方法，我在源码上做了注释，为了方便拷贝，我没有采用截图的形式

```java
public void setParameters(PreparedStatement ps) {
  ErrorContext.instance().activity("setting parameters").object(mappedStatement.getParameterMap().getId());
  // parameterMappings 就是对 #{} 或者 ${} 里面参数的封装
  List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
  if (parameterMappings != null) {
    // 如果是参数化的SQL，便需要循环取出并设置参数的值
    for (int i = 0; i < parameterMappings.size(); i++) {
      ParameterMapping parameterMapping = parameterMappings.get(i);
      // 如果参数类型不是 OUT ，这个类型与 CallableStatementHandler 有关
      // 因为存储过程不存在输出参数，所以参数不是输出参数的时候，就需要设置。
      if (parameterMapping.getMode() != ParameterMode.OUT) {
        Object value;
        // 得到#{}  中的属性名
        String propertyName = parameterMapping.getProperty();
        // 如果 propertyName 是 Map 中的key
        if (boundSql.hasAdditionalParameter(propertyName)) { // issue #448 ask first for additional params
          // 通过key 来得到 additionalParameter 中的value值
          value = boundSql.getAdditionalParameter(propertyName);
        }
        // 如果不是 additionalParameters 中的key，而且传入参数是 null， 则value 就是null
        else if (parameterObject == null) {
          value = null;
        }
        // 如果 typeHandlerRegistry 中已经注册了这个参数的 Class对象，即它是Primitive 或者是String 的话
        else if (typeHandlerRegistry.hasTypeHandler(parameterObject.getClass())) {
          value = parameterObject;
        } else {
          // 否则就是 Map
          MetaObject metaObject = configuration.newMetaObject(parameterObject);
          value = metaObject.getValue(propertyName);
        }
        // 在通过SqlSource 的parse 方法得到parameterMappings 的具体实现中，我们会得到parameterMappings的typeHandler
        TypeHandler typeHandler = parameterMapping.getTypeHandler();
        // 获取typeHandler 的jdbc type
        JdbcType jdbcType = parameterMapping.getJdbcType();
        if (value == null && jdbcType == null) {
          jdbcType = configuration.getJdbcTypeForNull();
        }
        try {
          typeHandler.setParameter(ps, i + 1, value, jdbcType);
        } catch (TypeException e) {
          throw new TypeException("Could not set parameters for mapping: " + parameterMapping + ". Cause: " + e, e);
        } catch (SQLException e) {
          throw new TypeException("Could not set parameters for mapping: " + parameterMapping + ". Cause: " + e, e);
        }
      }
    }
  }
}
```

## ParameterHandler 解析

我们在 `MyBatis 核心配置综述之 StatementHandler` 一文中了解到 Executor 管理的是 StatementHandler 对象的创建以及参数赋值，那么我们的主要入口还是 Executor 执行器

下面用一个流程图表示一下 ParameterHandler 的解析过程，以简单执行器为例

![](https://img2018.cnblogs.com/blog/1515111/201908/1515111-20190807231207153-238300434.png)


像是 `doQuery`,`doUpdate`,`doQueryCursor`等方法都会先调用到

```java
// 生成 preparedStatement 并调用 prepare 方法，并为参数赋值
private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
  Statement stmt;
  Connection connection = getConnection(statementLog);
  stmt = handler.prepare(connection, transaction.getTimeout());
  handler.parameterize(stmt);
  return stmt;
}
```

然后在生成 `preparedStatement` 调用`DefaultParameterHandler`进行参数赋值。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


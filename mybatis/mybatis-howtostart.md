# MyBatis 启动流程

* [MyBatis 启动流程](#mybatis-启动流程)
   * [初识 MyBatis](#初识-mybatis)
      * [MyBatis 的特点](#mybatis-的特点)
      * [MyBatis 整体架构](#mybatis-整体架构)
         * [接口层](#接口层)
         * [数据处理层](#数据处理层)
         * [基础支持层](#基础支持层)
   * [MyBatis 核心组件](#mybatis-核心组件)
      * [SqlSessionFactory](#sqlsessionfactory)
         * [重要配置](#重要配置)
      * [SqlSession](#sqlsession)
      * [MapperProxy](#mapperproxy)
      * [Executor](#executor)
         * [Executor 的继承结构](#executor-的继承结构)
         * [Executor 的创建和选择](#executor-的创建和选择)
         * [Executor 的具体执行过程](#executor-的具体执行过程)
      * [StatementHandler](#statementhandler)
         * [StatementHandler 的继承结构](#statementhandler-的继承结构)
         * [StatementHandler 的创建和源码分析](#statementhandler-的创建和源码分析)
      * [ParameterHandler](#parameterhandler)
         * [ParameterHandler 介绍](#parameterhandler-介绍)
         * [ParameterHandler 的解析过程](#parameterhandler-的解析过程)
      * [ResultSetHandler](#resultsethandler)
         * [ResultSetHandler 简介](#resultsethandler-简介)
         * [ResultSetHandler 解析过程](#resultsethandler-解析过程)

## 初识 MyBatis

MyBatis 是第一个支持自定义 SQL、存储过程和高级映射的类持久框架。MyBatis 消除了大部分 JDBC 的样板代码、手动设置参数以及检索结果。MyBatis 能够支持简单的 XML 和注解配置规则。使 Map 接口和 POJO 类映射到数据库字段和记录。

### MyBatis 的特点

那么 MyBatis 具有什么特点呢？或许我们可以从如下几个方面来描述

* MyBatis 中的 SQL 语句和主要业务代码分离，我们一般会把 MyBatis 中的 SQL 语句统一放在 XML 配置文件中，便于统一维护。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201125833040-2122223120.png)

* 解除 SQL 与程序代码的耦合，通过提供 DAO 层，将业务逻辑和数据访问逻辑分离，使系统的设计更清晰，更易维护，更易单元测试。SQL 和代码的分离，提高了可维护性。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130121731-742059129.png)

* MyBatis 比较简单和轻量

本身就很小且简单。没有任何第三方依赖，只要通过配置 jar 包，或者如果你使用 Maven 项目的话只需要配置 Maven 以来就可以。易于使用，通过文档和源代码，可以比较完全的掌握它的设计思路和实现。

* 屏蔽样板代码

MyBatis 回屏蔽原始的 JDBC 样板代码，让你把更多的精力专注于 SQL 的书写和属性-字段映射上。

* 编写原生 SQL，支持多表关联

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130132552-1732561771.png)

MyBatis 最主要的特点就是你可以手动编写 SQL 语句，能够支持多表关联查询。

* 提供映射标签，支持对象与数据库的 ORM 字段关系映射

> ORM 是什么？`对象关系映射(Object Relational Mapping，简称ORM)` ，是通过使用描述对象和数据库之间映射的元数据，将面向对象语言程序中的对象自动持久化到关系数据库中。本质上就是将数据从一种形式转换到另外一种形式。 

* 提供 XML 标签，支持编写动态 SQL。

你可以使用 MyBatis XML 标签，起到 SQL 模版的效果，减少繁杂的 SQL 语句，便于维护。

### MyBatis 整体架构

MyBatis 最上面是接口层，接口层就是开发人员在 Mapper 或者是 Dao 接口中的接口定义，是查询、新增、更新还是删除操作；中间层是数据处理层，主要是配置 Mapper -> XML 层级之间的参数映射，SQL 解析，SQL 执行，结果映射的过程。上述两种流程都由基础支持层来提供功能支撑，基础支持层包括连接管理，事务管理，配置加载，缓存处理等。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130144525-575004537.png)

#### 接口层

在不与Spring 集成的情况下，使用 MyBatis 执行数据库的操作主要如下：

```java
InputStream is = Resources.getResourceAsStream("myBatis-config.xml");
SqlSessionFactoryBuilder builder = new SqlSessionFactoryBuilder();
SqlSessionFactory factory = builder.build(is);
sqlSession = factory.openSession();
```

其中的`SqlSessionFactory`,`SqlSession`是 MyBatis 接口的核心类，尤其是 SqlSession，这个接口是MyBatis 中最重要的接口，这个接口能够让你执行命令，获取映射，管理事务。

#### 数据处理层

* **配置解析**

在 Mybatis 初始化过程中，会加载 `mybatis-config.xml` 配置文件、映射配置文件以及 Mapper 接口中的注解信息，解析后的配置信息会形成相应的对象并保存到 `Configration` 对象中。之后，根据该对象创建SqlSessionFactory 对象。待 Mybatis 初始化完成后，可以通过 SqlSessionFactory 创建 SqlSession 对象并开始数据库操作。

* **SQL 解析与 scripting 模块**

Mybatis 实现的动态 SQL 语句，几乎可以编写出所有满足需要的 SQL。

Mybatis 中 scripting 模块会根据用户传入的参数，解析映射文件中定义的动态 SQL 节点，形成数据库能执行的SQL 语句。

* **SQL 执行**

SQL 语句的执行涉及多个组件，包括 MyBatis 的四大核心，它们是: `Executor`、`StatementHandler`、`ParameterHandler`、`ResultSetHandler`。SQL 的执行过程可以用下面这幅图来表示

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130157813-1995474963.png)

MyBatis 层级结构各个组件的介绍(这里只是简单介绍，具体介绍在后面)：

* `SqlSession`： ，它是 MyBatis 核心 API，主要用来执行命令，获取映射，管理事务。接收开发人员提供 Statement Id 和参数。并返回操作结果。
* `Executor` ：执行器，是 MyBatis 调度的核心，负责 SQL 语句的生成以及查询缓存的维护。
* `StatementHandler` :  封装了JDBC Statement 操作，负责对 JDBC Statement 的操作，如设置参数、将Statement 结果集转换成 List 集合。
* `ParameterHandler` :  负责对用户传递的参数转换成 JDBC Statement 所需要的参数。
* `ResultSetHandler` : 负责将 JDBC 返回的 ResultSet 结果集对象转换成 List 类型的集合。
* `TypeHandler` :  用于 Java 类型和 JDBC 类型之间的转换。
* `MappedStatement` : 动态 SQL 的封装
* `SqlSource` :  表示从 XML 文件或注释读取的映射语句的内容，它创建将从用户接收的输入参数传递给数据库的 SQL。
* `Configuration`:  MyBatis 所有的配置信息都维持在 Configuration 对象之中。

#### 基础支持层

* 反射模块

Mybatis 中的反射模块，对 Java 反射进行了很好的封装，提供了简易的 API，方便上层调用，并且对反射操作进行了一系列的优化，比如，缓存了类的 `元数据（MetaClass）`和对象的`元数据（MetaObject）`，提高了反射操作的性能。

* 类型转换模块

Mybatis 的别名机制，能够简化配置文件，该机制是类型转换模块的主要功能之一。类型转换模块的另一个功能**是实现 JDBC 类型与 Java 类型的转换**。在 SQL 语句绑定参数时，会将数据由 Java 类型转换成 JDBC 类型；在映射结果集时，会将数据由 JDBC 类型转换成 Java 类型。

* 日志模块

在 Java 中，有很多优秀的日志框架，如 Log4j、Log4j2、slf4j 等。Mybatis 除了提供了详细的日志输出信息，还能够集成多种日志框架，其日志模块的主要功能就是集成第三方日志框架。

* 资源加载模块

该模块主要封装了类加载器，确定了类加载器的使用顺序，并提供了加载类文件和其它资源文件的功能。

* 解析器模块

该模块有两个主要功能：一个是封装了 `XPath`，为 Mybatis 初始化时解析 `mybatis-config.xml `配置文件以及映射配置文件提供支持；另一个为处理动态 SQL 语句中的占位符提供支持。

* 数据源模块

Mybatis 自身提供了相应的数据源实现，也提供了与第三方数据源集成的接口。数据源是开发中的常用组件之一，很多开源的数据源都提供了丰富的功能，如连接池、检测连接状态等，选择性能优秀的数据源组件，对于提供ORM 框架以及整个应用的性能都是非常重要的。

* 事务管理模块

一般地，Mybatis 与 Spring 框架集成，由 Spring 框架管理事务。但 Mybatis 自身对数据库事务进行了抽象，提供了相应的事务接口和简单实现。

* 缓存模块

Mybatis 中有`一级缓存`和`二级缓存`，这两级缓存都依赖于缓存模块中的实现。但是需要注意，这两级缓存与Mybatis 以及整个应用是运行在同一个 JVM 中的，共享同一块内存，如果这两级缓存中的数据量较大，则可能影响系统中其它功能，所以需要缓存大量数据时，优先考虑使用 Redis、Memcache 等缓存产品。

* Binding 模块

在调用 `SqlSession` 相应方法执行数据库操作时，需要制定映射文件中定义的 SQL 节点，如果 SQL 中出现了拼写错误，那就只能在运行时才能发现。为了能尽早发现这种错误，Mybatis 通过 Binding 模块将用户自定义的Mapper 接口与映射文件关联起来，系统可以通过调用自定义 Mapper 接口中的方法执行相应的 SQL 语句完成数据库操作，从而避免上述问题。注意，在开发中，我们只是创建了 Mapper 接口，而并没有编写实现类，这是因为 Mybatis 自动为 Mapper 接口创建了动态代理对象。

## MyBatis 核心组件

在认识了 MyBatis 并了解其基础架构之后，下面我们来看一下 MyBatis 的核心组件，就是这些组件实现了从 SQL 语句到映射到 JDBC 再到数据库字段之间的转换，执行 SQL 语句并输出结果集。首先来认识 MyBatis 的第一个核心组件

### SqlSessionFactory

对于任何框架而言，在使用该框架之前都要经历过一系列的初始化流程，MyBatis 也不例外。MyBatis 的初始化流程如下

```java
String resource = "org/mybatis/example/mybatis-config.xml";
InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
sqlSessionFactory.openSession();
```

上述流程中比较重要的一个对象就是`SqlSessionFactory`，SqlSessionFactory 是 MyBatis 框架中的一个接口，它主要负责的是

*  MyBatis 框架初始化操作
*  为开发人员提供`SqlSession` 对象

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130216480-1697776756.png)

`SqlSessionFactory` 有两个实现类，一个是 SqlSessionManager 类，一个是 DefaultSqlSessionFactory 类

* `DefaultSqlSessionFactory` : SqlSessionFactory 的默认实现类，是真正生产会话的工厂类，这个类的实例的生命周期是全局的，它只会在首次调用时生成一个实例（单例模式），就一直存在直到服务器关闭。

* SqlSessionManager ： 已被废弃，原因大概是: SqlSessionManager 中需要维护一个自己的线程池，而使用MyBatis 更多的是要与 Spring 进行集成，并不会单独使用，所以维护自己的 ThreadLocal 并没有什么意义，所以 SqlSessionManager 已经不再使用。

####SqlSessionFactory 的执行流程

下面来对 SqlSessionFactory 的执行流程来做一个分析

首先第一步是 SqlSessionFactory 的创建

```java
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
```

从这行代码入手，首先创建了一个 `SqlSessionFactoryBuilder` 工厂，这是一个建造者模式的设计思想，由 builder 建造者来创建 SqlSessionFactory 工厂

然后调用 SqlSessionFactoryBuilder 中的 `build` 方法传递一个`InputStream` 输入流，Inputstream 输入流中就是你传过来的配置文件 mybatis-config.xml，SqlSessionFactoryBuilder 根据传入的 InputStream 输入流和`environment`、`properties`属性创建一个`XMLConfigBuilder`对象。SqlSessionFactoryBuilder 对象调用XMLConfigBuilder 的`parse()`方法，流程如下。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130422845-860535795.png)

XMLConfigBuilder 会解析`/configuration`标签，configuration 是 MyBatis 中最重要的一个标签，下面流程会介绍 Configuration 标签。

> MyBatis 默认使用 XPath 来解析标签，关于 XPath 的使用，参见 https://www.w3school.com.cn/xpath/index.asp

在 `parseConfiguration` 方法中，会对各个在 `/configuration` 中的标签进行解析

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130443133-451026744.png)

#### 重要配置

说一下这些标签都是什么意思吧

* `properties`，外部属性，这些属性都是可外部配置且可动态替换的，既可以在典型的 Java 属性文件中配置，亦可通过 properties 元素的子元素来传递。

```xml
<properties>
    <property name="driver" value="com.mysql.jdbc.Driver" />
    <property name="url" value="jdbc:mysql://localhost:3306/test" />
    <property name="username" value="root" />
    <property name="password" value="root" />
</properties>
```

一般用来给 `environment` 标签中的 `dataSource` 赋值

```xml
<environment id="development">
  <transactionManager type="JDBC" />
  <dataSource type="POOLED">
    <property name="driver" value="${driver}" />
    <property name="url" value="${url}" />
    <property name="username" value="${username}" />
    <property name="password" value="${password}" />
  </dataSource>
</environment>
```

还可以通过外部属性进行配置，但是我们这篇文章以原理为主，不会介绍太多应用层面的操作。

* `settings` ，MyBatis 中极其重要的配置，它们会改变 MyBatis 的运行时行为。

settings 中配置有很多，具体可以参考 https://mybatis.org/mybatis-3/zh/configuration.html#settings 详细了解。这里介绍几个平常使用过程中比较重要的配置

| 属性                     | 描述                                                         |
| ------------------------ | ------------------------------------------------------------ |
| cacheEnabled             | 全局地开启或关闭配置文件中的所有映射器已经配置的任何缓存。   |
| useGeneratedKeys         | 允许 JDBC 支持自动生成主键，需要驱动支持。 如果设置为 true 则这个设置强制使用自动生成主键。 |
| lazyLoadingEnabled       | 延迟加载的全局开关。当开启时，所有关联对象都会延迟加载。     |
| jdbcTypeForNull          | 当没有为参数提供特定的 JDBC 类型时，为空值指定 JDBC 类型。 某些驱动需要指定列的 JDBC 类型，多数情况直接用一般类型即可，比如 NULL、VARCHAR 或 OTHER。 |
| defaultExecutorType      | 配置默认的执行器。SIMPLE 就是普通的执行器；REUSE 执行器会重用预处理语句（prepared statements）； BATCH 执行器将重用语句并执行批量更新。 |
| localCacheScope          | MyBatis 利用本地缓存机制（Local Cache）防止循环引用（circular references）和加速重复嵌套查询。 默认值为 SESSION，这种情况下会缓存一个会话中执行的所有查询。 若设置值为 STATEMENT，本地会话仅用在语句执行上，对相同 SqlSession 的不同调用将不会共享数据 |
| proxyFactory             | 指定 Mybatis 创建具有延迟加载能力的对象所用到的代理工具。    |
| mapUnderscoreToCamelCase | 是否开启自动驼峰命名规则（camel case）映射，即从经典数据库列名 A_COLUMN 到经典 Java 属性名 aColumn 的类似映射。 |

一般使用如下配置

```xml
<settings>
  <setting name="cacheEnabled" value="true"/>
  <setting name="lazyLoadingEnabled" value="true"/>
</settings>
```

* `typeAliases`，类型别名，类型别名是为 Java 类型设置的一个名字。 它只和 XML 配置有关。

```xml
<typeAliases>
  <typeAlias alias="Blog" type="domain.blog.Blog"/>
</typeAliases>
```

当这样配置时，`Blog` 可以用在任何使用 `domain.blog.Blog` 的地方。

* `typeHandlers`，类型处理器，无论是 MyBatis 在`预处理语句（PreparedStatement）`中设置一个参数时，还是从结果集中取出一个值时， 都会用类型处理器将获取的值以合适的方式转换成 Java 类型。

在 `org.apache.ibatis.type` 包下有很多已经实现好的 TypeHandler，可以参考如下

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130501724-409266797.png)

你可以重写类型处理器或创建你自己的类型处理器来处理不支持的或非标准的类型。 

具体做法为：实现 `org.apache.ibatis.type.TypeHandler` 接口， 或继承一个很方便的类 `org.apache.ibatis.type.BaseTypeHandler`， 然后可以选择性地将它映射到一个 JDBC 类型。

* `objectFactory`，对象工厂，MyBatis 每次创建结果对象的新实例时，它都会使用一个对象工厂（ObjectFactory）实例来完成。默认的对象工厂需要做的仅仅是实例化目标类，要么通过默认构造方法，要么在参数映射存在的时候通过参数构造方法来实例化。如果想覆盖对象工厂的默认行为，则可以通过创建自己的对象工厂来实现。

```java
public class ExampleObjectFactory extends DefaultObjectFactory {
  public Object create(Class type) {
    return super.create(type);
  }
  public Object create(Class type, List<Class> constructorArgTypes, List<Object> constructorArgs) {
    return super.create(type, constructorArgTypes, constructorArgs);
  }
  public void setProperties(Properties properties) {
    super.setProperties(properties);
  }
  public <T> boolean isCollection(Class<T> type) {
    return Collection.class.isAssignableFrom(type);
  }
}
```

然后需要在 XML 中配置此对象工厂

```xml
<objectFactory type="org.mybatis.example.ExampleObjectFactory">
  <property name="someProperty" value="100"/>
</objectFactory>
```

* `plugins`，插件开发，插件开发是 MyBatis 设计人员给开发人员留给自行开发的接口，MyBatis 允许你在已映射语句执行过程中的某一点进行拦截调用。MyBatis 允许使用插件来拦截的方法调用包括：**Executor、ParameterHandler、ResultSetHandler、StatementHandler** 接口，这几个接口也是 MyBatis 中非常重要的接口，我们下面会详细介绍这几个接口。

* `environments`，MyBatis 环境配置，MyBatis 可以配置成适应多种环境，这种机制有助于将 SQL 映射应用于多种数据库之中。例如，开发、测试和生产环境需要有不同的配置；或者想在具有相同 Schema 的多个生产数据库中 使用相同的 SQL 映射。

  这里注意一点，虽然 environments 可以指定多个环境，但是 **SqlSessionFactory** 只能有一个，为了指定创建哪种环境，只要将它作为可选的参数传递给 SqlSessionFactoryBuilder 即可。

  ```java
  SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, environment);
  SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, environment, properties);
  ```

  环境配置如下

  ```xml
  <environments default="development">
    <environment id="development">
      <transactionManager type="JDBC">
        <property name="..." value="..."/>
      </transactionManager>
      <dataSource type="POOLED">
        <property name="driver" value="${driver}"/>
        <property name="url" value="${url}"/>
        <property name="username" value="${username}"/>
        <property name="password" value="${password}"/>
      </dataSource>
    </environment>
  </environments>
  ```

* `databaseIdProvider` ，数据库厂商标示，MyBatis 可以根据不同的数据库厂商执行不同的语句，这种多厂商的支持是基于映射语句中的 `databaseId` 属性。

  ```xml
  <databaseIdProvider type="DB_VENDOR">
    <property name="SQL Server" value="sqlserver"/>
    <property name="DB2" value="db2"/>
    <property name="Oracle" value="oracle" />
  </databaseIdProvider>
  ```

* `mappers`，映射器，这是告诉 MyBatis 去哪里找到这些 SQL 语句，mappers 映射配置有四种方式

  ```xml
  <!-- 使用相对于类路径的资源引用 -->
  <mappers>
    <mapper resource="org/mybatis/builder/AuthorMapper.xml"/>
    <mapper resource="org/mybatis/builder/BlogMapper.xml"/>
    <mapper resource="org/mybatis/builder/PostMapper.xml"/>
  </mappers>
  
  <!-- 使用完全限定资源定位符（URL） -->
  <mappers>
    <mapper url="file:///var/mappers/AuthorMapper.xml"/>
    <mapper url="file:///var/mappers/BlogMapper.xml"/>
    <mapper url="file:///var/mappers/PostMapper.xml"/>
  </mappers>
  
  <!-- 使用映射器接口实现类的完全限定类名 -->
  <mappers>
    <mapper class="org.mybatis.builder.AuthorMapper"/>
    <mapper class="org.mybatis.builder.BlogMapper"/>
    <mapper class="org.mybatis.builder.PostMapper"/>
  </mappers>
  
  <!-- 将包内的映射器接口实现全部注册为映射器 -->
  <mappers>
    <package name="org.mybatis.builder"/>
  </mappers>
  ```

上面的一个个属性都对应着一个解析方法，都是使用 XPath 把标签进行解析，解析完成后返回一个 `DefaultSqlSessionFactory` 对象，它是 SqlSessionFactory 的默认实现类。这就是 SqlSessionFactoryBuilder 的初始化流程，通过流程我们可以看到，初始化流程就是对一个个 `/configuration` 标签下子标签的解析过程。

### SqlSession

在 MyBatis 初始化流程结束，也就是 SqlSessionFactoryBuilder -> SqlSessionFactory 的获取流程后，我们就可以通过 SqlSessionFactory 对象得到 `SqlSession` 然后执行 SQL 语句了。具体来看一下这个过程

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130543578-1014328732.png)

在 SqlSessionFactory.openSession 过程中我们可以看到，会调用到 DefaultSqlSessionFactory 中的 `openSessionFromDataSource` 方法，这个方法主要创建了两个与我们分析执行流程重要的对象，一个是 `Executor` 执行器对象，一个是 `SqlSession` 对象。执行器我们下面会说，现在来说一下 SqlSession 对象

SqlSession 对象是 MyBatis 中最重要的一个对象，这个接口能够让你执行命令，获取映射，管理事务。SqlSession 中定义了一系列模版方法，让你能够执行简单的 `CRUD` 操作，也可以通过 `getMapper` 获取 Mapper 层，执行自定义 SQL 语句，因为 SqlSession 在执行 SQL 语句之前是需要先开启一个会话，涉及到事务操作，所以还会有 `commit`、 `rollback`、`close` 等方法。这也是模版设计模式的一种应用。

### MapperProxy

MapperProxy 是 Mapper 映射 SQL 语句的关键对象，我们写的 Dao 层或者 Mapper 层都是通过 `MapperProxy` 来和对应的 SQL 语句进行绑定的。下面我们就来解释一下绑定过程

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130554920-1595843380.png)

这就是 MyBatis 的核心绑定流程，我们可以看到 SqlSession 首先调用 `getMapper` 方法，我们刚才说到 SqlSession 是大哥级别的人物，只定义标准（有一句话是怎么说的来着，一流的企业做标准，二流的企业做品牌，三流的企业做产品）。

SqlSession 不愿意做的事情交给 `Configuration` 这个手下去做，但是 Configuration 也是有小弟的，它不愿意做的事情直接甩给小弟去做，这个小弟是谁呢？它就是 `MapperRegistry`，马上就到核心部分了。MapperRegistry 相当于项目经理，项目经理只从大面上把握项目进度，不需要知道手下的小弟是如何工作的，把任务完成了就好。最终真正干活的还是 `MapperProxyFactory`。看到这段代码 **Proxy.newProxyInstance** ，你是不是有一种恍然大悟的感觉，如果你没有的话，建议查阅一下动态代理的文章，这里推荐一篇 （https://www.jianshu.com/p/95970b089360）

也就是说，MyBatis 中 Mapper 和 SQL 语句的绑定正是通过动态代理来完成的。

通过动态代理，我们就可以方便的在 Dao 层或者 Mapper 层定义接口，实现自定义的增删改查操作了。那么具体的执行过程是怎么样呢？上面只是绑定过程，别着急，下面就来探讨一下 SQL 语句的执行过程。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130712198-922599744.png)

> 有一部分代码被遮挡，代码有些多，不过不影响我们看主要流程

MapperProxyFactory 会生成代理对象，这个对象就是 MapperProxy，最终会调用到 mapperMethod.execute 方法，`execute` 方法比较长，其实逻辑比较简单，就是判断是 `插入`、`更新`、`删除` 还是 `查询` 语句，其中如果是查询的话，还会判断返回值的类型，我们可以点进去看一下都是怎么设计的。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130725751-381595847.png)

很多代码其实可以忽略，只看我标出来的重点就好了，我们可以看到，不管你前面经过多少道关卡处理，最终都逃不过 `SqlSession` 这个老大制定的标准。

我们以 `selectList` 为例，来看一下下面的执行过程。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201130821032-488347158.png)

这是 `DefaultSqlSession` 中 selectList 的代码，我们可以看到出现了 `executor`，这是什么呢？我们下面来解释。

### Executor

还记得我们之前的流程中提到了 `Executor(执行器)` 这个概念吗？我们来回顾一下它第一次出现的位置。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131004110-695090012.png)

由 Configuration 对象创建了一个 `Executor` 对象，这个 Executor 是干嘛的呢？下面我们就来认识一下

#### Executor 的继承结构

每一个 SqlSession 都会拥有一个 Executor 对象，这个对象负责增删改查的具体操作，我们可以简单的将它理解为 JDBC 中 Statement 的封装版。 也可以理解为 SQL 的执行引擎，要干活总得有一个发起人吧，可以把 Executor 理解为发起人的角色。 

首先先从 Executor 的继承体系来认识一下

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131015540-620179843.png)

如上图所示，位于继承体系最顶层的是 Executor 执行器，它有两个实现类，分别是`BaseExecutor`和 `CachingExecutor`。

`BaseExecutor` 是一个抽象类，这种通过抽象的实现接口的方式是`适配器设计模式之接口适配` 的体现，是Executor 的默认实现，实现了大部分 Executor 接口定义的功能，降低了接口实现的难度。BaseExecutor 的子类有三个，分别是 SimpleExecutor、ReuseExecutor 和 BatchExecutor。

`SimpleExecutor` : 简单执行器，是 MyBatis 中**默认使用**的执行器，每执行一次 update 或 select，就开启一个Statement 对象，用完就直接关闭 Statement 对象(可以是 Statement 或者是 PreparedStatment 对象)

`ReuseExecutor` : 可重用执行器，这里的重用指的是重复使用 Statement，它会在内部使用一个 Map 把创建的Statement 都缓存起来，每次执行 SQL 命令的时候，都会去判断是否存在基于该 SQL 的 Statement 对象，如果存在 Statement 对象并且对应的 connection 还没有关闭的情况下就继续使用之前的 Statement 对象，并将其缓存起来。因为每一个 SqlSession 都有一个新的 Executor 对象，所以我们缓存在 ReuseExecutor 上的 Statement作用域是同一个 SqlSession。

`BatchExecutor` : 批处理执行器，用于将多个 SQL 一次性输出到数据库

`CachingExecutor`: 缓存执行器，先从缓存中查询结果，如果存在就返回之前的结果；如果不存在，再委托给Executor delegate 去数据库中取，delegate 可以是上面任何一个执行器。

#### Executor 的创建和选择

我们上面提到 `Executor` 是由 Configuration 创建的，Configuration 会根据执行器的类型创建，如下

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131215961-508743168.png)

这一步就是执行器的创建过程，根据传入的 `ExecutorType` 类型来判断是哪种执行器，如果不指定 ExecutorType ，默认创建的是简单执行器。它的赋值可以通过两个地方进行赋值：

* 可以通过`<settings>`标签来设置当前工程中所有的 SqlSession 对象使用默认的 Executor

```xml
<settings>
 <!--取值范围 SIMPLE, REUSE, BATCH -->
	<setting name="defaultExecutorType" value="SIMPLE"/>
</settings>
```

* 另外一种直接通过Java对方法赋值的方式

```java
session = factory.openSession(ExecutorType.BATCH);
```

#### Executor 的具体执行过程

Executor 中的大部分方法的调用链其实是差不多的，下面是深入源码分析执行过程，如果你没有时间或者暂时不想深入研究的话，给你下面的执行流程图作为参考。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131246633-1176532908.png)

我们紧跟着上面的 `selectList` 继续分析，它会调用到 `executor.query` 方法。

当有一个查询请求访问的时候，首先会经过 Executor 的实现类 `CachingExecutor` ，先从缓存中查询 SQL 是否是第一次执行，如果是第一次执行的话，那么就直接执行 SQL 语句，并创建缓存，如果第二次访问相同的 SQL 语句的话，那么就会直接从缓存中提取。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131258850-1109098092.png)

上面这段代码是从 selectList -> 从缓存中 query 的具体过程。可能你看到这里有些觉得类都是什么东西，我想鼓励你一下，把握重点，不用每段代码都看，从找到 SQL 的调用链路，其他代码想看的时候在看，看源码就是很容易发蒙，容易烦躁，但是切记一点，把握重点。

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131323326-1568582578.png)

上面代码会判断缓存中是否有这条 SQL 语句的执行结果，如果没有的话，就再重新创建 `Executor` 执行器执行 SQL 语句，注意， `list = doQuery` 是真正执行 SQL 语句的过程，这个过程中会创建我们上面提到的三种执行器，这里我们使用的是简单执行器。

到这里，执行器所做的工作就完事了，Executor 会把后续的工作交给 `StatementHandler` 继续执行。下面我们来认识一下 StatementHandler

### StatementHandler

`StatementHandler` 是四大组件中最重要的一个对象，负责操作 Statement 对象与数据库进行交互，在工作时还会使用 `ParameterHandler` 和 `ResultSetHandler`对参数进行映射，对结果进行实体类的绑定，这两个组件我们后面说。

我们在搭建原生 JDBC 的时候，会有这样一行代码

```java
Statement stmt = conn.createStatement(); //也可以使用PreparedStatement来做
```

这行代码创建的 Statement 对象或者是 PreparedStatement 对象就是由 StatementHandler 进行管理的。

#### StatementHandler 的继承结构

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131339787-200651511.png)

有没有感觉和  `Executor` 的继承体系很相似呢？最顶级接口是四大组件对象，分别有两个实现类 `BaseStatementHandler`  和  `RoutingStatementHandler `，BaseStatementHandler 有三个实现类, 他们分别是 SimpleStatementHandler、PreparedStatementHandler 和 CallableStatementHandler。

`RoutingStatementHandler` : RoutingStatementHandler 并没有对 Statement 对象进行使用，只是根据StatementType 来创建一个代理，代理的就是对应Handler的三种实现类。在MyBatis工作时,使用的StatementHandler 接口对象实际上就是 RoutingStatementHandler 对象。

`BaseStatementHandler` : 是 StatementHandler 接口的另一个实现类，它本身是一个抽象类，用于简化StatementHandler 接口实现的难度，属于**适配器设计模式**体现，它主要有三个实现类

- **SimpleStatementHandler**: 管理 Statement 对象并向数据库中推送不需要预编译的SQL语句。
- **PreparedStatementHandler**: 管理 Statement 对象并向数据中推送需要预编译的SQL语句。
- **CallableStatementHandler**：管理 Statement 对象并调用数据库中的存储过程。

>这里注意一下，SimpleStatementHandler 和 PreparedStatementHandler 的区别是 SQL 语句是否包含变量，是否通过外部进行参数传入。
>
>SimpleStatementHandler 用于执行没有任何参数传入的 SQL
>
>PreparedStatementHandler 需要对外部传入的变量和参数进行提前参数绑定和赋值。

#### StatementHandler 的创建和源码分析

我们继续来分析上面 `query` 的调用链路，StatementHandler 的创建过程如下

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131352660-561632911.png)

MyBatis 会根据 SQL 语句的类型进行对应 StatementHandler 的创建。我们以预处理 StatementHandler 为例来讲解一下

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131408141-2105861901.png)

执行器不仅掌管着 StatementHandler 的创建，还掌管着创建 Statement 对象，设置参数等，在创建完 PreparedStatement 之后，我们需要对参数进行处理了。

如果用一副图来表示一下这个执行流程的话我想是这样

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131419039-1028290602.png)

这里我们先暂停一下，来认识一下第三个核心组件 ParameterHandler 

### ParameterHandler

#### ParameterHandler 介绍

`ParameterHandler` 相比于其他的组件就简单很多了，ParameterHandler 译为参数处理器，负责为 PreparedStatement 的 sql 语句参数动态赋值，这个接口很简单只有两个方法

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131428593-793273924.png)

ParameterHandler 只有一个实现类 `DefaultParameterHandler` ， 它实现了这两个方法。

* getParameterObject： 用于读取参数
* setParameters: 用于对 PreparedStatement 的参数赋值

#### ParameterHandler 的解析过程

上面我们讨论过了 `ParameterHandler` 的创建过程，下面我们继续上面 `parameterSize` 流程

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131448403-1609304382.png)

这就是具体参数的解析过程了，下面我们来描述一下

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
        // 得到 #{}  中的属性名
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
        // 如果 typeHandlerRegistry 中已经注册了这个参数的 Class 对象，即它是 Primitive 或者是String 的话
        else if (typeHandlerRegistry.hasTypeHandler(parameterObject.getClass())) {
          value = parameterObject;
        } else {
          // 否则就是 Map
          MetaObject metaObject = configuration.newMetaObject(parameterObject);
          value = metaObject.getValue(propertyName);
        }
        // 在通过 SqlSource 的parse 方法得到parameterMappings 的具体实现中，我们会得到parameterMappings 的 typeHandler
        TypeHandler typeHandler = parameterMapping.getTypeHandler();
        // 获取 typeHandler 的jdbc type
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

下面用一个流程图表示一下 ParameterHandler 的解析过程，以简单执行器为例

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131507157-428386499.png)

我们在完成 ParameterHandler 对 SQL 参数的预处理后，回到 SimpleExecutor 中的 `doQuery` 方法

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131517585-10168214.png)

上面又引出来了一个重要的组件那就是 ResultSetHandler，下面我们来认识一下这个组件

### ResultSetHandler

#### ResultSetHandler 简介

ResultSetHandler 也是一个非常简单的接口

![](https://img2018.cnblogs.com/blog/1515111/202002/1515111-20200201131529052-1132375977.png)

ResultSetHandler 是一个接口，它只有一个默认的实现类，像是 ParameterHandler 一样，它的默认实现类是`DefaultResultSetHandler`

#### ResultSetHandler 解析过程

MyBatis 只有一个默认的实现类就是 `DefaultResultSetHandler`，DefaultResultSetHandler 主要负责处理两件事

* 处理 Statement 执行后产生的结果集，生成结果列表

* 处理存储过程执行后的输出参数

按照 Mapper 文件中配置的 ResultType 或 ResultMap 来封装成对应的对象，最后将封装的对象返回即可。

```java
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

* `ResultSet` : Java JDBC ResultSet 接口表示数据库查询的结果。 有关查询的文本显示了如何将查询结果作为java.sql.ResultSet 返回。 然后迭代此ResultSet以检查结果。
* `TypeHandlerRegistry`: 类型注册器，TypeHandlerRegistry 在初始化的时候会把所有的 Java类型和类型转换器进行注册。
* `ColumnNames`: 字段的名称，也就是查询操作需要返回的字段名称
* `ClassNames`: 字段的类型名称，也就是 ColumnNames 每个字段名称的类型
* `JdbcTypes`:  JDBC 的类型，也就是 java.sql.Types 类型 

* `ResultMap`: 负责处理更复杂的映射关系

在 DefaultResultSetHandler 中处理完结果映射，并把上述结构返回给调用的客户端，从而执行完成一条完整的SQL语句。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


# MyBatis 想启动？得先问问它同不同意

* [MyBatis 想启动？得先问问它同不同意](#mybatis-想启动得先问问它同不同意)
   * [Configuration 的创建](#configuration-的创建)
   * [Configuration 的标签以及使用](#configuration-的标签以及使用)
   * [Configuration 标签的解析](#configuration-标签的解析)
   * [Configuration 子标签的源码分析](#configuration-子标签的源码分析)
      * [第一步：Properties 解析](#第一步properties-解析)
      * [第二步：Settings 解析](#第二步settings-解析)
      * [第三步：TypeAliases 解析](#第三步typealiases-解析)
      * [第四步：Plugins 解析](#第四步plugins-解析)
      * [其他步骤](#其他步骤)
   * [总结](#总结)

话说，我最近一直在研究 MyBatis ，研究 MyBatis ，必然逃不了研究 `Configuration` 对象，这个对象简直是太重要了，它是 MyBatis 起步的核心环境配置，下面我们来一起看一下 Configuration 类

## Configuration 的创建

如果你喜欢一个妹子，你是不是闲得问清楚妹子住在哪？只加微信那就只能望梅止渴，主动出击才是硬道理。否则，就算你租了一辆玛莎拉蒂，你都不知道在哪装B。

想要了解 Configuration，得先问清楚它是如何创建的。

在这之前，我先告诉你一个 MyBatis 的入口类，那就是 `SqlSessionFactoryBuilder`, 为什么要介绍这个类哦？因为这个类可以创建 `SqlSession`，想要孩子？没有Builder 的功能怎么行？它的创建在这里

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607093501451-444178738.png)

SqlSessionFactoryBuilder 在创建完成 `XMLConfigBuilder` 之后，会完成 Configuration 的创建工作，也就是说Configuration 对象的创建是在 XMLConfigBuilder 中完成的 ，如下图

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607093509824-923138331.png)

看到这里，你是不是有点跃跃欲试想要按住 control 键点进去？如你所愿，看一下 `new Configuration` 到底生出个什么东西

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607093520324-1057050816.png)

这就是初始化 Configuration 完成的工作了，图中还有一个很关键的类就是 `TypeAliasRegistry`， 想要注册？你得先知道 "我" 是谁 。

TypeAliasRegistry 在Configuration 创建的时候就被初始化了

```java
protected final TypeAliasRegistry typeAliasRegistry = new TypeAliasRegistry();
```

so？ 看一下 new 都做了一些什么事情

```java
public TypeAliasRegistry() {
  registerAlias("string", String.class);

  registerAlias("byte", Byte.class);
  registerAlias("long", Long.class);
  registerAlias("short", Short.class);
  registerAlias("int", Integer.class);
  registerAlias("integer", Integer.class);
  registerAlias("double", Double.class);
  registerAlias("float", Float.class);
  registerAlias("boolean", Boolean.class);

  registerAlias("byte[]", Byte[].class);
  registerAlias("long[]", Long[].class);
  registerAlias("short[]", Short[].class);
  registerAlias("int[]", Integer[].class);
  registerAlias("integer[]", Integer[].class);
  registerAlias("double[]", Double[].class);
  registerAlias("float[]", Float[].class);
  registerAlias("boolean[]", Boolean[].class);

  registerAlias("_byte", byte.class);
  registerAlias("_long", long.class);
  registerAlias("_short", short.class);
  registerAlias("_int", int.class);
  registerAlias("_integer", int.class);
  registerAlias("_double", double.class);
  registerAlias("_float", float.class);
  registerAlias("_boolean", boolean.class);

  registerAlias("_byte[]", byte[].class);
  registerAlias("_long[]", long[].class);
  registerAlias("_short[]", short[].class);
  registerAlias("_int[]", int[].class);
  registerAlias("_integer[]", int[].class);
  registerAlias("_double[]", double[].class);
  registerAlias("_float[]", float[].class);
  registerAlias("_boolean[]", boolean[].class);

  registerAlias("date", Date.class);
  registerAlias("decimal", BigDecimal.class);
  registerAlias("bigdecimal", BigDecimal.class);
  registerAlias("biginteger", BigInteger.class);
  registerAlias("object", Object.class);

  registerAlias("date[]", Date[].class);
  registerAlias("decimal[]", BigDecimal[].class);
  registerAlias("bigdecimal[]", BigDecimal[].class);
  registerAlias("biginteger[]", BigInteger[].class);
  registerAlias("object[]", Object[].class);

  registerAlias("map", Map.class);
  registerAlias("hashmap", HashMap.class);
  registerAlias("list", List.class);
  registerAlias("arraylist", ArrayList.class);
  registerAlias("collection", Collection.class);
  registerAlias("iterator", Iterator.class);

  registerAlias("ResultSet", ResultSet.class);
}
```

好刺激啊，这么一大段代码，不过看起来还是比较清晰明了的，这不就是 MyBatis 常用类型么，并给它们都起了一个各自的别名存起来，用来解析的时候使用。

## Configuration 的标签以及使用

说完了 Configuration 的创建，我们不直接切入初始化的主题，先来吃点甜点

还记得你是如何搭建一个 MyBatis 项目么？其中很关键的是不是有一个叫做` mybatis-config.xml`的这么一个配置？

这个配置就是 `<configuration>` 标签存在的意义了。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607093535373-1804034848.png)

我在最外侧写了一个 configuration 标签，然后 dtd 语言约束就给我提示这么多属性可以设置，它们都是属于 Configuration 内的标签，那么这些标签都是啥呢？别急，慢慢来，掌握好频率和节奏还有力度，别太猛，年轻人要沉稳。

我不想按着标签的顺序来了，请跟好我的节奏。

首先很重要的两个属性就是 `properties` 和 `environments` ，properties 就是外部属性配置，你可以这么配置它

```java
<properties resource="config.properties" />
```

导入外部配置文件，`config.properties `文件中是一系列关于数据库的配置，给你举个例子吧，看你着急的

```properties
jdbc.driver=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/kkb
jdbc.username=root
jdbc.password=123456
```

载入外部属性配置后，需要配置 `environments` 标签，它可以配置事务管理、数据源、读取配置文件等

```xml
<environments default="development">
  <environment id="development">
    <transactionManager type="JDBC"/>
    <dataSource type="POOLED">
      <property name="driver" value="${jdbc.driver}"/>
      <property name="url" value="${jdbc.url}"/>
      <property name="username" value="${jdbc.username}"/>
      <property name="password" value="${jdbc.password}"/>
    </dataSource>
  </environment>
</environments>
```

明白否？

还有一个很关键的配置就是 `mapper` 标签，你可以把它理解为 `ComponentScan `，ComponentScan 完成的是 Bean 定义的查找，而 mapper 完成的是 接口的查找，该接口要与对应的 XML 命名空间相匹配才可以。例如

```xml
<mappers>
  <package name="com.mybatis.dao"/>
</mappers>
```

再继续深入，来看一下 `<setting>` 都需要哪些内容，你可以设置下面这些，下面这些配置有些多，你可以查看(http://www.mybatis.org/mybatis-3/zh/configuration.html#settings) 来具体查看这些配置。

```java
<settings>
	// 全局地开启或关闭配置文件中的所有映射器已经配置的任何缓存。
  <setting name="cacheEnabled" value="true"/>
  
  // 延迟加载的全局开关。当开启时，所有关联对象都会延迟加载。 特定关联关系中可通过设置 fetchType 属性来覆盖该项的开关状态。
  <setting name="lazyLoadingEnabled" value="true"/>
  
  // 是否允许单一语句返回多结果集（需要驱动支持）。
  <setting name="multipleResultSetsEnabled" value="true"/>
  
  // 使用列标签代替列名。不同的驱动在这方面会有不同的表现，具体可参考相关驱动文档或通过测试这两种不同的模式来观察所用驱动的结果。
  <setting name="useColumnLabel" value="true"/>
  
  // 允许 JDBC 支持自动生成主键，需要驱动支持。 如果设置为 true 则这个设置强制使用自动生成主键，尽管一些驱动不能支持但仍可正常工作（比如 Derby）。
  <setting name="useGeneratedKeys" value="false"/>
  
  // 指定 MyBatis 应如何自动映射列到字段或属性。 NONE 表示取消自动映射；PARTIAL 只会自动映射没有定义嵌套结果集映射的结果集。 FULL 会自动映射任意复杂的结果集（无论是否嵌套）。
  <setting name="autoMappingBehavior" value="PARTIAL"/>
  
  // 指定发现自动映射目标未知列（或者未知属性类型）的行为。
  // NONE: 不做任何反应
  // WARNING: 输出提醒日志 ('org.apache.ibatis.session.AutoMappingUnknownColumnBehavior' 的日志等级必须设置为 WARN)
  // FAILING: 映射失败 (抛出 SqlSessionException)
  <setting name="autoMappingUnknownColumnBehavior" value="WARNING"/>
  
  // 配置默认的执行器。SIMPLE 就是普通的执行器；REUSE 执行器会重用预处理语句（prepared statements）； BATCH 执行器将重用语句并执行批量更新。
  <setting name="defaultExecutorType" value="SIMPLE"/>
  
  // 设置超时时间，它决定驱动等待数据库响应的秒数。
  <setting name="defaultStatementTimeout" value="25"/>
  
  // 为驱动的结果集获取数量（fetchSize）设置一个提示值。此参数只可以在查询设置中被覆盖。
  <setting name="defaultFetchSize" value="100"/>
  
  // 允许在嵌套语句中使用分页（RowBounds）。如果允许使用则设置为 false
  <setting name="safeRowBoundsEnabled" value="false"/>
  
  // 是否开启自动驼峰命名规则（camel case）映射，即从经典数据库列名 A_COLUMN 到经典 Java 属性名 aColumn 的类似映射。
  <setting name="mapUnderscoreToCamelCase" value="false"/>
  
  // MyBatis 利用本地缓存机制（Local Cache）防止循环引用（circular references）和加速重复嵌套查询。 默认值为 SESSION，这种情况下会缓存一个会话中执行的所有查询。 若设置值为 STATEMENT，本地会话仅用在语句执行上，对相同 SqlSession 的不同调用将不会共享数据
  <setting name="localCacheScope" value="SESSION"/>
  
  // 当没有为参数提供特定的 JDBC 类型时，为空值指定 JDBC 类型。 某些驱动需要指定列的 JDBC 类型，多数情况直接用一般类型即可，比如 NULL、VARCHAR 或 OTHER。
  <setting name="jdbcTypeForNull" value="OTHER"/>
  
  // 指定哪个对象的方法触发一次延迟加载。
  <setting name="lazyLoadTriggerMethods" value="equals,clone,hashCode,toString"/>
</settings>
```

你知道 Oracle 和 MySQL 都可以对表，字段设置别名吗？MyBatis 也可以设置别名，采用的是 `typeAliases` 属性，比如

```xml
<!-- 为每一个实体类设置一个具体别名 -->
<typeAliases>
  <typeAlias type="com.kaikeba.beans.Dept" alias="Dept"/>
</typeAliases>

<!-- 为当前包下的每一个类设置一个默认别名 -->
<typeAliases>
  <package name="com.mybatis.beans"/>
</typeAliases>
```

MyBatis 可以根据不同的数据库厂商执行不同的语句，这种多厂商的支持是基于映射语句中的 `databaseId` 属性。 MyBatis 会加载不带 `databaseId` 属性和带有匹配当前数据库 `databaseId` 属性的所有语句。 如果同时找到带有 `databaseId` 和不带 `databaseId` 的相同语句，则后者会被舍弃。 为支持多厂商特性只要像下面这样在 mybatis-config.xml 文件中加入 `databaseIdProvider` 即可：

```xml
<databaseIdProvider type="DB_VENDOR" />
```

DB_VENDOR 对应的 databaseIdProvider 实现会将 databaseId 设置为 `DatabaseMetaData#getDatabaseProductName()` 返回的字符串。 由于通常情况下这些字符串都非常长而且相同产品的不同版本会返回不同的值，所以你可能想通过设置属性别名来使其变短，如下：

```xml
<databaseIdProvider type="DB_VENDOR">
  <property name="SQL Server" value="sqlserver"/>
  <property name="DB2" value="db2"/>
  <property name="Oracle" value="oracle" />
</databaseIdProvider>
```

MyBatis 每次创建结果对象的新实例时，它都会使用一个对象工厂（ObjectFactory）实例来完成。 默认的对象工厂需要做的仅仅是实例化目标类，要么通过默认构造方法，要么在参数映射存在的时候通过参数构造方法来实例化。 如果想覆盖对象工厂的默认行为，则可以通过创建自己的对象工厂来实现。比如：

```java
// ExampleObjectFactory.java
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

```xml
<!-- mybatis-config.xml -->
<objectFactory type="org.mybatis.example.ExampleObjectFactory">
  <property name="someProperty" value="100"/>
</objectFactory>
```

ObjectFactory 的作用就很像是 Spring 中的 FactoryBean ，如果不是很了解关于 FactoryBean 的讲解，请移步至

（https://mp.weixin.qq.com/s/aCFzCopCX1mK6Zg-dT_KgA) 进行了解

MyBatis 留给开发人员的后门是可以进行插件开发的，插件开发在何处体现呢？其实 MyBatis 四大组件都会有体现， MyBatis 的插件开发其实也是代理的一种应用，如图

Configuration.java

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607093556580-1427882738.png)

这是 Executor 插件开发的调用位置，那么 StatementHandler, ParameterHandler, ResultSetHandler 的调用和 Executor 基本一致，如图

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607093604614-173141334.png)

过 MyBatis 提供的强大机制，使用插件是非常简单的，只需实现 Interceptor 接口，并指定想要拦截的方法签名即可。例如官网的这个例子

```java
// ExamplePlugin.java
@Intercepts({@Signature(
  type= Executor.class,
  method = "update",
  args = {MappedStatement.class,Object.class})})
public class ExamplePlugin implements Interceptor {
  private Properties properties = new Properties();
  public Object intercept(Invocation invocation) throws Throwable {
    // implement pre processing if need
    Object returnObject = invocation.proceed();
    // implement post processing if need
    return returnObject;
  }
  public void setProperties(Properties properties) {
    this.properties = properties;
  }
}
```

只需要再把这个插件告诉 MyBatis， 这里有个插件拦截器，记得用奥

```xml
<!-- mybatis-config.xml -->
<plugins>
  <plugin interceptor="org.mybatis.example.ExamplePlugin">
    <property name="someProperty" value="100"/>
  </plugin>
</plugins>
```

`typeHandlers` 也叫做类型转换器，主要用在参数转换的地方，哪里进行参数转换呢？其实有两点：

* PreparedStatementHandler 在解析 SQL 参数，进行参数设置的时候，需要把 Java Type 转换为 JDBC 类型
* ResultSetHandler 返回的结果集，需要把 JDBC 类型转换为 Java Type 

可以编写自己的类型转换器，如下：

```java
// ExampleTypeHandler.java
@MappedJdbcTypes(JdbcType.VARCHAR)
public class ExampleTypeHandler extends BaseTypeHandler<String> {

  @Override
  public void setNonNullParameter(PreparedStatement ps, int i, String parameter, JdbcType jdbcType) throws SQLException {
    ps.setString(i, parameter);
  }

  @Override
  public String getNullableResult(ResultSet rs, String columnName) throws SQLException {
    return rs.getString(columnName);
  }

  @Override
  public String getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
    return rs.getString(columnIndex);
  }

  @Override
  public String getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
    return cs.getString(columnIndex);
  }
}
```

也需要告诉 MyBatis ，这里面有个参数转换器，别忘了转换！

```xml
<!-- mybatis-config.xml -->
<typeHandlers>
  <typeHandler handler="org.mybatis.example.ExampleTypeHandler"/>
</typeHandlers>
```

## Configuration 标签的解析

现在有了上面的这些标签的定义，应该在哪解析呢？就好比合适的人在合适的岗位才能创造出最大的价值一样。

现在就需要续上 SqlSessionFactoryBuilder 的第三步了， Configuration 的解析工作

在 XMLConfigBuilder 中

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607093618338-295810915.png)

这是不是就和上面的标签对应起来了？解析工作是在这里进行的，这也是一种好的编码习惯，一个方法只做一件事情，应该多多借鉴这种写法。

## Configuration 子标签的源码分析

假如你能从上向下看到这里，就说明你对这篇文章产生了浓厚的兴趣，恭喜你，你的段位又升级了。我不打王者荣耀，我之前一直打魔兽solo，solo是很需要手速的，同时也需要考虑到各种因素：比如你是 ORC(兽族)，你的 BM(剑圣) 开 W(疾风步) 抢怪的时间要掌握好，你骚扰 NE (暗夜精灵) 采木材的时间要掌握好，抢宝的时间要掌握好，比如你玩的是 Turtle Rock(龟岛)，你单刷蓝胖的时间也要算好，等等等等。

你既要sky的中规中矩，你也要MOON的不羁，你还要fly100%的沉稳，你也需要TED的坚持。也就印证了一句话，小孩子才做选择，成年人都要！

所以你不仅仅要知其果，还要懂其因。

### 第一步：Properties 解析

第一个方法: `propertiesElement(root.evalNode("properties"))`，点进去可以看到其源码，我这里已经做了注释，方便你去理解

```java
// 其实一个个 <> 的标签就是 一个个的XNode节点
  private void propertiesElement(XNode context) throws Exception {
    if (context != null) {
      // 首先判断要解析的属性是否有无子节点
      Properties defaults = context.getChildrenAsProperties();

      // 解析<properties resource=""/> 解析完成就变为配置文件的 SimpleName
      String resource = context.getStringAttribute("resource");

      // 解析<properties url=""/>
      String url = context.getStringAttribute("url");

      // 如果都为空，抛出异常
      if (resource != null && url != null) {
        throw new BuilderException("The properties element cannot specify both a URL and a resource based property file reference.  Please specify one or the other.");
      }

      // 如果不为空的话，就把配置文件的内容都放到 Resources 类中
      if (resource != null) {
        defaults.putAll(Resources.getResourceAsProperties(resource));
      } else if (url != null) {
        defaults.putAll(Resources.getUrlAsProperties(url));
      }
      
      // 这块应该是判断有无之前的配置
      Properties vars = configuration.getVariables();
      if (vars != null) {
        defaults.putAll(vars);
      }
      parser.setVariables(defaults);
      // 最后放入 configuration 属性中
      configuration.setVariables(defaults);
    }
  }
```

### 第二步：Settings 解析

在这里我们以二级缓存的开启为例来做解析

```xml
<!-- 通知 MyBatis 框架开启二级缓存 -->
<settings>
  <setting name="cacheEnabled" value="true"/>
</settings>
```

那么它在`settingsAsProperties(root.evalNode("settings"))` 中是如何解析的呢？

```java
// XNode 就是一个个的 标签
private Properties settingsAsProperties(XNode context) {
  if (context == null) {
    return new Properties();
  }
  // 获取字标签，字标签也就是 <settings> 中的 <setting>
  Properties props = context.getChildrenAsProperties();
  // Check that all settings are known to the configuration class
  // 用反射确保所有的设置都在 Configuration 类中。
  MetaClass metaConfig = MetaClass.forClass(Configuration.class, localReflectorFactory);
  for (Object key : props.keySet()) {
    // 如果反射没有确保这个key 在类中，就抛出异常
    if (!metaConfig.hasSetter(String.valueOf(key))) {
      throw new BuilderException("The setting " + key + " is not known.  Make sure you spelled it correctly (case sensitive).");
    }
  }
  return props;
}
```

解析完成后的 `settings` 对象，底层是用 Hashtable 存储了一个个的 entry 对象。
![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607093635171-1827204427.png)

### 第三步：TypeAliases 解析

TypeAliases 用于别名注册，你可以为实体类指定它的别名，源码如下

```java
private void typeAliasesElement(XNode parent) {
  if (parent != null) {
    // 也是首先判断有无子标签
    for (XNode child : parent.getChildren()) {
      // 如果有字标签，那么取出字标签的属性名，如果是 package
      if ("package".equals(child.getName())) {
        // 那么取出 字标签 的name属性
        String typeAliasPackage = child.getStringAttribute("name");
        configuration.getTypeAliasRegistry().registerAliases(typeAliasPackage);
      } else {

        // typeAliases 下面有两个标签，一个是 package 一个是 TypeAlias
        String alias = child.getStringAttribute("alias");
        String type = child.getStringAttribute("type");
        try {
          Class<?> clazz = Resources.classForName(type);
          if (alias == null) {
            typeAliasRegistry.registerAlias(clazz);
          } else {
            typeAliasRegistry.registerAlias(alias, clazz);
          }
        } catch (ClassNotFoundException e) {
          throw new BuilderException("Error registering typeAlias for '" + alias + "'. Cause: " + e, e);
        }
      }
    }
  }
}
```

### 第四步：Plugins 解析

MyBatis 中的插件都在这一步进行解析注册

```java
private void pluginElement(XNode parent) throws Exception {
  if (parent != null) {
    for (XNode child : parent.getChildren()) {
      // 取出 interceptor 的名称
      String interceptor = child.getStringAttribute("interceptor");
      Properties properties = child.getChildrenAsProperties();
      // 生成新实例，设置属性名
      Interceptor interceptorInstance = (Interceptor) resolveClass(interceptor).newInstance();
      interceptorInstance.setProperties(properties);
      // 添加到 configuration 中
      configuration.addInterceptor(interceptorInstance);
    }
  }
}
```

### 其他步骤

其实后面的源码分析步骤都差不多，大体上都是判断有无此 XNode 节点，然后判断它的子节点标签，得到标签的属性，放入 Configuration 对象中，这样就完成了 Configuration 对象的初始化，其实你可以看出，MyBatis 中的 Configuration 也是一个大的容器，来为后面的SQL语句解析和初始化提供保障。

## 总结

本文主要概括了

*  Configuration 的创建过程

SqlSessionFactoryBuilder 创建 XMLConfigBuilder ，XMLConfigBuilder 再创建 Configuration ， Configuration 的创建会装载一些基本属性，如事务，数据源，缓存，日志，代理等，它们由 TypeAliasRegistry 进行注册，而TypeAliasRegistry 初始化也注册了一些基本数据类型，map，list，collection等，Configuration 还初始化了其他很多属性，由此完成 Configuration 的创建。

* Configuration 的标签以及使用

此步骤分析了 Configuration 中的标签以及使用，此部分不用去记忆，只知道有哪几个比较重要的标签就可以了，比如： properties， environment，mappers，settings，typeHandler，如果有开发需求直接查找官网就好

(http://www.mybatis.org/mybatis-3/zh/configuration.html)

* Configuration 对标签的解析

此步骤分析了 XMLConfigBuilder 对 Configuration 类下所有标签的解析工作，解析工作大部分模式都差不多

大体上都是判断有无此 XNode 节点，然后判断它的子节点标签，得到标签的属性，放入 Configuration 对象中。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)






# MyBatis 基础搭建及架构概述

* [MyBatis 基础搭建及架构概述](#mybatis-基础搭建及架构概述)
   * [MyBatis 是什么？](#mybatis-是什么)
   * [MyBatis 项目构建](#mybatis-项目构建)
   * [MyBatis 整体架构](#mybatis-整体架构)
      * [接口层](#接口层)
      * [数据处理层](#数据处理层)
      * [基础支持层](#基础支持层)

## MyBatis 是什么？

MyBatis是第一个支持自定义SQL、存储过程和高级映射的类持久框架。MyBatis消除了大部分JDBC的样板代码、手动设置参数以及检索结果。MyBatis能够支持简单的XML和注解配置规则。使Map接口和POJO类映射到数据库字段和记录。

下面我们通过一个简单的项目搭建来带你认识一下MyBatis的使用和一些核心组件的讲解。

## MyBatis 项目构建

为了快速构建一个MyBatis项目，我们采用SpringBoot快速搭建的方式。搭建好后在对应的pom.xml下添加如下的maven依赖，主要作用在于引入mybatis一些jar包和类库

主要分为四个步骤：

1. 快速构建项目，引入核心maven dependency依赖
2. 构建POJO类和接口式编程的 Mapper类，编写SQL语句
3. 编写`config.properties`数据库驱动等配置
4. 构建Mybatis核心配置文件即`mybatis-config.xml`，引入数据库驱动，映射Mapper类
5. 编写Junit单元测试类

```xml
<!-- mybatis 核心依赖-->
<dependency>
  <groupId>org.mybatis</groupId>
  <artifactId>mybatis</artifactId>
  <version>3.4.6</version>
</dependency>
<!-- 数据库驱动包 -->
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <version>5.1.25</version>
</dependency>
<!-- 单元测试包-->
<dependency>
  <groupId>junit</groupId>
  <artifactId>junit</artifactId>
  <version>4.12</version>
  <scope>test</scope>
</dependency>
```

**为了便于更好的说明文章的主旨，这里就不贴出全部代码了，会贴出核心代码部分**

编写对应的POJO类和接口式编程Mapper类，这里我们以部门业务逻辑为例，构建一个部门类，有三个属性即部门编号、部门名称、位置，下面是部分代码：

Dept.java

```java
package com.mybatis.beans;
public class Dept {
  
    private Integer deptNo;
    private String  dname;
    private String  loc;
  
    public Dept() {}
    public Dept(Integer deptNo, String dname, String loc) {
        this.deptNo = deptNo;
        this.dname = dname;
        this.loc = loc;
    }
		get and set...
}
```

MyBatis最核心的功能之一就是接口式编程，它可以让我们编写Mapper接口和XML文件，从而把参数和返回结果映射到对应的字段中。

DeptDao.java

```java
package com.mybatis.dao;
public interface DeptDao {

  	// 通过部门名称查询
    public Dept findByDname(String Dname);
  	// 通过部门编号查询
    public Dept findByDeptNo(Integer deptno);
}
```

在/resources 下新建com.mybatis.dao 包，在其内编写对应的XML配置文件，此XML配置文件和Mapper互为映射关系。

```xml
<mapper namespace="com.mybatis.dao.DeptDao" >

    <sql id="DeptFindSql">
     select * from dept
  	</sql>
  
    <select id="findByDeptNo" resultType="com.mybatis.beans.Dept">
        <include refid="DeptFindSql"></include>
        where deptno = #{deptNo}
    </select>

    <select id="findByDname" resultType="com.mybatis.beans.Dept">
        <include refid="DeptFindSql"></include>
        where dname = #{dname}
    </select>

</mapper>
```

> 上述的<mapper namespace> 就是映射到Mapper接口类的命名空间
>
> `<select>`标签用于编写查询语句，查询完成之后需要把结果映射到对象或者map集合等，需要用到`resultType`属性指定对应的结果集。
>
> 上述采用了<sql>和<include>的标签写法，为了方便的映射到实体类，需要修改的话统一修改即可，降低耦合性。

构建完成基础的SQL语句和映射之后，下面来构建MySQL数据库驱动，在/resources 下创建`config.properties`类

```properties
jdbc.driver=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/test
jdbc.username=root
jdbc.password=123456
```

在/resources 下编写MyBatis核心配置文件`myBatis-config.xml`，引入数据库驱动，映射Mapper类

```xml
<configuration>
    <!-- 设置导入外部properties文件位置 -->
    <properties resource="config.properties"></properties>
  
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

    <mappers>
        <package name="com.mybatis.dao"/>
    </mappers>
</configuration>
```

configuration 标签很像是Spring 中的 beans 标签或者是基于注解的配置@Configuration，也就是MyBatis的核心配置环境，使用 properties 标签引入外部属性环境，也就是数据库驱动配置，使用 mappers 映射到Mapper所在的包，这里指的就是DeptDao.java所在的包。

在test包下面新建一个Junit单元测试类，主要流程如下：

![](https://img2018.cnblogs.com/blog/1515111/201907/1515111-20190711211106328-1995364609.png)


MyBatisTest.java 代码如下：

```java
public class MyBatisTest {

    private SqlSession sqlSession;


    /**
     * 读取配置文件，创建SQL工厂，打开会话
     * @throws Exception
     */
    @Before
    public void start() throws Exception{
        InputStream is = Resources.getResourceAsStream("myBatis-config.xml");
        SqlSessionFactoryBuilder builder = new SqlSessionFactoryBuilder();
        SqlSessionFactory factory = builder.build(is);
        sqlSession = factory.openSession();
    }

    /**
     * 销毁会话
     */
    @After
    public void destroy() {
        if(sqlSession != null){
            sqlSession.close();
        }
    }

    @Test
    public void test(){
        DeptDao deptDao = sqlSession.getMapper(DeptDao.class);
        Dept dept = deptDao.findByDeptNo(1);
        System.out.println(dept.getDname());
    }
}
```

@Before 和 @After 是junit工具包中的类，@Before在执行@Test 测试其主要业务之前加载，@After 在执行@Test 测试完成之后加载。

整体结构如下：

![](https://img2018.cnblogs.com/blog/1515111/201907/1515111-20190711211118999-442629122.png)


## MyBatis 整体架构

MyBatis的架构大概是这样的，最上面是接口层，接口层就是开发人员在Mapper或者是Dao接口中的接口定义，是查询、新增、更新还是删除操作；中间层是数据处理层，主要是配置Mapper -> xml层级之间的参数映射，SQL解析，SQL执行，结果映射的过程。上述两种流程都由基础支持层来提供功能支撑，基础支持层包括连接管理，事务管理，配置加载，缓存处理。

![](https://img2018.cnblogs.com/blog/1515111/201907/1515111-20190711211129175-735051272.png)


### 接口层

在不与Spring 集成的情况下，使用MyBatis执行数据库的操作主要如下：

```java
InputStream is = Resources.getResourceAsStream("myBatis-config.xml");
SqlSessionFactoryBuilder builder = new SqlSessionFactoryBuilder();
SqlSessionFactory factory = builder.build(is);
sqlSession = factory.openSession();
```

其中的`SqlSessionFactory`,`SqlSession`是MyBatis接口的核心类，尤其是SqlSession，这个接口是MyBatis中最重要的接口，这个接口能够让你执行命令，获取映射，管理事务。

### 数据处理层

1. **配置解析**

在Mybatis初始化过程中，会加载mybatis-config.xml配置文件、映射配置文件以及Mapper接口中的注解信息，解析后的配置信息会形成相应的对象并保存到Configration对象中。之后，根据该对象创建SqlSessionFactory对象。待Mybatis初始化完成后，可以通过SqlSessionFactory创建SqlSession对象并开始数据库操作。

2. **SQL解析与scripting模块**

Mybatis实现的动态SQL语句，几乎可以编写出所有满足需要的SQL。

Mybatis中scripting模块会根据用户传入的参数，解析映射文件中定义的动态SQL节点，形成数据库能执行的sql语句。

3. **SQL执行**

SQL语句的执行涉及多个组件，包括MyBatis的四大神器，它们是: `Executor`、`StatementHandler`、`ParameterHandler`、`ResultSetHandler`。SQL的执行过程可以

用下面这幅图来表示

![](https://img2018.cnblogs.com/blog/1515111/201907/1515111-20190711211141401-1603044279.png)


MyBatis层级结构各个组件的介绍(这里只是简单介绍，具体介绍在后面)：

- **SqlSession:  MyBatis核心API，主要用来执行命令，获取映射，管理事务。接收开发人员提供Statement Id 和参数.并返回操作结果**
- **Executor: 执行器，是MyBatis调度的核心，负责SQL语句的生成以及查询缓存的维护**
- **StatementHandler:  封装了JDBC Statement操作，负责对JDBC statement 的操作，如设置参数、将Statement结果集转换成List集合。**
- **ParameterHandler:  负责对用户传递的参数转换成JDBC Statement 所需要的参数**
- **ResultSetHandler: 负责将JDBC返回的ResultSet结果集对象转换成List类型的集合**
- **TypeHandler:  用于Java类型和jdbc类型之间的转换**
- **MappedStatement: 动态SQL的封装**
- **SqlSource:  表示从XML文件或注释读取的映射语句的内容，它创建将从用户接收的输入参数传递给数据库的SQL。**
- **Configuration:  MyBatis所有的配置信息都维持在Configuration对象之中**

### 基础支持层

该层保护mybatis的基础模块，它们为核心处理层提供了良好的支撑。

**(1）反射模块**

Mybatis中的反射模块，对Java原生的反射进行了很好的封装，提供了简易的API，方便上层调用，并且对反射操作进行了一系列的优化，比如，缓存了类的元数据（MetaClass）和对象的元数据（MetaObject），提高了反射操作的性能。

**（2）类型转换模块**

Mybatis的别名机制，是为了简化配置文件的，该机制是类型转换模块的主要功能之一。类型转换模块的另一个功能是实现JDBC类型与Java类型间的转换。该功能在SQL语句绑定实参和映射查询结果集时都会涉及。在SQL语句绑定实参时，会将数据有Java类型转换成JDBC类型；在映射结果集时，会将数据有JDBC类型转换成Java类型。

**（3）日志模块**

Java世界里，有很多优秀的日志框架，如Log4j、Log4j2、slf4j等。Mybatis除了提供了详细的日志输出信息，还能够集成多种日志框架，其日志模块的主要功能就是集成第三方日志框架。

**（4）资源加载模块**

该模块主要封装了类加载器，确定了类加载器的使用顺序，并提供了加载类文件和其它资源文件的功能。

**（5） 解析器模块**

该模块有两个主要功能：一个是封装了XPath，为Mybatis初始化时解析mybatis-config.xml配置文件以及映射配置文件提供支持；另一个为处理动态SQL语句中的占位符提供支持。

**（6）数据源模块**

在数据源模块中，Mybatis自身提供了相应的数据源实现，也提供了与第三方数据源集成的接口。数据源是开发中的常用组件之一，很多开源的数据源都提供了丰富的功能，如，连接池、检测连接状态等，选择性能优秀的数据源组件，对于提供ORM框架以及整个应用的性能都是非常重要的。

**（7）事务管理模块**

一般地，Mybatis与Spring框架集成，由Spring框架管理事务。但Mybatis自身对数据库事务进行了抽象，提供了相应的事务接口和简单实现。

**（8）缓存模块**

Mybatis中有一级缓存和二级缓存，这两级缓存都依赖于缓存模块中的实现。但是，需要注意，这两级缓存与Mybatis以及整个应用是运行在同一个JVM中的，共享同一块内存，如果这两级缓存中的数据量较大，则可能影响系统中其它功能，所以需要缓存大量数据时，优先考虑使用Redis、Memcache等缓存产品。

**（9）Binding模块**

在调用SqlSession相应方法执行数据库操作时，需要制定映射文件中定义的SQL节点，如果sql中出现了拼写错误，那就只能在运行时才能发现。为了能尽早发现这种错误，Mybatis通过Binding模块将用户自定义的Mapper接口与映射文件关联起来，系统可以通过调用自定义Mapper接口中的方法执行相应的SQL语句完成数据库操作，从而避免上述问题。注意，在开发中，我们只是创建了Mapper接口，而并没有编写实现类，这是因为Mybatis自动为Mapper接口创建了动态代理对象。有时，自定义的Mapper接口可以完全代替映射配置文件，但比如动态SQL语句啊等，还是写在映射配置文件中更好。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


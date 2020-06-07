# Spring 注解配置的基本要素

随着Spring的流行，我们经历过基于XML-Based 的配置，随着SpringBoot的流行，我们逐渐使用基于注解的配置替换掉了基于XML-Based的配置，那么你知道基于注解的配置的基础组件都是什么吗？都包括哪些要素？那么本节就来探讨一下。**注：本篇文章更多的是讨论Spring基于注解的配置一览，具体的技术可能没有那么深，请各位大佬见谅。**

探讨主题：

- 基础概念：@Bean 和 @Configuration 
- 使用AnnotationConfigApplicationContext 实例化Spring容器
- 使用@Bean 注解
- 使用@Configuration 注解
- 编写基于Java的配置
- Bean定义配置文件
- PropertySource 抽象类
- 使用@PropertySource
- 占位符的声明

## 基础概念：@Bean 和 @Configuration 

Spring中新的概念是支持@Bean注解 和 @Configuration 注解的类。@Bean 注解用来表明一个方法实例化，配置并且通过IOC容器初始化并管理一个新的对象。@Bean注解就等同于XML-Based中的`<beans/>`标签，并且扮演了相同的作用。你可以使用基于注解的配置@Bean 和 @Component，然而他们都用在@Configuration配置类中。

使用@Configuration 注解的主要作用是作为bean定义的类，进一步来说，@Configuration注解的类允许通过调用同类中的其他@Bean标注的方法来定义bean之间依赖关系。 如下所示：

新建一个maven项目(我一般都直接创建SpringBoot项目，比较省事)，创建`AppConfig`,`MyService`,`MyServiceImpl`类，代码如下：

```java
@Configuration
public class AppConfig {

    @Bean
    public MyService myService(){
        return new MyServiceImpl();
    }
}

public interface MyService {}
public class MyServiceImpl implements MyService {}
```

上述的依赖关系等同于XML-Based：

```xml
<beans>
	<bean id="myService",class="com.spring.annotation.service.impl.MyServiceImpl"/>
</beans>
```

## 使用AnnotationConfigApplicationContext 实例化Spring容器

AnnotationConfigApplicationContext 基于注解的上下文是Spring3.0 新添加的注解，它是`ApplicationContext`的一个具体实现，它可以接收`@Configuration`注解的类作为输入参数，还能接收使用JSR-330元注解的普通@Component类。

当提供了@Configuration 类作为输入参数时，@Configuration类就会注册作为bean的定义信息并且所有声明@Bean的方法也都会作为bean的定义信息。

当提供@Component和JSR-330 声明的类时，他们都会注册作为bean的定义信息，并且假设在必要时在这些类中使用诸如@Autowired或@Inject之类的注解

### 简单的构造

在某些基于XML-Based的配置，我们想获取上下文容器使用`ClassPathXmlApplicationContext`，现在你能够使用@Configuration 类来实例化AnnotationConfigApplicationContext。

在`MyService`中添加一个`printMessage()`方法，实现类实现对应的方法。新建测试类进行测试

```java
public class ApplicationTests {

    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        MyService service = context.getBean(MyService.class);
      	// printMessage() 输出something...
        service.printMessage();
    }
}
```

如前所述，AnnotationConfigApplicationContext不仅限于使用@Configuration类。 任何@Component或JSR-330带注释的类都可以作为输入提供给构造函数，如下例所示

```java
public class ApplicationTests {

    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(MyServiceImpl.class,Dependency1.class,Dependency2.class);
        MyService myService = context.getBean(MyService.class);
        myService.printMessage();
    }
}
```

### 使用register注册IOC容器

你可以实例化`AnnotationConfigApplicationContext`通过使用无参数的构造器并且使用`register`方法进行注册，它和`AnnotationConfigApplicationContext`带参数的构造器起到的效果相同。

```java
public class ApplicationTests {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
        ctx.register(AppConfig.class, OtherConfig.class);
        ctx.register(AdditionalConfig.class);
        ctx.refresh();
        MyService myService = ctx.getBean(MyService.class);
        System.out.println(ctx.getBean(OtherConfig.class));
        System.out.println(ctx.getBean(AdditionalConfig.class));
        myService.printMessage();
    }
}
```

> OtherConfig.class 和 AdditionalConfig.class 是使用@Component 标注的类。

### 允许scan()方法进行组件扫描

为了允许组件进行扫描，需要在@Configuration配置类添加`@ComponentScan()`注解，改造之前的`AdditionalConfig`类，如下：

```java
@Configuration
@ComponentScan(basePackages = "com.spring.annotation.config")
public class AdditionalConfig {}
```

@ComponentScan指定了基础扫描包位于**com.spring.annotation.config**下，所有位于该包范围内的bean都会被注册进来，交由Spring管理。它就等同于基于XML-Based的注解：

```java
<beans>
    <context:component-scan base-package="com.spring.annotation.config/>
</beans>
```

AnnotationConfigApplicationContext中的scan（）方法以允许相同的组件扫描功能，如以下示例所示：

```java
public static void main(String[] args) {
  AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
  ctx.scan("com.spring.annotation");
  ctx.refresh();
  MyService myService = ctx.getBean(MyService.class);
}
```

> 为什么说@Configuration用法和@Component都能够标注配置类？因为@Configuration的元注解就是@Component。
>
> ```java
> @Target({ElementType.TYPE})
> @Retention(RetentionPolicy.RUNTIME)
> @Documented
> @Component
> public @interface Configuration {
> String value() default "";
> }
> ```

### 使用AnnotationConfigWebApplicationContext支持web容器

AnnotationConfigApplicationContext的一个WebApplicationContext的变化是使用`AnnotationConfigWebApplicationContext`。配置Spring ContextLoaderListener的servlet监听器，Spring MVC的DispatcherServlet等时，可以使用此实现。以下web.xml代码段配置典型的Spring MVC Web应用程序（请注意context-param和init-param的使用）

```xml
<web-app>
  	<!-- 配置web上下文监听器使用 AnnotationConfigWebApplicationContext 而不是默认的
		XmlWebApplicationContext -->
    <context-param>
        <param-name>contextClass</param-name>
        <param-value>
            org.springframework.web.context.support.AnnotationConfigWebApplicationContext
        </param-value>
    </context-param>

  	<!-- 配置位置必须包含一个或多个以逗号或空格分隔的完全限定的@Configuration类。 也可以为组件扫描指定完全			限定的包-->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>com.spring.annotation.config.AdditionalConfig</param-value>
    </context-param>

  	<!--使用ContextLoaderListener像往常一样引导根应用程序上下文-->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

  	<!-- 定义一个SpringMVC 核心控制器 DispatcherServlet-->
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!-- 配置web上下文监听器使用 AnnotationConfigWebApplicationContext 而不是默认的
				XmlWebApplicationContext -->
        <init-param>
            <param-name>contextClass</param-name>
            <param-value>
                org.springframework.web.context.support.AnnotationConfigWebApplicationContext
            </param-value>
        </init-param>
        <!-- 配置位置必须包含一个或多个以逗号或空格分隔的完全限定的@Configuration类。 也可以为组件扫描指定					完全限定的包-->
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>com.spring.annotation.config.MvcConfig</param-value>
        </init-param>
    </servlet>

    <!-- 将/app/* 的所有请求映射到调度程序servlet -->
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/app/*</url-pattern>
    </servlet-mapping>
</web-app>
```

## 使用@Bean注解

@Bean 注解是一个方法级别的注解，能够替换XML-Based中的<bean/>标签，@Bean注解同样支持<bean>标签支持的属性，像是 `init-method`, `destroy-method`, `autowiring`。

### 定义一个Bean

与基础概念中Bean的定义相同，读者可以参考基础概念部分进行了解，我们不在此再进行探讨。

### Bean的依赖

@Bean 注解可以有任意数量的参数来构建其依赖项，例如

```java
public class MyService {
    private final MyRepository myRepository;
    public MyService(MyRepository myRepository) {
        this.myRepository = myRepository;
    }
    public String generateSomeString() {
        return myRepository.findString() + "-from-MyService";
    }
}

@Configuration
class MyConfiguration {
    @Bean
    public MyService myService() {
        return new MyService(myRepository());
    }
    @Bean
    public MyRepository myRepository() {
        return new MyRepository();
    }
}

public class MyRepository {
    public String findString() {
        return "some-string";
    }
}
```

### 接受生命周期回调

任何使用@Bean的注解都支持生命周期的回调，使用JSR-220提供的`@PostConstruct`和`@PreDestory`注解来实现。如果bean实现了`InitializingBean`,`DisposableBean`或者`Lifecycle`接口，他们的方法会由IOC容器回调。一些以Aware的实现接口(像是BeanFactoryAware,BeanNameAware, MessageSourceAware, ApplicationContextAware等)也支持回调。

@Bean注解支持特定的初始化和销毁方法，就像XML-Based中的`init-method`和 `destory-method`中的bean属性，下面这个例子证实了这一点

AppConfig.java

```java
@Configuration
public class AppConfig {

    @Bean(initMethod = "init")
    public BeanOne beanOne(){
        return new BeanOne();
    }

    @Bean(destroyMethod = "cleanup")
    public BeanTwo beanTwo(){
        return new BeanTwo();
    }
}

class BeanOne {
    public void init(){}
}

class BeanTwo {
    public void cleanup(){}
}
```

对于上面的例子，也可以手动调用init()方法，与上面的initMethod 方法等效

```java
@Bean
public BeanOne beanOne(){
  BeanOne beanOne = new BeanOne();
  beanOne.init();
  return beanOne;
}
```

当你直接使用Java开发时，你可以使用对象执行任何操作，并且不必总是依赖于容器生命周期。

### Bean的作用范围

Spring包括@Scope注解能够让你指定Bean的作用范围，Bean的Scope默认是单例的，也就是说@Bean标注的对象在IOC的容器中只有一个。你可以重写@Scope的作用范围，下面的例子说明了这一点，修改OtherConfig如下

OtherConfig.java

```java
@Configuration
public class OtherConfig {

    @Bean
    @Scope("prototype")
    public Dependency1 dependency1(){
        return new Dependency1();
    }
}
```

每次尝试获取dependency1这个对象的时候都会重新生成一个新的对象实例。下面是Scope的作用范围和解释：

| Scope       | Descriptionn                                                 |
| ----------- | ------------------------------------------------------------ |
| singleton   | 默认单例的bean定义信息，对于每个IOC容器来说都是单例对象      |
| prototype   | bean对象的定义为任意数量的对象实例                           |
| request     | bean对象的定义为一次HTTP请求的生命周期，也就是说，每个HTTP请求都有自己的bean实例，它是在单个bean定义的后面创建的。仅仅在web-aware的上下文中有效 |
| session     | bean对象的定义为一次HTTP会话的生命周期。仅仅在web-aware的上下文中有效 |
| application | bean对象的定义范围在ServletContext生命周期内。仅仅在web-aware的上下文中有效 |
| websocket   | bean对象的定义为WebSocket的生命周期内。仅仅在web-aware的上下文中有效 |

### @Scope和Scoped-proxy

Spring提供了一种通过scoped proxies与scoped依赖一起作用的方式。最简单的在XML环境中创建代理的方式是通过`<aop:scoped-proxy/>`标签。使用`@Scope`注解为在Java中配置bean提供了与proxyMode属性相同的功能。默认是不需要代理的(ScopedProxyMode.NO),但是你需要指定`ScopedProxyMode.TARGET_CLASS`或者`ScopedProxyMode.INTERFACES`。

### 自定义Bean名称

默认的情况下，配置类通过@Bean配置的默认名称(方法名第一个字母小写)进行注册和使用，但是你可以更换@Bean的name为你想指定的名称。修改AdditionalConfig 类

AdditionalConfig.java

```java
@Configuration
//@ComponentScan(basePackages = "com.spring.annotation.config")
public class AdditionalConfig {

    @Bean(name = "default")
    public Dependency2 dependency2(){
        return new Dependency2();
    }
}
```

### Bean的别名

有时候需要为单例的bean提供多个名称，也叫做Bean的别名。Bean注解的name属性接收一个Array数组。下面这个例子证实了这一点：

OtherConfig.java

```java
@Configuration
public class OtherConfig {

//    @Bean
//    @Scope("prototype")
//    public Dependency1 dependency1(){
//        return new Dependency1();
//    }

		@Bean({"dataSource", "dataSourceA", "dataSourceB"})
    public DataSource dataSource(){
			return null;
    }
}
```

### Bean的描述

有时，提供更详细的bean描述信息会很有帮助(但是开发很少使用到)。为了增加一个对@Bean的描述，你需要使用到@Description注解

OtherConfig.java

```java
@Configuration
public class OtherConfig {

//    @Bean
//    @Scope("prototype")
//    public Dependency1 dependency1(){
//        return new Dependency1();
//    }

//    @Bean({"dataSource", "dataSourceA", "dataSourceB"})
//    public DataSource dataSource(){
//        return null;
//    }

    @Bean
    @Description("此方法的bean名称为dependency1")
    public Dependency1 dependency1(){
        return new Dependency1();
    }
}

```

## 使用@Configuration注解

更多关于@Configuration 的详细说明，请你参考https://mp.weixin.qq.com/s/FLJTsT2bAru-w7cF4CG8kQ

已经把@Configuration的注解说明的比较详细了。

## 组成Java-Based环境配置的条件

Spring基于注解的配置能够允许你自定义注解，同时能够降低配置的复杂性。

### 使用@Import注解

就像在Spring XML文件中使用<import/> 元素来帮助模块化配置一样，@Import 注解允许从另一个配置类加载@Bean定义，如下所示

```java
@Configuration
public class ConfigA {

    @Bean
    public A a(){
        return new A();
    }
}

@Configuration
@Import(ConfigA.class)
public class ConfigB {

    @Bean
    public B b(){
        return new B();
    }
}
```

现在，在实例化上下文时，不需要同时指定ConfigA.class 和 ConfigB.class ，只需要显示提供ConfigB

```java
public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(ConfigB.class);
  
    A a = ctx.getBean(A.class);
    B b = ctx.getBean(B.class);
}
```

这种方法简化了容器实例化，因为只需要处理一个类，而不是要求你在构造期间记住可能大量的@Configuration类

### 有选择性的包含@Configuration 类和@Bean 方法

选择性的允许或者禁止@Configuration注解的类和@Bean注解的方法是很有用的，基于一些任意系统状态。一个常见的例子是只有在Spring环境中启用了特定的配置文件时才使用@Profile注释激活bean。

@Profile注解也实现了更灵活的注解@Conditional，@Conditional 注解表明在注册@Bean 之前应参考特定的Condition实现。

实现Condition接口就会提供一个matched方法返回true或者false

更多关于@Conditional 的示例，请参考 

https://www.cnblogs.com/cxuanBlog/p/10960575.html

### 结合Java与XML配置

Spring @Configuration类能够100%替换XML配置，但一些工具(如XML命名空间)仍旧是配置容器的首选方法，在这种背景下，使用XML使很方便的而且使刚需了。你有两个选择：使用以XML配置实例化容器为中心，例如：`ClassPathXmlApplicationContext`导入XML或者实例化以Java配置为中心的`AnnotationConfigApplicationContext`并提供`ImportResource`注解导入需要的XML配置。

### 将@Configuration声明为普通的bean元素

请记住，@Configuration类存放的是容器中的bean定义信息，下面的例子中，我们将会创建一个@Configuration类并且加载了外部xml配置。下面展示了一个普通的Java配置类

```java
@Configuration
public class AppConfig {

    @Autowired
    private DataSource dataSource;

    @Bean
    public AccountRepository accountRepository() {
        return new JdbcAccountRepository(dataSource);
    }

    @Bean
    public TransferService transferService() {
        return new TransferService(accountRepository());
    }
}
```

下面是`system-test-config.xml`配置类的一部分

```xml
<beans>
   	
  	<!--允许开启 @Autowired 或者 @Configuration-->
    <context:annotation-config/>
  	
 		<!-- 读取外部属性文件 -->
  	<!-- 更多关于属性读取的资料，参考 https://www.cnblogs.com/cxuanBlog/p/10927819.html -->
    <context:property-placeholder location="classpath:/com/spring/annotation/jdbc.properties"/>

    <bean class="com.spring.annotation.config.AppConfig"/>

    <bean class="org.springframework.jdbc.datasource.DriverManagerDataSource">
      	<property name="driverClassName" value="${jdbc.driverClassName}" />
        <property name="url" value="${jdbc.url}"/>
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
    </bean>
</beans>
```

引入jdbc.properties建立数据库连接

```properties
jdbc.driverClassName=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/sys
jdbc.username=root
jdbc.password=123456
```

```java
public static void main(String[] args) {
    ApplicationContext ctx = new ClassPathXmlApplicationContext("classpath:/com/spring/annotation/system-test-config.xml");
    TransferService transferService = ctx.getBean(TransferService.class);
    // ...
}
```

> 在`system-test-config.xml`中，AppConfig 对应的<bean/> 标签没有声明id属性，虽然这样做是可以接受的，但是没有必要，因为没有其他bean引用它，并且不太可能通过名称从容器中获取它。同样的，DataSource bean只是按类型自动装配，因此不严格要求显式的bean id。

### 使用<<context:component-scan/>> 挑选指定的@Configuration类

因为@Configuration的原注解是@Component，所以@Configuration注解的类也能用于组件扫描，使用与前一个示例中描述的相同的方案，我们可以重新定义system-test-config.xml以利用组件扫描。 请注意，在这种情况下，我们不需要显式声明`<context：annotation-config />`，因为`<context：component-scan />`启用相同的功能。

```xml
<beans>
   
    <context:component-scan base-package="com.spring.annotation"/>
    <context:property-placeholder location="classpath:/com/spring/annotation/jdbc.properties"/>

    <bean class="org.springframework.jdbc.datasource.DriverManagerDataSource">
      	<property name="driverClassName" value="${jdbc.driverClassName}" />
        <property name="url" value="${jdbc.url}"/>
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
    </bean>
</beans>
```

### @Configuration 类使用@ImportResource

在基于Java注解的配置类中，仍然可以使用少量的@ImportResource导入外部配置，最好的方式就是两者结合，下面展示了一下Java注解结合XML配置的示例

```java
@Configuration
@ImportResource("classpath:/com/spring/annotation/properties-config.xml")
public class AppConfig {

    @Value("${jdbc.driverClassName}")
  	private String driver;

    @Value("${jdbc.url}")
    private String url;

    @Value("${jdbc.username}")
    private String username;

    @Value("${jdbc.password}")
    private String password;

    @Bean
    public DataSource dataSource() {
        return new DriverManagerDataSource(url, username, password);
    }
}
```

Properties-config.xml

```xml
<beans>
    <context:property-placeholder location="classpath:/com/spring/annotation/jdbc.properties"/>
</beans>
```

jdbc.properties

```properties
jdbc.driverClassName=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/sys
jdbc.username=root
jdbc.password=123456
```

```java
public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
    TransferService transferService = ctx.getBean(TransferService.class);
    // ...
}
```



![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200603170009660-1820035470.png)



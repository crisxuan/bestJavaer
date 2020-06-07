# @Configuration 全部用法

现在大部分的项目都采用了基于注解的配置，采用了@Configuration 替换<beans> 标签的做法。但是最近在翻看Spring 官方文档时，发现@Configuration 声明为基础标签之外，还和大量的其他注解产生化学反应。

## @Configuration 基本说明

​		**定义：指示一个类声明一个或者多个@Bean 声明的方法并且由Spring容器统一管理，以便在运行时为这些bean生成bean的定义和服务请求的类。**例如：

```java

@Configuration
public class AppConfig {
  
  @Bean
  public MyBean myBean(){
    return new MyBean();
  }
}
```

上述AppConfig 加入@Configuration 注解，表明这就是一个配置类。有一个myBean()的方法，返回一个MyBean()的实例，并用@Bean 进行注释，表明这个方法是需要被Spring进行管理的bean。@Bean 如果不指定名称的话，默认使用`myBean`名称，也就是小写的名称。

#### 通过注解启动： 

通过启动一个AnnotationConfigApplicationContext 来引导这个@Configuration 注解的类，比如：

```java
AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
ctx.register(AppConfig.class);
ctx.refresh();
```

在web项目中，也可以使用`AnnotationContextWebApplicationContext `或者其他变体来启动。

新建一个SpringBoot项目(别问我为什么，因为这样创建项目比较快)。

* pom.xml 文件如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.5.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.spring.configuration</groupId>
    <artifactId>spring-configuration</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>spring-configuration</name>
    <description>Demo project for Spring Boot</description>

    <properties>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>5.0.6.RELEASE</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```

* 在config 包下新建一个**MyConfiguration**环境配置，和上面的示例代码相似，完整的代码如下：

```java
@Configuration
public class MyConfiguration {

    @Bean
    public MyBean myBean(){
        System.out.println("myBean Initialized");
        return new MyBean();
    }
}
```

>说明MyConfiguration 是一个配置类，能够在此类下面声明管理多个Bean，我们声明了一个`MyBean `的bean，希望它被容器加载和管理。

* 在pojo包下新建一个**MyBean**的类，具体代码如下

```java
public class MyBean {

    public MyBean(){
        System.out.println("generate MyBean Instance");
    }

    public void init(){
        System.out.println("MyBean Resources Initialized");
    }
}

```

* 新建一个**SpringConfigurationApplication**类，用来测试MyConfiguration类，具体代码如下：

```java
public class SpringConfigurationApplication {

    public static void main(String[] args) {
        
//        AnnotationConfigApplicationContext context = = new AnnotationConfigApplicationContext(MyConfiguration.class)
      	// 因为我们加载的@Configuration 是基于注解形式的，所以需要创建AnnotationConfigApplicationContext
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        // 注册MyConfiguration 类并刷新bean 容器。
        context.register(MyConfiguration.class);
        context.refresh();

    }

}
```

输出：

myBean Initialized
generate MyBean Instance

>从输出的结果可以看到，默认名称为myBean 的bean随着容器的加载而加载，因为**myBean**方法返回一个myBean的构造方法，所以myBean被初始化了。

#### 通过XML 的方式来启动

* 可以通过使用XML方式定义的`<context:annotation-config />`开启基于注解的启动，然后再定义一个MyConfiguration的bean，在/resources 目录下新建 application-context.xml 代码如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:context="http://www.springframework.org/schema/context"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="
      http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.2.xsd
      http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util-4.2.xsd
      http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.2.xsd"
>

    <!-- 相当于基于注解的启动类 AnnotationConfigApplicationContext-->
    <context:annotation-config />

    <bean class="com.spring.configuration.config.MyConfiguration"/>

</beans>
```

* 需要引入applicationContext.xml ，在SpringConfigurationApplication 需要进行引入，修改后的SpringConfigurationApplication如下：

```java
public class SpringConfigurationApplication {

    public static void main(String[] args) {

        ApplicationContext context = 
          new ClassPathXmlApplicationContext("applicationContext.xml");
    }
}
```

输出：

myBean Initialized
generate MyBean Instance

#### 基于ComponentScan() 来获取Bean的定义

@Configuration 使用@Component 进行原注解，因此@Configuration 类也可以被组件扫描到（特别是使用XML <context:component-scan> 元素）。

在这里认识几个注解: **@Controller, @Service, @Repository, @Component**

* `@Controller`: 表明一个注解的类是一个"Controller"，也就是控制器，可以把它理解为MVC 模式的Controller 这个角色。这个注解是一个特殊的@Component，允许实现类通过类路径的扫描扫描到。它通常与@RequestMapping 注解一起使用。
* `@Service`: 表明这个带注解的类是一个"Service"，也就是服务层，可以把它理解为MVC 模式中的Service层这个角色，这个注解也是一个特殊的@Component，允许实现类通过类路径的扫描扫描到

* `@Repository`: 表明这个注解的类是一个"Repository",团队实现了JavaEE 模式中像是作为"Data Access Object" 可能作为DAO来使用，当与 PersistenceExceptionTranslationPostProcessor 结合使用时，这样注释的类有资格获得Spring转换的目的。这个注解也是@Component 的一个特殊实现，允许实现类能够被自动扫描到
* `@Component`: 表明这个注释的类是一个组件，当使用基于注释的配置和类路径扫描时，这些类被视为自动检测的候选者。

也就是说，上面四个注解标记的类都能够通过@ComponentScan 扫描到，上面四个注解最大的区别就是使用的场景和语义不一样，比如你定义一个Service类想要被Spring进行管理，你应该把它定义为@Service 而不是@Controller因为我们从语义上讲，@Service更像是一个服务的类，而不是一个控制器的类，@Component通常被称作组件，它可以标注任何你没有严格予以说明的类，比如说是一个配置类，它不属于MVC模式的任何一层，这个时候你更习惯于把它定义为 @Component。@Controller，@Service，@Repository 的注解上都有@Component，所以这三个注解都可以用@Component进行替换。

来看一下代码进行理解：

* 定义五个类，类上分别用@Controller, @Service, @Repository, @Component, @Configuration 进行标注，分别如下

```java
@Component
public class UserBean {}

@Configuration
public class UserConfiguration {}

@Controller
public class UserController {}

@Repository
public class UserDao {}

@Service
public class UserService {}
```

* 在`MyConfiguration`上加上@ComponentScan 注解，扫描上面5个类所在的包位置。代码如下：

```java
@Configuration
@ComponentScan(basePackages = "com.spring.configuration.pojo")
public class MyConfiguration {

    @Bean
    public MyBean myBean(){
        System.out.println("myBean Initialized");
        return new MyBean();
    }
}
```

* 修改 SpringConfigurationApplication 中的代码，如下：

```java
public class SpringConfigurationApplication {

    public static void main(String[] args) {

//        AnnotationConfigApplicationContext context = = new AnnotationConfigApplicationContext(MyConfiguration.class)
//        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");

        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(MyConfiguration.class);
        context.refresh();

        // 获取启动过程中的bean 定义的名称
        for(String str : context.getBeanDefinitionNames()){
            System.out.println("str = " + str);
        }
        context.close();

    }
}
```

输出：

myBean Initialized
generate MyBean Instance
str = org.springframework.context.annotation.internalConfigurationAnnotationProcessor
str = org.springframework.context.annotation.internalAutowiredAnnotationProcessor
str = org.springframework.context.annotation.internalRequiredAnnotationProcessor
str = org.springframework.context.annotation.internalCommonAnnotationProcessor
str = org.springframework.context.event.internalEventListenerProcessor
str = org.springframework.context.event.internalEventListenerFactory
str = myConfiguration
str = userBean
str = userConfiguration
str = userController
str = userDao
str = userService
str = myBean

>由输出可以清楚的看到，上述定义的五个类成功被@ComponentScan 扫描到，并在程序启动的时候进行加载。

#### @Configuration 和 Environment 

​		@Configuration 通常和Environment 一起使用，通过@Environment 解析的属性驻留在一个或多个"属性源"对象中，@Configuration类可以使用@PropertySource，像Environment 对象提供属性源

* 为了便于测试，我们引入junit4和spring-test 的依赖，完整的配置文件如下

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.5.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.spring.configuration</groupId>
    <artifactId>spring-configuration</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>spring-configuration</name>
    <description>Demo project for Spring Boot</description>

    <properties>
        <java.version>1.8</java.version>
        <spring.version>5.0.6.RELEASE</spring.version>
        <spring.test.version>4.3.13.RELEASE</spring.test.version>
        <junit.version>4.12</junit.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${spring.version}</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-test</artifactId>
            <version>${spring.test.version}</version>
        </dependency>

        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>${junit.version}</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```

* 在config 包下定义一个 EnvironmentConfig 类，注入Environment 属性，完整代码如下：

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = EnvironmentConfig.class)
@Configuration
@PropertySource("classpath:beanName.properties")
public class EnvironmentConfig {

    @Autowired
    Environment env;

    @Test
    public void testReadProperty(){
        // 获取bean.name.controller 的属性
        System.out.println(env.getProperty("bean.name.controller"));
        // 判断是否包含bean.name.component
        System.out.println(env.containsProperty("bean.name.component"));
        // 返回与给定键关联的属性值
        System.out.println(env.getRequiredProperty("bean.name.service"));
    }
}
```

* 在/resources 目录下新建beanName.properties 文件，如下：

```properties
bean.name.configuration=beanNameConfiguration
bean.name.controller=beanNameController
bean.name.service=beanNameService
bean.name.component=beanNameComponent
bean.name.repository=beanNameRepository
```

启动并进行Junit测试，输出如下：

…..…...

beanNameController

true

beanNameService

…..…...

#### @Autowired 、 @Inject、@Resource 的区别

`@Inject`: 这是jsr330 的规范，通过AutowiredAnnotationBeanPostProcessor 类实现的依赖注入。位于javax.inject包内，是Java自带的注解。

```java
@Inject
@Named("environment")
Environment env;
```

>不加@Named注解，需要配置与变量名一致即可。

`@Autowired`: @Autowired 是Spring提供的注解，通过AutowiredAnnotationBeanPostProessor 类实现注入。位于org.springframework.beans.factory.annotation 包内，是Spring 中的注解

```java
@Autowired
Environment env;
```

>默认是通过byType 实现注入

`@Resource`: @Resource 是jsr250规范的实现，@Resource通过CommonAnnotationBeanPostProcessor 类实现注入。@Resource 一般会指定一个name属性，如下：

```java
@Resource(name = "environment")
Environment env;
```

>默认是通过byName 实现注入

区别：

@Autowired和@Inject基本是一样的，因为两者都是使用AutowiredAnnotationBeanPostProcessor来处理依赖注入。但是@Resource是个例外，它使用的是CommonAnnotationBeanPostProcessor来处理依赖注入。当然，两者都是BeanPostProcessor。

在介绍完上述三者的区别之后，可以对`Environment`的属性以上述注入方式进行改造

#### @Value、@PropertySource 和 @Configuration 

@Configuration 可以和@Value 和@PropertySource 一起使用读取外部配置文件，具体用法如下：

* 在config 包下新建一个`ReadValueFromPropertySource`类，代码如下

```java
@PropertySource("classpath:beanName.properties")
@Configuration
public class ReadValueFromPropertySource {

    @Value("bean.name.component")
    String beanName;

    @Bean("myTestBean")
    public MyBean myBean(){
        return new MyBean(beanName);
    }

}
```

>通过@PropertySource引入的配置文件，使@Value 能够获取到属性值，在给myBean()方法指定了一个名称叫做myTestBean。

* 修改MyBean类，增加一个name属性和一个构造器，再生成其toString() 方法

```java
public class MyBean {

    String name;

    public MyBean(String name) {
        this.name = name;
    }

    public MyBean(){
        System.out.println("generate MyBean Instance");
    }

    public void init(){
        System.out.println("MyBean Resources Initialized");
    }

    @Override
    public String toString() {
        return "MyBean{" +
                "name='" + name + '\'' +
                '}';
    }
}
```

* 在SpringConfigurationApplication中进行测试，如下

```java
public class SpringConfigurationApplication {

    public static void main(String[] args) {

      // 为了展示配置文件的完整性，之前的代码没有删除。
//        AnnotationConfigApplicationContext context = = new AnnotationConfigApplicationContext(MyConfiguration.class)
//        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");

//        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
//        context.register(MyConfiguration.class);
//        context.refresh();
//
//        // 获取启动过程中的bean 定义的名称
//        for(String str : context.getBeanDefinitionNames()){
//            System.out.println("str = " + str);
//        }
//        context.close();

        ApplicationContext context =
                new AnnotationConfigApplicationContext(ReadValueFromPropertySource.class);
        MyBean myBean = (MyBean) context.getBean("myTestBean");
        System.out.println("myBean = " + myBean);

    }
}
```

>使用Applicatio@InConntext 就能够获取myTestBean 这个bean，再生成myBean的实例。

输出：myBean = MyBean{name='bean.name.component'}

#### @Import 和 @Configuration

`@Import`的定义(来自于JavaDoc)：表明一个或者多个配置类需要导入，提供与Spring XML中<import/>相等的功能，允许导入@Configuration 、@ImportSelector、@ImportBeanDefinitionRegistar的实现，以及常规组件类似于AnnotationConfigApplicationContext。可能用于类级别或者是原注解。如果XML或者其他非@Configuration标记的Bean资源需要被导入的话，使用@ImportResource。下面是一个示例代码：

* 在pojo 包下新建两个配置类，分别是CustomerBo, SchedualBo

```java
@Configuration
public class CustomerBo {

    public void printMsg(String msg){
        System.out.println("CustomerBo : " + msg);
    }

    @Bean
    public CustomerBo testCustomerBo(){
        return new CustomerBo();
    }
}

@Configuration
public class SchedulerBo {

    public void printMsg(String msg){
        System.out.println("SchedulerBo : " + msg);
    }

    @Bean
    public SchedulerBo testSchedulerBo(){
        return new SchedulerBo();
    }
}
```

* 在config 包下新建一个AppConfig，导入CustomerBo 和 SchedulerBo 。

```java
@Configuration
@Import(value = {CustomerBo.class,SchedulerBo.class})
public class AppConfig {}
```

* 在config 包下新建一个ImportWithConfiguration ，用于测试@Import 和 @Configuration 的使用

```java
public class ImportWithConfiguration {

    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
        CustomerBo customerBo = (CustomerBo) context.getBean("testCustomerBo");
        customerBo.printMsg("System out println('get from customerBo')");

        SchedulerBo schedulerBo = (SchedulerBo) context.getBean("testSchedulerBo");
        schedulerBo.printMsg("System out println('get from schedulerBo')");
    }
}
```

输出：

CustomerBo : System out println('get from customerBo')
SchedulerBo : System out println('get from schedulerBo')

#### @Profile

`@Profile`: 表示当一个或多个@Value 指定的配置文件处于可用状态时，组件符合注册条件，可以进行注册。

**三种设置方式：**

* 可以通过ConfigurableEnvironment.setActiveProfiles()以编程的方式激活

* 可以通过AbstractEnvironment.ACTIVE_PROFILES_PROPERTY_NAME (spring.profiles.active )属性设置为

  JVM属性

* 作为环境变量，或作为web.xml 应用程序的Servlet 上下文参数。也可以通过@ActiveProfiles 注解在集成测试中以声明方式激活配置文件。

**作用域**

* 作为类级别的注释在任意类或者直接与@Component 进行关联，包括@Configuration 类

* 作为原注解，可以自定义注解
* 作为方法的注解作用在任何方法

**注意**:

​	如果一个配置类使用了Profile 标签或者@Profile 作用在任何类中都必须进行启用才会生效，如果@Profile({"p1","!p2"}) 标识两个属性，那么p1 是启用状态 而p2 是非启用状态的。

#### @ImportResource 和 @Configuration

`@ImportResource`: 这个注解提供了与@Import 功能相似作用，通常与@Configuration 一起使用，通过AnnotationConfigApplicationContext 进行启动，下面以一个示例来看一下具体用法：

* 在config下新建TestService 类，声明一个构造函数，类初始化时调用

```java
public class TestService {

    public TestService(){
        System.out.println("test @importResource success");
    }
}
```

* 在/resources 目录下新建 importResources.xml ，为了导入TestService

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:context="http://www.springframework.org/schema/context"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="
      http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.2.xsd
      http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util-4.2.xsd
      http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.2.xsd"
>

    <bean id = "testService" class="com.spring.configuration.config.TestService" />

</beans>
```

* 然后在config 下新建一个ImportResourceWithConfiguration， 用于读取配置文件

```java
@Configuration
@ImportResource("classpath:importResources.xml")
public class ImportResourceWithConfiguration {

    @Autowired
    private TestService service;

    public void getImportResource(){
        new TestService();
    }

    public static void main(String[] args) {
        AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(ImportResourceWithConfiguration.class);
        context.getBean("testService");

    }
}
```

输出：test @importResource success

#### @Configuration 嵌套

@Configuration注解作用在类上，就和普通类一样能够进行相互嵌套，定义内部类。

```java
// 来自JavaDoc
@Configuration
public class AppConfig{
  
  @Inject
  DataSource dataSource;
  
  @Bean
  public MyBean myBean(){
    return new MyBean(dataSource);
  }
  
  @Configuration
  static class DataConfig(){
    @Bean
    DataSource dataSource(){
      return new EmbeddedDatabaseBuilder().build()
    }
  }
}
```

>在上述代码中，只需要在应用程序的上下文中注册 AppConfig 。由于是嵌套的@Configuration 类，DatabaseConfig 将自动注册。当AppConfig 、DatabaseConfig 之间的关系已经隐含清楚时，这就避免了使用@Import 注解的需要。

#### @Lazy 延迟初始化

`@Lazy` : 表明一个bean 是否延迟加载，可以作用在方法上，表示这个方法被延迟加载；可以作用在@Component (或者由@Component 作为原注解) 注释的类上，表明这个类中所有的bean 都被延迟加载。如果没有@Lazy注释，或者@Lazy 被设置为false，那么该bean 就会急切渴望被加载；除了上面两种作用域，@Lazy 还可以作用在@Autowired和@Inject注释的属性上，在这种情况下，它将为该字段创建一个惰性代理，作为使用ObjectFactory或Provider的默认方法。下面来演示一下：

* 修改`MyConfiguration`类，在该类上添加@Lazy 注解，新增一个IfLazyInit()方法，检验是否被初始化。

```java
@Lazy
@Configuration
@ComponentScan(basePackages = "com.spring.configuration.pojo")
public class MyConfiguration {

    @Bean
    public MyBean myBean(){
        System.out.println("myBean Initialized");
        return new MyBean();
    }

    @Bean
    public MyBean IfLazyInit(){
        System.out.println("initialized");
        return new MyBean();
    }
}
```

* 修改SpringConfigurationApplication 启动类，放开之前MyConfiguration 的启动类

```java
public class SpringConfigurationApplication {

    public static void main(String[] args) {

        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(MyConfiguration.class);
//        ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");

//        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
//        context.register(MyConfiguration.class);
//        context.refresh();
//
//        // 获取启动过程中的bean 定义的名称
        for(String str : context.getBeanDefinitionNames()){
            System.out.println("str = " + str);
        }
//        context.close();

//        ApplicationContext context =
//                new AnnotationConfigApplicationContext(ReadValueFromPropertySource.class);
//        MyBean myBean = (MyBean) context.getBean("myTestBean");
//        System.out.println("myBean = " + myBean);

    }
}
```

输出你会发现没有关于bean的定义信息，但是当吧@Lazy 注释拿掉，你会发现输出了关于bean的初始化信息：

myBean Initialized
generate MyBean Instance
initialized
generate MyBean Instance

#### @RunWith 和 @ContextConfiguration

Junit4 测试类，用于注解在类上表示通过Junit4 进行测试，可以省略编写启动类代码，是ApplicationContext 等启动类的替换。一般用@RunWith 和 @Configuration 进行单元测试，这是软件开发过程中非常必要而且具有专业性的一部分，上面`EnvironmentConfig` 类证实了这一点：

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = EnvironmentConfig.class)
@Configuration
@PropertySource("classpath:beanName.properties")
public class EnvironmentConfig {

//    @Autowired
//    Environment env;

    @Inject
    Environment env;

    @Test
    public void testReadProperty(){
        // 获取bean.name.controller 的属性
        System.out.println(env.getProperty("bean.name.controller"));
        // 判断是否包含bean.name.component
        System.out.println(env.containsProperty("bean.name.component"));
        // 返回与给定键关联的属性值
        System.out.println(env.getRequiredProperty("bean.name.service"));
    }
}
```

#### @Enable 启动Spring内置功能

详情查阅`@EnableAsync`,`@EnableScheduling`,`@EnableTransactionManagement`,`@EnableAspectJAutoProxy`,`@EnableWebMvc`官方文档

#### @Configuration 使用约束

* 必须以类的方式提供(即不是从工厂方法返回的实例)
* @Configuration 注解的类必须是非final的
* 配置类必须是非本地的（即可能不在方法中声明）,native 标注的方法
* 任何嵌套的@Configuration 都必须是static 的。
* @Bean 方法可能不会反过来创建更多配置类



文章来源：

https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/Configuration.html

https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/PropertySource.html

https://blog.csdn.net/u012734441/article/details/51706504


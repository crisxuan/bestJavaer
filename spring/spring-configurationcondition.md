# 一文了解ConfigurationConditon 接口

## ConfigurationCondition 接口说明

### @Conditional 和 Condition

​		在了解ConfigurationCondition 接口之前，先通过一个示例来了解一下@Conditional 和 Condition。(你也可以通过 https://www.cnblogs.com/cxuanBlog/p/10960575.html 详细了解)

* 首先新建一个Maven项目(可以使用SpringBoot快速搭建)，添加Spring4.0 的pom.xml 依赖

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
    <groupId>com.cxuan.configuration</groupId>
    <artifactId>configuration-condition</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>configuration-condition</name>
    <description>Demo project for Spring Boot</description>

    <properties>
        <java.version>1.8</java.version>
        <spring.version>4.3.13.RELEASE</spring.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${spring.version}</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-beans</artifactId>
            <version>${spring.version}</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>${spring.version}</version>
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

* 新建一个`IfBeanAExistsCondition` 类，该类继承了Condition接口，提供某些注册条件的逻辑

```java
public class IfBeanAExistsCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        boolean IfContainsbeanA = context.getBeanFactory().containsBeanDefinition("beanA");
        return IfContainsbeanA;
    }
}
```

>Condition是一个接口，里面只有一个方法就是matches，上述表明如果ConditionContext的beanFactory包括名称为beanA的bean就返回true，否则返回false不进行注册。

* 为了测试Condition是否可用，我们新建一个`ConfigurationConditionApplication`类，注册两个Bean分别为BeanA和BeanB，BeanB的注册条件是BeanA首先进行注册，采用手动注册和刷新的方式。详见https://www.cnblogs.com/cxuanBlog/p/10958307.html，具体代码如下：

```java
public class ConfigurationConditionApplication {

    private static void loadContextAndVerifyBeans(Class...classToRegistry){
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(classToRegistry);
        context.refresh();
        System.out.println("Has BeanA? " + context.containsBean("beanA"));
        System.out.println("Has BeanB? " + context.containsBean("beanB"));
    }


    public static void main(String[] args) {
        loadContextAndVerifyBeans(BeanA.class);
        loadContextAndVerifyBeans(BeanA.class,BeanB.class);
        loadContextAndVerifyBeans(BeanB.class);
        loadContextAndVerifyBeans(BeanB.class,BeanA.class);
    }
}

@Configuration()
class BeanA{}

@Conditional(IfBeanAExistsCondition.class)
@Configuration()
class BeanB{}
```

输出结果：

```java
...
Has BeanA? true
Has BeanB? false
...
Has BeanA? true
Has BeanB? true
...
Has BeanA? false
Has BeanB? false
...
Has BeanA? true
Has BeanB? false
```

来解释一下上面的输出结果，第一次只注册了一个BeanA的bean，@Configuration标注的BeanA默认注册的definitionName为beanA，首字母小写。

第二次同时传入了BeanA.class 和 BeanB.class, 由于BeanB的注解上标明@Conditional(IfBeanAExistsCondition.class)表示的是注册BeanA之后才会注册BeanB，所以注册了beanA，因为beanA被注册了，所以同时也就注册了beanB。

第三次只传入了BeanB.class，因为没有注册BeanA和BeanB，所以两次输出都是false。

第四次先传入了BeanB.class，后又传入了BeanA.class，根据加载顺序来看，BeanB.class 首先被加载，然后是BeanA.class 被加载，BeanB被加载的时候BeanA.class 还没有被注入，之后BeanA才会注入，所以输出的结果是true和false。

>上述例子可以把BeanA和BeanB类放入ConfigurationConditionApplication中，类似
>
>```java
>public class ConfigurationConditionApplication {
> 	 
>@Configuration()
>static class BeanA{}
>
>@Conditional(IfBeanAExistsCondition.class)
>@Configuration()
>static class BeanB{}
>  
>}
>```
>
>但是需要把BeanA和BeanB定义为静态类，因为静态类与外部类无关能够独立存在，如果定义为非静态的，启动会报错。



### 关于ConfigurationConditon

​		ConfigurationCondition接口是Spring4.0提供的注解。位于**org.springframework.context.annotation**包内，继承于Condition接口。Condition接口和@Configuration以及@Conditional接口为bean的注册提供更细粒度的控制，允许某些Condition在匹配时根据配置阶段进行调整。

```java
public interface ConfigurationCondition extends Condition {

	// 评估condition返回的ConfigurationPhase
	ConfigurationPhase getConfigurationPhase();

	// 可以评估condition的各种配置阶段。
	enum ConfigurationPhase {
    
		// @Condition 应该被评估为正在解析@Configuration类
		// 如果此时条件不匹配，则不会添加@Configuration 类。
		PARSE_CONFIGURATION,

		// 添加常规(非@Configuration)bean时，应评估@Condition。Condition 将不会阻止@Configuration 类
		// 添加。在评估条件时，将解析所有@Configuration
		REGISTER_BEAN
	}

}
```

>getConfigurationPhase()方法返回ConfigurationPhase 的枚举。枚举类内定义了两个enum，PARSE_CONFIGURATION 和 REGISTER_BEAN，表示不同的注册阶段。

​		我们现在对condition实现更细粒度的控制，实现了ConfigurationCondition接口，我们现在需要实现getConfigurationPhase()方法获得condition需要评估的阶段。

* 新建`IfBeanAExistsConfigurationCondition`类，实现了ConfigurationCondition接口，分别返回ConfigurationPhase.REGISTER_BEAN 和 ConfigurationPhase.PARSE_CONFIGURATION 阶段。

```java
public class IfBeanAExistsConfigurationCondition implements ConfigurationCondition {

    @Override
    public ConfigurationPhase getConfigurationPhase() {
        return ConfigurationPhase.REGISTER_BEAN;
    }

//    @Override
//    public ConfigurationPhase getConfigurationPhase() {
//        return ConfigurationPhase.PARSE_CONFIGURATION;
//    }

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return context.getBeanFactory().containsBeanDefinition("beanA");
    }
}
```

* 新建`SpringConfigurationConditionExample`类，与上述测试类基本相同，就是把@Conditional 换为了**@Conditional(IfBeanAExistsConfigurationCondition.class)**

测试类启动，输出结果

```java
...
Has BeanA? true
Has BeanB? false
...
Has BeanA? true
Has BeanB? true
...
Has BeanA? false
Has BeanB? false
...
Has BeanA? true
Has BeanB? true
```

也就是说，如果返回的是**PARSE_CONFIGURATION**阶段的话，不会阻止@Configuration的标记类的注册顺序，啥意思呢？

第一个结果，只注册了BeanA，因为只有BeanA加载。

第二个结果，注册了BeanA和BeanB，因为BeanA和BeanB都被加载

第三个结果，因为BeanB注册的条件是BeanA注册，因为BeanA没有注册，所以BeanB不会注册

第四个结果，**不论BeanA和BeanB的加载顺序如何**，都会直接进行注册。

* 如果把**REGISTER_BEAN**改为**PARSE_CONFIGURATION **，会发现加载顺序第一次一致。



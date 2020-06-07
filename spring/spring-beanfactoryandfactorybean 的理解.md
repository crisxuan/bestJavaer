# BeanFactory 和 FactoryBean 的理解

我们或多或少都会经历过若干个面试，而每每问到 Spring 的时候都少不了IOC容器的影子，那么这个 IOC 容器是什么呢？ 本篇文章就来了解一下 BeanFactory 和 FactoryBean

## BeanFactory 是什么

BeanFactory 是用于Spring Bean 容器的根接口，它是 IOC 的基本容器，负责管理和加载 Bean，它为其他具体的IOC容器提供了最基本的规范，比如 `DefaultListableBeanFactory` 和 `ConfigurableBeanFactory`，BeanFactory 也提供了用于读取 XML 配置文件的实现，比如 `XMLBeanFactory`。

ApplicationContext 接口是 BeanFactory 的扩展，它除了具备 BeanFactory 接口所拥有的全部功能外，还有应用程序上下文的一层含义，主要包括

* 继承自 ListableBeanFactory 接口，可以访问 Bean 工厂上下文的组件
* 继承自 ResourceLoader 接口，以通用的方式加载文件资源
* 继承自 ApplicationContextPublisher 接口，拥有发布事件注册监听的能力
* 继承自 MessageSource 接口，解析消息支持国际化

它最主要的实现就是 `ClassPathXmlApplicationContext`，用来读取XML 配置文件，现在我们用的更多的是 ClassPathXmlApplicationContext 而不是 XMLBeanFactory 了。

### BeanFactory 的基本使用

上面了解了一下 BeanFactory 的基本概念之后，下面来介绍一下 BeanFactory 的基本使用

新建一个Maven 项目，配置基本的 Spring 依赖，新建一个简单的测试Bean —> HelloBean

HelloBean.java

```java
public class HelloBean {

    private String message;

    get and set...

    public void printMsg(){
        System.out.println("message = " + message);
    }

}
```

在 /resources 目录下新建一个 spring-beans.xml 配置文件，用来配置一下上面这个简单的bean

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE beans PUBLIC "-//SPRING//DTD BEAN//EN" "http://www.springframework.org/dtd/spring-beans.dtd" >

<beans>

    <bean id="helloBean" class="com.factory.bean.HelloBean">
        <property name="message">
            <value>Hello Beans</value>
        </property>
    </bean>

</beans>
```

新建一个测试类测试一下这个demo

```java
public class FactoryBeanApplicationTests {

    public static void main(String[] args) {

//        BeanFactory beanFactory = new XmlBeanFactory(new FileSystemResource("/Users/mr.l/test/spring-beans.xml"));
        ApplicationContext beanFactory = new ClassPathXmlApplicationContext("spring-beans.xml");
        HelloBean helloBean = (HelloBean) beanFactory.getBean("helloBean");
        helloBean.printMsg();
    }
}
```

一些其他的表现形式：

```java
Resource resource = new FileSystemResource("spring-beans.xml");
BeanFactory factory = new XmlBeanFactory(resource);

ApplicationContext context = new ClassPathXmlApplicationContext(new String[] {"applicationContext.xml", "applicationContext-part2.xml"});
BeanFactory factory = (BeanFactory) context;
```

>现在更多的采用 ClassPathXmlApplicationContext 路径上下文读取XML配置文件，XmlBeanFactory 已经被废弃。

## FactoryBean 是什么

FactoryBean 是一个接口，它本身就是一个对象工厂，如果bean 实现了这个接口，它被用作公开的对象工厂，而不是作为直接将bean暴露的实例。该接口在框架内部大量使用，例如 AOP ProxyFactoryBean 或者 JndiObjectFactoryBean。 也能自定义组件；然而，这仅适用于基础框架代码。FactoryBeans 支持单例或多例，并且可以根据需要懒加载创建对象，也可以在启动时 急切创建对象

我们先来看一下`FactoryBean` 的基本接口表示

```java
public interface FactoryBean<T> {

	@Nullable
	T getObject() throws Exception;

	@Nullable
	Class<?> getObjectType();

	default boolean isSingleton() {
		return true;
	}

}
```

接口很简单，只有三个方法，我们来讨论一下上面几个方法分别代表了什么意思：

* `getObject`: 返回一个工厂生产出来的对象，这个对象将要使用在Spring IOC 容器中
* `getObjectType` : 顾名思义就是返回工厂生产出来对象的类型
* `isSingleton`: 表示生产出来的对象是否是单例的

### FactoryBean 的基本使用

下面我们来用一个简单的示例演示一下 FactoryBean 的用法

* 先构建一个普通的pojo类，只有一个简单的属性

```java
public class Tool {

    private int id;

    public Tool(int id){
        this.id = id;
    }

   get and set...
}
```

* 构建一个 ToolFactory 类，实现了 FactoryBean 接口，用于生产 Tool 的对象

```java
public class ToolFactory implements FactoryBean<Tool> {

    private int factoryId;
    private int toolId;

    @Override
    public Tool getObject() throws Exception {
        return new Tool(toolId);
    }

    @Override
    public Class<?> getObjectType() {
        return Tool.class;
    }

    @Override
    public boolean isSingleton() {
        return false;
    }

    get and set...
}
```

* 在 /resources 目录下新建一个`factorybean-spring.xml` ，用于给 ToolFactory 赋值

```xml
<beans>
    <bean id="tool" class="com.factory.bean.util.ToolFactory">
        <property name="factoryId" value="9090" />
        <property name="toolId" value="1"/>
    </bean>
</beans>
```

* 新建一个测试类 `FactoryXmlTest` 测试 FactoryBean 生产的实例

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath:factorybean-spring.xml")
public class FactoryXmlTest {

  	// 使用 & 读取xml 中的配置值
    @Resource(name = "&tool")
    private ToolFactory toolFactory;

    @Test
    public void testFactory(){
        System.out.println(toolFactory.getFactoryId());
        System.out.println(toolFactory.getObjectType());
        System.out.println(toolFactory.getToolId());
    }
}
```

输出： 

9090
class com.factory.bean.pojo.Tool
1
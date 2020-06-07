> 从今天开始，我们一起过一遍Spring的官网，一边读，一边结合在路神课堂上学习的知识，讲一讲自己的理解。不管是之前关于动态代理的文章，还是读Spring的官网，都是为了之后对Spring的源码做更全面细致的学习，所以在这个过程中，不会涉及过多底层的代码，更多是通过例子证明我们在官网得出的结论，希望自己可以坚持下来，给自己加个油！！！
>
> 本文主要涉及到官网中的`1.2`,`1.3`节。

@[toc]
##### Spring容器

###### 容器是什么？

我们先看官网中的一句话：

> The `org.springframework.context.ApplicationContext` interface represents the Spring IoC container and is responsible for instantiating, configuring, and assembling the beans.  

翻译下来大概就是：

1. Spring IOC容器就是一个`org.springframework.context.ApplicationContext`的实例化对象
2. 容器负责了实例化，配置以及装配一个bean

那么我们可以说：

**从代码层次来看：Spring容器就是一个实现了`ApplicationContext`接口的对象**，

**从功能上来看： Spring 容器是 Spring 框架的核心，是用来管理对象的。容器将创建对象，把它们连接在一起，配置它们，并管理他们的整个生命周期从创建到销毁。** 

###### 容器如何工作？

我们直接看官网上的一张图片，如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235039696.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

**Spring容器通过我们提交的pojo类以及配置元数据产生一个充分配置的可以使用的系统**

这里说的配置元数据，实际上我们就是我们提供的XML配置文件，或者通过注解方式提供的一些配置信息

##### Spring Bean

###### 如何实例化一个Bean？

从官网上来看，主要有以下三种方法

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235049718.jpg)

1. 构造方法
2. 通过静态工厂方法
3. 通过实例工厂方法

这三种例子，官网都有具体的演示，这里就不再贴了，我们通过自己查阅部分源码，来验证我们在官网得到的结论，然后通过debug等方式进行验证。

我们再从代码的角度进行一波分析，这里我们直接定位到`org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory#createBeanInstance`这个方法中，具体定位步骤不再演示了，大家可以通过形如下面这段代码：

```java
ClassPathXmlApplicationContext cc =
    // 这里我们通过xml配置实例化一个容器
    new ClassPathXmlApplicationContext("classpath:application.xml");
MyServiceImpl luBan = (MyServiceImpl) cc.getBean("myServiceImpl");
```

直接main方法运行，然后在`org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory#createBeanInstance`这个方法的入口打一个断点，如图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235117877.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)


![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235129944.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

接下来我们对这个方法进行分析，代码如下：

```java
protected BeanWrapper createBeanInstance(String beanName, RootBeanDefinition mbd, @Nullable Object[] args) {
		// 1.获取这个bean的class属性，确保beanDefinition中beanClass属性已经完成解析
    	// 我们通过xml从<bean>标签中解析出来的class属性在刚刚开始的时候必定是个字符串
		Class<?> beanClass = resolveBeanClass(mbd, beanName);

		// 省略异常判断代码.....
    	
    	// 2.通过beanDefinition中的supplier实例化这个bean
		Supplier<?> instanceSupplier = mbd.getInstanceSupplier();
		if (instanceSupplier != null) {
			return obtainFromSupplier(instanceSupplier, beanName);
		}
		
    	// 3.通过FactoryMethod实例化这个bean
		if (mbd.getFactoryMethodName() != null) {
			return instantiateUsingFactoryMethod(beanName, mbd, args);
		}

        // 4.下面这段代码都是在通过构造函数实例化这个Bean,分两种情况，一种是通过默认的无参构造，一种				   是通过推断出来的构造函数
		boolean resolved = false;
		boolean autowireNecessary = false;
		if (args == null) {
			synchronized (mbd.constructorArgumentLock) {
				if (mbd.resolvedConstructorOrFactoryMethod != null) {
					resolved = true;
					autowireNecessary = mbd.constructorArgumentsResolved;
				}
			}
		}
    
    
   
		if (resolved) {
			if (autowireNecessary) {
				return autowireConstructor(beanName, mbd, null, null);
			}
			else {
				return instantiateBean(beanName, mbd);
			}
		}

		// Candidate constructors for autowiring?
		Constructor<?>[] ctors = determineConstructorsFromBeanPostProcessors(beanClass, beanName);
		if (ctors != null || mbd.getResolvedAutowireMode() == AUTOWIRE_CONSTRUCTOR ||
				mbd.hasConstructorArgumentValues() || !ObjectUtils.isEmpty(args)) {
			return autowireConstructor(beanName, mbd, ctors, args);
		}

		// Preferred constructors for default construction?
		ctors = mbd.getPreferredConstructors();
		if (ctors != null) {
			return autowireConstructor(beanName, mbd, ctors, null);
		}

		// No special handling: simply use no-arg constructor.
		return instantiateBean(beanName, mbd);
	}
```

我们主要关注进行实例化的几个方法：

1. 通过`BeanDefinition`中的`instanceSupplier`直接获取一个实例化的对象。这个`instanceSupplier`属性我本身不是特别理解，在xml中的<bean>标签以及注解的方式都没有找到方式配置这个属性。后来在`org.springframework.context.support.GenericApplicationContext`这个类中找到了以下两个方法

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235146473.png)



经过断点测试，发现这种情况下，在实例化对象时会进入上面的supplier方法。下面是测试代码：

```java
public static void main(String[] args) {
    // AnnotationConfigApplicationContext是GenericApplicationContext的一个子类
		AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext();
		ac.registerBean("service", Service.class,Service::new);
		ac.refresh();
		System.out.println(ac.getBean("service"));
	}
```

可以发现进入了这个方法进行实例化

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235200889.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

这个方法一般不常用，平常我们也使用不到，就不做过多探究，笔者认为，这应该是Spring提供的一种方便外部扩展的手段，让开发者能够更加灵活的实例化一个bean。

1. 接下来我们通过不同的创建bean的手段，来分别验证对象的实例化方法

- 通过`@compent`,`@Service`等注解的方式

测试代码：

```java
public class Main {
	public static void main(String[] args) {
        // 通过配置类扫描
		AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(Config.class);
		System.out.println(ac.getBean(Service.class));
	}
}

@Component
public class Service {

}
```

观察debug:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235214406.jpg)

可以发现，代码执行到最后一行，同时我们看代码上面的注释可以知道，当没有进行特殊的处理的时候，默认会使用无参构造函数进行对象的实例化

- 通过普通XML的方式（同`@compent`注解，这里就不赘诉了）
- 通过`@Configuration`注解的方式

测试代码：

```java
public class Main {
	public static void main(String[] args) {
        // 通过配置类扫描
		AnnotationConfigApplicationContext ac = new AnnotationConfigApplicationContext(Config.class);
        // 这里将测试对象换为config即可，同时记得将条件断点更改为beanName.equlas("config")
		System.out.println(ac.getBean(config.class));
	}
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235332887.jpg)

同样，断点也进入最后一行

- 通过`@Bean`的方式

测试代码：

```java
@Configuration
@ComponentScan("com.dmz.official")
public class Config {
    @Bean
    public Service service(){
        return new Service();
    }
}

public class Main {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ac =
                new AnnotationConfigApplicationContext(Config.class);
        System.out.println(ac.getBean("service"));
    }
}
```

断点结果：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235341477.jpg)

可以发现，通过`@Bean`方法创建对象时，Spring底层是通过`factoryMethod`的方法进行实例化对象的。Spring会在我们需要实例化的这个对象对应的`BeanDefinition`中记录`factoryBeanName`是什么（在上面的例子中factoryBeanName就是config）,同时会记录这个factoryBean中创建对象的`factoryMethodName`是什么，最后通过`factoryBeanName`获取一个Bean然后反射调用`factoryMethod`实例化一个对象。

这里我们需要注意几个概念：

1. 这里所说的通过静态工厂方式通过`factoryBeanName`获取一个Bean，注意，这个Bean，不是一个`FactoryBean`。也就是说不是一个实现了`org.springframework.beans.factory.FactoryBean`接口的Bean。至于什么是`FactoryBean`我们在后面的文章会认真分析
2. 提到了一个概念`BeanDefinition`，它就是Spring对自己所管理的Bean的一个抽象。不懂可以暂且跳过，后面有文章会讲到。

- 通过静态工厂方法的方式

测试代码：

```java
public static void main(String[] args) {
    ClassPathXmlApplicationContext cc =
        new ClassPathXmlApplicationContext("application.xml");
    System.out.println(cc.getBean("service"));
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
<!--	<bean id="myServiceImpl" class="com.dmz.official.service.Service"/>-->

	<!-- the factory bean, which contains a method called get() -->
	<bean id="myFactoryBean" class="com.dmz.official.service.MyFactoryBean">
		<!-- inject any dependencies required by this locator bean -->
	</bean>

	<!-- 测试实例工厂方法创建对象-->
	<bean id="clientService"
		  factory-bean="myFactoryBean"
		  factory-method="get"/>

	<!--测试静态工厂方法创建对象-->
	<bean id="service"
		  class="com.dmz.official.service.MyFactoryBean"
		  factory-method="staticGet"/>
</beans>
```

断点如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235407882.jpg)

可以发现，这种情况也进入了`instantiateUsingFactoryMethod`方法中。通过静态工厂方法这种方式特殊之处在于，包含这个静态方法的类，不需要实例化，不需要被Spring管理。Spring的调用逻辑大概是：

1. 通过`<bean>`标签中的class属性得到一个Class对象
2. 通过Class对象获取到对应的方法名称的Method对象
3. 最后反射调用`Method.invoke(null,args)`

因为是静态方法，方法在执行时，不需要一个对象。

- 通过实例工厂方法的方式

测试代码（配置文件不变）：

```java
public static void main(String[] args) {
    ClassPathXmlApplicationContext cc =
        new ClassPathXmlApplicationContext("application.xml");
    System.out.println(cc.getBean("clientService"));
}
```

断点如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235417499.jpg)

还是执行的这个方法。这个方法的执行过程我断点跟踪了以后，发现跟`@Bean`方式执行的流程是一样的。这里也不再赘述了。

到这里，这段代码我们算结合官网大致过了一遍。其实还遗留了以下几个问题：

1. Spring是如何推断构造函数的？我们在上面验证的都是无参的构造函数，并且只提供了一个构造函数
2. Spring是如何推断方法的？不管是静态工厂方法，还是实例工厂方法的方式，我们都只在类中提供了一个跟配置匹配的方法名，假设我们对方法进行了重载呢？

要说清楚这两个问题需要比较深入的研究代码，同时进行测试。我们在官网学习过程中，暂时不去强求这类问题。这里提出来是为了在源码学习过程中，我们可以带一定目的性去阅读。

###### 实例化总结：

1. 对象实例化，只是得到一个对象，还不是一个完全的Spring中的Bean，我们实例化后的这个对象还没有完成依赖注入，没有走完一系列的声明周期，这里需要大家注意

2. Spring官网上指明了，在Spring中实例化一个对象有三种方式：

   - 构造函数
   - 实例工厂方法
   - 静态工厂方法

3. 我自己总结如下结论：

   Spring通过解析我们的配置元数据，以及我们提供的类对象得到一个Beanfinition对象。通过这个对象可以实例化出一个java bean对象。主要流程如图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235508810.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

这篇文章到这里就结束了，主要学习了Spring官网中的1.2，1.3两小节。下篇文章，我们开始学习1.4中的知识。主要涉及到依赖注入的一些内容，也是我们Spring中非常重要的一块内容哦！下篇文章再见！![在这里插入图片描述](https://img-blog.csdnimg.cn/20191217235523407.png)

**扫描下方二维码，关注我的公众号，更多精彩文章在等您！~~**

![公众号](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9naXRlZS5jb20vd3hfY2MzNDdiZTY5Ni9ibG9nSW1hZ2UvcmF3L21hc3Rlci8lRTUlODUlQUMlRTQlQkMlOTclRTUlOEYlQjcuanBn?x-oss-process=image/format,png)


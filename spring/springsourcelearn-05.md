> 上篇文章已经对`BeanDefinition`做了一系列的介绍，这篇文章我们开始学习`BeanDefinition`合并的一些知识，完善我们整个`BeanDefinition`的体系，Spring在创建一个bean时多次进行了`BeanDefinition`的合并，对这方面有所了解也是为以后阅读源码做准备。本文主要对应官网中的`1.7`小节


在[上篇文章](../Spring官网阅读（四）BeanDefinition（上）/Spring官网阅读（四）BeanDefinition.md)中，我们学习了`BeanDefinition`的一些属性，其中有以下几个属性：

```java
//  是否抽象
boolean isAbstract();
// 获取父BeanDefinition的名称
String getParentName();
```

上篇文章中说过，这几个属性跟`BeanDefinition`的合并相关，那么我先考虑一个问题，什么是合并呢？

#### <span id="jump">什么是合并？</span>

我们来看官网上的一段介绍：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200107002020136.jpg)
大概翻译如下：

一个`BeanDefinition`包含了很多的配置信息，包括构造参数，setter方法的参数还有容器特定的一些配置信息，比如初始化方法，静态工厂方法等等。一个子的`BeanDefinition`可以从它的父`BeanDefinition`继承配置信息，不仅如此，还可以覆盖其中的一些值或者添加一些自己需要的属性。使用`BeanDefinition`的父子定义可以减少很多的重复属性的设置，父`BeanDefinition`可以作为`BeanDefinition`定义的模板。

我们通过一个例子来观察下合并发生了什么，编写一个Demo如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	   xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
	<bean id="parent" abstract="true"
		  class="com.dmz.official.merge.TestBean">
		<property name="name" value="parent"/>
		<property name="age" value="1"/>
	</bean>
	<bean id="child"
		  class="com.dmz.official.merge.DerivedTestBean"
		  parent="parent" >
		<property name="name" value="override"/>
	</bean>
</beans>
```

```java
public class DerivedTestBean {
	private String name;

	private int age;
	
    // 省略getter setter方法
}

public class TestBean {
	private String name;

	private String age;
    
     // 省略getter setter方法
}

public class Main {
	public static void main(String[] args) {
		ClassPathXmlApplicationContext cc = new ClassPathXmlApplicationContext("application.xml");
		DerivedTestBean derivedTestBean = (DerivedTestBean) cc.getBean("child");
		System.out.println("derivedTestBean的name = " + derivedTestBean.getName());
		System.out.println("derivedTestBean的age = " + derivedTestBean.getAge());
	}
}
```

运行：

------

derivedTestBean的name = override
derivedTestBean的age = 1

------

在上面的例子中，**我们将`DerivedTestBean`的`parent`属性设置为了`parent`,指向了我们的`TestBean`，同时将`TestBean`的age属性设置为1**，但是我们在配置文件中并没有直接设置`DerivedTestBean`的age属性。但是在最后运行结果，我们可以发现，`DerivedTestBean`中的age属性已经有了值，并且为1，就是我们在其parent Bean（也就是`TestBean`）中设置的值。也就是说，**子`BeanDefinition`会从父`BeanDefinition`中继承没有的属性**。另外，`DerivedTestBean`跟`TestBean`都指定了name属性，但是可以发现，这个值并没有被覆盖掉，也就是说，**子`BeanDefinition`中已经存在的属性不会被父`BeanDefinition`中所覆盖**。

##### 合并的总结：

所以我们可以总结如下：

- **子`BeanDefinition`会从父`BeanDefinition`中继承没有的属性**
- 这个过程中，**子`BeanDefinition`中已经存在的属性不会被父`BeanDefinition`中所覆盖**

##### 关于合并需要注意的点：

另外我们需要注意的是：

- 子`BeanDefinition`中的`class`属性如果为null，同时父`BeanDefinition`又指定了`class`属性，那么子`BeanDefinition`也会继承这个`class`属性。
- 子`BeanDefinition`必须要兼容父`BeanDefinition`中的所有属性。这是什么意思呢？以我们上面的demo为例，我们在父`BeanDefinition`中指定了name跟age属性，但是如果子`BeanDefinition`中子提供了一个name的setter方法，这个时候Spring在启动的时候会报错。因为子`BeanDefinition`不能承接所有来自父`BeanDefinition`的属性
- 关于`BeanDefinition`中`abstract`属性的说明：
  1. 并不是作为父`BeanDefinition`就一定要设置`abstract`属性为true，`abstract`只代表了这个`BeanDefinition`是否要被Spring进行实例化并被创建对应的Bean，如果为true，代表容器不需要去对其进行实例化。
  2. 如果一个`BeanDefinition`被当作父`BeanDefinition`使用，并且没有指定其`class`属性。那么必须要设置其`abstract`为true
  3. `abstract=true`一般会跟父`BeanDefinition`一起使用，因为当我们设置某个`BeanDefinition`的`abstract=true`时，一般都是要将其当作`BeanDefinition`的模板使用，否则这个`BeanDefinition`也没有意义，除非我们使用其它`BeanDefinition`来继承它的属性

#### Spring在哪些阶段做了合并？

> **下文将所有`BeanDefinition`简称为`bd`**

##### 1、扫描并获取到`bd`：

这个阶段的操作主要发生在`invokeBeanFactoryPostProcessors`，对应方法的调用栈如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200107002153661.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

对应的执行该方法的类为：`PostProcessorRegistrationDelegate`

方法源码如下：

```java
	public static void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory,
													   List<BeanFactoryPostProcessor> beanFactoryPostProcessors) {
        // .....
	    // 省略部分代码，省略的代码主要时用来执行程序员手动调用API注册的容器的后置处理器
        // .....

		// 发生一次bd的合并
        // 这里只会获取实现了BeanDefinitionRegistryPostProcessor接口的Bean的名字
			String[] postProcessorNames =             beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
			for (String ppName : postProcessorNames) {
                // 筛选实现了PriorityOrdered接口的后置处理器
				if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
					currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
					// 去重
					processedBeans.add(ppName);
				}
			}
			// .....
            // 只存在一个internalConfigurationAnnotationProcessor 处理器，用于扫描
        	// 这里只会执行了实现了PriorityOrdered跟BeanDefinitionRegistryPostProcessor的后置处理器
			invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
			// .....
        	// 这里又进行了一个bd的合并
			postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
			for (String ppName : postProcessorNames) {
                // 筛选实现了Ordered接口的后置处理器
				if (!processedBeans.contains(ppName) && beanFactory.isTypeMatch(ppName, Ordered.class)) {
					currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
					processedBeans.add(ppName);
				}
			}
			// .....
        	// 执行的是实现了BeanDefinitionRegistryPostProcessor接口跟Ordered接口的后置处理器
			invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
			boolean reiterate = true;
			while (reiterate) {
				reiterate = false;
            // 这里再次进行了一次bd的合并
				postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
				for (String ppName : postProcessorNames) {
					if (!processedBeans.contains(ppName)) {
                        // 筛选只实现了BeanDefinitionRegistryPostProcessor的后置处理器
						currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
						processedBeans.add(ppName);
						reiterate = true;
					}
				}
				sortPostProcessors(currentRegistryProcessors, beanFactory);
				registryProcessors.addAll(currentRegistryProcessors);
                // 执行的是普通的后置处理器，即没有实现任何排序接口（PriorityOrdered或Ordered)
				invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry);
				currentRegistryProcessors.clear();
			}
        // .....
        // 省略部分代码，这部分代码跟BeanfactoryPostProcessor接口相关，这节bd的合并无关，下节容器的扩展点中我会介绍
        // .....
		
	}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200107002432629.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)
大家可以结合我画的图跟上面的代码过一遍流程，只要弄清楚一点就行，即每次调用`beanFactory.getBeanNamesForType`都进行了一次`bd`的合并。`getBeanNamesForType`这个方法主要目的是为了或者指定类型的`bd`的名称，之后通过`bd`的名称去找到指定的`bd`，然后获取对应的Bean，比如上面方法三次获取的都是`BeanDefinitionRegistryPostProcessor`这个类型的`bd`。

我们可以思考一个问题，为什么这一步需要合并呢？大家可以带着这个问题继续往下看，在后文我会解释。

##### 2、实例化

Spring在实例化一个对象也会进行`bd`的合并。

第一次：

`org.springframework.beans.factory.support.DefaultListableBeanFactory#preInstantiateSingletons`

```java
public void preInstantiateSingletons() throws BeansException {
    // .....
	// 省略跟合并无关的代码
    for (String beanName : beanNames) {
        RootBeanDefinition bd = getMergedLocalBeanDefinition(beanName);
        if (!bd.isAbstract() && bd.isSingleton() && !bd.isLazyInit()) {
            // .....
```

第二次：

`org.springframework.beans.factory.support.AbstractBeanFactory#doGetBean`

```java
protected <T> T doGetBean(final String name, @Nullable final Class<T> requiredType,
                          @Nullable final Object[] args, boolean typeCheckOnly) throws BeansException {
    // .....
    // 省略跟合并无关的代码
    final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
    checkMergedBeanDefinition(mbd, beanName, args);

    // Guarantee initialization of beans that the current bean depends on.
    String[] dependsOn = mbd.getDependsOn();
    if (dependsOn != null) {
        // ....
    }
    if (mbd.isSingleton()) {
        // ....
    }
    // ....
```

我们可以发现这两次合并有一个共同的特点，就是在**合并之后立马利用了合并之后的`bd`我们简称为`mbd`做了一系列的判断**，比如上面的`dependsOn != null`和`mbd.isSingleton()`。基于上面几个例子我们来分析：为什么需要合并？

#### 为什么需要合并？

在扫描阶段，之所以发生了合并，是因为Spring需要拿到指定了实现了`BeanDefinitionRegistryPostProcessor`接口的`bd`的名称，也就是说，Spring需要用到`bd`的名称。所以进行了一次`bd`的合并。在实例化阶段，是因为Spring需要用到`bd`中的一系列属性做判断所以进行了一次合并。我们总结起来，其实就是一个原因：**Spring需要用到`bd`的属性，要保证获取到的`bd`的属性是正确的**。

那么问题来了，为什么获取到的`bd`中属性可能不正确呢？

主要两个原因：

1. 作为子`bd`,属性本身就有可能缺失，比如我们在开头介绍的例子，子`bd`中本身就没有age属性，age属性在父`bd`中
2. Spring提供了很多扩展点，在启动容器的时候，可能会修改`bd`中的属性。比如一个正常实现了`BeanFactoryPostProcessor`就能修改容器中的任意的`bd`的属性。在后面的容器的扩展点中我再介绍

#### 合并的代码分析： 

因为合并的代码其实很简单，所以一并在这里分析了，也可以加深对合并的理解：

```java
protected RootBeanDefinition getMergedLocalBeanDefinition(String beanName) throws BeansException {
    // Quick check on the concurrent map first, with minimal locking.
    // 从缓存中获取合并后的bd
    RootBeanDefinition mbd = this.mergedBeanDefinitions.get(beanName);
    if (mbd != null) {
        return mbd;
    }
    // 如何获取不到的话，开始真正的合并
    return getMergedBeanDefinition(beanName, getBeanDefinition(beanName));
}
```

```java
	protected RootBeanDefinition getMergedBeanDefinition(
			String beanName, BeanDefinition bd, @Nullable BeanDefinition containingBd)
			throws BeanDefinitionStoreException {

		synchronized (this.mergedBeanDefinitions) {
			RootBeanDefinition mbd = null;

			// Check with full lock now in order to enforce the same merged instance.
			if (containingBd == null) {
				mbd = this.mergedBeanDefinitions.get(beanName);
			}

			if (mbd == null) {
                // 如果没有parentName的话直接使用自身合并
                // 就是new了RootBeanDefinition然后再进行属性的拷贝
				if (bd.getParentName() == null) {
					if (bd instanceof RootBeanDefinition) {
						mbd = ((RootBeanDefinition) bd).cloneBeanDefinition();
					}
					else {   
						mbd = new RootBeanDefinition(bd);
					}
				}
				else {
					// 需要进行父子的合并
					BeanDefinition pbd;
					try {
						String parentBeanName = transformedBeanName(bd.getParentName());
						if (!beanName.equals(parentBeanName)) {
                            // 这里是递归，在将父子合并时，需要确保父bd已经合并过了
							pbd = getMergedBeanDefinition(parentBeanName);
						}
						else {
                            // 一般不会进这个判断
                            // 到父容器中找对应的bean，然后进行合并，合并也发生在父容器中
							BeanFactory parent = getParentBeanFactory();
							if (parent instanceof ConfigurableBeanFactory) {
								pbd = ((ConfigurableBeanFactory) parent).getMergedBeanDefinition(parentBeanName);
							}
							// 省略异常信息......
						}
					}
					// 省略异常信息......
					// 
					mbd = new RootBeanDefinition(pbd);
                    //用子bd中的属性覆盖父bd中的属性
					mbd.overrideFrom(bd);
				}

				// 默认设置为单例
				if (!StringUtils.hasLength(mbd.getScope())) {
					mbd.setScope(RootBeanDefinition.SCOPE_SINGLETON);
				}
                // 当前bd如果内部嵌套了一个bd,并且嵌套的bd不是单例的，但是当前的bd又是单例的
                // 那么将当前的bd的scope设置为嵌套bd的类型
				if (containingBd != null && !containingBd.isSingleton() && mbd.isSingleton()) {
					mbd.setScope(containingBd.getScope());
				}
				// 将合并后的bd放入到mergedBeanDefinitions这个map中
                // 之后还是可能被清空的，因为bd可能被修改
				if (containingBd == null && isCacheBeanMetadata()) {
					this.mergedBeanDefinitions.put(beanName, mbd);
				}
			}

			return mbd;
		}
	}
```

上面这段代码整体不难理解，可能发生疑惑的主要是两个点：

1. `pbd = getMergedBeanDefinition(parentBeanName);`

这里进行的是父`bd`的合并，是方法的递归调用，这是因为在合并的时候父`bd`可能也还不是一个合并后的bd

1. `containingBd != null && !containingBd.isSingleton() && mbd.isSingleton()`

我查了很久的资料，经过验证后发现，如果进行了形如下面的嵌套配置，那么`containingBd`会不为null

```xml
<bean id="luBanService" class="com.dmz.official.service.LuBanService" scope="prototype">
    <property name="lookUpService">
        <bean class="com.dmz.official.service.LookUpService" scope="singleton"></bean>
    </property>
</bean>
```

在这个例子中，`containingBd`为`LuBanService`，此时，`LuBanService`是一个原型的`bd`，但`lookUpService`是一个单例的`bd`，那么这个时候经过合并，`LookUpService`也会变成一个原型的`bd`。大家可以拿我这个例子测试一下。

#### 总结：

这篇文章我觉得最重要的是，我们要明白Spring为什么要进行合并，之所以再每次需要用到`BeanDefinition`都进行一次合并，是为了每次都拿到最新的，最有效的`BeanDefinition`，因为利用容器提供了一些扩展点我们可以修改`BeanDefinition`中的属性。关于容器的扩展点，比如上文提到了`BeanFactoryPostProcessor`以及`BeanDefinitionRegistryPostProcessor`,我会在后面的几篇文章中一一介绍。

`BeanDefinition`的学习就到这里了，这个类很重要，是整个Spring的基石，希望大家可以多花时间多研究研究相关的知识。加油，共勉！![在这里插入图片描述](https://img-blog.csdnimg.cn/20200107002118246.png)

**扫描下方二维码，关注我的公众号，更多精彩文章在等您！~~**
![公众号](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9naXRlZS5jb20vd3hfY2MzNDdiZTY5Ni9ibG9nSW1hZ2UvcmF3L21hc3Rlci8lRTUlODUlQUMlRTQlQkMlOTclRTUlOEYlQjcuanBn?x-oss-process=image/format,png)
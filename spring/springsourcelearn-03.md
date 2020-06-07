> 上篇文章我们已经学习了`1.4`小结中关于依赖注入跟方法注入的内容。这篇文章我们继续学习这结中的其他内容，顺便解决下我们上篇文章留下来的一个问题-----**注入模型**。

#### 前言：

在看下面的内容之前，我们先要对自动注入及精确注入有一个大概的了解，所谓**精确注入**就是指，我们通过构造函数或者setter方法指定了我们对象之间的依赖，也就是我们上篇文章中讲到的**依赖注入**，然后Spring根据我们指定的依赖关系，精确的给我们完成了注入。那么自动注入是什么？我们看下面一段代码：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	   xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/dbeans/spring-beans.xsd"
>
	<bean id="auto" class="com.dmz.official.service.AutoService" autowire="byType"/>
	<bean id="dmzService" class="com.dmz.official.service.DmzService"/>
</beans>
```

```java
public class AutoService {
	DmzService service;
	public void setService(DmzService dmzService){
		System.out.println("注入dmzService"+dmzService);
		service = dmzService;
	}
}
public class DmzService {

}
public class Main03 {
	public static void main(String[] args) {
		ClassPathXmlApplicationContext cc =
				new ClassPathXmlApplicationContext("application.xml");
		System.out.println(cc.getBean("auto"));
	}
}
```

在上面的例子中我们可以看到

1. 我们没有采用注解`@Autowired`进行注入
2. XML中没有指定属性标签`<property>`
3. 没有使用构造函数

但是，打印结果如下：

------

```java
注入dmzServicecom.dmz.official.service.DmzService@73a8dfcc  // 这里完成了注入
com.dmz.official.service.AutoService@1963006a
```

------

可能细心的同学已经发现了，在`AutoService`的标签中我们新增了一个属性`autowire="byType"`,那么这个属性是什么意思呢？为什么加这个属性就能帮我们完成注入呢？不要急，我们带着问题继续往下看。![在这里插入图片描述](https://img-blog.csdnimg.cn/20191218000049457.png)
#### 自动注入：

这部分内容主要涉及官网中的[1.4.5](https://docs.spring.io/spring/docs/5.2.1.RELEASE/spring-framework-reference/core.html#beans-autowired-exceptions)小结。

我们先看官网上怎么说的：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191218000334884.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

##### 自动注入的优点：

大概翻译如下：

Spring可以自动注入互相协作的bean之间的依赖。自动注入有以下两个好处：

- 自动注入能显著的减少我们指定属性或构造参数的必要。这个不难理解，我们在上篇文章中讲过了，依赖注入的两种方式，setter方法跟构造函数，见上篇文章[依赖注入](../Spring官网阅读（二）依赖注入及方法注入/Spring官网阅读（二）依赖注入及方法注入.md#dep)。在前言中的例子我们也能发现，我们并不需要指定属性或构造参数
- 自动装配可以随着对象的演化更新配置。例如，如果需要向类添加依赖项，则可以自动满足该依赖项，而不需要修改配置。因此，自动装配在**开发过程**中特别有用，但是当我们的代码库变的稳定时，自动装配也不会影响我们将装配方式切换到**精确注入**（这个词是我根据官网阅读加自己理解翻译过来的，也就是官网中的（**explicit wiring**）

##### 注入模型：

接下来，官网给我们介绍了自动注入的四种模型，如图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191218000107216.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

我们一一进行解析并测试：

- `no`

这是目前Spring默认的注入模型，也可以说默认情况下Spring是关闭自动注入，必须要我们通过setter方法或者构造函数完成依赖注入，并且Spring也不推荐修改默认配置。我们使用IDEA时也可以看到

[外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传(img-DZC5fi2F-1576598384639)(image/2019120204.jpg)]

用红线框出来的部分建议我们使用精确的方式注入依赖。

从上面来说，Spring自动注入这种方式在我们实际开发中基本上用不到，但是为了更好的理解跟学习Spring源码，我们也是需要好好学习这部分知识的。

- `byName`

这种方式，我们为了让Spring完成自动注入需要提供两个条件

1. 提供setter方法
2. 如果需要注入的属性为`xxx`,那么setter方法命名必须是`setXxx`,也就是说，命名必须规范

在找不到对应名称的bean的情况下，Spring也不会报错，只是不会给我们完成注入。

测试代码：

```java
//记得需要将配置信息修改为：<bean id="auto" class="com.dmz.official.service.AutoService" 		   autowire="byName"/>

public class AutoService {
	DmzService dmzService;
	/**
	 * 	setXXX,Spring会根据XXX到容器中找对应名称的bean,找到了就完成注入
 	 */
	public void setDmzService(DmzService dmzService){
		System.out.println("注入dmzService"+dmzService);
		service = dmzService;
	}
}
```

另外我在测试的时候发现，这种情况下，如果我们提供的参数不规范也不会完成注入的，如下：

```java
public class AutoService {

	DmzService dmzService;
	
    // indexService也被Spring所管理
	IndexService indexService;

	/**
	 * setXXX,Spring会根据XXX到容器中找对应名称的bean,找到了就完成注入
	 */
	public void setDmzService(DmzService dmzService,IndexService indexService) {
		System.out.println("注入dmzService" + dmzService);
		this.dmzService = dmzService;
	}
}
```

本以为这种情况Spring会注入dmzService，indexService为null，实际测试过程中发现这个set方法根本不会被调用，说明Spring在选择方法时，还对参数进行了校验，`byName`这种注入模型下，参数只能是我们待注入的类型且只能有一个

- `byType`

测试代码跟之前唯一不同的就是修改配置` autowire="byType"`,这里我们测试以下三种异常情况

1. 找不到合适类型的bean，发现不报异常，同时不进行注入
2. 找到了多个合适类型的bean，Spring会直接报错`Caused by: org.springframework.beans.factory.NoUniqueBeanDefinitionException: No qualifying bean of type 'com.dmz.official.service.DmzService' available: expected single matching bean but found 2: dmzService,dmzService2`
3. set方法中有两个参数，切两个参数都能找到唯一一个类型符合的bean，不报异常，也不进行注入

另外需要说明的是，我在测试的过程，将set方法仅仅命名为`set`,像这样`public void set(DmzService dmzService)`,这种情况下Spring也不会进行注入

**我们可以发现，对于这两种注入模型都是依赖setter方法完成注入的，并且对setter方法命名有一定要求（只要我们平常遵从代码书写规范，一般也不会踩到这些坑）。第一，不能有多个参数；第二，不能仅仅命名为`set`**

- `constructor`

当我们使用这种注入模型时，Spring会根据构造函数查找有没有对应参数名称的bean,有的话完成注入（跟前文的`byName`差不多），如果根据名称没找到，那么它会再根据类型进行查找，如果根据类型还是没找到，就会报错。

##### 自动注入的缺陷：

这里不得不说一句，Spring官网在这一章节有三分之二的内容是在说自定注入的缺陷以及如何将一个类从自动注入中排除，结合默认情况下自动注入是关闭的（默认注入模型为`no`），可以说明，在实际使用情况中，Spring是非常不推荐我们开启自动注入这种模型的。从官网中我们总结自动注入有以下几个缺陷：

- 精确注入会覆盖自动注入。并且我们不能注入基本数据类型，字符串，Class类型（这些数据的数组也不行）。而且这是Spring故意这样设计的
- 自动注入不如精确注入准确。而且我们在使用自动注入时，对象之间的依赖关系不明确
- 对于一些为Spring容器生成文档的工具，无法获取依赖关系
- 容器中的多个bean定义可能会与自动注入的setter方法或构造函数参数指定的类型匹配。对于数组、集合或映射实例，这可能不会产生什么问题。但是，对于期望单个值的依赖项，我们无法随意确定到底有谁进行注入。如果没有唯一的bean定义可用，则会抛出异常

##### 如何将Bean从自动注入中排除？

这里主要用到`autowire-candidate`这个属性，我们要将其设置为`false`，这里需要注意以下几点：

1. 这个设置只对类型注入生效。这也很好理解，例如我们告诉Spring要自动注入一个`indexService`,同时我们又在`indexService`的配置中将其从自动注入中排除，这就是自相矛盾的。所以在`byName`的注入模型下，Spring直接忽略了`autowire-candidate`这个属性
2. `autowire-candidate=false`这个属性代表的是，这个bean不作为候选bean注入到别的bean中，而不是说这个bean不能接受别的bean的注入。例如在我们上面的例子中我们对`AutoService`进行了如下配置：

```xml
	<bean id="auto" class="com.dmz.official.service.AutoService" autowire="byType" autowire-candidate="false"/>
```

代表的是这个bean不会被注入到别的bean中，但是`dmzService`任何会被注入到`AutoService`中

另外需要说明的是，对于自动注入，一般我们直接在顶级的<beans>标签中进行全局设置，如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	   xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd"
    <!--在这里进行配置-->
 default-autowire="byName">
```

#### 自动注入跟精确注入的比较总结：

连同上篇文章[依赖注入](../Spring官网阅读（二）依赖注入及方法注入/Spring官网阅读（二）依赖注入及方法注入.md#dep)，我画了下面一个<span id="jump">图</span>：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191218000135996.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

- 从关注的点上来看，**自动注入是针对的整个对象**，或者一整批对象。比如我们如果将`autoService`这个bean的注入模型设置为`byName`，Spring会为我们去寻找所有符合要求的名字（通过set方法）bean并注入到`autoService`中。而**精确注入这种方式，是我们针对对象中的某个属性**，比如我们在`autoService`中的`dmzService`这个属性字段上添加了`@AutoWired`注解，代表我们要精确的注入`dmzService`这个属性。而**方法注入主要是基于方法对对象进行注入**。
- 我们通常所说***byName***,***byType***跟我们在前文提到的注入模型中的`byName`,`byType`是完全不一样的。通常我们说的***byName***,***byType***是Spring寻找bean的手段。比如，当我们注入模型为`constructor`时，Spring会先通过名称找对符合要求的bean，这种通过名称寻找对应的bean的方式我们可以称为`byName`。我们可以将一次注入分为两个阶段，首先是寻找符合要求的bean，其次再是将符合要求的bean注入。也可以画图如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191218000218293.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

#### 补充（1.4小结的剩余部分）

这部分比较简单，也是`1.4`小节中剩余的两个小知识，在这篇文章我们也一并学习了~

##### depends-on：

我们首先要知道，默认情况下，Spring在实例化容器中的对象时是按名称进行自然排序进行实例化的。比如我们现在有A,B,C三个对象，那么Spring在实例化时会按照A,B,C这样的顺序进行实例化。但是在某些情况下我们可能需要让B在A之前完成实例化，这个时候我们就需要使用`depends-on`这个属性了。我们可以通过形如下面的配置完成：

```xml
<bean id="a" class="xx.xx.A" depends-on="b"/>
<bean id="b" class="xx.xx.B" />
```

或者：

```java
@Component
@DependsOn("b")
public class A {
}
```

##### lazy:

默认情况下，Spring会在容器启动阶段完成所有bean的实例化，以及一系列的生命周期回调。某些情况下，我们

可能需要让某一个bean延迟实例化。这种情况下，我们需要用到`lazy`属性，有以下两种方式：

1. XML中bean标签的`lazy-init`属性

```xml
<bean id="lazy" class="com.something.ExpensiveToCreateBean" lazy-init="true"/>
```

1. `@Lazy`注解

```java
@Component
// 懒加载
@Lazy
public class A {
	
}
```

到此为止，官网中`1.4`小节中的内容我们就全学习完啦！最核心的部分应该就是上文中的这个[图](#jump)了。我们主要总结了Spring让对象产生依赖的方式，同时对各个方式进行了对比。通过这部分的学习，我觉得大家应该对Spring的依赖相关知识会更加系统，这样我们之后学习源码时碰到疑惑也会少很多。

下面我们还要继续学习Spring的官网，比如前面文章提到的`Beandefinition`到底是什么东西？Spring中的Bean的生命周期回调又是什么？这些在官网中都能找到答案。

给自己加油，也给所有看到这篇文章的同学加油~！！![在这里插入图片描述](https://img-blog.csdnimg.cn/20191218000152775.png)

**扫描下方二维码，关注我的公众号，更多精彩文章在等您！~~**![公众号](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9naXRlZS5jb20vd3hfY2MzNDdiZTY5Ni9ibG9nSW1hZ2UvcmF3L21hc3Rlci8lRTUlODUlQUMlRTQlQkMlOTclRTUlOEYlQjcuanBn?x-oss-process=image/format,png)
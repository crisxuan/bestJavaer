# Spring AOP 扫盲

## 关于AOP

面向切面编程(Aspect-oriented Programming，俗称AOP)提供了一种面向对象编程(Object-oriented Programming，俗称OOP)的补充，面向对象编程最核心的单元是类(class)，然而面向切面编程最核心的单元是切面(Aspects)。与面向对象的顺序流程不同，AOP采用的是横向切面的方式，注入与主业务流程无关的功能，例如事务管理和日志管理。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607142722234-1912689830.png)

Spring的一个关键组件是AOP框架。 虽然Spring IoC容器不依赖于AOP（意味着你不需要在IOC中依赖AOP），但AOP为Spring IoC提供了非常强大的中间件解决方案。

AOP 是一种编程范式，最早由 AOP 联盟的组织提出的，通过**预编译方式和运行期动态代理**实现程序功能的统一维护的一种技术。它是 OOP的延续。利用 AOP 可以对业务逻辑的各个部分进行隔离，从而使得业务逻辑各部分之间的耦合度降低，提高程序的可重用性，同时提高了开发的效率

我们之间的开发流程都是使用顺序流程，那么使用 AOP 之后，你就可以横向抽取重复代码，什么叫横向抽取呢？或许下面这幅图你能理解，先来看一下传统的软件开发存在什么样风险。

**纵向继承体系**：

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607142730437-1498917848.png)

在改进方案之前，我们或许都遇到过 IDEA 对你输出 Duplicate Code 的时候，这个时候的类的设计是很糟糕的，代码写的也很冗余，基本上 if...else... 完成所有事情，这个时候就需要把相同的代码抽取出来成为公共的方法，降低耦合性。这种提取代码的方式是纵向抽取，纵向抽取的代码之间的关联关系非常密切。
横向抽取也是代码提取的一种方式，不过这种方式不会修改主要业务逻辑代码，只是在此基础上添加一些与主要的业务逻辑无关的功能，AOP 采取横向抽取机制，补充了传统纵向继承体系(OOP)无法解决的重复性 代码优化(性能监视、事务管理、安全检查、缓存)，将业务逻辑和系统处理的代码(关闭连接、事务管理、操作日志记录)解耦。

## AOP 的概念

在深入学习SpringAOP 之前，让我们先对AOP的几个基本术语有个大致的概念，这些概念不是很容易理解，比较抽象，可以知道有这么几个概念，下面一起来看一下：

* `切面(Aspect)`： Aspect 声明类似于 Java 中的类声明，事务管理是AOP一个最典型的应用。在AOP中，切面一般使用 `@Aspect` 注解来使用，在XML 中，可以使用 **`<aop:aspect>`** 来定义一个切面。
* `连接点(Join Point)`: 一个在程序执行期间的某一个操作，就像是执行一个方法或者处理一个异常。在Spring AOP中，一个连接点就代表了一个方法的执行。
* `通知(Advice): `在切面中(类)的某个连接点(方法出)采取的动作，会有四种不同的通知方式： **around(环绕通知)，before(前置通知)，after(后置通知)， exception(异常通知)，return(返回通知)**。许多AOP框架（包括Spring）将建议把通知作为为拦截器，并在连接点周围维护一系列拦截器。
* `切入点(Pointcut):`表示一组连接点，通知与切入点表达式有关，并在切入点匹配的任何连接点处运行(例如执行具有特定名称的方法)。**由切入点表达式匹配的连接点的概念是AOP的核心，Spring默认使用AspectJ切入点表达式语言。**
* `介绍(Introduction):` introduction可以为原有的对象增加新的属性和方法。例如，你可以使用introduction使bean实现IsModified接口，以简化缓存。 
* `目标对象(Target Object):` 由一个或者多个切面代理的对象。也被称为"切面对象"。由于Spring AOP是使用运行时代理实现的，因此该对象始终是代理对象。
* `AOP代理(AOP proxy):` 由AOP框架创建的对象，在Spring框架中，AOP代理对象有两种：**JDK动态代理和CGLIB代理**
* `织入(Weaving):` 是指把增强应用到目标对象来创建新的代理对象的过程，它(例如 AspectJ 编译器)可以在编译时期，加载时期或者运行时期完成。与其他纯Java AOP框架一样，Spring AOP在运行时进行织入。

### Spring AOP 中通知的分类

* 前置通知(Before Advice): 在目标方法被调用前调用通知功能；相关的类`org.springframework.aop.MethodBeforeAdvice`
* 后置通知(After Advice): 在目标方法被调用之后调用通知功能；相关的类`org.springframework.aop.AfterReturningAdvice`
* 返回通知(After-returning): 在目标方法成功执行之后调用通知功能；
* 异常通知(After-throwing): 在目标方法抛出异常之后调用通知功能；相关的类`org.springframework.aop.ThrowsAdvice`
* 环绕通知(Around): 把整个目标方法包裹起来，在**被调用前和调用之后分别调用通知功能**相关的类`org.aopalliance.intercept.MethodInterceptor`

### Spring AOP 中织入的三种时期

* `编译期:` 切面在目标类编译时被织入，这种方式需要特殊的编译器。**AspectJ 的织入编译器就是以这种方式织入切面的。**
* `类加载期:` 切面在目标类加载到 JVM 时被织入，这种方式需要特殊的类加载器( ClassLoader )，它可以在目标类引入应用之前增强目标类的字节码。
* `运行期:` 切面在应用运行的某个时期被织入。一般情况下，在织入切面时，AOP容器会为目标对象动态创建一个代理对象，**Spring AOP 采用的就是这种织入方式。**

## AOP 的两种实现方式

AOP 采用了两种实现方式：静态织入(AspectJ 实现)和动态代理(Spring AOP实现)

### AspectJ 

AspectJ 是一个采用Java 实现的AOP框架，它能够对代码进行编译(一般在编译期进行)，让代码具有AspectJ 的 AOP 功能，AspectJ 是目前实现 AOP 框架中最成熟，功能最丰富的语言。ApectJ 主要采用的是编译期静态织入的方式。在这个期间使用 AspectJ 的 acj 编译器(类似 javac)把 aspect 类编译成 class 字节码后，在 java 目标类编译时织入，即先编译 aspect 类再编译目标类。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607142801851-777147048.png)

### Spring AOP 实现

Spring AOP 是通过动态代理技术实现的，而动态代理是基于反射设计的。Spring AOP 采用了两种混合的实现方式：JDK 动态代理和 CGLib 动态代理，分别来理解一下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607142809999-1801893230.png)

- JDK动态代理：Spring AOP的首选方法。 每当目标对象实现一个接口时，就会使用JDK动态代理。**目标对象必须实现接口**
- CGLIB代理：如果目标对象没有实现接口，则可以使用CGLIB代理。

## Spring 对 AOP的支持

Spring 提供了两种AOP 的实现：基于注解式配置和基于XML配置

## @AspectJ 支持

为了在Spring 配置中使用`@AspectJ` ，你需要启用Spring支持，以根据@AspectJ切面配置Spring AOP，并配置自动代理。自动代理意味着，Spring 会根据自动代理为 Bean 生成代理来拦截方法的调用，并确保根据需要执行拦截。

可以使用XML或Java样式配置启用@AspectJ支持。 在任何一种情况下，都还需要确保AspectJ的`aspectjweaver.jar` 第三方库位于应用程序的类路径中（版本1.8或更高版本）。

### 开启@AspectJ 支持

使用`@Configuration` 支持@AspectJ 的时候，需要添加 `@EnableAspectJAutoProxy` 注解，就像下面例子展示的这样来开启 AOP代理

```java
@Configuration
@EnableAspectJAutoProxy
public class AppConfig {}
```

也可以使用XML配置来开启@AspectJ 支持

```xml
<aop:aspectj-autoproxy/>
```

默认你已经添加了 aop 的schema 空间，如果没有的话，你需要手动添加

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:aop="http://www.springframework.org/schema/aop" xsi:schemaLocation="
        http://www.springframework.org/schema/beans https://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/aop https://www.springframework.org/schema/aop/spring-aop.xsd">

    <!-- bean definitions here -->
</beans>
```

### 声明一个切面

在启用了@AspectJ支持的情况下，在应用程序上下文中定义的任何bean都具有@AspectJ方面的类（具有@Aspect注释），Spring会自动检测并用于配置Spring AOP。

使用XML 配置的方式定义一个切面

```xml
<aop:aspect />
```

使用注解的方式定义一个切面

```java
@Aspect
public class MyAspect {}
```

切面(也就是用@Aspect注解的类)就像其他类一样有属性和方法。它们能够包含切入点，通知和介绍声明。

>**通过自动扫描检测切面**
>
>你可以在Spring XML 配置中将切面类注册为常规的bean，或者通过类路径扫描自动检测它们 - 与任何其他Spring管理的bean相同。然而，只是注解了@Aspect 的类不会被当作bean 进行管理，你还需要在类上面添加 @Component 注解，把它当作一个组件交给 Spring 管理。

### 定义一个切点

一个切点由两部分组成：包含名称和任何参数以及切入点表达式的签名，该表达式能够确定我们想要执行的方法。在@AspectJ注释风格的AOP中，切入点表达式需要用`@Pointcut`注解标注(这个表达式作为方法的签名，它的返回值必须是 void)。

```java
@Pointcut("execution(* transfer(..))") // 切入点表达式
private void definePointcut() {}// 方法签名
```

切入点表达式的编写规则如下：

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607142821645-1868974874.png)

现在假设我们需要配置的切点仅仅匹配指定的包，就可以使用 `within()` 限定符来表示，如下表达式所述：

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607142829167-1438235172.png)

请注意我们使用了 `&&` 操作符把 execution() 和 within() 指示器连接在一起，表示的是 **和** 的关系，类似的，你还可以使用 `||` 操作来表示 **或** 的关系， 使用 `!` 表示 **非** 的关系。

除了within() 表示的限定符外，还有其它的限定符，下面是一个限定符表

| AspectJ 描述符 | 描述                                                         |
| -------------- | ------------------------------------------------------------ |
| arg()          | 限制连接点匹配参数为指定类型的执行方法                       |
| @args()        | 限制连接点匹配参数由指定注解标注的执行方法                   |
| execution()    | 用于匹配是连接点的执行方法                                   |
| this()         | 限制连接点匹配的AOP代理的bean引用为指定类型的类              |
| target         | 限制连接点匹配目标对象为指定类型的类                         |
| @target()      | 限制连接点匹配特定的执行对象，这些对象对应的类要具有指定类型的注解 |
| within()       | 限制连接点匹配指定的类型                                     |
| @within()      | 限制连接点匹配指定注解所标注的类型                           |
| @annotationn   | 限定匹配带有指定注解的连接点                                 |

使用XML配置来配置切点

```xml
<aop:config>
	<aop:aspect ref = "">
  	<aop:poincut id = "" expression="execution(** com.cxuan.aop.definePointcut(......))"/>
  </aop:aspect>
</aop:config>
```

### 声明一个通知

通知是和切入点表达式相互关联，用于在方法执行之前，之后或者方法前后，方法返回，方法抛出异常时调用通知的方法，切入点表达式可以是对命名切入点的简单引用，也可以是在适当位置声明的切入点表达式。下面以一个例子来演示一下这些通知都是如何定义的：

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607142842527-1007764566.png)

上面的例子就很清晰了，定义了一个 `Audience` 切面，并在切面中定义了一个`performance()` 的切点，下面各自定义了**表演之前、表演之后返回、表演失败**的时候进行通知，除此之外，你还需要在main 方法中开启 `@EnableAspectJAutoProxy` 来开启自动代理。

除了使用Java Config 的方式外，你还可以使用基于XML的配置方式

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607142850729-1804808810.png)

当然，这种切点定义的比较冗余，为了解决这种类似 `if...else...` 灾难性的业务逻辑，你需要单独定义一个`<aop:pointcut>`，然后使用 `pointcut-ref` 属性指向上面那个标签，就像下面这样

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200607142859325-406157803.png)

**环绕通知**

在目标方法执行之前和之后都可以执行额外代码的通知。在环绕通知中必须显式的调用目标方法，目标方法才会执行，这个显式调用时通过`ProceedingJoinPoint`来实现的，可以在环绕通知中接收一个此类型的形参，spring容器会自动将该对象传入，注意这个参数必须处在环绕通知的第一个形参位置。

环绕通知需要返回返回值，否则真正调用者将拿不到返回值，只能得到一个null。下面是环绕通知的一个示例

```xml
 <aop:around method="around" pointcut-ref="pc1"/>
```

```java
 public Object around(ProceedingJoinPoint jp) throws Throwable{
   System.out.println("1 -- around before...");
   Object obj = jp.proceed(); //--显式的调用目标方法
   System.out.println("1 -- around after...");
   return obj;
 }
```
文章参考：

https://juejin.im/post/5a695b3cf265da3e47449471

《Spring In Action》

https://docs.spring.io/spring/docs/5.1.9.RELEASE/spring-framework-reference/core.html

[Spring AOP 五大通知类型](https://www.cnblogs.com/chuijingjing/p/9806651.html)https://www.cnblogs.com/chuijingjing/p/9806651.html)
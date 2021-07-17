# Java 代理

* [Java 代理](#java-代理)
   * [代理模式](#代理模式)
   * [静态代理与动态代理](#静态代理与动态代理)
   * [常见的动态代理实现](#常见的动态代理实现)
      * [JDK Proxy](#jdk-proxy)
      * [CGLIB](#cglib)
      * [JDK Proxy 和 CGLIB 的对比](#jdk-proxy-和-cglib-的对比)
   * [动态代理的实际应用](#动态代理的实际应用)
      * [Spring AOP](#spring-aop)

说在前面：今天我们来聊一聊 Java 中的代理，先来聊聊故事背景：

> 小明想购买法国某个牌子的香水送给女朋友，但是在国内没有货源售卖，亲自去法国又大费周章了，而小红现在正在法国玩耍，她和小明是好朋友，可以帮小明买到这个牌子的香水，于是小明就找到小红，答应给她多加 5% 的辛苦费，小红答应了，小明成功在中国买到了法国的香水。之后小红开启了疯狂的代购模式，赚到了很多手续费。

在故事中，**小明是一个客户**，它让小红帮忙购买香水，**小红就成了一个代理对象**，而**香水提供商是一个真实的对象**，可以售卖香水，小明通过代理商小红，购买到法国的香水，这就是一个代购的例子。我画了一幅图帮助理解这个故事的整个结构。

![image-20210717193558393](https://tva1.sinaimg.cn/large/008i3skNly1gsk6g2jo25j311c0940u6.jpg)

这个故事是最典型的代理模式，代购从供应商购买货物后返回给调用者，也就是需要代理的小明。

代理可以分为`静态代理`和`动态代理`两大类：

**静态代理**

- 优点：代码结构简单，较容易实现
- 缺点：无法适配所有代理场景，如果有新的需求，需要修改代理类，**不符合软件工程的开闭原则**

小红现在只是代理香水，如果小明需要找小红买法国红酒，那小红就需要代理法国红酒了，但是静态代理去扩展代理功能**必须修改小红内部的逻辑，这会让小红内部代码越来越臃肿**，后面会详细分析。

**动态代理**

- 优点：能够动态适配特定的代理场景，扩展性较好，**符合软件工程的开闭原则**
- 缺点：动态代理需要利用到反射机制和动态生成字节码，导致其性能会比静态代理稍差一些，**但是相比于优点，这些劣势几乎可以忽略不计**

如果小明需要找小红代理红酒，我们**无需修改代理类小红的内部逻辑**，只需要关注扩展的功能点：**代理红酒**，实例化新的类，通过一些转换即可让小红**既能够代理香水也能够代理红酒**了。

本文将会通过以下几点，尽可能让你理解 Java 代理中所有重要的知识点：

1. 学习代理模式（实现故事的代码，解释代理模式的类结构特点）
2. 比较静态代理与动态代理二者的异同
3. Java 中常见的两种动态代理实现（JDK Proxy 和 Cglib）
4. 动态代理的应用（Spring AOP）

## 代理模式

（1）我们定义好一个**售卖香水**的接口，定义好售卖香水的方法并传入该香水的价格。

```java
public interface SellPerfume {
    void sellPerfume(double price);
}
```

（2）定义香奈儿（Chanel）香水提供商，实现接口。

```java
public class ChanelFactory implements SellPerfume {
    @Override
    public void sellPerfume(double price) {
        System.out.println("成功购买香奈儿品牌的香水，价格是：" + price + "元");
    }
}
```

（3）定义**小红**代理类，她需要代购去售卖香奈儿香水，所以她是香奈儿香水提供商的代理对象，同样实现接口，并在内部保存对目标对象（香奈儿提供商）的引用，控制其它对象对目标对象的访问。

```java
public class XiaoHongSellProxy implements SellPerfume {
	private SellPerfume sellPerfumeFactory;
    public XiaoHongSellProxy(SellPerfume sellPerfumeFactory) {
        this.sellPerfumeFactory = sellPerfumeFactory;
    }
    @Override
    public void sellPerfume(double price) {
        doSomethingBeforeSell(); // 前置增强
        sellPerfumeFactory.sellPerfume(price);
        doSomethingAfterSell(); // 后置增强
    }
    private void doSomethingBeforeSell() {
        System.out.println("小红代理购买香水前的额外操作...");
    }
    private void doSomethingAfterSell() {
        System.out.println("小红代理购买香水后的额外操作...");
    }
}
```

（4）小明是一个需求者，他需要去购买香水，只能通过小红去购买，所以他去找小红购买`1999.99`的香水。

```java
public class XiaoMing {
    public static void main(String[] args) {
        ChanelFactory factory = new ChanelFactory();
        XiaoHongSellProxy proxy = new XiaoHongSellProxy(factory);
        proxy.sellPerfume(1999.99);
    }
}
```

我们来看看运行结果，小红在向小明售卖香水前可以执行额外的其它操作，如果良心点的代购就会**打折、包邮···**，如果黑心点的代购就会**加手续费、售出不退还···**，是不是很刺激。

![image-20210717193646964](https://tva1.sinaimg.cn/large/008i3skNly1gsk6gwghsuj311e0csq4d.jpg)

我们来看看上面 4 个类组成的类图关系结构，可以发现**小红**和**香奈儿提供商**都实现了**售卖香水**这一接口，而小红内部增加了对提供商的引用，用于调用提供商的售卖香水功能。

![image-20210717193655961](https://tva1.sinaimg.cn/large/008i3skNly1gsk6h1vp6rj31160iwtbd.jpg)

实现代理模式，需要走以下几个步骤：

- **定义真实对象和代理对象的公共接口**（售卖香水接口）
- **代理对象内部保存对真实目标对象的引用**（小红引用提供商）
- 访问者仅能通过代理对象访问真实目标对象，**不可直接访问目标对象**（小明只能通过小红去购买香水，不能直接到香奈儿提供商购买）

> 代理模式很容易产生错误思维的一个地方：代理对象并不是真正提供服务的一个对象，它只是替访问者访问目标对象的一个**中间人**，真正提供服务的还是目标对象，而代理对象的作用就是在目标对象提供服务之前和之后能够执行额外的逻辑。
>
> 从故事来说，小红并不是真正卖香水的，卖香水的还是香奈儿提供商，而小红只不过是在让香奈儿卖香水之前和之后执行了一些自己额外加上去的操作。

讲完这个代理模式的代码实现，我们来系统地学习它究竟是如何定义的，以及实现它需要注意什么规范。

代理模式的定义：**给目标对象提供一个代理对象，代理对象包含该目标对象，并控制对该目标对象的访问。**

代理模式的目的：

- 通过代理对象的隔离，可以在对目标对象访问前后**增加额外的业务逻辑，实现功能增强。**
- 通过代理对象访问目标对象，可以**防止系统大量地直接对目标对象进行不正确地访问**，出现不可预测的后果

## 静态代理与动态代理

你是否会有我一样的疑惑：代理为什么还要分静态和动态的？它们两个有啥不同吗？

很明显，所有人都会有这样的疑惑，我们先来看看它们的相同点：

- 都能够实现代理模式（这不废话吗...）
- 无论是静态代理还是动态代理，代理对象和目标对象都需要实现一个**公共接口**

重点当然是它们的不同之处，动态代理在静态代理的基础上做了改进，极大地提高了程序的**可维护性**和**可扩展性**。我先列出它们俩的不同之处，再详细解释为何静态代理不具备这两个特性：

- 动态代理产生代理对象的时机是**运行时动态生成**，它没有 Java 源文件，**直接生成字节码文件实例化代理对象**；而静态代理的代理对象，在**程序编译时**已经写好 Java 文件了，直接 new 一个代理对象即可。
- 动态代理比静态代理更加稳健，对程序的可维护性和可扩展性更加友好

目前来看，代理对象小红已经能够代理购买香水了，但有一天，小红的另外一个朋友小何来了，**他想购买最纯正的法国红酒**，国内没有这样的购买渠道，小红刚巧也在法国，于是小何就想找小红帮他买红酒啦，这和小明找小红是一个道理的，都是想让小红做代理。

但问题是：在程序中，小红只能代理购买香水，**如果要代理购买红酒**，要怎么做呢？

- 创建售卖红酒的接口
- 售卖红酒提供商和代理对象小红都需要实现该接口

- 小何访问小红，让小红卖给他红酒

![image-20210717193705678](https://tva1.sinaimg.cn/large/008i3skNly1gsk6h80xflj311e0kodij.jpg)

OK，事已至此，代码就不重复写了，我们来探讨一下，面对这种新增的场景，上面的这种实现方法有没有什么缺陷呢？

我们不得不提的是软件工程中的**开闭原则**

> 开闭原则：在编写程序的过程中，软件的所有对象应该是对扩展是开放的，而对修改是关闭的

静态代理违反了开闭原则，原因是：面对新的需求时，需要修改代理类，增加实现新的接口和方法，导致代理类越来越庞大，变得难以维护。

虽然说目前代理类只是实现了2个接口，**如果日后小红不只是代理售卖红酒，还需要代理售卖电影票、代购日本寿司······**实现的接口会变得越来越多，内部的结构变得越来越复杂，**整个类显得愈发臃肿**，变得不可维护，之后的扩展也会成问题，只要任意一个接口有改动，就会牵扯到这个代理类，维护的代价很高。

**所以，为了提高类的可扩展性和可维护性，满足开闭原则，Java 提供了动态代理机制。**

## 常见的动态代理实现

动态代理最重要的当然是**动态**两个字，学习动态代理的过程，最重要的就是理解何为动态，话不多说，马上开整。

我们来明确一点：**动态代理解决的问题是面对新的需求时，不需要修改代理对象的代码，只需要新增接口和真实对象，在客户端调用即可完成新的代理。**

这样做的目的：满足软件工程的开闭原则，提高类的可维护性和可扩展性。

### JDK Proxy

JDK Proxy 是 JDK 提供的一个动态代理机制，它涉及到两个核心类，分别是`Proxy`和`InvocationHandler`，我们先来了解如何使用它们。

以小红代理卖香水的故事为例，香奈儿香水提供商依旧是真实对象，实现了`SellPerfume`接口，这里不再重新写了，重点是**小红代理**，这里的代理对象不再是小红一个人，而是一个**代理工厂**，里面会有许多的代理对象。我画了一幅图，你看了之后会很好理解：

![image-20210717193714779](https://tva1.sinaimg.cn/large/008i3skNly1gsk6hdkxkij31140gumzj.jpg)

小明来到代理工厂，需要购买一款法国在售的香奈儿香水，那么工厂就会**找一个可以实际的代理对象（动态实例化）**分配给小明，例如小红或者小花，让该代理对象完成小明的需求。**该代理工厂含有无穷无尽的代理对象可以分配，且每个对象可以代理的事情可以根据程序的变化而动态变化，无需修改代理工厂。**

如果有一天小明需要招待一个可以**代购红酒**的代理对象，该代理工厂依旧可以满足他的需求，无论日后需要什么代理，都可以满足，是不是觉得很神奇？我们来学习如何使用它。

我们看一下动态代理的 UML 类图结构长什么样子。

![image-20210717193724578](https://tva1.sinaimg.cn/large/008i3skNly1gsk6hjqoo3j31180imacf.jpg)

可以看到和静态代理区别不大，唯一的变动是代理对象，我做了标注：**由代理工厂生产**。

这句话的意思是：**代理对象是在程序运行过程中，由代理工厂动态生成，代理对象本身不存在 Java 源文件**。

那么，我们的关注点有`2`个：

- 如何实现一个代理工厂
- 如何通过代理工厂动态生成代理对象

首先，代理工厂需要实现`InvocationHanlder`接口并实现其`invoke()`方法。

```java
public class SellProxyFactory implements InvocationHandler {
	/** 代理的真实对象 */
    private Object realObject;

    public SellProxyFactory(Object realObject) {
        this.realObject = realObject;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        doSomethingBefore();
        Object obj = method.invoke(realObject, args);
        doSomethingAfter();
        return obj;
    }

    private void doSomethingAfter() {
        System.out.println("执行代理后的额外操作...");
    }

    private void doSomethingBefore() {
        System.out.println("执行代理前的额外操作...");
    }
    
}
```

invoke() 方法有`3`个参数：

- `Object proxy`：代理对象
- `Method method`：真正执行的方法
- `Object[] agrs`：调用第二个参数 method 时传入的参数列表值

invoke() 方法是一个代理方法，也就是说最后客户端请求代理时，执行的就是该方法。代理工厂类到这里为止已经结束了，我们接下来看第二点：**如何通过代理工厂动态生成代理对象**。

生成代理对象需要用到`Proxy`类，它可以帮助我们生成任意一个代理对象，里面提供一个静态方法`newProxyInstance`。

```java
 Proxy.newProxyInstance(ClassLoader loader, Class<?>[] interfaces, InvocationHandler h);
```

实例化代理对象时，需要传入`3`个参数：

- ClassLoader loader：加载动态代理类的类加载器
- Class<?>[] interfaces：代理类实现的接口，可以传入多个接口
- InvocationHandler h：指定代理类的**调用处理程序**，即调用接口中的方法时，会找到该代理工厂`h`，执行`invoke()`方法

我们在客户端请求代理时，就需要用到上面这个方法。

```java
public class XiaoMing {
    public static void main(String[] args) {
        ChanelFactory chanelFactory = new ChanelFactory();
        SellProxyFactory sellProxyFactory = new SellProxyFactory(chanelFactory);
        SellPerfume sellPerfume = (SellPerfume) Proxy.newProxyInstance(chanelFactory.getClass().getClassLoader(),
                chanelFactory.getClass().getInterfaces(),
                sellProxyFactory);
        sellPerfume.sellPerfume(1999.99);
    }
}
```

执行结果和静态代理的结果相同，但二者的思想是不一样的，一个是静态，一个是动态。那又如何体现出动态代理的优势呢？别急，往下看就知道了。

> 注意看下图，相比`静态代理`的前置增强和后置增强，少了**小红**二字，实际上代理工厂分配的代理对象是随机的，不会针对某一个具体的代理对象，所以每次生成的代理对象都不一样，也就不确定是不是小红了，但是能够唯一确定的是，**这个代理对象能和小红一样帮小明买到香水！**

![image-20210717193917931](https://tva1.sinaimg.cn/large/008i3skNly1gsk6jjgd58j311q0emta4.jpg)

按照之前的故事线发展，小红去代理红酒，而**小明又想买法国的名牌红酒**，所以去找代理工厂，让它再分配一个人帮小明买红酒，代理工厂说：“当然没问题！我们是专业的！等着！”

我们需要实现两个类：红酒提供商类 和 售卖红酒接口。

```Java
/** 售卖红酒接口 */
public interface SellWine {
    void sellWine(double price);
}

/** 红酒供应商 */
public class RedWineFactory implements SellWine {

    @Override
    public void sellWine(double price) {
        System.out.println("成功售卖一瓶红酒，价格：" + price + "元");    
    }

}
```

然后我们的小明在请求代理工厂时，就可以**实例化一个可以售卖红酒的代理**了。

```java
public class XiaoMing {
    public static void main(String[] args) {
        // 实例化一个红酒销售商
        RedWineFactory redWineFactory = new RedWineFactory();
        // 实例化代理工厂，传入红酒销售商引用控制对其的访问
        SellProxyFactory sellProxyFactory = new SellProxyFactory(redWineFactory);
        // 实例化代理对象，该对象可以代理售卖红酒
        SellWine sellWineProxy = (SellWine) Proxy.newProxyInstance(redWineFactory.getClass().getClassLoader(),
                redWineFactory.getClass().getInterfaces(),
                sellProxyFactory);
        // 代理售卖红酒
        sellWineProxy.sellWine(1999.99);
    }
}
```

期待一下执行结果，你会很惊喜地发现，居然也能够代理售卖红酒了，但是我们**没有修改代理工厂**。

![image-20210717193928366](https://tva1.sinaimg.cn/large/008i3skNly1gsk6jowi24j311k0e8dh7.jpg)

回顾一下我们新增红酒代理功能时，需要`2`个步骤：

- 创建新的红酒提供商`SellWineFactory`和售卖红酒接口`SellWine`
- 在客户端实例化一个代理对象，然后向该代理对象购买红酒

再回想**开闭原则：面向扩展开放，面向修改关闭**。动态代理正是满足了这一重要原则，在面对功能需求扩展时，只需要关注扩展的部分，不需要修改系统中原有的代码。

如果感兴趣想深究的朋友，把注意力放在`Proxy.newProxyInstance()`这个方法上，这是整个 JDK 动态代理起飞的一个方法。

讲到这里，JDK 提供的动态代理已经到尾声了，我们来总结一下 JDK 的动态代理：

（1）JDK 动态代理的使用方法

- 代理工厂需要实现 `InvocationHandler`接口，调用代理方法时会转向执行`invoke()`方法
- 生成代理对象需要使用`Proxy`对象中的`newProxyInstance()`方法，返回对象可强转成传入的其中一个接口，然后调用接口方法即可实现代理

（2）JDK 动态代理的特点

- 目标对象强制需要实现一个接口，否则无法使用 JDK 动态代理 

**（以下为扩展内容，如果不想看可跳过）**

Proxy.newProxyInstance() 是生成动态代理对象的关键，我们可来看看它里面到底干了些什么，我把重要的代码提取出来，一些对分析无用的代码就省略掉了。

```java
private static final Class<?>[] constructorParams ={ InvocationHandler.class };
public static Object newProxyInstance(ClassLoader loader,
                                          Class<?>[] interfaces,
                                          InvocationHandler h) {
    // 获取代理类的 Class 对象
    Class<?> cl = getProxyClass0(loader, intfs);
    // 获取代理对象的显示构造器，参数类型是 InvocationHandler
    final Constructor<?> cons = cl.getConstructor(constructorParams);
    // 反射，通过构造器实例化动态代理对象
    return cons.newInstance(new Object[]{h});
}
```

我们看到第 `6` 行获取了一个动态代理对象，那么是如何生成的呢？接着往下看。

```java
private static Class<?> getProxyClass0(ClassLoader loader,
                                       Class<?>... interfaces) {
    // 去代理类对象缓存中获取代理类的 Class 对象
    return proxyClassCache.get(loader, interfaces);
}
```

发现里面用到一个缓存 **proxyClassCache**，从结构来看类似于是一个 `map` 结构，根据类加载器`loader`和真实对象实现的接口`interfaces`查找是否有对应的 Class 对象，我们接着往下看 `get()` 方法。

```java
 public V get(K key, P parameter) {
     // 先从缓存中查询是否能根据 key 和 parameter 查询到 Class 对象
     // ...
     // 生成一个代理类
     Object subKey = Objects.requireNonNull(subKeyFactory.apply(key, parameter));
 }
```

在 get() 方法中，如果没有从缓存中获取到 Class 对象，则需要利用 **subKeyFactory** 去实例化一个动态代理对象，而在 **Proxy** 类中包含一个 **ProxyClassFactory** 内部类，由它来创建一个动态代理类，所以我们接着去看 ProxyClassFactory 中的 `apply()` 方法。

```java
private static final class ProxyClassFactory
    implements BiFunction<ClassLoader, Class<?>[], Class<?>> {
    // 非常重要，这就是我们看到的动态代理的对象名前缀！
	private static final String proxyClassNamePrefix = "$Proxy";

    @Override
    public Class<?> apply(ClassLoader loader, Class<?>[] interfaces) {
        Map<Class<?>, Boolean> interfaceSet = new IdentityHashMap<>(interfaces.length);
        // 一些状态校验
		
        // 计数器，该计数器记录了当前已经实例化多少个代理对象
        long num = nextUniqueNumber.getAndIncrement();
        // 动态代理对象名拼接！包名 + "$Proxy" + 数字
        String proxyName = proxyPkg + proxyClassNamePrefix + num;

        // 生成字节码文件，返回一个字节数组
        byte[] proxyClassFile = ProxyGenerator.generateProxyClass(
            proxyName, interfaces, accessFlags);
        try {
            // 利用字节码文件创建该字节码的 Class 类对象
            return defineClass0(loader, proxyName,
                                proxyClassFile, 0, proxyClassFile.length);
        } catch (ClassFormatError e) {
            throw new IllegalArgumentException(e.toString());
        }
    }
}
```

apply() 方法中注意有**两个非常重要的方法**：

- **ProxyGenerator.generateProxyClass()**：它是生成字节码文件的方法，它返回了一个字节数组，字节码文件本质上就是一个字节数组，所以 `proxyClassFile`数组就是一个字节码文件
- **defineClass0()**：生成字节码文件的 Class 对象，它是一个 `native` 本地方法，调用操作系统底层的方法创建类对象

而 `proxyName` 是代理对象的名字，我们可以看到它利用了 **proxyClassNamePrefix + 计数器** 拼接成一个新的名字。所以在 DEBUG 时，停留在代理对象变量上，你会发现变量名是`$Proxy0`。

![image-20210717193940478](https://tva1.sinaimg.cn/large/008i3skNly1gsk6jwvg1jj31180dotal.jpg)

到了这里，源码分析完了，是不是感觉被掏空了？哈哈哈哈，其实我当时也有这种感觉，不过现在你也感觉到，JDK 的动态代理其实并不是特别复杂吧（只要你有毅力）

### CGLIB

CGLIB（Code generation Library） 不是 JDK 自带的动态代理，它需要导入第三方依赖，它是一个字节码生成类库，能够在运行时动态生成代理类对 **Java类 和 Java接口** 扩展。

CGLIB不仅能够为 Java接口 做代理，而且**能够为普通的 Java类 做代理**，而 JDK Proxy **只能为实现了接口**的 Java类 做代理，所以 CGLIB 为 Java 的代理做了很好的扩展。**如果需要代理的类没有实现接口，可以选择 Cglib 作为实现动态代理的工具。**

废话太多，一句话概括：**CGLIB 可以代理没有实现接口的 Java 类**

下面我们来学习它的使用方法，以**小明找代理工厂买法国香水**这个故事背景为例子。

（1）导入依赖

```java
<dependency>
    <groupId>cglib</groupId>
    <artifactId>cglib-nodep</artifactId>
    <version>3.3.0</version>
    <scope>test</scope>
</dependency>
```

> 还有另外一个 CGLIB 包，二者的区别是带有`-nodep`的依赖内部已经包括了`ASM`字节码框架的相关代码，无需额外依赖`ASM`

（2）CGLIB 代理中有两个核心的类：`MethodInterceptor`接口 和 `Enhancer`类，前者是实现一个代理工厂的根接口，后者是创建动态代理对象的类，在这里我再贴一次故事的结构图，帮助你们理解。

![image-20210717193951153](https://tva1.sinaimg.cn/large/008i3skNly1gsk6k3e37lj311i0iitb3.jpg)

首先我们来定义代理工厂`SellProxyFactory`。

```java
public class SellProxyFactory implements MethodInterceptor {
    // 关联真实对象，控制对真实对象的访问
    private Object realObject;
    /** 从代理工厂中获取一个代理对象实例，等价于创建小红代理 */
    public Object getProxyInstance(Object realObject) {
        this.realObject = realObject;
        Enhancer enhancer = new Enhancer();
        // 设置需要增强类的类加载器
        enhancer.setClassLoader(realObject.getClass().getClassLoader());
        // 设置被代理类，真实对象
        enhancer.setSuperclass(realObject.getClass());
        // 设置方法拦截器，代理工厂
        enhancer.setCallback(this);
        // 创建代理类
        return enhancer.create();
    }
    
    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        doSomethingBefore(); // 前置增强
        Object object = methodProxy.invokeSuper(o, objects);
        doSomethingAfter(); // 后置增强
        return object;
    }

    private void doSomethingBefore() {
        System.out.println("执行方法前额外的操作...");
    }

    private void doSomethingAfter() {
        System.out.println("执行方法后额外的操作...");
    }

}
```

intercept() 方法涉及到 4 个参数：

- Object o：被代理对象
- Method method：被拦截的方法
- Object[] objects：被拦截方法的所有入参值
- MethodProxy methodProxy：方法代理，用于调用原始的方法

> 对于 `methodProxy` 参数调用的方法，在其内部有两种选择：`invoke()` 和 `invokeSuper()` ，二者的区别不在本文展开说明，感兴趣的读者可以参考本篇文章：[Cglib源码分析 invoke和invokeSuper的差别](https://blog.csdn.net/makecontral/article/details/79593732?utm_medium=distribute.pc_relevant.none-task-blog-baidulandingword-4&spm=1001.2101.3001.4242)

在 `getInstance()` 方法中，利用 `Enhancer` 类实例化代理对象（可以看作是小红）返回给调用者小明，即可完成代理操作。

```java
public class XiaoMing {
    public static void main(String[] args) {
        SellProxyFactory sellProxyFactory = new SellProxyFactory();
        // 获取一个代理实例
        SellPerfumeFactory proxyInstance =
                (SellPerfumeFactory) sellProxyFactory.getProxyInstance(new SellPerfumeFactory());
        // 创建代理类
        proxyInstance.sellPerfume(1999.99);
    }
}
```

我们关注点依旧放在可扩展性和可维护性上，Cglib 依旧符合**开闭原则**，如果小明需要小红代理购买红酒，该如何做呢？这里碍于篇幅原因，我不再将完整的代码贴出来了，可以自己试着手动实现一下，或者在心里有一个大概的实现思路即可。

我们来总结一下 CGLIB 动态代理：

（1）CGLIB 的使用方法：

- 代理工厂需要**实现 MethodInterceptor 接口**，并重写方法，**内部关联真实对象**，控制第三者对真实对象的访问；代理工厂内部暴露 `getInstance(Object realObject)` 方法，**用于从代理工厂中获取一个代理对象实例**。
-  `Enhancer` 类用于从代理工厂中实例化一个代理对象，给调用者提供代理服务。

### JDK Proxy 和 CGLIB 的对比

（2）仔细对比一下，JDK Proxy 和 CGLIB 具有相似之处：

|                            |     JDK Proxy     |       CGLIB       |
| :------------------------: | :---------------: | :---------------: |
|      代理工厂实现接口      | InvocationHandler | MethodInterceptor |
| 构造代理对象给 Client 服务 |       Proxy       |     Enhancer      |

二者都是用到了两个核心的类，它们也有不同：

- 最明显的不同：CGLIB 可以代理**大部分类**（第二点说到）；而 JDK Proxy **仅能够代理实现了接口的类**

- CGLIB 采用动态创建被代理类的子类实现方法拦截，子类内部重写被拦截的方法，所以 CGLIB 不能代理被 `final` 关键字修饰的类和方法

> 细心的读者会发现，讲的东西都是**浅尝辄止**~~（你都没有给我讲源码，水文实锤）~~，动态代理的精髓在于**程序在运行时动态生成代理类对象，拦截调用方法，在调用方法前后扩展额外的功能**，而生成动态代理对象的原理就是**反射机制**，在上一篇文章中，我详细讲到了如何利用反射实例化对象，调用方法······在代理中运用得淋漓尽致，所以反射和代理也是天生的一对，谈到其中一个，必然会涉及另外一个。

## 动态代理的实际应用

传统的 OOP 编程符合从上往下的编码关系，却不符合从左往右的编码关系，如果你看不懂，可以参考下面的动图，OOP 满足我们一个方法一个方法从上往下地执行，但是却不能**从左往右嵌入代码**，而 AOP 的出现很好地弥补了这一点，它**允许我们将重复的代码逻辑抽取出来形成一个单独的覆盖层**，在执行代码时可以将该覆盖层毫无知觉的嵌入到原代码逻辑里面去。

### Spring AOP

如下图所示，method1 和 method2 都需要在方法执行前后**记录日志**，实际上会有更多的方法需要记录日志，传统的 OOP 只能够让我们在每个方法前后手动记录日志，大量的`Log.info`存在于方法内部，导致代码阅读性下降，方法内部无法专注于自己的逻辑。

**AOP 可以将这些重复性的代码包装到额外的一层，监听方法的执行，当方法被调用时，通用的日志记录层会拦截掉该方法，在该方法调用前后记录日志，这样可以让方法专注于自己的业务逻辑而无需关注其它不必要的信息。**

<img src="https://mmbiz.qpic.cn/mmbiz_gif/libYRuvULTdWACbPmP3IthmrrO6mkE1YtPpC51RzVtTGyS2nCjrMfRSoU8qrnNicFfFjeQZOGQvJibdibmiciahRMOXA/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1">

Spring AOP 有许多功能：提供缓存、提供日志环绕、事务处理······在这里，我会以**事务**作为例子向你讲解 Spring 底层是如何使用动态代理的。

Spring 的事务涉及到一个核心注解`@Transactional`，相信很多人在项目中都用到过，加上这个注解之后，在执行方法时如果发生异常，该方法内所有的事务都回滚，否则全部提交生效，这是最宏观的表现，它内部是如何实现的呢？今天就来简单分析一下。

每个有关数据库的操作都要保证一个事务内的所有操作，要么全部执行成功，要么全部执行失败，传统的事务失败回滚和成功提交是使用`try...catch`代码块完成的

```java
SqlSession session = null;
try{
    session = getSqlSessionFactory().openSession(false);
    session.update("...", new Object());
    // 事务提交
    session.commit();
}catch(Exception e){
    // 事务回滚
    session.rollback();
    throw e;
}finally{
    // 关闭事务
    session.close();
}
```

如果多个方法都需要写这一段逻辑非常冗余，所以 Spring 给我们封装了一个注解 @Transactional，使用它后，调用方法时会监视方法，如果方法上含有该注解，就会自动帮我们把数据库相关操作的代码包裹起来，最终形成类似于上面的一段代码原理，当然这里并不准确，只是给你们一个大概的总览，了解Spring AOP 的本质在干什么，这篇文章讲解到这里，知识量应该也非常多了，好好消化上面的知识点，为后面的 Spring AOP 专题学习打下坚实的基础。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


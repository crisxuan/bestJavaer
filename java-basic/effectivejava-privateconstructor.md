# Effective Java - 构造器私有、枚举和单例

Singleton 是指仅仅被实例化一次的类。Singleton代表了无状态的对象像是方法或者本质上是唯一的系统组件。使类称为Singleton 会使它的客户端测试变得十分困难。因为不可能给Singleton替换模拟实现。除非实现一个充当其类型的接口

## 饿汉式单例

### 静态常量

下面有两种方法实现一个单例，两者都基于保持构造器私有并且导出一个公有的静态成员提供一个唯访问该实例的入口。在第一种方法中，这个成员的属性是`final`的

```java
// 提供属性是公有的、唯一的单例
public class Elvis {
  public static final Elvis INSTANCE = new Elvis();
  private Elvis();
  
  public void leaveTheBuilding();
}
```

这是一个饿汉式的实现。这个私有的构造器仅仅被调用一次，因为Elvis 是 `static final`的，所以`INSTANCE`是一个常量，编译期间进行初始化，并且值只能被初始化一次，致使`INSTANCE`不能再指向任意其他的对象，没有任何客户端能够改变这个结果。但是需要注意一点：有特权的客户端能够使用反射中的`AccessibleObject.setAccessible`访问私有的构造器。为了防御这种攻击，把构造器修改为在第二次实例化的时候抛出异常。见如下的例子

```java
public class Elvis {

    static boolean flag = false;
    private Elvis(){
        if(flag == false) {
            flag = !flag;
        }
        else {
            throw new RuntimeException("单例模式被侵犯！");
        }
    }

    public static class SingletonHolder {
        private static final Elvis INSTANCE = new Elvis();
    }

    public static Elvis getInstance(){
        return SingletonHolder.INSTANCE;
    }

    public static void main(String[] args) throws Exception {
        Class<Elvis> el = Elvis.class;
        // 获得无参数私有的构造器
        Constructor<Elvis> constructor = el.getDeclaredConstructor();
        // 暴力破解private 私有化
        constructor.setAccessible(true);
        // 生成新的实例
        Elvis elvis = constructor.newInstance();
        Elvis instance = Elvis.getInstance();
        System.out.println(elvis == instance);

    }
}
```

```java
Exception in thread "main" java.lang.ExceptionInInitializerError
	at effectiveJava.effective03.Elvis.getInstance(Elvis.java:22)
	at effectiveJava.effective03.Elvis.main(Elvis.java:33)
Caused by: java.lang.RuntimeException: 单例模式被侵犯！
	at effectiveJava.effective03.Elvis.<init>(Elvis.java:13)
	at effectiveJava.effective03.Elvis.<init>(Elvis.java:5)
	at effectiveJava.effective03.Elvis$SingletonHolder.<clinit>(Elvis.java:18)
	... 2 more
```

注释掉利用反射获取私有构造函数的代码，发现instance实例可以正常输出

```java
Elvis instance = Elvis.getInstance();
System.out.println(instance);
```

> console: effectiveJava.effective03.Elvis@266474c2

在实现Singleton 的第二种方法中，公有的成员是个静态方法

```java
public class ElvisSingleton {

    private static final ElvisSingleton INSTANCE = new ElvisSingleton();
    private ElvisSingleton(){}
    public static ElvisSingleton newInstance(){
        return INSTANCE;
    }
    public void leaveBuilding(){}
    
}
```

对于静态方法`newInstance`来说所有的调用，都会返回一个INSTANCE对象，所以，永远不会创建其他`ElvisSingleton`实例

公有属性最大的优势在于能够很清楚的描述类是单例的：公有的属性是final的，所以总是能够包含相同的对象引用。第二个优势就是就是比较简单。

### 静态代码块

静态代码块是静态常量的变种，就是把静态常量的初始化放在了静态代码块中解析，初始化。读者可能对这种方式产生疑惑，请详见

> 类加载机制 https://blog.csdn.net/ns_code/article/details/17881581

```java
public class ElvisStaticBlock {

    private static final ElvisStaticBlock block;
    static {
        block = new ElvisStaticBlock();
    }

    private ElvisStaticBlock(){}
    public static ElvisStaticBlock newInstance(){
        return block;
    }
}
```

优点：这种写法比较简单，就是在类装载的时候就完成实例化。避免了线程同步问题。

缺点：在类装载的时候就完成实例化，没有达到Lazy Loading的效果。如果从始至终从未使用过这个实例，则会造成内存的浪费。

## 懒汉式单例

与饿汉式对应的就是懒汉式，这两者都是属于单例模式的应用，懒汉式含有一层懒加载(lazy loading)的概念，也叫做惰性初始化。

```java
public class ElvisLazyLoading {

    private static ElvisLazyLoading instance;
    private ElvisLazyLoading(){}

    public static ElvisLazyLoading newInstance(){
        if(instance == null){
            instance = new ElvisLazyLoading();
        }
        return instance;
    }
}
```

初始的时候不会对INSTANCE进行初始化，它的默认值是null，在调用`newInstance`方法时会判断，若INSTANCE为null，则会把INSTANCE的引用指向ElvisLazyLoading的构造方法。

这种方式能够实现一个懒加载的思想，但是**这种写法会存在并发问题**，由于多线程各自运行自己的执行路径，当同时执行到 INSTANCE = new ElvisLazyLoading() 代码时，各自的线程都认为自己应该创建一个新的ElvisLazyLoading对象，所以最后的结果可能会存在多个ElvisLazyLoading 实例，所以这种方式不推荐使用

### 尝试加锁

很显然的，可以尝试对`newInstance()`方法加锁来避免产生并发问题，但是这种方式不可能，由`synchronized`加锁会导致整个方法开销太大，在遇见类似问题时，应该尝试换一种方式来解决，而不应该只通过简单粗暴的加锁来解决一切并发问题。

```java
public synchronized static ElvisLazyLoading newInstance(){
  if(INSTANCE == null){
    INSTANCE = new ElvisLazyLoading();
  }
  return INSTANCE;
}
```

### 同步代码块

`synchronized`关键字不仅可以锁住方法的执行，也可以对方法中的某一块代码进行锁定，也叫做同步代码块

```java
public class Singleton {

    private static Singleton instance;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                instance = new Singleton();
            }
        }
        return instance;
    }
}
```

不要觉得只要加锁了，就不会存在线程安全问题，线程是Java中很重要的一个课题，需要细细研究。这种同步代码块的方式也会存在线程安全问题，当多个线程同时判断自己的singleton 实例为null的时候，同样会创建多个实例。

### 双重检查

Double-Check概念对于多线程开发者来说不会陌生，如代码中所示，我们进行了两次if (instance == null)检查，这样就可以保证线程安全了。这样，实例化代码只用执行一次，后面再次访问时，判断if (instance == null)，直接return实例化对象。

```java
public class ElvisDoubleCheck {

    private static volatile ElvisDoubleCheck instance;
    private ElvisDoubleCheck(){}

    public static ElvisDoubleCheck newInstance(){
        if(instance == null){
            synchronized (ElvisDoubleCheck.class){
                if (instance == null){
                    instance = new ElvisDoubleCheck();
                }
            }
        }
        return instance;
    }
}
```

优点：线程安全；延迟加载；效率较高。

## 静态内部类单例

静态内部类的单例与饿汉式采用的机制类似，但又有不同。两者都是采用了类装载的机制来保证初始化实例时只有一个线程。不同的地方在饿汉式方式是只要Elvis类被装载就会实例化，没有Lazy-Loading的作用，而静态内部类方式在ElvisStaticInnerClass类被装载时并不会立即实例化，而是在需要实例化时，调用newInstance方法，才会装载SingletonInstance类，从而完成ElvisStaticInnerClass的实例化。

```java
public class ElvisStaticInnerClass {

    private ElvisStaticInnerClass(){}

    private static class SingletonInstance{
        private static final ElvisStaticInnerClass instance = new ElvisStaticInnerClass();
    }

    public static ElvisStaticInnerClass newInstance(){
        return SingletonInstance.instance;
    }
}
```

优点：避免了线程不安全，延迟加载，效率高。

## 枚举单例

实现Singleton的第四种方法是声明一个包含单个元素的枚举类型

```java
public enum  ElvisEnum {

    INSTANCE;

    public void leaveTheBuilding(){}
}
```

这种方法在功能上与公有域方法相似，但更加简洁。无偿地提供了序列化机制，有效防止多次实例化，即使在面对复杂的序列化或者反射攻击的时候。**单元素的枚举类型经常成为实现Singleton的最佳方法**。

**优点**: 系统内存中该类只存在一个对象，节省了系统资源，对于一些需要频繁创建销毁的对象，使用单例模式可以提高系统性能。

**缺点**：当想实例化一个单例类的时候，必须要记住使用相应的获取对象的方法，而不是使用new，可能会给其他开发人员造成困扰，特别是看不到源码的时候。

**后记**：

看完本文，你是否对**构造器私有、枚举和单例**这个主题有了新的认知呢？

你至少应该了解：

1. 单例模式的几种写法及其优缺点分析
2. 为什么反射能够对私有构造器产生破坏？
3. 有哪几种比较好用的线程安全的单例模式？



参考资料：

如何防止单例模式被JAVA反射攻击 https://blog.csdn.net/u013256816/article/details/50525335

[单例模式的八种写法比较](https://www.cnblogs.com/zhaoyan001/p/6365064.html)

《Effective Java》


# 深入理解 static 关键字

* [深入理解 static 关键字](#深入理解-static-关键字)
   * [初识 static 关键字](#初识-static-关键字)
      * [static 修饰变量](#static-修饰变量)
      * [static 修饰方法](#static-修饰方法)
      * [static 修饰代码块](#static-修饰代码块)
      * [static 用作静态内部类](#static-用作静态内部类)
      * [静态导包](#静态导包)
   * [static 进阶知识](#static-进阶知识)
      * [关于 static 的所属类](#关于-static-的所属类)
      * [static 修饰变量的存储位置](#static-修饰变量的存储位置)
      * [static 变量的生命周期](#static-变量的生命周期)
      * [static 序列化](#static-序列化)
      * [类加载顺序](#类加载顺序)
      * [static 经常用作日志打印](#static-经常用作日志打印)
      * [static 经常用作单例模式](#static-经常用作单例模式)
   * [类的构造器是否是 static 的](#类的构造器是否是-static-的)

static 是我们日常生活中经常用到的关键字，也是 Java 中非常重要的一个关键字，static 可以修饰变量、方法、做静态代码块、静态导包等，下面我们就来具体聊一聊这个关键字，我们先从基础开始，从基本用法入手，然后分析其原理、优化等。

## 初识 static 关键字

### static 修饰变量

`static` 关键字表示的概念是 `全局的、静态的`，用它修饰的变量被称为`静态变量`。

```java
public class TestStatic {
    
    static int i = 10; // 定义了一个静态变量 i 
}
```

静态变量也被称为类变量，静态变量是属于这个类所有的。什么意思呢？这其实就是说，static 关键字只能定义在类的 `{}` 中，而不能定义在任何方法中。

![](http://www.cxuan.vip/image-20230204151700269.png)

就算把方法中的 static 关键字去掉也是一样的。

![](http://www.cxuan.vip/image-20230204151709862.png)

static 属于类所有，由类来直接调用 static 修饰的变量，它不需要手动实例化类进行调用

```java
public class TestStatic {

    static int i = 10;

    public static void main(String[] args) {
        System.out.println(TestStatic.i);
    }
}
```

**这里你需要理解几个变量的概念**

* 定义在构造方法、代码块、方法`外`的变量被称为实例变量，实例变量的副本数量和实例的数量一样。
* 定义在方法、构造方法、代码块`内`的变量被称为局部变量；
* 定义在方法参数`中`的变量被称为参数。

### static 修饰方法

static 可以修饰方法，被 static 修饰的方法被称为`静态方法`，其实就是在一个方法定义中加上 `static` 关键字进行修饰，例如下面这样

```java
static void sayHello(){}
```

《Java 编程思想》在 P86 页有一句经典的描述

**static 方法就是没有 this 的方法，在 static 内部不能调用非静态方法，反过来是可以的。而且可以在没有创建任何对象的前提下，仅仅通过类本身来调用 static 方法，这实际上是 static 方法的主要用途**。

其中有一句非常重要的话就是 **static 方法就是没有 this 的方法**，也就是说，可以在不用创建对象的前提下就能够访问 static 方法，如何做到呢？看下面一段代码

![](http://www.cxuan.vip/image-20230204151725083.png)

在上面的例子中，由于 `staticMethod` 是静态方法，所以能够使用 类名.变量名进行调用。

因此，如果说想在不创建对象的情况下调用某个方法，就可以将这个方法设置为 static。平常我们见的最多的 static 方法就是 main方 法，至于为什么 main 方法必须是 static 的，现在应该很清楚了。因为程序在执行 main 方法的时候没有创建任何对象，因此只有通过类名来访问。

**static 修饰方法的注意事项**

* 首先第一点就是最常用的，不用创建对象，直接`类名.变量名` 即可访问；
* static 修饰的方法内部不能调用非静态方法；

![](http://www.cxuan.vip/image-20230204151735893.png)

* 非静态方法内部可以调用 static 静态方法。

![](http://www.cxuan.vip/image-20230204151745628.png)

### static 修饰代码块

static 关键字可以用来修饰代码块，代码块分为两种，一种是使用 `{}` 代码块；一种是 `static {}` 静态代码块。static 修饰的代码块被称为静态代码块。静态代码块可以置于类中的任何地方，类中可以有多个 static 块，在类初次被加载的时候，会按照 static 代码块的顺序来执行，每个 static 修饰的代码块只能执行一次。我们会面会说一下代码块的加载顺序。下面是静态代码块的例子

![](http://www.cxuan.vip/image-20230204151756784.png)

static 代码块可以用来**优化程序执行顺序**，是因为它的特性：只会在类加载的时候执行一次。

### static 用作静态内部类

内部类的使用场景比较少，但是内部类还有具有一些比较有用的。在了解静态内部类前，我们先看一下内部类的分类

* 普通内部类
* 局部内部类
* 静态内部类
* 匿名内部类

`静态内部类`就是用 static 修饰的内部类，静态内部类可以包含静态成员，也可以包含非静态成员，但是在非静态内部类中不可以声明静态成员。

静态内部类有许多作用，由于非静态内部类的实例创建需要有外部类对象的引用，所以非静态内部类对象的创建必须依托于外部类的实例；而静态内部类的实例创建只需依托外部类；

并且由于非静态内部类对象持有了外部类对象的引用，因此非静态内部类可以访问外部类的非静态成员；而静态内部类只能访问外部类的静态成员；

* 内部类需要脱离外部类对象来创建实例
* 避免内部类使用过程中出现内存溢出

```java
public class ClassDemo {
  
    private int a = 10;
    private static int b = 20;

    static class StaticClass{
        public static int c = 30;
        public int d = 40;
      
        public static void print(){
            //下面代码会报错，静态内部类不能访问外部类实例成员
            //System.out.println(a);
     
            //静态内部类只可以访问外部类类成员
            System.out.println("b = "+b);
            
        }
      
        public void print01(){
            //静态内部内所处的类中的方法，调用静态内部类的实例方法，属于外部类中调用静态内部类的实例方法
            StaticClass sc = new StaticClass();
            sc.print();
        }   
    }
}
```

### 静态导包

不知道你注意到这种现象没有，比如你使用了 `java.util` 内的工具类时，你需要导入 java.util 包，才能使用其内部的工具类，如下

![](http://www.cxuan.vip/image-20230204151807592.png)

但是还有一种导包方式是使用`静态导包`，静态导入就是使用 `import static` 用来导入某个类或者某个包中的静态方法或者静态变量。

```java
import static java.lang.Integer.*;

public class StaticTest {

    public static void main(String[] args) {
        System.out.println(MAX_VALUE);
        System.out.println(toHexString(111));
    }
}
```

## static 进阶知识

我们在了解了 static 关键字的用法之后，来看一下 static 深入的用法，也就是由浅入深，慢慢来，前戏要够～

### 关于 static 的所属类

static 所修饰的属性和方法都属于类的，不会属于任何对象；它们的调用方式都是 `类名.属性名/方法名`，而实例变量和局部变量都是属于具体的对象实例。

### static 修饰变量的存储位置

首先，先来认识一下 JVM 的不同存储区域。

![](http://www.cxuan.vip/image-20230204151817230.png)

* `虚拟机栈` : Java 虚拟机栈是线程私有的数据区，Java 虚拟机栈的生命周期与线程相同，虚拟机栈也是局部变量的存储位置。方法在执行过程中，会在虚拟机栈种创建一个 `栈帧(stack frame)`。
* `本地方法栈`: 本地方法栈也是线程私有的数据区，本地方法栈存储的区域主要是 Java 中使用 `native` 关键字修饰的方法所存储的区域

* `程序计数器`：程序计数器也是线程私有的数据区，这部分区域用于存储线程的指令地址，用于判断线程的分支、循环、跳转、异常、线程切换和恢复等功能，这些都通过程序计数器来完成。
* `方法区`：方法区是各个线程共享的内存区域，它用于存储虚拟机加载的 类信息、常量、静态变量、即时编译器编译后的代码等数据，也就是说，**static 修饰的变量存储在方法区中**
* `堆`： 堆是线程共享的数据区，堆是 JVM 中最大的一块存储区域，所有的对象实例，包括**实例变量都在堆上**进行相应的分配。

### static 变量的生命周期

static 变量的生命周期与类的生命周期相同，随类的加载而创建，随类的销毁而销毁；普通成员变量和其所属的生命周期相同。

### static 序列化

我们知道，序列化的目的就是为了 **把 Java 对象转换为字节序列**。对象转换为有序字节流，以便其能够在网络上传输或者保存在本地文件中。

声明为 static 和 transient 类型的变量不能被序列化，因为 static 修饰的变量保存在方法区中，只有堆内存才会被序列化。而 `transient` 关键字的作用就是防止对象进行序列化操作。

### 类加载顺序

我们前面提到了类加载顺序这么一个概念，static 修饰的变量和静态代码块在使用前已经被初始化好了，类的初始化顺序依次是

加载父类的静态字段 -> 父类的静态代码块 -> 子类静态字段 -> 子类静态代码块 -> 父类成员变量（非静态字段）

-> 父类非静态代码块 -> 父类构造器  -> 子类成员变量 -> 子类非静态代码块 -> 子类构造器

### static 经常用作日志打印

我们在开发过程中，经常会使用 `static` 关键字作为日志打印，下面这行代码你应该经常看到

```java
private static final Logger LOGGER = LogFactory.getLoggger(StaticTest.class);
```

然而把 static 和 final 去掉都可以打印日志

```java
private final Logger LOGGER = LogFactory.getLoggger(StaticTest.class);
private Logger LOGGER = LogFactory.getLoggger(StaticTest.class);
```

但是这种打印日志的方式存在问题

对于每个 StaticTest 的实例化对象都会拥有一个 LOGGER，如果创建了1000个 StaticTest 对象，则会多出1000个Logger 对象，造成资源的浪费，因此通常会将 Logger 对象声明为 static 变量，这样一来，能够减少对内存资源的占用。

### static 经常用作单例模式

由于单例模式指的就是对于不同的类来说，它的副本只有一个，因此 static 可以和单例模式完全匹配。

下面是一个经典的双重校验锁实现单例模式的场景

```java
public class Singleton {
  
    private static volatile Singleton singleton;
 
    private Singleton() {}
 
    public static Singleton getInstance() {
        if (singleton == null) {
            synchronized (Singleton.class) {
                if (singleton == null) {
                    singleton = new Singleton();
                }
            }
        }
        return singleton;
    }
}
```

来对上面代码做一个简单的描述

使用 `static` 保证 singleton 变量是静态的，使用 `volatile` 保证 singleton 变量的可见性，使用私有构造器确保 Singleton 不能被 new 实例化。

使用 `Singleton.getInstance()` 获取 singleton 对象，首先会进行判断，如果 singleton 为空，会锁住 Singletion 类对象，这里有一些小伙伴们可能不知道为什么需要两次判断，这里来解释下

如果线程 t1 执行到 singleton == null 后，判断对象为 null，此时线程把执行权交给了 t2，t2 判断对象为 null，锁住 Singleton 类对象，进行下面的判断和实例化过程。如果不进行第二次判断的话，那么 t1 在进行第一次判空后，也会进行实例化过程，此时仍然会创建多个对象。

## 类的构造器是否是 static 的

这个问题我相信大部分小伙伴都没有考虑过，在 Java 编程思想中有这么一句话 **类的构造器虽然没有用 static 修饰，但是实际上是 static 方法**，但是并没有给出实际的解释，但是这个问题可以从下面几个方面来回答

* static 最简单、最方便记忆的规则就是没有 this 引用。而在类的构造器中，是有隐含的 this 绑定的，因为构造方法是和类绑定的，从这个角度来看，构造器不是静态的。
* 从类的方法这个角度来看，因为 `类.方法名`不需要新创建对象就能够访问，所以从这个角度来看，构造器也不是静态的
* 从 JVM 指令角度去看，我们来看一个例子

```java
public class StaticTest {

    public StaticTest(){}

    public static void test(){

    }

    public static void main(String[] args) {
        StaticTest.test();
        StaticTest staticTest = new StaticTest();
    }
}
```

我们使用 javap -c 生成 StaticTest 的字节码看一下

```assembly
public class test.StaticTest {
  public test.StaticTest();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: return

  public static void test();
    Code:
       0: return

  public static void main(java.lang.String[]);
    Code:
       0: invokestatic  #2                  // Method test:()V
       3: new           #3                  // class test/StaticTest
       6: dup
       7: invokespecial #4                  // Method "<init>":()V
      10: astore_1
      11: return
}

```

我们发现，在调用 static 方法时是使用的 `invokestatic` 指令，new 对象调用的是 `invokespecial` 指令，而且在 JVM 规范中 https://docs.oracle.com/javase/specs/jvms/se7/html/jvms-6.html#jvms-6.5.invokestatic 说到 

![](http://www.cxuan.vip/image-20230204151830997.png)

从这个角度来讲，`invokestatic` 指令是专门用来执行 static 方法的指令；`invokespecial` 是专门用来执行实例方法的指令；从这个角度来讲，构造器也不是静态的。

如果你在阅读文章的过程中发现错误和问题，请及时与我联系！

如果文章对你有帮助，希望小伙伴们三连走起！


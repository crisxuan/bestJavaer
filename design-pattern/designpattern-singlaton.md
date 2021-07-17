# 我向面试官讲解了单例模式，他对我竖起了大拇指

* [我向面试官讲解了单例模式，他对我竖起了大拇指](#我向面试官讲解了单例模式他对我竖起了大拇指)
   * [什么是单例模式](#什么是单例模式)
   * [单例模式的类型](#单例模式的类型)
      * [懒汉式创建单例对象](#懒汉式创建单例对象)
      * [饿汉式创建单例对象](#饿汉式创建单例对象)
   * [懒汉式如何保证只创建一个对象](#懒汉式如何保证只创建一个对象)
   * [使用 volatile 防止指令重排](#使用-volatile-防止指令重排)
   * [破坏懒汉式单例与饿汉式单例](#破坏懒汉式单例与饿汉式单例)
      * [利用<strong>反射</strong>破坏单例模式](#利用反射破坏单例模式)
      * [利用<strong>序列化与反序列化</strong>破坏单例模式](#利用序列化与反序列化破坏单例模式)
   * [让面试官鼓掌的枚举实现](#让面试官鼓掌的枚举实现)
      * [优势 1 ：一目了然的代码](#优势-1-一目了然的代码)
      * [优势 2：天然的线程安全与单一实例](#优势-2天然的线程安全与单一实例)
      * [优势 3：枚举保护单例模式不被破坏](#优势-3枚举保护单例模式不被破坏)
   * [总结](#总结)

单例模式相信大家都有所听闻，甚至也写过不少了，在面试中也是考得最多的其中一个设计模式，面试官常常会要求写出两种类型的单例模式并且解释其原理，废话不多说，我们开始学习如何很好地回答这一道面试题吧。

## 什么是单例模式

面试官问什么是单例模式时，千万不要答非所问，给出单例模式有两种类型之类的回答，要围绕单例模式的定义去展开。

单例模式是指在内存中只会创建且仅创建一次对象的设计模式。在程序中多次使用同一个对象且作用相同时，为了防止频繁地创建对象使得内存飙升，单例模式可以让程序仅在内存中创建一个对象，让所有需要调用的地方都共享这一单例对象。

![image.png](https://cdn.nlark.com/yuque/0/2020/png/1694029/1594515126698-896e6443-0f9e-4c8c-b4a0-bb04c9e1cb6d.png)

## 单例模式的类型

单例模式有两种类型：

- `懒汉式`：在真正需要使用对象时才去创建该单例类对象
- `饿汉式`：在类加载时已经创建好该单例对象，等待被程序使用

### 懒汉式创建单例对象

懒汉式创建对象的方法是在程序使用对象前，先判断该对象是否已经实例化（判空），若已实例化直接返回该类对象。否则则先执行实例化操作。

![image.png](https://cdn.nlark.com/yuque/0/2020/png/1694029/1594515539226-eb87f0e1-1620-4afc-b140-a3dfb0b16dcc.png)

根据上面的流程图，就可以写出下面的这段代码

```java
public class Singleton {
    
    private static Singleton singleton;
    
    private Singleton(){}
    
    public static Singleton getInstance() {
        if (singleton == null) {
            singleton = new Singleton();
        }
        return singleton;
    }
    
}
```

没错，这里我们已经写出了一个很不错的单例模式，不过它不是完美的，但是这并不影响我们使用这个“单例对象”。

以上就是懒汉式创建单例对象的方法，我会在后面解释这段代码在哪里可以优化，存在什么问题。

### 饿汉式创建单例对象

饿汉式在`类加载`时已经创建好该对象，在程序调用时直接返回该单例对象即可，即我们在编码时就已经指明了要马上创建这个对象，不需要等到被调用时再去创建。

关于类加载，涉及到JVM的内容，我们目前可以简单认为在程序启动时，这个单例对象就已经创建好了。

![image.png](https://cdn.nlark.com/yuque/0/2020/png/1694029/1594518636582-637dcf6a-8091-40d4-9acc-46faca9e3cd2.png)

```Java
public class Singleton{
    
    private static final Singleton singleton = new Singleton();
    
    private Singleton(){}
    
    public static Singleton getInstance() {
        return singleton;
    }
}
```

注意上面的代码在第3行已经实例化好了一个Singleton对象在内存中，不会有多个Singleton对象实例存在

类在加载时会在堆内存中创建一个Singleton对象，当类被卸载时，Singleton对象也随之消亡了。

## 懒汉式如何保证只创建一个对象

我们再来回顾懒汉式的核心方法

```Java
public static Singleton getInstance() {
    if (singleton == null) {
        singleton = new Singleton();
    }
    return singleton;
}
```

这个方法其实是存在问题的，试想一下，如果两个线程同时判断 singleton 为空，那么它们都会去实例化一个Singleton 对象，这就变成多例了。所以，我们要解决的是`线程安全`问题。

![image.png](https://cdn.nlark.com/yuque/0/2020/png/1694029/1594520692655-e1cc0538-165f-4615-9880-bbbb7a1f92a8.png)

最容易想到的解决方法就是在方法上加锁，或者是对类对象加锁，程序就会变成下面这个样子

```Java
public static synchronized Singleton getInstance() {
    if (singleton == null) {
        singleton = new Singleton();
    }
    return singleton;
}
// 或者
public static Singleton getInstance() {
    synchronized(Singleton.class) {   
        if (singleton == null) {
            singleton = new Singleton();
        }
    }
    return singleton;
}
```

这样就规避了两个线程同时创建Singleton对象的风险，但是引来另外一个问题：**每次去获取对象都需要先获取锁，并发性能非常地差，极端情况下，可能会出现卡顿现象。**

接下来要做的就是`优化性能`：目标是如果没有实例化对象则加锁创建，如果已经实例化了，则不需要加锁，直接获取实例

所以直接在方法上加锁的方式就被废掉了，因为这种方式无论如何都需要先获取锁

```Java
public static Singleton getInstance() {
    if (singleton == null) {  // 线程A和线程B同时看到singleton = null，如果不为null，则直接返回singleton
        synchronized(Singleton.class) { // 线程A或线程B获得该锁进行初始化
            if (singleton == null) { // 其中一个线程进入该分支，另外一个线程则不会进入该分支
                singleton = new Singleton();
            }
        }
    }
    return singleton;
}
```

上面的代码已经完美地解决了**并发安全 + 性能低效**问题：

- 第 2 行代码，如果 singleton 不为空，则直接返回对象，不需要获取锁；而如果多个线程发现 singleton 为空，则进入分支；
- 第 3 行代码，多个线程尝试争抢同一个锁，只有一个线程争抢成功，第一个获取到锁的线程会再次判断singleton 是否为空，因为 singleton 有可能已经被之前的线程实例化
- 其它之后获取到锁的线程在执行到第 4 行校验代码，发现 singleton 已经不为空了，则不会再 new 一个对象，直接返回对象即可
- 之后所有进入该方法的线程都不会去获取锁，在第一次判断 singleton 对象时已经不为空了

因为需要两次判空，且对类对象加锁，该懒汉式写法也被称为：**Double Check（双重校验） + Lock（加锁）**

完整的代码如下所示：

```Java
public class Singleton {
    
    private static Singleton singleton;
    
    private Singleton(){}
    
    public static Singleton getInstance() {
        if (singleton == null) {  // 线程A和线程B同时看到singleton = null，如果不为null，则直接返回singleton
            synchronized(Singleton.class) { // 线程A或线程B获得该锁进行初始化
                if (singleton == null) { // 其中一个线程进入该分支，另外一个线程则不会进入该分支
                    singleton = new Singleton();
                }
            }
        }
        return singleton;
    }
    
}
```

上面这段代码已经近似完美了，但是还存在最后一个问题：指令重排

## 使用 volatile 防止指令重排

创建一个对象，在 JVM 中会经过三步：

（1）为 singleton 分配内存空间

（2）初始化 singleton 对象

（3）将 singleton 指向分配好的内存空间

指令重排序是指：**JVM 在保证最终结果正确的情况下，可以不按照程序编码的顺序执行语句，尽可能提高程序的性能**

在这三步中，第 2、3 步有可能会发生指令重排现象，创建对象的顺序变为 1-3-2，会导致多个线程获取对象时，有可能线程 A 创建对象的过程中，执行了 1、3 步骤，线程 B 判断 singleton 已经不为空，获取到未初始化的singleton 对象，就会报 NPE 异常。文字较为晦涩，可以看流程图：

![image.png](https://cdn.nlark.com/yuque/0/2020/png/1694029/1594522390797-4df0d008-372c-491f-8b9a-f860f80371ab.png)

使用 volatile 关键字可以**防止指令重排序，**其原理较为复杂，这篇文章不打算展开，可以这样理解：**使用 volatile 关键字修饰的变量，可以保证其指令执行的顺序与程序指明的顺序一致，不会发生顺序变换**，这样在多线程环境下就不会发生 NPE 异常了。

> volatile 还有第二个作用：使用 volatile 关键字修饰的变量，可以保证其内存可见性，即每一时刻线程读取到该变量的值都是内存中最新的那个值，线程每次操作该变量都需要先读取该变量。

最终的代码如下所示：

```Java
public class Singleton {
    
    private static volatile Singleton singleton;
    
    private Singleton(){}
    
    public static Singleton getInstance() {
        if (singleton == null) {  // 线程A和线程B同时看到singleton = null，如果不为null，则直接返回singleton
            synchronized(Singleton.class) { // 线程A或线程B获得该锁进行初始化
                if (singleton == null) { // 其中一个线程进入该分支，另外一个线程则不会进入该分支
                    singleton = new Singleton();
                }
            }
        }
        return singleton;
    }
    
}
```

## 破坏懒汉式单例与饿汉式单例

无论是完美的懒汉式还是饿汉式，终究敌不过**反射和序列化**，它们俩都可以把单例对象破坏掉（产生多个对象）。

### 利用**反射**破坏单例模式

下面是一段使用反射破坏单例模式的例子

```java
public static void main(String[] args) {
    // 获取类的显式构造器
    Constructor<Singleton> construct = Singleton.class.getDeclaredConstructor();
    // 可访问私有构造器
    construct.setAccessible(true); 
    // 利用反射构造新对象
    Singleton obj1 = construct.newInstance(); 
    // 通过正常方式获取单例对象
    Singleton obj2 = Singleton.getInstance(); 
    System.out.println(obj1 == obj2); // false
}
```

上述的代码一针见血了：利用反射，强制访问类的私有构造器，去创建另一个对象

### 利用**序列化与反序列化**破坏单例模式

下面是一种使用序列化和反序列化破坏单例模式的例子

```java
public static void main(String[] args) {
    // 创建输出流
    ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("Singleton.file"));
    // 将单例对象写到文件中
    oos.writeObject(Singleton.getInstance());
    // 从文件中读取单例对象
    File file = new File("Singleton.file");
    ObjectInputStream ois =  new ObjectInputStream(new FileInputStream(file));
    Singleton newInstance = (Singleton) ois.readObject();
    // 判断是否是同一个对象
    System.out.println(newInstance == Singleton.getInstance()); // false
}
```

两个对象地址不相等的原因是：readObject() 方法读入对象时它必定会返回一个新的对象实例，必然指向新的内存地址。

## 让面试官鼓掌的枚举实现

我们已经掌握了懒汉式与饿汉式的常见写法了，通常情况下到这里已经足够了。但是，追求极致的我们，怎么能够止步于此，在《Effective Java》书中，给出了终极解决方法，话不多说，学完下面，真的不虚面试官考你了。

在 JDK 1.5 后，使用 Java 语言实现单例模式的方式又多了一种：`枚举`

枚举实现单例模式完整代码如下：

```java
public enum Singleton {
    INSTANCE;
    
    public void doSomething() {
        System.out.println("这是枚举类型的单例模式！");
    }
}
```

使用枚举实现单例模式较其它两种实现方式的优势有 3 点，让我们来细品。

### 优势 1 ：一目了然的代码

代码对比饿汉式与懒汉式来说，更加地简洁。最少只需要3行代码，就可以完成一个单例模式：

```java
public enum Test {
    INSTANCE;
}
```

我们从最直观的地方入手，第一眼看到这3行代码，就会感觉到`少`，没错，就是少，虽然这优势有些牵强，但写的代码越少，越不容易出错。

### 优势 2：天然的线程安全与单一实例

它不需要做任何额外的操作，就可以保证对象单一性与线程安全性。

我写了一段测试代码放在下面，这一段代码可以证明程序启动时仅会创建一个 Singleton 对象，且是线程安全的。

> 我们可以简单地理解枚举创建实例的过程：在程序启动时，会调用 Singleton 的空参构造器，实例化好一个Singleton 对象赋给 INSTANCE，之后再也不会实例化

```java
public enum Singleton {
    INSTANCE;
    Singleton() { System.out.println("枚举创建对象了"); }
    public static void main(String[] args) { /* test(); */ }
    public void test() {
        Singleton t1 = Singleton.INSTANCE;
        Singleton t2 = Singleton.INSTANCE;
        System.out.print("t1和t2的地址是否相同：" + t1 == t2);
    }
}
// 枚举创建对象了
// t1和t2的地址是否相同：true
```

除了优势1和优势2，还有最后一个优势是 `保护单例模式`，它使得枚举在当前的单例模式领域已经是 `无懈可击` 了

### 优势 3：枚举保护单例模式不被破坏

使用枚举可以防止调用者使用**反射、序列化与反序列化**机制强制生成多个单例对象，破坏单例模式。

**防反射**

<img src="https://cdn.nlark.com/yuque/0/2020/png/1694029/1595084326438-81a9057b-20fb-4329-8459-ddb2eccb0d45.png" alt="image-20200718213354831.png" style="zoom:60%;" />

枚举类默认继承了 Enum 类，在利用反射调用 newInstance() 时，会判断该类是否是一个枚举类，如果是，则抛出异常。

**防止反序列化创建多个枚举对象**

在读入 Singleton 对象时，每个枚举类型和枚举名字都是唯一的，所以在序列化时，仅仅只是对枚举的类型和变量名输出到文件中，在读入文件反序列化成对象时，使用 Enum 类的 valueOf(String name) 方法根据变量的名字查找对应的枚举对象。

所以，在序列化和反序列化的过程中，只是写出和读入了枚举类型和名字，没有任何关于对象的操作。

<img src="https://cdn.nlark.com/yuque/0/2020/png/1694029/1595084368019-d6753785-c4ec-4b80-981e-a371c9be419c.png" alt="image-20200718224707754.png" style="zoom:50%;" />

小结：

（1）Enum 类内部使用**Enum 类型判定**防止通过反射创建多个对象

（2）Enum 类通过写出（读入）对象类型和枚举名字将对象序列化（反序列化），**通过 valueOf() 方法匹配枚举名**找到内存中的唯一的对象实例，防止通过反序列化构造多个对象

（3）枚举类不需要关注线程安全、破坏单例和性能问题，因为其创建对象的时机与**饿汉式单例有异曲同工之妙**。

## 总结

（1）单例模式常见的写法有两种：懒汉式、饿汉式

（2）懒汉式：在需要用到对象时才实例化对象，正确的实现方式是：Double Check + Lock，解决了并发安全和性能低下问题

（3）饿汉式：在类加载时已经创建好该单例对象，在获取单例对象时直接返回对象即可，不会存在并发安全和性能问题。

（4）在开发中如果对内存要求非常高，那么使用懒汉式写法，可以在特定时候才创建该对象；

（5）如果对内存要求不高使用饿汉式写法，因为简单不易出错，且没有任何并发安全和性能问题

（6）为了防止多线程环境下，因为指令重排序导致变量报NPE，需要在单例对象上添加 volatile 关键字防止指令重排序

（7）最优雅的实现方式是使用枚举，其代码精简，没有线程安全问题，且 Enum 类内部防止反射和反序列化时破坏单例。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


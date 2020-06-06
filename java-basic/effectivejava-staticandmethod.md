# Effective Java - 静态方法与构造器

## 用静态工厂方法替代构造器?

传统来讲，为了使客户端能够获取它自身的一个实例，最传统的方法就是提供一个公有的构造器。像下面这样

```java
public class Apple {

    public Apple(){}

    public static void main(String[] args) {
        Apple apple = new Apple();
    }
}
```

还有另外一种方式，为类提供静态工厂方法，它只是返回一个类的静态方法，下面是它的构造

```java
public static Boolean valueOf(boolean b){
  return b ? Boolean.TRUE : Boolean.FALSE;
}
```

上面代码定义了一个`valueof(boolean b)`的静态方法，此方法的返回值是一个对**常量**的的引用，为什么说是常量？跟踪代码进去发现，TRUE是使用**static final** 修饰的。`Boolean.TRUE` 实际指向的就是一个`Boolean`类的带有**boolean类型**构造函数。

```java
public static final Boolean TRUE = new Boolean(true);
```

>注意：此静态工厂方法与设计模式中的工厂方法模式不同，本条目中所指的静态方法并不直接对应设计模式中的工厂方法。

那么我们为苹果增加一个属性appleSize，并分别提供静态的构造函数bigApple和smallApple，并提供一个方法来判断传进来的值，如果appleSize > 5的话就是大苹果，否则都是小苹果，改造后的代码如下

```java
public class Apple {

    static int appleSize;
    public static final Apple bigApple = new Apple(5);
    public static final Apple smallApple = new Apple(2);

    public Apple(){}
    public Apple(int appleSize){
        this.appleSize = appleSize;
    }
}

public class testApple {

    // 判断苹果的大小，大于5的都按5斤算，小于5的都按2斤算
    static Apple judgeAppleSize(int size){
        return size > 5 ? Apple.bigApple : Apple.smallApple;
    }
    public static void main(String[] args) {
//        Apple apple = new Apple();
        judgeAppleSize(6);
    }
}
```

那么，你能否根据上述两个代码思考一下静态工厂方法和公有构造器之间孰优孰劣呢？

### 静态工厂有名称

众所周知，构造器的声明必须与类名相同，构造方法顾名思义就是构造此类的方法，也就是通过构造方法能够获得这个类对象的引用，所以构造方法必须与类名相同。不知道你有没有遇见过类似的情况，看下面一个例子

BigInteger.java

```java
public BigInteger(int bitLength, int certainty, Random rnd) {
  ...
  prime = (bitLength < SMALL_PRIME_THRESHOLD
                                ? smallPrime(bitLength, certainty, rnd)
                                : largePrime(bitLength, certainty, rnd));
}
```

如果只是给BigInteger 传递了三个参数，但是你并不知道它的内部代码是怎样的，你可能还会查找到对应的源码来仔细研究，也就是说BigInteger 的名称和内部实现没有太大的关系。

如果用静态工厂方法呢？可以看下面一个例子

还是BigInteger.java

```java
public static BigInteger probablePrime(int bitLength, Random rnd) {
  if (bitLength < 2)
    throw new ArithmeticException("bitLength < 2");

  return (bitLength < SMALL_PRIME_THRESHOLD ?
          smallPrime(bitLength, DEFAULT_PRIME_CERTAINTY, rnd) :
          largePrime(bitLength, DEFAULT_PRIME_CERTAINTY, rnd));
}

private static BigInteger smallPrime(int bitLength, int certainty, Random rnd) {...}
private static BigInteger largePrime(int bitLength, int certainty, Random rnd) {...}
```

同样是内部调用，静态工厂方法`probablePrime`是你自己定义的名称，你是否从该名称看出来某些关于内部实现的东西呢？是不是就比调用其公有的构造函数要更加明确？

一个类只能有一个带有指定签名的构造器，如果提供两个构造器，他们只是在参数类型的顺序上有所不同，你是不是也会有一头雾水不知道该调用哪个构造器的感觉？事实上这并不是一个好的注意，面对这样的API，用户也记不住调用哪个构造器，结果通常会调用错误的构造器。

由于静态方法有名称，所以在实现过程中，所以它们不受上述限制，当一个类需要多个带有相同签名的构造器时，就用静态工厂方法替代构造器，并仔细的选取静态工厂的名称以便突出其主要功能。

### 静态工厂不必重新创建一个对象

我们都知道，每一次调用一个构造函数都相当于是重新创建了一个该对象的实例，这使得不可变类可以使用预先构建好的示例，或者将构建好的实例缓存起来，重复利用，从而避免创建不必要的对象。Boolean.valueOf(boolean)方法说明了这一点，它从来不用创建对象，这种方法类似于享元模式，简单介绍一下：

#### 享元模式

https://www.runoob.com/design-pattern/flyweight-pattern.html

言归正传，静态工厂方法不会重新创建对象，静态工厂方法每次都返回相同的对象，这样有助于控制哪些类的实例应该存在。这种类称为实例受控的类，我们以单例模式为例，来看一下实例受控的类的主要用法：

```java
public class Singleton {

    // 懒汉式
    private static Singleton INSTANCE;
    private Singleton(){}
    public static Singleton newInstance(){
        if(INSTANCE == null){
            INSTANCE = new Singleton();
        }
        return INSTANCE;
    }
}
```

这部分代码是一个典型的懒汉式实现，对外部只开放`newInstance`方法，并把构造函数私有化，也就是说你不能通过构造函数`new`出Singleton的实例，必须通过`Singleton.newInstance()`来创建Singleton的实例，每次判断`INSTANCE`是否为null，如果是null，则创建并返回 `new Singleton()`的引用，否则，只是返回之前创建出来的Singleton 的引用。

这个Singleton类，就是实例受控的类，你不能无限制的创建Singletion的实例，因为Singleton是一种单例实现。当然，这种方式不是线程安全的，在多个线程并发访问时，你并不能保证单例的有效性，也就是说在多线程环境下你不能保证Singleton只有一个。那么如何保证呢？请往下读，下文会给你答案。

#### 实例受控的类

编写实例受控的类有几个原因：

1. **实例受控的类确保类是一个`Singleton`**

Singleton是指仅仅被实例化一次的类。那么如何编写一个安全的Singleton呢？我们来对上面的懒汉式进行部分改造

```java
public class Singleton {

    // 饿汉式
    private static final Singleton INSTANCE = new Singleton();
    private Singleton(){}
    public static Singleton newInstance(){
        return INSTANCE;
    }

}
```

使用`static final`强制了`INSTANCE`的引用对象为不可更改的，也就是说，你不能再把INSTANCE对象的引用指向其他new Singleton()对象，这种方式就是在类装载的时候就完成实例化。避免了线程同步问题（其他单例的情况我们在后面的章节中讨论）。

2. **实例受控的类确保类是不能被实例化的**

其实我们上面的代码一直在确保此规定，那就是通过私有化构造函数，确保此类不能被实例化。你也可以通过使用下面这种方式来避免类的实例化

```java
public class UtilityClass {
  private UtilityClass(){
    throw new AssertionError();
  }
}
```

AssertionError()不是必须的，但是它可以避免不小心在类的内部调用构造器。

3. **实例受控的类确保不会存在两个相等的实例**

实例受控的类确保不会存在两个相等的实例，当且仅当 a==b时，a.equals(b)才为true，这是享元模式的基础(具体我们在后面的章节中讨论)。

### 静态工厂可以返回任何子类型对象

静态工厂方法与构造器不同的第三大优势在于，它们可以返回原返回类型的任何子类型的对象。这样我们就在选择返回对象的类时就有了更大的灵活性。`Collections`和`Arrays`工具类保证了这一点

Collections.java

```java
public static <T> Collection<T> unmodifiableCollection(Collection<? extends T> c) {
  return new UnmodifiableCollection<>(c);
}

static class UnmodifiableCollection<E> implements Collection<E>, Serializable {
  ...
 	UnmodifiableCollection(Collection<? extends E> c) {
    if (c==null)
      throw new NullPointerException();
    this.c = c;
  } 
  ...
}
```

这是Collections.java 中的代码片段，静态方法`unmodifiableCollection`返回一个新的UnmodifiableCollection，调用它的静态方法创建UnmodifiableCollection的对象，由于UnmodifiableCollection继承于Collection，也就是说静态方法unmodifiableCollection其实是返回了一个子类的对象。

### 静态工厂返回的类可以动态变化

静态工厂的第四大优势在于，所返回的对象的类可以随着每次调用而发生变化，这取决于静态工厂方法的参数值。只要是已声明的返回类型的子类型，都是允许的。返回对象的类也可能随着发行版本的不同而不同。

EnumSet （详见第36条）没有公有的构造器，只有静态工厂方法。在OpenJdk实现中，它们返回两种子类之一的一个实例，具体则取决于底层枚举类型的大小：如果它的元素有6 4个或者更少，就像大多数枚举类型一样，静态工厂方法就会返回一个RegularEnumSet实例，用单个long进行支持；如果枚举类型有65个或者更多元素，工厂就返回JumboEnumSet实例，用一个long数组进行支持。

```java
public static <E extends Enum<E>> EnumSet<E> noneOf(Class<E> elementType) {
  Enum<?>[] universe = getUniverse(elementType);
  if (universe == null)
    throw new ClassCastException(elementType + " not an enum");

  if (universe.length <= 64)
    return new RegularEnumSet<>(elementType, universe);
  else
    return new JumboEnumSet<>(elementType, universe);
}
```

### 静态工厂返回的类可以不存在

静态工厂的第五大优势在于，方法返回对象所属的类，在编写包含该静态工厂方法类时可以不存在。

这里直接从 这种静态工厂方法最典型的实现--服务提供者框架 来探讨。

服务提供者框架包含四大组件：（概念不太好理解，可以直接先看下面的例子讲解，然后回过头来再看概念）

服务接口：这是服务提供者要去实现的接口
服务提供者接口：生成服务接口实例的工厂对象（就是用来生成服务接口的）（可选）
提供者注册API：服务者 提供服务者自身的实现
服务访问API：根据客户端指定的某种条件去实现对应的服务提供者

```java

//四大组成之一：服务接口
public interface LoginService {//这是一个登录服务
    public void login();
}
 
//四大组成之二：服务提供者接口
public interface Provider {//登录服务的提供者。通俗点说就是：通过这个newLoginService()可以获得一个服务。
    public LoginService newLoginService();
}
 
/**
 * 这是一个服务管理器，里面包含了四大组成中的三和四
 * 解释：通过注册将 服务提供者 加入map，然后通过一个静态工厂方法 getService(String name) 返回不同的服务。
 */
public class ServiceManager {
    private static final Map<String, Provider> providers = new HashMap<String, Provider>();//map，保存了注册的服务
 
    private ServiceManager() {
    }
 
    //四大组成之三：提供者注册API  (其实很简单，就是注册一下服务提供者)
    public static void registerProvider(String name, Provider provider) {
        providers.put(name, provider);
    }
 
    //四大组成之四：服务访问API   (客户端只需要传递一个name参数，系统会去匹配服务提供者，然后提供服务)  (静态工厂方法)
    public static LoginService getService(String name) {
        Provider provider = providers.get(name);
        if (provider == null) {
            throw new IllegalArgumentException("No provider registered with name=" + name);
 
        }
        return provider.newLoginService();
    }
}
```

也可以参考这篇文章进一步理解：[JAVA 服务提供者框架介绍](https://liwenshui322.iteye.com/blog/1267202)

## 静态工厂方法的缺点

### 静态工厂方法依赖于构造函数的创建

上面提到了一些静态工厂方法的优点，那么任何事情都有利弊，静态工厂方法主要缺点在于，类如果不含公有的或者受保护的构造器，就不能被子类化。例如，要想将Collections Framework中任何便利的实现类子类化，这是不可能的。

静态工厂方法最终也是调用该类的构造方法，如果没有该类的构造方法，静态工厂的方法也就没有意义，也就是说，静态工厂方法其实是构造方法的一层封装和外观，其实最终还是调用的类的构造方法。

### 静态工厂方法很难被发现

在API文档中，它们没有像构造器那样在API文档中被标明，因此，对于提供了静态工厂方法而不是构造器的类来说，要想查明如何实例化一个类是非常困难的。下面提供了一些静态工厂方法的惯用名称。这里只列出来了其中的一小部分

* from ——— 类型转换方法，它只有单个参数，返回该类型的一个相对应的实例，例如：

```java
Date d = Date.form(instant);
```

* of ——— 聚合方法，带有多个参数，返回该类型的一个实例，把他们结合起来，例如:

```java
Set<Rank> faceCards = EnumSet.of(JACK,QUEEN,KING);
```

* valueOf ——— 比from 和 of 更繁琐的一种替代方法，例如:

```java
BigInteger prime = BigInteger.valueof(Integer.MAX_VALUE);
```

* instance 或者 getInstance ———返回的实例是通过方法的(如有)参数来描述的，但是不能说与参数具有相同的值，例如:

```java
StackWalker luke = StackWalker.getInstance(options);
```

* create 或者 newInstance ——— 像instance 或者 getInstance 一样，但create 或者 newInstance 能够确保每次调用都返回一个新的实例，例如:

```java
Object newArray = Array.newInstance(classObject,arrayLen);
```

* getType ——— 像getInstance 一样，但是在工厂方法处于不同的类中的时候使用。Type 表示工厂方法所返回的对象类型，例如:

```java
FileStore fs = Files.getFileStore(path);
```

* newType ——— 像newInstanfe 一样，但是在工厂方法处于不用的类中的时候使用，Type表示工厂方法返回的对象类型，例如:

```java
BufferedReader br = Files.newBufferedReader(path);
```

* type ——— getType 和 newType 的简版，例如：

```java
List<Complaint> litany = Collections.list(legacyLitancy);
```

简而言之，静态工厂方法和公有构造器都各有用处，我们需要理解它们各自的长处。静态工厂经常更加合适，因此切忌第一反应就是提供公有的构造器，而不先考虑静态工厂。






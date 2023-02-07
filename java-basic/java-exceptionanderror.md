# Exception 和 Error 

* [Exception 和 Error](#exception-和-error)
   * [认识 Exception](#认识-exception)
      * [什么是 Throwable](#什么是-throwable)
      * [常见的 Exception](#常见的-exception)
      * [与 Exception 有关的 Java 关键字](#与-exception-有关的-java-关键字)
         * [throws 和 throw](#throws-和-throw)
         * [try 、finally 、catch](#try-finally-catch)
         * [JDK1.7 使用 try...with...resources 优雅关闭资源](#jdk17-使用-trywithresources-优雅关闭资源)
      * [异常处理的原则](#异常处理的原则)
   * [什么是 Error](#什么是-error)
   * [一道经典的面试题](#一道经典的面试题)

在 Java 中的基本理念是 `结构不佳的代码不能运行`，发现错误的理想时期是在编译期间，因为你不用运行程序，只是凭借着对 Java 基本理念的理解就能发现问题。但是编译期并不能找出所有的问题，有一些 NullPointerException 和 ClassNotFoundException 在编译期找不到，这些异常是 RuntimeException 运行时异常，这些异常往往在运行时才能被发现。

我们写 Java 程序经常会出现两种问题，一种是 java.lang.Exception ，一种是 java.lang.Error，都用来表示出现了异常情况，下面就针对这两种概念进行理解。

## 认识 Exception

`Exception` 位于 `java.lang` 包下，它是一种顶级接口，继承于 `Throwable` 类，Exception 类及其子类都是 Throwable 的组成条件，是程序出现的合理情况。

在认识 Exception 之前，有必要先了解一下什么是 `Throwable`。

### 什么是 Throwable

Throwable 类是 Java 语言中所有`错误(errors)`和`异常(exceptions)`的父类。只有继承于 Throwable 的类或者其子类才能够被抛出，还有一种方式是带有 Java 中的 `@throw` 注解的类也可以抛出。

在[Java规范](https://docs.oracle.com/javase/specs/jls/se9/html/jls-11.html#jls-11.1.1)中，对非受查异常和受查异常的定义是这样的：

> The *unchecked exception classes* are the run-time exception classes and the error classes.

> The *checked exception classes* are all exception classes other than the unchecked exception classes. That is, the checked exception classes are `Throwable` and all its subclasses other than `RuntimeException` and its subclasses and `Error`and its subclasses.

也就是说，除了 `RuntimeException` 和其子类，以及`error`和其子类，其它的所有异常都是 `checkedException`。

那么，按照这种逻辑关系，我们可以对 Throwable 及其子类进行归类分析

![](http://www.cxuan.vip/image-20230204094933462.png)

可以看到，Throwable 位于异常和错误的最顶层，我们查看 Throwable 类中发现它的方法和属性有很多，我们只讨论其中几个比较常用的

```java
// 返回抛出异常的详细信息
public string getMessage();
public string getLocalizedMessage();

//返回异常发生时的简要描述
public public String toString()；
  
// 打印异常信息到标准输出流上
public void printStackTrace();
public void printStackTrace(PrintStream s);
public void printStackTrace(PrintWriter s)

// 记录栈帧的的当前状态
public synchronized Throwable fillInStackTrace();
```

此外，因为 Throwable 的父类也是 `Object`，所以常用的方法还有继承其父类的`getClass()` 和 `getName()` 方法。

### 常见的 Exception

下面我们回到 Exception 的探讨上来，现在你知道了 Exception 的父类是 Throwable，并且 Exception 有两种异常，一种是 `RuntimeException` ；一种是 `CheckedException`，这两种异常都应该去`捕获`。

下面列出了一些 Java 中常见的异常及其分类，这块面试官也可能让你举出几个常见的异常情况并将其分类

RuntimeException

![](http://www.cxuan.vip/image-20230204095144470.png)

UncheckedException

![](http://www.cxuan.vip/image-20230204095156789.png)

### 与 Exception 有关的 Java 关键字

那么 Java 中是如何处理这些异常的呢？在 Java 中有这几个关键字 **throws、throw、try、finally、catch** 下面我们分别来探讨一下

#### throws 和 throw

在 Java 中，异常也就是一个对象，它能够被程序员自定义抛出或者应用程序抛出，必须借助于 `throws` 和 `throw` 语句来定义抛出异常。

throws 和 throw 通常是成对出现的，例如

```java
static void cacheException() throws Exception{

  throw new Exception();

}
```

throw 语句用在方法体内，表示抛出异常，由方法体内的语句处理。
throws 语句用在方法声明后面，表示再抛出异常，由该方法的调用者来处理。

throws 主要是声明这个方法会抛出这种类型的异常，使它的调用者知道要捕获这个异常。
throw 是具体向外抛异常的动作，所以它是抛出一个异常实例。

#### try 、finally 、catch

这三个关键字主要有下面几种组合方式 **try...catch 、try...finally、try...catch...finally**。

try...catch 表示对某一段代码可能抛出异常进行的捕获，如下

```java
static void cacheException() throws Exception{

  try {
    System.out.println("1");
  }catch (Exception e){
    e.printStackTrace();
  }

}
```

try...finally 表示对一段代码不管执行情况如何，都会走 finally 中的代码

```java
static void cacheException() throws Exception{
  for (int i = 0; i < 5; i++) {
    System.out.println("enter: i=" + i);
    try {
      System.out.println("execute: i=" + i);
      continue;
    } finally {
      System.out.println("leave: i=" + i);
    }
  }
}
```

try...catch...finally 也是一样的，表示对异常捕获后，再走 finally 中的代码逻辑。

#### JDK1.7 使用 try...with...resources 优雅关闭资源

Java 类库中有许多资源需要通过 close 方法进行关闭。比如 InputStream、OutputStream，数据库连接对象 Connection，MyBatis 中的 SqlSession 会话等。作为开发人员经常会忽略掉资源的关闭方法，导致内存泄漏。

根据经验，`try-finally`语句是确保资源会被关闭的最佳方法，就算异常或者返回也一样。try-catch-finally 一般是这样来用的

```java
static String firstLineOfFile(String path) throws IOException {
  BufferedReader br = new BufferedReader(new FileReader(path));
  try {
    return br.readLine();
  }finally {
    br.close();
  }
}
```

这样看起来代码还是比较整洁，但是当我们添加第二个需要关闭的资源的时候，就像下面这样

```java
static void copy(String src,String dst) throws Exception{
        InputStream is = new FileInputStream(src);
  try {

    OutputStream os = new FileOutputStream(dst);
    try {
      byte[] buf = new byte[100];
      int n;
      while ((n = is.read()) >= 0){
        os.write(buf,n,0);
      }
    }finally {
      os.close();
    }
  }finally {
    is.close();
  }
}
```

这样感觉这个方法已经变得臃肿起来了。

而且这种写法也存在诸多问题，即使 try - finally 能够正确关闭资源，但是它不能阻止异常的抛出，因为 try 和 finally 块中都可能有异常的发生。

比如说你正在读取的时候硬盘损坏，这个时候你就无法读取文件和关闭资源了，此时会抛出两个异常。但是在这种情况下，第二个异常会抹掉第一个异常。在异常堆栈中也无法找到第一个异常的记录，怎么办，难道像这样来捕捉异常么？

```java
static void tryThrowException(String path) throws Exception {

  BufferedReader br = new BufferedReader(new FileReader(path));
  try {
    String s = br.readLine();
    System.out.println("s = " + s);

  }catch (Exception e){
    e.printStackTrace();
  }finally {
    try {
      br.close();
    }catch (Exception e){
      e.printStackTrace();
    }finally {
      br.close();
    }
  }
}
```

这种写法，虽然能解决异常抛出的问题，但是各种 try-cath-finally 的嵌套会让代码变得非常臃肿。

Java7 中引入了`try-with-resources` 语句时，所有这些问题都能得到解决。要使用 try-with-resources 语句，首先要实现 `AutoCloseable` 接口，此接口包含了单个返回的 close 方法。Java 类库与三方类库中的许多类和接口，现在都实现或者扩展了 AutoCloseable 接口。如果编写了一个类，它代表的是必须关闭的资源，那么这个类应该实现 AutoCloseable 接口。

java 引入了 try-with-resources 声明，将 try-catch-finally 简化为 try-catch，这其实是一种`语法糖`，在编译时会进行转化为 try-catch-finally 语句。

下面是使用 try-with-resources 的第一个范例

```java
/**
     * 使用try-with-resources 改写示例一
     * @param path
     * @return
     * @throws IOException
     */
static String firstLineOfFileAutoClose(String path) throws IOException {

  try(BufferedReader br = new BufferedReader(new FileReader(path))){
    return br.readLine();
  }
}
```

使用 try-with-resources 改写程序的第二个示例

```java
static void copyAutoClose(String src,String dst) throws IOException{

  try(InputStream in = new FileInputStream(src);
      OutputStream os = new FileOutputStream(dst)){
    byte[] buf = new byte[1000];
    int n;
    while ((n = in.read(buf)) >= 0){
      os.write(buf,0,n);
    }
  }
}
```

使用 try-with-resources 不仅使代码变得通俗易懂，也更容易诊断。以`firstLineOfFileAutoClose`方法为例，如果调用 `readLine() `和 `close()` 方法都抛出异常，后一个异常就会被禁止，以保留第一个异常。

### 异常处理的原则

我们在日常处理异常的代码中，应该遵循三个原则

* 不要捕获类似 `Exception` 之类的异常，而应该捕获类似特定的异常，比如 `InterruptedException`，方便排查问题，而且也能够让其他人接手你的代码时，会减少骂你的次数。
* 不要生吞异常。这是􏲾异常处理中要特别注重􏱸的事情，因为很可能会􏱓􏱠非常难以􏰰􏰱正常􏳶􏲾结束情况。如果我们不把􏲾异常抛􏲏出来，或者也没有输􏳹出到 􏰩􏱥􏰛Logger􏰜 日志中，程序可能会在后面以不可控的方式结束。
* 不要在函数式编程中使用 `checkedException`。

## 什么是 Error

Error 是程序无法处理的错误，表示运行应用程序中较严重问题。大多数错误与代码编写者执行的操作无关，而表示代码运行时 JVM（Java 虚拟机）出现的问题。这些错误是不可检查的，因为它们在应用程序的控制和处理能力之 外，而且绝大多数是程序运行时不允许出现的状况，比如 `OutOfMemoryError` 和 `StackOverflowError`异常的出现会有几种情况，这里需要先介绍一下 Java 内存模型 JDK1.7。

![](http://www.cxuan.vip/image-20230204094950841.png)

其中包括两部分，**由所有线程共享的数据区和线程隔离的数据区**组成，在上面的 Java 内存模型中，**只有程序计数器**是不会发生 `OutOfMemoryError` 情况的区域，程序计数器控制着计算机指令的分支、循环、跳转、异常处理和线程恢复，并且程序计数器是每个线程私有的。

>什么是线程私有：表示的就是各条线程之间互不影响，独立存储的内存区域。

如果应用程序执行的是 Java 方法，那么这个计数器记录的就是`虚拟机字节码`指令的地址；如果正在执行的是 `Native` 方法，这个计数器值则为`空(Undefined)`。

除了程序计数器外，其他区域：`方法区(Method Area)`、`虚拟机栈(VM Stack)`、`本地方法栈(Native Method Stack)` 和 `堆(Heap)` 都是可能发生 OutOfMemoryError 的区域。

* 虚拟机栈：如果线程请求的栈深度大于虚拟机栈所允许的深度，将会出现 `StackOverflowError` 异常；如果虚拟机动态扩展无法申请到足够的内存，将出现 `OutOfMemoryError`。
* 本地方法栈和虚拟机栈一样
* 堆：Java 堆可以处于物理上不连续，逻辑上连续，就像我们的磁盘空间一样，如果堆中没有内存完成实例分配，并且堆无法扩展时，将会抛出 OutOfMemoryError。

* 方法区：方法区无法满足内存分配需求时，将抛出 OutOfMemoryError 异常。

## 一道经典的面试题

一道非常经典的面试题，**NoClassDefFoundError 和 ClassNotFoundException 有什么区别**？

在类的加载过程中， JVM 或者 ClassLoader 无法找到对应的类时，都可能会引起这两种异常/错误，由于不同的 ClassLoader 会从不同的地方加载类，有时是错误的 CLASSPATH 类路径导致的这类错误，有时是某个库的 jar 包缺失引发这类错误。NoClassDefFoundError 表示这个类在编译时期存在，但是在运行时却找不到此类，有时静态初始化块也会导致 NoClassDefFoundError 错误。

>ClassLoader 是类路径装载器，在Java 中，类路径装载器一共有三种两类
>
>一种是虚拟机自带的 ClassLoader，分为三种
>
>* `启动类加载器(Bootstrap)` ，负责加载 $JAVAHOME/jre/lib/rt.jar
>* `扩展类加载器(Extension)`，负责加载 $JAVAHOME/jre/lib/ext/*.jar
>* `应用程序类加载器(AppClassLoader)`，加载当前应用的 classpath 的所有类
>
>第二种是用户自定义类加载器
>
>* Java.lang.ClassLoader 的子类，用户可以定制类的加载方式。

![](http://www.cxuan.vip/image-20230204095000552.png)

另一方面，ClassNotFoundException 与编译时期无关，当你尝试在运行时使用反射加载类时，ClassNotFoundException 就会出现。

简而言之，ClassNotFoundException 和 NoClassDefFoundError 都是由 CLASSPATH 中缺少类引起的，通常是由于缺少 JAR 文件而引起的，但是如果 JVM 认为应用运行时找不到相应的引用，就会抛出 NoClassDefFoundError 错误；当你在代码中显示的加载类比如 `Class.forName()` 调用时却没有找到相应的类，就会抛出 `java.lang.ClassNotFoundException`。

* NoClassDefFoundError 是 JVM 引起的错误，是 unchecked，未经检查的。因此不会使用 try-catch 或者 finally 语句块；另外，ClassNotFoundException 是受检异常，因此需要 try-catch 语句块或者 try-finally 语句块包围，否则会导致编译错误。
* 调用 **Class.forName()、ClassLoader.findClass() 和 ClassLoader.loadClass()** 等方法时可能会引起 `java.lang.ClassNotFoundException`，如图所示

![](http://www.cxuan.vip/image-20230204095010539.png)

* NoClassDefFoundError 是链接错误，发生在链接阶段，当解析引用找不到对应的类，就会触发；而 ClassNotFoundException 是发生在运行时的异常。

如果你在阅读文章的过程中发现错误和问题，请及时与我联系！

如果文章对你有帮助，希望小伙伴们三连走起！


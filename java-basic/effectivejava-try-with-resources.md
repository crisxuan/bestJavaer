# Effective Java - try-with-resources 优先于try-finally

## 引入

Java类库中有许多资源需要通过close方法进行关闭。

比如 InputStream、OutputStream，数据库连接对象 Connection，MyBatis中的 SqlSession 会话等。作为开发人员经常会忽略掉资源的关闭方法，导致内存泄漏。

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

而且这种写法也存在诸多问题，比如：就算是 try - finally 能够正确关闭资源，但是它不能阻止异常的抛出，因为 try 和 finally 块中都可能有异常的发生。

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

## 改变

Java7 中引入了`try-with-resources` 语句时，所有这些问题都能得到解决。要使用try-with-resources 语句，首先要实现 `AutoCloseable` 接口，此接口包含了单个返回的 close 方法。Java类库与三方类库中的许多类和接口，现在都实现或者扩展了 AutoCloseable 接口。如果编写了一个类，它代表的是必须关闭的资源，那么这个类应该实现 AutoCloseable 接口。

java引入了 try-with-resources 声明，将 try-catch-finally 简化为 try-catch，这其实是一种语法糖，在编译时会进行转化为 try-catch-finally 语句。

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

使用 try-with-resources 不仅使代码变得通俗易懂，也更容易诊断。以`firstLineOfFileAutoClose`方法为例，如果调用 readLine() 和 close 方法都抛出异常，后一个异常就会被禁止，以保留第一个异常。

## 理解

异常处理有两种情况：

1. try 块没有发生异常时，直接调用finally块，如果 close 发生异常，直接进行处理。
2. `try 块`发生异常，`catch 块`捕捉，进行第一处异常处理，然后调用 `finally 块`，如果 close 发生异常，就进行第二处异常处理。

但是在 try-with-resources 结构中，异常处理也有两种情况（注意，不论 try 中是否有异常，都会首先自动执行 close 方法，然后才判断是否进入 catch 块，建议阅读后面的反编译代码）：

1. try 块没有发生异常时，自动调用 close 方法，如果发生异常，catch 块捕捉并处理异常。
2. try 块发生异常，然后自动调用 close 方法，如果 close 也发生异常，catch 块只会捕捉 try 块抛出的异常，close 方法的异常会在catch 中被压制，但是你可以在catch块中，用 Throwable.getSuppressed 方法来获取到压制异常的数组。

下面是一个示例

```java
public class TryWithResources {

    public static void testTryWithResources(){
        try (MyAutoCloseA a = new MyAutoCloseA();
             MyAutoCloseB b = new MyAutoCloseB()) {
            a.test();
            b.test();
        } catch (Exception e) {
            System.out.println("Main: exception");
            System.out.println(e.getMessage());
            Throwable[] suppressed = e.getSuppressed();
            for (int i = 0; i < suppressed.length; i++)
                System.out.println(suppressed[i].getMessage());
        }
    }


    public static void main(String[] args) {
        testTryWithResources();
    }
}

class MyAutoCloseA implements AutoCloseable {

    public void test() throws IOException {
        System.out.println("MyAutoCloseA: test() ");
        throw new IOException("MyAutoCloseA: test() IOException");
    }

    @Override
    public void close() throws Exception {
        System.out.println("MyAutoCloseA: on close()");
        throw new ClassNotFoundException("MyAutoCloseA: close() ClassNotFoundException");
    }
}

class MyAutoCloseB implements AutoCloseable {

    public void test() throws IOException {
        System.out.println("MyAutoCloseB: test()");
        throw new IOException("MyAutoCloseB: test() IOException");
    }

    @Override
    public void close() throws Exception {
        System.out.println("MyAutoCloseB: on close()");
        throw new ClassNotFoundException("MyAutoCloseB: close() ClassNotFoundException");
    }
}
```

输出结果是这样的:

MyAutoCloseA: test() 
MyAutoCloseB: on close()
MyAutoCloseA: on close()
Main: exception
MyAutoCloseA: test() IOException
MyAutoCloseB: close() ClassNotFoundException
MyAutoCloseA: close() ClassNotFoundException

你能猜到这个输出结果吗？

如果有疑问的话，那么先来看一下上面这段代码反编译之后的结果吧

反编译后的执行过程

```java
public static void startTest() {
  try {
    MyAutoCloseA a = new MyAutoCloseA();
    Throwable var33 = null;

    try {
      MyAutoCloseB b = new MyAutoCloseB();
      Throwable var3 = null;

      try { // 我们定义的 try 块
        a.test();
        b.test();
      } catch (Throwable var28) { // try 块中抛出的异常
        var3 = var28;
        throw var28;
      } finally {
        if (b != null) {
          // 如果 try 块中抛出异常，就将 close 中的异常（如果有）附加为压制异常
          if (var3 != null) {
            try {
              b.close();
            } catch (Throwable var27) {
              var3.addSuppressed(var27);
            }
          } else { // 如果 try 块没有抛出异常，就直接关闭，可能会抛出关闭异常
            b.close();
          }
        }

      }
    } catch (Throwable var30) {
      var33 = var30;
      throw var30;
    } finally {
      if (a != null) {
        if (var33 != null) {
          try {
            a.close();
          } catch (Throwable var26) {
            var33.addSuppressed(var26);
          }
        } else {
          a.close();
        }
      }
    }
    // 所有的异常在这里交给 catch 块处理
  } catch (Exception var32) { // 我们定义的 catch 块
    System.out.println("Main: exception");
    System.out.println(var32.getMessage());
    Throwable[] suppressed = var32.getSuppressed();

    for(int i = 0; i < suppressed.length; ++i) {
      System.out.println(suppressed[i].getMessage());
    }
  }
}
```

try 块中的关闭顺序是从后向前进行关闭，也就是说，在创建完成 a 和 b 对象后，对 a 调用test() 方法，会先输出A 的信息，然后抛出异常进行关闭，自动调用 close() 方法，执行关闭的顺序是从后向前执行，所以会先关闭 b 的对象，会自动调用 b 的close 方法，然后会调用 a 的 close 方法。

因为对象 a 在执行test 方法的时候抛出了异常，所以对异常进行捕获，输出 `Main: exception`，然后获取 A 的异常信息，因为close 方法抛出的异常在 catch 中被压制，可以通过 `Throwable.getSuppressed` 进行输出，因为 B 先调用 close() 方法出现的异常，所以先输出了 **MyAutoCloseB: close() ClassNotFoundException** ，而最后输出的是 **MyAutoCloseA: close() ClassNotFoundException**

## 总结

结论很明显，在处理资源关闭的时候，始终要优先考虑使用 try-with-resources ，而不是 try-finally。这样得到的代码更加简洁、清晰，产生的异常也更有价值。



文章参考：

《Effective Java 第三版》

https://blog.csdn.net/weixin_40255793/article/details/80812961


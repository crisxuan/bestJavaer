# Java 创建对象的五种方式

* [Java 创建对象的五种方式](#java-创建对象的五种方式)
   * [使用 new 来创建对象](#使用-new-来创建对象)
   * [使用 newInstance 方法来创建](#使用-newinstance-方法来创建)
   * [使用反射来创建对象](#使用反射来创建对象)
   * [使用对象克隆来创建对象](#使用对象克隆来创建对象)
   * [使用反序列化创建对象](#使用反序列化创建对象)
   * [最后](#最后)

我们日常生活中会创建很多对象，但是这个对象和你理解的那么对象不一样，因为作者不是女娲，不能造人。作者只是程序员，他只能在 Java 中创建对象。

> 那么我问你一个问题，你知道 Java 中如何创建对象吗？

这个问题仿佛是给 Java 新手来写的，好像有点瞧不起在座各位的样子，嗯。。。那么我换种问法好了，毕竟看我公众号的人都是将来月入 10w 的大佬。

>你知道 Java 中有哪几种创建对象的方式吗？

诶？这个问题有点意思，平常我们用的最多的就是使用 `new` 来创建对象了，这是第一种方式；如果我们使用框架的话就直接交给 `Spring` 去管理就好了，Spring 底层是使用反射来创建对象的，这是第二种方式；然后。。。。。。。有点想不起来了，不要急，这篇文章就帮你回顾下。

## 使用 new 来创建对象

使用 new 来创建对象是最简单的一种方式了，`new` 是 Java 中的关键字，new 通过为新对象分配内存并返回对该内存的引用来实例化一个类，这个实例化一个类其实就相当于创建了一个对象，因为类也是一种对象；new 也负责调用对象的构造函数，下面是使用 new 来创建对象的代码

```java
Object obj = new Object();
```

这段代码中，我们在堆区域中分配了一块内存，然后把 obj 对象指向了这块内存区域。

不知道你有没有看过 new 的字节码呢？下面是这段代码的字节码

![](http://www.cxuan.vip/image-20230203222940516.png)

在 Java 中，我们认为创建一个对象就是调用其构造方法，所以我们使用 new Object() 构造的对象，其实是调用了 Object 类的`无参数` 的构造方法。但是通过字节码我们发现，对象的创建和调用其构造方法是分开的。

字节码的 `new` 表示在堆中创建一个对象，并把对象的引用推入栈中。`invokespecial` 表示调用对象无参数的构造方法。其实，JVM 提供了五种方法调用指令，分别是

* `invokestatic`：该指令用于调用静态方法，即使用 static 关键字修饰的方法；
* `invokespecial`：该指令用于三种场景：调用实例构造方法，调用私有方法（即 private 关键字修饰的方法）和父类方法（即 super 关键字调用的方法）；
* `invokeinterface`：该指令用于调用接口方法，在运行时再确定一个实现此接口的对象；
* `invokevirtual`：该指令用于调用虚方法（就是除了上述三种情况之外的方法）；
* `invokedynamic`：在运行时动态解析出调用点限定符所引用的方法之后，调用该方法；在 JDK 1.7 中提出，主要用于支持 JVM 上的动态脚本语言（如 Groovy，Jython 等）

好了，现在你知道了 new 和 invokespecial 是干啥用的，那么 `dup` 指令呢？

dup 会复制栈上的最后一个元素，然后再次将其推入栈；因此，如果在栈上有一个对象引用，并且调用了 dup，则现在在栈上有对该对象的两个引用。看起来有点不知其所以然，所以在求助网上的时候，又发现了 R 大的解释

![](http://www.cxuan.vip/image-20230203222951519.png)

来源：https://www.zhihu.com/question/52749416

后面的 astore 就会把操作数栈顶的那个引用消耗掉，保存到指定的局部变量去。

如果直接使用 `new Object()` 没有创建局部变量的话，请注意一下它的字节码。

![](http://www.cxuan.vip/image-20230203223002833.png)

看出来细微的差别了吗？上图中的 `astore_1` 竟然变成了 `pop`，这也就是说，new Object() 没有保存对象的局部变量，而是直接把它给消耗掉了。嗯，符合预期。

所以这是第一种创建的方式，也就是使用 new 来创建。

## 使用 newInstance 方法来创建

这个`newInstance` 方法指的是 `class` 类中的方法，newInstance 方法会调用无参的构造方法创建对象。

我们可以使用 newInstance 方法创建对象，下面是使用示例代码

```java
User user = (User)Class.forName("com.cxuan.test.User").newInstance();

// 或者使用

User user = User.class.newInstance();
```

下面我们分析一下这个字节码，其实使用第一种方式和第二种方式就差了一个 Class.forName 的字节码，这是一个静态方法，应该用的是 `invokestatic`，下面我们验证一下。

第一种方式的字节码

![](http://www.cxuan.vip/image-20230203223014515.png)

第二种方式的字节码

![](http://www.cxuan.vip/image-20230203223023816.png)

可以看到，我们验证的是正确的。

>那么这段字节码是什么意思呢？

`ldc` 的意思是把常量池中的引用推入到当前堆栈中，invokestatic 和 invokevirtual 我们上面解释过了，然后就是 `checkcast`， 这个字节码的含义就是进行类型转换，因为 newInstance 生成的是一个 Object 的对象，所以我们需要把它转换为我们需要的 User 类型，这个字节码就是干这个活的。

## 使用反射来创建对象

使用反射来创建对象其实也是使用了 newInstance 方法，只不过这个方法是 `Constructor` ，Java 反射中构造器的方法，我们可以通过这种方式来创建一个新的对象。如下代码所示

```java
Constructor<User> constructor = User.class.getConstructor();
User user = constructor.newInstance();
```

下面是它的字节码

![](http://www.cxuan.vip/image-20230203223034009.png)

这里解释下 `iconst_0` ，它的意思就是将 int 值 0 加载到堆栈上，这个相当于是为 `getConstructor` 方法准备参数分配的字节码。

为了验证这个结论，我们从简优化，看一下其他方法的字节码

```java
User.class.getDeclaredField("id");
```

它的字节码如下：

![](http://www.cxuan.vip/image-20230203223042368.png)

可以看到，第二个 ldc 其实就是 `getDeclaredField` 中的参数，为 String 类型，所以是用的 ldc，它是将引用推入堆栈。

## 使用对象克隆来创建对象

这是第四种创建方式，使用 Cloneable 类中的 `clone()` 方法来创建，它的前提是你需要实现 Cloneable 接口并实现其定义的 clone 方法。用 clone 方法创建对象并不会调用任何构造函数。

如下代码所示

```java
Constructor<User> constructor = User.class.getConstructor();
User user = constructor.newInstance();
user.setName("cxuan");

User user2 = (User)user.clone();
System.out.println(user2.getName());
```

输出 cxuan

它的字节码如下

![](http://www.cxuan.vip/image-20230203223054118.png)

这个字节码有些长，但是字节码的概念和含义我们上面已经介绍过了，最主要的就是推入堆栈，调用对应的实例方法。

对象克隆这块是面试官非常喜欢考的一个点，我后面会解析一下浅拷贝和深拷贝的区别。

## 使用反序列化创建对象

当我们使用序列化和反序列化时，JVM 也会帮我们创建一个单独的对象。在反序列化时，JVM 创建对象不会调用任何构造函数，如下代码所示

```java
ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("xxx"));
out.writeObject(user2);
out.close();
//Deserialization
ObjectInputStream in = new ObjectInputStream(new FileInputStream("xxx"));
User user3 = (User) in.readObject();
in.close();
user3.setName("cxuan003");
System.out.println(user3 + ", hashcode : " + user3.hashCode());
```

这段反编译过后的字节码文件比较长，我这里就先不贴出来了，读者们可以自己编译看一下，其实并没有特别的字节码指令，大部分我们上面已经提到过了。

如果你在阅读文章的过程中发现错误和问题，请及时与我联系！

如果文章对你有帮助，希望小伙伴们三连走起！




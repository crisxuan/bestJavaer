# Java IO 体系

[toc]





Java IO 是一个庞大的知识体系，很多人学着学着就会学懵了，包括我在内也是如此，所以本文将会从 Java 的 BIO 开始，一步一步深入学习，引出 JDK1.4 之后出现的 NIO 技术，对比 NIO 与 BIO 的区别，然后对 NIO 中重要的三个组成部分进行讲解（缓冲区、通道、选择器），最后实现一个**简易的客户端与服务器通信功能**。

![](http://cdn.smallpineapple.top/sadasdasdsa312378126391.png)

## 传统的 BIO

Java IO流是一个庞大的生态环境，其内部提供了很多不同的**输入流和输出流**，细分下去还有字节流和字符流，甚至还有**缓冲流**提高 IO 性能，转换流将字节流转换为字符流······看到这些就已经对 IO 产生恐惧了，在日常开发中少不了对文件的 IO 操作，虽然 apache 已经提供了 `Commons IO` 这种封装好的组件，但面对特殊场景时，我们仍需要自己去封装一个高性能的文件 IO 工具类，本文将会解析 Java IO 中涉及到的各个类，以及讲解如何正确、高效地使用它们。

## BIO NIO 和 AIO 的区别

我们会以一个经典的**烧开水**的例子通俗地讲解它们之间的区别

| 类型 |                            烧开水                            |
| :--: | :----------------------------------------------------------: |
| BIO  |      一直监测着某个水壶，该水壶烧开水后再监测下一个水壶      |
| NIO  | 每隔一段时间就看看所有水壶的状态，哪个水壶烧开水就去处理哪个水壶 |
| AIO  | 不用监测水壶，每个水壶烧开水后都会主动通知线程说：“我的水烧开了，来处理我吧” |

**BIO (同步阻塞 I/O)**

这里假设一个烧开水的场景，有一排水壶在烧开水，BIO的工作模式就是， 小菠萝**一直看着着这个水壶，直到这个水壶烧开，才去处理下一个水壶**。线程在等待水壶烧开的时间段什么都没有做。

**NIO（同步非阻塞 I/O）**

还拿烧开水来说，NIO的做法是**小菠萝一边玩着手机，每隔一段时间就看一看每个水壶的状态**，看看是否有水壶的状态发生了改变，如果某个水壶烧开了，可以先处理那个水壶，然后继续玩手机，继续隔一段时间又看看每个水壶的状态。

**AIO （异步非阻塞 I/O）**

小菠萝觉得每隔一段时间就去看一看水壶太费劲了，于是购买了一批烧开水时可以**哔哔响**的水壶，于是开始烧水后，小菠萝就直接去客厅玩手机了，水烧开时，就发出“哔哔”的响声，**通知小菠萝来关掉水壶**。

## 什么是流

知识科普：我们知道任何一个文件都是以**二进制**形式存在于设备中，计算机就只有 `0` 和 `1`，你能看见的东西全部都是由这两个数字组成，你看这篇文章时，这篇文章也是由01组成，只不过这些二进制串经过各种转换演变成一个个文字、一张张图片跃然屏幕上。

而**流**就是将这些二进制串在各种设备之间进行传输，如果你觉得有些抽象，我举个例子就会好理解一些：

> 下图是一张图片，它由01串组成，我们可以通过程序把一张图片拷贝到一个文件夹中，
>
> 把图片转化成二进制数据集，把数据一点一点地传递到文件夹中 , 类似于水的流动 , 这样整体的数据就是一个数据流

![未命名绘图](http://cdn.smallpineapple.top/未命名绘图-1598235636085.jpg)

IO 流读写数据的特点：

- **顺序读写**。读写数据时，大部分情况下都是按照顺序读写，读取时从文件开头的第一个字节到最后一个字节，写出时也是也如此（RandomAccessFile 可以实现随机读写）
- **字节数组**。读写数据时本质上都是对字节数组做读取和写出操作，即使是字符流，也是在字节流基础上转化为一个个字符，所以字节数组是 IO 流读写数据的本质。

## 流的分类

根据**数据流向**不同分类：输入流 和 输出流

- **输入流**：从磁盘或者其它设备中将数据输入到进程中
- **输出流**：将进程中的数据输出到磁盘或其它设备上保存

![1](http://cdn.smallpineapple.top/1.jpg)

图示中的硬盘只是其中一种设备，还有非常多的设备都可以应用在IO流中，例如：打印机、硬盘、显示器、手机······

根据**处理数据的基本单位**不同分类：字节流 和 字符流

- 字节流：以**字节（8 bit）**为单位做数据的传输
- 字符流：以**字符**为单位（1字符 = 2字节）做数据的传输

> 字符流的本质也是通过字节流读取，Java 中的字符采用 Unicode 标准，在读取和输出的过程中，通过以字符为单位，查找对应的码表将字节转换为对应的字符。

面对字节流和字符流，很多读者都有疑惑：**什么时候需要用字节流，什么时候又要用字符流？**

我这里做一个简单的概括，你可以按照这个标准去使用：

字符流只针对字符数据进行传输，所以如果是**文本数据**，优先**采用字符流**传输；除此之外，其它类型的数据（图片、音频等），最好还是以**字节流**传输。

根据这两种不同的分类，我们就可以做出下面这个表格，里面包含了 IO 中最核心的 4 个顶层抽象类：

| 数据流向 / 数据类型 | 字节流       | 字符流 |
| ------------------- | ------------ | ------ |
| 输入流              | InputStream  | Reader |
| 输出流              | OutputStream | Writer |

现在看 IO 是不是有一些思路了，不会觉得很混乱了，我们来看这四个类下的所有成员。

![image-20200823091738251](http://cdn.smallpineapple.top/image-20200823091738251.png)

[来自于 cxuan 的 《Java基础核心总结》]

看到这么多的类是不是又开始觉得混乱了，不要慌，字节流和字符流下的输入流和输出流大部分都是一一对应的，有了上面的表格支撑，我们不需要再担心看见某个类会懵逼的情况了。

看到 `Stream` 就知道是**字节流**，看到 `Reader / Writer` 就知道是**字符流**。

这里还要额外补充一点：Java IO 提供了**字节流转换为字符流的转换类**，称为转换流。

| 转换流 / 数据类型        | 字节流与字符流之间的转换 |
| ------------------------ | ------------------------ |
| （输入）字节流 => 字符流 | InputStreamReader        |
| （输出）字符流 => 字节流 | OutputStreamWriter       |

注意字节流与字符流之间的转换是有严格定义的：

- 输入流：可以将字节流 => 字符流
- 输出流：可以将字符流 => 字节流

为什么在输入流不能字符流 => 字节流，输出流不能字节流 => 字符流？

> 在存储设备上，所有数据都是以**字节**为单位存储的，所以**输入到内存时必定是以字节为单位输入，输出到存储设备时必须是以字节为单位输出**，字节流才是计算机最根本的存储方式，而字符流是在字节流的基础上对数据进行转换，输出字符，但每个字符依旧是以字节为单位存储的。

## 节点流和处理流

在这里需要额外插入一个小节讲解节点流和处理流。

- **节点流**：节点流是**真正传输数据**的流对象，用于向特定的一个地方（节点）读写数据，称为节点流。例如 FileInputStream
- **处理流**：处理流是**对节点流的封装**，使用外层的处理流读写数据，本质上是利用节点流的功能，外层的处理流可以提供额外的功能。处理流的基类都是以 `Filter` 开头。

![1](http://cdn.smallpineapple.top/1-1598317951549.jpg)

上图将 `ByteArrayInputStream` 封装成 `DataInputStream`，可以将输入的字节数组转换为对应数据类型的数据。例如希望读入`int`类型数据，就会以`2`个字节为单位转换为一个数字。

## Java IO 的核心类 File

Java 提供了 File类，它指向计算机操作系统中的文件和目录，通过该类只能访问文件和目录，无法访问内容。 它内部主要提供了 `3` 种操作：

- **访问文件的属性**：绝对路径、相对路径、文件名······
- **文件检测**：是否文件、是否目录、文件是否存在、文件的读/写/执行权限······
- **操作文件**：创建目录、创建文件、删除文件······

上面举例的操作都是在开发中非常常用的，File 类远不止这些操作，更多的操作可以直接去 API 文档中根据需求查找。

访问文件的属性：

|           API            |                          功能                          |
| :----------------------: | :----------------------------------------------------: |
| String getAbsolutePath() |            返回该文件处于系统中的绝对路径名            |
|     String getPath()     | 返回该文件的相对路径，通常与 new File() 传入的路径相同 |
|     String getName()     |                   返回该文件的文件名                   |

文件检测：

|          API          |               功能                |
| :-------------------: | :-------------------------------: |
|   boolean isFIle()    |    校验该路径指向是否一个文件     |
| boolean isDirectory() |    校验该路径指向是否一个目录     |
|   boolean isExist()   | 校验该路径指向的文件/目录是否存在 |
|  boolean canWrite()   |        校验该文件是否可写         |
|   boolean canRead()   |        校验该文件是否可读         |
| boolean canExecute()  |   校验该文件/目录是否可以被执行   |

操作文件：

|       API       |                             功能                             |
| :-------------: | :----------------------------------------------------------: |
|    mkdirs()     |      递归创建多个文件夹，路径中间有可能某些文件夹不存在      |
| createNewFile() | 创建新文件，它是一个原子操作，有两步：检查文件是否存在、创建新文件 |
|    delete()     |         删除文件或目录，删除目录时必须保证该目录为空         |

**多了解一些**

文件的读/写/执行权限，在 `Windows` 中通常表现不出来，而在 `Linux` 中可以很好地体现这一点，原因是 `Linux` 有严格的用户权限分组，不同分组下的用户对文件有不同的操作权限，所以这些方法在 `Linux` 下会比在 `Windows` 下更好理解。下图是 redis 文件夹中的一些文件的详细信息，被红框标注的是不同用户的执行权限：

- r（Read）：代表该文件可以被当前用户读，操作权限的序号是 `4`
- w（Write）：代表该文件可以被当前用户写，操作权限的序号是 `2`
- x（Execute）：该文件可以被当前用户执行，操作权限的序号是 `1`

![image-20200825080020253](http://cdn.smallpineapple.top/image-20200825080020253.png)

`root root` 分别代表：**当前文件的所有者**，**当前文件所属的用户分组**。Linux 下文件的操作权限分为三种用户：

- **文件所有者**：拥有的权限是红框中的**前三个字母**，`-`代表没有某个权限
- **文件所在组的所有用户**：拥有的权限是红框中的**中间三个字母**
- **其它组的所有用户**：拥有的权限是红框中的**最后三个字母**

## Java IO 流对象

回顾流的分类有2种：

- 根据**数据流向**分为输入流和输出流
- 根据**数据类型**分为字节流和字符流

所以，本小节将以字节流和字符流作为主要分割点，在其内部再细分为输入流和输出流进行讲解。

![image-20200823091738251](http://cdn.smallpineapple.top/image-20200823091738251.png)

### 字节流对象

字节流对象大部分输入流和输出流都是**成双成对地出现**，所以学习的时候可以将输入流和输出流一一对应的流对象关联起来，输入流和输出流只是**数据流向**不同，而**处理数据的方式**可以是相同的。

注意不要认为用什么流读入数据，就需要用对应的流写出数据，在 Java 中没有这么规定，下图只是各个对象之间的一个对应关系，**不是两个类使用时必须强制关联使用**。

> 下面有非常多的类，我会介绍基类的方法，了解这些方法是**非常有必要**的，子类的功能基于父类去扩展，只有真正了解父类在做什么，学习子类的成本就会下降。

![image-20200825084204026](http://cdn.smallpineapple.top/image-20200825084204026.png)

#### InputStream

InputStream 是字节输入流的抽象基类，提供了通用的读方法，让子类使用或重写它们。下面是 InputStream 常用的重要的方法。

|                  重要方法                   |                         功能                          |
| :-----------------------------------------: | :---------------------------------------------------: |
|         public abstract int read()          |      从输入流中读取下一个字节，读到尾部时返回 -1      |
|          public int read(byte b[])          | 从输入流中读取长度为 b.length 个字节放入字节数组 b 中 |
| public int read(byte b[], int off, int len) |   从输入流中读取指定范围的字节数据放入字节数组 b 中   |
|             public void close()             |      关闭此输入流并释放与该输入流相关的所有资源       |

还有其它一些不太常用的方法，我也列出来了。

|                   其它方法                   |                             功能                             |
| :------------------------------------------: | :----------------------------------------------------------: |
|           public long skip(long n)           |        跳过接下来的 n 个字节，返回实际上跳过的字节数         |
|           public long available()            |   返回下一次可读取（跳过）且不会被方法阻塞的字节数的估计值   |
| public synchronized void mark(int readlimit) | 标记此输入流的当前位置，对 reset() 方法的后续调用将会重新定位在 mark() 标记的位置，可以重新读取相同的字节 |
|        public boolean markSupported()        | 判断该输入流是否支持 mark() 和 reset() 方法，即能否重复读取字节 |
|       public synchronized void reset()       |     将流的位置重新定位在最后一次调用 mark() 方法时的位置     |

![image-20200827082445395](http://cdn.smallpineapple.top/image-20200827082445395.png)

**（1）ByteArrayInputStream**

ByteArrayInputStream 内部包含一个 `buf` 字节数组缓冲区，该缓冲区可以从流中读取的字节数，使用 `pos` 指针指向读取下一个字节的下标位置，内部还维护了一个`count` 属性，代表能够读取 `count` 个字节。

![bytearrayinputstream](http://cdn.smallpineapple.top/bytearrayinputstream1.gif)

> 必须保证 pos 严格小于 count，而 count 严格小于 buf.length 时，才能够从缓冲区中读取数据

**（2）FileInputStream**

文件输入流，从文件中读入字节，通常对文件的拷贝、移动等操作，可以使用该输入流把文件的字节读入内存中，然后再利用输出流输出到指定的位置上。

**（3）PipedInputStream**

管道输入流，它与 PipedOutputStream 成对出现，可以实现多线程中的**管道通信**。PipedOutputStream 中指定与特定的 PipedInputStream 连接，PipedInputStream 也需要指定特定的 PipedOutputStream 连接，之后输出流不断地往输入流的 `buffer` 缓冲区写数据，而输入流可以从缓冲区中读取数据。

**（4）ObjectInputStream**

对象输入流，用于对象的反序列化，将读入的字节数据反序列化为一个对象，实现对象的持久化存储。

**（5）PushBackInputStream**

它是 FilterInputStream 的子类，是一个**处理流**，它内部维护了一个缓冲数组`buf`。

- 在读入字节的过程中可以将**读取到的字节数据回退给缓冲区中保存**，下次可以再次从缓冲区中读出该字节数据。所以**PushBackInputStream 允许多次读取输入流的字节数据**，只要将读到的字节放回缓冲区即可。

![2](http://cdn.smallpineapple.top/pushBackInputStream.gif)

需要注意的是如果回推字节时，如果缓冲区已满，会抛出 `IOException` 异常。

它的应用场景：**对数据进行分类规整**。

假如一个文件中存储了**数字**和**字母**两种类型的数据，我们需要将它们交给两种线程各自去收集自己负责的数据，如果采用传统的做法，把所有的数据全部读入内存中，再将数据进行分离，面对大文件的情况下，例如**1G、2G**，传统的输入流在读入数组后，**由于没有缓冲区，只能对数据进行抛弃，这样每个线程都要读一遍文件**。

使用 PushBackInputStream 可以让一个专门的线程**读取**文件，唤醒不同的线程读取字符：

- 第一次读取缓冲区的数据，判断该数据由哪些线程读取
- 回退数据，唤醒对应的线程读取数据
- 重复前两步
- 关闭输入流

到这里，你是否会想到 `AQS` 的 `Condition` 等待队列，多个线程可以在不同的条件上等待被唤醒。

**（6）BufferedInputStream**

缓冲流，它是一种**处理流**，对节点流进行封装并增强，其内部拥有一个 `buffer` 缓冲区，用于缓存所有读入的字节，**当缓冲区满时，才会将所有字节发送给客户端读取**，而不是每次都只发送一部分数据，提高了效率。

**（7）DataInputStream**

数据输入流，它同样是一种**处理流**，对节点流进行封装后，能够在内部对读入的字节转换为对应的 Java 基本数据类型。

**（8）SequenceInputStream**

将两个或多个输入流看作是一个输入流依次读取，该类的存在与否并不影响整个 IO 生态，在程序中也能够做到这种效果

**~~（9）StringBufferInputStream~~**

将字符串中每个字符的低 8 位转换为字节读入到字节数组中，目前已过期

**InputStream 总结：**

- InputStream 是所有输入字节流的**抽象基类**
- ByteArrayInputStream 和 FileInputStream 是两种基本的节点流，他们分别从**字节数组** 和 **本地文件**中读取数据
- DataInputStream、BufferedInputStream 和 PushBackInputStream 都是**处理流**，对基本的节点流进行封装并增强
- PipiedInputStream 用于**多线程通信**，可以与其它线程公用一个管道，读取管道中的数据。
- ObjectInputStream 用于**对象的反序列化**，将对象的字节数据读入内存中，通过该流对象可以将字节数据转换成对应的对象

#### OutputStream

OutputStream 是字节输出流的抽象基类，提供了通用的写方法，让继承的子类重写和复用。

| 方法                                          | 功能                                                         |
| :-------------------------------------------- | ------------------------------------------------------------ |
| public abstract void write(int b)             | 将指定的字节写出到输出流，写入的字节是参数 b 的低 8 位       |
| public void write(byte b[])                   | 将指定字节数组中的所有字节写入到输出流当中                   |
| public void write(byte b[], int off, int len) | 指定写入的起始位置 offer，字节数为 len 的字节数组写入到输出流当中 |
| public void flush()                           | 刷新此输出流，并强制写出所有缓冲的输出字节到指定位置，每次写完都要调用 |
| public void close()                           | 关闭此输出流并释放与此流关联的所有系统资源                   |

![image-20200827090101687](http://cdn.smallpineapple.top/image-20200827090101687.png)

OutputStream 中大多数的类和 InputStream 是对应的，只不过数据的流向不同而已。从上面的图可以看出：

- OutputStream 是所有输出字节流的**抽象基类**
- ByteArrayOutputStream 和 FileOutputStream 是两种基本的节点流，它们分别向**字节数组**和**本地文件**写出数据
- DataOutputStream、BufferedOutputStream 是**处理流**，前者可以将**字节数据转换成基本数据类型**写出到文件中；后者是缓冲字节数组，只有在缓冲区满时，才会将所有的字节写出到目的地，**减少了 IO 次数**。
- PipedOutputStream 用于**多线程通信**，可以和其它线程共用一个管道，向管道中写入数据
- ObjectOutputStream 用于对象的**序列化**，将对象转换成字节数组后，将所有的字节都写入到指定位置中

- PrintStream 在 OutputStream 基础之上提供了增强的功能，即**可以方便地输出各种类型的数据**（而不仅限于byte型）的格式化表示形式，且 PrintStream 的方法从不抛出 IOEception，其原理是**写出时将各个数据类型的数据统一转换为 String 类型**，我会在讲解完

### 字符流对象

字符流对象也会有对应关系，大多数的类可以认为是**操作的数据从字节数组变为字符**，类的功能和字节流对象是相似的。

> 字符输入流和字节输入流的组成非常相似，字符输入流是对字节输入流的**一层转换**，所有文件的存储都是**字节的存储**，在磁盘上保留的不是文件的字符，而是先把字符编码成字节，再保存到文件中。在读取文件时，读入的也是一个一个字节组成的字节序列，而 Java 虚拟机通过将字节序列，按照2个字节为单位转换为 Unicode 字符，实现字节到字符的映射。

![image-20200827094740444](http://cdn.smallpineapple.top/image-20200827094740444.png)

#### Reader

Reader 是字符输入流的抽象基类，它内部的重要方法如下所示。

| 重要方法                                                | 方法功能                           |
| ------------------------------------------------------- | ---------------------------------- |
| public int read(java.nio.CharBuffer target)             | 将读入的字符存入指定的字符缓冲区中 |
| public int read()                                       | 读取一个字符                       |
| public int read(char cbuf[])                            | 读入字符放入整个字符数组中         |
| abstract public int read(char cbuf[], int off, int len) | 将字符读入字符数组中的指定范围中   |

还有其它一些额外的方法，与字节输入流基类提供的方法是相同的，只是作用的对象不再是字节，而是字符。

![image-20200827095911702](http://cdn.smallpineapple.top/image-20200827095911702.png)

- Reader 是所有字符输入流的**抽象基类**
- CharArrayReader 和 StringReader 是两种基本的节点流，它们分别从读取 **字符数组** 和 **字符串** 数据，StringReader 内部是一个 `String` 变量值，通过遍历该变量的字符，实现读取字符串，**本质上也是在读取字符数组**
- PipedReader 用于多线程中的通信，从共用地管道中读取字符数据
- BufferedReader 是字符输入**缓冲流**，将读入的数据放入字符缓冲区中，**实现高效地读取字符**
- InputStreamReader 是一种**转换流**，可以实现从字节流转换为字符流，将字节数据转换为字符

#### Writer

Reader 是字符输出流的抽象基类，它内部的重要方法如下所示。

| 重要方法                                                  | 方法功能                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| public void write(char cbuf[])                            | 将 cbuf 字符数组写出到输出流                                 |
| abstract public void write(char cbuf[], int off, int len) | 将指定范围的 cbuf 字符数组写出到输出流                       |
| public void write(String str)                             | 将字符串 str 写出到输出流，str 内部也是字符数组              |
| public void write(String str, int off, int len)           | 将字符串 str 的某一部分写出到输出流                          |
| abstract public void flush()                              | 刷新，如果数据保存在缓冲区，调用该方法才会真正写出到指定位置 |
| abstract public void close()                              | 关闭流对象，每次 IO 执行完毕后都需要关闭流对象，释放系统资源 |

![image-20200827104837521](http://cdn.smallpineapple.top/image-2020082710483752111.png)

- Writer 是所有的输出字符流的抽象基类

- **CharArrayWriter、StringWriter 是两种基本的节点流，它们分别向Char 数组、字符串中写入数据。**StringWriter 内部保存了 StringBuffer 对象，可以实现字符串的动态增长

- PipedWriter 可以向共用的管道中**写入字符数据**，给其它线程读取。

- **BufferedWriter** 是**缓冲输出流**，可以将写出的数据缓存起来，缓冲区满时再调用 flush() 写出数据，**减少 IO 次数**。

- PrintWriter 和 PrintStream 类似，功能和使用也非常相似，**只是写出的数据是字符而不是字节**。

- **OutputStreamWriter** 将**字符流转换为字节流**，将字符写出到指定位置

## 字节流与字符流的转换

从任何地方把数据读入到内存都是先以**字节流**形式读取，即使是使用字符流去读取数据，依然成立，因为数据永远是以字节的形式存在于互联网和硬件设备中，字符流是通过**字符集**的映射，才能够将字节转换为字符。

所以 Java 提供了两种转换流：

- InputStreamReader：从**字节流转换为字符流**，将字节数据转换为字符数据读入到内存
- OutputStreamWriter：从**字符流转换为字节流**，将字符数据转换为字节数据写出到指定位置

> 了解了 Java 传统的 BIO 中字符流和字节流的主要成员之后，至少要掌握以下两个关键点：
>
> （1）传统的 BIO 是以`流`为基本单位处理数据的，想象成水流，一点点地传输字节数据，IO 流传输的过程永远是以`字节`形式传输。
>
> （2）字节流和字符流的区别在于操作的数据单位不相同，字符流是通过将字节数据通过字符集映射成对应的字符，字符流本质上也是字节流。

接下来我们再继续学习 NIO 知识，NIO 是当下非常火热的一种 IO 工作方式，它能够解决传统 BIO 的痛点：**阻塞**。

-  BIO 如果遇到 IO 阻塞时，线程将会被挂起，直到 IO 完成后才唤醒线程，线程切换带来了额外的开销。

- BIO 中每个 IO 都需要有对应的一个线程去专门处理该次 IO 请求，会让服务器的压力迅速提高。

我们希望做到的是**当线程等待 IO 完成时能够去完成其它事情，当 IO 完成时线程可以回来继续处理 IO 相关操作，不必干干的坐等 IO 完成。**在 IO 处理的过程中，能够有一个**专门的线程负责监听这些 IO 操作，通知服务器该如何操作**。所以，我们聊到 IO，不得不去接触 NIO 这一块硬骨头。

## 新潮的 NIO

我们来看看 BIO 和 NIO 的区别，BIO 是**面向流**的 IO，它建立的通道都是**单向**的，所以输入和输出流的通道不相同，必须建立2个通道，通道内的都是传输==0101001···==的字节数据。

![](http://cdn.smallpineapple.top/asdqweqweqe.jpg)

而在 NIO 中，不再是面向流的 IO 了，而是面向**缓冲区**，它会建立一个**通道（Channel）**，该通道我们可以理解为**铁路**，该铁路上可以运输各种货物，而通道上会有一个**缓冲区（Buffer）**用于存储真正的数据，缓冲区我们可以理解为**一辆火车**。

**通道（铁路）**只是作为运输数据的一个连接资源，而真正存储数据的是**缓冲区（火车）**。即**通道负责传输，缓冲区负责存储。**

![](http://cdn.smallpineapple.top/20200902090452.png)

理解了上面的图之后，BIO 和 NIO 的主要区别就可以用下面这个表格简单概括。

|       BIO        |         NIO          |
| :--------------: | :------------------: |
| 面向流（Stream） | 面向缓冲区（Buffer） |
|     单向通道     |       双向通道       |
|     阻塞 IO      |      非阻塞 IO       |
|                  | 选择器（Selectors）  |

## 缓冲区（Buffer）

缓冲区是**存储数据**的区域，在 Java 中，缓冲区就是数组，为了可以操作不同数据类型的数据，Java 提供了许多不同类型的缓冲区，**除了布尔类型以外**，其它基本数据类型都有对应的缓冲区数组对象。

![](http://cdn.smallpineapple.top/20200906104811.png)

> 为什么没有布尔类型的缓冲区呢？
>
> 在 Java 中，boolean 类型数据只占用 `1 bit`，而在 IO 传输过程中，都是以字节为单位进行传输的，所以 boolean 的 1 bit 完全可以使用 byte 类型的某一位，或者 int 类型的某一位来表示，没有必要为了这 1 bit 而专门提供多一个缓冲区。

|    缓冲区    |               解释               |
| :----------: | :------------------------------: |
|  ByteBuffer  |     存储**字节数据**的缓冲区     |
|  CharBuffer  |     存储**字符数据**的缓冲区     |
| ShortBuffer  |    存储**短整型数据**的缓冲区    |
|  IntBuffer   |     存储**整型数据**的缓冲区     |
|  LongBuffer  |    存储**长整型数据**的缓冲区    |
| FloatBuffer  | 存储**单精度浮点型数据**的缓冲区 |
| DoubleBuffer | 存储**双精度浮点型数据**的缓冲区 |

分配一个缓冲区的方式都高度一致：使用`allocate(int capacity)`方法。

例如需要分配一个 1024 大小的字节数组，代码就是下面这样子。

```java
ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
```

缓冲区**读写数据**的两个核心方法：

- put()：将数据写入到缓冲区中
- get()：从缓冲区中读取数据

缓冲区的重要属性：

- **capacity**：缓冲区中**最大存储数据的容量**，一旦声明则无法改变

- **limit**：表示缓冲区中**可以操作数据的大小**，limit 之后的数据无法进行读写。必须满足 limit <= capacity
- **position**：当前缓冲区中**正在操作数据的下标位置**，必须满足 position <= limit
- **mark**：标记位置，调用 reset() 将 position 位置调整到 mark 属性指向的下标位置，**实现多次读取数据**

缓冲区为高效读写数据而提供的其它**辅助方法**：

- flip()：可以实现**读写模式的切换**，我们可以看看里面的源码

```java
public final Buffer flip() {
    limit = position;
    position = 0;
    mark = -1;
    return this;
}
```

调用 flip() 会将可操作的大小 limit 设置为当前写的位置，操作数据的起始位置 position 设置为 0，即**从头开始读取数据**。

- rewind()：可以将 position 位置设置为 0，再次读取缓冲区中的数据
- clear()：清空整个缓冲区，它会将 position 设置为 0，limit 设置为 capacity，可以**写整个缓冲区**

> 更多的方法可以去查阅 API 文档，本文碍于篇幅原因就不贴出其它方法了，主要是要**理解缓冲区的作用**

我们来看一个简单的例子

```java
public Class Main {
    public static void main(String[] args) {
         // 分配内存大小为11的整型缓存区
        IntBuffer buffer = IntBuffer.allocate(11);
        // 往buffer里写入2个整型数据
        for (int i = 0; i < 2; ++i) {
            int randomNum = new SecureRandom().nextInt();
            buffer.put(randomNum);
        }
        // 将Buffer从写模式切换到读模式
        buffer.flip();
        System.out.println("position >> " + buffer.position()
                           + "limit >> " + buffer.limit() 
                           + "capacity >> " + buffer.capacity());
        // 读取buffer里的数据
        while (buffer.hasRemaining()) {
            System.out.println(buffer.get());
        }
        System.out.println("position >> " + buffer.position()
                           + "limit >> " + buffer.limit() 
                           + "capacity >> " + buffer.capacity());
    }
}
```

执行结果如下图所示，首先我们往缓冲区中写入 2 个数据，position 在写模式下指向下标 2，然后调用 flip() 方法切换为读模式，limit 指向下标 2，position 从 0 开始读数据，读到下标为 2 时发现到达 limit 位置，不可继续读。

![](http://cdn.smallpineapple.top/20200902104607.png)

整个过程可以用下图来理解，调用 flip() 方法以后，读出数据的同时 position 指针不断往后挪动，到达 limit 指针的位置时，该次读取操作结束。

![](http://cdn.smallpineapple.top/20200902104730.png)

> 介绍完缓冲区后，我们知道它是存储数据的空间，进程可以将缓冲区中的数据读取出来，也可以写入新的数据到缓冲区，那缓冲区的数据从哪里来，又怎么写出去呢？接下来我们需要学习传输数据的介质：通道（Channel）

## 通道（Channel）

上面我们介绍过，通道是作为一种连接资源，作用是传输数据，而真正存储数据的是缓冲区，所以介绍完缓冲区后，我们来学习通道这一块。

通道是可以**双向读写**的，传统的 BIO 需要使用输入/输出流表示数据的流向，在 NIO 中可以减少通道资源的消耗。

![](http://cdn.smallpineapple.top/20200906104847.png)

通道类都保存在 `java.nio.channels` 包下，我们日常用到的几个重要的类有 4 个：

| IO 通道类型 |                            具体类                            |
| :---------: | :----------------------------------------------------------: |
|   文件 IO   |         FileChannel（用于文件读写、操作文件的通道）          |
| TCP 网络 IO | SocketChannel（用于读写数据的 TCP 通道）、ServerSocketChannel（监听客户端的连接） |
| UDP 网络 IO |           DatagramChannel（收发 UDP 数据报的通道）           |

可以通过 `getChannel()` 方法获取一个通道，支持获取通道的类如下：

- 文件 IO：FileInputStream、FileOutputStream、RandomAccessFile
- TCP 网络 IO：Socket、ServerSocket
- UDP 网络 IO：DatagramSocket

### 示例：文件拷贝案例

我们来看一个利用**通道拷贝文件**的例子，需要下面几个步骤：

- 打开原文件的输入流通道，将字节数据读入到缓冲区中
- 打开目的文件的输出流通道，将缓冲区中的数据写到目的地
- 关闭所有流和通道（重要！）

这是一张小菠萝的照片，它存在于`d:\小菠萝\`文件夹下，我们将它拷贝到 `d:\小菠萝分身\` 文件夹下。

![](http://cdn.smallpineapple.top/myPhoto.png)

```java
public class Test {
	/** 缓冲区的大小 */
    public static final int SIZE = 1024;

    public static void main(String[] args) throws IOException {
        // 打开文件输入流
        FileChannel inChannel = new FileInputStream("d:\小菠萝\小菠萝.jpg").getChannel();
        // 打开文件输出流
        FileChannel outChannel = new FileOutputStream("d:\小菠萝分身\小菠萝-拷贝.jpg").getChannel();
        // 分配 1024 个字节大小的缓冲区
        ByteBuffer dsts = ByteBuffer.allocate(SIZE);
        // 将数据从通道读入缓冲区
        while (inChannel.read(dsts) != -1) {
            // 切换缓冲区的读写模式
            dsts.flip();
            // 将缓冲区的数据通过通道写到目的地
            outChannel.write(dsts);
            // 清空缓冲区，准备下一次读
            dsts.clear();
        }
        inChannel.close();
        outChannel.close();
    }

}
```

我画了一张图帮助你理解上面的这一个过程。

![](http://cdn.smallpineapple.top/20200904102845.png)



> 有人会问，NIO 的文件拷贝和传统 IO 流的文件拷贝有何不同呢？我们在编程时感觉它们没有什么区别呀，**貌似只是 API 不同罢了**，我们接下来就去看看这两者之间的区别吧。

### BIO 和 NIO 拷贝文件的区别

这个时候就要来了解了解操作系统底层是怎么对 IO 和 NIO 进行区别的，我会用尽量通俗的文字带你理解，可能并不是那么严谨。

操作系统最重要的就是**内核**，它既可以访问受保护的内存，也可以访问底层硬件设备，所以为了保护内核的安全，操作系统将底层的虚拟空间分为了**用户空间**和**内核空间**，其中用户空间就是给用户进程使用的，内核空间就是专门给操作系统底层去使用的。

![](http://cdn.smallpineapple.top/20200904104123.png)

接下来，有一个 Java 进程希望把小菠萝这张图片从磁盘上拷贝，那么内核空间和用户空间都会有一个**缓冲区**

- 这张照片就会从磁盘中读出到**内核缓冲区**中保存，然后操作系统将内核缓冲区中的这张图片字节数据拷贝到用户进程的缓冲区中保存下来，对应着下面这幅图

![](http://cdn.smallpineapple.top/20200904104823.png)

- 然后用户进程会希望把缓冲区中的字节数据写到磁盘上的另外一个地方，会将数据拷贝到 Socket 缓冲区中，最终操作系统再将 Socket 缓冲区的数据写到磁盘的指定位置上。

![](http://cdn.smallpineapple.top/20200904105253.png)

这一轮操作下来，我们数数经过了几次数据的拷贝？`4` 次。有 2 次是**内核空间和用户空间之间的数据拷贝**，这两次拷贝涉及到**用户态和内核态的切换**，需要**CPU参与进来**，进行上下文切换。而另外 2 次是**硬盘和内核空间之间的数据拷贝**，这个过程利用到 DMA与系统内存交换数据，不需要 CPU 的参与。

导致 IO 性能瓶颈的原因：**内核空间与用户空间之间数据过多无意义的拷贝，以及多次上下文切换**

| 操作                           | 状态             |
| ------------------------------ | :--------------- |
| 用户进程请求读取数据           | 用户态 -> 内核态 |
| 操作系统内核返回数据给用户进程 | 内核态 -> 用户态 |
| 用户进程请求写数据到硬盘       | 用户态 -> 内核态 |
| 操作系统返回操作结果给用户进程 | 内核态 -> 用户态 |

> 在用户空间与内核空间之间的操作，会涉及到上下文的切换，这里需要 CPU 的干预，而数据在两个空间之间来回拷贝，也需要 CPU 的干预，这无疑会增大 CPU 的压力，NIO 是如何减轻 CPU 的压力？运用操作系统的**零拷贝**技术。

### 操作系统的零拷贝

所以，操作系统出现了一个全新的概念，解决了 IO 瓶颈：**零拷贝**。零拷贝指的是**内核空间与用户空间之间的零次拷贝**。

零拷贝可以说是 IO 的一大救星，操作系统底层有许多种零拷贝机制，我这里仅针对 Java NIO 中使用到的其中一种零拷贝机制展开讲解。

在 Java NIO 中，零拷贝是通过**用户空间和内核空间的缓冲区共享一块物理内存**实现的，也就是说上面的图可以演变成这个样子。

![image-20200904122132978](http://cdn.smallpineapple.top/image-20200904122132978.png)
这时，无论是用户空间还是内核空间操作自己的缓冲区，本质上都是**操作这一块共享内存**中的缓冲区数据，**省去了用户空间和内核空间之间的数据拷贝操作**。

现在我们重新来拷贝文件，就会变成下面这个步骤：

- 用户进程通过系统调用 `read()` 请求读取文件到用户空间缓冲区（**第一次上下文切换**），用户态 -> 核心态，数据从硬盘读取到内核空间缓冲区中（**第一次数据拷贝**）
- 系统调用返回到用户进程（**第二次上下文切换**），此时用户空间与内核空间共享这一块内存（缓冲区），所以**不需要从内核缓冲区拷贝到用户缓冲区**
- 用户进程发出 `write()` 系统调用请求写数据到硬盘上（**第三次上下文切换**），此时需要将内核空间缓冲区中的数据拷贝到内核的 Socket 缓冲区中（**第二次数据拷贝**）
- 由 DMA 将 Socket 缓冲区的内容写到硬盘上（**第三次数据拷贝**），`write()` 系统调用返回（**第四次上下文切换**）

整个过程就如下面这幅图所示。

![](http://cdn.smallpineapple.top/20200904123822.png)

图中，**需要 CPU 参与工作的步骤只有第③个步骤**，对比于传统的 IO，CPU 需要在用户空间与内核空间之间参与拷贝工作，需要无意义地占用 2 次 CPU 资源，导致 CPU 资源的浪费。

下面总结一下操作系统中零拷贝的优点：

- **降低 CPU 的压力**：避免 CPU 需要参与内核空间与用户空间之间的数据拷贝工作
- **减少不必要的拷贝**：避免用户空间与内核空间之间需要进行数据拷贝

上面的图示可能并不严谨，对于你理解零拷贝会有一定的帮助，关于零拷贝的知识点可以去查阅更多资料哦，这是一门大学问。

> 介绍完通道后，我们知道它是用于**传输数据的一种介质**，而且是**可以双向读写**的，那么如果放在网络 IO 中，这些通道如果有数据就绪时，服务器是如何发现并处理的呢？接下来我们去学习 NIO 中的最后一个重要知识点：选择器（Selector）

## 选择器（Selectors）

选择器是提升 IO 性能的灵魂之一，它底层利用了**多路复用 IO**机制，让选择器可以监听多个 IO 连接，根据 IO 的状态响应到服务器端进行处理。通俗地说：**选择器可以监听多个 IO 连接，而传统的 BIO 每个 IO 连接都需要有一个线程去监听和处理。**

![](http://cdn.smallpineapple.top/20200906105002.png)

图中很明显的显示了在 BIO 中，每个 Socket 都需要有一个专门的线程去处理每个请求，而在 NIO 中，只需要一个 Selector 即可监听各个 Socket 请求，而且 Selector 并不是阻塞的，所以**不会因为多个线程之间切换导致上下文切换带来的开销**。

![image-20200904185402331](http://cdn.smallpineapple.top/20200904185407.png)

在 Java NIO 中，选择器是使用 `Selector` 类表示，Selector 可以接收各种 IO 连接，在 IO 状态准备就绪时，会通知该通道注册的 Selector，Selector 在**下一次轮询**时会发现该 IO 连接就绪，进而处理该连接。

Selector 选择器主要用于**网络 IO**当中，在这里我会将传统的 BIO Socket 编程和使用 NIO 后的 Socket 编程作对比，分析 NIO 为何更受欢迎。首先先来了解 Selector 的基本结构。

|         重要方法         |                           方法解析                           |
| :----------------------: | :----------------------------------------------------------: |
|          open()          |                   打开一个 Selector 选择器                   |
|       int select()       |                     阻塞地等待就绪的通道                     |
| int select(long timeout) | 最多阻塞 timeout 毫秒，如果是 0 则一直阻塞等待，如果是 1 则代表最多阻塞 1 毫秒 |
|     int selectNow()      |                    非阻塞地轮询就绪的通道                    |

在这里，你会看到 select() 和它的重载方法是会阻塞的，如果用户进程轮询时发现没有就绪的通道，操作系统有两种做法：

- 一直等待直到一个就绪的通道，再返回给用户进程
- 立即返回一个错误状态码给用户进程，让用户进程继续运行，不会阻塞

这两种方法对应了**同步阻塞 IO** 和 **同步非阻塞 IO** ，这里读者的一点小的观点，请各位大神**批判阅读**

> Java 中的 NIO 不能真正意义上称为 Non-Blocking IO，我们通过 API 的调用可以发现，select() 方法还是会存在阻塞的现象，根据传入的参数不同，操作系统的行为也会有所不同，不同之处就是**阻塞还是非阻塞**，所以我更倾向于把 NIO 称为 New IO，因为它不仅提供了 Non-Blocking IO，而且保留原有的 Blocking IO 的功能。

了解了选择器之后，它的作用就是：**监听多个 IO 通道，当有通道就绪时选择器会轮询发现该通道，并做相应的处理**。那么 IO 状态分为很多种，我们如何去识别就绪的通道是处于哪种状态呢？在 Java 中提供了**选择键（SelectionKey）**。

### 选择键（SelectionKey）

在 Java 中提供了 4 种选择键：

- SelectionKey.OP_READ：套接字通道准备好进行**读操作**
- SelectionKey.OP_WRITE：套接字通道准备好进行**写操作**
- SelectionKey.OP_ACCEPT：服务器套接字通道**接受其它通道**
- SelectionKey.OP_CONNECT：套接字通道准备**完成连接**

在 SelectionKey 中包含了许多属性

- channel：该选择键**绑定的通道**
- selector：轮询到该选择键的**选择器**
- readyOps：当前**就绪选择键的值**
- interesOps：该选择器对该通道**感兴趣的所有选择键**

选择键的作用是：**在选择器轮询到有就绪通道时，会返回这些通道的就绪选择键（SelectionKey），通过选择键可以获取到通道进行操作。**

简单了解了选择器后，我们可以结合缓冲区、通道和选择器来完成一个简易的聊天室应用。

### 示例：简易的客户端服务器通信

> 先说明，这里的代码非常的臭和长，不推荐细看，直接看注释附近的代码即可。

我们在服务器端会开辟两个线程

- Thread1：专门监听客户端的连接，并把通道注册到客户端选择器上
- Thread2：专门监听客户端的其它 IO 状态（读状态），当客户端的 IO 状态就绪时，该选择器会轮询发现，并作相应处理

```java
public class NIOServer {
    
	Selector serverSelector = Selector.open();
    Selector clientSelector = Selector.open();
    
    public static void main(String[] args) throws IOException {
        NIOServer server = nwe NIOServer();
        new Thread(() -> {
            try {
                // 对应IO编程中服务端启动
                ServerSocketChannel listenerChannel = ServerSocketChannel.open();
                listenerChannel.socket().bind(new InetSocketAddress(3333));
                listenerChannel.configureBlocking(false);
                listenerChannel.register(serverSelector, SelectionKey.OP_ACCEPT);
				server.acceptListener();
            } catch (IOException ignored) {
            }
        }).start();
        new Thread(() -> {
            try {
                server.clientListener();
            } catch (IOException ignored) {
            }
        }).start();
    }
}
// 监听客户端连接
public void acceptListener() {
    while (true) {
        if (serverSelector.select(1) > 0) {
            Set<SelectionKey> set = serverSelector.selectedKeys();
            Iterator<SelectionKey> keyIterator = set.iterator();
            while (keyIterator.hasNext()) {
                SelectionKey key = keyIterator.next();
                if (key.isAcceptable()) {
                    try {
                        // (1) 每来一个新连接，注册到clientSelector
                        SocketChannel clientChannel = ((ServerSocketChannel) key.channel()).accept();
                        clientChannel.configureBlocking(false);
                        clientChannel.register(clientSelector, SelectionKey.OP_READ);
                    } finally {
                        // 从就绪的列表中移除这个key
                        keyIterator.remove();
                    }
                }
            }
        }
    }
}
// 监听客户端的 IO 状态就绪
public void clientListener() {
    while (true) {
        // 批量轮询是否有哪些连接有数据可读
        if (clientSelector.select(1) > 0) {
            Set<SelectionKey> set = clientSelector.selectedKeys();
            Iterator<SelectionKey> keyIterator = set.iterator();
            while (keyIterator.hasNext()) {
                SelectionKey key = keyIterator.next();
				// 判断该通道是否读就绪状态
                if (key.isReadable()) {
                    try {
                        // 获取客户端通道读入数据
                        SocketChannel clientChannel = (SocketChannel) key.channel();
                        ByteBuffer byteBuffer = ByteBuffer.allocate(1024);
                        clientChannel.read(byteBuffer);
                        byteBuffer.flip();
                        System.out.println(
                            LocalDateTime.now().toString() + " Server 端接收到来自 Client 端的消息: " +
                            Charset.defaultCharset().decode(byteBuffer).toString());
                    } finally {
                        // 从就绪的列表中移除这个key
                        keyIterator.remove();
                        key.interestOps(SelectionKey.OP_READ);
                    }
                }
            }
        }
    }
}
```

在客户端，我们可以简单的输入一些文字，发送给服务器

```java
public class NIOClient {
    
    public static final int CAPACITY = 1024;

    public static void main(String[] args) throws Exception {
        ByteBuffer dsts = ByteBuffer.allocate(CAPACITY);
        SocketChannel socketChannel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 3333));
        socketChannel.configureBlocking(false);
        Scanner sc = new Scanner(System.in);
        while (true) {
            String msg = sc.next();
            dsts.put(msg.getBytes());
            dsts.flip();
            socketChannel.write(dsts);
            dsts.clear();
        }
    }
    
}
```

下图可以看见，在客户端给服务器端发送信息，服务器接收到消息后，可以将该条消息**分发给其它客户端**，就可以实现一个简单的**群聊系统**，我们还可以给这些客户端贴上标签例如**用户姓名，聊天等级······**，就可以标识每个客户端啦。在这里由于篇幅原因，我没有写出所有功能，因为使用原生的 NIO 实在是不太便捷。

![](http://cdn.smallpineapple.top/20200906093418.png)

我相信你们都是直接滑下来看这里的，我在写这段代码的时候也非常痛苦，甚至有点厌烦 Java 原生的 NIO 编程。实际上我们在日常开发中很少直接用 NIO 进行编程，通常都会用 Netty，Mina 这种服务器框架，它们都是很好地 NIO 技术，对 Java 原生的 NIO 进行了上层的封装、优化，简化开发难度，但是**在学习框架之前，我们需要了解它底层原生的技术，就像 Spring AOP 的动态代理，Spring IOC 容器的 Map 容器存储对象，Netty 底层的 NIO 基础······**

## 总结

NIO 的三大板块基本上都介绍完了，我没有做过多详细的 API 介绍，我希望能够通过这篇文章让你们对以下内容有所认知

- Java IO 体系的组成部分：BIO 和 NIO
- BIO 的基本组成部分：字节流，字符流，转换流和处理流
- NIO 的三大重要模块：缓冲区（Buffer），通道（Channel），选择器（Selector）以及它们的作用
- NIO 与 BIO 两者的对比：同步/非同步、阻塞/非阻塞，在文件 IO 和 网络 IO 中，使用 NIO 相对于使用 BIO 有什么优势

[浅谈 Linux下的零拷贝机制](https://www.jianshu.com/p/e76e3580e356)

[Java NIO学习笔记四（零拷贝详解）](https://blog.csdn.net/u013096088/article/details/79122671)
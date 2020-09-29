# Atomicxxx 的用法和实现原理

i++ 不是线程安全的操作，因为它不是一个原子性操作。

那么，如果我想要达到类似 i++ 的这种效果，我应该使用哪些集合或者说工具类呢？

在 JDK1.5 之前，为了确保在多线程下对某`基本`数据类型或者`引用`数据类型运算的原子性，必须依赖于外部关键字 `synchronized`，但是这种情况在 JDK1.5 之后发生了改观，当然你依然可以使用 synchronized 来保证原子性，我们这里所说的一种线程安全的方式是原子性的工具类，比如 **AtomicInteger、AtomicBoolean** 等。这些原子类都是线程安全的工具类，他们同时也是 `Lock-Free` 的。下面我们就来一起认识一下这些工具类以及 Lock - Free 是个什么概念。

## 了解 AtomicInteger

`AtomicInteger` 是 JDK 1.5 新添加的工具类，我们首先来看一下它的继承关系

<img src="https://s1.ax1x.com/2020/09/20/wosPYV.png" alt="AtomicInteger01" border="0">

与 int 的包装类 Integer 一样，都是继承于 `Number` 类的。

<img src="https://s1.ax1x.com/2020/09/20/wos4pT.png" alt="AtomicInteger02" border="0">

这个 Number 类是基本数据类型的包装类，一般和数据类型有关的对象都会继承于 Number 类。

它的继承体系很简单，下面我们来看一下它的基本属性和方法

### AtomicInteger 的基本属性

AtomicInteger 的基本属性有三个

<img src="https://s1.ax1x.com/2020/09/20/wTiyJH.png" alt="wTiyJH.png" border="0" />

`Unsafe` 是 `sun.misc` 包下面的类，AtomicInteger 主要是依赖于 sun.misc.Unsafe 提供的一些 native 方法保证操作的原子性。

Unsafe 的 `objectFieldOffset` 方法可以获取成员属性在内存中的地址相对于对象内存地址的偏移量。说得简单点就是找到这个变量在内存中的地址，便于后续通过内存地址直接进行操作，这个值就是 `value`

这个我们后面会再细说

`value` 就是 AtomicIneger 的值。

### AtomicInteger 的构造方法

继续往下看，AtomicInteger 的构造方法只有两个，一个是无参数的构造方法，无参数的构造方法默认的 value 初始值是 0 ，带参数的构造方法可以指定初始值。

<img src="https://s1.ax1x.com/2020/09/20/wosWt0.png" alt="AtomicInteger04" border="0">

### AtomicInteger 中的方法

下面我们就来聊一下 AtomicInteger 中的方法。

#### Get  和 Set 

我们首先来看一下最简单的 get 、set 方法：

`get()` : 获取当前 AtomicInteger 的值

`set()` : 设置当前 AtomicInteger 的值

get() 可以原子性的读取 AtomicInteger  中的数据，set() 可以原子性的设置当前的值，因为 get() 和 set() 最终都是作用于 value 变量，而 value 是由 `volatile` 修饰的，所以 get 、set 相当于都是对内存进行读取和设置。如下图所示

<img src="https://s1.ax1x.com/2020/09/20/wosRkq.png" alt="AtomicInteger05" border="0">

我们上面提到了 i++ 和 i++ 的非原子性操作，我们说可以使用 AtomicInteger 中的方法进行替换。

#### Incremental 操作

AtomicInteger 中的 `Incremental` 相关方法可以满足我们的需求

* `getAndIncrement()` :  原子性的增加当前的值，并把结果返回。相当于 `i++` 的操作。

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200911085857825.png" alt="image-20200911085857825" style="zoom:67%;" />

为了验证是不是线程安全的，我们用下面的例子进行测试

```java
public class TAtomicTest implements Runnable{

    AtomicInteger atomicInteger = new AtomicInteger();

    @Override
    public void run() {
        for(int i = 0;i < 10000;i++){
            System.out.println(atomicInteger.getAndIncrement());
        }
    }
    public static void main(String[] args) {

        TAtomicTest tAtomicTest = new TAtomicTest();

        Thread t1 = new Thread(tAtomicTest);
        Thread t2 = new Thread(tAtomicTest);
        t1.start();
        t2.start();
    }

}
```

通过输出结果你会发现它是一个线程安全的操作，你可以修改 i 的值，但是最后的结果仍然是 i - 1，因为先取值，然后再 + 1，它的示意图如下。

<img src="https://s1.ax1x.com/2020/09/20/wosg7n.png" alt="AtomicInteger06" border="0">

* `incrementAndGet` 与此相反，首先执行 + 1 操作，然后返回自增后的结果，该操作方法能够确保对 value 的原子性操作。如下图所示

<img src="https://s1.ax1x.com/2020/09/20/wosc0s.png" alt="AtomicInteger07" border="0">

#### Decremental 操作

与此相对，x-- 或者 x = x - 1 这样的自减操作也是原子性的。我们仍然可以使用 AtomicInteger 中的方法来替换

* `getAndDecrement` : 返回当前类型的 int 值，然后对 value 的值进行自减运算。下面是测试代码

```java
class TAtomicTestDecrement implements Runnable{

    AtomicInteger atomicInteger = new AtomicInteger(20000);

    @Override
    public void run() {
        for(int i = 0;i < 10000 ;i++){
            System.out.println(atomicInteger.getAndDecrement());
        }
    }

    public static void main(String[] args) {

        TAtomicTestDecrement tAtomicTest = new TAtomicTestDecrement();

        Thread t1 = new Thread(tAtomicTest);
        Thread t2 = new Thread(tAtomicTest);
        t1.start();
        t2.start();

    }

}
```

下面是 getAndDecrement 的示意图

<img src="https://s1.ax1x.com/2020/09/20/wos6mj.png" alt="AtomicInteger08" border="0">

* `decrementAndGet`：同样的，decrementAndGet 方法就是先执行递减操作，然后再获取 value 的值，示意图如下

<img src="https://s1.ax1x.com/2020/09/20/wossXQ.png" alt="AtomicInteger09" border="0">

#### LazySet 方法

volatile 有内存屏障你知道吗？

内存屏障是啥啊？

> 内存屏障，也称`内存栅栏`，内存栅障，屏障指令等， 是一类同步屏障指令，是 CPU 或编译器在对内存随机访问的操作中的一个同步点，使得此点之前的所有读写操作都执行后才可以开始执行此点之后的操作。也是一个让CPU 处理单元中的内存状态对其它处理单元可见的一项技术。

CPU 使用了很多优化，使用缓存、指令重排等，其最终的目的都是为了性能，也就是说，当一个程序执行时，只要最终的结果是一样的，指令是否被重排并不重要。所以指令的执行时序并不是顺序执行的，而是乱序执行的，这就会带来很多问题，这也促使着内存屏障的出现。

语义上，内存屏障之前的所有写操作都要写入内存；内存屏障之后的读操作都可以获得同步屏障之前的写操作的结果。因此，对于敏感的程序块，写操作之后、读操作之前可以插入内存屏障。

内存屏障的开销非常轻量级，但是再小也是有开销的，LazySet 的作用正是如此，它会以普通变量的形式来读写变量。

也可以说是：**懒得设置屏障了**

<img src="https://s1.ax1x.com/2020/09/20/wosD1S.png" alt="AtomicInteger10" border="0">

#### GetAndSet 方法

以原子方式设置为给定值并返回旧值。

它的源码就是调用了一下 unsafe 中的 getAndSetInt 方法，如下所示

<img src="https://s1.ax1x.com/2020/09/20/woswff.png" alt="AtomicInteger11" border="0">

就是先进行循环，然后调用 `getIntVolatile` 方法，这个方法我在 cpp 中没有找到，找到的小伙伴们记得及时告诉让我学习一下。

循环直到 compareAndSwapInt 返回 false，这就说明使用 CAS 并没有更新为新的值，所以 var5 返回的就是最新的内存值。

#### CAS 方法

我们一直常说的 CAS 其实就是 `CompareAndSet` 方法，这个方法顾名思义，就是 **比较并更新** 的意思，当然这是字面理解，字面理解有点偏差，其实人家的意思是先比较，如果满足那么再进行更新。

<img src="https://s1.ax1x.com/2020/09/20/wosBp8.png" alt="AtomicInteger12" border="0">

上面给出了 CAS Java 层面的源码，JDK 官方给它的解释就是 **如果当前值等于 expect 的值，那么就以原子性的方式将当前值设置为 update 给定值**，这个方法会返回一个 boolean 类型，如果是 true 就表示比较并更新成功，否则表示失败。

CAS 同时也是一种无锁并发机制，也称为 `Lock Free`，所以你觉得 Lock Free 很高大上吗？并没有。

下面我们构建一个加锁解锁的 `CASLock`

```java
class CASLock {

    AtomicInteger atomicInteger = new AtomicInteger();
    Thread currentThread = null;

    public void tryLock() throws Exception{

        boolean isLock = atomicInteger.compareAndSet(0, 1);
        if(!isLock){
            throw new Exception("加锁失败");
        }

        currentThread = Thread.currentThread();
        System.out.println(currentThread + " tryLock");

    }

    public void unlock() {

        int lockValue = atomicInteger.get();
        if(lockValue == 0){
            return;
        }
        if(currentThread == Thread.currentThread()){
            atomicInteger.compareAndSet(1,0);
            System.out.println(currentThread + " unlock");
        }
    }

    public static void main(String[] args) {

        CASLock casLock = new CASLock();

        for(int i = 0;i < 5;i++){

            new Thread(() -> {
                try {
                    casLock.tryLock();
                    Thread.sleep(10000);
                } catch (Exception e) {
                    e.printStackTrace();
                }finally {
                    casLock.unlock();
                }
            }).start();
        }

    }
}
```

在上面的代码中，我们构建了一个 CASLock，在 `tryLock` 方法中，我们先使用 CAS 方法进行更新，如果更新不成功则抛出异常，并把当前线程设置为加锁线程。在 `unLock` 方法中，我们先判断当前值是否为 0 ，如果是 0 就是我们愿意看到的结果，直接返回。否则是 1，则表示当前线程还在加锁，我们再来判断一下当前线程是否是加锁线程，如果是则执行解锁操作。

那么我们上面提到的 compareAndSet，它其实可以解析为如下操作

```java
// 伪代码

// 当前值
int v = 0;
int a = 0;
int b = 1;

if(compare(0,0) == true){
  set(0,1);
}
else{
  // 继续向下执行
}
```

也可以拿生活场景中的买票举例子，你去景区旅游肯定要持票才能进，如果你拿着是假票或者不符合景区的票肯定是能够被识别出来的，如果你没有拿票拿你也肯定进不去景区。

废话少说，这就祭出来 compareAndSet 的示意图

<img src="https://s1.ax1x.com/2020/09/29/0eTD1A.png" alt="0eTD1A.png" border="0" />

* `weakCompareAndSet`: 妈的非常认真看了好几遍，发现 JDK1.8 的这个方法和 compareAndSet 方法完全一摸一样啊，坑我。。。

<img src="https://s1.ax1x.com/2020/09/20/wosYmd.png" alt="AtomicInteger15" border="0">

但是真的是这样么？并不是，JDK 源码很博大精深，才不会设计一个重复的方法，你想想 JDK 团队也不是会犯这种低级团队，但是原因是什么呢？

《Java 高并发详解》这本书给出了我们一个答案

<img src="https://s1.ax1x.com/2020/09/20/wosr6g.png" alt="AtomicInteger16" border="0">

#### AddAndGet 

AddAndGet 和 getAndIncrement、getAndAdd、incrementAndGet 等等方法都是使用了 do ... while  + CAS 操作，其实也就相当于是一个自旋锁，如果 CAS 修改成功就会一直循环，修改失败才会返回。示意图如下

<img src="https://s1.ax1x.com/2020/09/20/wosGOH.png" alt="AtomicInteger17" border="0">

### 深入 AtomicInteger

我们上面探讨了 AtomicInteger 的具体使用，同时我们知道 AtomicInteger 是依靠 volatile 和 CAS 来保证原子性的，那么我们下面就来分析一下为什么 CAS 能够保证原子性，它的底层是什么？AtomicInteger 与乐观锁又有什么关系呢？

#### AtomicInteger 的底层实现原理

我们再来瞧瞧这个可爱的 `compareAndSetL(CAS)` 方法，为什么就这两行代码就保证原子性了？

<img src="https://s1.ax1x.com/2020/09/20/wos86e.png" alt="AtomicInteger18" border="0">

我们可以看到，这个 CAS 方法相当于是调用了 unsafe 中的 `compareAndSwapInt` 方法，我们进到 unsafe 方能发中看一下具体实现。

<img src="https://s1.ax1x.com/2020/09/20/wos3lD.png" alt="AtomicInteger19" border="0">

compareAndSwapInt 是 `sun.misc` 中的方法，这个方法是一个 `native` 方法，它的底层是 C/C++ 实现的，所以我们需要看 C/C++ 的源码。

知道 C/C++ 的牛逼之处了么。使用 Java 就是玩应用和架构的，C/C++ 是玩服务器、底层的。

compareAndSwapInt 的源码在 `jdk8u-dev/hotspot/src/share/vm/prims/unsafe.app` 路径下，它的源码实现是 

<img src="https://s1.ax1x.com/2020/09/20/wosMY6.png" alt="AtomicInteger20" border="0">

也就是 `Unsafe_CompareAndSwapInt` 方法，我们找到这个方法

<img src="https://s1.ax1x.com/2020/09/20/wosKFx.png" alt="AtomicInteger21" border="0">

C/C++ 源码我也看不懂，但是这不妨碍我们找到关键代码 `Atomic::cmpxchg` ，cmpxchg 是 x86 CPU 架构的汇编指令，它的主要作用就是比较并交换操作数。我们继续往下跟找一下这个指令的定义。

我们会发现对应不同的 os，其底层实现方式不一样

<img src="https://s1.ax1x.com/2020/09/20/wos1SO.png" alt="AtomicInteger22" border="0">

我们找到 Windows 的实现方式如下

<img src="https://s1.ax1x.com/2020/09/20/wosQfK.png" alt="AtomicInteger23" border="0">

我们继续向下找，它其实定义的是第 216 行的代码，我们找进去

<img src="https://s1.ax1x.com/2020/09/20/wosnT1.png" alt="AtomicInteger24" border="0">

此时就需要汇编指令和寄存器相关的知识了。

上面的 `os::is-MP()` 是多处理操作系统的接口，下面是 __asm ，它是 C/C++ 的关键字，用于调用内联汇编程序。

__asm 中的代码是汇编程序，大致来说就是把 dest、exchange_value 、compare_value 的值都放在寄存器中，下面的 `LOCK_IF_MP` 中代码的大致意思就是

<img src="https://s1.ax1x.com/2020/09/20/wosmwR.png" alt="AtomicInteger25" border="0">

如果是多处理器的话就会执行 lock，然后进行比较操作。其中的 cmp 表示比较，mp 表示的就是 `MultiProcess`，`je` 表示相等跳转，L0 表示的是标识位。

我们回到上面的汇编指令，我们可以看到，CAS 的底层就是 `cmpxchg` 指令。

#### 乐观锁

你有没有这个疑问，为什么 AtomicInteger 可以获取当前值，那为什么还会出现 `expectValue` 和 `value` 不一致的情况呢？

因为 AtomicInteger 只是一个原子性的工具类，它不具有排他性，它不像是 `synchronized` 或者是 `lock` 一样具有互斥和排他性，还记得 AtomicInteger 中有两个方法 get 和 set 吗？它们只是用 `volatile ` 修饰了一下，而 volatile 不具有原子性，所以可能会存在 expectValue 和 value 的当前值不一致的情况，因此可能会出现重复修改。

针对上面这种情况的解决办法有两种，一种是使用 `synchronized` 和 `lock` 等类似的加锁机制，这种锁具有独占性，也就是说同一时刻只能有一个线程来进行修改，这种方式能够保证原子性，但是相对开销比较大，这种锁也叫做悲观锁。另外一种解决办法是使用`版本号`或者是 `CAS 方法`。

**版本号**

版本号机制是在数据表中加上一个 `version` 字段来实现的，表示数据被修改的次数，当执行写操作并且写入成功后，version = version + 1，当线程 A 要更新数据时，在读取数据的同时也会读取 version 值，在提交更新时，若刚才读取到的 version 值为当前数据库中的 version 值相等时才更新，否则重试更新操作，直到更新成功。

**CAS 方法**

还有一种方式就是 CAS 了，我们上面用了大量的篇幅来介绍 CAS 方法，那么我们认为你现在已经对其运行机制有一定的了解了，我们就不再阐述它的运行机制了。

任何事情都是有利也有弊，软件行业没有完美的解决方案只有最优的解决方案，所以乐观锁也有它的弱点和缺陷，那就是 ABA 问题。

#### ABA 问题

ABA 问题说的是，如果一个变量第一次读取的值是 A，准备好需要对 A 进行写操作的时候，发现值还是 A，那么这种情况下，能认为 A 的值没有被改变过吗？可以是由 A -> B -> A 的这种情况，但是 AtomicInteger 却不会这么认为，它只相信它看到的，它看到的是什么就是什么。举个例子来说

假如现在有一个单链表，如下图所示

<img src="https://s1.ax1x.com/2020/09/20/wosem9.png" alt="AtomicInteger26" border="0">

A.next = B ，B.next = null，此时有两个线程 T1 和 T2 分别从单链表中取出 A ，由于一些特殊原因，T2 把 A 改为 B ，然后又改为 A ，此时 T1 执行 CAS 方法，发现单链表仍然是 A ，就会执行 CAS 方法，虽然结果没错，但是这种操作会造成一些潜在的问题。

<img src="https://s1.ax1x.com/2020/09/20/wosEy4.png" alt="AtomicInteger27" border="0">

此时还是一个单链表，两个线程 T1 和 T2 分别从单链表中取出 A ，然后 T1 把链表改为 ACD 如下图所示

<img src="https://s1.ax1x.com/2020/09/20/wosVOJ.png" alt="AtomicInteger28" border="0">

此时 T2，发现内存值还是 A ，就会把 A 的值尝试替换为 B ，因为 B 的引用是 null，此时就会造成 C、D 处于游离态

<img src="https://s1.ax1x.com/2020/09/20/wosCF0.png" alt="AtomicInteger29" border="0">

JDK 1.5 以后的 `AtomicStampedReference `类就提供了此种能力，其中的 `compareAndSet` 方法就是首先检查当前值是否等于预期值，判断的标准就是当前引用和邮戳分别和预期引用和邮戳相等，如果全部相等，则以原子方式设置为给定的更新值。

<img src="https://s1.ax1x.com/2020/09/20/woskSU.png" alt="AtomicInteger30" border="0">

好了，上面就是 Java 代码流程了，看到 native 我们知道又要撸 cpp 了。开撸

<img src="https://s1.ax1x.com/2020/09/20/wosiWT.png" alt="AtomicInteger31" border="0">

简单解释一下就是 `UnsafeWrapper` 就是包装器，换个名字而已。然后经过一些 JNI 的处理，因为 compareAndSwapOject 比较的是引用，所以需要经过 C++ 面向对象的转换。最主要的方法是 `atomic_compare_exchange_oop` 

<img src="https://s1.ax1x.com/2020/09/20/wosAlF.png" alt="AtomicInteger32" border="0">

可以看到，又出现了熟悉的词汇 `cmpxchg` ，也就是说 compareAndSwapOject 使用的还是 cmpxchg 原子性指令，只是它经过了一系列转换。

我们上面介绍到了 AtomicInteger 是一种原子性的工具类，它的底层是依靠 CAS + Volatile 关键字来实现的原子性和可见性。那么作为八种基本数据类型的原子工具类，我们此篇文章就来介绍一下另外一个原子工具类那就是 `AtomicBoolean`，通常情况下，AtomicBoolean 用于原子性的更新状态标示位。

## 认识 AtomicBoolean

AtomicBoolean 的用法和 AtomicInteger 的非常相似，我们具体来看一下。

<img src="https://s1.ax1x.com/2020/09/29/0eofQ1.png" alt="AtomicBoolean001" border="0">

为什么 AtomicInteger 可以继承 Number 类而 AtomicBoolean 却没有继承于 Number 类呢？

我们先来看下 `Number` 类是什么吧

<img src="https://s1.ax1x.com/2020/09/29/0eoRzR.png" alt="AtomicBoolean002" border="0">

JDK 源码给出了我们解释

Number 类是 JDK 平台的超类，同时也是一个抽象类，它可以转换为具体数值的类，比如原始类型 **byte、double、float、int、long 和 short**。

>注意：可以看到只有六中基本数据类型，并没有 char 和 boolean。

也就是说，Number 类是基本数据类型 byte、double、float、int、long 和 short 包装类的超类，Number 类只进行方法的定义，不提供方法的具体实现，具体的实现交给子类去做。

<img src="https://s1.ax1x.com/2020/09/29/0eo2W9.png" alt="AtomicBoolean003" border="0" style="zoom:50%;" >

不同的数值之间的转换会存在数值丢失的问题，JDK 源码也给出了我们说明

<img src="https://s1.ax1x.com/2020/09/29/0eoci4.png" alt="AtomicBoolean004" border="0">

简单证明一下。

```java
Double d1 = 3.1214;
System.out.println(d1.intValue());
```

那么，还有两种基本数据类型 char 和 boolean ，char 和 boolean 的包装类又分别是啥呢？它们为什么没有被划分为 Number 超类中呢？

char 类型的包装类其实是 `character`

<img src="https://s1.ax1x.com/2020/09/29/0eoyoF.png" alt="AtomicBoolean005" border="0">

而 boolean 类型的包装类是 Boolean。

Char 是字符，它可以代表任何值，而不单单是数字，Boolean 只有两个数值：`TRUE` 和 `FALSE`，而 Boolean 在传输的过程中会被当作整数来看待，没有必要再继承于 Number 类。

在了解完 Number 之后，我们继续回到 AtomicBoolean 类的讨论上来。

### AtomicBoolean 创建

AtomicBoolean 用于原子性的更新标志值，它不能作为 boolean 的包装类 Boolean 的替代。

AtomicBoolean 的创建有两种，一种是无参的构造方法；一种是带参数的构造方法，如果 boolean 是 true 的话，那么 value 的值就是 1， 否则就是 0。

和 AtomicInteger 的构造方法一摸一样，只不过 AtomicInteger 的值可以是任意的，而 AtomicBoolean 的值只能是 true 和 false。

<img src="https://s1.ax1x.com/2020/09/29/0eogJJ.png" alt="AtomicBoolean006" border="0">

### AtomicBoolean 基本方法

AtomicBoolean 中的方法很少，下面一起来认识一下。

#### Get

AtomicBoolean 你看起来像是一个 Boolean 类型的值，但是其内部仍然使用 value 这个 int 值来进行存储，int 的值只能是 1 或 0 ，分别对应 true 或 false。

<img src="https://s1.ax1x.com/2020/09/29/0eosdU.png" alt="AtomicBoolean007" border="0" style="zoom:50%;" >

所以如果当前值是 1 就返回 true，如果是 0 就返回 false。

而 AtomicInteger 中的 get 方法只是返回当前值。

#### CompareAndSet

AtomicBoolean 也有 CAS 方法，而且和 AtomicInteger 中的 `compareAndSet` 底层都是使用的 `unfase.compareAndSwapInt` 方法，也就是说是，如果你的值只是使用的 0 和 1 ，那么不管是使用 AtomicBoolean 还是 AtomicInteger 达到的效果一样。

<img src="https://s1.ax1x.com/2020/09/29/0eorZT.png" alt="AtomicBoolean008" border="0">

#### Set

JDK 给出的解释是无条件的设置为当前值。AtomicInteger 也是一样的。

<img src="https://s1.ax1x.com/2020/09/29/0eo0s0.png" alt="AtomicBoolean009" border="0">

  #### LazySet

就连 lazySet 都和 AtomicInteger 底层使用的方法也一样。只是 AtomicBoolean 比 AtomicInteger 多了一层判断

<img src="https://s1.ax1x.com/2020/09/29/0eoBLV.png" alt="AtomicBoolean010" border="0">

#### GetAndSet

AtomicBoolean 中的 getAndSet 方法还是和 AtomicInteger 中的有点区别的。

<img src="https://s1.ax1x.com/2020/09/29/0eowMq.png" alt="AtomicBoolean011" border="0">

AtomicBoolean 的底层和方法和 AtomicInteger 一样，如果了解了 AtomicInteger 之后，那么 AtomicBoolean 也就没问题了。AtomicBoolean 本身没多少东西。但是 AtomicBoolean 很适合做开关，因为 AtomicBoolean 中的值只有 1 和 0 。

## AtomicLong

与 AtomicInteger 一样，AtomicLong 也是继承于 Number 类的，AtomicLong 里面的方法几乎和 AtomicInteger 一样，不过 AtomicLong 底层源码可不一样。

对比如下

| 方法                 | AtomicInteger 底层 | AtomicLong 底层   |
| -------------------- | ------------------ | ----------------- |
| lazySet              | putOrderedLong     | putOrderedInt     |
| getAndSet            | getAndSetLong      | getAndSetInt      |
| compareAndSet        | compareAndSwapLong | compareAndSwapInt |
| getAndIncrement 等等 | getAndAddLong      | getAndAddInt      |

可以看到，虽然只有一词之差，但是其中的 C/C++ 源码可是相差很多，这次我们简单介绍一下 AtomicLong 的底层实现。

### CAS 方法

下面我们一起来看一下 CAS 的区别

<img src="https://s1.ax1x.com/2020/09/29/0eoazn.png" alt="AtomicBoolean012" border="0">

在 /jdk8u-dev/hotspot/src/share/vm/prims/unsafe.cpp 中定义了 CAS 中的方法 `UNSAFE_ENTRY`。如下所示

<img src="https://s1.ax1x.com/2020/09/29/0eoHFe.png" alt="AtomicBoolean013" border="0">

相比于 `compareAndSwapInt` 方法，在 unsafe.cpp 中，compareAndSwapLong 方法包含了`条件编译` SUPPORTS_NATIVE_CX8，这是啥？

我们在 AtomicLong 的 .java 文件中也能看到定义

<img src="https://s1.ax1x.com/2020/09/29/0eoURs.png" alt="AtomicBoolean014" border="0">

JDK 源码给出了我们解释

`VM_SUPPORTS_LONG_CAS` 是 JVM 的一项用来记录，用来记录是否长期支持无锁的 `compareAndSwap` 方法。尽管 Unsafe.compareAndSwapLong 在有锁和无锁情况下都支持，但是应该在 Java 级别处理某些构造，以避免锁定用户可见的锁。

从代码可以看到，`UNSAFE_ENTRY` 方法首先会判断是否支持 `SUPPORTS_NATIVE_CX8`，啥意思呢？它的意思就是判断机器是否支持 8 字节的 `cmpxchg` 这个 CPU 指令。如果硬件不支持，就会判断 JVM 是否支持，如果 JVM 也不支持，就表明这个操作不是 `Lock Free` 的。此时JVM 会使用显示锁例如 `synchronized` 来接管。这也是上面这段 cpp 源码的解释。

> 比如 32 位 CPU 肯定不支持 8 字节 64 位数字的 cpmxchg 指令

那么如何判断系统是否支持 8 字节的 cmpxchg 指令呢？或许用下面这段代码可以证明

```java
public static void main(String[] args) throws Exception {

  Class klass = Class.forName("java.util.concurrent.atomic.AtomicLong");
  Field field = klass.getDeclaredField("VM_SUPPORTS_LONG_CAS");
  field.setAccessible(true);
  boolean VMSupportsCS8 = field.getBoolean(null);
  System.out.println(VMSupportsCS8);
  if (! VMSupportsCS8)
    throw new Exception("Unexpected value for VMSupportsCS8");
}
```

这段代码摘自/jdk8u-dev/jdk/test/java/util/concurrent/atomic/VMSupportsCS8.java

>JDK 源码真是个好东西。

### LazySet

lazySet 的底层调用的是 `unsafe.putOrderedLong` 方法，它的底层源码是

<img src="https://s1.ax1x.com/2020/09/29/0eo4L6.png" alt="AtomicBoolean015" border="0">

可以看到，也出现了 SUPPORTS_NATIVE_CX8 这个判断，如果硬件支持的话，那么就会长期使用 CAS + Volatile 这种 Lock Free 的方式来保证原子性，下面的 `SET_FIELD_VOLATILE` 同时也证明了这一点，就是使用 volatile 内存语义来保证可见性。

否则就会判断 JVM 是否支持 ，如果 JVM 不值得话，也会使用 `synchronized` 进行锁定。

其他的方法其实大同小异了。



关注公众号 程序员cxuan 回复 cxuan 领取优质资料。

我自己写了六本 PDF ，非常硬核，链接如下

我自己写了六本 PDF ，非常硬核，链接如下

我自己写了六本 PDF ，非常硬核，链接如下

![](https://img2020.cnblogs.com/blog/1515111/202009/1515111-20200928073258556-2142265096.png)

[cxuan 呕心沥血肝了四本 PDF。](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247485329&idx=1&sn=673f306bb229e73e8f671443488b42d4&chksm=e999f283deee7b95a3cce247907b6557bf5f228c85434fc6cbadf42b2ec4c64443742a8bea7a&token=581641926&lang=zh_CN#rd)

[cxuan 又肝了两本 PDF。](https://mp.weixin.qq.com/s?__biz=MzU2NDg0OTgyMA==&mid=2247494165&idx=1&sn=4e0247006bef89701529d765e6ce32a4&chksm=fc4617e6cb319ef0991ff70c8a769b92f59cf92122f27785b848604493653fdcc206d6830a23&token=794467841&lang=zh_CN#rd)










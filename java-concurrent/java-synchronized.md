# 深入理解 synchronized 关键字

* [深入理解 synchronized 关键字](#深入理解-synchronized-关键字)
   * [前言](#前言)
   * [浅析 synchronized](#浅析-synchronized)
   * [synchronized 的使用](#synchronized-的使用)
      * [synchronized 修饰实例方法](#synchronized-修饰实例方法)
      * [synchronized 修饰静态方法](#synchronized-修饰静态方法)
      * [synchronized 修饰代码块](#synchronized-修饰代码块)
   * [synchronized 底层原理](#synchronized-底层原理)
      * [Monitor 对象](#monitor-对象)
      * [对象内存布局](#对象内存布局)
         * [对象头 Header](#对象头-header)
         * [实例数据 Instance Data](#实例数据-instance-data)
         * [对齐 Padding](#对齐-padding)
   * [锁的升级流程](#锁的升级流程)
      * [无锁](#无锁)
      * [偏向锁](#偏向锁)
      * [轻量级锁](#轻量级锁)
      * [重量级锁](#重量级锁)
   * [synchronized 代码块的底层实现](#synchronized-代码块的底层实现)
   * [synchronized 修饰方法的底层原理](#synchronized-修饰方法的底层原理)

## 前言

synchronized 这个关键字的重要性不言而喻，几乎可以说是并发、多线程必须会问到的关键字了。synchronized 会涉及到锁、升级降级操作、锁的撤销、对象头等。所以理解 synchronized 非常重要，本篇文章就带你从 synchronized 的基本用法、再到 synchronized 的深入理解，对象头等，为你揭开 synchronized 的面纱。

## 浅析 synchronized

`synchronized` 是 Java *并发模块*非常重要的关键字，它是 Java 内建的一种同步机制，代表了某种内在锁定的概念，当一个线程对某个`共享资源`加锁后，其他想要获取共享资源的线程必须进行等待，synchronized 也具有互斥和排他的语义。

>什么是互斥？我们想必小时候都玩儿过磁铁，磁铁会有正负极的概念，同性相斥异性相吸，相斥相当于就是一种互斥的概念，也就是两者互不相容。

synchronized 也是一种独占的关键字，但是它这种独占的语义更多的是为了增加线程安全性，通过独占某个资源以达到互斥、排他的目的。

在了解了排他和互斥的语义后，我们先来看一下 synchronized 的用法，先来了解用法，再来了解底层实现。

## synchronized 的使用

关于 synchronized 想必你应该都大致了解过

* synchronized 修饰实例方法，相当于是对类的实例进行加锁，进入同步代码前需要获得当前实例的锁
* synchronized 修饰静态方法，相当于是对类对象进行加锁
* synchronized 修饰代码块，相当于是给对象进行加锁，在进入代码块前需要先获得对象的锁

下面我们针对每个用法进行解释

### synchronized 修饰实例方法

synchronized 修饰实例方法，实例方法是属于类的实例。synchronized 修饰的实例方法相当于是对象锁。下面是一个 synchronized 修饰实例方法的例子。

```java
public synchronized void method()
{
   // ...
}
```

像如上述 synchronized 修饰的方法就是实例方法，下面我们通过一个完整的例子来认识一下 synchronized 修饰实例方法

```java
public class TSynchronized implements Runnable{

    static int i = 0;

    public synchronized void increase(){
        i++;
        System.out.println(Thread.currentThread().getName());
    }


    @Override
    public void run() {
        for(int i = 0;i < 1000;i++) {
            increase();
        }
    }

    public static void main(String[] args) throws InterruptedException {

        TSynchronized tSynchronized = new TSynchronized();
        Thread aThread = new Thread(tSynchronized);
        Thread bThread = new Thread(tSynchronized);
        aThread.start();
        bThread.start();
        aThread.join();
        bThread.join();
        System.out.println("i = " + i);
    }
}
```

上面输出的结果 i = 2000 ，并且每次都会打印当前现成的名字

来解释一下上面代码，代码中的 i 是一个静态变量，静态变量也是全局变量，静态变量存储在方法区中。increase 方法由 synchronized 关键字修饰，但是没有使用 static 关键字修饰，表示 increase 方法是一个实例方法，每次创建一个 TSynchronized 类的同时都会创建一个 increase 方法，increase 方法中只是打印出来了当前访问的线程名称。Synchronized 类实现了 Runnable 接口，重写了 run 方法，run 方法里面就是一个 0 - 1000 的计数器，这个没什么好说的。在 main 方法中，new 出了两个线程，分别是 aThread 和 bThread，Thread.join 表示等待这个线程处理结束。这段代码主要的作用就是判断 synchronized 修饰的方法能够具有独占性。

### synchronized 修饰静态方法

synchronized 修饰静态方法就是 synchronized 和 static 关键字一起使用

```java
public static synchronized void increase(){}
```

当 synchronized 作用于静态方法时，表示的就是当前类的锁，因为静态方法是属于类的，它不属于任何一个实例成员，因此可以通过 class 对象控制并发访问。

>这里需要注意一点，因为 synchronized 修饰的实例方法是属于实例对象，而 synchronized 修饰的静态方法是属于类对象，所以调用 synchronized 的实例方法并不会阻止访问 synchronized 的静态方法。

### synchronized 修饰代码块

synchronized 除了修饰实例方法和静态方法外，synchronized 还可用于修饰代码块，代码块可以嵌套在方法体的内部使用。

```java
public void run() {
  synchronized(obj){
    for(int j = 0;j < 1000;j++){
      i++;
    }
  }
}
```

上面代码中将 obj 作为锁对象对其加锁，每次当线程进入 synchronized 修饰的代码块时就会要求当前线程持有obj 实例对象锁，如果当前有其他线程正持有该对象锁，那么新到的线程就必须等待。

synchronized 修饰的代码块，除了可以锁定对象之外，也可以对当前实例对象锁、class 对象锁进行锁定

```java
// 实例对象锁
synchronized(this){
    for(int j = 0;j < 1000;j++){
        i++;
    }
}

//class对象锁
synchronized(TSynchronized.class){
    for(int j = 0;j < 1000;j++){
        i++;
    }
}
```

## synchronized 底层原理

在简单介绍完 synchronized 之后，我们就来聊一下 synchronized 的底层原理了。

我们或许都有所了解（下文会细致分析），synchronized 的代码块是由一组 monitorenter/monitorexit 指令实现的。而`Monitor` 对象是实现同步的基本单元。

>啥是 `Monitor` 对象呢？

### Monitor 对象

**任何对象都关联了一个管程，管程就是控制对象并发访问的一种机制**。`管程` 是一种同步原语，在 Java 中指的就是 synchronized，可以理解为 synchronized 就是 Java 中对管程的实现。

管程提供了一种排他访问机制，这种机制也就是 `互斥`。互斥保证了在每个时间点上，最多只有一个线程会执行同步方法。

所以你理解了 Monitor 对象其实就是使用管程控制同步访问的一种对象。

### 对象内存布局

在 `hotspot` 虚拟机中，对象在内存中的布局分为三块区域：

* `对象头(Header)` 
* `实例数据(Instance Data)` 
* `对齐填充(Padding)`

这三块区域的内存分布如下图所示

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20201202064002278.png" alt="image-20201202064002278" style="zoom:50%;" />

我们来详细介绍一下上面对象中的内容。

#### 对象头 Header

对象头 Header 主要包含 MarkWord 和对象指针 Klass Pointer，如果是数组的话，还要包含数组的长度。

![img](https://images2015.cnblogs.com/blog/731716/201703/731716-20170302104003563-2094361065.png)

在 32 位的虚拟机中 MarkWord ，Klass Pointer 和数组长度分别占用 32 位，也就是 4 字节。

如果是 64 位虚拟机的话，MarkWord ，Klass Pointer 和数组长度分别占用 64 位，也就是 8 字节。

在 32 位虚拟机和 64 位虚拟机的 Mark Word 所占用的字节大小不一样，32 位虚拟机的 Mark Word 和 Klass Pointer 分别占用 32 bits 的字节，而 64 位虚拟机的 Mark Word 和 Klass Pointer 占用了64 bits 的字节，下面我们以 32 位虚拟机为例，来看一下其 Mark Word 的字节具体是如何分配的。

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217095625952-1041089518.png)

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217093745506-1178225404.png)

用中文翻译过来就是

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217094054439-547769283.png)

- 无状态也就是`无锁`的时候，对象头开辟 25 bit 的空间用来存储对象的 hashcode ，4 bit 用于存放分代年龄，1 bit 用来存放是否偏向锁的标识位，2 bit 用来存放锁标识位为 01。
- `偏向锁` 中划分更细，还是开辟 25 bit 的空间，其中 23 bit 用来存放线程ID，2bit 用来存放 epoch，4bit 存放分代年龄，1 bit 存放是否偏向锁标识， 0 表示无锁，1 表示偏向锁，锁的标识位还是 01。
- `轻量级锁`中直接开辟 30 bit 的空间存放指向栈中锁记录的指针，2bit 存放锁的标志位，其标志位为 00。
- `重量级锁`中和轻量级锁一样，30 bit 的空间用来存放指向重量级锁的指针，2 bit 存放锁的标识位，为 11
- `GC标记`开辟 30 bit 的内存空间却没有占用，2 bit 空间存放锁标志位为 11。

其中无锁和偏向锁的锁标志位都是 01，只是在前面的 1 bit 区分了这是无锁状态还是偏向锁状态。

关于为什么这么分配的内存，我们可以从 `OpenJDK` 中的[markOop.hpp](https://github.com/openjdk-mirror/jdk7u-hotspot/blob/50bdefc3afe944ca74c3093e7448d6b889cd20d1/src/share/vm/oops/markOop.hpp)类中的枚举窥出端倪

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217094103681-1438014130.png)

来解释一下

- age_bits 就是我们说的分代回收的标识，占用4字节
- lock_bits 是锁的标志位，占用2个字节
- biased_lock_bits 是是否偏向锁的标识，占用1个字节。
- max_hash_bits 是针对无锁计算的 hashcode 占用字节数量，如果是 32 位虚拟机，就是 32 - 4 - 2 -1 = 25 byte，如果是 64 位虚拟机，64 - 4 - 2 - 1 = 57 byte，但是会有 25 字节未使用，所以 64 位的 hashcode 占用 31 byte。
- hash_bits 是针对 64 位虚拟机来说，如果最大字节数大于 31，则取 31，否则取真实的字节数
- cms_bits 我觉得应该是不是 64 位虚拟机就占用 0 byte，是 64 位就占用 1byte
- epoch_bits 就是 epoch 所占用的字节大小，2 字节。

在上面的虚拟机对象头分配表中，我们可以看到有几种锁的状态：无锁（无状态），偏向锁，轻量级锁，重量级锁，其中轻量级锁和偏向锁是 JDK1.6 中对 synchronized 锁进行优化后新增加的，其目的就是为了大大优化锁的性能，所以在 JDK 1.6 中，使用 synchronized 的开销也没那么大了。其实从锁有无锁定来讲，还是只有无锁和重量级锁，偏向锁和轻量级锁的出现就是增加了锁的获取性能而已，并没有出现新的锁。

所以我们的重点放在对 synchronized 重量级锁的研究上，当 monitor 被某个线程持有后，它就会处于锁定状态。在 HotSpot 虚拟机中，monitor 的底层代码是由 `ObjectMonitor` 实现的，其主要数据结构如下（位于 HotSpot 虚拟机源码 ObjectMonitor.hpp 文件，C++ 实现的）

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20210530233842535.png" alt="image-20210530233842535" style="zoom:50%;" />

这段 C++ 中需要注意几个属性：_WaitSet 、 _EntryList 和 _Owner，每个等待获取锁的线程都会被封装称为 `ObjectWaiter` 对象。

![image-20210531072722659](/Users/mr.l/Library/Application Support/typora-user-images/image-20210531072722659.png)

_Owner 是指向了 ObjectMonitor 对象的线程，而 _WaitSet 和 _EntryList 就是用来保存每个线程的列表。

>那么这两个列表有什么区别呢？这个问题我和你聊一下锁的获取流程你就清楚了。

**锁的两个列表**

当多个线程同时访问某段同步代码时，首先会进入 _EntryList 集合，当线程获取到对象的 monitor 之后，就会进入 _Owner 区域，并把 ObjectMonitor 对象的 _Owner 指向为当前线程，并使 _count + 1，如果调用了释放锁（比如 wait）的操作，就会释放当前持有的 monitor ，owner = null， _count - 1，同时这个线程会进入到 _WaitSet 列表中等待被唤醒。如果当前线程执行完毕后也会释放 monitor 锁，只不过此时不会进入 _WaitSet 列表了，而是直接复位 _count 的值。

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20210531093349681.png" alt="image-20210531093349681" style="zoom:50%;" />

Klass Pointer 表示的是类型指针，也就是对象指向它的类元数据的指针，虚拟机通过这个指针来确定这个对象是哪个类的实例。

>你可能不是很理解指针是个什么概念，你可以简单理解为指针就是指向某个数据的地址。

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20210530220010468.png" alt="image-20210530220010468" style="zoom:50%;" />

#### 实例数据 Instance Data

实例数据部分是对象真正存储的有效信息，也是代码中定义的各个字段的字节大小，比如一个 byte 占 1 个字节，一个 int 占用 4 个字节。

#### 对齐 Padding

对齐不是必须存在的，它只起到了**占位符(%d, %c 等)**的作用。这就是 JVM 的要求了，因为 HotSpot JVM 要求对象的起始地址必须是 8 字节的整数倍，也就是说对象的字节大小是 8 的整数倍，不够的需要使用 Padding 补全。

## 锁的升级流程

先来个大体的流程图来感受一下这个过程，然后下面我们再分开来说

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217094114986-199561605.png)

### 无锁

`无锁状态`，无锁即没有对资源进行锁定，所有的线程都可以对同一个资源进行访问，但是只有一个线程能够成功修改资源。

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217094129207-1061504574.png)

无锁的特点就是在循环内进行修改操作，线程会不断的尝试修改共享资源，直到能够成功修改资源并退出，在此过程中没有出现冲突的发生，这很像我们在之前文章中介绍的 CAS 实现，CAS 的原理和应用就是无锁的实现。无锁无法全面代替有锁，但无锁在某些场合下的性能是非常高的。

### 偏向锁

HotSpot 的作者经过研究发现，大多数情况下，锁不仅不存在多线程竞争，还存在锁由同一线程多次获得的情况，偏向锁就是在这种情况下出现的，它的出现是为了解决只有在一个线程执行同步时提高性能。

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217094139119-1367075853.png)

可以从对象头的分配中看到，偏向锁要比无锁多了`线程ID` 和 `epoch`，下面我们就来描述一下偏向锁的获取过程

**偏向锁获取过程**

1. 首先线程访问同步代码块，会通过检查对象头 Mark Word 的`锁标志位`判断目前锁的状态，如果是 01，说明就是无锁或者偏向锁，然后再根据`是否偏向锁` 的标示判断是无锁还是偏向锁，如果是无锁情况下，执行下一步
2. 线程使用 CAS 操作来尝试对对象加锁，如果使用 CAS 替换 ThreadID 成功，就说明是第一次上锁，那么当前线程就会获得对象的偏向锁，此时会在对象头的 Mark Word 中记录当前线程 ID 和获取锁的时间 epoch 等信息，然后执行同步代码块。

> 全局安全点（Safe Point）：全局安全点的理解会涉及到 C 语言底层的一些知识，这里简单理解 SafePoint 是 Java 代码中的一个线程可能暂停执行的位置。

等到下一次线程在进入和退出同步代码块时就不需要进行 `CAS` 操作进行加锁和解锁，只需要简单判断一下对象头的 Mark Word 中是否存储着指向当前线程的线程ID，判断的标志当然是根据锁的标志位来判断的。如果用流程图来表示的话就是下面这样

<img src="https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217094149544-1353641005.png" alt="img" style="zoom:50%;" />

**关闭偏向锁**

偏向锁在Java 6 和Java 7 里是默认`启用`的。由于偏向锁是为了在只有一个线程执行同步块时提高性能，如果你确定应用程序里所有的锁通常情况下处于竞争状态，可以通过JVM参数关闭偏向锁：`-XX:-UseBiasedLocking=false`，那么程序默认会进入轻量级锁状态。

**关于 epoch**

偏向锁的对象头中有一个被称为 `epoch` 的值，它作为偏差有效性的时间戳。

### 轻量级锁

`轻量级锁`是指当前锁是偏向锁的时候，资源被另外的线程所访问，那么偏向锁就会升级为`轻量级锁`，其他线程会通过`自旋`的形式尝试获取锁，不会阻塞，从而提高性能，下面是详细的获取过程。

**轻量级锁加锁过程**

1. 紧接着上一步，如果 CAS 操作替换 ThreadID 没有获取成功，执行下一步
2. 如果使用 CAS 操作替换 ThreadID 失败（这时候就切换到另外一个线程的角度）说明该资源已被同步访问过，这时候就会执行锁的撤销操作，撤销偏向锁，然后等原持有偏向锁的线程到达`全局安全点（SafePoint）`时，会暂停原持有偏向锁的线程，然后会检查原持有偏向锁的状态，如果已经退出同步，就会唤醒持有偏向锁的线程，执行下一步
3. 检查对象头中的 Mark Word 记录的是否是当前线程 ID，如果是，执行同步代码，如果不是，执行**偏向锁获取流程** 的第2步。

如果用流程表示的话就是下面这样（已经包含偏向锁的获取）

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217094201792-224889097.png)

### 重量级锁

重量级锁其实就是 synchronized 最终加锁的过程，在 JDK 1.6 之前，就是由无锁 -> 加锁的这个过程。

**重量级锁的获取流程**

1. 接着上面偏向锁的获取过程，由偏向锁升级为轻量级锁，执行下一步
2. 会在原持有偏向锁的线程的栈中分配锁记录，将对象头中的 Mark Word 拷贝到原持有偏向锁线程的记录中，然后原持有偏向锁的线程获得轻量级锁，然后唤醒原持有偏向锁的线程，从安全点处继续执行，执行完毕后，执行下一步，当前线程执行第 4 步
3. 执行完毕后，开始轻量级解锁操作，解锁需要判断两个条件
   - 判断对象头中的 Mark Word 中锁记录指针是否指向当前栈中记录的指针

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217094213552-1892227095.png)

- 拷贝在当前线程锁记录的 Mark Word 信息是否与对象头中的 Mark Word 一致。

如果上面两个判断条件都符合的话，就进行锁释放，如果其中一个条件不符合，就会释放锁，并唤起等待的线程，进行新一轮的锁竞争。

1. 在当前线程的栈中分配锁记录，拷贝对象头中的 MarkWord 到当前线程的锁记录中，执行 CAS 加锁操作，会把对象头 Mark Word 中锁记录指针指向当前线程锁记录，如果成功，获取轻量级锁，执行同步代码，然后执行第3步，如果不成功，执行下一步
2. 当前线程没有使用 CAS 成功获取锁，就会自旋一会儿，再次尝试获取，如果在多次自旋到达上限后还没有获取到锁，那么轻量级锁就会升级为 `重量级锁`

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217094222606-1965728488.png)

如果用流程图表示是这样的

![img](https://img2018.cnblogs.com/blog/1515111/201912/1515111-20191217094231088-773203313.png)

根据上面对于锁升级细致的描述，我们可以总结一下不同锁的适用范围和场景。

| 锁类型   | 适用场景                         | 缺点                                               | 优点                 |
| -------- | -------------------------------- | -------------------------------------------------- | -------------------- |
| 偏向锁   | 适用于只有一个线程访问的同步场景 | 如果存在多个线程竞争使用锁，会带来额外的锁撤销消耗 | 加锁和解消耗小       |
| 轻量级锁 | 适用于追求响应时间的应用场景     | 如果始终得不到资源，会自旋消耗 CPU                 | 提高程序响应速度     |
| 重量级锁 | 适用于追求吞吐量的应用场景       | 得不到锁的线程会阻塞，性能比较差                   | 阻塞，不需要消耗 CPU |

## synchronized 代码块的底层实现

为了便于方便研究，我们把 synchronized 修饰代码块的示例简单化，如下代码所示

```java
public class SynchronizedTest {

    private int i;

    public void syncTask(){
        synchronized (this){
            i++;
        }
    }

}
```

我们主要关注一下 synchronized 的字节码，如下所示

![image-20210531200555874](/Users/mr.l/Library/Application Support/typora-user-images/image-20210531200555874.png)

从这段字节码中我们可以知道，同步语句块使用的是 monitorenter 和 monitorexit 指令，其中 monitorenter 指令指向同步代码块的开始位置，monitorexit 指令指向同步代码块的结束位置。

>那么为什么会有两个 monitorexit 呢？

不知道你注意到下面的异常表了吗？如果你不知道什么是异常表，那么我建议你读一下这篇文章

[看完这篇Exception 和 Error，和面试官扯皮就没问题了](https://mp.weixin.qq.com/s?__biz=MzkwMDE1MzkwNQ==&mid=2247495984&idx=1&sn=97c90237ae80d1a244bd34edf2628986&chksm=c04ae66ef73d6f78738ed1908e4e40bf3f179e1ec41b556aab7cfee3145b01f1316cd84e25c0&token=1037470091&lang=zh_CN#rd)

## synchronized 修饰方法的底层原理

方法的同步是隐式的，也就是说 synchronized 修饰方法的底层无需使用字节码来控制，真的是这样吗？我们来反编译一波看看结果

```java
public class SynchronizedTest {

    private int i;

    public synchronized void syncTask(){
        i++;
    }
}
```

这次我们使用 **javap -verbose** 来输出详细的结果

![image-20210531215902053](/Users/mr.l/Library/Application Support/typora-user-images/image-20210531215902053.png)

从字节码上可以看出，synchronized 修饰的方法并没有使用 monitorenter 和 monitorexit 指令，取得代之是ACC_SYNCHRONIZED 标识，该标识指明了此方法是一个同步方法，JVM 通过该 ACC_SYNCHRONIZED 访问标志来辨别一个方法是否声明为同步方法，从而执行相应的同步调用。这就是 synchronized 锁在同步代码块上和同步方法上的实现差别。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)










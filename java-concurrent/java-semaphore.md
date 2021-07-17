# Semaphore 用法和源码解析

* [Semaphore 用法和源码解析](#semaphore-用法和源码解析)
* [认识 Semaphore](#认识-semaphore)
   * [Semaphore 是什么](#semaphore-是什么)
   * [Semaphore 的使用场景](#semaphore-的使用场景)
   * [Semaphore 使用](#semaphore-使用)
   * [Semaphore 信号量的模型](#semaphore-信号量的模型)
* [Semaphore 深入理解](#semaphore-深入理解)
   * [Semaphore 基本属性](#semaphore-基本属性)
   * [Semaphore 的公平性和非公平性](#semaphore-的公平性和非公平性)
   * [其他 Semaphore 方法](#其他-semaphore-方法)

这是并发线程工具类的第二篇文章，在第一篇中，我们分析过 `CountDownLatch` 的相关内容，你可以参考

[一文搞懂 CountDownLatch 用法和源码！](https://mp.weixin.qq.com/s?__biz=MzkwMDE1MzkwNQ==&mid=2247495733&idx=1&sn=45e5d5d043ee713a8689e656628271d2&chksm=c04ae76bf73d6e7d45e8f288b1560853bb57d5c797db664e742e5d95f4063d0f5d217f461176&token=2034028508&lang=zh_CN#rd)

那么本篇文章我们继续来和你聊聊并发工具类的第二篇文章 --- Semaphore 。

# 认识 Semaphore

## Semaphore 是什么

Semaphore 一般译作 `信号量`，它也是一种线程同步工具，主要用于多个线程对共享资源进行并行操作的一种工具类。它代表了一种`许可`的概念，是否允许多线程对同一资源进行操作的许可，使用 Semaphore 可以控制并发访问资源的线程个数。

## Semaphore 的使用场景

Semaphore 的使用场景主要用于`流量控制`，比如数据库连接，同时使用的数据库连接会有数量限制，数据库连接不能超过一定的数量，当连接到达了限制数量后，后面的线程只能排队等前面的线程释放数据库连接后才能获得数据库连接。

再比如交通公路上的红绿灯，绿灯亮起时只能让 100 辆车通过，红灯亮起不允许车辆通过。

再比如停车场的场景中，一个停车场有有限数量的车位，同时能够容纳多少台车，车位满了之后只有等里面的车离开停车场外面的车才可以进入。

## Semaphore 使用

下面我们就来模拟一下停车场的业务场景：在进入停车场之前会有一个提示牌，上面显示着停车位还有多少，当车位为 0 时，不能进入停车场，当车位不为 0 时，才会允许车辆进入停车场。所以停车场有几个关键因素：停车场车位的总容量，当一辆车进入时，停车场车位的总容量 - 1，当一辆车离开时，总容量 + 1，停车场车位不足时，车辆只能在停车场外等待。

```java
public class CarParking {

    private static Semaphore semaphore = new Semaphore(10);

    public static void main(String[] args){

        for(int i = 0;i< 100;i++){

            Thread thread = new Thread(new Runnable() {
                @Override
                public void run() {
                    System.out.println("欢迎 " + Thread.currentThread().getName() + " 来到停车场");
                    // 判断是否允许停车
                    if(semaphore.availablePermits() == 0) {
                        System.out.println("车位不足，请耐心等待");
                    }
                    try {
                        // 尝试获取
                        semaphore.acquire();
                        System.out.println(Thread.currentThread().getName() + " 进入停车场");
                        Thread.sleep(new Random().nextInt(10000));// 模拟车辆在停车场停留的时间
                        System.out.println(Thread.currentThread().getName() + " 驶出停车场");
                        semaphore.release();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }, i + "号车");

            thread.start();
        }

    }

}
```

在上面这段代码中，我们给出了 Semaphore 的初始容量，也就是只有 10 个车位，我们用这 10 个车位来控制 100 辆车的流量，所以结果和我们预想的很相似，即大部分车都在等待状态。但是同时仍允许一些车驶入停车场，驶入停车场的车辆，就会 semaphore.acquire 占用一个车位，驶出停车场时，就会 semaphore.release 让出一个车位，让后面的车再次驶入。

## Semaphore 信号量的模型

上面代码虽然比较简单，但是却能让我们了解到一个信号量模型的`五脏六腑`。下面是一个信号量的模型：

![](https://z3.ax1x.com/2021/05/20/gTqn8U.png)

来解释一下 Semaphore ，Semaphore 有一个初始容量，这个初始容量就是 Semaphore 所能够允许的信号量。在调用 Semaphore 中的 acquire 方法后，Semaphore 的容量 -1，相对的在调用 release 方法后，Semaphore 的容量 + 1，在这个过程中，计数器一直在监控 Semaphore 数量的变化，等到流量超过 Semaphore 的容量后，多余的流量就会放入等待队列中进行排队等待。等到 Semaphore 的容量允许后，方可重新进入。

>Semaphore 所控制的流量其实就是一个个的线程，因为并发工具最主要的研究对象就是线程。

它的工作流程如下

![](https://z3.ax1x.com/2021/05/20/gTqmCT.png)

这幅图应该很好理解吧，这里就不再过多解释啦。

# Semaphore 深入理解

在了解 Semaphore 的基本使用和 Semaphore 的模型后，下面我们还是得从源码来和你聊一聊 Semaphore 的种种细节问题，因为我写文章最核心的东西就是想让我的读者 **了解 xxx，看这一篇就够了**，这是我写文章的追求，好了话不多说，源码走起来！

## Semaphore 基本属性

Semaphore  中只有一个属性

```java
private final Sync sync;
```

Sync 是 Semaphore 的同步实现，Semaphore 保证线程安全性的方式和 ReentrantLock 、CountDownLatch 类似，都是继承于 AQS 的实现。同样的，这个 Sync 也是继承于 `AbstractQueuedSynchronizer` 的一个变量，也就是说，聊 Semaphore 也绕不开 AQS，所以说 AQS 真的太重要了。

## Semaphore 的公平性和非公平性

那么我们进入 Sync 内部看看它实现了哪些方法

```java
abstract static class Sync extends AbstractQueuedSynchronizer {
  private static final long serialVersionUID = 1192457210091910933L;

  Sync(int permits) {
    setState(permits);
  }

  final int getPermits() {
    return getState();
  }

  final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
      int available = getState();
      int remaining = available - acquires;
      if (remaining < 0 ||
          compareAndSetState(available, remaining))
        return remaining;
    }
  }

  protected final boolean tryReleaseShared(int releases) {
    for (;;) {
      int current = getState();
      int next = current + releases;
      if (next < current) // overflow
        throw new Error("Maximum permit count exceeded");
      if (compareAndSetState(current, next))
        return true;
    }
  }

  final void reducePermits(int reductions) {
    for (;;) {
      int current = getState();
      int next = current - reductions;
      if (next > current) // underflow
        throw new Error("Permit count underflow");
      if (compareAndSetState(current, next))
        return;
    }
  }

  final int drainPermits() {
    for (;;) {
      int current = getState();
      if (current == 0 || compareAndSetState(current, 0))
        return current;
    }
  }
}
```

首先是 Sync 的初始化，内部调用了 `setState` 并传递了 permits ，我们知道，AQS 中的 State 其实就是同步状态的值，而 Semaphore 的这个 permits 就是代表了许可的数量。

getPermits 其实就是调用了 getState 方法获取了一下线程同步状态值。后面的 nonfairTryAcquireShared 方法其实是在 Semaphore 中构造了 NonfairSync 中的 tryAcquireShared 调用的

![](https://z3.ax1x.com/2021/05/20/gTqZ5V.png)

这里需要提及一下什么是 `NonfairSync`，除了 NonfairSync 是不是还有 FairSync 呢？查阅 JDK 源码发现确实有。

>那么这里的 FairSync 和 NonfairSync 都代表了什么？为什么会有这两个类呢？

事实上，Semaphore 就像 ReentrantLock 一样，也存在“公平”和"不公平"两种，默认情况下 Semaphore 是一种不公平的信号量

![](https://z3.ax1x.com/2021/05/20/gTqFDs.png)

Semaphore 的不公平意味着它不会保证线程获得许可的顺序，Semaphore 会在线程等待之前为调用 acquire 的线程分配一个许可，拥有这个许可的线程会自动将自己置于线程等待队列的头部。

当这个参数为 true 时，Semaphore 确保任何调用 acquire 的方法，都会按照先入先出的顺序来获取许可。

```java
final int nonfairTryAcquireShared(int acquires) {
  for (;;) {
    // 获取同步状态值
    int available = getState();
    // state 的值 - 当前线程需要获取的信号量（通常默认是 -1），只有
    // remaining > 0 才表示可以获取。
    int remaining = available - acquires;
    // 先判断是否小于 0 ，如果小于 0 则表示无法获取，如果是正数
    // 就需要使用 CAS 判断内存值和同步状态值是否一致，然后更新为同步状态值 - 1
    if (remaining < 0 ||
        compareAndSetState(available, remaining))
      return remaining;
  }
}
```

![](https://z3.ax1x.com/2021/05/20/gTqkbn.png)

从上面这幅源码对比图可以看到，NonfairSync 和 FairSync 最大的区别就在于 `tryAcquireShared` 方法的区别。

NonfairSync 版本中，是不会管当前等待队列中是否有排队许可的，它会直接判断信号许可量和 CAS 方法的可行性。

FairSync 版本中，它首先会判断是否有许可进行排队，如果有的话就直接获取失败。

>这时候可能就会有读者问了，你上面说公平性和非公平性的区别一直针对的是 acquire 方法来说的，怎么现在他们两个主要的区别在于 `tryAcquireShared` 方法呢？

别急，让我们进入到 `acquire` 方法一探究竟

![](https://z3.ax1x.com/2021/05/20/gTqVU0.png)

可以看到，在 acquire 方法中，会调用 tryAcquireShared 方法，根据其返回值判断是否调用 `doAcquireSharedInterruptibly` 方法，更多关于 doAcquireSharedInterruptibly 的使用分析，请参考读者的这篇文章

[一文搞懂 CountDownLatch 用法和源码！](https://mp.weixin.qq.com/s?__biz=MzkwMDE1MzkwNQ==&mid=2247495733&idx=1&sn=45e5d5d043ee713a8689e656628271d2&chksm=c04ae76bf73d6e7d45e8f288b1560853bb57d5c797db664e742e5d95f4063d0f5d217f461176&token=480403368&lang=zh_CN#rd)

>这里需要注意下，acquire 方法具有阻塞性，而 tryAcquire 方法不具有阻塞性。
>
>这也就是说，调用 acquire 方法如果获取不到许可，那么 Semaphore 会阻塞，直到有可用的许可。而 tryAcquire 方法如果获取不到许可会直接返回 false。

这里还需要注意下 `acquireUninterruptibly` 方法，其他 acquire 的相关方法要么是非阻塞，要么是阻塞可中断，而 acquireUninterruptibly 方法不仅在没有许可的情况下执着的等待，而且也不会中断，使用这个方法时需要注意，这个方法很容易在出现大规模线程阻塞而导致 Java 进程出现假死的情况。

有获取许可相对应的就有释放许可，但是释放许可不会区分到底是公平释放还是非公平释放。不管方式如何都是释放一个许可给 Semaphore ，同样的 Semaphore 中的许可数量会增加。

![](https://z3.ax1x.com/2021/05/20/gTqEEq.png)

在上图中调用 tryReleaseShared 判断是否能进行释放后，再会调用 AQS 中的 `releasedShared` 方法进行释放。

![](https://z3.ax1x.com/2021/05/20/gTqiuj.png)

上面这个释放流程只是释放一个许可，除此之外，还可以释放多个许可

```java
public void release(int permits) {
  if (permits < 0) throw new IllegalArgumentException();
  sync.releaseShared(permits);
}
```

后面这个 releaseShared 的释放流程和上面的释放流程一致。

## 其他 Semaphore 方法

除了上面基本的 acquire 和 release 相关方法外，我们也要了解一下 Semaphore 的其他方法。Semaphore 的其他方法比较少，只有下面这几个

**drainPermits** ： 获取并退还所有立即可用的许可，其实相当于使用 CAS 方法把内存值置为 0 

**reducePermits**：和 `nonfairTryAcquireShared` 方法类似，只不过 nonfairTryAcquireShared 是使用 CAS 使内存值 + 1，而 reducePermits 是使内存值 - 1 。

**isFair**：对 Semaphore 许可的争夺是采用公平还是非公平的方式，对应到内部的实现就是 FairSync 和 NonfairSync。

**hasQueuedThreads**：当前是否有线程由于要获取 Semaphore 许可而进入阻塞。

**getQueuedThreads**：返回一个包含了等待获取许可的线程集合。

**getQueueLength**：获取正在排队而进入阻塞状态的线程个数

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)








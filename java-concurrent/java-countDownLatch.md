# CountDownLatch 用法和源码解析

`CountDownLatch` 是多线程控制的一种工具，它被称为 `门阀`、 `计数器`或者 `闭锁`。这个工具经常用来用来协调多个线程之间的同步，或者说起到线程之间的通信（而不是用作互斥的作用）。下面我们就来一起认识一下 CountDownLatch

## 认识 CountDownLatch

CountDownLatch 能够使一个线程在等待另外一些线程完成各自工作之后，再继续执行。它相当于是一个计数器，这个计数器的初始值就是线程的数量，每当一个任务完成后，计数器的值就会减一，当计数器的值为 0 时，表示所有的线程都已经任务了，然后在 CountDownLatch 上等待的线程就可以恢复执行接下来的任务。

## CountDownLatch 的使用

CountDownLatch 提供了一个构造方法，你必须指定其初始值，还指定了 `countDown` 方法，这个方法的作用主要用来减小计数器的值，当计数器变为 0 时，在 CountDownLatch 上 `await` 的线程就会被唤醒，继续执行其他任务。当然也可以延迟唤醒，给 CountDownLatch 加一个延迟时间就可以实现。

![](https://s3.ax1x.com/2020/12/21/rdcSKK.png)



其主要方法如下

![](https://s3.ax1x.com/2020/12/21/rd6xv6.png)

CountDownLatch 主要有下面这几个应用场景

### CountDownLatch 应用场景

典型的应用场景就是当一个服务启动时，同时会加载很多组件和服务，这时候主线程会等待组件和服务的加载。当所有的组件和服务都加载完毕后，主线程和其他线程在一起完成某个任务。

CountDownLatch 还可以实现学生一起比赛跑步的程序，CountDownLatch 初始化为学生数量的线程，鸣枪后，每个学生就是一条线程，来完成各自的任务，当第一个学生跑完全程后，CountDownLatch 就会减一，直到所有的学生完成后，CountDownLatch 会变为 0 ，接下来再一起宣布跑步成绩。

顺着这个场景，你自己就可以延伸、拓展出来很多其他任务场景。

### CountDownLatch 用法

下面我们通过一个简单的计数器来演示一下 CountDownLatch 的用法

```java
public class TCountDownLatch {

    public static void main(String[] args) {
        CountDownLatch latch = new CountDownLatch(5);
        Increment increment = new Increment(latch);
        Decrement decrement = new Decrement(latch);

        new Thread(increment).start();
        new Thread(decrement).start();

        try {
            Thread.sleep(6000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

class Decrement implements Runnable {

    CountDownLatch countDownLatch;

    public Decrement(CountDownLatch countDownLatch){
        this.countDownLatch = countDownLatch;
    }

    @Override
    public void run() {
        try {

            for(long i = countDownLatch.getCount();i > 0;i--){
                Thread.sleep(1000);
                System.out.println("countdown");
                this.countDownLatch.countDown();
            }

        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}


class Increment implements Runnable {

    CountDownLatch countDownLatch;

    public Increment(CountDownLatch countDownLatch){
        this.countDownLatch = countDownLatch;
    }

    @Override
    public void run() {
        try {
            System.out.println("await");
            countDownLatch.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("Waiter Released");
    }
}
```

在 main 方法中我们初始化了一个计数器为 5 的 CountDownLatch，在 Decrement 方法中我们使用 `countDown` 执行减一操作，然后睡眠一段时间，同时在 Increment 类中进行等待，直到 Decrement 中的线程完成计数减一的操作后，唤醒 Increment 类中的 run 方法，使其继续执行。

下面我们再来通过学生赛跑这个例子来演示一下 CountDownLatch 的具体用法

```java
public class StudentRunRace {

    CountDownLatch stopLatch = new CountDownLatch(1);
    CountDownLatch runLatch = new CountDownLatch(10);

    public void waitSignal() throws Exception{
        System.out.println("选手" + Thread.currentThread().getName() + "正在等待裁判发布口令");
        stopLatch.await();
        System.out.println("选手" + Thread.currentThread().getName() + "已接受裁判口令");
        Thread.sleep((long) (Math.random() * 10000));
        System.out.println("选手" + Thread.currentThread().getName() + "到达终点");
        runLatch.countDown();
    }

    public void waitStop() throws Exception{
        Thread.sleep((long) (Math.random() * 10000));
        System.out.println("裁判"+Thread.currentThread().getName()+"即将发布口令");
        stopLatch.countDown();
        System.out.println("裁判"+Thread.currentThread().getName()+"已发送口令，正在等待所有选手到达终点");
        runLatch.await();
        System.out.println("所有选手都到达终点");
        System.out.println("裁判"+Thread.currentThread().getName()+"汇总成绩排名");
    }

    public static void main(String[] args) {
        ExecutorService service = Executors.newCachedThreadPool();
        StudentRunRace studentRunRace = new StudentRunRace();
        for (int i = 0; i < 10; i++) {
            Runnable runnable = () -> {
                try {
                    studentRunRace.waitSignal();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            };
            service.execute(runnable);
        }
        try {
            studentRunRace.waitStop();
        } catch (Exception e) {
            e.printStackTrace();
        }
        service.shutdown();
    }
}
```

下面我们就来一起分析一下 `CountDownLatch ` 的源码

## CountDownLatch 源码分析

CountDownLatch 使用起来比较简单，但是却非常有用，现在你可以在你的工具箱中加上 CountDownLatch 这个工具类了。下面我们就来深入认识一下 CountDownLatch。

CountDownLatch 的底层是由 `AbstractQueuedSynchronizer` 支持，而 AQS 的数据结构的核心就是两个队列，一个是 `同步队列(sync queue)`，一个是`条件队列(condition queue)`。

### Sync 内部类

CountDownLatch 在其内部是一个 Sync ，它继承了 AQS 抽象类。

```java
private static final class Sync extends AbstractQueuedSynchronizer {...}
```

CountDownLatch 其实其内部只有一个 `sync` 属性，并且是 final 的

```java
private final Sync sync;
```

CountDownLatch 只有一个带参数的构造方法

```java
public CountDownLatch(int count) {
  if (count < 0) throw new IllegalArgumentException("count < 0");
  this.sync = new Sync(count);
}
```

也就是说，初始化的时候必须指定计数器的数量，如果数量为负会直接抛出异常。

然后把 count 初始化为 Sync 内部的 count，也就是

```java
Sync(int count) {
  setState(count);
}
```

>注意这里有一个 setState(count)，这是什么意思呢？见闻知意这只是一个设置状态的操作，但是实际上不单单是，还有一层意思是 state 的值代表着待达到条件的线程数。这个我们在聊 countDown 方法的时候再讨论。

`getCount()` 方法的返回值是 `getState()` 方法，它是 AbstractQueuedSynchronizer 中的方法，这个方法会返回当前线程计数，具有 volatile 读取的内存语义。

```java
// ---- CountDownLatch ----

int getCount() {
  return getState();
}

// ---- AbstractQueuedSynchronizer ----

protected final int getState() {
  return state;
}
```

`tryAcquireShared()` 方法用于获取·共享状态下对象的状态，判断对象是否为 0 ，如果为 0 返回 1 ，表示能够尝试获取，如果不为 0，那么返回 -1，表示无法获取。

```java
protected int tryAcquireShared(int acquires) {
  return (getState() == 0) ? 1 : -1;
}

// ----  getState() 方法和上面的方法相同 ----
```

这个 `共享状态` 属于 AQS 中的概念，在 AQS 中分为两种模式，一种是 `独占模式`，一种是 `共享模式`。

* tryAcquire 独占模式，尝试获取资源，成功则返回 true，失败则返回 false。
* tryAcquireShared 共享方式，尝试获取资源。负数表示失败；0 表示成功，但没有剩余可用资源；正数表示成功，且有剩余资源。

`tryReleaseShared()` 方法用于共享模式下的释放

```java
protected boolean tryReleaseShared(int releases) {
  // 减小数量，变为 0 的时候进行通知。
  for (;;) {
    int c = getState();
    if (c == 0)
      return false;
    int nextc = c-1;
    if (compareAndSetState(c, nextc))
      return nextc == 0;
  }
}
```

这个方法是一个无限循环，获取线程状态，如果线程状态是 0 则表示没有被线程占有，没有占有的话那么直接返回 false ，表示已经释放；然后下一个状态进行 - 1 ，使用 compareAndSetState CAS 方法进行和内存值的比较，如果内存值也是 1 的话，就会更新内存值为 0 ，判断 nextc 是否为 0 ，如果 CAS 比较不成功的话，会再次进行循环判断。

> 如果 CAS 用法不清楚的话，读者朋友们可以参考这篇文章 [告诉你一个 AtomicInteger 的惊天大秘密！](https://mp.weixin.qq.com/s/vbXAgNH9PyL16PmjgnGKZA)

### await 方法

`await()` 方法是 CountDownLatch 一个非常重要的方法，基本上可以说只有 countDown 和 await 方法才是 CountDownLatch 的精髓所在，这个方法将会使当前线程在 CountDownLatch 计数减至零之前一直等待，除非线程被中断。

CountDownLatch 中的 await 方法有两种，一种是不带任何参数的 `await()`，一种是可以等待一段时间的`await(long timeout, TimeUnit unit)`。下面我们先来看一下  await() 方法。

```java
public void await() throws InterruptedException {
  sync.acquireSharedInterruptibly(1);
}
```

await 方法内部会调用 acquireSharedInterruptibly 方法，这个 acquireSharedInterruptibly 是 AQS 中的方法，以共享模式进行中断。

```java
public final void acquireSharedInterruptibly(int arg)
  throws InterruptedException {
  if (Thread.interrupted())
    throw new InterruptedException();
  if (tryAcquireShared(arg) < 0)
    doAcquireSharedInterruptibly(arg);
}
```

可以看到，acquireSharedInterruptibly 方法的内部会首先判断线程是否`中断`，如果线程中断，则直接抛出线程中断异常。如果没有中断，那么会以共享的方式获取。如果能够在共享的方式下不能获取锁，那么就会以共享的方式断开链接。

```java
private void doAcquireSharedInterruptibly(int arg)
  throws InterruptedException {
  final Node node = addWaiter(Node.SHARED);
  boolean failed = true;
  try {
    for (;;) {
      final Node p = node.predecessor();
      if (p == head) {
        int r = tryAcquireShared(arg);
        if (r >= 0) {
          setHeadAndPropagate(node, r);
          p.next = null; // help GC
          failed = false;
          return;
        }
      }
      if (shouldParkAfterFailedAcquire(p, node) &&
          parkAndCheckInterrupt())
        throw new InterruptedException();
    }
  } finally {
    if (failed)
      cancelAcquire(node);
  }
}
```

这个方法有些长，我们分开来看

* 首先，会先构造一个共享模式的 Node 入队
* 然后使用无限循环判断新构造 node 的前驱节点，如果 node 节点的前驱节点是头节点，那么就会判断线程的状态，这里调用了一个 setHeadAndPropagate ,其源码如下

```java
private void setHeadAndPropagate(Node node, int propagate) {
  Node h = head; 
  setHead(node);
  if (propagate > 0 || h == null || h.waitStatus < 0 ||
      (h = head) == null || h.waitStatus < 0) {
    Node s = node.next;
    if (s == null || s.isShared())
      doReleaseShared();
  }
}
```

首先会设置头节点，然后进行一系列的判断，获取节点的获取节点的后继，以共享模式进行释放，就会调用 doReleaseShared 方法，我们再来看一下 doReleaseShared 方法

```java
private void doReleaseShared() {

  for (;;) {
    Node h = head;
    if (h != null && h != tail) {
      int ws = h.waitStatus;
      if (ws == Node.SIGNAL) {
        if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
          continue;            // loop to recheck cases
        unparkSuccessor(h);
      }
      else if (ws == 0 &&
               !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
        continue;                // loop on failed CAS
    }
    if (h == head)                   // loop if head changed
      break;
  }
}
```

这个方法会以无限循环的方式首先判断头节点是否等于尾节点，如果头节点等于尾节点的话，就会直接退出。如果头节点不等于尾节点，会判断状态是否为 SIGNAL，不是的话就继续循环 compareAndSetWaitStatus，然后断开后继节点。如果状态不是  SIGNAL，也会调用 compareAndSetWaitStatus 设置状态为 PROPAGATE，状态为 0 并且不成功，就会继续循环。

也就是说 setHeadAndPropagate 就是设置头节点并且释放后继节点的一系列过程。

* 我们来看下面的 if 判断，也就是 `shouldParkAfterFailedAcquire(p, node) ` 这里

```java
if (shouldParkAfterFailedAcquire(p, node) &&
    parkAndCheckInterrupt())
  throw new InterruptedException();
```

如果上面 Node p = node.predecessor() 获取前驱节点不是头节点，就会进行 park 断开操作，判断此时是否能够断开，判断的标准如下

```java
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
  int ws = pred.waitStatus;
  if (ws == Node.SIGNAL)
    return true;
  if (ws > 0) {
    do {
      node.prev = pred = pred.prev;
    } while (pred.waitStatus > 0);
    pred.next = node;
  } else {
    compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
  }
  return false;
}
```

这个方法会判断 Node p 的前驱节点的`结点状态(waitStatus)`，节点状态一共有五种，分别是

1. `CANCELLED(1)`：表示当前结点已取消调度。当超时或被中断（响应中断的情况下），会触发变更为此状态，进入该状态后的结点将不会再变化。

2. `SIGNAL(-1)`：表示后继结点在等待当前结点唤醒。后继结点入队时，会将前继结点的状态更新为 SIGNAL。

3. `CONDITION(-2)`：表示结点等待在 Condition 上，当其他线程调用了 Condition 的 signal() 方法后，CONDITION状态的结点将**从等待队列转移到同步队列中**，等待获取同步锁。

4. `PROPAGATE(-3)`：共享模式下，前继结点不仅会唤醒其后继结点，同时也可能会唤醒后继的后继结点。

5. `0`：新结点入队时的默认状态。

如果前驱节点是 SIGNAL 就会返回 true 表示可以断开，如果前驱节点的状态大于 0 (此时为什么不用 ws == Node.CANCELLED ) 呢？因为 ws 大于 0 的条件只有 CANCELLED 状态了。然后就是一系列的查找遍历操作直到前驱节点的 waitStatus > 0。如果 ws <= 0 ，而且还不是 SIGNAL 状态的话，就会使用 CAS 替换前驱节点的 ws 为 SIGNAL 状态。

如果检查判断是中断状态的话，就会返回 false。

```java
private final boolean parkAndCheckInterrupt() {
  LockSupport.park(this);
  return Thread.interrupted();
}
```

这个方法使用 `LockSupport.park` 断开连接，然后返回线程是否中断的标志。

* `cancelAcquire()` 用于取消等待队列，如果等待过程中没有成功获取资源（如timeout，或者可中断的情况下被中断了），那么取消结点在队列中的等待。

```java
private void cancelAcquire(Node node) {
  if (node == null)
    return;

  node.thread = null;
  
  Node pred = node.prev;
  while (pred.waitStatus > 0)
    node.prev = pred = pred.prev;

  Node predNext = pred.next;

  node.waitStatus = Node.CANCELLED;

  if (node == tail && compareAndSetTail(node, pred)) {
    compareAndSetNext(pred, predNext, null);
  } else {
    int ws;
    if (pred != head &&
        ((ws = pred.waitStatus) == Node.SIGNAL ||
         (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) &&
        pred.thread != null) {
      Node next = node.next;
      if (next != null && next.waitStatus <= 0)
        compareAndSetNext(pred, predNext, next);
    } else {
      unparkSuccessor(node);
    }
    node.next = node; // help GC
  }
}
```

所以，对 CountDownLatch 的 await 调用大致会有如下的调用过程。

![](https://s3.ax1x.com/2020/12/21/rd6vgx.png)

一个和 await 重载的方法是 `await(long timeout, TimeUnit unit)`，这个方法和 await 最主要的区别就是这个方法能够可以等待计数器一段时间再执行后续操作。

### countDown 方法

countDown 是和 await 同等重要的方法，countDown 用于减少计数器的数量，如果计数减为 0 的话，就会释放所有的线程。

```java
public void countDown() {
  sync.releaseShared(1);
}
```

这个方法会调用 releaseShared 方法，此方法用于共享模式下的释放操作，首先会判断是否能够进行释放，判断的方法就是 CountDownLatch 内部类 Sync 的 tryReleaseShared 方法

```java
public final boolean releaseShared(int arg) {
  if (tryReleaseShared(arg)) {
    doReleaseShared();
    return true;
  }
  return false;
}

// ---- CountDownLatch ----

protected boolean tryReleaseShared(int releases) {
  for (;;) {
    int c = getState();
    if (c == 0)
      return false;
    int nextc = c-1;
    if (compareAndSetState(c, nextc))
      return nextc == 0;
  }
}
```

tryReleaseShared 会进行 for 循环判断线程状态值，使用 CAS 不断尝试进行替换。

如果能够释放，就会调用 doReleaseShared 方法

```java
private void doReleaseShared() {
  for (;;) {
    Node h = head;
    if (h != null && h != tail) {
      int ws = h.waitStatus;
      if (ws == Node.SIGNAL) {
        if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
          continue;            // loop to recheck cases
        unparkSuccessor(h);
      }
      else if (ws == 0 &&
               !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
        continue;                // loop on failed CAS
    }
    if (h == head)                   // loop if head changed
      break;
  }
}
```

可以看到，doReleaseShared 其实也是一个无限循环不断使用 CAS 尝试替换的操作。

## 总结

本文是 CountDownLatch 的基本使用和源码分析，CountDownLatch 就是一个基于 AQS 的计数器，它内部的方法都是围绕 AQS 框架来谈的，除此之外还有其他比如 ReentrantLock、Semaphore 等都是 AQS 的实现，所以要研究并发的话，离不开对 AQS 的探讨。CountDownLatch 的源码看起来很少，比较简单，但是其内部比如 await 方法的调用链路却很长，也值得花费时间深入研究。

我是 cxuan，一枚技术创作的程序员。如果本文你觉得不错的话，跪求读者点赞、在看、分享！


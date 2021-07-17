# Java 线程池

* [Java 线程池](#java-线程池)
   * [Executor 框架](#executor-框架)
      * [Executor 接口](#executor-接口)
      * [ExecutorService 接口](#executorservice-接口)
      * [AbstractExecutorService 抽象类](#abstractexecutorservice-抽象类)
      * [ScheduledExecutorService 接口](#scheduledexecutorservice-接口)
   * [线程池的描述](#线程池的描述)
      * [线程池创建](#线程池创建)
   * [ThreadPoolExecutor 类](#threadpoolexecutor-类)
   * [深入理解线程池](#深入理解线程池)
      * [线程池状态](#线程池状态)
      * [重要变量](#重要变量)
      * [任务提交](#任务提交)
      * [添加 worker 线程](#添加-worker-线程)
      * [worker 对象](#worker-对象)
      * [任务获取](#任务获取)
      * [工作线程退出](#工作线程退出)
   * [其他线程池](#其他线程池)
      * [newFixedThreadPool](#newfixedthreadpool)
      * [newSingleThreadExecutor](#newsinglethreadexecutor)
      * [newCachedThreadPool](#newcachedthreadpool)
   * [线程池实践考量因素](#线程池实践考量因素)
   * [线程池大小的设置](#线程池大小的设置)
   * [后记](#后记)

![](https://s3.ax1x.com/2021/02/12/yD1k38.png)

我们知道，线程需要的时候要进行创建，不需要的时候需要进行销毁，但是线程的创建和销毁都是一个开销比较大的操作。

>为什么开销大呢？

虽然我们程序员创建一个线程很容易，直接使用 new Thread() 创建就可以了，但是操作系统做的工作会多很多，它需要发出 `系统调用`，陷入内核，调用内核 API 创建线程，为线程分配资源等，这一些操作有很大的开销。

所以，在高并发大流量的情况下，频繁的创建和销毁线程会大大拖慢响应速度，那么有什么能够提高响应速度的方式吗？方式有很多，尽量避免线程的创建和销毁是一种提升性能的方式，也就是把线程 `复用` 起来，因为性能是我们日常最关注的因素。

本篇文章我们先来通过认识一下 Executor 框架、然后通过描述线程池的基本概念入手、逐步认识线程池的核心类，然后慢慢进入线程池的原理中，带你一步一步理解线程池。

在 Java 中可以通过线程池来达到这样的效果。今天我们就来详细讲解一下 Java 的`线程池`。

## Executor 框架

为什么要先说一下 Executor 呢？因为我认为 Executor 是线程池的一个驱动，我们平常创建并执行线程用的一般都是 new Thread().start() 这个方法，这个方法更多强调 **创建一个线程并开始运行**。而我们后面讲到创建线程池更多体现在**驱动执行**上。

Executor 的总体框架如下，我们下面会对 Executor 框架中的每个类进行介绍。

<img src="https://s3.ax1x.com/2021/02/10/ywnLef.png" style="zoom:50%;" />

我们首先来认识一下 Executor

### Executor 接口

Executor 是 `java.util.concurrent` 的顶级接口，这个接口只有一个方法，那就是 `execute` 方法。我们平常创建并启动线程会使用 `new Thread().start()` ，而 Executor 中的 execute 方法替代了显示创建线程的方式。Executor 的设计初衷就是将任务提交和任务执行细节进行解藕。使用 Executor 框架，你可以使用如下的方式创建线程

```java
Executor executor = Executors.xxx // xxx 其实就是 Executor 的实现类，我们后面会说
executor.execute(new RunnableTask1());
executor.execute(new RunnableTask2());
```

execute方法接收一个 `Runnable` 实例，它用来执行一个任务，而任务就是一个实现了 Runnable 接口的类，但是 execute 方法不能接收实现了 `Callable` 接口的类，也就是说，execute 方法不能接收具有返回值的任务。

execute 方法创建的线程是异步执行的，也就是说，你不用等待每个任务执行完毕后再执行下一个任务。

![](https://s3.ax1x.com/2021/02/10/ywuK61.png)

比如下面就是一个简单的使用 Executor 创建并执行线程的示例

```java
public class RunnableTask implements Runnable{

    @Override
    public void run() {
        System.out.println("running");
    }

    public static void main(String[] args) {
        Executor executor = Executors.newSingleThreadExecutor(); // 你可能不太理解这是什么意思，我们后面会说。
        executor.execute(new RunnableTask());
    }
}
```

Executor 就相当于是族长，大佬只发号令，族长让你异步执行你就得异步执行，族长说不用`汇报`任务你就不用回报，但是这个族长管的事情有点少，所以除了 Executor 之外，我们还需要认识其他管家，比如说管你这个线程啥时候终止，啥时候暂停，判断你这个线程当前的状态等，`ExecutorService` 就是一位大管家。

### ExecutorService 接口

ExecutorService 也是一个接口，它是 Executor 的拓展，提供了一些 Executor 中没有的方法，下面我们来介绍一下这些方法

```java
void shutdown();
```

`shutdown` 方法调用后，ExecutorService 会有序关闭正在执行的任务，但是不接受新任务。如果任务已经关闭，那么这个方法不会产生任何影响。

ExecutorService 还有一个和 shutdown 方法类似的方法是

```java
List<Runnable> shutdownNow();
```

`shutdownNow` 会尝试停止关闭所有正在执行的任务，停止正在等待的任务，并返回正在等待执行的任务列表。

>既然 shutdown 和 shutdownNow 这么相似，那么二者有啥区别呢？
>
>* shutdown 方法只是会将`线程池`的状态设置为 `SHUTWDOWN` ，正在执行的任务会继续执行下去，线程池会等待任务的执行完毕，而没有执行的线程则会中断。
>* shutdownNow 方法会将线程池的状态设置为 `STOP`，正在执行和等待的任务则被停止，返回等待执行的任务列表

ExecutorService 还有三个判断线程状态的方法，分别是

```java
boolean isShutdown();
boolean isTerminated();
boolean awaitTermination(long timeout, TimeUnit unit)
        throws InterruptedException;
```

* `isShutdown` 方法表示执行器是否已经关闭，如果已经关闭，返回 true，否则返回 false。
* `isTerminated` 方法表示判断所有任务再关闭后是否已完成，如果完成返回 false，这个需要注意一点，除非首先调用 shutdown 或者 shutdownNow 方法，否则 isTerminated 方法永远不会为 true。
* `awaitTermination` 方法会阻塞，直到发出调用 shutdown 请求后所有的任务已经完成执行后才会解除。这个方法不是非常容易理解，下面通过一个小例子来看一下。

```java
public static ExecutorService executorService = Executors.newFixedThreadPool(10);

public static void main(String[] args) throws InterruptedException {
  for (int i = 0; i < 10; i++) {
    executorService.submit(() -> {
      System.out.println(Thread.currentThread().getName());
      try {
        Thread.sleep(10);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    });

  }

  executorService.shutdown();
  System.out.println("Waiting...");
  boolean isTermination = executorService.awaitTermination(3, TimeUnit.SECONDS);
  System.out.println("Waiting...Done");
  if(isTermination){
    System.out.println("All Thread Done");
  }
  System.out.println(Thread.currentThread().getName());
}
```

如果在调用 executorService.shutdown() 之后，所有线程完成任务，isTermination 返回 true，程序才会打印出 All Thread Done ，如果注释掉 executorService.shutdown() 或者在任务没有完成后 awaitTermination 就超时了，那么 isTermination 就会返回 false。

ExecutorService 当大管家还有一个原因是因为它不仅能够包容 Runnable 对象，还能够接纳 `Callable` 对象。在 ExecutorService 中，`submit` 方法扮演了这个角色。

```java
<T> Future<T> submit(Callable<T> task);
<T> Future<T> submit(Runnable task, T result);
Future<?> submit(Runnable task);
```

submit 方法会返回一个 `Future`对象，`<T>` 表示范型，它是对 Callable 产生的返回值来说的，submit 方法提交的任务中的 call 方法如果返回 Integer，那么 submit 方法就返回 `Future<Integer>`，依此类推。

```java
<T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)
        throws InterruptedException;
<T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks,
                                  long timeout, TimeUnit unit)
        throws InterruptedException;
```

`invokeAll` 方法用于执行给定的任务结合，执行完成后会返回一个任务列表，任务列表每一项是一个任务，每个任务会包括任务状态和执行结果，同样 invokeAll 方法也会返回 Future 对象。

```java
<T> T invokeAny(Collection<? extends Callable<T>> tasks)
        throws InterruptedException, ExecutionException;
<T> T invokeAny(Collection<? extends Callable<T>> tasks,
                    long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
```

invokeAny 会获得最先完成任务的结果，即`Callable<T>` 接口中的 call 的返回值，**在获得结果时，会中断其他正在执行的任务**，具有`阻塞性`。

大管家的职责相对于组长来说标准更多，管的事情也比较宽，但是大管家毕竟也是家族的中流砥柱，他不会做具体的活，他的下面有各个干将，干将是一个家族的核心，他负责完成大管家的工作。

### AbstractExecutorService 抽象类

AbstractExecutorService 是一个抽象类，它实现了 ExecutorService 中的部分方法，它相当一个干将，会分析大管家有哪些要做的工作，然后针对大管家的要求做一些具体的规划，然后找他的得力助手 `ThreadPoolExecutor` 来完成目标。

AbstractExecutorService 这个抽象类主要实现了 `invokeAll` 和 `invokeAny` 方法，关于这两个方法的源码分析我们会在后面进行解释。

### ScheduledExecutorService 接口

ScheduledExecutorService 也是一个接口，它扩展了 ExecutorService 接口，提供了 ExecutorService 接口所没有的功能，ScheduledExecutorService 顾名思义就是一个`定时执行器`，定时执行器可以安排命令在一定延迟时间后运行或者定期执行。

它主要有三个接口方法，一个重载方法。下面我们先来看一下这两个重载方法。

```java
public ScheduledFuture<?> schedule(Runnable command,
                                       long delay, TimeUnit unit);
public <V> ScheduledFuture<V> schedule(Callable<V> callable,
                                           long delay, TimeUnit unit);
```

`schedule` 方法能够延迟一定时间后执行任务，并且只能执行一次。可以看到，schedule 方法也返回了一个 `ScheduledFuture` 对象，ScheduledFuture 对象扩展了 Future 和 Delayed 接口，它表示异步延迟计算的结果。schedule 方法支持零延迟和负延迟，这两类值都被视为立即执行任务。

还有一点需要说明的是，schedule 方法能够接收相对的时间和周期作为参数，而不是固定的日期，你可以使用 **date.getTime - System.currentTimeMillis()** 来得到相对的时间间隔。

```java
public ScheduledFuture<?> scheduleAtFixedRate(Runnable command,
                                                  long initialDelay,
                                                  long period,
                                                  TimeUnit unit);
```

scheduleAtFixedRate 表示任务会根据固定的速率在时间 `initialDelay` 后不断地执行。

```java
public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command,
                                                     long initialDelay,
                                                     long delay,
                                                     TimeUnit unit);
```

这个方法和上面的方法很类似，它表示的是以固定延迟时间的方式来执行任务。

> scheduleAtFixedRate 和 scheduleWithFixedDelay 这两个方法容易混淆，下面我们通过一个示例来说明一下这两个方法的区别。

```java
public class ScheduleTest {

    public static void main(String[] args) {
        Runnable command = () -> {
            long startTime = System.currentTimeMillis();
            System.out.println("current timestamp = " + startTime);
            try {
                TimeUnit.MILLISECONDS.sleep(new Random().nextInt(100));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("time spend = " + (System.currentTimeMillis() - startTime));
        };

        ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(10);
        scheduledExecutorService.scheduleAtFixedRate(command,100,1000,TimeUnit.MILLISECONDS);
    }
}
```

输出结果大致如下

<img src="https://s3.ax1x.com/2021/02/10/ywnXTS.png" style="zoom:50%;" />

可以看到，没次打印出来 current timestamp 的时间间隔大约等于 1000 毫秒，所以可以断定 `scheduleAtFixedRate` 是以恒定的速率来执行任务的。

然后我们再看一下 `scheduleWithFixedDelay` 方法，和上面测试类一样，只不过我们把 scheduleAtFixedRate 换为了 scheduleWithFixedDelay 。

```java
scheduledExecutorService.scheduleWithFixedDelay(command,10,1000,TimeUnit.MILLISECONDS);
```

然后观察一下输出结果

<img src="https://s3.ax1x.com/2021/02/10/ywnbOP.png" style="zoom:50%;" />

可以看到，两个 current timestamp 之间的间隔大约等于 1000(固定时间) + delay(time spend) 的总和，由此可以确定 `scheduleWithFixedDelay` 是以固定时延来执行的。

## 线程池的描述

下面我们先来认识一下什么是线程池，线程池从概念上来看就是一个`池子`，什么池子呢？是指管理同一组工作线程的池子，也就是说，线程池会统一管理内部的工作线程。

wiki 上说，线程池其实就是一种软件设计模式，这种设计模式用于实现计算机程序中的并发。

![image-20210202200016478](/Users/mr.l/Library/Application Support/typora-user-images/image-20210202200016478.png)

比如下面就是一个简单的线程池概念图。

![](https://s3.ax1x.com/2021/02/10/ywnOw8.png)

>注意：这个图只是一个概念模型，不是真正的线程池实现，希望读者不要混淆。

可以看到，这种其实也相当于是**生产者-消费者**模型，任务队列中的线程会进入到线程池中，由线程池进行管理，线程池中的一个个线程就是工作线程，工作线程执行完毕后会放入完成队列中，代表已经完成的任务。

上图有个缺点，那就是队列中的线程执行完毕后就会销毁，销毁就会产生性能损耗，降低响应速度，而我们使用线程池的目的往往是需要把线程重用起来，提高程序性能。

所以我们应该把执行完成后的工作线程重新利用起来，等待下一次使用。

### 线程池创建

我们上面大概聊了一下什么线程池的基本执行机制，你知道了线程是如何复用的，那么任何事物不可能是凭空出现的，线程也一样，那么它是如何创建出来的呢？下面就不得不提一个工具类，那就是 `Executors`。

Executors 也是`java.util.concurrent` 包下的成员，它是一个创建线程池的工厂，可以使用静态工厂方法来创建线程池，下面就是 Executors 所能够创建线程池的具体类型。

![](https://s3.ax1x.com/2021/02/10/ywupSs.png)

* `newFixedThreadPool`：newFixedThreadPool 将会创建固定数量的线程池，这个数量可以由程序员通过创建 `Executors.newFixedThreadPool(int nThreads)`时手动指定，每次提交一个任务就会创建一个线程，在任何时候，nThreads 的值是最多允许活动的线程。如果在所有线程都处于活跃状态时有额外的任务被创建，这些新创建的线程会进入等待队列等待线程调度。如果有任何线程由于执行期间出现意外导致`线程终止`，那么在执行后续任务时会使用等待队列中的线程进行替代。

*  `newWorkStealingPool`：newWorkStealingPool 是 JDK1.8 新增加的线程池，它是基于 `fork-join` 机制的一种线程池实现，使用了 `Work-Stealing` 算法。newWorkStealingPool 会创建足够的线程来支持并行度，会使用多个队列来减少竞争。work-stealing pool 线程池不会保证提交任务的执行顺序。
* `newSingleThreadExecutor`：newSingleThreadExecutor 是一个单线程的执行器，它只会创建`单个`线程来执行任务，如果这个线程异常结束，则会创建另外一个线程来替代。newSingleThreadExecutor 会确保任务在任务队列中的执行次序，也就是说，任务的执行是 `有序的`。
* `newCachedThreadPool`：newCachedThreadPool 会根据实际需要创建一个可缓存的线程池。如果线程池的线程数量超过实际需要处理的任务，那么 newCachedThreadPool 将会回收多余的线程。如果实际需要处理的线程不能满足任务的数量，则回你添加新的线程到线程池中，线程池中线程的数量不存在任何限制。
* `newSingleThreadScheduledExecutor`：newSingleThreadScheduledExecutor 和 newSingleThreadExecutor 很类似，只不过带有 scheduled 的这个执行器哥们能够在一定延迟后执行或者定期执行任务。
* `newScheduledThreadPool`：这个线程池和上面的 scheduled 执行器类似，只不过 newSingleThreadScheduledExecutor 比 newScheduledThreadPool 多加了一个 `DelegatedScheduledExecutorService` 代理，这其实包装器设计模式的体现。

上面这些线程池的底层实现都是由 ThreadPoolExecutor 来提供支持的，所以要理解这些线程池的工作原理，你就需要先把 ThreadPoolExecutor 搞明白，下面我们就来聊一聊 ThreadPoolExecutor。

## ThreadPoolExecutor 类

 `ThreadPoolExecutor` 位于 `java.util.concurrent` 工具类下，可以说它是线程池中最核心的一个类了。如果你要想把线程池理解透彻的话，就要首先了解一下这个类。

如果我们再拿上面家族举例子的话，ThreadPoolExecutor 就是一个家族的骨干人才，家族顶梁柱。ThreadPoolExecutor 做的工作真是太多太多了。

首先，ThreadPoolExecutor 提供了四个构造方法，然而前三个构造方法最终都会调用最后一个构造方法进行初始化

```java
public class ThreadPoolExecutor extends AbstractExecutorService {
    .....
      // 1
    public ThreadPoolExecutor(int corePoolSize,int maximumPoolSize,long keepAliveTime,TimeUnit unit,
            BlockingQueue<Runnable> workQueue);
 			// 2
    public ThreadPoolExecutor(int corePoolSize,int maximumPoolSize,long keepAliveTime,TimeUnit unit,
            BlockingQueue<Runnable> workQueue,ThreadFactory threadFactory);
 			// 3
    public ThreadPoolExecutor(int corePoolSize,int maximumPoolSize,long keepAliveTime,TimeUnit unit,
            BlockingQueue<Runnable> workQueue,RejectedExecutionHandler handler);
 			// 4
    public ThreadPoolExecutor(int corePoolSize,int maximumPoolSize,long keepAliveTime,TimeUnit unit,
        BlockingQueue<Runnable> workQueue,ThreadFactory threadFactory,RejectedExecutionHandler handler);
    ...
}
```

所以我们直接就来看一波最后这个线程池，看看参数都有啥，如果我没数错的话，应该是有 7 个参数(小学数学水平。。。。。。)

* 首先，一个非常重要的参数就是 `corePoolSize`，核心线程池的容量/大小，你叫啥我觉得都没毛病。只不过你得理解这个参数的意义，**它和线程池的实现原理有非常密切的关系**。你刚开始创建了一个线程池，此时是没有任何线程的，这个很好理解，因为我现在没有任务可以执行啊，创建线程干啥啊？而且创建线程还有开销啊，所以等到任务过来时再创建线程也不晚。但是！我要说但是了，如果调用了 prestartAllCoreThreads 或者 prestartCoreThread 方法，就会在没有任务到来时创建线程，前者是创建 corePoolSize 个线程，后者是只创建一个线程。Lea 爷爷本来想让我们程序员当个`懒汉`，等任务来了再干；可是你非要当个`饿汉`，提前完成任务。如果我们想当个懒汉的话，在创建了线程池后，线程池中的线程数为 0，当有任务来之后，就会创建一个线程去执行任务，当线程池中的线程数目达到 corePoolSize 后，就会把到达的任务放到`缓存队列`当中。

![](https://s3.ax1x.com/2021/02/10/ywnzWj.png)

* `maximumPoolSize` ：又来一个线程池的容量，只不过这个是线程池的最大容量，也就是线程池所能容纳最大的线程，而上面的 corePoolSize 只是核心线程容量。

>我知道你此时会有疑问，那就是不知道如何核心线程的容量和线程最大容量的区别是吧？我们后面会解释这点。

* `keepAliveTime`：这个参数是线程池的`保活机制`，表示线程在没有任务执行的情况下保持多久会终止。在默认情况下，这个参数只在线程数量大于 corePoolSize 时才会生效。当线程数量大于 corePoolSize 时，如果任意一个空闲的线程的等待时间 > keepAliveTime 后，那么这个线程会被剔除，直到线程数量等于 corePoolSize 为止。如果调用了 allowCoreThreadTimeOut 方法，线程数量在 corePoolSize 范围内也会生效，直到线程减为 0。

* `unit` ：这个参数好说，它就是一个 `TimeUnit` 的变量，unit 表示的是 keepAliveTime 的时间单位。unit 的类型有下面这几种

  ```java
  TimeUnit.DAYS;               //天
  TimeUnit.HOURS;             //小时
  TimeUnit.MINUTES;           //分钟
  TimeUnit.SECONDS;           //秒
  TimeUnit.MILLISECONDS;      //毫秒
  TimeUnit.MICROSECONDS;      //微妙
  TimeUnit.NANOSECONDS;       //纳秒
  ```

* `workQueue`：这个参数表示的概念就是等待队列，我们上面说过，如果核心线程 > corePoolSize 的话，就会把任务放入等待队列，这个等待队列的选择也是一门学问。Lea 爷爷给我们展示了三种等待队列的选择

  ![](https://s3.ax1x.com/2021/02/10/ywnvFg.png)

  * `SynchronousQueue`: 基于`阻塞队列(BlockingQueue)`的实现，它会直接将任务交给消费者，必须等队列中的添加元素被消费后才能继续添加新的元素。使用 SynchronousQueue 阻塞队列一般要求maximumPoolSizes 为无界，也就是 Integer.MAX_VALUE，避免线程拒绝执行操作。 
  * `LinkedBlockingQueue`：LinkedBlockingQueue 是一个无界缓存等待队列。当前执行的线程数量达到 corePoolSize 的数量时，剩余的元素会在阻塞队列里等待。
  * `ArrayBlockingQueue`：ArrayBlockingQueue 是一个有界缓存等待队列，可以指定缓存队列的大小，当正在执行的线程数等于 corePoolSize 时，多余的元素缓存在 ArrayBlockingQueue 队列中等待有空闲的线程时继续执行，当 ArrayBlockingQueue 已满时，加入 ArrayBlockingQueue 失败，会开启新的线程去执行，当线程数已经达到最大的 maximumPoolSizes 时，再有新的元素尝试加入 ArrayBlockingQueue时会报错

* `threadFactory`：线程工厂，这个参数主要用来创建线程；

* `handler` ：拒绝策略，拒绝策略主要有以下取值

  ![](https://s3.ax1x.com/2021/02/10/ywnxYQ.png)

  * `AbortPolicy`：丢弃任务并抛出 RejectedExecutionException 异常。
  * `DiscardPolicy`: 直接丢弃任务，但是不抛出异常。
  * `DiscardOldestPolicy`：直接丢弃队列最前面的任务，然后重新尝试执行任务（重复此过程）。
  * `CallerRunsPolicy`：由调用线程处理该任务。


## 深入理解线程池

上面我和你简单聊了一下线程池的基本构造，线程池有几个非常重要的参数可以细细品味，但是哥们醒醒，接下来才是刺激的地方。

### 线程池状态

首先我们先来聊聊线程池状态，线程池状态是一个非常有趣的设计点，ThreadPoolExecutor 使用 `ctl` 来存储线程池状态，这些状态也叫做线程池的`生命周期`。想想也是，线程池作为一个存储管理线程的资源池，它自己也要有这些状态，以及状态之间的变更才能更好的满足我们的需求。ctl 其实就是一个 `AtomicInteger` 类型的变量，保证`原子性`。

ctl 除了存储线程池状态之外，它还存储 `workerCount` 这个概念，workerCount 指示的是有效线程数，workerCount 表示的是已经被允许启动但不允许停止的工作线程数量。workerCount 的值与实际活动线程的数量不同。

**ctl 高低位来判断是线程池状态还是工作线程数量，线程池状态位于高位**。

>这里有个设计点，为什么使用 AtomicInteger 而不是存储上线更大的 AtomicLong 之类的呢？

Lea 并非没有考虑过这个问题，为了表示 int 值，目前 workerCount 的大小是**（2 ^ 29）-1（约 5 亿个线程），而不是（2 ^ 31）-1（20亿个）可表示的线程**。如果将来有问题，可以将该变量更改为 AtomicLong。但是在需要之前，使用 int 可以使此代码更快，更简单，int 存储占用存储空间更小。

runState 具有如下几种状态

```java
private static final int RUNNING    = -1 << COUNT_BITS; 
private static final int SHUTDOWN   =  0 << COUNT_BITS;
private static final int STOP       =  1 << COUNT_BITS;
private static final int TIDYING    =  2 << COUNT_BITS;
private static final int TERMINATED =  3 << COUNT_BITS;
```

我们先上状态轮转图，然后根据状态轮转图做详细的解释。

<img src="https://s3.ax1x.com/2021/02/10/ywu9ln.png" style="zoom:50%;" />

这几种状态的解释如下

* `RUNNING`: 如果线程池处于 RUNNING 状态下的话，能够接收新任务，也能处理正在运行的任务。可以从 ctl 的初始化得知，线程池一旦创建出来就会处于 RUNNING 状态，并且线程池中的有效线程数为 0。

```java
private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));
```

* `SHUTDOWN`: 在调用 shutdown 方法后，线程池的状态会由 RUNNING -> SHUTDOWN 状态，位于 SHUTDOWN 状态的线程池能够处理正在运行的任务，但是不能接受新的任务，这和我们上面说的对与 shutdown 的描述一致。
* `STOP`: 和 shutdown 方法类似，在调用 shutdownNow 方法时，程序会从 RUNNING/SHUTDOWN -> STOP 状态，处于 STOP 状态的线程池，不接收新任务，不处理已添加的任务，并且会中断正在处理的任务。
* `TIDYING`：TIDYING 状态有个前置条件，分为两种：一种是是当线程池位于 SHUTDOWN 状态下，阻塞队列和线程池中的线程数量为空时，会由 SHUTDOWN -> TIDYING；另一种是当线程池位于 STOP 状态下时，线程池中的数量为空时，会由 STOP -> TIDYING 状态。转换为 TIDYING 的线程池会调用 `terminated`这个钩子方法，terminated 在 ThreadPoolExecutor 类中是空实现，若用户想在线程池变为 TIDYING 时，进行相应的处理，可以通过重载 terminated 函数来实现。 
* `TERMINATED`：TERMINATED 状态是线程池的最后一个状态，线程池处在 TIDYING 状态时，执行完terminated 方法之后，就会由 TIDYING -> TERMINATED 状态。此时表示线程池的彻底终止。

### 重要变量

下面我们一起来了解一下线程池中的重要变量。

```java
private final BlockingQueue<Runnable> workQueue;
```

阻塞队列，这个和我们上面说的阻塞队列的参数是一个意思，因为在构造 ThreadPoolExecutor 时，会把参数的值赋给 this.workQueue。

```java
private final ReentrantLock mainLock = new ReentrantLock(); 
```

线程池的主要`状态锁`，对线程池的状态(比如线程池大小、运行状态)的改变都需要使用到这个锁

```java
private final HashSet<Worker> workers = new HashSet<Worker>();
```

workers 持有线程池中所有线程的集合，只有持有上面 `mainLock` 的锁才能够访问。

```java
private final Condition termination = mainLock.newCondition();
```

等待条件，用来支持 awaitTermination 方法。Condition 和 Lock 一起使用可以实现通知/等待机制。

```java
private int largestPoolSize;
```

largestPoolSize 表示线程池中最大池的大小，只有持有 mainLock 才能访问

```java
private long completedTaskCount;
```

completedTaskCount 表示任务完成的计数，它仅仅在任务终止时更新，需要持有 mainLock 才能访问。

```java
private volatile ThreadFactory threadFactory;
```

threadFactory 是创建线程的工厂，所有的线程都会使用这个工厂，调用 `addWorker` 方法创建。

```java
private volatile RejectedExecutionHandler handler;
```

handler 表示拒绝策略，handler 会在线程饱和或者将要关闭的时候调用。

```java
private volatile long keepAliveTime;
```

保活时间，它指的是空闲线程等待工作的超时时间，当存在多个 corePoolSize 或 allowCoreThreadTimeOut 时，线程将使用这个超时时间。

下面是一些其他变量，这些变量比较简单，我就直接给出注释了。

```java
private volatile boolean allowCoreThreadTimeOut;   //是否允许为核心线程设置存活时间
private volatile int   corePoolSize;     //核心池的大小（即线程池中的线程数目大于这个参数时，提交的任务会被放进任务缓存队列）
private volatile int   maximumPoolSize;   //线程池最大能容忍的线程数
private static final RejectedExecutionHandler defaultHandler =
        new AbortPolicy(); // 默认的拒绝策略
```

### 任务提交

现在我们知道了 ThreadPoolExecutor 创建出来就会处于运行状态，此时线程数量为 0 ，等任务到来时，线程池就会创建线程来执行任务，而下面我们的关注点就会放在**任务提交**这个过程上。

通常情况下，我们会使用

```java
executor.execute() 
```

来执行任务，我在很多书和博客教程上都看到过这个执行过程，下面是一些书和博客教程所画的 ThreadPoolExecutor 的执行示意图和执行流程图

执行示意图

![](https://s3.ax1x.com/2021/02/10/ywuCyq.png)

处理流程图

![](https://s3.ax1x.com/2021/02/10/ywuPO0.png)

ThreadPoolExecutor 的执行 execute 的方法分为下面四种情况

1. 如果当前运行的工作线程少于 corePoolSize 的话，那么会创建新线程来执行任务 ，这一步需要获取 mainLock `全局锁`。
2. 如果运行线程不小于 corePoolSize，则将任务加入 BlockingQueue 阻塞队列。
3. 如果无法将任务加入 BlockingQueue 中，此时的现象就是队列已满，此时需要创建新的线程来处理任务，这一步同样需呀获取 mainLock 全局锁。
4. 如果创建新线程会使当前运行的线程超过 `maximumPoolSize` 的话，任务将被拒绝，并且使用 `RejectedExecutionHandler.rejectEExecution()` 方法拒绝新的任务。

ThreadPoolExecutor 采取上面的整体设计思路，是为了在执行 execute 方法时，避免获取全局锁，因为频繁获取全局锁会是一个严重的`可伸缩瓶颈`，所以，几乎所有的 execute 方法调用都是通过执行步骤2。

上面指出了 execute 的运行过程，整体上来说这个执行过程把非常重要的点讲解出来了，但是不够细致，我查阅 ThreadPoolExecute 和部分源码分析文章后，发现这事其实没这么简单，先来看一下 execute 的源码，我已经给出了中文注释

```java
public void execute(Runnable command) {
  if (command == null)
    throw new NullPointerException();
  // 获取 ctl 的值
  int c = ctl.get();
  // 判断 ctl 的值是否小于核心线程池的数量
  if (workerCountOf(c) < corePoolSize) {
    // 如果小于，增加工作队列，command 就是一个个的任务
    if (addWorker(command, true))
      // 线程创建成功，直接返回
      return;
    // 线程添加不成功，需要再次判断，每需要一次判断都会获取 ctl 的值
    c = ctl.get();
  }
  // 如果线程池处于运行状态并且能够成功的放入阻塞队列
  if (isRunning(c) && workQueue.offer(command)) {
    // 再次进行检查
    int recheck = ctl.get();
    // 如果不是运行态并且成功的从阻塞队列中删除
    if (! isRunning(recheck) && remove(command))
      // 执行拒绝策略
      reject(command);
    // worker 线程数量是否为 0
    else if (workerCountOf(recheck) == 0)
      // 增加工作线程
      addWorker(null, false);
  }
  // 如果不能增加工作线程的数量，就会直接执行拒绝策略
  else if (!addWorker(command, false))
    reject(command);
}
```

下面是我根据源码画出的执行流程图

![](https://s3.ax1x.com/2021/02/10/ywuFmV.png)

下面我们针对 execute 流程进行分析，可能有点啰嗦，因为几个核心流程上面已经提过了，不过为了流程的完整性，我们再在这里重新提一下。

1. 如果线程池的核心数量少于 `corePoolSize`，那么就会使用 addWorker 创建新线程，addworker 的流程我们会在下面进行分析。如果创建成功，那么 execute 方法会直接返回。如果没创建成功，可能是由于线程池已经 shutdown，可能是由于并发情况下 workerCountOf(c) < corePoolSize ，别的线程先创建了 worker 线程，导致 workerCoun t>= corePoolSize。
2. 如果线程池还在 Running 状态，会将 task 加入阻塞队列，加入成功后会进行 `double-check` 双重校验，继续下面的步骤，如果加入失败，可能是由于队列线程已满，此时会判断是否能够加入线程池中，如果线程池也满了的话，就会直接执行拒绝策略，如果线程池能加入，execute 方法结束。
3. 步骤 2 中的 double-check 主要是为了判断进入 workQueue 中的 task 是否能被执行：如果线程池已经不是 Running 状态，则应该拒绝添加任务，从 workQueue 队列中删除任务。如果线程池是 Running，但是从 workQueue 中删除失败了，此时的原因可能是由于其他线程执行了这个任务，此时会直接执行拒绝策略。
4. 如果线程是 Running 状态，并且不能把任务从队列中移除，进而判断工作线程是否为 0 ，如果不为 0 ，execute 执行完毕，如果工作线程是 0 ，则会使用 addWorker 增加工作线程，execute 执行完毕。

### 添加 worker 线程

从上面的执行流程可以看出，添加一个 worker 涉及的工作也非常多，这也是一个比价难啃的点，我们一起来分析下，这是 worker 的源码

```java
private boolean addWorker(Runnable firstTask, boolean core) {
  // retry 的用法相当于 goto
  retry:
  for (;;) {
    int c = ctl.get();
    int rs = runStateOf(c);

    // Check if queue empty only if necessary.
    // 仅在必要时检查队列是否为空。
    // 线程池状态有五种，state 越小越是运行状态
    // rs >= SHUTDOWN，表示此时线程池状态可能是 SHUTDOWN、STOP、TIDYING、TERMINATED
    // 默认 rs >= SHUTDOWN，如果 rs = SHUTDOWN，直接返回 false
    // 默认 rs < SHUTDOWN，是 RUNNING，如果任务不是空，返回 false
    // 默认 RUNNING，任务是空，如果工作队列为空，返回 false
    //
    if (rs >= SHUTDOWN &&
        ! (rs == SHUTDOWN &&
           firstTask == null &&
           ! workQueue.isEmpty()))
      return false;


    // 执行循环
    for (;;) {
      // 统计工作线程数量
      int wc = workerCountOf(c);
      // 如果 worker 数量>线程池最大上限 CAPACITY（即使用int低29位可以容纳的最大值）
      // 或者 worker数量 > corePoolSize 或 worker数量>maximumPoolSize )，即已经超过了给定的边界
      if (wc >= CAPACITY ||
          wc >= (core ? corePoolSize : maximumPoolSize))
        return false;

      // 使用 CAS 增加 worker 数量，增加成功，跳出循环。
      if (compareAndIncrementWorkerCount(c))
        break retry;

      // 检查 ctl
      c = ctl.get();  // Re-read ctl
      // 如果状态不等于之前获取的 state，跳出内层循环，继续去外层循环判断
      if (runStateOf(c) != rs)
        continue retry;
      // else CAS failed due to workerCount change; retry inner loop
    }
  }

  /*
          worker数量+1成功的后续操作
        * 添加到 workers Set 集合，并启动 worker 线程
         */
  boolean workerStarted = false;
  boolean workerAdded = false;
  Worker w = null;
  try {
    // 包装 Runnable 对象
    // 设置 firstTask 的值为 -1
    // 赋值给当前任务
    // 使用 worker 自身这个 runnable，调用 ThreadFactory 创建一个线程，并设置给worker的成员变量thread
    w = new Worker(firstTask);
    final Thread t = w.thread;
    if (t != null) {
      final ReentrantLock mainLock = this.mainLock;
      mainLock.lock();
      try {
        // 在持有锁的时候重新检查
        // 如果 ThreadFactory 失败或在获得锁之前关闭，请回退。
        int rs = runStateOf(ctl.get());

        //如果线程池在运行 running<shutdown 或者 线程池已经 shutdown，且firstTask==null
        // （可能是 workQueue 中仍有未执行完成的任务，创建没有初始任务的 worker 线程执行）
        //worker 数量 -1 的操作在 addWorkerFailed()
        if (rs < SHUTDOWN ||
            (rs == SHUTDOWN && firstTask == null)) {
          if (t.isAlive()) // precheck that t is startable
            throw new IllegalThreadStateException();

          // workers 就是一个 HashSet 集合
          workers.add(w);

          // 设置最大的池大小 largestPoolSize，workerAdded 设置为true
          int s = workers.size();
          if (s > largestPoolSize)
            largestPoolSize = s;
          workerAdded = true;
        }
      } finally {
        mainLock.unlock();
      }
      if (workerAdded) {
        t.start();
        workerStarted = true;
      }
    }
    //如果启动线程失败
    // worker 数量 -1
  } finally {
    if (! workerStarted)
      addWorkerFailed(w);
  }
  return workerStarted;
}
```

真长的一个方法，有点想吐血，其实我肝到现在已经肝不动了，但我一想到看这篇文章的读者们能**给我一个关注**，就算咳出一口老血也值了。

这个方法的执行流程图如下

![](https://s3.ax1x.com/2021/02/10/ywuATU.png)

这里我们就不再文字描述了，但是上面流程图中有一个对象引起了我的注意，那就是 `worker` 对象，这个对象就代表了线程池中的工作线程，那么这个 worker 对象到底是啥呢？

### worker 对象

Worker 位于 `ThreadPoolExecutor` 内部，它继承了 AQS 类并且实现了 Runnable 接口。Worker 类主要维护了线程运行过程中的中断控制状态。它提供了锁的获取和释放操作。在 worker 的实现中，我们使用了非重入的互斥锁而不是使用重复锁，因为 Lea 觉得我们不应该在调用诸如 setCorePoolSize 之类的控制方法时能够重新获取锁。

worker 对象的源码比较简单和标准，这里我们只说一下 worker 对象的构造方法，也就是

```java
Worker(Runnable firstTask) {
  setState(-1); 
  this.firstTask = firstTask;
  this.thread = getThreadFactory().newThread(this);
}
```

构造一个 worker 对象需要做三步操作：

* 初始 AQS 状态为 -1，此时不允许中断 interrupt()，只有在 worker 线程启动了，执行了 runWorker() 方法后，将 state 置为0，才能进行中断。
* 将 firstTask 赋值给为当前类的全局变量
* 通过 `ThreadFactory` 创建一个新的线程。

###任务运行

我们前面的流程主要分析了线程池的 execute 方法的执行过程，这个执行过程相当于是任务提交过程，而我们下面要说的是**从队列中获取任务并运行**的这个工作流程。

一般情况下，我们会从初始任务开始运行，所以我们不需要获取第一个任务。否则，只要线程池还处于 Running 状态，我们会调用 `getTask` 方法获取任务。getTask 方法可能会返回 null，此时可能是由于线程池状态改变或者是配置参数更改而导致的退出。还有一种情况可能是由于 `异常` 而引发的，这个我们后面会细说。

下面来看一下 `runWorker` 方法的源码：

```java
final void runWorker(Worker w) {
  Thread wt = Thread.currentThread();
  Runnable task = w.firstTask;
  w.firstTask = null;
  // 允许打断
  //  new Worker() 是 state==-1，此处是调用 Worker 类的 tryRelease() 方法，
  //  将 state 置为0
  w.unlock();
  boolean completedAbruptly = true;
  try {
    // 调用 getTask() 获取任务
    while (task != null || (task = getTask()) != null) {
      // 获取全局锁
      w.lock();
      // 确保只有在线程 STOPING 时，才会被设置中断标志，否则清除中断标志。
      // 如果一开始判断线程池状态 < STOPING，但 Thread.interrupted() 为 true，
      // 即线程已经被中断，又清除了中断标示，再次判断线程池状态是否 >= stop
      // 是，再次设置中断标示，wt.interrupt()
      // 否，不做操作，清除中断标示后进行后续步骤
      if ((runStateAtLeast(ctl.get(), STOP) ||
           (Thread.interrupted() &&
            runStateAtLeast(ctl.get(), STOP))) &&
          !wt.isInterrupted())
        wt.interrupt();
      try {
        // 执行前需要调用的方法，交给程序员自己来实现
        beforeExecute(wt, task);
        Throwable thrown = null;
        try {
          task.run();
        } catch (RuntimeException x) {
          thrown = x; throw x;
        } catch (Error x) {
          thrown = x; throw x;
        } catch (Throwable x) {
          thrown = x; throw new Error(x);
        } finally {
          // 执行后需要调用的方法，交给程序员自己来实现
          afterExecute(task, thrown);
        }
      } finally {
        // 把 task 置为 null，完成任务数 + 1，并进行解锁
        task = null;
        w.completedTasks++;
        w.unlock();
      }
    }
    completedAbruptly = false;
    // 最后处理 worker 的退出
  } finally {
    processWorkerExit(w, completedAbruptly);
  }
}
```

下面是 runWorker 的执行流程图

<img src="https://s3.ax1x.com/2021/02/10/ywukwT.png" style="zoom:50%;" />

这里需要注意一下最后的 `processWorkerExit` 方法，这里面其实也做了很多事情，包括判断 `completedAbruptly` 的布尔值来表示是否完成任务，获取锁，尝试从队列中移除 worker，然后尝试中断，接下来会判断一下中断状态，在线程池当前状态小于 STOP 的情况下会创建一个新的 worker 来替换被销毁的 worker。

### 任务获取

任务获取就是 getTask 方法的执行过程，这个环节主要用来获取任务和剔除任务。下面进入源码分析环节

```java
private Runnable getTask() {
  // 判断最后一个 poll 是否超时。
  boolean timedOut = false; // Did the last poll() time out?

  for (;;) {
    int c = ctl.get();
    int rs = runStateOf(c);

    // Check if queue empty only if necessary.
    // 必要时检查队列是否为空
    // 对线程池状态的判断，两种情况会 workerCount-1，并且返回 null
    // 线程池状态为 shutdown，且 workQueue 为空（反映了 shutdown 状态的线程池还是要执行 workQueue 中剩余的任务的）
    // 线程池状态为 stop（shutdownNow() 会导致变成 STOP）（此时不用考虑 workQueue 的情况）
    if (rs >= SHUTDOWN && (rs >= STOP || workQueue.isEmpty())) {
      decrementWorkerCount();
      return null;
    }

    int wc = workerCountOf(c);

    // Are workers subject to culling?
    // 是否需要定时从 workQueue 中获取
    boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;

    // 如果工作线程的数量大于 maximumPoolSize 会进行线程剔除
    // 如果使用了 allowCoreThreadTimeOut ，并且工作线程不为0或者队列有任务的话，会直接进行线程剔除
    if ((wc > maximumPoolSize || (timed && timedOut))
        && (wc > 1 || workQueue.isEmpty())) {
      if (compareAndDecrementWorkerCount(c))
        return null;
      continue;
    }
		
    try {
      Runnable r = timed ?
        workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) :
      workQueue.take();
      if (r != null)
        return r;
      timedOut = true;
    } catch (InterruptedException retry) {
      timedOut = false;
    }
  }
}
```

getTask 方法的执行流程图如下

<img src="https://s3.ax1x.com/2021/02/10/ywuVkF.png" style="zoom:50%;" />

### 工作线程退出

工作线程退出是 runWorker 的最后一步，这一步会判断工作线程是否突然终止，并且会尝试终止线程，以及是否需要增加线程来替换原工作线程。

```java
private void processWorkerExit(Worker w, boolean completedAbruptly) {
  // worker数量 -1
  // completedAbruptly 是 true，突然终止，说明是 task 执行时异常情况导致，即run()方法执行时发生了异常，那么正在工作的 worker 线程数量需要-1
  // completedAbruptly 是 false 是突然终止，说明是 worker 线程没有 task 可执行了，不用-1，因为已经在 getTask() 方法中-1了
  if (completedAbruptly) // If abrupt, then workerCount wasn't adjusted
    decrementWorkerCount();

  // 从 Workers Set 中移除 worker
  final ReentrantLock mainLock = this.mainLock;
  mainLock.lock();
  try {
    completedTaskCount += w.completedTasks;
    workers.remove(w);
  } finally {
    mainLock.unlock();
  }

  // 尝试终止线程，
  tryTerminate();

  // 是否需要增加 worker 线程
  // 线程池状态是 running 或 shutdown
  // 如果当前线程是突然终止的，addWorker()
  // 如果当前线程不是突然终止的，但当前线程数量 < 要维护的线程数量，addWorker()
  // 故如果调用线程池 shutdown()，直到workQueue为空前，线程池都会维持 corePoolSize 个线程，
  // 然后再逐渐销毁这 corePoolSize 个线程
  int c = ctl.get();
  if (runStateLessThan(c, STOP)) {
    if (!completedAbruptly) {
      int min = allowCoreThreadTimeOut ? 0 : corePoolSize;
      if (min == 0 && ! workQueue.isEmpty())
        min = 1;
      if (workerCountOf(c) >= min)
        return; // replacement not needed
    }
    addWorker(null, false);
  }
}
```

源码搞的有点头大了，可能一时半会无法理解上面这些源码，不过你可以先把注释粘过去，等有时间了需要反复刺激，加深印象！

## 其他线程池

下面我们来了解一下其他线程池的构造原理，主要涉及 **FixedThreadPool、SingleThreadExecutor、CachedThreadPool**。

### newFixedThreadPool

newFixedThreadPool 被称为可重用`固定线程数`的线程池，下面是 newFixedThreadPool 的源码

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
  return new ThreadPoolExecutor(nThreads, nThreads,
                                0L, TimeUnit.MILLISECONDS,
                                new LinkedBlockingQueue<Runnable>());
}
```

可以看到，newFixedThreadPool 的 corePoolSize 和 maximumPoolSize 都被设置为创建 FixedThreadPool 时指定的参数 `nThreads`，也就是说，在 newFiexedThreadPool 中，核心线程数就是最大线程数。

下面是 newFixedThreadPool 的执行示意图

<img src="https://s3.ax1x.com/2021/02/10/ywuZY4.png" style="zoom:50%;" />

newFixedThreadPool 的工作流程如下

* 如果当前运行的线程数少于 corePoolSize，则会创建新线程 addworker 来执行任务
* 如果当前线程的线程数等于 corePoolSize，会将任务直接加入到 `LinkedBlockingQueue` 无界阻塞队列中，LinkedBlockingQueue 的上限如果没有制定，默认为 Integer.MAX_VALUE 大小。
* 等到线程池中的任务执行完毕后，newFixedThreadPool 会反复从 LinkedBlockingQueue 中获取任务来执行。

相较于 ThreadPoolExecutor，newFixedThreadPool 主要做了以下改变

* 核心线程数等于最大线程数，因此 newFixedThreadPool 只有两个最大容量，一个是线程池的线程容量，还有一个是 LinkedBlockingQueue 无界阻塞队列的线程容量。

* 这里可以看到还有一个变化是 0L，也就是 keepAliveTime = 0L，keepAliveTime 就是到达工作线程最大容量后的线程等待时间，0L 就意味着当线程池中的线程数大于 corePoolsize 时，空余的线程会被立即终止。
* 由于使用无界队列，运行中的 newFixedThreadPool 不会拒绝任务，也就是不会调用 RejectedExecutionHandler.rejectedExecution 方法。

### newSingleThreadExecutor 

newSingleThreadExecutor 中只有单个工作线程，也就是说它是一个只有单个 worker 的 Executor。

```java
public static ExecutorService newSingleThreadExecutor(ThreadFactory threadFactory) {
  return new FinalizableDelegatedExecutorService
    (new ThreadPoolExecutor(1, 1,
                            0L, TimeUnit.MILLISECONDS,
                            new LinkedBlockingQueue<Runnable>(),
                            threadFactory));
}
```

可以看到，在 newSingleThreadExecutor 中，corePoolSize 和 maximumPoolSize 都被设置为 1，也不存在超时情况，同样使用了 LinkedBlockingQueue 无界阻塞队列，除了 corePoolSize 和 maximumPoolSize 外，其他几乎和 newFixedThreadPool 一模一样。

下面是 newSingleThreadExecutor  的执行示意图

<img src="https://s3.ax1x.com/2021/02/10/ywuefJ.png" style="zoom:50%;" />

newSingleThreadExecutor 的执行过程和 newFixedThreadPool 相同，只是 newSingleThreadExecutor 的工作线程数为 1。

### newCachedThreadPool

newCachedThreadPool 是一个根据需要创建工作线程的线程池，newCachedThreadPool 线程池最大数量是 Integer.MAX_VALUE，保活时间是 `60` 秒，使用的是`SynchronousQueue` 无缓冲阻塞队列。

```java
public static ExecutorService newCachedThreadPool(ThreadFactory threadFactory) {
  return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                60L, TimeUnit.SECONDS,
                                new SynchronousQueue<Runnable>(),
                                threadFactory);
}
```

它的执行示意图如下

<img src="https://s3.ax1x.com/2021/02/10/ywunp9.png" style="zoom:50%;" />

* 首先会先执行 SynchronousQueue.offer 方法，如果当前 maximumPool 中有空闲线程正在执行 `SynchronousQueue.poll` ，就会把任务交给空闲线程来执行，execute 方法执行完毕，否则的话，继续向下执行。
* 如果 maximumPool 中没有线程执行 SynchronousQueue.poll 方法，这种情况下 newCachedThreadPool 会创建一个新线程执行任务，execute 方法执行完成。
* 执行完成的线程将执行 poll 操作，这个 poll 操作会让空闲线程最多在 SynchronousQueue 中等待 60 秒钟。如果 60 秒钟内提交了一个新任务，那么空闲线程会执行这个新提交的任务，否则空闲线程将会终止。

这里的关键点在于 SynchronousQueue 队列，它是一个没有容量的阻塞队列。**每个插入操作必须等待另一个线程对应的移除操作**。这其实就是一种任务传递，如下图所示

![](https://s3.ax1x.com/2021/02/10/ywuulR.png)

其实还有一个线程池 `ScheduledThreadPoolExecutor` ，就先不在此篇文章做详细赘述了。

## 线程池实践考量因素

下面介绍几种在实践过程中使用线程池需要考虑的几个点

* **避免任务堆积**，比如我们上面提到的 newFixedThreadPool，它是创建指定数目的线程，但是工作队列是无界的，这就导致如果工作队列线程太少，导致处理速度跟不上入队速度，这种情况下很可能会导致 OOM，诊断时可以使用 `jmap` 检查是否有大量任务入队。
* 生产实践中很可能由于逻辑不严谨或者工作线程不能及时释放导致 **线程泄漏**，这个时候最好检查一下线程栈
* 避免死锁等同步问题
* 尽量避免在使用线程池时操作 `ThreadLocal`，因为工作线程的生命周期可能会超过任务的生命周期。

## 线程池大小的设置

线程池大小的设置也是面试官经常会考到的一个点，一般需要根据`任务类型`来配置线程池大小

* 如果是 CPU 密集型任务，那么就意味着 CPU 是稀缺资源，这个时候我们通常不能通过增加线程数来提高计算能力，因为线程数量太多，会导致频繁的上下文切换，一般这种情况下，建议合理的线程数值是 `N(CPU)数 + 1`。
* 如果是 I/O 密集型任务，就说明需要较多的等待，这个时候可以参考 Brain Goetz 的推荐方法 **线程数 = CPU核数 × (1 + 平均等待时间/平均工作时间)**。参考值可以是 N(CPU) 核数 * 2。

当然，这只是一个参考值，具体的设置还需要根据实际情况进行调整，比如可以先将线程池大小设置为参考值，再观察任务运行情况和系统负载、资源利用率来进行适当调整。

## 后记

这篇文章真的写了很久，因为之前对线程池认识不是很深，所以花了大力气来研究，希望这篇文章对你有所帮助。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)




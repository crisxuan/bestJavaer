# 简单认识并发

* [简单认识并发](#简单认识并发)
   * [并发的多面性](#并发的多面性)
      * [更快的执行](#更快的执行)
      * [改进代码的设计](#改进代码的设计)
   * [基本的线程机制](#基本的线程机制)
      * [定义任务](#定义任务)
      * [Thread 类](#thread-类)
      * [使用 Executor](#使用-executor)
         * [CachedThreadPool](#cachedthreadpool)
         * [FixedThreadPool](#fixedthreadpool)
         * [SingleThreadExecutor](#singlethreadexecutor)
      * [从任务中产生返回值](#从任务中产生返回值)
      * [休眠](#休眠)
      * [优先级](#优先级)
      * [作出让步](#作出让步)
      * [后台线程](#后台线程)
      * [ThreadFactory](#threadfactory)
      * [加入一个线程](#加入一个线程)
      * [线程异常捕获](#线程异常捕获)

到目前为止，你学到的都是顺序编程，顺序编程的概念就是某一时刻只有一个任务在执行，顺序编程固然能够解决很多问题，但是对于某种任务，如果能够并发的执行程序中重要的部分就显得尤为重要，同时也可以极大提高程序运行效率，享受并发为你带来的便利。但是，熟练掌握并发编程理论和技术，对于只会CRUD的你来说是一种和你刚学面向对象一样的一种飞跃。

正如你所看到的，当并行的任务彼此干涉时，实际的并发问题就会接踵而至。而且并发问题不是很难复现，在你实际的测试过程中往往会忽略它们，因为故障是偶尔发生的，这也是我们研究它们的必要条件：如果你对并发问题置之不理，那么你最终会承受它给你带来的损害。

## 并发的多面性

### 更快的执行

速度问题听起来很简单，如果你想让一个程序运行的更快一些，那么可以将其切成多个分片，在单独的处理器上运行各自的分片：前提是这些任务彼此之间没有联系。

> 注意：速度的提高是以多核处理器而不是芯片的形式出现的。

如果你有一台多处理器的机器，那么你就可以在这些处理器之间分布多个任务，从而极大的提高吞吐量。**但是，并发通常是提高在单处理器上的程序的性能。**在单处理上的性能开销要比多处理器上的性能开销大很多，因为这其中增加了`线程切换`(从一个线程切换到另外一个线程)的重要依据。表面上看，将程序的所有部分当作单个的任务运行好像是开销更小一点，节省了线程切换的时间。

### 改进代码的设计

在单CPU机器上使用多任务的程序在任意时刻仍旧只在执行一项工作，你肉眼观察到控制台的输出好像是这些线程在同时工作，这不过是CPU的障眼法罢了，CPU为每个任务都提供了不固定的时间切片。Java 的线程机制是抢占式的，也就是说，你必须编写某种让步语句才会让线程进行切换，切换给其他线程。

## 基本的线程机制

并发编程使我们可以将程序划分成多个分离的，独立运行的任务。通过使用多线程机制，这些独立任务中的每一项任务都由`执行线程`来驱动。一个线程就是进程中的一个单一的顺序控制流。因此，单个进程可以拥有多个并发执行的任务，但是你的程序看起来每个任务都有自己的CPU一样。其底层是切分CPU时间，通常你不需要考虑它。

### 定义任务

线程可以驱动任务，因此你需要一种描述任务的方式，这可以由 `Runnable` 接口来提供，要想定义任务，只需要实现 Runnable 接口，并在`run` 方法中实现你的逻辑即可。

```java
public class TestThread implements Runnable{

    public static int i = 0;

    @Override
    public void run() {
        System.out.println("start thread..." + i);
        i++;
        System.out.println("end thread ..." + i);
    }

    public static void main(String[] args) {
        for(int i = 0;i < 5;i++){
            TestThread testThread = new TestThread();
            testThread.run();
        }
    }
}
```

任务 run 方法会有某种形式的循环，使得任务一直运行下去直到不再需要，所以要设定 run 方法的跳出条件(有一种选择是从 run 中直接返回，下面会说到。)

在 run 中使用静态方法 `Thread.yield() ` 可以使用线程调度，它的意思是建议线程机制进行切换：你已经执行完重要的部分了，剩下的交给其他线程跑一跑吧。注意是建议执行，而不是强制执行。在下面添加 Thread.yield() 你会看到有意思的输出

```java
public void run() {
  System.out.println("start thread..." + i);
  i++;
  Thread.yield();
  System.out.println("end thread ..." + i);
}
```

### Thread 类

将 Runnable 转变工作方式的传统方式是使用 Thread 类托管他，下面展示了使用 Thread 类来实现一个线程。

```java
public static void main(String[] args) {
  for(int i = 0;i < 5;i++){
    Thread t = new Thread(new TestThread());
    t.start();
  }
  System.out.println("Waiting thread ...");
}
```

Thread 构造器只需要一个 Runnable 对象，调用 Thread 对象的 start() 方法为该线程执行必须的初始化操作，然后调用 Runnable 的 run 方法，以便在这个线程中启动任务。可以看到，在 run  方法还没有结束前，run 就被返回了。也就是说，程序不会等到 run 方法执行完毕就会执行下面的指令。

在 run 方法中打印出每个线程的名字，就更能看到不同的线程的切换和调度

```java
@Override
public void run() {
  System.out.println(Thread.currentThread() + "start thread..." + i);
  i++;
  System.out.println(Thread.currentThread() + "end thread ..." + i);
}
```

这种线程切换和调度是交由 `线程调度器` 来自动控制的，如果你的机器上有多个处理器，线程调度器会在这些处理器之间默默的分发线程。每一次的运行结果都不尽相同，因为线程调度机制是未确定的。

### 使用 Executor 

#### CachedThreadPool

JDK1.5 的**java.util.concurrent** 包中的执行器 **Executor** 将为你管理 Thread 对象，从而简化了并发编程。Executor 在客户端和任务之间提供了一个间接层；与客户端直接执行任务不同，这个中介对象将执行任务。Executor 允许你管理异步任务的执行，而无须显示地管理线程的生命周期。

```java
public static void main(String[] args) {
  ExecutorService service = Executors.newCachedThreadPool();
  for(int i = 0;i < 5;i++){
    service.execute(new TestThread());
  }
  service.shutdown();
}
```

我们使用 Executor 来替代上述显示创建 Thread 对象。`CachedThreadPool` 为每个任务都创建一个线程。注意：ExecutorService 对象是使用静态的 `Executors` 创建的，这个方法可以确定 Executor 类型。对 `shutDown` 的调用可以防止新任务提交给 ExecutorService ，这个线程在 Executor 中所有任务完成后退出。

#### FixedThreadPool

FixedThreadPool 使你可以使用有限的线程集来启动多线程

```java
public static void main(String[] args) {
  ExecutorService service = Executors.newFixedThreadPool(5);
  for(int i = 0;i < 5;i++){
    service.execute(new TestThread());
  }
  service.shutdown();
}
```

有了 FixedThreadPool 使你可以一次性的预先执行高昂的线程分配，因此也就可以限制线程的数量。这可以节省时间，因为你不必为每个任务都固定的付出创建线程的开销。

#### SingleThreadExecutor

SingleThreadExecutor 就是线程数量为 1 的 FixedThreadPool，如果向 SingleThreadPool 一次性提交了多个任务，那么这些任务将会排队，每个任务都会在下一个任务开始前结束，所有的任务都将使用相同的线程。SingleThreadPool 会序列化所有提交给他的任务，并会维护它自己(隐藏)的悬挂队列。

```java
public static void main(String[] args) {
  ExecutorService service = Executors.newSingleThreadExecutor();
  for(int i = 0;i < 5;i++){
    service.execute(new TestThread());
  }
  service.shutdown();
}
```

从输出的结果就可以看到，任务都是挨着执行的。我为任务分配了五个线程，但是这五个线程不像是我们之前看到的有换进换出的效果，它每次都会先执行完自己的那个线程，然后余下的线程继续“走完”这条线程的执行路径。你可以用 SingleThreadExecutor 来确保任意时刻都只有唯一一个任务在运行。

### 从任务中产生返回值

Runnable 是执行工作的独立任务，但它不返回任何值。如果你希望任务在完成时能够返回一个值 ，这个时候你就需要考虑使用 `Callable` 接口，它是 JDK1.5 之后引入的，通过调用它的 `submit` 方法，可以把它的返回值放在一个 Future 对象中，然后根据相应的 get() 方法取得提交之后的返回值。

```java
public class TaskWithResult implements Callable<String> {

    private int id;

    public TaskWithResult(int id){
        this.id = id;
    }

    @Override
    public String call() throws Exception {
        return "result of TaskWithResult " + id;
    }
}

public class CallableDemo {

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService executors = Executors.newCachedThreadPool();
        ArrayList<Future<String>> future = new ArrayList<>();
        for(int i = 0;i < 10;i++){

            // 返回的是调用 call 方法的结果
            future.add(executors.submit(new TaskWithResult(i)));
        }
        for(Future<String> fs : future){
            System.out.println(fs.get());
        }
    }
}
```

submit() 方法会返回 Future 对象，Future 对象存储的也就是你返回的结果。你也可以使用 `isDone` 来查询 Future 是否已经完成。

### 休眠

影响任务行为的一种简单方式就是使线程 休眠，选定给定的休眠时间，调用它的 `sleep()` 方法， 一般使用的`TimeUnit` 这个时间类替换 `Thread.sleep()` 方法，示例如下：

```java
public class SuperclassThread extends TestThread{

    @Override
    public void run() {
        System.out.println(Thread.currentThread() + "starting ..." );

        try {
            for(int i = 0;i < 5;i++){
                if(i == 3){
                    System.out.println(Thread.currentThread() + "sleeping ...");
                    TimeUnit.MILLISECONDS.sleep(1000);
                }
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println(Thread.currentThread() + "wakeup and end ...");
    }

    public static void main(String[] args) {
        ExecutorService executors = Executors.newCachedThreadPool();
        for(int i = 0;i < 5;i++){
            executors.execute(new SuperclassThread());
        }
        executors.shutdown();
    }
}
```

> 关于 TimeUnit 中的 sleep() 方法和 Thread.sleep() 方法的比较，请参考下面这篇博客
>
> (https://www.cnblogs.com/xiadongqing/p/9925567.html)

### 优先级

上面提到线程调度器对每个线程的执行都是不可预知的，随机执行的，那么有没有办法告诉线程调度器哪个任务想要优先被执行呢？你可以通过设置线程的优先级状态，告诉线程调度器哪个线程的执行优先级比较高，"请给这个骑手马上派单"，线程调度器倾向于让优先级较高的线程优先执行，然而，这并不意味着优先级低的线程得不到执行，也就是说，优先级不会导致死锁的问题。优先级较低的线程只是执行频率较低。

```java
public class SimplePriorities implements Runnable{

    private int priority;

    public SimplePriorities(int priority) {
        this.priority = priority;
    }

    @Override
    public void run() {
        Thread.currentThread().setPriority(priority);
        for(int i = 0;i < 100;i++){
            System.out.println(this);
            if(i % 10 == 0){
                Thread.yield();
            }
        }
    }

    @Override
    public String toString() {
        return Thread.currentThread() + " " + priority;
    }

    public static void main(String[] args) {
        ExecutorService service = Executors.newCachedThreadPool();
        for(int i = 0;i < 5;i++){
            service.execute(new SimplePriorities(Thread.MAX_PRIORITY));
        }
        service.execute(new SimplePriorities(Thread.MIN_PRIORITY));
    }
}
```

toString() 方法被覆盖，以便通过使用 `Thread.toString()` 方法来打印线程的名称。你可以改写线程的默认输出，这里采用了 **Thread[pool-1-thread-1,10,main]** 这种形式的输出。

通过输出，你可以看到，最后一个线程的优先级最低，其余的线程优先级最高。注意，优先级是在 run 开头设置的，在构造器中设置它们不会有任何好处，因为这个时候线程还没有执行任务。

尽管JDK有10个优先级，但是一般只有**MAX_PRIORITY，NORM_PRIORITY，MIN_PRIORITY** 三种级别。

### 作出让步

我们上面提过，如果知道一个线程已经在 run() 方法中运行的差不多了，那么它就可以给线程调度器一个提示：我已经完成了任务中最重要的部分，可以让给别的线程使用CPU了。这个暗示将通过 yield() 方法作出。

> 有一个很重要的点就是，Thread.yield() 是建议执行切换CPU，而不是强制执行CPU切换。

对于任何重要的控制或者在调用应用时，都不能依赖于 `yield() `方法，实际上， yield() 方法经常被滥用。

### 后台线程

后台(daemon) 线程，是指运行时在后台提供的一种服务线程，这种线程不是属于必须的。当所有非后台线程结束时，程序也就停止了，**同时会终止所有的后台线程。**反过来说，只要有任何非后台线程还在运行，程序就不会终止。

```java
public class SimpleDaemons implements Runnable{

    @Override
    public void run() {
        while (true){
            try {
                TimeUnit.MILLISECONDS.sleep(100);
                System.out.println(Thread.currentThread() + " " + this);
            } catch (InterruptedException e) {
                System.out.println("sleep() interrupted");
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        for(int i = 0;i < 10;i++){
            Thread daemon = new Thread(new SimpleDaemons());
            daemon.setDaemon(true);
            daemon.start();
        }
        System.out.println("All Daemons started");
        TimeUnit.MILLISECONDS.sleep(175);
    }
}
```

在每次的循环中会创建10个线程，并把每个线程设置为后台线程，然后开始运行，for循环会进行十次，然后输出信息，随后主线程睡眠一段时间后停止运行。在每次run 循环中，都会打印当前线程的信息，主线程运行完毕，程序就执行完毕了。因为 `daemon` 是后台线程，无法影响主线程的执行。

但是当你把 `daemon.setDaemon(true)` 去掉时，while(true) 会进行无限循环，那么主线程一直在执行最重要的任务，所以会一直循环下去无法停止。

### ThreadFactory

按需要创建线程的对象。使用线程工厂替换了 Thread 或者 Runnable 接口的硬连接，使程序能够使用特殊的线程子类，优先级等。一般的创建方式为

```java
class SimpleThreadFactory implements ThreadFactory {
  public Thread newThread(Runnable r) {
    return new Thread(r);
  }
}
```

> Executors.defaultThreadFactory 方法提供了一个更有用的简单实现，它在返回之前将创建的线程上下文设置为已知值

ThreadFactory 是一个接口，它只有一个方法就是创建线程的方法

```java
public interface ThreadFactory {

    // 构建一个新的线程。实现类可能初始化优先级，名称，后台线程状态和 线程组等
    Thread newThread(Runnable r);
}
```

下面来看一个 ThreadFactory 的例子

```java
public class DaemonThreadFactory implements ThreadFactory {

    @Override
    public Thread newThread(Runnable r) {
        Thread t = new Thread(r);
        t.setDaemon(true);
        return t;
    }
}

public class DaemonFromFactory implements Runnable{

    @Override
    public void run() {
        while (true){
            try {
                TimeUnit.MILLISECONDS.sleep(100);
                System.out.println(Thread.currentThread() + " " + this);
            } catch (InterruptedException e) {
                System.out.println("Interrupted");
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        ExecutorService service = Executors.newCachedThreadPool(new DaemonThreadFactory());
        for(int i = 0;i < 10;i++){
            service.execute(new DaemonFromFactory());
        }
        System.out.println("All daemons started");
        TimeUnit.MILLISECONDS.sleep(500);
    }
}
```

`Executors.newCachedThreadPool` 可以接受一个线程池对象，创建一个根据需要创建新线程的线程池，但会在它们可用时重用先前构造的线程，并在需要时使用提供的ThreadFactory创建新线程。

```java
public static ExecutorService newCachedThreadPool(ThreadFactory threadFactory) {
  return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                60L, TimeUnit.SECONDS,
                                new SynchronousQueue<Runnable>(),
                                threadFactory);
}
```

### 加入一个线程

一个线程可以在其他线程上调用 `join()` 方法，其效果是等待一段时间直到第二个线程结束才正常执行。如果某个线程在另一个线程 t 上调用 t.join() 方法，此线程将被挂起，直到目标线程 t 结束才回复(可以用 t.isAlive() 返回为真假判断)。

也可以在调用 join 时带上一个超时参数，来设置到期时间，时间到期，join方法自动返回。

对 join 的调用也可以被中断，做法是在线程上调用 `interrupted` 方法，这时需要用到 try...catch 子句

```java
public class TestJoinMethod extends Thread{

    @Override
    public void run() {
        for(int i = 0;i < 5;i++){
            try {
                TimeUnit.MILLISECONDS.sleep(1000);
            } catch (InterruptedException e) {
                System.out.println("Interrupted sleep");
            }
            System.out.println(Thread.currentThread() + " " + i);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        TestJoinMethod join1 = new TestJoinMethod();
        TestJoinMethod join2 = new TestJoinMethod();
        TestJoinMethod join3 = new TestJoinMethod();

        join1.start();
//        join1.join();

        join2.start();
        join3.start();
    }
}
```

join() 方法等待线程死亡。 换句话说，它会导致当前运行的线程停止执行，直到它加入的线程完成其任务。

### 线程异常捕获

由于线程的本质，使你不能捕获从线程中逃逸的异常，一旦异常逃出任务的run 方法，它就会向外传播到控制台，除非你采取特殊的步骤捕获这种错误的异常，在 Java5 之前，你可以通过线程组来捕获，但是在 Java5 之后，就需要用 Executor 来解决问题，因为线程组不是一次好的尝试。

下面的任务会在 run 方法的执行期间抛出一个异常，并且这个异常会抛到 run 方法的外面，而且 main 方法无法对它进行捕获

```java
public class ExceptionThread implements Runnable{

    @Override
    public void run() {
        throw new RuntimeException();
    }

    public static void main(String[] args) {
        try {
            ExecutorService service = Executors.newCachedThreadPool();
            service.execute(new ExceptionThread());
        }catch (Exception e){
            System.out.println("eeeee");
        }
    }
}
```

为了解决这个问题，我们需要修改 Executor 产生线程的方式，Java5 提供了一个新的接口 `Thread.UncaughtExceptionHandler` ，它允许你在每个 Thread 上都附着一个异常处理器。`Thread.UncaughtExceptionHandler.uncaughtException()` 会在线程因未捕获临近死亡时被调用。

```java
public class ExceptionThread2 implements Runnable{

    @Override
    public void run() {
        Thread t = Thread.currentThread();
        System.out.println("run() by " + t);
        System.out.println("eh = " + t.getUncaughtExceptionHandler());
      
      	// 手动抛出异常
        throw new RuntimeException();
    }
}

// 实现Thread.UncaughtExceptionHandler 接口，创建异常处理器
public class MyUncaughtExceptionHandler implements Thread.UncaughtExceptionHandler{

    @Override
    public void uncaughtException(Thread t, Throwable e) {
        System.out.println("caught " + e);
    }
}

public class HandlerThreadFactory implements ThreadFactory {

    @Override
    public Thread newThread(Runnable r) {
        System.out.println(this + " creating new Thread");
        Thread t = new Thread(r);
        System.out.println("created " + t);
        t.setUncaughtExceptionHandler(new MyUncaughtExceptionHandler());
        System.out.println("ex = " + t.getUncaughtExceptionHandler());
        return t;
    }
}

public class CaptureUncaughtException {

    public static void main(String[] args) {
        ExecutorService service = Executors.newCachedThreadPool(new HandlerThreadFactory());
        service.execute(new ExceptionThread2());
    }
}
```

在程序中添加了额外的追踪机制，用来验证工厂创建的线程会传递给`UncaughtExceptionHandler`，你可以看到，未捕获的异常是通过 `uncaughtException ` 来捕获的。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


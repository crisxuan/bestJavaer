# 并发编程入门

## 并发历史

在计算机最早期的时候，没有操作系统，执行程序只需要一种方式，那就是从头到尾依次执行。任何资源都会为这个程序服务，在计算机使用某些资源时，其他资源就会空闲，就会存在 `浪费资源` 的情况。

>这里说的浪费资源指的是资源空闲，没有充分使用的情况。

操作系统的出现为我们的程序带来了 `并发性`，操作系统使我们的程序能够同时运行多个程序，一个程序就是一个进程，也就相当于同时运行多个进程。

操作系统是一个`并发系统`，并发性是操作系统非常重要的特征，操作系统具有同时处理和调度多个程序的能力，比如多个 I/O 设备同时在输入输出；设备 I/O 和 CPU 计算同时进行；内存中同时有多个系统和用户程序被启动交替、穿插地执行。操作系统在协调和分配进程的同时，操作系统也会为不同进程分配不同的资源。

操作系统实现多个程序同时运行解决了单个程序无法做到的问题，主要有下面三点

* `资源利用率`，我们上面说到，单个进程存在资源浪费的情况，举个例子，当你在为某个文件夹赋予权限的时候，输入程序无法接受外部的输入字符，只有等到权限赋予完毕后才能接受外部输入。总的来讲，就是在等待程序时无法执行其他工作。如果在等待程序时可以运行另一个程序，那么将会大大提高资源的利用率。（资源并不会觉得累）因为它不会划水～
* `公平性`，不同的用户和程序都能够使用计算机上的资源。一种高效的运行方式是为不同的程序划分时间片来使用资源，但是有一点需要注意，操作系统可以决定不同进程的优先级。虽然每个进程都有能够公平享有资源的权利，但是当有一个进程释放资源后的同时有一个优先级更高的进程抢夺资源，就会造成优先级低的进程无法获得资源，进而导致进程饥饿。
* `便利性`，单个进程是是不用通信的，通信的本质就是`信息交换`，及时进行信息交换能够避免`信息孤岛`，做重复性的工作；任何并发能做的事情，单进程也能够实现，只不过这种方式效率很低，它是一种`顺序性`的。

但是，顺序编程（也称为`串行编程`）也不是`一无是处`的，串行编程的优势在于其**直观性和简单性**，客观来讲，串行编程更适合我们人脑的思考方式，但是我们并不会满足于顺序编程，**we want it more!!!** 。资源利用率、公平性和便利性促使着进程出现的同时，也促使着`线程`的出现。

如果你还不是很理解进程和线程的区别的话，那么我就以我多年操作系统的经验（吹牛逼，实则半年）来为你解释一下：**进程是一个应用程序，而线程是应用程序中的一条顺序流**。

<img src="https://s1.ax1x.com/2020/08/30/dboOnU.png" alt="001" border="0">

进程中会有多个线程来完成一些任务，这些任务有可能相同有可能不同。每个线程都有自己的执行顺序。

<img src="https://s1.ax1x.com/2020/08/30/dbTPc6.png" alt="002" border="0">

每个线程都有自己的栈空间，这是线程私有的，还有一些其他线程内部的和线程共享的资源，如下所示。

>在计算机中，一般堆栈指的就是栈，而堆指的才是堆

线程会共享进程范围内的资源，例如内存和文件句柄，但是每个线程也有自己私有的内容，比如程序计数器、栈以及局部变量。下面汇总了进程和线程共享资源的区别

<img src="https://s1.ax1x.com/2020/08/30/dbT991.png" alt="003" border="0">

线程是一种`轻量级`的进程，轻量级体现在线程的创建和销毁要比进程的开销小很多。

>注意：任何比较都是相对的。

在大多数现代操作系统中，都以线程为基本的调度单位，所以我们的视角着重放在对`线程`的探究。

## 线程

### 什么是多线程

多线程意味着你能够在同一个应用程序中运行多个线程，我们知道，指令是在 CPU 中执行的，多线程应用程序就像是具有多个 CPU 在同时执行应用程序的代码。

<img src="https://s1.ax1x.com/2020/08/30/dbTShR.png" alt="004" border="0">

其实这是一种假象，线程数量并不等于 CPU 数量，单个 CPU 将在多个线程之间共享 CPU 的时间片，在给定的时间片内执行每个线程之间的切换，每个线程也可以由不同的 CPU 执行，如下图所示

<img src="https://s1.ax1x.com/2020/08/30/dbTC1x.png" alt="005" border="0">

### 并发和并行的关系

`并发`意味着应用程序会执行多个的任务，但是如果计算机只有一个 CPU 的话，那么应用程序无法同时执行多个的任务，但是应用程序又需要执行多个任务，所以计算机在开始执行下一个任务之前，它并没有完成当前的任务，只是把状态暂存，进行任务切换，CPU 在多个任务之间进行切换，直到任务完成。如下图所示

<img src="https://s1.ax1x.com/2020/08/30/dbozN9.png" alt="006" border="0">

`并行`是指应用程序将其任务分解为较小的子任务，这些子任务可以并行处理，例如在多个CPU上同时进行。

<img src="https://s1.ax1x.com/2020/08/30/dboqXT.png" alt="007" border="0">

### 优势和劣势

合理使用线程是一门艺术，合理编写一道准确无误的多线程程序更是一门艺术，如果线程使用得当，能够有效的降低程序的开发和维护成本。

Java 很好的在用户空间实现了开发工具包，并在内核空间提供系统调用来支持多线程编程，Java 支持了丰富的类库 `java.util.concurrent` 和跨平台的`内存模型`，同时也提高了开发人员的门槛，并发一直以来是一个高阶的主题，但是现在，并发也成为了主流开发人员的必备素质。

虽然线程带来的好处很多，但是编写正确的多线程（并发）程序是一件极困难的事情，并发程序的 Bug 往往会诡异地出现又诡异的消失，在当你认为没有问题的时候它就出现了，`难以定位` 是并发程序的一个特征，所以在此基础上你需要有扎实的并发基本功。那么，并发为什么会出现呢？

### 并发为什么会出现

计算机世界的快速发展离不开 CPU、内存和 I/O 设备的高速发展，但是这三者一直存在速度差异性问题，我们可以从存储器的层次结构可以看出

<img src="https://s1.ax1x.com/2020/08/30/dboxAJ.png" alt="008" border="0">

CPU 内部是寄存器的构造，寄存器的访问速度要高于`高速缓存`，高速缓存的访问速度要高于内存，最慢的是磁盘访问。

程序是在内存中执行的，程序里大部分语句都要访问内存，有些还需要访问 I/O 设备，根据漏桶理论来说，程序整体的性能取决于最慢的操作也就是磁盘访问速度。

因为 CPU 速度太快了，所以为了发挥 CPU 的速度优势，平衡这三者的速度差异，计算机体系机构、操作系统、编译程序都做出了贡献，主要体现为：

* CPU 使用缓存来中和和内存的访问速度差异
* 操作系统提供进程和线程调度，让 CPU 在执行指令的同时分时复用线程，让内存和磁盘不断交互，不同的 `CPU 时间片` 能够执行不同的任务，从而均衡这三者的差异
* 编译程序提供优化指令的执行顺序，让缓存能够合理的使用

我们在享受这些便利的同时，多线程也为我们带来了挑战，下面我们就来探讨一下并发问题为什么会出现以及多线程的源头是什么

### 线程带来的安全性问题

线程安全性是非常复杂的，在没有采用`同步机制`的情况下，多个线程中的执行操作往往是不可预测的，这也是多线程带来的挑战之一，下面我们给出一段代码，来看看安全性问题体现在哪

```java
public class TSynchronized implements Runnable{

    static int i = 0;

    public void increase(){
        i++;
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
        System.out.println("i = " + i);
    }
}
```

这段程序输出后会发现，i 的值每次都不一样，这不符合我们的预测，那么为什么会出现这种情况呢？我们先来分析一下程序的运行过程。

`TSynchronized` 实现了 Runnable 接口，并定义了一个静态变量 `i`，然后在 `increase` 方法中每次都增加 i 的值，在其实现的 run 方法中进行循环调用，共执行 1000 次。

#### 可见性问题

在单核 CPU 时代，所有的线程共用一个 CPU，CPU 缓存和内存的一致性问题容易解决，CPU 和 内存之间

如果用图来表示的话我想会是下面这样

<img src="https://s1.ax1x.com/2020/08/30/dboXBF.png" alt="009" border="0">

在多核时代，因为有多核的存在，每个核都能够独立的运行一个线程，每颗 CPU 都有自己的缓存，这时 CPU 缓存与内存的数据一致性就没那么容易解决了，当多个线程在不同的 CPU 上执行时，这些线程操作的是不同的 CPU 缓存

<img src="https://s1.ax1x.com/2020/08/30/dboj74.png" alt="010" border="0">



因为 i 是静态变量，没有经过任何线程安全措施的保护，多个线程会并发修改 i 的值，所以我们认为 i 不是线程安全的，导致这种结果的出现是由于 aThread 和 bThread 中读取的 i 值彼此不可见，所以这是由于 `可见性` 导致的线程安全问题。

####原子性问题

看起来很普通的一段程序却因为两个线程 `aThread` 和 `bThread` 交替执行产生了不同的结果。但是根源不是因为创建了两个线程导致的，多线程只是产生线程安全性的必要条件，最终的根源出现在 `i++` 这个操作上。

这个操作怎么了？这不就是一个给 i 递增的操作吗？也就是 **i++ => i = i + 1**，这怎么就会产生问题了？

因为 `i++` 不是一个 `原子性` 操作，仔细想一下，i++ 其实有三个步骤，读取 i 的值，执行 i + 1 操作，然后把 i + 1 得出的值重新赋给 i（将结果写入内存）。

当两个线程开始运行后，每个线程都会把 i 的值读入到 CPU 缓存中，然后执行 + 1 操作，再把 + 1 之后的值写入内存。因为线程间都有各自的虚拟机栈和程序计数器，他们彼此之间没有数据交换，所以当 aThread 执行 + 1 操作后，会把数据写入到内存，同时 bThread 执行 + 1 操作后，也会把数据写入到内存，因为 CPU 时间片的执行周期是不确定的，所以会出现当 aThread 还没有把数据写入内存时，bThread 就会读取内存中的数据，然后执行 + 1操作，再写回内存，从而覆盖 i 的值，导致 aThread 所做的努力白费。

<img src="https://s1.ax1x.com/2020/09/20/woUWHf.png" alt="011" border="0">

为什么上面的线程切换会出现问题呢？

我们先来考虑一下正常情况下（即不会出现线程安全性问题的情况下）两条线程的执行顺序

<img src="https://s1.ax1x.com/2020/09/20/woa929.png" alt="012" border="0">

可以看到，当 aThread 在执行完整个 i++ 的操作后，操作系统对线程进行切换，由 aThread -> bThread，这是最理想的操作，一旦操作系统在任意 `读取/增加/写入` 阶段产生线程切换，都会产生线程安全问题。例如如下图所示

<img src="https://s1.ax1x.com/2020/09/20/woap8J.png" alt="013" border="0">

最开始的时候，内存中 i = 0，aThread 读取内存中的值并把它读取到自己的寄存器中，执行 +1 操作，此时发生线程切换，bThread 开始执行，读取内存中的值并把它读取到自己的寄存器中，此时发生线程切换，线程切换至 aThread 开始运行，aThread 把自己寄存器的值写回到内存中，此时又发生线程切换，由 aThread -> bThread，线程 bThread 把自己寄存器的值 +1 然后写回内存，写完后内存中的值不是 2 ，而是 1， 内存中的 i 值被覆盖了。

我们上面提到 `原子性` 这个概念，那么什么是原子性呢？

> 并发编程的原子性操作是完全独立于任何其他进程运行的操作，原子操作多用于现代操作系统和并行处理系统中。
>
> 原子操作通常在内核中使用，因为内核是操作系统的主要组件。但是，大多数计算机硬件，编译器和库也提供原子性操作。
>
> 在加载和存储中，计算机硬件对存储器字进行读取和写入。为了对值进行匹配、增加或者减小操作，一般通过原子操作进行。在原子操作期间，处理器可以在同一数据传输期间完成读取和写入。 这样，其他输入/输出机制或处理器无法执行存储器读取或写入任务，直到原子操作完成为止。

简单来讲，就是**原子操作要么全部执行，要么全部不执行**。数据库事务的原子性也是基于这个概念演进的。

#### 有序性问题

在并发编程中还有带来让人非常头疼的 `有序性` 问题，有序性顾名思义就是顺序性，在计算机中指的就是指令的先后执行顺序。一个非常显而易见的例子就是 JVM 中的`类加载`

<img src="https://s1.ax1x.com/2020/09/20/woUx5F.png" alt="014" border="0">

这是一个 JVM 加载类的过程图，也称为类的生命周期，类从加载到 JVM 到卸载一共会经历五个阶段 **加载、连接、初始化、使用、卸载**。这五个过程的执行顺序是一定的，但是在连接阶段，也会分为三个过程，即 **验证、准备、解析** 阶段，这三个阶段的执行顺序不是确定的，通常交叉进行，在一个阶段的执行过程中会激活另一个阶段。

有序性问题一般是编译器带来的，编译器有的时候确实是 **好心办坏事**，它为了优化系统性能，往往更换指令的执行顺序。

#### 活跃性问题

多线程还会带来`活跃性`问题，如何定义活跃性问题呢？活跃性问题关注的是 **某件事情是否会发生**。

**如果一组线程中的每个线程都在等待一个事件的发生，而这个事件只能由该组中正在等待的线程触发，这种情况会导致死锁**。

简单一点来表述一下，就是每个线程都在等待其他线程释放资源，而其他资源也在等待每个线程释放资源，这样没有线程抢先释放自己的资源，这种情况会产生死锁，所有线程都会无限的等待下去。

**死锁的必要条件**

造成死锁的原因有四个，破坏其中一个即可破坏死锁

* 互斥条件：指进程对所分配到的资源进行排它性使用，即在一段时间内某资源只由一个进程占用。如果此时还有其它进程请求资源，则请求者只能等待，直至占有资源的进程释放。
* 请求和保持条件：指进程已经保持至少一个资源，但又提出了新的资源请求，而该资源已被其它进程占有，此时请求进程阻塞，但又对自己已获得的其它资源保持占有。
* 不剥夺条件：指进程已获得的资源，在未使用完之前，不能被剥夺，只能在使用完时由自己释放。
* 循环等待：指在发生死锁时，必然存在一个进程对应的环形链。

换句话说，死锁线程集合中的每个线程都在等待另一个死锁线程占有的资源。但是由于所有线程都不能运行，它们之中任何一个资源都无法释放资源，所以没有一个线程可以被唤醒。

如果说死锁很`痴情`的话，那么`活锁`用一则成语来表示就是 `弄巧成拙`。

某些情况下，当线程意识到它不能获取所需要的下一个锁时，就会尝试礼貌的释放已经获得的锁，然后等待非常短的时间再次尝试获取。可以想像一下这个场景：当两个人在狭路相逢的时候，都想给对方让路，相同的步调会导致双方都无法前进。

现在假想有一对并行的线程用到了两个资源。它们分别尝试获取另一个锁失败后，两个线程都会释放自己持有的锁，再次进行尝试，这个过程会一直进行重复。很明显，这个过程中没有线程阻塞，但是线程仍然不会向下执行，这种状况我们称之为 `活锁(livelock)`。

如果我们期望的事情一直不会发生，就会产生活跃性问题，比如单线程中的无限循环

```java
while(true){...}

for(;;){}
```

在多线程中，比如 aThread 和 bThread 都需要某种资源，aThread 一直占用资源不释放，bThread 一直得不到执行，就会造成活跃性问题，bThread 线程会产生`饥饿`，我们后面会说。

#### 性能问题

与活跃性问题密切相关的是 `性能` 问题，如果说活跃性问题关注的是最终的结果，那么性能问题关注的就是造成结果的过程，性能问题有很多方面：比如**服务时间过长，吞吐率过低，资源消耗过高**，在多线程中这样的问题同样存在。

在多线程中，有一个非常重要的性能因素那就是我们上面提到的 `线程切换`，也称为 `上下文切换(Context Switch)`，这种操作开销很大。

>在计算机世界中，老外都喜欢用 context 上下文这个词，这个词涵盖的内容很多，包括上下文切换的资源，寄存器的状态、程序计数器等。context switch 一般指的就是这些上下文切换的资源、寄存器状态、程序计数器的变化等。

在上下文切换中，会保存和恢复上下文，丢失局部性，把大量的时间消耗在线程切换上而不是线程运行上。

为什么线程切换会开销如此之大呢？线程间的切换会涉及到以下几个步骤

<img src="https://s1.ax1x.com/2020/09/20/woaSC4.png" alt="015" border="0">

将 CPU 从一个线程切换到另一线程涉及挂起当前线程，保存其状态，例如寄存器，然后恢复到要切换的线程的状态，加载新的程序计数器，此时线程切换实际上就已经完成了；此时，CPU 不在执行线程切换代码，进而执行新的和线程关联的代码。

### 引起线程切换的几种方式

线程间的切换一般是操作系统层面需要考虑的问题，那么引起线程上下文切换有哪几种方式呢？或者说线程切换有哪几种诱因呢？主要有下面几种引起上下文切换的方式

* 当前正在执行的任务完成，系统的 CPU 正常调度下一个需要运行的线程
* 当前正在执行的任务遇到 I/O 等阻塞操作，线程调度器挂起此任务，继续调度下一个任务。
* 多个任务并发抢占锁资源，当前任务没有获得锁资源，被线程调度器挂起，继续调度下一个任务。
* 用户的代码挂起当前任务，比如线程执行 sleep 方法，让出CPU。
* 使用硬件中断的方式引起上下文切换

## 线程安全性

在 Java 中，要实现线程安全性，必须要正确的使用线程和锁，但是这些只是满足线程安全的一种方式，要编写正确无误的线程安全的代码，其核心就是对状态访问操作进行管理。最重要的就是最 `共享(Shared)`的 和 `可变(Mutable)`的状态。只有共享和可变的变量才会出现问题，私有变量不会出现问题，参考`程序计数器`。

对象的状态可以理解为存储在实例变量或者静态变量中的数据，共享意味着某个变量可以被多个线程同时访问、可变意味着变量在生命周期内会发生变化。一个变量是否是线程安全的，取决于它是否被多个线程访问。要使变量能够被安全访问，必须通过同步机制来对变量进行修饰。

如果不采用同步机制的话，那么就要避免多线程对共享变量的访问，主要有下面两种方式

* 不要在多线程之间共享变量
* 将共享变量置为不可变的

我们说了这么多次线程安全性，那么什么是线程安全性呢？

### 什么是线程安全性

多个线程可以同时安全调用的代码称为线程安全的，如果一段代码是安全的，那么这段代码就不存在 `竞态条件`。仅仅当多个线程共享资源时，才会出现竞态条件。

根据上面的探讨，我们可以得出一个简单的结论：**当多个线程访问某个类时，这个类始终都能表现出正确的行为，那么就称这个类是线程安全的**。

单线程就是一个线程数量为 1 的多线程，单线程一定是线程安全的。读取某个变量的值不会产生安全性问题，因为不管读取多少次，这个变量的值都不会被修改。

### 原子性

我们上面提到了原子性的概念，你可以把`原子性`操作想象成为一个`不可分割` 的整体，它的结果只有两种，要么全部执行，要么全部回滚。你可以把原子性认为是 `婚姻关系` 的一种，男人和女人只会产生两种结果，`好好的` 和 `说散就散`，一般男人的一生都可以把他看成是原子性的一种，当然我们不排除`时间管理(线程切换)`的个例，我们知道线程切换必然会伴随着安全性问题，男人要出去浪也会造成两种结果，这两种结果分别对应安全性的两个结果：线程安全（好好的）和线程不安全（说散就散）。

### 竞态条件

有了上面的线程切换的功底，那么竞态条件也就好定义了，它指的就是**两个或多个线程同时对一共享数据进行修改，从而影响程序运行的正确性时，这种就被称为竞态条件(race condition)** ，线程切换是导致竞态条件出现的诱导因素，我们通过一个示例来说明，来看一段代码

```java
public class RaceCondition {
  
  private Signleton single = null;
  public Signleton newSingleton(){
    if(single == null){
      single = new Signleton();
    }
    return single;
  }
  
}
```

在上面的代码中，涉及到一个竞态条件，那就是判断 `single` 的时候，如果 single 判断为空，此时发生了线程切换，另外一个线程执行，判断 single 的时候，也是空，执行 new 操作，然后线程切换回之前的线程，再执行 new 操作，那么内存中就会有两个 Singleton 对象。

### 加锁机制

在 Java 中，有很多种方式来对共享和可变的资源进行加锁和保护。Java 提供一种内置的机制对资源进行保护：`synchronized` 关键字，它有三种保护机制

* 对方法进行加锁，确保多个线程中只有一个线程执行方法；
* 对某个对象实例（在我们上面的探讨中，变量可以使用对象来替换）进行加锁，确保多个线程中只有一个线程对对象实例进行访问；
* 对类对象进行加锁，确保多个线程只有一个线程能够访问类中的资源。

synchronized 关键字对资源进行保护的代码块俗称 `同步代码块(Synchronized Block)`，例如

```java
synchronized(lock){
  // 线程安全的代码
}
```

每个 Java 对象都可以用做一个实现同步的锁，这些锁被称为 `内置锁(Instrinsic Lock)`或者 `监视器锁(Monitor Lock)`。线程在进入同步代码之前会自动获得锁，并且在退出同步代码时自动释放锁，而无论是通过正常执行路径退出还是通过异常路径退出，获得内置锁的唯一途径就是进入这个由锁保护的同步代码块或方法。

synchronized 的另一种隐含的语义就是 `互斥`，互斥意味着`独占`，最多只有一个线程持有锁，当线程 A 尝试获得一个由线程 B 持有的锁时，线程 A 必须等待或者阻塞，直到线程 B 释放这个锁，如果线程 B 不释放锁的话，那么线程 A 将会一直等待下去。

线程 A 获得线程 B 持有的锁时，线程 A 必须等待或者阻塞，但是获取锁的线程 B 可以重入，重入的意思可以用一段代码表示

```java
public class Retreent {
  
  public synchronized void doSomething(){
    doSomethingElse();
    System.out.println("doSomething......");
  }
  
  public synchronized void doSomethingElse(){
    System.out.println("doSomethingElse......");
}
```

获取 doSomething() 方法锁的线程可以执行 doSomethingElse() 方法，执行完毕后可以重新执行 doSomething() 方法中的内容。锁重入也支持子类和父类之间的重入，具体的我们后面会进行介绍。

`volatile` 是一种轻量级的 `synchronized`，也就是一种轻量级的加锁方式，volatile 通过保证共享变量的可见性来从侧面对对象进行加锁。可见性的意思就是当一个线程修改一个共享变量时，另外一个线程能够 `看见` 这个修改的值。volatile 的执行成本要比 `synchronized` 低很多，因为 volatile 不会引起线程的上下文切换。

<img src="https://s1.ax1x.com/2020/09/20/woUvUU.png" alt="016" border="0">

我们还可以使用`原子类` 来保证线程安全，原子类其实就是 `rt.jar` 下面以 `atomic` 开头的类

<img src="https://s1.ax1x.com/2020/08/30/dbT8Hg.png" alt="017" border="0">

除此之外，我们还可以使用 `java.util.concurrent` 工具包下的线程安全的集合类来确保线程安全，具体的实现类和其原理我们后面会说。

可以使用不同的并发模型来实现并发系统，并发模型说的是系统中的线程如何协作完成并发任务。不同的并发模型以不同的方式拆分任务，线程可以以不同的方式进行通信和协作。

## 竞态条件和关键区域

竞态条件是在关键代码区域发生的一种特殊条件。关键区域是由多个线程同时执行的代码部分，关键区域中的代码执行顺序会对造成不一样的结果。如果多个线程执行一段关键代码，而这段关键代码会因为执行顺序不同而造成不同的结果时，那么这段代码就会包含竞争条件。

## 并发模型和分布式系统很相似

并发模型其实和分布式系统模型非常相似，在并发模型中是`线程`彼此进行通信，而在分布式系统模型中是 `进程` 彼此进行通信。然而本质上，进程和线程也非常相似。这也就是为什么并发模型和分布式模型非常相似的原因。

分布式系统通常要比并发系统面临更多的挑战和问题比如进程通信、网络可能出现异常，或者远程机器挂掉等等。但是一个并发模型同样面临着比如 CPU 故障、网卡出现问题、硬盘出现问题等。

因为并发模型和分布式模型很相似，因此他们可以相互借鉴，例如用于线程分配的模型就类似于分布式系统环境中的负载均衡模型。

其实说白了，分布式模型的思想就是借鉴并发模型的基础上推演发展来的。

## 认识两个状态

并发模型的一个重要的方面是，线程是否应该`共享状态`，是具有`共享状态`还是`独立状态`。共享状态也就意味着在不同线程之间共享某些状态

状态其实就是`数据`，比如一个或者多个对象。当线程要共享数据时，就会造成 `竞态条件` 或者 `死锁` 等问题。当然，这些问题只是可能会出现，具体实现方式取决于你是否安全的使用和访问共享对象。

<img src="https://s1.ax1x.com/2020/08/30/dbTYNj.png" alt="019" border="0">

独立的状态表明状态不会在多个线程之间共享，如果线程之间需要通信的话，他们可以访问不可变的对象来实现，这是最有效的避免并发问题的一种方式，如下图所示

<img src="https://s1.ax1x.com/2020/08/30/dbTJEQ.png" alt="018" border="0">

使用独立状态让我们的设计更加简单，因为只有一个线程能够访问对象，即使交换对象，也是不可变的对象。

## 并发模型

### 并行 Worker

第一个并发模型是并行 worker 模型，客户端会把任务交给 `代理人(Delegator)`，然后由代理人把工作分配给不同的 `工人(worker)`。如下图所示

<img src="https://s1.ax1x.com/2020/09/20/woUquq.png" alt="020" border="0">

并行 worker 的核心思想是，它主要有两个进程即代理人和工人，Delegator 负责接收来自客户端的任务并把任务下发，交给具体的 Worker 进行处理，Worker 处理完成后把结果返回给 Delegator，在 Delegator 接收到 Worker 处理的结果后对其进行汇总，然后交给客户端。

并行 Worker 模型是 Java 并发模型中非常常见的一种模型。许多 `java.util.concurrent` 包下的并发工具都使用了这种模型。

#### 并行 Worker 的优点

并行 Worker 模型的一个非常明显的特点就是很容易理解，为了提高系统的并行度你可以增加多个 Worker 完成任务。

并行 Worker 模型的另外一个好处就是，它会将一个任务拆分成多个小任务，并发执行，Delegator 在接受到 Worker 的处理结果后就会返回给 Client，整个 Worker -> Delegator -> Client 的过程是`异步`的。

#### 并行 Worker 的缺点

同样的，并行 Worker 模式同样会有一些隐藏的缺点

**共享状态会变得很复杂**

实际的并行 Worker 要比我们图中画出的更复杂，主要是并行 Worker 通常会访问内存或共享数据库中的某些共享数据。

<img src="https://s1.ax1x.com/2020/09/20/woUHvn.png" alt="021" border="0">

这些共享状态可能会使用一些工作队列来保存业务数据、数据缓存、数据库的连接池等。在线程通信中，线程需要确保共享状态是否能够让其他线程共享，而不是仅仅停留在 CPU 缓存中让自己可用，当然这些都是程序员在设计时就需要考虑的问题。线程需要避免 `竞态条件`，`死锁` 和许多其他共享状态造成的并发问题。

多线程在访问共享数据时，会丢失并发性，因为操作系统要保证只有一个线程能够访问数据，这会导致共享数据的争用和抢占。未抢占到资源的线程会 `阻塞`。

现代的非阻塞并发算法可以减少争用提高性能，但是非阻塞算法比较难以实现。

`可持久化的数据结构(Persistent data structures)` 是另外一个选择。可持久化的数据结构在修改后始终会保留先前版本。因此，如果多个线程同时修改一个可持久化的数据结构，并且一个线程对其进行了修改，则修改的线程会获得对新数据结构的引用。

虽然可持久化的数据结构是一个新的解决方法，但是这种方法实行起来却有一些问题，比如，一个持久列表会将新元素添加到列表的开头，并返回所添加的新元素的引用，但是其他线程仍然只持有列表中先前的第一个元素的引用，他们看不到新添加的元素。

持久化的数据结构比如 `链表(LinkedList)` 在硬件性能上表现不佳。列表中的每个元素都是一个对象，这些对象散布在计算机内存中。现代 CPU 的顺序访问往往要快的多，因此使用数组等顺序访问的数据结构则能够获得更高的性能。CPU 高速缓存可以将一个大的矩阵块加载到高速缓存中，并让 CPU 在加载后直接访问 CPU 高速缓存中的数据。对于链表，将元素分散在整个 RAM 上，这实际上是不可能的。

**无状态的 worker**

共享状态可以由其他线程所修改，因此，worker 必须在每次操作共享状态时重新读取，以确保在副本上能够正确工作。不在线程内部保持状态的 worker 成为无状态的 worker。

**作业顺序是不确定的**

并行工作模型的另一个缺点是作业的顺序不确定，无法保证首先执行或最后执行哪些作业。任务 A 在任务 B 之前分配给 worker，但是任务 B 可能在任务 A 之前执行。

### 流水线

第二种并发模型就是我们经常在生产车间遇到的 `流水线并发模型`，下面是流水线设计模型的流程图

<img src="https://s1.ax1x.com/2020/09/20/woU7gs.png" alt="022" border="0">

这种组织架构就像是工厂中装配线中的 worker，每个 worker 只完成全部工作的一部分，完成一部分后，worker 会将工作转发给下一个 worker。

每道程序都在自己的线程中运行，彼此之间不会共享状态，这种模型也被称为无共享并发模型。

使用流水线并发模型通常被设计为`非阻塞I/O`，也就是说，当没有给 worker 分配任务时，worker 会做其他工作。非阻塞I/O 意味着当 worker 开始 I/O 操作，例如从网络中读取文件，worker 不会等待 I/O 调用完成。因为 I/O 操作很慢，所以等待 I/O 非常耗费时间。在等待 I/O 的同时，CPU 可以做其他事情，I/O 操作完成后的结果将传递给下一个 worker。下面是非阻塞 I/O 的流程图

<img src="https://s1.ax1x.com/2020/09/20/woUoCQ.png" alt="023" border="0">

在实际情况中，任务通常不会按着一条装配线流动，由于大多数程序需要做很多事情，因此需要根据完成的不同工作在不同的 worker 之间流动，如下图所示

<img src="https://s1.ax1x.com/2020/09/20/woUT3j.png" alt="024" border="0">

任务还可能需要多个 worker 共同参与完成

<img src="https://s1.ax1x.com/2020/09/20/woU54g.png" alt="025" border="0">

#### 响应式 - 事件驱动系统

使用流水线模型的系统有时也被称为 `响应式` 或者 `事件驱动系统`，这种模型会根据外部的事件作出响应，事件可能是某个 HTTP 请求或者某个文件完成加载到内存中。

#### Actor 模型

在 Actor 模型中，每一个 Actor 其实就是一个 Worker， 每一个 Actor 都能够处理任务。

简单来说，Actor 模型是一个并发模型，它定义了一系列系统组件应该如何动作和交互的通用规则，最著名的使用这套规则的编程语言是 Erlang。一个参与者`Actor`对接收到的消息做出响应，然后可以创建出更多的 Actor 或发送更多的消息，同时准备接收下一条消息。

<img src="https://s1.ax1x.com/2020/09/20/woU4US.png" alt="026" border="0">

#### Channels 模型

在 Channel 模型中，worker 通常不会直接通信，与此相对的，他们通常将事件发送到不同的 `通道(Channel)`上，然后其他 worker 可以在这些通道上获取消息，下面是 Channel 的模型图

<img src="https://s1.ax1x.com/2020/09/20/woURDP.png" alt="027" border="0">

有的时候 worker 不需要明确知道接下来的 worker 是谁，他们只需要将作者写入通道中，监听 Channel 的 worker 可以订阅或者取消订阅，这种方式降低了 worker 和 worker 之间的耦合性。

#### 流水线设计的优点

与并行设计模型相比，流水线模型具有一些优势，具体优势如下

**不会存在共享状态**

因为流水线设计能够保证 worker 在处理完成后再传递给下一个 worker，所以 worker 与 worker 之间不需要共享任何状态，也就无需考虑并发问题。你甚至可以在实现上把每个 worker 看成是单线程的一种。

**有状态 worker**

因为 worker 知道没有其他线程修改自身的数据，所以流水线设计中的 worker 是有状态的，有状态的意思是他们可以将需要操作的数据保留在内存中，有状态通常比无状态更快。

**更好的硬件整合**

因为你可以把流水线看成是单线程的，而单线程的工作优势在于它能够和硬件的工作方式相同。因为有状态的 worker 通常在 CPU 中缓存数据，这样可以更快地访问缓存的数据。

**使任务更加有效的进行**

可以对流水线并发模型中的任务进行排序，一般用来日志的写入和恢复。

#### 流水线设计的缺点

流水线并发模型的缺点是任务会涉及多个 worker，因此可能会分散在项目代码的多个类中。因此很难确定每个 worker 都在执行哪个任务。流水线的代码编写也比较困难，设计许多嵌套回调处理程序的代码通常被称为 `回调地狱`。回调地狱很难追踪 debug。

## 函数性并行

函数性并行模型是最近才提出的一种并发模型，它的基本思路是使用函数调用来实现。消息的传递就相当于是函数的调用。传递给函数的参数都会被拷贝，因此在函数之外的任何实体都无法操纵函数内的数据。这使得函数执行类似于`原子`操作。每个函数调用都可以独立于任何其他函数调用执行。

当每个函数调用独立执行时，每个函数都可以在单独的 CPU 上执行。这也就是说，函数式并行并行相当于是各个 CPU 单独执行各自的任务。

JDK 1.7 中的 `ForkAndJoinPool` 类就实现了函数性并行的功能。Java 8 提出了 stream 的概念，使用并行流也能够实现大量集合的迭代。

函数性并行的难点是要知道函数的调用流程以及哪些 CPU 执行了哪些函数，跨 CPU 函数调用会带来额外的开销。

我们之前说过，线程就是进程中的一条`顺序流`，在 Java 中，每一条 Java 线程就像是 JVM 的一条顺序流，就像是虚拟 CPU 一样来执行代码。Java 中的 `main()` 方法是一条特殊的线程，JVM 创建的 main 线程是一条`主执行线程`，在 Java 中，方法都是由 main 方法发起的。在 main 方法中，你照样可以创建其他的`线程`(执行顺序流)，这些线程可以和 main 方法共同执行应用代码。

Java 线程也是一种对象，它和其他对象一样。Java 中的 Thread 表示线程，Thread 是 `java.lang.Thread` 类或其子类的实例。那么下面我们就来一起探讨一下在 Java 中如何创建和启动线程。

## 创建并启动线程

在 Java 中，创建线程的方式主要有三种

* 通过继承 `Thread` 类来创建线程
* 通过实现 `Runnable` 接口来创建线程
* 通过 `Callable` 和 `Future` 来创建线程

下面我们分别探讨一下这几种创建方式

### 继承 Thread 类来创建线程

第一种方式是继承 Thread 类来创建线程，如下示例

```java
public class TJavaThread extends Thread{

    static int count;

    @Override
    public synchronized void run() {
        for(int i = 0;i < 10000;i++){
            count++;
        }
    }

    public static void main(String[] args) throws InterruptedException {

        TJavaThread tJavaThread = new TJavaThread();
        tJavaThread.start();
        tJavaThread.join();
        System.out.println("count = " + count);
    }
}
```

线程的主要创建步骤如下

* 定义一个线程类使其继承 Thread 类，并重写其中的 run 方法，run 方法内部就是线程要完成的任务，因此 run 方法也被称为 `执行体`
* 创建了 Thread 的子类，上面代码中的子类是 `TJavaThread`
* 启动方法需要注意，并不是直接调用 `run` 方法来启动线程，而是使用 `start ` 方法来启动线程。当然 run 方法可以调用，这样的话就会变成普通方法调用，而不是新创建一个线程来调用了。

```java
public static void main(String[] args) throws InterruptedException {

  TJavaThread tJavaThread = new TJavaThread();
  tJavaThread.run();
  System.out.println("count = " + count);
}
```

这样的话，整个 main 方法只有一条执行线程也就是 main 线程，由两条执行线程变为一条执行线程

<img src="https://s1.ax1x.com/2020/09/20/woU2ut.png" alt="028" border="0">

Thread 构造器只需要一个 Runnable 对象，调用 Thread 对象的 start() 方法为该线程执行必须的初始化操作，然后调用 Runnable 的 run 方法，以便在这个线程中启动任务。我们上面使用了线程的 `join` 方法，它用来等待线程的执行结束，如果我们不加 join 方法，它就不会等待 tJavaThread 的执行完毕，输出的结果可能就不是 `10000`

<img src="https://s1.ax1x.com/2020/09/20/woUhE8.png" alt="029" border="0">

可以看到，在 run  方法还没有结束前，run 就被返回了。也就是说，程序不会等到 run 方法执行完毕就会执行下面的指令。

使用继承方式创建线程的优势：编写比较简单；可以使用 `this` 关键字直接指向当前线程，而无需使用 `Thread.currentThread()` 来获取当前线程。

使用继承方式创建线程的劣势：在 Java 中，只允许单继承（拒绝肛精说使用内部类可以实现多继承）的原则，所以使用继承的方式，子类就不能再继承其他类。

### 使用 Runnable 接口来创建线程

相对的，还可以使用 `Runnable` 接口来创建线程，如下示例

```java
public class TJavaThreadUseImplements implements Runnable{

    static int count;

    @Override
    public synchronized void run() {
        for(int i = 0;i < 10000;i++){
            count++;
        }
    }

    public static void main(String[] args) throws InterruptedException {

        new Thread(new TJavaThreadUseImplements()).start();
        System.out.println("count = " + count);
    }

}
```

线程的主要创建步骤如下

* 首先定义 Runnable 接口，并重写 Runnable 接口的 run 方法，run 方法的方法体同样是该线程的线程执行体。
* 创建线程实例，可以使用上面代码这种简单的方式创建，也可以通过 new 出线程的实例来创建，如下所示

```java
TJavaThreadUseImplements tJavaThreadUseImplements = new TJavaThreadUseImplements();
new Thread(tJavaThreadUseImplements).start();
```

* 再调用线程对象的 start 方法来启动该线程。

线程在使用实现 `Runnable` 的同时也能实现其他接口，非常适合多个相同线程来处理同一份资源的情况，体现了面向对象的思想。

使用 Runnable 实现的劣势是编程稍微繁琐，如果要访问当前线程，则必须使用 `Thread.currentThread()` 方法。

### 使用 Callable 接口来创建线程

Runnable 接口执行的是独立的任务，Runnable 接口不会产生任何返回值，如果你希望在任务完成后能够返回一个值的话，那么你可以实现 `Callable` 接口而不是 Runnable 接口。Java SE5 引入了 Callable 接口，它的示例如下

```java
public class CallableTask implements Callable {

    static int count;
    public CallableTask(int count){
        this.count = count;
    }

    @Override
    public Object call() {
        return count;
    }

    public static void main(String[] args) throws ExecutionException, InterruptedException {

        FutureTask<Integer> task = new FutureTask((Callable<Integer>) () -> {
            for(int i = 0;i < 1000;i++){
                count++;
            }
            return count;
        });
        Thread thread = new Thread(task);
        thread.start();

        Integer total = task.get();
        System.out.println("total = " + total);
    }
}
```

我想，使用 Callable 接口的好处你已经知道了吧，既能够实现多个接口，也能够得到执行结果的返回值。Callable 和 Runnable 接口还是有一些区别的，主要区别如下

* Callable 执行的任务有返回值，而 Runnable 执行的任务没有返回值
* Callable（重写）的方法是 call 方法，而 Runnable（重写）的方法是 run 方法。
* call 方法可以抛出异常，而 Runnable 方法不能抛出异常

### 使用线程池来创建线程

首先先来认识一下顶级接口 `Executor`，Executor 虽然不是传统线程创建的方式之一，但是它却成为了创建线程的替代者，使用线程池的好处如下

* 利用线程池能够复用线程、控制最大并发数。
* 实现任务线程队列`缓存策略`和`拒绝机制`。
* 实现某些与时间相关的功能，如定时执行、周期执行等。
* 隔离线程环境。比如，交易服务和搜索服务在同一台服务器上，分别开启两个线程池，交易线程的资源消耗明显要大；因此，通过配置独立的线程池，将较慢的交易服务与搜索服务隔开，避免个服务线程互相影响。

你可以使用如下操作来替换线程创建

```java
new Thread(new(RunnableTask())).start()

// 替换为
  
Executor executor = new ExecutorSubClass() // 线程池实现类;
executor.execute(new RunnableTask1());
executor.execute(new RunnableTask2());
```

`ExecutorService` 是 Executor 的默认实现，也是 Executor 的扩展接口，ThreadPoolExecutor 类提供了线程池的扩展实现。`Executors` 类为这些 Executor 提供了方便的工厂方法。下面是使用 ExecutorService 创建线程的几种方式

#### CachedThreadPool

从而简化了并发编程。Executor 在客户端和任务之间提供了一个间接层；与客户端直接执行任务不同，这个中介对象将执行任务。Executor 允许你管理`异步`任务的执行，而无须显示地管理线程的生命周期。

```java
public static void main(String[] args) {
  ExecutorService service = Executors.newCachedThreadPool();
  for(int i = 0;i < 5;i++){
    service.execute(new TestThread());
  }
  service.shutdown();
}
```

`CachedThreadPool` 会为每个任务都创建一个线程。

> 注意：ExecutorService 对象是使用静态的 `Executors` 创建的，这个方法可以确定 Executor 类型。对 `shutDown` 的调用可以防止新任务提交给 ExecutorService ，这个线程在 Executor 中所有任务完成后退出。

#### FixedThreadPool

FixedThreadPool 使你可以使用`有限`的线程集来启动多线程

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

SingleThreadExecutor 就是`线程数量为 1 `的 FixedThreadPool，如果向 SingleThreadPool 一次性提交了多个任务，那么这些任务将会排队，每个任务都会在下一个任务开始前结束，所有的任务都将使用相同的线程。SingleThreadPool 会序列化所有提交给他的任务，并会维护它自己(隐藏)的悬挂队列。

```java
public static void main(String[] args) {
  ExecutorService service = Executors.newSingleThreadExecutor();
  for(int i = 0;i < 5;i++){
    service.execute(new TestThread());
  }
  service.shutdown();
}
```

从输出的结果就可以看到，任务都是挨着执行的。我为任务分配了五个线程，但是这五个线程不像是我们之前看到的有换进换出的效果，它每次都会先执行完自己的那个线程，然后余下的线程继续`走完`这条线程的执行路径。你可以用 SingleThreadExecutor 来确保任意时刻都只有唯一一个任务在运行。

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

上面提到线程调度器对每个线程的执行都是不可预知的，随机执行的，那么有没有办法告诉线程调度器哪个任务想要优先被执行呢？你可以通过设置线程的优先级状态，告诉线程调度器哪个线程的执行优先级比较高，**请给这个骑手马上派单**，线程调度器倾向于让优先级较高的线程优先执行，然而，这并不意味着优先级低的线程得不到执行，也就是说，优先级不会导致死锁的问题。优先级较低的线程只是执行频率较低。

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

尽管 JDK 有 10 个优先级，但是一般只有**MAX_PRIORITY，NORM_PRIORITY，MIN_PRIORITY** 三种级别。

### 作出让步

我们上面提过，如果知道一个线程已经在 run() 方法中运行的差不多了，那么它就可以给线程调度器一个提示：我已经完成了任务中最重要的部分，可以让给别的线程使用 CPU 了。这个暗示将通过 yield() 方法作出。

> 有一个很重要的点就是，Thread.yield() 是建议执行切换CPU，而不是强制执行CPU切换。

对于任何重要的控制或者在调用应用时，都不能依赖于 `yield() `方法，实际上， yield() 方法经常被滥用。

### 后台线程

`后台(daemon) `线程，是指运行时在后台提供的一种服务线程，这种线程不是属于必须的。当所有非后台线程结束时，程序也就停止了，**同时会终止所有的后台线程。**反过来说，只要有任何非后台线程还在运行，程序就不会终止。

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

在每次的循环中会创建 10 个线程，并把每个线程设置为后台线程，然后开始运行，for 循环会进行十次，然后输出信息，随后主线程睡眠一段时间后停止运行。在每次 run 循环中，都会打印当前线程的信息，主线程运行完毕，程序就执行完毕了。因为 `daemon` 是后台线程，无法影响主线程的执行。

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

`ThreadFactory `是一个接口，它只有一个方法就是创建线程的方法

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

`Executors.newCachedThreadPool` 可以接受一个线程池对象，创建一个根据需要创建新线程的线程池，但会在它们可用时重用先前构造的线程，并在需要时使用提供的 ThreadFactory 创建新线程。

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

由于线程的本质，使你不能捕获从线程中逃逸的异常，一旦异常逃出任务的 run 方法，它就会向外传播到控制台，除非你采取特殊的步骤捕获这种错误的异常，在 Java5 之前，你可以通过线程组来捕获，但是在 Java 5 之后，就需要用 Executor 来解决问题，因为线程组不是一次好的尝试。

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


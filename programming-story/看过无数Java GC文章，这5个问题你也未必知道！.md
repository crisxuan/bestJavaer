读者朋友们可能已经看过太多关于Java垃圾回收相关的文章，如果没有，墙裂安利大家看下面这篇：
[看完这篇垃圾回收，和面试官扯皮没问题了](https://mp.weixin.qq.com/s/8vXENzg580R7F2iNjSdHFw)

本文不再重复谈GC算法以及垃圾回收器，而是谈谈在GC发生的时候，有几个可能被忽略的问题。搞懂这些问题，相信将对GC的理解能再加深几分。

## 本文主要内容
```
- Q1: GC工作是如何发起的？
- Q2: Stop The World到底如何让Java线程都停下来？
- Q3: 如何找到GC Roots？
- Q4: GC时如何处理四种特殊引用？
- Q5: 对象移动后，引用如何修正？
```

## Q1: GC工作是如何发起的？
垃圾回收针对不同的分区又分为MinorGC和FullGC，不同分区的触发条件又有不同。总体来说GC的触发分为主动和被动两类：
- 主动：程序显示调用System.gc()发起GC（不一定马上甚至不会GC）
- 被动：内存分配失败，需要清理空间

无论上面哪种情况，GC的发起的方式都是一致的：
- Step1：需要GC的线程发起一个`VM_Operation`操作（这是一个基类，不同垃圾回收器发起各自的子类操作，如CMS收集器发起的是VM_GenCollectFullConcurrent）
- Step2：该操作投递到一个队列中，JVM中有一个`VMThread`线程专门处理队列中的这些操作请求，该线程调用VM_Operation的`evaluate`函数来处理具体每一个操作。
- Step3: VM_Operation的evaluate函数调用自身的`doit`虚函数
- Step4: 各垃圾回收器派生的VM_Operation子类覆盖doit方法，实现各自的垃圾回收处理工作，一个典型的C++多态的使用。


## Q2: Stop The World到底如何让Java线程都停下来？
相信大家都听说过STW，在执行垃圾回收的时候，需要将所有工作中的Java线程停下来，这样做的原因，借用上面那篇文章中的一句话：
> 为啥在垃圾收集期间其他工作线程会被挂起？想象一下，你一边在收垃圾，另外一群人一边丢垃圾，垃圾能收拾干净吗?

**那这些Java线程到底是如何停下来的呢？**

首先肯定不是垃圾回收线程去执行`suspend`来将他们挂起的，想想为什么呢？

停下来可不是让线程可以停在任何地方，因为接下来要进行的GC会导致堆区的对象进行“迁徙”，如果停的不合适，线程醒过来后对这些对象的操作将出现无法预期的错误。

那停在哪里合适呢？由此引申出另一个重要的概念：**安全点**，进入安全点的线程意味着不会改变引用的关系。

执行安全点同步是由前文所述的VMThread发起，在处理VM_Operation之前进行进入安全点同步，处理完成之后，撤销安全点同步。

```cpp
void VMThread::loop() {
  while (true) {
    ...
    _cur_vm_operation = _vm_queue->remove_next();
    ...
    // 安全点同步开始
    SafepointSynchronize::begin();
    // 处理当前VM_Operation
    evaluate_operation(_cur_vm_operation);
    ...
    // 安全点同步结束
    SafepointSynchronize::begin();
    ...
  }
  ...
}
```
需要注意的是，上面VMThread的工作线程中，并非处理所有的VMOpration都会执行安全点的同步工作，会根据VMOpration的情况处理，为求清晰简单，上述代码中略去了这些逻辑。

一个Java线程可能处于不同的状态，在HotSpot中，根据线程所处在不同的状态，让其进入安全点的方式也不尽相同。在HotSpot源码中有一大段注释对其进行了专门的说明：

![](https://imgkr.cn-bj.ufileos.com/5dc7cc90-96fc-4ce1-8a57-594a3532acb7.png)

### 1、解释执行字节码状态
JVM虚拟机的执行过程简单理解就是一个超大的switch case，不断取出字节码然后执行该字节码对应的代码（这只是一个简化模型）。那JVM中肯定有一张用于记录字节码和其对应代码块信息的表，这个表叫`DispatchTable`，长这样：

![](https://imgkr.cn-bj.ufileos.com/526251de-ec27-4d6f-98ef-5709a32dbc37.png)

实际上，JVM内部有两张这样的表，一张正常状态下的，一张需要进入安全点的。

![](https://imgkr.cn-bj.ufileos.com/bcb7de03-1b08-4256-a378-d9f2f388a017.png)

在进入安全点的代码中，其中有一项工作就是替换上面生效的字节码派遣表：

![](https://imgkr.cn-bj.ufileos.com/0019d4c3-8f10-403c-a995-d17a7f23c2ec.png)

恢复：
![](https://imgkr.cn-bj.ufileos.com/23f0ad74-906d-4720-8493-d83c17fc3e01.png)

替换后的字节码派遣表`DispatchTable`中的代码将会添加安全点的检查代码，这里不再展开。

### 2、执行native代码状态
对于正在进行JNI调用的线程，SafepointSynchronize::begin中不需要特别的操作。执行native代码的Java线程，从JNI接口返回时将会主动去检查是否需要挂起自己。

![](https://imgkr.cn-bj.ufileos.com/02a29cea-0061-45c0-b12d-60e5aacd9d7c.png)


### 3、执行编译后代码状态
现代绝大多数的JVM都用上了一种即时编译技术JIT，在执行过程中为加快速度，通常以方法函数为粒度对热点执行代码编译为本地机器指令的技术。

简单来说就是发现某个函数在反复执行，或者函数内某个代码块循环次数很多，决定将其直接编译成本地代码，不再通过中间字节码解释执行。

这种情况下，不再通过通过中间字节码执行，当然也就不会走字节码派遣表，所以第一种情况下的替换字节码派遣表的方式对执行这种代码对线程就起不到作用了。那怎么办呢？


在HotSpot中采取了一种称为`主动式中断`的方式让线程进入安全点，**具体来说就是在JVM中有一个内存页面，线程在工作的平时会时不时的瞅一眼（读一下）这个页面，正常情况下是一切正常。而在执行GC之前，JVM中的内务总管VMthread会提前将这个内存页面的访问属性为不可读，这时，其他工作线程再去读这个页面，将触发内存访问异常，JVM提前安装好的异常捕获器这时就能接管各线程的执行流程，做一些GC前的准备后，接着block，将线程挂起。**

```cpp
// Roll all threads forward to a safepoint 
// and suspend them all
void SafepointSynchronize::begin() {
  ...
  os::make_polling_page_unreadable();
  ...
}
```
调用`os::make_polling_page_unreadable()`使得polling page变成不可读，该函数根据不同操作系统平台有不同的实现，以常见的Linux和Windows分别为例：

Linux：
```cpp
void os::make_polling_page_unreadable(void) {
  if (!guard_memory((char*)_polling_page, 
    Linux::page_size())) {
    fatal("Could not disable polling page");
  }
}

bool os::guard_memory(char* addr, size_t size) {
  return linux_mprotect(addr, size, PROT_NONE);
}

static bool linux_mprotect(char* addr, size_t size, int prot) {
  char* bottom = (char*)align_down((intptr_t)addr, os::Linux::page_size());
  assert(addr == bottom, "sanity check");
  size = align_up(pointer_delta(addr, bottom, 1) + size, os::Linux::page_size());
  return ::mprotect(bottom, size, prot) == 0;
}
```
最终调用系统级API：mprotect完成对内存页面的属性设置，熟悉Linux C/C++编程的朋友应该不会陌生。


Windows：
```cpp
void os::make_polling_page_unreadable(void) {
  DWORD old_status;
  if (!VirtualProtect((char *)_polling_page, 
    os::vm_page_size(),
    PAGE_NOACCESS, 
    &old_status)) {
    fatal("Could not disable polling page");
  }
}
```
最终调用系统级API：VirtualProtect完成对内存页面的属性设置，熟悉Windows C/C++编程的朋友应该不会陌生。

这个特殊的页面在哪里？
位于runtime/os类中的静态成员变量。
![](https://imgkr.cn-bj.ufileos.com/cb686c28-20ec-4ee9-9b21-2a40bba87d73.png)

### 4、被阻塞状态
因为IO、锁同步等原因被阻塞的线程，在GC完成之前将一直阻塞，不会醒来。

### 5、在VM或处于状态切换中
一个Java线程大部分的时间都在解释执行Java字节码，也会在部分场景下由JVM本身拿到执行权。当线程处在这些特殊时刻时，JVM在切换线程的状态时也将主动检查安全点的状态。


## Q3: 如何找到GC Roots？
### GC Roots都是谁？
GC的时候一般通过可达性分析算法找出还有价值的对象，将他们复制保留，剩下的不在追溯链中的对象将被清理消灭。可达性分析算法的起点是一组称为GC Roots的东西，那么`GC Roots都是些什么东西？它们在哪里？`
- 虚拟机栈（栈帧中的本地变量表）中引用的对象
- 方法区中类静态属性引用的对象
- 方法区中常量引用的对象
- 本地方法栈中 JNI（即一般说的 Native 方法）引用的对象

现在知道了它们是谁，也知道在哪里。但GC的时候如何去找到它们呢？就拿第一个栈中引用的对象举例，JVM中动辄几十个线程在运行，每个线程嵌套的函数栈帧少则十几层，多则几十上百层，该如何去把这些所有线程中存在的引用都找出来，能够想象这将是一件耗时耗力的工程。而且要知道，执行GC的时候，是Stop The World了，时间宝贵，需要尽快完成GC，减轻因为垃圾回收造成的进程响应中断，后边还要进行对象引用链追溯、对象的复制拷贝等等工作，所以，留给GC Roots遍历的时间并不多。

包括HotSpot在内的现代Java虚拟机采取了用空间换时间的策略，核心思想很简单：`提前将GC Roots的位置信息记录起来，GC的时候，按图索骥，快速找到它们`。

那么问题来了，这些位置信息存在哪里？又是什么样的数据结构？线程在不断执行，引用关系也在不断变化，这些信息如何更新？

### OopMap的引出
回答这几个问题之前，让我们暂且忘记GC Roots这回事，先思考另外一个问题: 
> JVM线程在扫描Java栈时，发现一个64bit的数字0x0007ff3080345600，JVM如何知道这是一个指向Java堆中对象的地址（即一个引用）还是说这仅仅是一个long型的变量而已？

众所周知，Java这门语言比起C/C++最大的一个变革之一就是摆脱了烦人的指针，解放程序员，不再需要用指针去管理内存。然而实际上，摆脱只是表面的摆脱，JVM毕竟是用C++写出来的东西，与其说Java没有指针，某种角度上来说，Java里处处都是指针。只不过在Java中，我们换了一个表达：引用。

需要补充说明下的是，在早期的一些JVM实现中，引用本身只是一个句柄值，是对象地址表中的一个索引值。现代JVM的引用不再采用这种方式，而是使用直接指针的方式。关于这个问题，在本文的`Q6:对象移动后，引用如何修正？`还将进一步阐述。

回到刚刚的问题，为什么JVM需要知道一个64bit的数据是一个引用还是一个long型变量？答案是如果它不知道的话，如何进行内存回收呢？

由此引出另一组名词：保守式GC和准确式GC。
- 保守式GC：虚拟机不能明确分辨上面说的问题，无法知道栈中的哪些是引用，采用保守的态度，如果一个数据看上去像是一个对象指针（比如这个数字指向堆区，那个位置刚好有一个对象头部），那么这种情况下就将其当作一个引用。这样把可能不是引用的也当成了引用，现实点的说就是懒政，这种情况下是可能产生漏网之鱼没有被垃圾回收的（想想为什么？）
- 准确式GC：相比保守式GC，这种就是明确的知道一个64bit的数字它是一个long还是一个对象的引用。现代商业JVM均采用这种更先进的方式，这种JVM能够清清楚楚的知道栈中和对象的结构中每一个地址单元里装的是什么东西，不会错杀，更不会漏杀。

那么，准确式GC是如何知道的这么清除呢？答案是JVM将这些内存中的数据信息做了记录，在HotSpot中，这些数据叫**OopMap**。

回答上一小节中最后那个问题，GC Roots的位置信息也就是在OopMap中。

### OopMap长啥样？


![](https://imgkr.cn-bj.ufileos.com/e81cb0c9-ea99-49a0-bb11-68a1d80a51eb.png)

![](https://imgkr.cn-bj.ufileos.com/ddde04d7-6ecb-4e64-8ddb-847614d8c322.png)

![](https://imgkr.cn-bj.ufileos.com/2eae12b7-3e1c-494f-9c23-52df80846df4.png)


### OopMap数据如何生成？
HotSpot源码中关于OopMap相关数据的创建代码分散在各个地方，可以通过在源码目录下搜索`new OopMap`关键字找到它们，通过初步的阅读，可以看到在函数的返回，异常的跳转，循环的跳转等地方都有它们的身影，在这些时刻，JVM将记录OopMap相关信息供后续GC时使用。


## Q4: GC时如何处理四种特殊引用？
任何一篇关于GC的文章都会告诉我们：<u><b>通过可达性算法从GC Roots出发找出没有引用的对象</b></u>。但这里的`引用`并没有那么简单。

通常我们所说的Java引用是指的强引用，除此之外还有一些引用：
- `强引用`：默认直接指向new出来的对象
- `软引用`：SoftReference
- `弱引用`：WeakReference
- `虚引用`：PhantomReference，也叫幽灵引用

下面先对上述几种引用做一个简单的介绍，默认的强引用就不说了：

### 软引用

> 软引用是用来描述一些还有用但并非必须的对象。对于软引用关联着的对象，在系统将要发生内存溢出异常之前，将会把这些对象列进回收范围进行第二次回收。如果这次回收还没有足够的内存，才会抛出内存溢出异常。
————摘自《深入理解Java虚拟机》

总结一下就是：如果一个对象A现在只剩一个SoftReference对象还在引用它，正常情况下内存够用的时候不会清理A的。但如果内存吃紧，那对不起，就要拿你开刀，清理A了。这也是软引用之所以“`软`”的体现。


### 弱引用
> 弱引用也是用来描述非必须对象的，他的强度比软引用更弱一些，被弱引用关联的对象，在垃圾回收时，如果这个对象只被弱引用关联（没有任何强引用关联他），那么这个对象就会被回收。
————摘自《深入理解Java虚拟机》

弱引用比软引用能力更弱，弱到即使是在内存够用的情况下，如果对象A只被一个WeakReference对象引用，那么对不起，也要拿你开刀。这也是弱引用之所以“`弱`”的体现。


### 虚引用
> 一个对象是否有虚引用的存在，完全不会对其生存时间构成影响，也无法通过虚引用来获取一个对象的实例。为一个对象设置虚引用关联的唯一目的就是能在这个对象被收集器回收时收到一个系统通知。
————摘自《深入理解Java虚拟机》

这位比上面弱引用更弱，甚至某种程度上来说它根本算不上引用，因为不像上面两位可以通过get方法获取到原始的引用，将get方法覆盖后返回null：

```java
public class PhantomReference<T> extends Reference<T> {
  public T get() {
    return null;
  }
}
```

### Final引用

除了上面四种，还有一种特殊的引用叫FinalReference，该引用用于支持覆盖了finalizer方法的类对象被清理前执行finalizer方法。

上面几种引用的定义在HotSpot源码中如下：

![](https://imgkr.cn-bj.ufileos.com/f450c218-99c3-49ac-a6c9-2ff91fe73ac2.png)


### 清理策略

那么JVM在执行GC的时候又是如何区别对待这些特殊类型的引用呢？

在HotSpot中，不管哪种垃圾回收器，在通过GC Roots遍历完所有的引用之后，在执行对象清理之前，都会调用`ReferenceProcessor::process_discovered_references`函数对找到需要清理的引用进行处理，这一点通过这个函数的名字也能看得出来。

而在调用这个函数之前，还有一个步骤：调用ReferenceProcessor::setup_policy设置处理策略。

![](https://imgkr.cn-bj.ufileos.com/17550f06-dc1c-45e0-a96c-3c251eb85a4a.png)


函数逻辑很简单，通过bool参数always_clear来确定当前使用`_always_clear_soft_ref_policy`还是使用`_default_soft_ref_policy`。

从名字可以看出一个是始终清理软引用，一个是默认策略，来看一下这两个策略分别是什么：

![](https://imgkr.cn-bj.ufileos.com/f16f2679-3699-47d9-8476-06373a8fc8ed.png)

首先是始终清理策略，就是`AlwaysClearPolicy`

然后是默认策略，如果当前运行是server模式，则选择`LRUMaxHeapPolicy`，否则在client模式下选择`LRUCurrentHeapPolicy`。

ReferencePolicy是一个基类，核心的虚函数`should_clear_reference`用于外界判断是否清理对应的引用。在HotSpot提供了四个子类用于引用的处理策略：

![](https://imgkr.cn-bj.ufileos.com/df917b0f-b384-407e-8c1d-ddfed3812d18.png)

- `NeverClearPolicy`: 从不清理
- `AlwaysClearPolicy`: 总是清理
- `LRUCurrentHeapPolicy`: 最近未使用即清理（根据当前堆空间剩余来评估最近时间）
- `LRUMaxHeapPolicy`: 最近未使用即清理（根据最大可使用堆空间剩余来评估最近时间）

那到底setup_policy设置处理策略时`always_clear`是true还是false呢？因为这直接决定后续选择针对软引用的处理策略是`LRUCurrentHeapPolicy/LRUMaxHeapPolicy`还是`AlwaysClearPolicy`。

关于这一点，在HotSpot源码中，不同垃圾回收器处理稍有不同，但总体来说绝大多数场景下`always_clear`参数都是false，只有在多次分配内存的尝试均以失败告终时，才会尝试将其置为true，将软引用清理掉以释放更多的空间。

请记住上面这些策略，策略的选择将会影响后面对软引用的处理方式。


### 对特殊引用的处理逻辑分析

回到`process_discoverd_references`函数，来看一下这个函数的内容：

![](https://imgkr.cn-bj.ufileos.com/bb653f31-b594-477d-8f3f-149c676e2681.png)

通过变量的名称和注释不难看出，该函数内部依次调用`process_discovered_reflist`完成对Soft、Weak、Final、Phantom四类特殊引用的处理。

这个函数声明如下：
![](https://imgkr.cn-bj.ufileos.com/9e38f092-2865-4245-838e-a6208031e92c.png)

重点关注下第二个参数policy和第三个参数clear_referent。
回头看看上面对该函数的调用中传递的参数：
|      引用类型     | policy | clear_referent |
| ---------------- | -----  | -------------- |
| SoftReference    | 非空    |     true       |
| WeakReference    | NULL   |     true       |
| FinalReference   | NULL   |     false      |
| PhantomReference | NULL   |     true       |

不同的参数将决定四种引用不同的命运。

进一步到`process_discovered_reflist`里边看看，该函数内部对引用的处理分为了3个阶段，我们一个个看，首先是第一阶段：

**第一阶段：处理软引用**

![](https://imgkr.cn-bj.ufileos.com/0f2aa3ea-001b-4aa5-87ae-7745976e5dc3.png)

![](https://imgkr.cn-bj.ufileos.com/9ee2ab54-f4ba-4d5a-90f6-dac7d3a02e94.png)

从注释可以看出，第一阶段只针对软引用SoftReference，结合上面的表格，只有处理软引用时，policy参数非空。

而在真正执行处理的`process_phase1`函数中，遍历所有软引用，对于不再存活的对象，通过前面提到的策略中的`process_discovered_references`函数来判断该引用是需要保留还是从待清理的列表中移除。


**第二阶段：剔除还存活的对象**

这个阶段主要工作是将那些指向对象还活着（还有其他强引用在指向它）的引用都从待清理列表中移除：

![](https://imgkr.cn-bj.ufileos.com/c90580a2-94a7-4262-8c5b-e1ed754f5ef4.png)


**第三阶段：切断剩余引用指向的对象**

![](https://imgkr.cn-bj.ufileos.com/f219262c-2144-47a3-a433-44ce96b8ee86.png)
到了第三阶段，则根据外部传入的`clear_referent`参数来决定对该引用是从待清理列表移除还是保留。

再次回顾下上面的表格，对于Weak、Soft、Phantom三类引用，参数clear_referent是true，意味着到了最后这个阶段，该保留的都保留了，剩下的全是要消灭的。于是在这个函数中，将剩下的这些引用中的referent字段置为null，至此，对象与这些特殊引用之间的最后一丝联系也被切断，在随后的GC中将难逃厄运。

而针对Final引用，这个参数是false，第三阶段还不会将其与对象断开。断开的时机是在执行finalizer方法后再进行。因此在本轮GC中，一个覆盖了finalizer方法的类对象将暂时保住了生命。

### 小结
看到这里，估计大家有点乱，又是这么多种类型引用，又是这么多个处理阶段，头都转运了。别怕，轩辕君第一次看的时候也是这样，即便是现在动手来写这篇文章，也是反复品味源码，调研认证后才梳理清楚。

接下来我们对每一种类型的引用在各个阶段中的情况梳理一下：
- **软引用**
  - 第一阶段：对于已经不再存活的对象，根据策略判定是否要从待清理列表移除
  - 第二阶段：将指向对象还存活的引用从待清理列表移除
  - 第三阶段：如果第一阶段的清理策略决定清理软引用，则到第三阶段将剩下的软引用置空，切断与对象最后的联系；如果第一阶段的清理策略决定不清理软引用，则到第三阶段，待清理列表为空，软引用得以保留。
  - `结论`：`一个只被软引用指向的对象，何时被清理，取决于清理策略，究其根源，取决于当前堆空间的使用情况`
- **弱引用**
  - 第一阶段：无处理，第一阶段只处理软引用
  - 第二阶段：将指向对象还存活的引用从待清理列表移除
  - 第三阶段：剩下的弱引用指向对象均不再存活，将弱引用置空，切断与对象最后的联系
  - `结论`：`一个只被弱引用指向的对象，第一次GC就被清理`
- **虚引用**
  - 第一阶段：无处理，第一阶段只处理软引用
  - 第二阶段：将指向对象还存活的引用从待清理列表移除
  - 第三阶段：剩下的虚引用指向对象均不再存活，将弱引用置空，切断与对象最后的联系
  - `结论`：`一个只被虚引用指向的对象，第一次GC就被清理`


## Q5: 对象移动后，引用如何修正？
目前为止我们都知道，垃圾回收的过程将伴随着对象的“迁徙”，而一旦对象“搬家”之后，之前指向它的所有引用（包括栈里的引用、堆里对象的成员变量引用等等）都将失效。而之所以GC后我们的程序仍然能够照常运行无误，是因为JVM在这背后做了不少工作，好让我们的程序看起来只是短暂的STW了一下，醒了之后就像什么也没发生过一样，该干嘛干嘛。

自然而然的我们能想到这个问题：**对象移动后，引用如何修正？**

回答这个问题之前，先来看看在Java中，引用到底是如何“指向”对象的。
在JVM的发展历史中，出现了两种方案：

### 方案一：句柄
引用本身不直接指向对象，对象的地址存在一个表格中，引用本身只是这个表中表项的索引值。这里引用一下《深入理解Java虚拟机》一书中的配图：

![](https://imgkr.cn-bj.ufileos.com/b9f9a8c3-70f3-4513-8283-781a43c7e33e.png)

这种思想其实很多地方都有用到，对于Windows平台开发的朋友不会陌生，不管是Windows的窗口，还是内核对象（Mutex、Event等）都是在内核中进行描述管理，为求安全，不会直接暴露内核对象的地址，应用层只能得到一个句柄值，通过这个句柄进行交互。

Linux平台的文件描述符也是这种思想的体现。
甚至于现代操作系统使用的虚拟内存地址也是如此，内存地址并不是物理内存的地址，而是需要经过地址译码表转换。

这种方法的好处显而易见，对象移动后，所有的引用本身不需修正，只需要修正这个表格中对应的对象地址即可。

弊端同样也是显而易见，对于对象的访问需要经过一次“翻译转换”，性能上会打折扣。


### 方案二：直接指针
第二种方案就是直接指针的方式，没有中间商赚差价，引用本身就是一个指针。再次引用一下《深入理解Java虚拟机》一书中的配图：

![](https://imgkr.cn-bj.ufileos.com/b480708a-c988-4bc0-88fd-3e7b9e65d6d9.png)

和第一种方式相对比，二者的优势和弊端进行交换。

优势：访问对象更直接，性能上更快。
弊端：对象移动后，引用的修复工作麻烦。

以HotSpot为代表的的现代商业JVM选择了直接指针的方式进行对象访问定位。

这种方式下就需要对所有存在的引用值进行修改，工作量不可谓不大。

好在，在本文第三节`Q3:如何找到GC Roots？`中介绍的**OopMap**再一次扮演了救世主的身份。

OopMap中存储的信息可以告诉JVM，哪些地方有引用，这份关键的信息，不仅用于寻找GC Roots进行垃圾回收，同时也是用于对引用进行修正的重要指南。



## 参考链接：
### RednaxelaFX：[找出栈上的指针/引用](https://www.iteye.com/blog/rednaxelafx-1044951)


## 写在最后
希望大家看完这篇文章不仅仅知道GC本身是怎么一回事，还能对GC的台前幕后的工作能多一分了解，这样在和面试官谈到GC的时候，就可以谈笑风生~多战几个回合

当然，限于笔者技术水平有限，万字长文写作费劲，文中若有行文错误和技术论述错误的地方，请一定指出，以便及时勘误，谢谢大家。

如果觉得这篇文章有点用， 就帮我点个在看吧，再次谢谢大家。

## 往期热门回顾

[Python一键转Jar包，Java调用Python新姿势！](https://mp.weixin.qq.com/s/BEYQF305cWAOIwK2DtvyfQ)

[一个Java对象的回忆录：垃圾回收](https://mp.weixin.qq.com/s/xp2S4_3UQTZ0TOIlVqM8uw)

[内核地址空间大冒险3：权限管理](https://mp.weixin.qq.com/s/WkQ5mVZrF7V2GrU-rsPOdQ)

[谁动了你的HTTPS流量？](https://mp.weixin.qq.com/s/lxpHhHVIh6DktoHzrRLaKA)

[路由器里的广告秘密](https://mp.weixin.qq.com/s/7gM31s4-hTJTprJnxsHgEA)

[内核地址空间大冒险2：中断与异常](https://mp.weixin.qq.com/s/0b5e1_vwyvw8WOOHbVcQyQ)

[DDoS攻击：无限战争](https://mp.weixin.qq.com/s/JTr1-5nPtseAYXfvJdamVg)

[一条SQL注入引出的惊天大案](https://mp.weixin.qq.com/s/lerhjpAEdp4RiwsmetyqPg)

[内核地址空间大冒险：系统调用](https://mp.weixin.qq.com/s/esc9gWg42vyPkT58HCKNgg)

[一个HTTP数据包的奇幻之旅](https://mp.weixin.qq.com/s/suzicCzb2g5b8NN71S5Ngw)

[一个DNS数据包的惊险之旅](https://mp.weixin.qq.com/s/_TOFIPGIeMHhVxIVToxmiQ)

[我是一个流氓软件线程](https://mp.weixin.qq.com/s/-ggUa3aWkjjHjr9VwQL9TQ)

### <center>扫码关注，更多精彩</center>
---
![](https://imgkr.cn-bj.ufileos.com/3dcbdef6-e56c-4004-b02d-667cae9234e2.png)

> 文章每周持续更新，原创不易，「三连」让更多人看到是对我最大的肯定。可以微信搜索公众号「 后端技术学堂 」第一时间阅读（一般比博客早更新一到两篇）

今天继续来学习Linux内存管理，什么？你更想学时间管理，我不配，抱个西瓜去微博学吧。

 ![img](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9pMC5oZHNsYi5jb20vYmZzL2FydGljbGUvNjY2ZDJlYTgzZDc1MGVlNDIwZDc5YjMzMDhmNmNiMTY0YjlmYzVhOS5naWY) 

言归正传，上一篇文章 [别再说你不懂Linux内存管理了，10张图给你安排的明明白白！](https://mp.weixin.qq.com/s?__biz=MzIwMjM4NDE1Nw==&mid=2247483865&idx=1&sn=dfa63a467b620b6131acaef9ea6874a3&chksm=96de37aba1a9bebdcc097314f40ae633bd393253759ecd970ac84cdb41f18994da9405dbf356&token=1178579599&lang=zh_CN#rd) 分析了 Linux 内存管理机制，如果已经忘了的同学还可以回头看下，并且也强烈建议先阅读那一篇再来看这一篇。限于篇幅，上一篇没有深入学习物理内存管理和虚拟内存分配，今天就来学习一下。

通过前面的学习我们知道，程序可没这么好骗，任你内存管理把虚拟地址空间玩出花来，到最后还是要给程序实实在在的物理内存，不然程序就要罢工了，所以物理内存这么重要的资源一定要好好管理起来使用（物理内存，就是你实实在在的内存条），那么内核是如何管理物理内存的呢？

## 物理内存管理

在`Linux `系统中通过分段和分页机制，把物理内存划分 4K 大小的内存页 `Page`（也称作页框`Page Frame`），物理内存的分配和回收都是基于内存页进行，把物理内存分页管理的好处大大的。

假如系统请求小块内存，可以预先分配一页给它，避免了反复的申请和释放小块内存带来频繁的系统开销。

假如系统需要大块内存，则可以用多页内存拼凑，而不必要求大块连续内存。你看不管内存大小都能收放自如，分页机制多么完美的解决方案！

 ![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9pMDRwaWNjZG4uc29nb3VjZG4uY29tLzYxNWQ0YWViMjg5MjY0MzA?x-oss-process=image/format,png) 

But，理想很丰满，现实很骨感。如果就直接这样把内存分页使用，不再加额外的管理还是存在一些问题，下面我们来看下，系统在多次分配和释放物理页的时候会遇到哪些问题。

### 物理页管理面临问题

物理内存页分配会出现外部碎片和内部碎片问题，所谓的「内部」和「外部」是针对「页框内外」而言，一个页框内的内存碎片是内部碎片，多个页框间的碎片是外部碎片。

#### 外部碎片

当需要分配大块内存的时候，要用好几页组合起来才够，而系统分配物理内存页的时候会尽量分配连续的内存页面，频繁的分配与回收物理页导致大量的小块内存夹杂在已分配页面中间，形成外部碎片，举个例子：

![外部碎片](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTM5YjU0ZDNmMWFjZjJmODYucG5n?x-oss-process=image/format,png)


#### 内部碎片

物理内存是按页来分配的，这样当实际只需要很小内存的时候，也会分配至少是 4K 大小的页面，而内核中有很多需要以字节为单位分配内存的场景，这样本来只想要几个字节而已却不得不分配一页内存，除去用掉的字节剩下的就形成了内部碎片。 

![内部碎片](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTQ5NmIwY2ZkNGQ3Nzk2MzMucG5n?x-oss-process=image/format,png)


### 页面管理算法

方法总比困难多，因为存在上面的这些问题，聪明的程序员灵机一动，引入了页面管理算法来解决上述的碎片问题。

#### Buddy（伙伴）分配算法

 `Linux` 内核引入了伙伴系统算法（Buddy system），什么意思呢？就是把相同大小的页框块用链表串起来，页框块就像手拉手的好伙伴，也是这个算法名字的由来。

 ![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9pMDRwaWNjZG4uc29nb3VjZG4uY29tLzMxODJmN2E1NjlhY2MxYzE?x-oss-process=image/format,png) 

具体的，所有的空闲页框分组为11个块链表，每个块链表分别包含大小为1，2，4，8，16，32，64，128，256，512和1024个连续页框的页框块。最大可以申请1024个连续页框，对应4MB大小的连续内存。

![伙伴系统](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTI1YTNlOWJkOTAwY2I1NWMucG5n?x-oss-process=image/format,png)


因为任何正整数都可以由 `2^n` 的和组成，所以总能找到合适大小的内存块分配出去，减少了外部碎片产生 。

##### 分配实例

比如：我需要申请4个页框，但是长度为4个连续页框块链表没有空闲的页框块，伙伴系统会从连续8个页框块的链表获取一个，并将其拆分为两个连续4个页框块，取其中一个，另外一个放入连续4个页框块的空闲链表中。释放的时候会检查，释放的这几个页框前后的页框是否空闲，能否组成下一级长度的块。 

##### 命令查看

```
[lemon]]# cat /proc/buddyinfo 
Node 0, zone      DMA      1      0      0      0      2      1      1      0      1      1      3 
Node 0, zone    DMA32   3198   4108   4940   4773   4030   2184    891    180     67     32    330 
Node 0, zone   Normal  42438  37404  16035   4386    610    121     22      3      0      0      1 

```



#### slab分配器

看到这里你可能会想，有了伙伴系统这下总可以管理好物理内存了吧？不，还不够，否则就没有slab分配器什么事了。

 ![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9pMDJwaWNjZG4uc29nb3VjZG4uY29tLzk4MGI5NzIxZTcwZWVkYWU?x-oss-process=image/format,png) 

那什么是slab分配器呢？

一般来说，内核对象的生命周期是这样的：分配内存-初始化-释放内存，内核中有大量的小对象，比如文件描述结构对象、任务描述结构对象，如果按照伙伴系统按页分配和释放内存，对小对象频繁的执行「分配内存-初始化-释放内存」会非常消耗性能。

伙伴系统分配出去的内存还是以页框为单位，而对于内核的很多场景都是分配小片内存，远用不到一页内存大小的空间。` slab `分配器，**通过将内存按使用对象不同再划分成不同大小的空间**，应用于内核对象的缓存。

伙伴系统和slab不是二选一的关系，`slab` 内存分配器是对伙伴分配算法的补充。

##### 大白话说原理

对于每个内核中的相同类型的对象，如：`task_struct、file_struct` 等需要重复使用的小型内核数据对象，都会有个 slab 缓存池，缓存住大量常用的「已经初始化」的对象，每当要申请这种类型的对象时，就从缓存池的`slab` 列表中分配一个出去；而当要释放时，将其重新保存在该列表中，而不是直接返回给伙伴系统，从而避免内部碎片，同时也大大提高了内存分配性能。

##### 主要优点

- `slab` 内存管理基于内核小对象，不用每次都分配一页内存，充分利用内存空间，避免内部碎片。
- `slab` 对内核中频繁创建和释放的小对象做缓存，重复利用一些相同的对象，减少内存分配次数。

##### 数据结构

![slab分配器](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LWQzZDFhM2VkODRhYzI5NjAucG5n?x-oss-process=image/format,png)


`kmem_cache` 是一个`cache_chain` 的链表组成节点，代表的是一个内核中的相同类型的「对象高速缓存」，每个`kmem_cache` 通常是一段连续的内存块，包含了三种类型的 `slabs` 链表：

- `slabs_full` (完全分配的 `slab` 链表)
- ` slabs_partial` (部分分配的`slab` 链表)
- `slabs_empty` ( 没有被分配对象的`slab` 链表)

`kmem_cache` 中有个重要的结构体 `kmem_list3` 包含了以上三个数据结构的声明。 

![kmem_list3 内核源码](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LWZmMjcxNDliMzQ2YzdmMWIucG5n?x-oss-process=image/format,png)


`slab` 是` slab` 分配器的最小单位，在实现上一个 `slab` 有一个或多个连续的物理页组成（通常只有一页）。单个slab可以在 `slab` 链表之间移动，例如如果一个「半满` slabs_partial`链表」被分配了对象后变满了，就要从 `slabs_partial` 中删除，同时插入到「全满`slabs_full`链表」中去。内核` slab `对象的分配过程是这样的：

1.  如果` slabs_partial`链表还有未分配的空间，分配对象，若分配之后变满，移动 `slab` 到`slabs_full` 链表
2.  如果` slabs_partial`链表没有未分配的空间，进入下一步
3.  如果`slabs_empty` 链表还有未分配的空间，分配对象，同时移动` slab `进入` slabs_partial`链表
4.  如果`slabs_empty`为空，请求伙伴系统分页，创建一个新的空闲`slab`， 按步骤 3 分配对象

![slab分配图解](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LWU4MzBkODdlOWJkMmNiYTAucG5n?x-oss-process=image/format,png)




##### 命令查看

上面说的都是理论，比较抽象，动动手来康康系统中的 slab 吧！你可以通过 `cat /proc/slabinfo` 命令，实际查看系统中` slab` 信息。

![slabinfo查询](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTFhMzEwZDViNzI5ZDBhMjUucG5n?x-oss-process=image/format,png)


`slabtop`  实时显示内核 slab 内存缓存信息。

![slabtop查询](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTY5OTI2MTgxZWRhNGQ5MDIucG5n?x-oss-process=image/format,png)




#### slab高速缓存的分类

slab高速缓存分为两大类，「通用高速缓存」和「专用高速缓存」。

##### 通用高速缓存

slab分配器中用 `kmem_cache` 来描述高速缓存的结构，它本身也需要 slab 分配器对其进行高速缓存。cache_cache 保存着对「高速缓存描述符的高速缓存」，是一种通用高速缓存，保存在`cache_chain` 链表中的第一个元素。


另外，slab 分配器所提供的小块连续内存的分配，也是通用高速缓存实现的。通用高速缓存所提供的对象具有几何分布的大小，范围为32到131072字节。内核中提供了 `kmalloc()` 和 `kfree()` 两个接口分别进行内存的申请和释放。

##### 专用高速缓存

内核为专用高速缓存的申请和释放提供了一套完整的接口，根据所传入的参数为制定的对象分配slab缓存。

###### 专用高速缓存的申请和释放

kmem_cache_create() 用于对一个指定的对象创建高速缓存。它从 cache_cache 普通高速缓存中为新的专有缓存分配一个高速缓存描述符，并把这个描述符插入到高速缓存描述符形成的 cache_chain 链表中。kmem_cache_destory() 用于撤消和从 cache_chain 链表上删除高速缓存。

##### slab的申请和释放

`slab` 数据结构在内核中的定义，如下：

![slab结构体内核代码](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LThmMWU3NzBjYjcyOGUzN2UucG5n?x-oss-process=image/format,png)


kmem_cache_alloc() 在其参数所指定的高速缓存中分配一个slab，对应的 kmem_cache_free() 在其参数所指定的高速缓存中释放一个slab。



## 虚拟内存分配

前面讨论的都是对物理内存的管理，Linux 通过虚拟内存管理，欺骗了用户程序假装每个程序都有 4G 的虚拟内存寻址空间（如果这里不懂我说啥，建议回头看下 [别再说你不懂Linux内存管理了，10张图给你安排的明明白白！](https://mp.weixin.qq.com/s?__biz=MzIwMjM4NDE1Nw==&mid=2247483865&idx=1&sn=dfa63a467b620b6131acaef9ea6874a3&chksm=96de37aba1a9bebdcc097314f40ae633bd393253759ecd970ac84cdb41f18994da9405dbf356&token=1178579599&lang=zh_CN#rd)）。

所以我们来研究下虚拟内存的分配，这里包括用户空间虚拟内存和内核空间虚拟内存。

**注意，分配的虚拟内存还没有映射到物理内存，只有当访问申请的虚拟内存时，才会发生缺页异常，再通过上面介绍的伙伴系统和 slab 分配器申请物理内存。**

### 用户空间内存分配

#### malloc

`malloc` 用于申请用户空间的虚拟内存，当申请小于 `128KB` 小内存的时，` malloc `使用  `sbrk或brk` 分配内存；当申请大于 `128KB` 的内存时，使用 `mmap` 函数申请内存； 

##### 存在问题

由于 `brk/sbrk/mmap` 属于系统调用，如果每次申请内存都要产生系统调用开销，`cpu` 在用户态和内核态之间频繁切换，非常影响性能。

而且，堆是从低地址往高地址增长，如果低地址的内存没有被释放，高地址的内存就不能被回收，容易产生内存碎片。 

##### 解决

因此，` malloc `采用的是内存池的实现方式，先申请一大块内存，然后将内存分成不同大小的内存块，然后用户申请内存时，直接从内存池中选择一块相近的内存块分配出去。 
![malloc原理](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTI2ZTdkNDUwNTUxYTQ2MzEucG5n?x-oss-process=image/format,png)




### 内核空间内存分配

在讲内核空间内存分配之前，先来回顾一下内核地址空间。`kmalloc` 和 `vmalloc` 分别用于分配不同映射区的虚拟内存。

![内核空间细分区域.](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LWZmZTNlNGQ4ZDc5ZjNmNGMucG5n?x-oss-process=image/format,png)

#### kmalloc

`kmalloc()` 分配的虚拟地址范围在内核空间的「直接内存映射区」。

按字节为单位虚拟内存，一般用于分配小块内存，释放内存对应于 `kfree` ，可以分配连续的物理内存。函数原型在 `<linux/kmalloc.h>` 中声明，一般情况下在驱动程序中都是调用 `kmalloc()` 来给数据结构分配内存 。

还记得前面说的 slab 吗？`kmalloc` 是基于slab 分配器的 ，同样可以用`cat /proc/slabinfo` 命令，查看 `kmalloc` 相关 `slab`   对象信息，下面的 kmalloc-8、kmalloc-16 等等就是基于slab分配的 kmalloc 高速缓存。

![slabinfo-kmalloc](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTE1OWNhZmNiOWZjYTIxY2QucG5n?x-oss-process=image/format,png)


#### vmalloc

`vmalloc` 分配的虚拟地址区间，位于 `vmalloc_start` 与 ` vmalloc_end` 之间的「动态内存映射区」。

一般用分配大块内存，释放内存对应于 `vfree`，分配的虚拟内存地址连续，物理地址上不一定连续。函数原型在 `<linux/vmalloc.h>` 中声明。一般用在为活动的交换区分配数据结构，为某些 `I/O` 驱动程序分配缓冲区，或为内核模块分配空间。

下面的图总结了上述两种内核空间虚拟内存分配方式。
![kmalloc_vmalloc图解](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTA0NzllZTFlYmI0N2U5NmYucG5n?x-oss-process=image/format,png)




## 总结一下

这是`Linux `内存管理系列文章的下篇，强烈建议阅读过程中有不清楚的同学，先去看看我之前写的 [别再说你不懂Linux内存管理了，10张图给你安排的明明白白！](https://mp.weixin.qq.com/s?__biz=MzIwMjM4NDE1Nw==&mid=2247483865&idx=1&sn=dfa63a467b620b6131acaef9ea6874a3&chksm=96de37aba1a9bebdcc097314f40ae633bd393253759ecd970ac84cdb41f18994da9405dbf356&token=1178579599&lang=zh_CN#rd)，写到这里Linux 内存管理专题告一段落，我分享的这些知识很基础，基础到日常开发工作几乎用不上，但我认为每个在Linux下开发人员都应该了解。

我知道有些面试官喜欢在面试的时候考察一下，或多或少反应候选人基础素养，这两篇文章的内容也足够应付面试。还是那句话，Linxu 内存管理太复杂，不是一两篇文章能讲的清楚，但至少要有宏观意识，不至于一问三不知，如果你想深入了解原理，强烈建议从书中并结合内核源码学习，每天进步一点点，我们的目标是星辰大海。

**本文创作过程我也画了大量的示例图解，可以作为知识索引，个人感觉看图还是比看文字更清晰明了，你可以在我公众号「后端技术学堂」后台回复「内存管理」获取这些图片的高清原图。**

老规矩，感谢各位的阅读，文章的目的是分享对知识的理解，技术类文章我都会反复求证以求最大程度保证准确性，若文中出现明显纰漏也欢迎指出，我们一起在探讨中学习。今天的技术分享就到这里，我们下期再见。



**原创不易，看到这里动动手指，各位的「 转发和点赞」是对我持续创作的最大支持，我们下篇文章再见。**

> 可以微信搜索公众号「 后端技术学堂 」回复「资料」「1024」有我给你准备的各种编程学习资料。文章每周持续更新，我们下期见！

![公众号：后端技术学堂](https://img-blog.csdnimg.cn/20200605000631523.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTE2NDQyMzE=,size_16,color_FFFFFF,t_70#pic_center)

 
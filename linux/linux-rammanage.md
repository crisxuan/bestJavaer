> 文章每周持续更新，各位的「三连」是对我最大的肯定。可以微信搜索公众号「 后端技术学堂 」第一时间阅读（一般比博客早更新一到两篇）


今天来带大家研究一下` Linux `内存管理。对于精通 `CURD` 的业务同学，内存管理好像离我们很远，但这个知识点虽然冷门（估计很多人学完根本就没机会用上）但绝对是基础中的基础，这就像武侠中的内功修炼，学完之后看不到立竿见影的效果，但对你日后的开发工作是大有裨益的，因为你站的更高了。

**文中所有示例图都是我亲手画的，画图比码字还费时间，但是看图理解比文字更直观，需要高清示例图片的同学，文末有获取方式自取。** 

再功利点的说，面试的时候不经意间透露你懂这方面知识，并且能说出个一二三来，也许能让面试官对你更有兴趣，离升职加薪，走上人生巅峰又近了一步。

  ![image](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTIzMmZkNThiMGUwYzg4ZDE?x-oss-process=image/format,png) 

前提约定：本文讨论技术内容前提，操作系统环境都是 `x86`架构的 32 位 ` Linux `系统。

## 虚拟地址

即使是现代操作系统中，内存依然是计算机中很宝贵的资源，看看你电脑几个T固态硬盘，再看看内存大小就知道了。为了充分利用和管理系统内存资源，Linux采用虚拟内存管理技术，利用虚拟内存技术让每个进程都有`4GB` 互不干涉的虚拟地址空间。

进程初始化分配和操作的都是基于这个「虚拟地址」，只有当进程需要实际访问内存资源的时候才会建立虚拟地址和物理地址的映射，调入物理内存页。

打个不是很恰当的比方。这个原理其实和现在的某某网盘一样，假如你的网盘空间是` 1TB `，真以为就一口气给了你这么大空间吗？那还是太年轻，都是在你往里面放东西的时候才给你分配空间，你放多少就分多少实际空间给你，但你和你朋友看起来就像大家都拥有` 1TB `空间一样。

![img](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTMwN2QzODQ1NzQyZmEwODM?x-oss-process=image/format,png)

### 虚拟地址的好处

- 避免用户直接访问物理内存地址，防止一些破坏性操作，保护操作系统
- 每个进程都被分配了4GB的虚拟内存，用户程序可使用比实际物理内存更大的地址空间

`4GB` 的进程虚拟地址空间被分成两部分：「用户空间」和「内核空间」

![用户空间内核空间](https://img-blog.csdnimg.cn/20200420115007992.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTE2NDQyMzE=,size_16,color_FFFFFF,t_70#pic_center)


## 物理地址

上面章节我们已经知道不管是用户空间还是内核空间，使用的地址都是虚拟地址，当需进程要实际访问内存的时候，会由内核的「请求分页机制」产生「缺页异常」调入物理内存页。

把虚拟地址转换成内存的物理地址，这中间涉及利用`MMU` 内存管理单元（Memory Management Unit ) 对虚拟地址分段和分页（段页式）地址转换，关于分段和分页的具体流程，这里不再赘述，可以参考任何一本计算机组成原理教材描述。

![段页式内存管理地址转换](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTIyNzBlOTNmMjBlOGZkYjcucG5n?x-oss-process=image/format,png)


`Linux` 内核会将物理内存分为3个管理区，分别是：

### ZONE_DMA

`DMA`内存区域。包含0MB~16MB之间的内存页框，可以由老式基于` ISA `的设备通过` DMA `使用，直接映射到内核的地址空间。

### ZONE_NORMAL

普通内存区域。包含16MB~896MB之间的内存页框，常规页框，直接映射到内核的地址空间。

### ZONE_HIGHMEM

高端内存区域。包含896MB以上的内存页框，不进行直接映射，可以通过永久映射和临时映射进行这部分内存页框的访问。

![物理内存区划分](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTE2MzVmNGMwNzZjZWFlMTUucG5n?x-oss-process=image/format,png)


## 用户空间

用户进程能访问的是「用户空间」，每个进程都有自己独立的用户空间，虚拟地址范围从从 `0x00000000` 至 `0xBFFFFFFF` 总容量3G 。 

用户进程通常只能访问用户空间的虚拟地址，只有在执行内陷操作或系统调用时才能访问内核空间。 

### 进程与内存

进程（执行的程序）占用的用户空间按照「 访问属性一致的地址空间存放在一起 」的原则，划分成 `5`个不同的内存区域。 访问属性指的是“可读、可写、可执行等 。

- 代码段

  代码段是用来存放可执行文件的操作指令，可执行程序在内存中的镜像。代码段需要防止在运行时被非法修改，所以只准许读取操作，它是不可写的。

- 数据段

  数据段用来存放可执行文件中已初始化全局变量，换句话说就是存放程序静态分配的变量和全局变量。

- BSS段

  ` BSS `段包含了程序中未初始化的全局变量，在内存中 `bss` 段全部置零。

- 堆 ` heap` 

  堆是用于存放进程运行中被动态分配的内存段，它的大小并不固定，可动态扩张或缩减。当进程调用malloc等函数分配内存时，新分配的内存就被动态添加到堆上（堆被扩张）；当利用free等函数释放内存时，被释放的内存从堆中被剔除（堆被缩减）

- 栈 `stack`

  栈是用户存放程序临时创建的局部变量，也就是函数中定义的变量（但不包括 `static` 声明的变量，static意味着在数据段中存放变量）。除此以外，在函数被调用时，其参数也会被压入发起调用的进程栈中，并且待到调用结束后，函数的返回值也会被存放回栈中。由于栈的先进先出特点，所以栈特别方便用来保存/恢复调用现场。从这个意义上讲，我们可以把堆栈看成一个寄存、交换临时数据的内存区。

上述几种内存区域中数据段、`BSS` 段、堆通常是被连续存储在内存中，在位置上是连续的，而代码段和栈往往会被独立存放。堆和栈两个区域在 `i386` 体系结构中栈向下扩展、堆向上扩展，相对而生。 
![程序内存区域分段](https://img-blog.csdnimg.cn/20200419230245702.png#pic_center)

你也可以再linux下用`size` 命令查看编译后程序的各个内存区域大小：

```shell
[lemon ~]# size /usr/local/sbin/sshd
   text	   data	    bss	    dec	    hex	filename
1924532	  12412	 426896	2363840	 2411c0	/usr/local/sbin/sshd
```



## 内核空间

在 `x86 32` 位系统里，Linux 内核地址空间是指虚拟地址从 `0xC0000000` 开始到 `0xFFFFFFFF` 为止的高端内存地址空间，总计 `1G` 的容量， 包括了内核镜像、物理页面表、驱动程序等运行在内核空间 。

![内核空间细分区域.](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LWZmZTNlNGQ4ZDc5ZjNmNGMucG5n?x-oss-process=image/format,png)


#### 直接映射区

直接映射区 `Direct Memory Region`：从内核空间起始地址开始，最大`896M`的内核空间地址区间，为直接内存映射区。

直接映射区的896MB的「线性地址」直接与「物理地址」的前`896MB`进行映射，也就是说线性地址和分配的物理地址都是连续的。内核地址空间的线性地址`0xC0000001`所对应的物理地址为`0x00000001`，它们之间相差一个偏移量`PAGE_OFFSET  = 0xC0000000` 

该区域的线性地址和物理地址存在线性转换关系「线性地址 = `PAGE_OFFSET` + 物理地址」也可以用 `virt_to_phys() `函数将内核虚拟空间中的线性地址转化为物理地址。



#### 高端内存线性地址空间

内核空间线性地址从 896M 到 1G 的区间，容量 128MB 的地址区间是高端内存线性地址空间，为什么叫高端内存线性地址空间？下面给你解释一下：

前面已经说过，内核空间的总大小 1GB，从内核空间起始地址开始的 896MB 的线性地址可以直接映射到物理地址大小为 896MB 的地址区间。退一万步，即使内核空间的1GB线性地址都映射到物理地址，那也最多只能寻址 1GB 大小的物理内存地址范围。

请问你现在你家的内存条多大？快醒醒都 0202 年了，一般 PC 的内存都大于 1GB 了吧！
![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LTc0N2U1ZmYxNzQ1NDhlNjAucG5n?x-oss-process=image/format,png)


所以，内核空间拿出了最后的 128M 地址区间，划分成下面三个高端内存映射区，以达到对整个物理地址范围的寻址。而在 64 位的系统上就不存在这样的问题了，因为可用的线性地址空间远大于可安装的内存。

##### 动态内存映射区

 `vmalloc Region` 该区域由内核函数`vmalloc`来分配，特点是：线性空间连续，但是对应的物理地址空间不一定连续。 `vmalloc` 分配的线性地址所对应的物理页可能处于低端内存，也可能处于高端内存。

##### 永久内存映射区 

`Persistent Kernel Mapping Region` 该区域可访问高端内存。访问方法是使用 `alloc_page (_GFP_HIGHMEM)` 分配高端内存页或者使用` kmap `函数将分配到的高端内存映射到该区域。

##### 固定映射区 

`Fixing kernel Mapping Region` 该区域和 4G 的顶端只有 4k 的隔离带，其每个地址项都服务于特定的用途，如 `ACPI_BASE` 等。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200420115050304.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTE2NDQyMzE=,size_16,color_FFFFFF,t_70#pic_center)


## 回顾一下

上面讲的有点多，先别着急进入下一节，在这之前我们再来回顾一下上面所讲的内容。如果认真看完上面的章节，我这里再画了一张图，现在你的脑海中应该有这样一个内存管理的全局图。

![内核空间用户空间全图](https://img-blog.csdnimg.cn/2020042011512958.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTE2NDQyMzE=,size_16,color_FFFFFF,t_70#pic_center)



## 内存数据结构

要让内核管理系统中的虚拟内存，必然要从中抽象出内存管理数据结构，内存管理操作如「分配、释放等」都基于这些数据结构操作，这里列举两个管理虚拟内存区域的数据结构。

### 用户空间内存数据结构

在前面「进程与内存」章节我们提到，Linux进程可以划分为 5 个不同的内存区域，分别是：代码段、数据段、` BSS `、堆、栈，内核管理这些区域的方式是，将这些内存区域抽象成` vm_area_struct `的内存管理对象。 

` vm_area_struct `是描述进程地址空间的基本管理单元，一个进程往往需要多个` vm_area_struct `来描述它的用户空间虚拟地址，需要使用「链表」和「红黑树」来组织各个` vm_area_struct `。

链表用于需要遍历全部节点的时候用，而红黑树适用于在地址空间中定位特定内存区域。内核为了内存区域上的各种不同操作都能获得高性能，所以同时使用了这两种数据结构。 

用户空间进程的地址管理模型：

![wm_arem_struct](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LWVmMDE0ODUyMWVlM2FkMTQucG5n?x-oss-process=image/format,png)




### 内核空间动态分配内存数据结构

在内核空间章节我们提到过「动态内存映射区」，该区域由内核函数`vmalloc`来分配，特点是：线性空间连续，但是对应的物理地址空间不一定连续。 `vmalloc` 分配的线性地址所对应的物理页可能处于低端内存，也可能处于高端内存。

`vmalloc` 分配的地址则限于` vmalloc_start `与` vmalloc_end `之间。每一块` vmalloc `分配的内核虚拟内存都对应一个` vm_struct `结构体，不同的内核空间虚拟地址之间有` 4k `大小的防越界空闲区间隔区。与用户空间的虚拟地址特性一样，这些虚拟地址与物理内存没有简单的映射关系，必须通过内核页表才可转换为物理地址或物理页，它们有可能尚未被映射，当发生缺页时才真正分配物理页面。

![动态内存映射](https://imgconvert.csdnimg.cn/aHR0cHM6Ly91cGxvYWQtaW1hZ2VzLmppYW5zaHUuaW8vdXBsb2FkX2ltYWdlcy83ODQyNDY0LWU2YjEyZTcxMzE2NDRlODAucG5n?x-oss-process=image/format,png)



## 总结一下

`Linux `内存管理是一个非常复杂的系统，本文所述只是冰山一角，从宏观角度给你展现内存管理的全貌，但一般来说，这些知识在你和面试官聊天的时候还是够用的，当然我也希望大家能够通过读书了解更深层次的原理。

希望这篇文章可以作为一个索引一样的学习指南，当你想深入某一点学习的时候可以在这些章节里找到切入点，以及这个知识点在内存管理宏观上的位置。

**本文创作过程我也画了大量的示例图解，可以作为知识索引，个人感觉看图还是比看文字更清晰明了，你可以在我公众号「后端技术学堂」后台回复「内存管理」获取这些图片的高清原图。**

老规矩，感谢各位的阅读，文章的目的是分享对知识的理解，技术类文章我都会反复求证以求最大程度保证准确性，若文中出现明显纰漏也欢迎指出，我们一起在探讨中学习。今天的技术分享就到这里，我们下期再见。

**原创不易，看到这里，如果在我这有一点点收获，就动动手指「转发」和「在看」是对我最大的支持。**




### 创作不易，点赞关注支持一下吧
> 可以微信搜索公众号「 后端技术学堂 」回复「资料」有我给你准备的各种编程学习资料。文章每周持续更新，我们下期见！

![公众号：后端技术学堂](https://img-blog.csdnimg.cn/20200605000631523.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTE2NDQyMzE=,size_16,color_FFFFFF,t_70#pic_center)
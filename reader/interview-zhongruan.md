**最开始是打算面试外包公司刷经验，等经验差不多了，再去甲方尝试，可惜不太顺利**。

## 一、迈思（面试了30分钟）

1. 自我介绍

2. 左连接（a 表左连接 b 表，a 表全部数据出来，b 表没有的数据为空）

3. a 表左连接 b 表，b 表左连接 c 表，c 表左连接 a 表，这样的数据是什么数据（博主当时有点懵，回答全连接，全部数据会出来。。。）

4. sql：一个班的学生有两个字段，一个字段叫分数，另外一个字段叫组名，有 4 个组，查出每个组的第一名，sql 怎么写

select group_name,max(score) from table  group by group_name order by group_name

5.数据库引擎有哪些（myIsam，InnoDB 等等）

6. myIsam 和 Inno DB的区别（InnoDB 支持事务，外键，崩溃后恢复，InnoDB 行级锁，myIsam 表级锁）

7. myIsam 的优点（博主当时只记住了 InnoDB 的优点，没想到面试官问到了 myIsam 的优点，速度快，磁盘空间占用少）

8. Spring 的两个特性(IOC 和 aop，这两个特性用到了哪些设计模式)

9. java 的容器，集合（老生常谈了，list, set, map 等等，另外说一下有哪些实现类）

10. hashmap 的实现（数组+链表+红黑树）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20191104151241389.png)

11. put 一个 key 和 value，怎么确定数组的下标，如果有两个key put到同个位置，怎么做？（根据key计算hash值，根据hash确定下标等等）

12. HashMap 是线程安全的吗？有哪些实现？（不是，线程安全的可以用hashtable，concurrentHashMap等等）

13. concurrentHashMap 是怎么实现线程安全的？具体的实现？两个线程同时 put 两个 key 是怎么做的?

（1.7数组+链表，分段锁，1.8数组+链表+红黑树，cas+synchronized）

14. java 集合的排序（stream 中的 sort），内部是怎么实现的？原理是什么？了解过哪些排序？

(Comparable和Comparator  [参考链接](https://www.cnblogs.com/szlbm/p/5504634.html))

15. java 集合的分组（groupingby (对象::属性)）

16. 函数式方法（接口），什么条件下才能用？这种适用于所有的吗？还是说有一定的限制？

17. 后台的请求比较慢，一般是什么原因造成的？后台请求直接卡了，怎么排查，日志没报错呢？（查一下慢sql，需要大量运算）

18. 怎么查锁日志，线程日志？（这个不知道）

19. 常见线程池，这些都是什么样的线程池？（newCachedThreadPool，newFixedThreadPool，newScheduledThreadPool，newSingleThreadExecutor，现在有6种线程池了，没记那么多）

20. java 锁，并简单说一下锁，类名，关键字，锁的实现等等（ReentrantLock，迷迷糊糊说了一些，毕竟记得不多）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803172204816.gif)

21. 谷歌 guava 缓存用过吗？（没用过）

22. 项目有哪些难的实现，你是怎么做的？（根据自己的情况去回答）



## 二、亲邻科技（甲方）

过去面试的时候，是星期五晚上8点多了

### 一面：hr（不到10分钟）

简单自我介绍，对技术，薪资有要求什么的，跳槽原因，评价自己，公司加班挺多的，问能不能接受

### 二面：技术（不到20分钟，答的有点差）

1. 对称加密和非对称加密的区别

2. 跨域脚本攻击（还有好几个没听过）

3. 数据库隔离级别（读未提交，读已提交，可重复读，串行化）

4. 不可重复读和幻读是什么？（a重复读同个数据，b修改数据，a再次读，就是不可重复读；a修改某些数据，b从中插入一条数据，a会发现还有一条数据没修改，那么就是幻读）

5. 死锁是什么？产生原因？怎么解决（竞争同一资源，四个条件，破坏四个条件，这一块没答好）

6. 服务器 cpu 百分百，怎么排查（ps 查看进程，答的不是很好，毕竟这方面没研究。虽然公司也遇到了 cpu 百分百的情况，但是解决办法是把需要大量运算的 mrp 功能给禁掉，后面加内存，加服务器。这一块我可不敢实话实说）

7. nginx 可以用来做什么（负载均衡，反向代理，面试官还继续问还有呢，我不知道什么了，我说可以拦截 ip 等等）

8. cas 是什么？（乐观锁的一种实现，会造成aba问题，加版本号或者时间戳）

9. redis 持久化机制，rdb 和 aof 的优缺点（全量数据备份，安全性低，备份间隔时间长；增量数据备份，数据安全，文件大）

10. spring 异步注解（没用过）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803165216280.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2V4b2R1czM=,size_16,color_FFFFFF,t_70)

11. 讲一讲类加载机制

12. 内存泄露和内存溢出的区别

13. 还问了其他一些题目，不太记得了

14. 讲一讲项目，你是怎么做的


## 三、奥萨医药（甲方，面试了35分钟左右）

**看到一个小姐姐，问路，好漂亮**

进去之后，填资料，填完资料，就问问题

1. mysql 的常用引擎，区别（InnoDB：支持事务，外键，行锁，支持崩溃后恢复，面试官还问为什么能恢复。Myisam： 表锁，全文索引）

2. sql 有哪些优化，常用索引（查询哪些字段，不要用*, null, like后面的"% 等等）

3. sql 语句执行的过程是怎么样的？怎么分析 explain

4. 假如有 100w 数据，我想要第 60 万行之后的数据，怎么优化（用limit，加索引，面试官太变态了，问加了这些还很慢，怎么办）

5. redis 是什么，为什么比 mongodb 热门？（非关系型数据库，基于内存等等，为什么热门，这个我就说不知道了，因为不知道 mongodb）

6. 什么是非关系型数据库，与关系型数据库的区别？（没回答好）

7. 除了基于内存，读取速度快，还有哪些原因让 redis 快？（没回答好）

8. 常用的数据类型，应用场景（String，List，Set，Zset，Hash，面试官还问为什么，额，简直是抽丝剥茧呢）

9. 持久化机制，rdb 和 aof 的区别，你会怎么选择哪种机制（全量和增量，备份时间长短，数据安全等等，现在有混合机制）

10. 淘汰策略有哪些（答到过期策略那里去了，面试官提醒了）

<img src="https://img-blog.csdnimg.cn/2018122317191584.gif" alt="在这里插入图片描述">

11. redis 为什么可以对 String 进行自增自减运算（这个不知道）

12. redis 怎么进行优化？（不知道）

13. java 常用的集合有哪些？（list,set,map，实现类）

14. arrayList 和 linkedList 的区别（数据结构，读取和增删速度，线程安全copyonwriteArrayList）

15. 我想要插入几十万数据到 arrayList，有什么优化方法？(这个还真的不知道了)

16. hashmap 底层结构，put的过程？为什么要加红黑数？结构全部用红黑树可以吗？（数组+链表+红黑树，根据 key 计算 hash，根据 hash 计算下标，下标为 null 就赋值，不为 null，就遍历判断 hashcode 相等等等，1.7用头插，1.8用尾插，加红黑树是稳定，效率。数组查询时间复杂度o(1)，链表增删时间复制度o(1)，红黑树o(log n)，效率没有前面两者高，所以，不能全部用红黑树）

17. concurrenthashmap 的结构（1.7分段锁，1.8cas+synchronize）

18. synchronized和 lock 的区别

19. hashtable 和 concurrenthashmap 的区别（结构不同，hashtable是锁整个对象和方法）

20. 有哪些 java 的锁？实现类？cas 是什么？aqs 是什么？（乐观悲观，公平非公平，只说了 ReentrantLock，面试官接着问还有呢？cas，乐观锁的实现，会造成 aba 问题，加版本号或者时间戳。aqs 是锁框架）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803170021804.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2V4b2R1czM=,size_16,color_FFFFFF,t_70)

21. 线程池怎么使用，常用的参数？（使用 ThreadPoolExcutor，核心线程数，最大线程数，时间，队列，线程工厂，拒绝策略）

22. 假如有 50 个任务去执行，5 个核心线程，10 个最大线程数，10 个任务队列，流程是怎么样的，状态是怎么样的？多余的任务是怎么用拒绝策略的（创建 5 个核心线程，10 个放队列，队列满了，再创建 10 个非核心线程，剩余 25 个根据拒绝策略来决定，默认报异常，其余三种：要么忽略，要么放弃最早的线程，要么用该线程去执行）（后来才知道回答错了，10 个最大线程数，5个核心 + 5个非核心，剩下的 30 个走拒绝策略）

面试官给我的评价：面试的都能答出来，这一点很不错，但了解的不深，虽然工作上用不到，但是面试就是这样造火箭的。面试不会差，但也不优秀，处于待定状态。

## 四、金蝶软件（甲方，面试了40分钟）

1. 问的项目问题比较多，怎么设计功能的，数据库是怎么设计的

2. 左连接，右连接，内连接的区别

3. mysql 执行计划，有哪些看的

4. springmvc 执行过程，从前端到后台，再返回前端的过程

5. 权限验证，验权怎么做

6. 数据库的锁（乐观锁，悲观锁，独占锁，共享锁）

7. select, update, delete 对应哪些锁

8. java 集合体系（list,set,map）

9. arraylist 删除元素有哪些注意的地方

10. arraylist 是线程安全的吗（不是，线程安全：vector，copyonwritearraylist）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803172405256.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2V4b2R1czM=,size_16,color_FFFFFF,t_70)

11. 什么时候用 arraylist，linkedList(频繁增删用 linkedList)

12. 深拷贝和浅拷贝

13. 值传递和引用传递

14. 多线程，线程池

15. 资源同步是怎么做的？

16. synchronized 可以修饰静态类吗

17. lock 和 synchronized 的区别？用的话，你会怎么选

18. 平时怎么学习的（看教程，看博客）

19. 自己的规划是什么？（规划学微服务，分布式等等）

20. 技术方面的优势是什么

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803172419639.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2V4b2R1czM=,size_16,color_FFFFFF,t_70)

21. 代码怎么优化，重构（单一职责，共用等等）

22. 自己的网站是怎么进行性能优化的？（加 cdn，加 redis）

23. 你有什么想问我的？你们那边用到的技术是什么？面试官：技术桟是封装框架，没有前端，用拖拉组件什么的，微服务是 dubbo，数据库是 oracle，侧重点是业务，技术次要。

最后面试官说：有四轮面试，这边面试完跟总监商量一下（剩下3轮都不是技术面）


## 五、平安银行（外包，面试了40分钟，因为有事，最后中断了）

1. spirngboot 启动原理（内嵌 tomcat....）

2. 启动的注解（springbootapplication）

3. springboot 核心配置

4. 配置文件的方式（yml, properties）

5. springmvc 的工作流程

6. springmvc 的组件

7. @RequestMapping 的作用（拦截 url）

8. spring 常用的模块，核心

9. 说一说 ioc 和 aop

10. spring 常用的注入方式

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803172451671.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2V4b2R1czM=,size_16,color_FFFFFF,t_70)

11. spring 的 bean 有没有了解

12. spring 事务的实现

13. spring 的隔离

14. 数据库的隔离级别（读未提交，读已提交，可重复读，串行化）

15. 隔离级别的影响（脏读，不可重复读，幻读）

16. 原子性，持久性（不可分割，保存到数据库）

17. char 和 varchar 的区别（字节大小，''和""）面试官继续问还有没有。。。

18. left join 和 right join 的区别

19. sql 你是怎么调优的

20. sql 执行计划（explain）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803172510958.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2V4b2R1czM=,size_16,color_FFFFFF,t_70)

21. sql 的行锁和表锁，优势（锁一行和锁整个表）

22. 乐观锁，悲观锁（版本号，时间戳）

23. mysql 的引擎，区别（innodb 支持外键，行锁，支持奔溃恢复，myisam 支持全文索引）

24. select count(*) from table，数据是怎么执行的，会造成全表扫描吗（innodb，不支持全文索引，所以在innodb会造成全表扫描）

25. float 和 double 内存占多少字节

26. 在自增表，有6条数据，删了两条数据，再增加一条数据，这条数据的id是多少（innodb是7，myisam是5，结果说反了）

27. redis使用场景，和 memcache 的区别

28. redis 的持久化（rdb 和 aof，全量，增量）

29. 了解 redis 分布式，有多少个节点，以及一些命令

30. nginx应用场景（前后端分离，负载均衡）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803172534301.jpg)

31. 负载均衡的策略（轮询，权重等等）

32. 前后端是怎么交互的

33. 正向代理和反向代理

34. swagger 有了解吗（接口文档）

35. == 和 equals 的区别

36. 堆栈有了解吗

37. stringbuilder 和 stringbuffer 的区别（线程安全，效率）

38. io 流（reader和writer，inputstream和outputstream）

39. fileinputstream 和 bufferinputstream 的区别

40. 集合（list,set,map）

41. 线程安全的集合有哪些（vector，copyonwritearraylist，hashtable, concurrenthashmap）

42. hashmap的实现过程（1.7头插，1.8尾插）

43. hashset 和 linkedhashset(底层hashmap，有序，底层 linkedhashmap，无序)

44. 深拷贝，浅拷贝

**问的时间差不多40分钟了，因为还要工作，就打断面试了，结果晚上就来了第二轮面试**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803174200817.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2V4b2R1czM=,size_16,color_FFFFFF,t_70)


## 平安银行第二轮面试（面试了26分钟）

1. mysql 查询，有很多关联的表，怎么优化（表加字段，适当冗余，少关联表，不要用*,in,null，or, %等等）

2. 索引失效的情况（in,null，or, %等等）

3. 常用的集合类（list,set,map及实现类）

4. 线程安全的容器有哪些（vector,copyonwritearraylist,hashtable,concurrenthashmap）

5. concurrenthashmap 是怎么保证线程安全的（1.7用分段锁，16个都上锁，1.8用cas+syn）

6. hashmap 的数据结构（1.7数组+链表，多线程会形成一个环，cpu会飙升100%，1.8数组+链表+红黑树）

7. 什么情况下会转成红黑树（key,hash,数组大于64，链表大于8，转成红黑树）

8. 重写了 equals，还需要重写 hashcode 方法吗（因为根据 key，hash 计算出来有可能会冲突，所以要重写hashcode）

9. 链表是双向链表吗

10. redis的数据结构（string,set,sort set,list,hash,bitmap等等）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200803172610519.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2V4b2R1czM=,size_16,color_FFFFFF,t_70)

11. redis 分布式锁

12. b+ 树了解吗（mysql索引）

13. 缓存击穿（缓存失效，在缓存找不到，在数据库有数据）

14. 解决办法（设置缓存失效时间随机，错开时间，或者给个标记）（其实是设置热点数据永远不过期或者加互斥锁等等）

15. threadlocal有了解吗（发音没听清，听成什么logo了，听了三遍没听出来，后面才反应他要说什么）

16. 项目中遇到的困难（mrp功能）

17. 服务器 cpu 上升到90以上的时候，还可以用多线程吗？

18. 最近有研究什么新的技术吗？（在学习微服务）

19. 微服务相关组件，一些没听过（说了一下这些是干嘛的）

20. zookeeper有了解吗（分布式）

<img src="https://img-blog.csdnimg.cn/2020080317260126.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2V4b2R1czM=,size_16,color_FFFFFF,t_70" alt="在这里插入图片描述" style="zoom:50%;" />

21. 内存泄露有哪些情况？

22. 从专业角度+性格，评价自己

23. 你希望的项目是什么样的？（技术桟，技术氛围）

24. linux常用命令（ls,cd,pwd,chmod,vi,whereis,find二进制文件）

面试官：到岗时间比较急，技术栈是 springboot+dubbo，微服务集群，zookeeper+redis+mysql 等等

**面试评价：没什么大问题，希望快点入职**

## 结尾

jvm，微服务和分布式等等的没有记录了，自己没接触过，听到了也忘记，没有及时写上去。还有一些面试，没有去记录了，整理和记录面试挺费时间的，上面的主要记录技术面试。有些终面，面了 40 分钟，问生活细节，有什么爱好，之前写的博客，还记得吗？xx篇，你还记得写了什么内容吗？你是哪里人，将来是不是还待在深圳？晕死，一直问，问了 40 多分钟，如果我不打断，可能会一个小时以上。像这样的流水账面试，就没有写到上面去了。

最后比较幸运，拿下几个 offer，面试题还是得多刷题，避免答不出来，另外收到offer的机会才会多。

## 总结

待的公司，比较安逸稳定，也算是个温室，业务比较复杂（ERP 系统），项目架构比较简单，单体项目，去年说加缓存的一直没加，单表数据最多是上千，现在是 260 多张表。目前有 20 个客户，cpu 飘升到百分之 90，之后，服务器奔溃，好几次都这样。后来我们 CTO 的解决办法是把功能给禁掉（MRP 运算），后来发现是报表问题，oom 错误，换了报表工具。过了一段时间，加了内存，加服务器。（微服务，分布式，缓存，集群，消息队列都没用到，也学不到），一直做一些复杂的业务功能，写业务代码。还是早一点离开技术得不到提升的地方，虽然他一直给我洗脑，说会那么多技术有什么用，你业务不会，代码不会写，会再多技术也是等于零。但我心里一直否认，毕竟我是搞技术的，懂基本业务可以，讨论业务，需求可以交给项目经理什么的，最后安排我做什么就行了。除非走业务路线，走管理，懂技术懂业务。像我这种学五渣，不适合走业务。

原文链接 http://www.xuluowuhen.com/article/1596454872

![](https://img2020.cnblogs.com/blog/1515111/202008/1515111-20200805141903549-330052324.png)

![](https://img2020.cnblogs.com/blog/1515111/202008/1515111-20200805141926259-203995922.png)
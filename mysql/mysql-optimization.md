# MySQL 优化

* [MySQL 优化](#mysql-优化)
   * [SQL 优化步骤](#sql-优化步骤)
      * [通过 show status 命令了解 SQL 执行次数](#通过-show-status-命令了解-sql-执行次数)
      * [定位执行效率较低的 SQL](#定位执行效率较低的-sql)
      * [通过 EXPLAIN 命令分析 SQL 的执行计划](#通过-explain-命令分析-sql-的执行计划)
   * [索引](#索引)
      * [索引介绍](#索引介绍)
      * [索引分类](#索引分类)
      * [索引使用](#索引使用)
         * [索引使用细则](#索引使用细则)
      * [查看索引的使用情况](#查看索引的使用情况)
   * [MySQL 分析表、检查表和优化表](#mysql-分析表检查表和优化表)
      * [MySQL 分析表](#mysql-分析表)
      * [MySQL 检查表](#mysql-检查表)
      * [MySQL 优化表](#mysql-优化表)
   * [常用 SQL 优化](#常用-sql-优化)
      * [导入的优化](#导入的优化)
      * [insert 的优化](#insert-的优化)
      * [group by 的优化](#group-by-的优化)
      * [order by 的优化](#order-by-的优化)
      * [优化嵌套查询](#优化嵌套查询)
      * [count 的优化](#count-的优化)
      * [limit 分页的优化](#limit-分页的优化)
      * [SQL 中 IN 包含的值不应该太多](#sql-中-in-包含的值不应该太多)
      * [只需要一条数据的情况](#只需要一条数据的情况)
      * [如果没有使用索引，就尽量减少排序](#如果没有使用索引就尽量减少排序)
      * [尽量用 union all 来代替 union](#尽量用-union-all-来代替-union)
      * [where 条件优化](#where-条件优化)
      * [查询时，尽量指定查询的字段名](#查询时尽量指定查询的字段名)

一般传统互联网公司很少接触到 SQL 优化问题，其原因是数据量小，大部分厂商的数据库性能能够满足日常的业务需求，所以不需要进行 SQL 优化，但是随着应用程序的不断变大，数据量的激增，数据库自身的性能跟不上了，此时就需要从 SQL 自身角度来进行优化，这也是我们这篇文章所讨论的。

## SQL 优化步骤

当面对一个需要优化的 SQL 时，我们有哪几种排查思路呢？

### 通过 show status 命令了解 SQL 执行次数

首先，我们可以使用 **show status** 命令查看服务器状态信息。show status 命令会显示每个服务器变量 variable_name 和 value，状态变量是只读的。如果使用 SQL 命令，可以使用 like 或者 where 条件来限制结果。like 可以对变量名做标准模式匹配。

![image-20210725220256076](https://tva1.sinaimg.cn/large/008i3skNly1gstjnb23z0j30lu0d1jsk.jpg)

图我没有截全，下面还有很多变量，读者可以自己尝试一下。也可以在操作系统上使用 **mysqladmin extended-status** 命令来获取这些消息。

但是我执行 mysqladmin extended-status 后，出现这个错误。

![image-20210725220304607](https://tva1.sinaimg.cn/large/008i3skNly1gstjne9m71j30lv02kjrn.jpg)

应该是我没有输入密码的原因，使用 **mysqladmin -P3306 -uroot -p -h127.0.0.1 -r -i 1 extended-status** 后，问题解决。

这里需要注意一下 show status 命令中可以添加统计结果的级别，这个级别有两个

* session 级： 默认当前链接的统计结果
* global 级：自数据库上次启动到现在的统计结果

如果不指定统计结果级别的话，默认使用 session 级别。

对于 show status 查询出来的统计结果，有两类参数需要注意下，一类是以 `Com_` 为开头的参数，一类是以 `Innodb_` 为开头的参数。

下面是 Com_ 为开头的参数，参数很多，我同样没有截全。

![image-20210725220310637](https://tva1.sinaimg.cn/large/008i3skNly1gstjni4axjj30840eiq40.jpg)

Com_xxx 表示的是每个 xxx 语句执行的次数，我们通常关心的是 select 、insert 、update、delete 语句的执行次数，即

* Com_select：执行 select 操作的次数，一次查询会使结果 + 1。
* Com_insert：执行 INSERT 操作的次数，对于批量插入的 INSERT 操作，只累加一次。
* Com_update：执行 UPDATE 操作的次数。
* Com_delete：执行 DELETE 操作的次数。

以 Innodb_ 为开头的参数主要有

* Innodb_rows_read：执行 select 查询返回的行数。
* Innodb_rows_inserted：执行 INSERT 操作插入的行数。
* Innodb_rows_updated：执行 UPDATE 操作更新的行数。
* Innodb_rows_deleted：执行 DELETE 操作删除的行数。

通过上面这些参数执行结果的统计，我们能够大致了解到当前数据库是以更新（包括插入、删除）为主还是查询为主。

除此之外，还有一些其他参数用于了解数据库的基本情况。

* Connections：查询 MySQL 数据库的连接次数，这个次数是不管连接是否成功都算上。
* Uptime：服务器的工作时间。
* Slow_queries：满查询次数。
* Threads_connected：查看当前打开的连接的数量。

下面这个博客汇总了几乎所有 show status 的参数，可以当作参考手册。

https://blog.csdn.net/ayay_870621/article/details/88633092

### 定位执行效率较低的 SQL 

定位执行效率比较慢的 SQL 语句，一般有两种方式

* 可以通过**慢查询日志**来定位哪些执行效率较低的 SQL 语句。

MySQL 中提供了一个慢查询的日志记录功能，可以把查询 SQL 语句时间大于多少秒的语句写入慢查询日志，日常维护中可以通过慢查询日志的记录信息快速准确地判断问题所在。用 --log-slow-queries 选项启动时，mysqld 会写一个包含所有执行时间超过 long_query_time 秒的 SQL 语句的日志文件，通过查看这个日志文件定位效率较低的 SQL 。

比如我们可以在 my.cnf 中添加如下代码，然后退出重启 MySQL。

```mysql
log-slow-queries = /tmp/mysql-slow.log
long_query_time = 2
```

通常我们设置最长的查询时间是 2 秒，表示查询时间超过 2 秒就记录了，通常情况下 2 秒就够了，然而对于很多 WEB 应用来说，2 秒时间还是比较长的。

也可以通过命令来开启：

我们先查询 MySQL 慢查询日志是否开启

```mysql
show variables like "%slow%";
```

![image-20210725220321492](https://tva1.sinaimg.cn/large/008i3skNly1gstjnomxdhj30ls086q3x.jpg)

启用慢查询日志

```mysql
set global slow_query_log='ON';
```

![image-20210725220329215](https://tva1.sinaimg.cn/large/008i3skNly1gstjntupetj30lr03k0t0.jpg)

然后再次查询慢查询是否开启

![image-20210725220338780](https://tva1.sinaimg.cn/large/008i3skNly1gstjnzv6mhj30lq088t9o.jpg)

如图所示，我们已经开启了慢查询日志。

慢查询日志会在查询结束以后才记录，所以在应用反应执行效率出现问题的时候慢查询日志并不能定位问题，此时应该使用 **show processlist** 命令查看当前 MySQL 正在进行的线程。包括线程的状态、是否锁表等，可以实时的查看 SQL 执行情况。同样，使用**mysqladmin processlist**语句也能得到此信息。

![image-20210725220348702](https://tva1.sinaimg.cn/large/008i3skNly1gstjo6j215j30m404w74y.jpg)

下面就来解释一下各个字段对应的概念

* Id ：Id 就是一个标示，在我们使用 kill 命令杀死进程的时候很有用，比如 kill 进程号。
* User：显示当前的用户，如果不是 root，这个命令就只显示你权限范围内的 SQL 语句。
* Host：显示 IP ，用于追踪问题
* Db：显示这个进程目前连接的是哪个数据库，为 null 是还没有 select 数据库。
* Command：显示当前连接锁执行的命令，一般有三种：查询 query，休眠 sleep，连接 connect。
* Time：这个状态持续的时间，单位是秒
* State：显示当前 SQL 语句的状态，非常重要，下面会具体解释。
* Info：显示这个 SQL 语句。

State 列非常重要，关于这个列的内容比较多，读者可以参考一下这篇文章 

https://blog.csdn.net/weixin_34357436/article/details/91768402

这里面涉及线程的状态、是否锁表等选项，可以实时的查看 SQL 的执行情况，同时对一些锁表进行优化。

### 通过 EXPLAIN 命令分析 SQL 的执行计划

通过以上步骤查询到效率低的 SQL 语句后，可以通过 EXPLAIN 或者 DESC 命令获取 MySQL 如何执行 SELECT 语句的信息，包括在 SELECT 语句执行过程中表如何连接和连接的顺序。

比如我们使用下面这条 SQL 语句来分析一下执行计划

```mysql
explain select * from test1;
```

![image-20210725220359537](https://tva1.sinaimg.cn/large/008i3skNly1gstjocrso4j30m003lq3i.jpg)

上表中涉及内容如下

* select_type：表示常见的 SELECT 类型，常见的有 SIMPLE，SIMPLE 表示的是简单的 SQL 语句，不包括 UNION 或者子查询操作，比如下面这段就是 SIMPLE 类型。

![image-20210725220950577](https://tva1.sinaimg.cn/large/008i3skNly1gstjug59bdj30lz03f3z3.jpg)

PRIMARY ，查询中最外层的 SELECT（如两表做 UNION 或者存在子查询的外层的表操作为 PRIMARY，内层的操作为 UNION），比如下面这段子查询。

![image-20210725221000038](https://tva1.sinaimg.cn/large/008i3skNly1gstjulovtjj30m303iq3i.jpg)

UNION，在 UNION 操作中，查询中处于内层的 SELECT（内层的 SELECT 语句与外层的 SELECT 语句没有依赖关系时）。

SUBQUERY：子查询中首个SELECT（如果有多个子查询存在），如我们上面的查询语句，子查询第一个是 sr（sys_role）表，所以它的 select_type 是 SUBQUERY。

* table ，这个选项表示输出结果集的表。

* type，这个选项表示表的连接类型，这个选项很有深入研究的价值，因为很多 SQL 的调优都是围绕 type 来讲的，但是这篇文章我们主要围绕优化方式来展开的，type 这个字段我们暂时作为了解，这篇文章不过多深入。

  type 这个字段会牵扯到连接的性能，它的不同类型的性能由好到差分别是

  system ：表中仅有一条数据时，该表的查询就像查询常量表一样。

  const ：当表中只有一条记录匹配时，比如使用了表主键（primary key）或者表唯一索引（unique index）进行查询。

  eq-ref ：表示多表连接时使用表主键或者表唯一索引，比如

  ```mysql
  select A.text, B.text where A.ID = B.ID
  ```

  这个查询语句，对于 A 表中的每一个 ID 行，B 表中都只能有唯一的 B.Id 来进行匹配时。

  ref ：这个类型不如上面的 eq-ref 快，因为它表示的是因为对于表 A 中扫描的每一行，表 C 中有几个可能的行，C.ID 不是唯一的。

  ref_or_null ：与 ref 类似，只不过这个选项包含对 NULL 的查询。

  index_merge ：查询语句使用了两个以上的索引，比如经常在有 and 和 or 关键字出现的场景，但是在由于**读取索引过多**导致其性能有可能还不如 range（后面说）。

  unique_subquery ：这个选项经常用在 in 关键字后面，子查询带有 where 关键字的子查询中，用 sql 来表示就是这样

  ```mysql
  value IN (SELECT primary_key FROM single_table WHERE some_expr)
  ```

  range ：**索引范围查询**，常见于使用 =，<>，>，>=，<，<=，IS NULL，<=>，BETWEEN，IN() 或者 like 等运算符的查询中。

  index ：索引全表扫描，把索引从头到尾扫一遍。

  all ： 这个我们接触的最多了，就是全表查询，select * from xxx ，性能最差。

上面就是 type 内容的大致解释，关于 type 我们经常会在 SQL 调优的环节使用 explain 分析其类型，然后改进查询方式，越靠近 system 其查询效率越高，越靠近 all 其查询效率越低。

![image-20210725221018222](https://tva1.sinaimg.cn/large/008i3skNly1gstjux8ja9j30me0av74n.jpg)

* possible_keys ：表示查询时，可能使用的索引。
* key ：表示实际使用的索引。
* key_len ：索引字段的长度。
* rows ：扫描行的数量。
* filtered ：通过查询条件查询出来的 SQL 数量占用总行数的比例。
* extra ：执行情况的描述。

通过上面的分析，我们可以大致确定 SQL 效率低的原因，一种非常有效的提升 SQL 查询效率的方式就是使用索引，接下来我会讲解一下如何使用索引提高查询效率。

## 索引

索引是数据库优化中最常用也是最重要的手段，通过使用不同的索引可以解决大多数 SQL 性能问题，也是面试经常会问到的优化方式，围绕着索引，面试官能让你造出火箭来，所以总结一点就是索引非常非常重！要！不只是使用，你还要懂其原！理！

### 索引介绍

索引的目的就是用于快速查找某一列的数据，对相关数据列使用索引能够大大提高查询操作的性能。不使用索引，MySQL 必须从第一条记录开始读完整个表，直到找出相关的行，表越大查询数据所花费的时间就越多。如果表中查询的列有索引，MySQL 能够快速到达一个位置去搜索数据文件，而不必查看所有数据，那么将会节省很大一部分时间。

### 索引分类

先来了解一下索引都有哪些分类。

* `全局索引(FULLTEXT)`：全局索引，目前只有 MyISAM 引擎支持全局索引，它的出现是为了解决针对文本的模糊查询效率较低的问题，并且只限于 CHAR、VARCHAR 和 TEXT 列。
* `哈希索引(HASH)`：哈希索引是 MySQL 中用到的唯一 key-value 键值对的数据结构，很适合作为索引。HASH 索引具有一次定位的好处，不需要像树那样逐个节点查找，但是这种查找适合应用于查找单个键的情况，对于范围查找，HASH 索引的性能就会很低。默认情况下，MEMORY 存储引擎使用 HASH 索引，但也支持 BTREE 索引。
* `B-Tree 索引`：B 就是 Balance 的意思，BTree 是一种平衡树，它有很多变种，最常见的就是 B+ Tree，它被 MySQL 广泛使用。
* `R-Tree 索引`：R-Tree 在 MySQL 很少使用，仅支持 geometry 数据类型，支持该类型的存储引擎只有MyISAM、BDb、InnoDb、NDb、Archive几种，相对于 B-Tree 来说，R-Tree 的优势在于范围查找。

从逻辑上来对 MySQL 进行分类，主要分为下面这几种

* 普通索引：普通索引是最基础的索引类型，它没有任何限制 。创建方式如下

  ```mysql
  create index normal_index on cxuan003(id);
  ```

  ![image-20210725221035791](https://tva1.sinaimg.cn/large/008i3skNly1gstjv7wo4cj30kx03kwev.jpg)

  删除方式 

  ```mysql
  drop index normal_index on cxuan003;
  ```

  ![image-20210725221050699](https://tva1.sinaimg.cn/large/008i3skNly1gstjvh4jffj30kk03st94.jpg)

* 唯一索引：唯一索引列的值必须唯一，允许有空值，如果是组合索引，则列值的组合必须唯一，创建方式如下

  ```mysql
  create unique index normal_index on cxuan003(id);
  ```

  ![image-20210725221100948](https://tva1.sinaimg.cn/large/008i3skNly1gstjvnmw2hj30kv02z0t0.jpg)

* 主键索引：是一种特殊的索引，一个表只能有一个主键，不允许有空值。一般是在建表的时候同时创建主键索引。

  ```mysql
  CREATE TABLE `table` (
           `id` int(11) NOT NULL AUTO_INCREMENT ,
           `title` char(255) NOT NULL ,
           PRIMARY KEY (`id`)
  )
  ```

  ![image-20210725221205132](https://tva1.sinaimg.cn/large/008i3skNly1gstjwsr29cj30l406lq3j.jpg)

* 组合索引：指多个字段上创建的索引，只有在查询条件中使用了创建索引时的第一个字段，索引才会被使用。使用组合索引时遵循最左前缀原则，下面我们就会创建组合索引。

* 全文索引：主要用来查找文本中的关键字，而不是直接与索引中的值相比较，目前只有 char、varchar，text 列上可以创建全文索引，创建表的适合添加全文索引

  ```mysql
  CREATE TABLE `table` (
      `id` int(11) NOT NULL AUTO_INCREMENT ,
      `title` char(255) CHARACTER NOT NULL ,
      `content` text CHARACTER NULL ,
      `time` int(10) NULL DEFAULT NULL ,
      PRIMARY KEY (`id`),
      FULLTEXT (content)
  );
  ```

  当然也可以直接创建全局索引

  ```mysql
  CREATE FULLTEXT INDEX index_content ON article(content)
  ```

### 索引使用

索引可以在创建表的时候进行创建，也可以单独创建，下面我们采用单独创建的方式，我们在 cxuan004 上创建前缀索引

![image-20210725221243114](https://tva1.sinaimg.cn/large/008i3skNly1gstjxfg2uvj30lt043jrt.jpg)

我们使用 `explain` 进行分析，可以看到 cxuan004 使用索引的情况

![image-20210725221251567](https://tva1.sinaimg.cn/large/008i3skNly1gstjxkm40cj30m203aaai.jpg)

如果不想使用索引，可以删除索引，索引的删除语法是

![image-20210725221259304](https://tva1.sinaimg.cn/large/008i3skNly1gstjxpmwv5j30ln04iwey.jpg)

#### 索引使用细则

我们在 cxuan005 上根据 id 和 hash 创建一个复合索引，如下所示

```mysql
create index id_hash_index on cxuan005(id,hash);
```

![image-20210725221312587](https://tva1.sinaimg.cn/large/008i3skNly1gstjxyfmmhj30lt03ft92.jpg)

然后根据 id 进行执行计划的分析

```mysql
explain select * from cxuan005 where id = '333';
```

![image-20210725221329531](https://tva1.sinaimg.cn/large/008i3skNly1gstjy95ugxj30m603agm3.jpg)

可以发现，即使 where 条件中使用的不是复合索引（Id 、hash），索引仍然能够使用，这就是索引的前缀特性。但是如果只按照 hash 进行查询的话，索引就不会用到。

```mysql
explain select * from cxuan005 where hash='8fd1f12575f6b39ee7c6d704eb54b353';
```

![image-20210725221338261](https://tva1.sinaimg.cn/large/008i3skNly1gstjye3zntj30m203b0t9.jpg)

如果 where 条件使用了 like 查询，并且 `%` 不在第一个字符，索引才可能被使用。

对于复合索引来说，只能使用 id 进行 like 查询，因为 hash 列不管怎么查询都不会走索引。

```mysql
explain select * from cxuan005 where id like '%1';
```

![image-20210725221345937](https://tva1.sinaimg.cn/large/008i3skNly1gstjyipxcyj30m4038gm2.jpg)

可以看到，如果第一个字符是 % ，则没有使用索引。

```mysql
explain select * from cxuan005 where id like '1%';
```

![image-20210725221354590](https://tva1.sinaimg.cn/large/008i3skNly1gstjyo8s7jj30m102q3yv.jpg)

如果使用了 % 号，就会触发索引。

如果列名是索引的话，那么对列名进行 NULL 查询，将会触发索引。

```mysql
explain select * from cxuan005 where id is null;
```

![image-20210725221402396](https://tva1.sinaimg.cn/large/008i3skNly1gstjyt4pb9j30lv02wjrr.jpg)

还有一些情况是存在索引但是 MySQL 并不会使用的情况。

* 最简单的，如果使用索引后比不使用索引的效率还差，那么 MySQL 就不会使用索引。

* 如果 SQL 中使用了 OR 条件，OR 前的条件列有索引，而后面的列没有索引的话，那么涉及到的索引都不会使用，比如 cxuan005 表中，只有 id 和 hash 字段有索引，而 info 字段没有索引，那么我们使用 or 进行查询。

  ```mysql
  explain select * from cxuan005 where id = 111 and info = 'cxuan';
  ```

  ![image-20210725221411013](https://tva1.sinaimg.cn/large/008i3skNly1gstjyy1mllj30l8038q3d.jpg)

  我们从 explain 的执行结果可以看到，虽然 possible_keys 选项上仍然有 id_hash_index 索引，但是从 key、key_len 可以得知，这条 SQL 语句并未使用索引。

* 在带有复合索引的列上查询不是第一列的数据，也不会使用索引。

  ```mysql
  explain select * from cxuan005 where hash = '8fd1f12575f6b39ee7c6d704eb54b353';
  ```

  ![image-20210725221418223](https://tva1.sinaimg.cn/large/008i3skNly1gstjz2pvyuj30lb03bwez.jpg)

* 如果 where 条件的列参与了计算，那么也不会使用索引

  ```mysql
  explain select * from cxuan005 where id + '111' = '666';
  ```

  ![image-20210725221424993](https://tva1.sinaimg.cn/large/008i3skNly1gstjz6xyayj30l8036wew.jpg)

* 索引列使用函数，一样也不会使用索引

  ```mysql
  explain select * from cxuan005 where concat(id,'111') = '666';
  ```

  ![image-20210725221433421](https://tva1.sinaimg.cn/large/008i3skNly1gstjzc52jxj30l4033mxl.jpg)

* 索引列使用了 like ，并且 `%` 位于第一个字符，则不会使用索引。

* 在 order by 操作中，排序的列同时也在 where 语句中，将不会使用索引。

* 当数据类型出现隐式转换时，比如 varchar 不加单引号可能转换为 int 类型时，会使索引无效，触发全表扫描。比如下面这两个例子能够显而易见的说明这一点

  ![image-20210725221450982](https://tva1.sinaimg.cn/large/008i3skNly1gstjznrqqrj30l606ut9s.jpg)

* 在索引列上使用 IS NOT NULL 操作

  ![image-20210725221500897](https://tva1.sinaimg.cn/large/008i3skNly1gstjztl480j30ld032dgb.jpg)

* 在索引字段上使用 <>，!=。不等于操作符是永远不会用到索引的，因此对它的处理只会产生全表扫描。

  ![image-20210725221516453](https://tva1.sinaimg.cn/large/008i3skNly1gstk03on3yj30l806l3zo.jpg)


关于设置索引但是索引没有生效的场景还有很多，这个需要小伙伴们工作中不断总结和完善，不过我上面总结的这些索引失效的情景，能够覆盖大多数索引失效的场景了。

### 查看索引的使用情况

在 MySQL 索引的使用过程中，有一个 `Handler_read_key` 值，这个值表示了**某一行被索引值读的次数**。 Handler_read_key 的值比较低的话，则表明增加索引得到的性能改善不是很理想，可能索引使用的频率不高。

还有一个值是 `Handler_read_rnd_next`，这个值高则意味着查询运行效率不高，应该建立索引来进行抢救。这个值的含义是在数据文件中读下一行的请求数。如果正在进行大量的表扫描，Handler_read_rnd_next 的值比较高，就说明表索引不正确或写入的查询没有利用索引。

![image-20210725221523808](https://tva1.sinaimg.cn/large/008i3skNly1gstk07krnej608h06kmxh02.jpg)

## MySQL 分析表、检查表和优化表

对于大多数开发者来说，他们更倾向于解决简单 SQL的优化，而复杂 SQL 的优化交给了公司的 DBA 来做。

下面就从普通程序员的角度和你聊几个简单的优化方式。

### MySQL 分析表

分析表用于分析和存储表的关键字分布，分析的结果可以使得系统得到准确的统计信息，使得 SQL 生成正确的执行计划。如果用于感觉实际执行计划与预期不符，可以执行分析表来解决问题，分析表语法如下

```mysql
analyze table cxuan005;
```

![image-20210725221609223](https://tva1.sinaimg.cn/large/008i3skNly1gstk11blszj30dy053q3b.jpg)

分析结果涉及到的字段属性如下

Table：表示表的名称；

Op：表示执行的操作，analyze 表示进行分析操作，check 表示进行检查查找，optimize 表示进行优化操作；

Msg_type：表示信息类型，其显示的值通常是状态、警告、错误和信息这四者之一；

Msg_text：显示信息。

对表的定期分析可以改善性能，应该成为日常工作的一部分。因为通过更新表的索引信息对表进行分析，可改善数据库性能。

### MySQL 检查表

数据库经常可能遇到错误，比如数据写入磁盘时发生错误，或是索引没有同步更新，或是数据库未关闭 MySQL 就停止了。遇到这些情况，数据就可能发生错误： **Incorrect key file for table: ' '. Try to repair it**. 此时，我们可以使用 Check Table 语句来检查表及其对应的索引。

```mysql
check table cxuan005;
```

![image-20210725221721399](https://tva1.sinaimg.cn/large/008i3skNly1gstk29bhdvj30do04t74l.jpg)

检查表的主要目的就是检查一个或者多个表是否有错误。Check Table 对 MyISAM 和 InnoDB 表有作用。Check Table 也可以检查视图的错误。

### MySQL 优化表

MySQL 优化表适用于删除了大量的表数据，或者对包含 VARCHAR、BLOB 或则 TEXT 命令进行大量修改的情况。MySQL 优化表可以将大量的空间碎片进行合并，消除由于删除或者更新造成的空间浪费情况。它的命令如下

```mysql
optimize table cxuan005;
```

![image-20210725221753373](https://tva1.sinaimg.cn/large/008i3skNly1gstk2u98lrj30m404haaj.jpg)

我的存储引擎是 InnoDB 引擎，但是从图可以知道，InnoDB 不支持使用 optimize 优化，建议使用 recreate + analyze 进行优化。optimize 命令只对 MyISAM 、BDB 表起作用。

## 常用 SQL 优化

前面我们介绍了使用索引来优化 MySQL ，那么对于 SQL 的各种语法，句法来说，应该怎样优化呢？下面，我会从 SQL 命令的角度来聊一波 SQL 优化。

### 导入的优化

对于 MyISAM 类型的表，可以通过下面这种方式导入大量的数据

```mysql
ALTER TABLE tblname DISABLE KEYS;
loading the data
ALTER TABLE tblname ENABLE KEYS;
```

这两个命令用来打开或者关闭 MyISAM 表非唯一索引的更新。在导入大量的数据到一个非空的 MyISAM 表时，通过设置这两个命令，可以提高导入的效率。对于导入大量数据到一个空的 MyISAM 表，默认就是先导入数据然后才创建索引，所以不用进行设置。

但是对于 InnoDB 搜索引擎的表来说，这样做不能提高导入效率，我们有以下几种方式可以提高导入的效率：

1. 因为 InnoDB 类型的表是按照主键的顺序保存的，所以将导入的数据按照主键的顺序排列，可以有效的提高导入数据的效率。如果 InnoDB 表没有主键，那么系统会默认创建一个内部列作为主键，所以如果可以给表创建一个主键，将可以利用这个优势提高导入数据的效率。
2. 在导入数据前执行 SET UNIQUE_CHECKS = 0，关闭唯一性校验，在导入结束后执行SETUNIQUE_CHECKS = 1，恢复唯一性校验，可以提高导入的效率。
3. 如果应用使用自动提交的方式，建议在导入前执行 SET AUTOCOMMIT = 0，关闭自动提交，导入结束后再执行 SET AUTOCOMMIT = 1，打开自动提交，也可以提高导入的效率。

### insert 的优化

当进行插入语句的时候，可以考虑采用下面这几种方式进行优化

* 如果向同一张表插入多条数据的话，最好一次性插入，这样可以减少数据库建立连接 -> 断开连接的时间，如下所示

```mysql
insert into test values(1,2),(1,3),(1,4)
```

* 如果向不同的表插入多条数据，可以使用 **insert delayed** 语句提高执行效率。delayed 的含义是让 insert 语句马上执行，要么数据都会放在内存的队列中，并没有真正写入磁盘。
* 对于 MyISAM 表来说，可以增加 bulk_insert_buffer_size 的值提高插入效率。
* 最好将索引和数据文件在不同的磁盘上存放。

### group by 的优化

在使用分组和排序的场景下，如果先进行 Group By 再进行 Order By 的话，可以指定 **order by null** 禁止排序，因为 order by null 可以避免 `filesort` ，filesort 往往很耗费时间。如下所示

```mysql
explain select id,sum(moneys) from sales2 group by id order by null;
```

### order by 的优化

在执行计划中，经常可以看到 `Extra` 列出现了 filesort，filesort 是一种文件排序，这种排序方式比较慢，我们认为是不好的排序，需要进行优化。

![image-20210629093920867](https://tva1.sinaimg.cn/large/008i3skNgy1gsmfpkk830j31ie06sgnz.jpg)

优化的方式是要使用索引。

我们在 cxuan005 上创建一个索引。

```mysql
create index idx on cxuan005(id);
```

![image-20210629095458317](https://tva1.sinaimg.cn/large/008i3skNgy1gsmfpibkknj30g003474m.jpg)

然后我们使用查询字段和排序相同的顺序进行查询。

```mysql
explain select id from cxuan005 where id > '111' order by id;
```

![image-20210629095636413](https://tva1.sinaimg.cn/large/008i3skNgy1gsmfpmu5m4j31jg06u76m.jpg)

可以看到，在这次查询中，使用的是 `Using index`。这表明我们使用的是索引。

如果创建索引和 order by 的顺序不一致，将会使用 Using filesort。

```mysql
explain select id from cxuan005 where id > '111' order by info;
```

![image-20210629101103501](https://tva1.sinaimg.cn/large/008i3skNgy1gsmfpleacxj31jy06udi7.jpg)

MySQL 支持两种方式的排序，filesort 和 index，Using index 是指 MySQL 扫描索引本身完成排序。index 效率高，filesort 效率低。

order by 在满足下面这些情况下才会使用 index

* order by 语句使用索引最左前列。
* 使用 where 子句与 order by 子句条件列组合满足索引最左前列。

### 优化嵌套查询

嵌套查询是我们经常使用的一种查询方式，这种查询方式可以使用 SELECT 语句来创建一个单独的查询结果，然后把这个结果当作嵌套语句的查询范围用在另一个查询语句中。使用时子查询可以将一个复杂的查询拆分成一个个独立的部分，逻辑上更易于理解以及代码的维护和重复使用。

但是某些情况下，子查询的效率不高，一般使用 `join` 来替代子查询。

使用嵌套查询的 SQL 语句进行 explain 分析如下

```mysql
explain select c05.id from cxuan005 c05 where id not in (select id from cxuan003);
```

![image-20210629152925407](https://tva1.sinaimg.cn/large/008i3skNgy1gsmfpm9ch1j31uu07itc3.jpg)

从 explain 的结果可以看出，主表的查询是 index ，子查询是 index_subquery ，这两个执行效率都不高。我们使用 join 来优化后的分析计划如下。

```mysql
explain select c05.id from cxuan005 c05 left join cxuan003 c03 on c05.id = c03.id;
```

![image-20210629153729525](https://tva1.sinaimg.cn/large/008i3skNgy1gsmfpjhqt6j31nm07ytbs.jpg)

从 explain 分析结果可以看到，主表查询和子查询分别是 index 和 ref，而 ref 的执行效率相对较高，一般 type 的效率由高到低是 System-->const-->eq_ref-->ref--> fulltext-->ref_or_null-->index_merge-->unique_subquery-->index_subquery-->range-->index-->all 。

### count 的优化

count 我们大家用的太多了，一般都用来统计某一列结果集的行数，当 MySQL 确认括号内的表达式不可能为空时，实际上就是在统计行数。

其实 count 还有另一层统计方式：**统计某个列值的数量**，在统计列值数量的时候，它默认不会统计 `NULL` 值。

我们经常犯的一个错误就是，在括号内指定一个列但是却希望统计结果集的行数。如果想要知道结果集行数的话，最好使用 count(*)。

### limit 分页的优化

通常我们的系统会进行分页，一般情况下我们会使用 limit 加上偏移量来实现。同时还会加上 order by 语句进行排序。如果使用索引的情况下，效率一般不会有什么问题，如果没有使用索引的话，MySQL 就可能会做大量的文件排序操作。

通常我们可能会遇到比如 limit 1000 , 50 这种情况，抛弃 1000 条，只取 50 条，这样的代价非常高，如果所有页面被访问的频率相同，那么这样的查询平均需要访问半个表的数据。

要优化这种查询，要么**限制分页的数量**，要么**优化大偏移量的性能**。

### SQL 中 IN 包含的值不应该太多

MySQL 中对 IN 做了相应的优化，MySQL 会将全部的常量存储在一个数组里面，如果数值较多，产生的消耗也会变大，比如

```mysql
select name from dual where num in(4,5,6)
```

像这种 SQL 语句的话，能用 between 使用就不要再使用 in 了。

### 只需要一条数据的情况

如果只需要一条数据的情况下，推荐使用 `limit 1`，这样会使执行计划中的 type 变为 `const`。

### 如果没有使用索引，就尽量减少排序

### 尽量用 union all 来代替 union

union 和 union all 的差异主要是前者需要将结果集合并后再进行唯一性过滤操作，这就会涉及到排序，增加大量的 CPU 运算，加大资源消耗及延迟。当然，union all 的前提条件是两个结果集没有重复数据。

### where 条件优化

* 避免在 WHERE 字句中对字段进行 NULL 判断

* 避免在 WHERE 中使用 != 或 <> 操作符
* 不建议使用 % 前缀模糊查询，例如 LIKE “%name”或者LIKE “%name%”，这种查询会导致索引失效而进行全表扫描。但是可以使用LIKE “name%”。
* 避免在 where 中对字段进行表达式操作，比如 **select user_id,user_project from table_name where age*2=36 ** 就是一种表达式操作，建议改为 **select user_id,user_project from table_name where age=36/2 **
* 建议在 where 子句中确定 column 的类型，避免 column 字段的类型和传入的参数类型不一致的时候发生的类型转换。

### 查询时，尽量指定查询的字段名

我们在日常使用 select 查询时，尽量使用 select 字段名 这种方式，避免直接 **select * **，这样增加很多不必要的消耗（cpu、io、内存、网络带宽）；而且查询效率比较低。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


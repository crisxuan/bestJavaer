# MySQL 高级主题

之前两篇文章带你了解了 MySQL 的基础语法和 MySQL 的进阶内容，那么这篇文章我们来了解一下 MySQL 中的高级内容。

## 事务控制和锁定语句

我们知道，MyISAM 和 MEMORY 存储引擎支持`表级锁定(table-level locking)`，InnoDB 存储引擎支持`行级锁定(row-level locking)`，BDB 存储引擎支持`页级锁定(page-level locking)`。各个锁定级别的特点如下

页级锁：销和加锁时间界于表锁和行锁之间；会出现死锁；锁定粒度界于表锁和行锁之间，并发度一般 

表级锁：表级锁是对整张表进行加锁，MyISAM 和 MEMORY 主要支持表级锁，表级锁加锁快，不会出现死锁，锁的粒度比较粗，并发度最低

行级锁：行级锁可以说是 MySQL 中粒度最细的一种锁了，InnoDB 支持行级锁，行级锁容易发生死锁，并发度比较好，同时锁的开销也比较大。

MySQL 默认情况下支持表级锁定和行级锁定。但是在某些情况下需要手动控制事务以确保整个事务的完整性，下面我们就来探讨一下事务控制。但是在探讨事务控制之前我们先来认识一下两个锁定语句

### 锁定语句

MySQL 的锁定语句主要有两个 `Lock` 和 `unLock`，Lock Tables 可用于锁定当前线程的表，就跟 Java 语法中的 Lock 锁的用法是一样的，如果表锁定，意味着其他线程不能再操作表，直到锁定被释放为止。如下图所示

```mysql
lock table cxuan005 read;
```

![](https://s3.ax1x.com/2021/01/26/sOj1bR.png)

我们锁定了 cxuan005 的 read 锁，然后这时我们再进行一次查询，看看是否能够执行这条语句

```mysql
select * from cxuan005 where id = 111;
```

![](https://s3.ax1x.com/2021/01/26/sOj8V1.png)

可以看到，在进行 read 锁定了，我们仍旧能够执行查询语句。

现在我们另外起一个窗口，相当于另起了一个线程来进行查询操作。

```mysql
select * from cxuan005;
```

![](https://s3.ax1x.com/2021/01/26/sOjGUx.png)

这是第二个窗口执行查询的结果，可以看到，在一个线程执行 read 锁定后，其他线程仍然可以进行表的查询操作。

那么第二个线程能否执行更新操作呢？我们来看一下

```mysql
update cxuan005 set info='cxuan' where id = 111;
```

![](https://s3.ax1x.com/2021/01/26/sOjlr9.png)

发生了什么？怎么没有提示结果呢？其实这个情况下表示 cxuan005 已经被加上了 read 锁，由于当前线程不是持有锁的线程，所以当前线程无法执行更新。

### 解锁语句

现在我们把窗口切换成持有 read 锁的线程，来进行 read 锁的解锁

```mysql
unlock tables;
```

![](https://s3.ax1x.com/2021/01/26/sOjQKJ.png)

在解锁完成前，进行更新的线程会一直等待，直到解锁完成后，才会进行更新。我们可以看一下更新线程的结果。

![](https://s3.ax1x.com/2021/01/26/sOjJ56.png)

可以看到，线程已经更新完毕，我们看一下更新的结果

```mysql
select * from cxuan005 where id = 111;
```

![](https://s3.ax1x.com/2021/01/26/sOjtPK.png)

如上图所示，id = 111 的值已经被更新成了 cxuan。

## 事务控制

`事务(Transaction)` 是访问和更新数据库的基本执行单元，一个事务中可能会包含多个 SQL 语句，事务中的这些 SQL 语句要么都执行，要么都不执行，而 MySQL 它是一个关系型数据库，它自然也是支持事务的。事务同时也是区分关系型数据库和非关系型数据库的一个重要的方面。

在 MySQL 事务中，主要涉及的语法包含 **SET AUTOCOMMIT、START TRANSACTION、COMMIT 和 ROLLBACK** 等。

### 自动提交

在 MySQL 中，事务默认是`自动提交(Autocommit)`的，如下所示

```mysql
show variables like 'autocommit';
```

![](https://s3.ax1x.com/2021/01/26/sOjN8O.png)

在自动提交的模式下，每个 SQL 语句都会当作一个事务执行提交操作，例如我们上面使用的更新语句

```mysql
update cxuan005 set info='cxuan' where id = 111;
```

> 如果想要关闭数据库的自动提交应该怎么做呢？

其实，MySQL 是可以关闭自动提交的，你可以执行

```mysql
set autocommit = 0;
```

![](https://s3.ax1x.com/2021/01/26/sOjU2D.png)

然后我们再看一下自动提交是否关闭了，再次执行一下 show variables like 'autocommit' 语句

![](https://s3.ax1x.com/2021/01/26/sOjaxe.png)

可以看到，自动提交已经关闭了，再次执行

```mysql
set autocommit = 1;
```

会再次开启自动提交。

>这里注意一下特殊操作。
>
>在 MySQL 中，存在一些特殊的命令，如果在事务中执行了这些命令，会马上强制执行 commit 提交事务；比如 DDL 语句(create table/drop table/alter/table)、lock tables 语句等等。
>
>不过，常用的 select、insert、update 和 delete命令，都不会强制提交事务。	

### 手动提交

如果需要手动 commit 和 rollback 的话，就需要明确的事务控制语句了。

典型的 MySQL 事务操作如下

```mysql
start transaction;
... # 一条或者多条语句
commit;
```

上面代码中的 start transaction 就是事务的开始语句，编写 SQL 后会调用 commit 提交事务，然后将事务统一执行，如果 SQL 语句出现错误会自动调用 Rollback 进行回滚。	

下面我们就通过示例来演示一下 MySQL 的事务，同样的，我们需要启动两个窗口来演示，为了便于区分，我们使用 mysql01 和 mysql02 来命名。

![](https://s3.ax1x.com/2021/01/26/sOjwKH.png)

我们用 `start transaction` 命令启动一个事务，然后再 cxuan005 表中插入一条数据，此时 mysql02 不做任何操作。涉及的 SQL 语句如下。

```mysql
start transaction;
```

![](https://s3.ax1x.com/2021/01/26/sOj0rd.png)

然后执行 

```mysql
select * from cxuan005;
```

查询一下 cxuan005 中的数据

![](https://s3.ax1x.com/2021/01/26/sOjrVI.png)

嗯。。。很多长度太长了，现在我们把所有的 info 数据都更新为 cxuan 。

```mysql
update cxuan005 set info='cxuan';
```

![](https://s3.ax1x.com/2021/01/26/sOjBqA.png)

更新完毕后，我们先不提交事务，分别在 mysql01 和 mysql02 中进行查询，发现只有 mysql01 窗口中的查询已经生效，而 mysql02 中还是更新前的数据

![](https://s3.ax1x.com/2021/01/26/sOjsat.png)

现在我们在 mysql01 中 commit 当前事务，然后在 mysql02 中查询，发现数据已经被修改了。

除了 commit 之外，MySQL 中还有 `commit and chain` 命令，这个命令会提交当前事务并且重新开启一个新的事务。如下代码所示

```mysql
start transaction; # 开启一个新的事务
insert into cxuan005(id,info) values (555,'cxuan005'); # 插入一条数据
commit and chain; # 提交当前事务并重新开启一个事务
```

上面是一个事务操作，在 commit and chain 键入后，我们可以再次执行 SQL 语句

```mysql
update cxuan005 set info = 'cxuan' where id = 555;
commit;
```

然后再次查询

```mysql
select * from cxuan005;
```

![](https://s3.ax1x.com/2021/01/26/sOjgG8.png)

执行后，可以发现，我们仅仅使用了一个 start transaction 命令就执行了两次事务操作。

如果在手动提交的事务中，你发现有一条 SQL 语句写的不正确或者有其他原因需要回滚，那么此时你就会用到 `rollback` 语句，它会回滚当前事务，相当于什么也没发生。如下代码所示。

```mysql
start transaction;
delete from cxuan005 where id = 555;
rollback;
```

>这里`切忌`一点：delete 删除语句一定要加 where ，不加 where 语句的删除就是耍流氓。

在同一个事务操作中，最好使用相同存储引擎的表，如果使用不同存储引擎的表后，rollback 语句会对非事务类型的表进行特别处理，因此 commit 、rollback 只能对事务类型的表进行提交和回滚。

我们提交的事务一般都会被记录到二进制的日志中，但是如果一个事务中包含非事务类型的表，那么回滚操作也会被记录到二进制日志中，以确保非事务类型的表可以被复制到从数据库中。

这里解释一下什么是事务表和非事务表

#### 事务表和非事务表

事务表故名思义就是支持事务的表，支不支持事务和 MySQL 的存储类型有关，一般情况下，`InnoDB` 存储引擎的表是支持事务的，关于 InnoDB 的知识，我们会在后面详细介绍。

非事务表相应的就是不支持事务的表，在 MySQL 中，存储引擎 `MyISAM` 是不支持事务的，非事务表的特点是不支持回滚。

对于回滚的话，还要讲一点就是 `SAVEPOINT`，它能指定事务回滚的一部分，但是不能指定事务提交的一部分。 SAVEPOINT 可以指定多个，在满足不同条件的同时，回滚不同的 SAVEPOINT。需要注意的是，如果定义了两个相同名称的 SAVEPOINT，则后面定义的 SAVEPOINT 会覆盖之前的定义。如果 SAVEPOINT 不再需要的话，可以通过 `RELEASE SAVEPOINT` 来进行删除。删除后的 SAVEPOINT 不能再执行 ROLLBACK TO SAVEPOINT 命令。

我们通过一个示例来进行模拟不同的 SAVEPOINT 

首先先启动一个事务 ，向 cxuan005 中插入一条数据，然后进行查询，那么是可以查询到这条记录的

```mysql
start transaction;
insert into cxuan005(id,info) values(666,'cxuan666');
select * from cxuan005 where id = 666;
```

查询之后的记录如下

![](https://s3.ax1x.com/2021/01/26/sOjyIP.png)

然后我们定义一个 SAVEPOINT，如下所示

```mysql
savepoint test;
```

然后继续插入一条记录

```mysql
insert into cxuan005(id,info) values(777,'cxuan777');
```

此时就可以查询到两条新增记录了，id 是 666 和 777 的记录。

```mysql
select * from cxuan005 where id = 777;
```

![](https://s3.ax1x.com/2021/01/26/sOjcPf.png)

那么我们可以回滚到刚刚定义的 SAVEPOINT

```mysql
rollback to savepoint test;
```

再次查询 cxuan005 这个表，可以看到，只有 id=666 的这条记录插入进来了，说明 id=777 这条记录已经被回滚了。

![](https://s3.ax1x.com/2021/01/26/sOjRxg.png)

此时我们看到的都是 mysql01 中事务还没有提交前的状态，所以这时候 mysql02 中执行查询操作是看不到 666 这条记录的。

然后我们在 mysql01 中执行 commit 操作，那么此时在 mysql02 中就可以查询到这条记录了。

## SQL 安全问题

SQL 安全问题应该是我们程序员比较忽视的一个地方了。日常开发中，我们一般只会关心 SQL 能不能解决我们的业务问题，能不能把数据查出来，而对于 SQL 问题，我们一般都认为这是 DBA 的活，其实我们 CRUD 程序员也应该了解一下 SQL 的安全问题。

### SQL 注入简介

SQL 注入就是利用某些数据库的外部接口将用户数据插入到实际的 SQL 中，从而达到入侵`数据库`的目的。SQL 注入是一种常见的网络攻击的方式，它不是利用操作系统的 BUG 来实现攻击的。SQL 主要是针对程序员编写时的疏忽来入侵的。

SQL 注入攻击有很大的危害，攻击者可以利用它读取、修改或者删除数据库内的数据，获取数据库中的用户名和密码，甚至获得数据库管理员的权限。并且 SQL 注入一般比较难以防范。

## SQL Mode 

MySQL 可以运行在不同的 SQL Mode 模式下，不同的 SQL Mode 定义了不同的 SQL 语法，数据校验规则，这样就能够在不同的环境中使用 MySQL ，下面我们就来介绍一下 SQL Mode。

### SQL Mode 解决问题

SQL Mode 可以解决下面这几种问题

* 通过设置 SQL Mode，可以完成不同严格程度的数据校验，有效保障数据的准确性。
* 设置 SQL Mode 为 `ANSI` 模式，来保证大多数 SQL 符合标准的 SQL 语法，这样应用在不同数据库的迁移中，不需要对 SQL 进行较大的改变
* 数据在不同数据库的迁移中，通过改变 SQL Mode 能够更方便的进行迁移。

下面我们就通过示例来演示一下 SQL Mode 用法

我们可以通过 

```mysql
select @@sql_mode;
```

来查看默认的 SQL Mode，如下是我的数据库所支持的 SQL Mode

![](https://s3.ax1x.com/2021/01/26/sOj2RS.png)

涉及到很多 SQL Mode，下面是这些 SQL Mode 的解释

`ONLY_FULL_GROUP_BY`：这个模式会对 GROUP BY 进行合法性检查，对于 GROUP BY 操作，如果在SELECT 中的列，没有在 GROUP BY 中出现，那么将认为这个 SQL 是不合法的，因为列不在 GROUP BY 从句中

同样举个例子，我们现在查询一下 cxuan005 的 id 和 info 字段。

```mysql
select id,info from cxuan005;
```

这样是可以运行的

![](https://s3.ax1x.com/2021/01/26/sOjhrj.png)

然后我们使用 GROUP BY 字句进行分组，这里只对 info 进行分组，我们看一下会出现什么情况

```mysql
select id,info from cxuan005 group by info;
```

![](https://s3.ax1x.com/2021/01/26/sOjfMQ.png)

我们可以从错误原因中看到，这条 SQL 语句是不符合 ONLY_FULL_GROUP_BY 的这条 SQL Mode 的。因为我们只对 info 进行分组了，没有对 id 进行分组，我们把 SQL 语句改成如下形式

```mysql
select id,info from cxuan005 group by id,info;
```

![](https://s3.ax1x.com/2021/01/26/sOj4qs.png)

这样 SQL 就能正确执行了。

当然，我们也可以删除 sql_mode = ONLY_FULL_GROUP_BY 的这条 Mode，可以使用 

```mysql
SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));
```

来进行删除，删除后我们使用分组语句就可以放飞自我了。

```mysql
select id,info from cxuan005 group by info;
```

![](https://s3.ax1x.com/2021/01/26/sOjIZn.png)

但是这种做法只是暂时的修改，我们可以修改配置文件 my.ini 中的 sql_mode= STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION

`STRICT_TRANS_TABLES`：这就是严格模式，在这个模式下会对数据进行严格的校验，错误数据不能插入，报error 错误。如果不能将给定的值插入到事务表中，则放弃该语句。对于非事务表，如果值出现在单行语句或多行语句的第1行，则放弃该语句。

>当使用 innodb 存储引擎表时，考虑使用 innodb_strict_mode 模式的 sql_mode，它能增量额外的错误检测功能。

`NO_ZERO_IN_DATE`：这个模式影响着日期中的月份和天数是否可以为 0（注意年份是非 0 的），这个模式也取决于严格模式是否被启用。如果这个模式未启用，那么日期中的零部分被允许并且插入没有警告。如果这个模式启用，那么日期中的零部分插入被作为 `0000-00-00` 并且产生一个警告。

这个模式需要注意下，如果启用的话，需要 `STRICT_TRANS_TABLES` 和 `NO_ZERO_IN_DATE` 同时启用，否则不起作用，也就是 

```mysql
set session sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE';
```

然后我们换表了，使用 cxuan003 这张表，表结构如下

![](https://s3.ax1x.com/2021/01/26/sOjTI0.png)

我们主要测试日期的使用，在 cxuan003 中插入一条日期为 `0000-00-00` 的数据

```mysql
insert into cxuan003 values(111,'study','0000-00-00');
```

发现能够执行成功，但是把年月日各自变为 0 之后再进行插入，则会插入失败。

```mysql
insert into cxuan003 values(111,'study','2021-00-00');
```

![](https://s3.ax1x.com/2021/01/26/sOjoaq.png)

```mysql
insert into cxuan003 values(111,'study','2021-01-00');
```

![](https://s3.ax1x.com/2021/01/26/sOjHiV.png)

这些组合有很多，我这里就不再细致演示了，读者可以自行测试。

如果要插入 `0000-00-00` 这样的数据，必须设置 `NO_ZERO_IN_DATE` 和 `NO_ZERO_DATE`。

`ERROR_FOR_DIVISION_BY_ZERO`：如果这个模式未启用，那么零除操作将会插入空值并且不会产生警告；如果这个模式启用，零除操作插入空值并产生警告；如果这个模式和严格模式都启用，零除从操作将会产生一个错误。

`NO_AUTO_CREATE_USER`：禁止使用 grant 语句自动创建用户，除非认证信息被指定。

`NO_ENGINE_SUBSTITUTION`：此模式指定当执行 create 语句或者 alter 语句指定的存储引擎没有启用或者没有编译时，控制默认存储引擎的自动切换。默认是启用状态的。

### SQL Mode 三种作用域

SQL Mode 按作用区域和时间可分为 3。个级别，分别是**会话级别，全局级别，配置（永久生效）级别**。

我们上面使用的 SQL Mode 都是 `会话级别`，会话级别就是当前窗口域有效。它的设置方式是

```mysql
set @@session.sql_mode='xx_mode'
set session sql_mode='xx_mode'
```

全局域就是当前会话关闭不失效，但是在 MySQL 重启后失效。它的设置方式是

```mysql
set global sql_mode='xx_mode';
set @@global.sql_mode='xx_mode';
```

配置域就是在 `vi /etc/my.cnf` 里面添加

```mysql
[mysqld]
sql-mode = "xx_mode"
```

配置域在保存退出后，重启服务器，即可永久生效。

## SQL 正则表达式

正则表达式相信大家应该都用过，不过你在 MySQL 中用过正则表达式吗？下面我们就来聊一聊 SQL 中的正则表达式。

`正则表达式(Regular Expression)` 是指一个用来描述或者匹配字符串的句法规则。正则表达式通常用来检索和替换某个文本中的文本内容。很多语言都支持正则表达式，MySQL 同样也不例外，MySQL 利用 `REGEXP` 命令提供给用户扩展的正则表达式功能。下面是 MySQL 中正则表达式的一些规则。

![](https://s3.ax1x.com/2021/01/26/sOjLzF.png)

下面来演示一下正则表达式的用法

* `^` 在字符串的开始进行匹配，根据返回的结果来判断是否匹配，1 = 匹配，0 = 不匹配。下面尝试匹配字符串 `aaaabbbccc` 是否以字符串 `a` 为开始

  ```mysql
  select 'aaaabbbccc' regexp '^a';
  ```

  ![](https://s3.ax1x.com/2021/01/26/sOjbGT.png)

* 同样的，`$` 会在末尾处进行匹配，如下所示

  ```mysql
  select 'aaaabbbccc' regexp 'c$';
  ```

  ![](https://s3.ax1x.com/2021/01/26/sOjqRU.png)

* `.` 匹配单个任意字符

  ```mysql
  select 'berska' regexp '.s', 'zara' regexp '.a';
  ```

  <img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20210123210447592.png" alt="image-20210123210447592" style="zoom:67%;" />

* `[...]` 表示匹配括号内的任意字符，示例如下

  ```mysql
  select 'whosyourdaddy' regexp '[abc]';
  ```

  ![image-20210123210746829](/Users/mr.l/Library/Application Support/typora-user-images/image-20210123210746829.png)

* `[^...]` 匹配括号内不包含的任意字符，和 `[...]` 是相反的，如果有任何匹配不上，返回 0 ，全部匹配上返回 1。

  ```mysql
  select 'x' regexp '[^xyz]';
  ```

  ![image-20210123222923573](/Users/mr.l/Library/Application Support/typora-user-images/image-20210123222923573.png)

* `n*` 表示匹配零个或者多个 n 字符串，如下

  ```mysql
  select 'aabbcc' regexp 'd*';
  ```

  ![image-20210123223316050](/Users/mr.l/Library/Application Support/typora-user-images/image-20210123223316050.png)

  没有 d 出现也可以返回 1 ，因为 * 表示 0 或者多个。

* `n+` 表示匹配 1 个或者 n 个字符串

  ```mysql
  select 'aabbcc' regexp 'd+';
  ```

  ![image-20210123224310069](/Users/mr.l/Library/Application Support/typora-user-images/image-20210123224310069.png)

* `n?` 的用法和 n+ 类似，只不过 n? 可以匹配空串

## 常见 SQL 技巧

### RAND() 函数

大多数数据库都会提供产生随机数的函数，通过这些函数可以产生随机数，也可以使用从数据库表中抽取随机产生的记录，这对统计分析来说很有用。

在 MySQL 中，通常使用 `RAND()` 函数来产生随机数。RAND() 和 ORDER BY 组合完成数据抽取功能，如下所示。

我们新建一张表用于数据检索。

```mysql
CREATE TABLE `clerk_Info` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `companyId` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1
```

然后插入一些数据，插入完成后的数据如下。

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20210124084948449.png" alt="image-20210124084948449" style="zoom:67%;" />

然后我们可以使用 RAND() 函数进行随机检索数据行

```mysql
select * from clerk_info order by rand();
```

检索完成后的数据如下

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20210124085333652.png" alt="image-20210124085333652" style="zoom:67%;" />

多次查询后发现每次检索的数据顺序都是随机的。

这个函数多用于随机抽样，比如选取一定数量的样本在进行随机排序，需要用到 `limit` 关键字。

### GROUP BY + WITH ROLLUP

我们经常使用 GROUP BY 语句，但是你用过 `GROUP BY` 和 `WITH ROLLUP` 一起使用的吗？使用 GROUP BY 和 WITH ROLLUP 字句可以检索出更多的分组集合信息。

我们仍旧对 clerk_info 表进行操作，我们对 name 和 salary 进行分组统计工资总数。

```mysql
select name,sum(salary) from clerk_info group by name with rollup;
```

![image-20210124125743028](/Users/mr.l/Library/Application Support/typora-user-images/image-20210124125743028.png)

可以看到上面的表按照 name 进行分组，然后再对 money 进行统计。

也就是说 GROUP BY 语句执行完成后可以满足用户想要的任何一个分组以及分组组合的聚合信息值。

>这里需要注意一点，不能同时使用 ORDER BY 字句对结果进行排序，ROLLUP 和 ORDER BY 是互斥的。

### 数据库名、表名大小写问题

在 MySQL 中，**数据库中的每个表至少对应数据库目录中的一个文件，当然这取决于存储引擎的实现了**。不同的操作系统对大小写的敏感性决定了数据库和表名的大小写的敏感性。在 UNIX 操作系统中是对大小写敏感的，因此数据库名和表名也是具有敏感性的，而到了 Windows 则不存在敏感性问题，因为 Windows 操作系统本身对大小写不敏感。**列、索引、触发器**在任何平台上都对大小写不敏感。

在 MySQL 中，数据库名和表名是由 `lower_case_tables_name` 系统变量决定的。可以在启动 `mysqld` 时设置这个系统变量。下面是 `lower_case_tables_name` 的值。

![image-20210124131941141](/Users/mr.l/Library/Application Support/typora-user-images/image-20210124131941141.png)

如果只在一个平台上使用 MySQL 的话，通常不需要修改 `lower_case_tables_name` 变量。如果想要在不同系统系统之间迁移表就会涉及到大小写问题，因为 UNIX 中 clerk_info 和 CLERK_INFO 被认为是两个不同的表，而 Windows 中则认为是一个。在 UNIX 中使用 lower_case_tables_name=0， 而在 Windows 中使用lower_case_tables_name=2，这样可以保留数据库名和表名的大小写，但是不能保证所有的 SQL 查询中使用的表名和数据库名的大小写相同。如果 SQL 语句中没有正确引用数据库名和表名的大小写，那么虽然在 Windows 中能正确执行，但是如果将查询转移到 UNIX 中，大小写不正确，将会导致查询失败。

### 外键问题

这里需要注意一个问题，`InnoDB` 存储引擎是支持外键的，而 `MyISAM` 存储引擎是不支持外键的，因此在 MyISAM 中设置外键会不起作用。

## MySQL 常用函数

下面我们来了解一下 MySQL 函数，MySQL 函数也是我们日常开发过程中经常使用的，选用合适的函数能够提高我们的开发效率，下面我们就来一起认识一下这些函数

### 字符串函数

字符串函数是最常用的一种函数了，MySQL 也是支持很多种字符串函数，下面是 MySQL 支持的字符串函数表

| 函数      | 功能                       |
| --------- | -------------------------- |
| LOWER     | 将字符串所有字符变为小写   |
| UPPER     | 将字符串所有字符变为大写   |
| CONCAT    | 进行字符串拼接             |
| LEFT      | 返回字符串最左边的字符     |
| RIGHT     | 返回字符串最右边的字符     |
| INSERT    | 字符串替换                 |
| LTRIM     | 去掉字符串左边的空格       |
| RTRIM     | 去掉字符串右边的空格       |
| REPEAT    | 返回重复的结果             |
| TRIM      | 去掉字符串行尾和行头的空格 |
| SUBSTRING | 返回指定的字符串           |
| LPAD      | 用字符串对最左边进行填充   |
| RPAD      | 用字符串对最右边进行填充   |
| STRCMP    | 比较字符串 s1 和 s2        |
| REPLACE   | 进行字符串替换             |

下面通过具体的示例演示一下每个函数的用法

* LOWER(str) 和 UPPER(str) 函数：用于转换大小写

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618164012868.png" alt="image-20200618164012868" style="zoom: 67%;" />

* CONCAT(s1,s2 ... sn) ：把传入的参数拼接成一个字符串

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618164319587.png" alt="image-20200618164319587" style="zoom:67%;" />

上面把 `c xu an` 拼接成为了一个字符串，另外需要注意一点，任何和 NULL 进行字符串拼接的结果都是 NULL。

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618164428383.png" alt="image-20200618164428383" style="zoom:67%;" />

* LEFT(str,x) 和 RIGHT(str,x) 函数：分别返回字符串最左边的 x 个字符和最右边的 x 个字符。如果第二个参数是 NULL，那么将不会返回任何字符串

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618172529748.png" alt="image-20200618172529748" style="zoom:67%;" />

* INSERT(str,x,y,instr) ： 将字符串 str 从指定 x 的位置开始， 取 y 个长度的字串替换为 instr。

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618184422862.png" alt="image-20200618184422862" style="zoom:67%;" />

* LTRIM(str) 和 RTRIM(str) 分别表示去掉字符串 str 左侧和右侧的空格

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618184615703.png" alt="image-20200618184615703" style="zoom:67%;" />

* REPEAT(str,x) 函数：返回 str 重复 x 次的结果

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618184850749.png" alt="image-20200618184850749" style="zoom:67%;" />

* TRIM(str) 函数：用于去掉目标字符串的空格

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618190739027.png" alt="image-20200618190739027" style="zoom:67%;" />

* SUBSTRING(str,x,y) 函数：返回从字符串 str 中第 x 位置起 y 个字符长度的字符串

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618190933606.png" alt="image-20200618190933606" style="zoom:67%;" />

* LPAD(str,n,pad) 和 RPAD(str,n,pad) 函数：用字符串 pad 对 str 左边和右边进行填充，直到长度为 n 个字符长度

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618191304880.png" alt="image-20200618191304880" style="zoom:67%;" />

* STRCMP(s1,s2) 用于比较字符串 s1 和 s2 的 ASCII 值大小。如果 s1 < s2，则返回 -1；如果 s1 = s2 ，返回 0 ；如果 s1 > s2 ，返回 1。

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618191457478.png" alt="image-20200618191457478" style="zoom:67%;" />

* REPLACE(str,a,b) : 用字符串 b 替换字符串 str 种所有出现的字符串 a

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618185040904.png" alt="image-20200618185040904" style="zoom:67%;" />

### 数值函数

MySQL 支持数值函数，这些函数能够处理很多数值运算。下面我们一起来学习一下 MySQL 中的数值函数，下面是所有的数值函数

| 函数     | 功能                       |
| -------- | -------------------------- |
| ABS      | 返回绝对值                 |
| CEIL     | 返回大于某个值的最大整数值 |
| MOD      | 返回模                     |
| ROUND    | 四舍五入                   |
| FLOOR    | 返回小于某个值的最大整数值 |
| TRUNCATE | 返回数字截断小数的结果     |
| RAND     | 返回 0 - 1 的随机值        |

下面我们还是以实践为主来聊一聊这些用法

* ABS(x) 函数：返回 x 的绝对值

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618194657865.png" alt="image-20200618194657865" style="zoom:67%;" />

* CEIL(x) 函数： 返回大于 x 的整数

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618194939934.png" alt="image-20200618194939934" style="zoom:67%;" />

* MOD(x,y)，对 x 和 y 进行取模操作

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618195052733.png" alt="image-20200618195052733" style="zoom:67%;" />

* ROUND(x,y) 返回 x 四舍五入后保留 y 位小数的值；如果是整数，那么 y 位就是 0 ；如果不指定 y ，那么 y 默认也是 0 。

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618230452093.png" alt="image-20200618230452093" style="zoom:67%;" />

* FLOOR(x) : 返回小于 x 的最大整数，用法与 CEIL 相反

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618230600793.png" alt="image-20200618230600793" style="zoom:67%;" />

* TRUNCATE(x,y): 返回数字 x 截断为 y 位小数的结果， TRUNCATE 知识截断，并不是四舍五入。

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618230848465.png" alt="image-20200618230848465" style="zoom:67%;" />

* RAND() ：返回 0 到 1 的随机值

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200618231058270.png" alt="image-20200618231058270" style="zoom:67%;" />

### 日期和时间函数

日期和时间函数也是 MySQL 中非常重要的一部分，下面我们就来一起认识一下这些函数

| 函数           | 功能                             |
| -------------- | -------------------------------- |
| NOW            | 返回当前的日期和时间             |
| WEEK           | 返回一年中的第几周               |
| YEAR           | 返回日期的年份                   |
| HOUR           | 返回小时值                       |
| MINUTE         | 返回分钟值                       |
| MONTHNAME      | 返回月份名                       |
| CURDATE        | 返回当前日期                     |
| CURTIME        | 返回当前时间                     |
| UNIX_TIMESTAMP | 返回日期 UNIX 时间戳             |
| DATE_FORMAT    | 返回按照字符串格式化的日期       |
| FROM_UNIXTIME  | 返回 UNIX 时间戳的日期值         |
| DATE_ADD       | 返回日期时间 + 上一个时间间隔    |
| DATEDIFF       | 返回起始时间和结束时间之间的天数 |

下面结合示例来讲解一下每个函数的使用

* NOW(): 返回当前的日期和时间

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619142036108.png" alt="image-20200619142036108" style="zoom:67%;" />

* WEEK(DATE) 和 YEAR(DATE) ：前者返回的是一年中的第几周，后者返回的是给定日期的哪一年

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619142356885.png" alt="image-20200619142356885" style="zoom:67%;" />

* HOUR(time) 和 MINUTE(time) : 返回给定时间的小时，后者返回给定时间的分钟

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619142526187.png" alt="image-20200619142526187" style="zoom:67%;" />

* MONTHNAME(date) 函数：返回 date 的英文月份

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619142957654.png" alt="image-20200619142957654" style="zoom:67%;" />

* CURDATE() 函数：返回当前日期，只包含年月日

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619143225773.png" alt="image-20200619143225773" style="zoom:67%;" />

* CURTIME() 函数：返回当前时间，只包含时分秒

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619143304467.png" alt="image-20200619143304467" style="zoom:67%;" />

* UNIX_TIMESTAMP(date) : 返回 UNIX 的时间戳

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619143408681.png" alt="image-20200619143408681" style="zoom:67%;" />

* FROM_UNIXTIME(date) : 返回 UNIXTIME 时间戳的日期值，和 UNIX_TIMESTAMP 相反

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619143532109.png" alt="image-20200619143532109" style="zoom:67%;" />

* DATE_FORMAT(date,fmt) 函数：按照字符串 fmt 对 date 进行格式化，格式化后按照指定日期格式显示

具体的日期格式可以参考这篇文章 https://blog.csdn.net/weixin_38703170/article/details/82177837

我们演示一下将当前日期显示为**年月日**的这种形式，使用的日期格式是 **%M %D %Y**。

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619145256956.png" alt="image-20200619145256956" style="zoom:67%;" />

* DATE_ADD(date, interval, expr type) 函数：返回与所给日期 date 相差 interval 时间段的日期

interval 表示间隔类型的关键字，expr 是表达式，这个表达式对应后面的类型，type 是间隔类型，MySQL 提供了 13 种时间间隔类型

| 表达式类型    | 描述     | 格式            |
| ------------- | -------- | --------------- |
| YEAR          | 年       | YY              |
| MONTH         | 月       | MM              |
| DAY           | 日       | DD              |
| HOUR          | 小时     | hh              |
| MINUTE        | 分       | mm              |
| SECOND        | 秒       | ss              |
| YEAR_MONTH    | 年和月   | YY-MM           |
| DAY_HOUR      | 日和小时 | DD hh           |
| DAY_MINUTE    | 日和分钟 | DD hh : mm      |
| DAY_SECOND    | 日和秒   | DD hh ：mm ：ss |
| HOUR_MINUTE   | 小时和分 | hh:mm           |
| HOUR_SECOND   | 小时和秒 | hh:ss           |
| MINUTE_SECOND | 分钟和秒 | mm:ss           |

* DATE_DIFF(date1, date2) 用来计算两个日期之间相差的天数

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619150346397.png" alt="image-20200619150346397" style="zoom:67%;" />

查看离 2021 - 01 - 01 还有多少天

### 流程函数

流程函数也是很常用的一类函数，用户可以使用这类函数在 SQL 中实现条件选择。这样做能够提高查询效率。下表列出了这些流程函数

| 函数                                                        | 功能                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| IF(value,t f)                                               | 如果 value 是真，返回 t；否则返回 f                     |
| IFNULL(value1,value2)                                       | 如果 value1 不为 NULL，返回 value1，否则返回 value2。   |
| CASE WHEN[value1] THEN[result1] ...ELSE[default] END        | 如果 value1 是真，返回 result1，否则返回 default        |
| CASE[expr] WHEN[value1] THEN [result1]... ELSE[default] END | 如果 expr 等于 value1， 返回 result1， 否则返回 default |

### 其他函数

除了我们介绍过的字符串函数、日期和时间函数、流程函数，还有一些函数并不属于上面三类函数，它们是

| 函数           | 功能                   |
| -------------- | ---------------------- |
| VERSION        | 返回当前数据库的版本   |
| DATABASE       | 返回当前数据库名       |
| USER           | 返回当前登陆用户名     |
| PASSWORD       | 返回字符串的加密版本   |
| MD5            | 返回 MD5 值            |
| INET_ATON(IP)  | 返回 IP 地址的数字表示 |
| INET_NTOA(num) | 返回数字代表的 IP 地址 |

下面来看一下具体的使用

* VERSION: 返回当前数据库版本

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619170425342.png" alt="image-20200619170425342" style="zoom:67%;" />

* DATABASE: 返回当前的数据库名

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619170514694.png" alt="image-20200619170514694" style="zoom:67%;" />

* USER : 返回当前登录用户名

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619170650887.png" alt="image-20200619170650887" style="zoom:67%;" />

* PASSWORD(str) : 返回字符串的加密版本，例如

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619170838908.png" alt="image-20200619170838908" style="zoom:67%;" />

* MD5(str) 函数：返回字符串 str 的 MD5 值

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619171240119.png" alt="image-20200619171240119" style="zoom:67%;" />

* INET_ATON(IP): 返回 IP 的网络字节序列

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619171425647.png" alt="image-20200619171425647" style="zoom:67%;" />

* INET_NTOA(num)函数：返回网络字节序列代表的 IP 地址，与 INET_ATON 相对

<img src="/Users/mr.l/Library/Application Support/typora-user-images/image-20200619171523449.png" alt="image-20200619171523449" style="zoom:67%;" />





## 总结

这篇文章我带你手把手撸了一波 MySQL 的高级内容，其实说高级也不一定真的高级或者说难，其实就是区分不同梯度的东西。

如果你觉得这篇文章还不错的话，欢迎点赞、在看、留言、分享。

你的支持就是我撸文的动力！我是 cxuan，我们下篇文章见。








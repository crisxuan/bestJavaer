# MySQL 中的 SQL 基础

## SQL 基础使用

MySQL 是一种关系型数据库，说到关系，那么就离不开表与表之间的关系，而最能体现这种关系的其实就是我们接下来需要介绍的主角 `SQL`，SQL 的全称是 `Structure Query Language` ，结构化的查询语言，它是一种针对表关联关系所设计的一门语言，也就是说，学好 MySQL，SQL 是基础和重中之重。SQL 不只是 MySQL 中特有的一门语言，大多数关系型数据库都支持这门语言。

下面我们就来一起学习一下这门非常重要的语言。

## 查询语言分类

在了解 SQL 之前我们需要知道下面这几个概念

* 数据定义语言： 简称`DDL` (Data Definition Language)，用来定义数据库对象:数据库、表、列等；

- 数据操作语言： 简称`DML` (Data Manipulation Language)，用来对数据库中表的记录进行更新。关键字： insert、update、delete等
- 数据控制语言： 简称`DCL`(Data Control Language)，用来定义数据库访问权限和安全级别，创建用户等。关键字： grant等
- 数据查询语言： 简称`DQL`(Data Query Language)，用来查询数据库中表的记录，关键字： select from where等

### DDL 语句

#### 创建数据库

下面就开始我们的 SQL 语句学习之旅，首先你需要启动 MySQL 服务，我这里是 mac 电脑，所以我直接可以启动 

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184210825-1964780663.png)

然后我们使用命令行的方式连接数据库，打开 `iterm`，输入下面

```mysql
MacBook:~ mr.l$ mysql -uroot -p
```

就可以连接到数据库了

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184229549-872839062.png)

在上面命令中，`mysql` 代表客户端命令，`- u` 表示后面需要连接的用户，`-p` 表示需要输入此用户的密码。在你输入用户名和密码后，如果成功登陆，会显示一个欢迎界面（如上图 ）和 `mysql>` 提示符。

欢迎界面主要描述了这些东西

* 每一行的结束符，这里用 `;` 或者 `\g` 来表示每一行的结束
* **Your MySQL connection id is 4**，这个记录了 MySQL 服务到目前为止的连接数，每个新链接都会自动增加 1 ，上面显示的连接次数是 4 ，说明我们只连接了四次
* 然后下面是 MySQL 的版本，我们使用的是 5.7
* 通过 `help` 或者 `\h` 命令来显示帮助内容，通过 `\c` 命令来清除命令行 buffer。 

然后需要做的事情是什么？我们最终想要学习 SQL 语句，SQL 语句肯定是要查询数据，通过数据来体现出来表的关联关系，所以我们需要数据，那么数据存在哪里呢？数据存储的位置被称为 `表(table)`，表存储的位置被称为 `数据库(database)`，所以我们需要先建数据库后面再建表然后插入数据，再进行查询。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184512447-345525712.png)

所以我们首先要做的就是创建数据库，创建数据库可以直接使用指令

```mysql
CREATE DATABASE dbname;
```

进行创建，比如我们创建数据库 cxuandb

```mysql
create database cxuandb;
```

注意最后的 `;` 结束语法一定不要丢掉，否则 MySQL 会认为你的命令没有输出完，敲 enter 后会直接换行输出

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184520645-1022906469.png)

创建完成后，会提示 **Query OK, 1 row affected**，这段语句什么意思呢？ Query OK 表示的就是查询完成，为什么会显示这个？因为所有的 DDL 和 DML 操作执行完成后都会提示这个， 也可以理解为操作成功。后面跟着的 **1 row affected ** 表示的是影响的行数，`()` 内显示的是你执行这条命令所耗费的时间，也就是 0.03 秒。

上图我们成功创建了一个 cxuandb 的数据库，此时我们还想创建一个数据库，我们再执行相同的指令，结果提示

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184527809-1419513101.png)

提示我们不能再创建数据库了，数据库已经存在。这时候我就有疑问了，我怎么知道都有哪些数据库呢？别我再想创建一个数据库又告诉我已经存在，这时候可以使用 `show databases` 命令来查看你的 MySQL 已有的数据库

```mysql
show databases;
```

执行完成后的结果如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184541874-282083027.png)

因为数据库我之前已经使用过，这里就需要解释一下，除了刚刚新创建成功的 cxuandb 外，`informationn_schema` 、`performannce_schema` 和 `sys` 都是系统自带的数据库，是安装 MySQL 默认创建的数据库。它们各自表示

* informationn_schema： 主要存储一些数据库对象信息，比如用户表信息、权限信息、分区信息等
* performannce_schema： MySQL 5.5 之后新增加的数据库，主要用于收集数据库服务器性能参数。
* sys: MySQL 5.7 提供的数据库，sys 数据库里面包含了一系列的存储过程、自定义函数以及视图来帮助我们快速的了解系统的元数据信息。

其他所有的数据库都是作者自己创建的，可以忽略他们。

在创建完数据库之后，可以用如下命令选择要操作的数据库

```mysql
use cxuandb
```

这样就成功切换为了 cxuandb 数据库，我们可以在此数据库下进行建表、查看基本信息等操作。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184549507-1466480536.png)

比如想要看康康我们新建的数据库里面有没有其他表

```mysql
show tables;
```

果然，我们新建的数据库下面没有任何表，但是现在，我们还不进行建表操作，我们还是先来认识一下数据库层面的命令，也就是其他 DDL 指令

#### 删除数据库

如果一个数据库我们不想要了，那么该怎么办呢？直接删掉数据库不就好了吗？删表语句是 

```mysql
drop database dbname;
```

比如 cxuandb 我们不想要他了，可以通过使用 

```mysql
drop database cxuandb;
```

进行删除，这里我们就不进行演示了，因为 cxuandb 我们后面还会使用。

但是这里注意一点，你删除数据库成功后会出现 **0 rows affected**，这个可以不用理会，因为在 MySQL 中，drop 语句操作的结果都是 **0 rows affected**。

#### 创建表

下面我们就可以对表进行操作了，我们刚刚 show tables 发现还没有任何表，所以我们现在进行建表语句

```mysql
CREATE TABLE 表名称
(
列名称1 数据类型 约束,
列名称2 数据类型 约束,
列名称3 数据类型 约束,
....
)
```

这样就很清楚了吧，列名称就是列的名字，紧跟着列名后面就是数据类型，然后是约束，为什么要这么设计？举个例子你就清楚了，比如 cxuan 刚被生出来就被打印上了标签

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184602326-2133867639.png)

比如我们创建一个表，里面有 5 个字段，姓名(name)、性别(sex)、年龄(age)、何时雇佣(hiredate)、薪资待遇(wage)，建表语句如下

```mysql
create table job(name varchar(20), sex varchar(2), age int(2), hiredate date, wage decimal(10,2));
```

事实证明这条建表语句还是没问题的，建表完成后可以使用 `DESC tablename` 查看表的基本信息

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184612352-1291930831.png)

`DESC` 命令会查看表的定义，但是输出的信息还不够全面，所以，如果想要查看更全的信息，还要通过查看表的创建语句的 SQL 来得到

```mysql
show create table job \G;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184619547-752099944.png)

可以看到，除了看到表定义之外，还看到了表的 `engine(存储引擎)` 为 InnoDB 存储引擎，`\G` 使得记录能够竖着排列，如果不用 `\G` 的话，效果如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184627261-1437313767.png)

#### 删除表

表的删除语句有两种，一种是 `drop` 语句，SQL 语句如下

```mysql
drop table job
```

一种是 `truncate` 语句，SQL 语句如下

```mysql
truncate table job
```

这两者的区别简单理解就是 drop 语句删除表之后，可以通过日志进行回复，而 truncate 删除表之后永远恢复不了，所以，一般不使用 truncate 进行表的删除。‘

#### 修改表

对于已经创建好的表，尤其是有大量数据的表，如果需要对表做结构上的改变，可以将表删除然后重新创建表，但是这种效率会产生一些额外的工作，数据会重新加载近来，如果此时有服务正在访问的话，也会影响服务读取表中数据，所以此时，我们需要表的修改语句来对已经创建好的表的定义进行修改。

修改表结构一般使用 `alter table` 语句，下面是常用的命令

```mysql
ALTER TABLE tb MODIFY [COLUMN] column_definition [FIRST | AFTER col_name];
```

比如我们想要将 job 表中的 name 由 `varchar(20)` 改为 `varchar(25)`，可以使用如下语句

```mysql
alter table job modify name varchar(25);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184638641-2062081207.png)

也可以对表结构进行修改，比如增加一个字段

```mysql
alter table job add home varchar(30);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184649104-1621585768.png)

将新添加的表的字段进行删除

```mysql
alter table job drop column home;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184657039-1599824555.png)

可以对表中字段的名称进行修改，比如吧 wage 改为 salary

```mysql
alter table job change wage salary decimal(10,2);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184729122-359547656.png)

修改字段的排列顺序，我们前面介绍过修改语法涉及到一个顺序问题，都有一个可选项 **first | after ** column_name，这个选项可以用来修改表中字段的位置，默认 ADD 是在添加为表中最后一个字段，而 **CHANGE/MODIFY** 不会改变字段位置。比如 

```mysql
alter table job add birthday after hiredate;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184737821-1296328742.png)

可以对表名进行修改，例如将 job 表改为 worker

```mysql
alter table job rename worker;
```

### DML 语句

有的地方把 DML 语句（增删改）和 DQL 语句（查询）统称为 DML 语句，有的地方分开，我们目前使用分开称呼的方式

#### 插入

表创建好之后，我们就可以向表里插入数据了，插入记录的基本语法如下

```mysql
INSERT INTO tablename (field1,field2) VALUES(value1,value2);
```

例如，向中插入以下记录

```mysql
insert into job(name,sex,age,hiredate,birthday,salary) values("cxuan","男",24,"2020-04-27","1995-08-22",8000);
```

也可以不用指定要插入的字段，直接插入数据即可

```mysql
insert into job values("cxuan02","男",25,"2020-06-01","1995-04-23",12000);
```

这里就有一个问题，如果插入的顺序不一致的话会怎么样呢？

对于含可空字段、非空但是含有默认值的字段、自增字段可以不用在 insert 后的字段列表出现，values 后面只需要写对应字段名称的 value 即可，没有写的字段可以自动的设置为 NULL、默认值或者自增的下一个值，这样可以缩短要插入 SQL 语句的长度和复杂性。

比如我们设置一下 hiredate、age 可以为 null，来试一下

```mysql
insert into job(name,sex,birthday,salary) values("cxuan03","男","1992-08-23",15000);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184753144-137670219.png)

我们看一下实际插入的数据

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184800553-229122934.png)

我们可以看到有一行两个字段显示 NULL。在 MySQL 中，insert 语句还有一个很好的特性，就是一次可以插入多条记录

```mysql
INSERT INTO tablename (field1,field2) VALUES
(value1,value2),
(value1,value2),
(value1,value2),
...;
```

可以看出，每条记录之间都用逗号进行分割，这个特性可以使得 MySQL 在插入大量记录时，节省很多的网络开销，大大提高插入效率。

#### 更新记录

对于表中已经存在的数据，可以通过 update 命令对其进行修改，语法如下

```mysql
UPDATE tablename SET field1 = value1, field2 = value2 ;
```

例如，将 job 表中的 cxuan03 中 age 的 NULL 改为 26，SQL 语句如下

```mysql
update job set age = 26 where name = 'cxuan03';
```

SQL 语句中出现了一个 where 条件，我们会在后面说到 where 条件，这里简单理解一下它的概念就是根据哪条记录进行更新，如果不写 where 的话，会对整个表进行更新

#### 删除记录

如果记录不再需要，可以使用 delete 命令进行删除

```mysql
DELETE FROM tablename [WHERE CONDITION]
```

例如，在 job 中删除名字是 cxuan03 的记录

```mysql
delete from job where name = 'cxuan03';
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184811486-2027517336.png)

在 MySQL 中，删除语句也可以不指定 where 条件，直接使用

```mysql
delete from job
```

这种删除方式相当于是清楚表的操作，表中所有的记录都会被清除。

### DQL 语句

下面我们一起来认识一下 DQL 语句，数据被插入到 MySQL 中，就可以使用 `SELECT` 命令进行查询，来得到我们想要的结果。

SELECT 查询语句可以说是最复杂的语句了，这里我们只介绍一下基本语法

一种最简单的方式就是从某个表中查询出所有的字段和数据，简单粗暴，直接使用 `SELECT *`

```mysql
SELECT * FROM tablename;
```

例如我们将 job 表中的所有数据查出来

```mysql
select * from job;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184822392-1352714360.png)

其中 * 是查询出所有的数据，当然，你也可以查询出指定的数据项

```mysql
select name,sex,age,hiredate,birthday,salary from job;
```

上面这条 SQL 语句和 `select * from job` 表是等价的，但是这种直接查询指定字段的 SQL 语句效率要高。

上面我们介绍了基本的 SQL 查询语句，但是实际的使用场景会会比简单查询复杂太多，一般都会使用各种 SQL 的函数和查询条件等，下面我们就来一起认识一下。

#### 去重

使用非常广泛的场景之一就是 `去重`，去重可以使用 `distinct` 关键字来实现

为了演示效果，我们先向数据库中插入批量数据，插入完成后的表结构如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184832074-424163971.png)

下面我们使用 distinct 来对 age 去重来看一下效果

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184838690-1316693279.png)

你会发现只有两个不同的值，其他和 25 重复的值被过滤掉了，所以我们使用 distinct 来进行去重

#### 条件查询

我们之前的所有例子都是查询全部的记录，如果我们只想查询指定的记录呢？这里就会用到 `where `条件查询语句，条件查询可以对指定的字段进行查询，比如我们想查询所有年龄为 24 的记录，如下

```mysql
select * from job where age = 24;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184847396-1752526738.png)

where 条件语句后面会跟一个判断的运算符 `=`，除了 `=` 号比较外，还可以使用 **>、<、>=、<=、!=** 等比较运算符；例如

```mysql
select * from job where age >= 24;
```

就会从 job 表中查询出 age 年龄大于或等于 24 的记录

除此之外，在 where 条件查询中还可以有多个并列的查询条件，比如我们可以查询年龄大于等于 24，并且薪资大雨 8000 的记录

```mysql
select * from job where age >= 24 and salary > 8000;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184902515-191573122.png)

多个条件之间还可以使用 or、and 等逻辑运算符进行多条件联合查询，运算符会在以后章节中详细讲解。

#### 排序

我们会经常有这样的需求，按照某个字段进行排序，这就用到了数据库的排序功能，使用关键字 `order by` 来实现，语法如下

```mysql
SELECT * FROM tablename [WHERE CONDITION] [ORDER BY field1 [DESC|ASC] ， field2 [DESC|ASC]，……fieldn [DESC|ASC]]
```

其中 DESC 和 ASC 就是顺序排序的关键字，DESC 会按照字段进行降序排列，ASC 会按照字段进行升序排列，默认会使用升序排列，也就是说，你不写 `order by` 具体的排序的话，默认会使用升序排列。order by 后面可以跟多个排序字段，并且每个排序字段可以有不同的排序顺序。

为了演示功能，我们先把表中的 `salary` 工资列进行修改，修改完成后的表记录如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621184912300-2134566316.png)

下面我们按照工资进行排序，SQL 语句如下

```mysql
select * from job order by salary desc;
```

语句执行完成后的结果如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621185833027-2107613390.png)

这是对一个字段进行排序的结果，也可以对多个字段进行排序，但是需要注意一点

>根据 order by 后面声名的顺序进行排序，如果有三个排序字段 A、B、C 的话，如果 A 字段排序字段的值一样，则会根据第二个字段进行排序，以此类推。
>
>如果只有一个排序字段，那么这些字段相同的记录将会无序排列。

#### 限制

对于排序后的字段，或者不排序的字段，如果只希望显示一部分的话，就会使用 `LIMIT` 关键字来实现，比如我们只想取前三条记录

```mysql
select * from job limit 3;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621185840912-364045756.png)

或者我们对排序后的字段取前三条记录

```mysql
select * from job order by salary limit 3;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621185849789-1909637341.png)

上面这种 limit 是从表记录的第 0 条开始取，如果从指定记录开始取，比如从第二条开始取，取三条记录，SQL 如下

```mysql
select * from job order by salary desc limit 2,3;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621185857156-532520688.png)

limit 一般经常和 order by 语法一起实现分页查询。

>注意：limit 是 MySQL 扩展 SQL92 之后的语法，在其他数据库比如 Oracle 上就不通用，我犯过一个白痴的行为就是在 Oracle 中使用 limit 查询语句。。。

#### 聚合

下面我们来看一下对记录进行汇总的操作，这类操作主要有

* `汇总函数`，比如 sum 求和、count 统计数量、max 最大值、min 最小值等
* `group by`，关键字表示对分类聚合的字段进行分组，比如按照部门统计员工的数量，那么 group by 后面就应该跟上部门
* `with` 是可选的语法，它表示对汇总之后的记录进行再次汇总
* `having` 关键字表示对分类后的结果再进行条件的过滤。

>看起来 where 和 having 意思差不多，不过它们用法不一样，where 是使用在统计之前，对统计前的记录进行过滤，having 是用在统计之后，是对聚合之后的结果进行过滤。也就是说 where 永远用在 having 之前，我们应该先对筛选的记录进行过滤，然后再对分组的记录进行过滤。

可以对 job 表中员工薪水进行统计，选出总共的薪水、最大薪水、最小薪水

```mysql
select sum(salary) from job;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621185906084-899006342.png)

```mysql
select max(salary),min(salary) from job;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621185912764-1097248441.png)


比如我们要统计 job 表中人员的数量

```mysql
select count(1) from job;
```

统计完成后的结果如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621185922642-1036865007.png)

我们可以按照 job 表中的年龄来进行对应的统计

```mysql
select age,count(1) from job group by age;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621185934545-786151024.png)

既要统计各年龄段的人数，又要统计总人数

```mysql
select age,count(1) from job group by age with rollup;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621185943252-402965983.png)

在此基础上进行分组，统计数量大于 1 的记录

```mysql
select age,count(1) from job group by age with rollup having count(1) > 1;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621185950119-1582146780.png)

#### 表连接

表连接一直是笔者比较痛苦的地方，曾经因为一个表连接挂了面试，现在来认真撸一遍。

表连接一般体现在表之间的关系上。当需要同时显示多个表中的字段时，就可以用表连接来实现。

为了演示表连接的功能，我们为 job 表加一个 `type` 字段表示工作类型，增加一个 job_type 表表示具体的工作种类，如下所示

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190004692-1801174732.png)

下面开始我们的演示

查询出 job 表中的 type 和 job_type 表中的 type 匹配的姓名和工作类型

```mysql
select job.name,job_type.name from job,job_type where job.type = job_type.type;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190013350-1456980617.png)

上面这种连接使用的是内连接，除此之外，还有外连接。那么它们之间的区别是啥呢？

>内连接：选出两张表中互相匹配的记录；
>
>外连接：不仅选出匹配的记录，也会选出不匹配的记录；

外连接分为两种

* 左外连接：筛选出包含左表的记录并且右表没有和它匹配的记录
* 右外连接：筛选出包含右表的记录甚至左表没有和它匹配的记录

为了演示效果我们在 job 表和 job_type 表中分别添加记录，添加完成后的两表如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190025870-1497583931.png)

下面我们进行左外连接查询：查询出 job 表中的 type 和 job_type 表中的 type 匹配的姓名和工作类型

```mysql
select job.name,job_type.name from job left join job_type on job.type = job_type.type;
```

查询出来的结果如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190033766-404494970.png)

可以看出 cxuan06 也被查询出来了，而 cxuan06 他没有具体的工作类型。

使用右外连接查询

```mysql
select job.name,job_type.name from job right join job_type on job.type = job_type.type;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190042465-1491793793.png)

可以看出，job 表中并没有 waiter 和 manager 的角色，但是也被查询出来了。

#### 子查询

有一些情况，我们需要的查询条件是另一个 SQL 语句的查询结果，这种查询方式就是子查询，子查询有一些关键字比如 **in、not in、=、!=、exists、not exists** 等，例如我们可以通过子查询查询出每个人的工作类型

```mysql
select job.* from job where type in (select type from job_type);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190051433-2119390609.png)

如果自查询数量唯一的话，还可以用 `=` 来替换 `in`

```mysql
select * from job where type = (select type from job_type);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190058440-874256119.png)

意思是自查询不唯一，我们使用 limit 限制一下返回的记录数

```mysql
select * from job where type = (select type from job_type limit 1,1);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190108022-1089820475.png)

在某些情况下，子查询可以转换为表连接

#### 联合查询

我们还经常会遇到这样的场景，将两个表的数据单独查询出来之后，将结果合并到一起进行显示，这个时候就需要 UNION 和 UNION ALL 这两个关键字来实现这样的功能，UNION 和 UNION ALL 的主要区别是 UNION ALL 是把结果集直接合并在一起，而 UNION 是将 UNION ALL 后的结果进行一次 `DISTINCT` 去除掉重复数据。

比如

```mysql
select type from job union all select type from job_type;
```

它的结果如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190116994-1328305683.png)

上述结果是查询 job 表中的 type 字段和 job_type 表中的 type 字段，并把它们进行汇总，可以看出 UNION ALL 只是把所有的结果都列出来了

使用 UNION 的 SQL 语句如下

```mysql
select type from job union select type from job_type;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190125720-87435274.png)

可以看出 UNION 是对 UNION ALL 使用了 `distinct` 去重处理。

### DCL 语句

DCL 语句主要是管理数据库权限的时候使用，这类操作一般是 DBA 使用的，开发人员不会使用 DCL 语句。

### 关于帮助文档的使用

我们一般使用 MySQL 遇到不会的或者有疑问的东西经常要去查阅网上资料，甚至可能需要去查 MySQL 官发文档，这样会耗费大量的时间和精力。

下面教你一下在 MySQL 命令行就能直接查询资料的语句

#### 按照层次查询

可以使用 `? contents` 来查询所有可供查询的分类，如下所示

```mysql
? contents;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190135086-757744875.png)

我们输入 

```mysql
? Account Management
```

可以查询具体关于权限管理的命令

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190145718-1496109057.png)

比如我们想了解一下数据类型

```mysql
? Data Types
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190200331-871724438.png)

然后我们想了解一下 `VARCHAR` 的基本定义，可以直接使用

```mysql
? VARCHAR
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190210416-615312676.png)

可以看到有关于 VARCHAR 数据类型的详细信息，然后在最下面还有 MySQL 的官方文档，方便我们快速查阅。

#### 快速查阅

在实际应用过程中，如果要快速查询某个语法时，可以使用关键字进行快速查询，比如我们使用

```mysql
? show
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190228856-239291805.png)

能够快速列出一些命令

比如我们想要查阅 database 的信息，使用

```mysql
SHOW CREATE DATABASE cxuandb;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190240385-1481651847.png)


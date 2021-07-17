# MySQL 入门大全

* [MySQL 入门大全](#mysql-入门大全)
   * [SQL 基础使用](#sql-基础使用)
   * [查询语言分类](#查询语言分类)
      * [DDL 语句](#ddl-语句)
         * [创建数据库](#创建数据库)
         * [删除数据库](#删除数据库)
         * [创建表](#创建表)
         * [删除表](#删除表)
         * [修改表](#修改表)
      * [DML 语句](#dml-语句)
         * [插入](#插入)
         * [更新记录](#更新记录)
         * [删除记录](#删除记录)
      * [DQL 语句](#dql-语句)
         * [去重](#去重)
         * [条件查询](#条件查询)
         * [排序](#排序)
         * [限制](#限制)
         * [聚合](#聚合)
         * [表连接](#表连接)
         * [子查询](#子查询)
         * [联合查询](#联合查询)
      * [DCL 语句](#dcl-语句)
      * [关于帮助文档的使用](#关于帮助文档的使用)
         * [按照层次查询](#按照层次查询)
         * [快速查阅](#快速查阅)
   * [MySQL 数据类型](#mysql-数据类型)
      * [数值类型](#数值类型)
         * [整数](#整数)
         * [小数](#小数)
         * [位类型](#位类型)
      * [日期时间类型](#日期时间类型)
         * [YEAR](#year)
         * [TIME](#time)
         * [DATE](#date)
         * [DATETIME](#datetime)
         * [TIMESTAMP](#timestamp)
      * [字符串类型](#字符串类型)
         * [CHAR 和 VARCHAR 类型](#char-和-varchar-类型)
         * [BINARY 和 VARBINARY 类型](#binary-和-varbinary-类型)
         * [BLOB 类型](#blob-类型)
         * [TEXT 类型](#text-类型)
         * [ENUM 类型](#enum-类型)
         * [SET 类型](#set-类型)
   * [MySQL 运算符](#mysql-运算符)
      * [算术运算符](#算术运算符)
      * [比较运算符](#比较运算符)
      * [逻辑运算符](#逻辑运算符)
      * [位运算符](#位运算符)
   * [MySQL 常用函数](#mysql-常用函数)
      * [字符串函数](#字符串函数)
      * [数值函数](#数值函数)
      * [日期和时间函数](#日期和时间函数)
      * [流程函数](#流程函数)
      * [其他函数](#其他函数)

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

## MySQL 数据类型

MySQL 提供很多种数据类型来对不同的常量、变量进行区分，MySQL 中的数据类型主要是 **数值类型、日期和时间类型、字符串类型** 选择合适的数据类型进行数据的存储非常重要，在实际开发过程中，选择合适的数据类型也能够提高 SQL 性能，所以有必要认识一下这些数据类型。

### 数值类型

MySQL 支持所有标准的 SQL 数据类型，这些数据类型包括严格数据类型的`严格数值类型`，这些数据类型有 

* INTEGER
* SMALLINT
* DECIMAL
* NUMERIC。

`近似数值数据类型` 并不用严格按照指定的数据类型进行存储，这些有

* FLOAT
* REAL
* DOUBLE PRECISION

还有经过扩展之后的数据类型，它们是 

* TINYINT
* MEDIUMINT
* BIGINT
* BIT

其中 INT 是 INTEGER 的缩写，DEC 是 DECIMAL 的缩写。

下面是所有数据类型的汇总

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190251081-1815236873.png)

#### 整数

在整数类型中，按照取值范围和存储方式的不同，分为 

![image-20200613091331344](/Users/mr.l/Library/Application Support/typora-user-images/image-20200613091331344.png)

* TINYINT ，占用 1 字节
* SMALLINT，占用 2 字节
* MEDIUMINT，占用 3 字节
* INT、INTEGER，占用 4 字节
* BIGINT，占用 8 字节

五个数据类型，如果超出类型范围的操作，会发生错误提示，所以选择合适的数据类型非常重要。

还记得我们上面的建表语句么

我们一般会在 SQL 语句的数据类型后面加上指定长度来表示数据类型许可的范围，例如

```mysql
int(7)
```

表示 int 类型的数据最大长度为 7，如果填充不满的话会自动填满，如果不指定 int 数据类型的长度的话，默认是 `int(11)`。

我们创建一张表来演示一下

```mysql
create table test1(aId int, bId int(5));

/* 然后我们查看一下表结构 */
desc test1;
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190301132-1027215608.png)

整数类型一般配合 `zerofill` 来使用，顾名思义，就是用 0 进行填充，也就是数字位数不够的空间使用 0 进行填充。

分别修改 test1 表中的两个字段

```mysql
alter table test1 modify aId int zerofill;

alter table test1 modify bId int(5) zerofill;
```
![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190334327-1470129427.png)


然后插入两条数据，执行查询操作

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190341271-1155486515.png)

如上图所示，使用`zerofill` 可以在数字前面使用 `0` 来进行填充，那么如果宽度超过指定长度后会如何显示？我们来试验一下，向 aId 和 bId 分别插入超过字符限制的数字

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190350832-339742735.png)

会发现 aId 已经超出了指定范围，那么我们对 aId 插入一个在其允许范围之内的数据

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190357601-2074949238.png)

会发现，aId 已经插进去了，bId 也插进去了，为什么 bId 显示的是 int(5) 却能够插入 7 位长度的数值呢？

所有的整数都有一个可选属性 `UNSIGNED(无符号)`，如果需要在字段里面保存非负数或者是需要较大上限值时，可以使用此选项，它的取值范围是正常值的下限取 0 ，上限取原值的 2 倍。如果一个列为 zerofill ，会自动为该列添加 UNSIGNED 属性。

除此之外，整数还有一个类型就是 `AUTO_INCREMENT`，在需要产生唯一标识符或者顺序值时，可利用此属性，这个属性只用于整数字符。一个表中最多只有一个 AUTO_INCREMENT 属性，一般用于`自增主键`，而且 `NOT NULL`，并且是 `PRIMARY KEY ` 和 `UNIQUE` 的，主键必须保证唯一性而且不为空。

#### 小数

小数说的是啥？它其实有两种类型；一种是`浮点数`类型，一种是`定点数`类型；

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190405106-992441313.png)

浮点数有两种

* 单精度浮点型 - float 型
* 双精度浮点型 - double 型

定点数只有一种 `decimal`。定点数在 MySQL 内部中以字符串的形式存在，比浮点数更为准确，适合用来表示精度特别高的数据。

浮点数和定点数都可以使用 `(M,D)` 的方式来表示，M 表示的就是 **整数位 + 小数位** 的数字，D 表示位于 `.` 后面的小数。M 也被称为精度 ，D 被称为标度。

下面通过示例来演示一下

首先建立一个 `test2` 表

```mysql
CREATE TABLE test2 (aId float(6,2) default NULL, bId double(6,2) default NULL,cId decimal(6,2) default NULL)
```

然后向表中插入几条数据

```mysql
insert into test2 values(1234.12,1234.12,1234.12);
```

这个时候显示的数据就是

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190414326-759308447.png)

然后再向表中插入一些约束之外的数据

```mysql
insert into test2 values(1234.123,1234.123,1234.123);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190421622-416039391.png)

发现插入完成后还显示的是 `1234.12`，小数位第三位的值被舍去了。

现在我们把 test2 表中的精度全部去掉，再次插入

```mysql
alter table test2 modify aId float;

alter table test2 modify bId double;

alter table test2 modify cId decimal;
```

先查询一下，发现 cId 舍去了小数位。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190429830-10342039.png)

然后再次插入 1.23，SQL 语句如下

```mysql
insert into test2 values(1.23,1.23,1.23);
```

结果如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190436767-560862744.png)

这个时候可以验证

* 浮点数如果不写精度和标度，会按照实际的精度值进行显示
* 定点数如果不写精度和标度，会按照 `decimal(10,0)` 来进行操作，如果数据超过了精度和标题，MySQL 会报错

#### 位类型

对于位类型，用于存放字段值，`BIT(M)` 可以用来存放多位二进制数，M 的范围是 1 - 64，如果不写的话默认为 1 位。

下面我们来掩饰一下位类型

新建一个 test3 表，表中只有一个位类型的字段

```mysql
create table test3(id bit(1));
```

然后随意插入一条数据

```mysql
insert into test3 values(1);
```

发现无法查询出对应结果。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190447290-1479258561.png)

然后我们使用 `hex()` 和 `bin()` 函数进行查询

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190453246-1619452025.png)

发现能够查询出对应结果。

也就是说当数据插入 test3 时，会首先把数据转换成为二进制数，如果位数允许，则将成功插入；如果位数小于实际定义的位数，则插入失败。如果我们像表中插入数据 2 

```mysql
insert into test3 values(2);
```

那么会报错

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190500121-830278688.png)

因为 2 的二进制数表示是 `10`，而表中定义的是 `bit(1)` ，所以无法插入。

那么我们将表字段修改一下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190507326-264451235.png)

然后再进行插入，发现已经能够插入了

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190513796-984004702.png)

### 日期时间类型

MySQL 中的日期与时间类型，主要包括：**YEAR、TIME、DATE、DATETIME、TIMESTAMP**，每个版本可能不同。下表中列出了这几种类型的属性。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190521314-868311859.png)

下面分别来介绍一下

#### YEAR

YEAR 可以使用三种方式来表示

* 用 4 位的数字或者字符串表示，两者效果相同，表示范围 1901 - 2155，插入超出范围的数据会报错。
* 以 2 位字符串格式表示，范围为 ‘00’~‘99’。‘00’~‘69’ 表示 2000~2069，‘70’~‘99’ 表示1970~1999。‘0’ 和 ‘00’ 都会被识别为 2000，超出范围的数据也会被识别为 2000。 
* 以 2 位数字格式表示，范围为 1~99。1~69 表示 2001~2069, 70~99 表示 1970~1999。但 0 值会被识别为0000，这和 2 位字符串被识别为 2000 有所不同

下面我们来演示一下 YEAR 的用法，创建一个 test4 表

```mysql
create table test4(id year);
```

然后我们看一下 test4 的表结构

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190530325-1919999137.png)

默认创建的 year 就是 4 位，下面我们向 test4 中插入数据

```mysql
insert into test4 values(2020),('2020');
```

然后进行查询，发现表示形式是一样的

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190537293-1566418843.png)

使用两位字符串来表示

```mysql
delete from test4;

insert into test4 values ('0'),('00'),('11'),('88'),('20'),('21');
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190546370-966339455.png)

使用两位数字来表示

```mysql
delete from test4;

insert into test4 values (0),(00),(11),(88),(20),(21);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190553517-1568010492.png)

发现只有前两项不一样。

#### TIME

TIME 所表示的范围和我们预想的不一样

我们把 test4 改为 TIME 类型，下面是 TIME 的示例

```mysql
alter table test4 modify id TIME;

insert into test4 values ('15:11:23'),('20:13'),('2 11:11'),('3 05'),('33');
```

结果如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190601105-1909797132.png)

#### DATE 

DATE 表示的类型有很多种，下面是 DATE 的几个示例

```mysql
create table test5 (id date);
```

查看一下 test5 表

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190608660-1023795202.png)

然后插入部分数据

```mysql
insert into test5 values ('2020-06-13'),('20200613'),(20200613);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190617456-218340680.png)

DATE 的表示一般很多种，如下所示 DATE 的所有形式

* 'YYYY-MM-DD'
* 'YYYYMMDD'
* YYYYMMDD
* 'YY-MM-DD'
* 'YYMMDD'
* YYMMDD

#### DATETIME

DATETIME 类型，包含日期和时间部分，可以使用引用字符串或者数字，年份可以是 4 位也可以是 2 位。

下面是 DATETIME 的示例

```mysql
create table test6 (id datetime);

insert into test4 values ('2020-06-13 11:11:11'),(20200613111111),('20200613111111'),(20200613080808);
```

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190632549-1567105901.png)

#### TIMESTAMP

TIMESTAMP 类型和 DATETIME 类型的格式相同，存储 4 个字节（比DATETIME少），取值范围比 DATETIME 小。

下面来说一下各个时间类型的使用场景

* 一般表示`年月日`，通常用 `DATE` 类型；
* 用来表示`时分秒`，通常用 `TIME` 表示；
* `年月日时分秒` ，通常用 `DATETIME` 来表示；
* 如果需要插入的是当前时间，通常使用 `TIMESTAMP` 来表示，TIMESTAMP 值返回后显示为 `YYYY-MM-DD HH:MM:SS` 格式的字符串，

* 如果只表示年份、则应该使用 YEAR，它比 DATE 类型需要更小的空间。

每种日期类型都有一个范围，如果超出这个范围，在默认的 `SQLMode` 下，系统会提示错误，并进行零值存储。

下面来解释一下 `SQLMode` 是什么

MySQL 中有一个环境变量是 sql_mode ，sql_mode 支持了 MySQL 的语法、数据校验，我们可以通过下面这种方式来查看当前数据库使用的 sql_mode

```mysql
select @@sql_mode;
```

一共有下面这几种模式

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190643347-883134868.png)

来源于 https://www.cnblogs.com/Zender/p/8270833.html

### 字符串类型

MySQL 提供了很多种字符串类型，下面是字符串类型的汇总

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190652649-1363650823.png)

下面我们对这些数据类型做一个详细的介绍

#### CHAR 和 VARCHAR 类型

CHAR 和 VARCHAR 类型很相似，导致很多同学都会忽略他们之间的差别，首先他俩都是用来保存字符串的数据类型，他俩的主要区别在于存储方式不同。CHAR 类型的长度就是你定义多少显示多少。占用 M 字节，比如你声明一个 `CHAR(20)` 的字符串类型，那么每个字符串占用 20 字节，M 的取值范围时 0 - 255。`VARCHAR` 是可变长的字符串，范围是 0 - 65535，在字符串检索的时候，CHAR 会去掉尾部的空格，而 VARCHAR 会保留这些空格。下面是演示例子

```mysql
create table vctest1 (vc varchar(6),ch char(6));

insert into vctest1 values("abc  ","abc  ");

select length(vc),length(ch) from vctest1;
```

结果如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190702555-2071823368.png)

可以看到 vc 的字符串类型是 varchar ，长度是 5，ch 的字符串类型是 char，长度是 3。可以得出结论，varchar 会保留最后的空格，char 会去掉最后的空格。

#### BINARY 和 VARBINARY 类型

BINARY 和 VARBINARY 与 CHAR 和 VARCHAR 非常类似，不同的是它们包含二进制字符串而不包含非二进制字符串。BINARY 与 VARBINARY 的最大长度和 CHAR 与 VARCHAR 是一样的，只不过他们是定义字节长度，而 CHAR 和 VARCHAR 对应的是字符长度。

#### BLOB 类型

BLOB 是一个二进制大对象，可以容纳可变数量的数据。有 4 种 BLOB 类型：TINYBLOB、BLOB、MEDIUMBLOB 和 LONGBLOB。它们区别在于可容纳存储范围不同。

#### TEXT 类型

有 4 种 TEXT 类型：TINYTEXT、TEXT、MEDIUMTEXT 和 LONGTEXT。对应的这 4 种 BLOB 类型，可存储的最大长度不同，可根据实际情况选择。

#### ENUM 类型

ENUM 我们在 Java 中经常会用到，它表示的是枚举类型。它的范围需要在创建表时显示指定，对 1 - 255 的枚举需要 1 个字节存储；对于 255 - 65535 的枚举需要 2 个字节存储。ENUM 会忽略大小写，在存储时都会转换为大写。

#### SET 类型

SET 类型和 ENUM 类型有两处不同

* 存储方式

SET 对于每 0 - 8 个成员，分别占用 1 个字节，最大到 64 ，占用 8 个字节

* Set 和 ENUM 除了存储之外，最主要的区别在于 Set 类型一次可以选取多个成员，而 ENUM 则只能选一个。

## MySQL 运算符

MySQL 中有多种运算符，下面对 MySQL 运算符进行分类

* 算术运算符
* 比较运算符
* 逻辑运算符
* 位运算符

下面那我们对各个运算符进行介绍

### 算术运算符

MySQL 支持的算术运算符包括加、减、乘、除和取余，这类运算符的使用频率比较高

下面是运算符的分类

| 运算符 | 作用           |
| ------ | -------------- |
| +      | 加法           |
| -      | 减法           |
| *      | 乘法           |
| /, DIV | 除法，返回商   |
| %, MOD | 除法，返回余数 |

下面简单描述了这些运算符的使用方法

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190714753-1761573897.png)

* `+` 用于获得一个或多个值的和
* `-` 用于从一个值减去另一个值
* `*` 用于两数相乘，得到两个或多个值的乘积
* `/` 用一个值除以另一个值得到商
* `%` 用于一个值除以另一个值得到余数

在除法和取余需要注意一点，如果除数是 0 ，将是非法除数，返回结果为 NULL。

### 比较运算符

熟悉了运算符，下面来聊一聊比较运算符，使用 SELECT 语句进行查询时，MySQL 允许用户对表达式的两侧的操作数进行比较，比较结果为真，返回 1， 比较结果为假，返回 0 ，比较结果不确定返回 NULL。下面是所有的比较运算符

| 运算符          | 描述                              |
| --------------- | --------------------------------- |
| =               | 等于                              |
| <> 或者是 !=    | 不等于                            |
| <=>             | NULL 安全的等于，也就是 NULL-safe |
| <               | 小于                              |
| <=              | 小于等于                          |
| >               | 大于                              |
| >=              | 大于等于                          |
| BETWEEN         | 在指定范围内                      |
| IS NULL         | 是否为 NULL                       |
| IS NOT NULL     | 是否为 NULL                       |
| IN              | 存在于指定集合                    |
| LIKE            | 通配符匹配                        |
| REGEXP 或 RLIKE | 正则表达式匹配                    |

比较运算符可以用来比较数字、字符串或者表达式。数字作为浮点数进行比较，字符串以不区分大小写的方式进行比较。

* = 号运算符，用于比较运算符两侧的操作数是否相等，如果相等则返回 1， 如果不相等则返回 0 ，下面是具体的示例，NULL 不能用于比较，会直接返回 NULL

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190725237-690063826.png)

* `<>` 号用于表示不等于，和 `=` 号相反，示例如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190734861-248457477.png)

* `<=>` NULL-safe 的等于运算符，与 = 号最大的区别在于可以比较 NULL 值

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190741587-1156465888.png)

* `<` 号运算符，当左侧操作数小于右侧操作数时，返回值为 1， 否则其返回值为 0。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190747851-2073502192.png)

* 和上面同理，只不过是满足 <= 的时候返回 1 ，否则 > 返回 0。这里我有个疑问，为什么

```mysql
select 'a' <= 'b';  /* 返回 1 */

/*而*/

select 'a' >= 'b'; /* 返回 0 呢*/
```

* 关于 `>` 和 `>=` 是同理

* `BETWEEN` 运算符的使用格式是 **a BETWEEN min AND max** ，当 a 大于等于 min 并且小于等于 max 时，返回 1，否则返回 0 。操作数类型不同的时候，会转换成相同的数据类型再进行处理。比如

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190755804-142006031.png)

* `IS NULL` 和 `IS NOT NULL` 表示的是是否为 NULL，ISNULL 为 true 返回 1，否则返回 0 ；IS NOT NULL 同理

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190803065-445657190.png)

* `IN` 这个比较操作符判断某个值是否在一个集合中，使用方式是 xxx in (value1,value2,value3) 

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190810645-1482604201.png)

* `LIKE` 运算符的格式是 `xxx LIKE %123%`，比如如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190817373-1291407388.png)

当 like 后面跟的是 `123%` 的时候， xxx 如果是 123 则返回 1，如果是 123xxx 也返回 1，如果是 12 或者 1 就返回 0 。123 是一个整体。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190829886-66771842.png)

* `REGEX` 运算符的格式是 `s REGEXP str` ，匹配时返回值为 1，否则返回 0 。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190836498-182047263.png)

后面会详细介绍 regexp 的用法。

### 逻辑运算符

逻辑运算符指的就是`布尔运算符`，布尔运算符指返回真和假。MySQL 支持四种逻辑运算符

| 运算符         | 作用     |
| -------------- | -------- |
| NOT 或 ！      | 逻辑非   |
| AND 或者是 &&  | 逻辑与   |
| OR 或者是 \|\| | 逻辑或   |
| XOR            | 逻辑异或 |

下面分别来介绍一下

* `NOT` 或者是 `!` 表示的是逻辑非，当操作数为 0（假） ，则返回值为 1，否则值为 0。但是有一点除外，那就是 NOT NULL 的返回值为 NULL

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190844738-1081528893.png)

* `AND` 和 `&&` 表示的是逻辑与的逻辑，当所有操作数为非零值并且不为 NULL 时，结果为 1，但凡是有一个 0 则返回 0，操作数中有一个 null 则返回 null

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190852959-2058062871.png)

* `OR` 和 `||` 表示的是逻辑或，当两个操作数均为非 NULL 值时，如有任意一个操作数为非零值，则结果为 1，否则结果为 0。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190859798-1861461229.png)

* `XOR` 表示逻辑异或，当任意一个操作数为 NULL 时，返回值为 NULL。对于非 NULL 的操作数，如果两个的逻辑真假值相异，则返回结果 1；否则返回 0。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190907258-1147804699.png)

### 位运算符

一听说位运算，就知道是和二进制有关的运算符了，位运算就是将给定的操作数转换为二进制后，对各个操作数的每一位都进行指定的逻辑运算，得到的二进制结果转换为十进制后就说是位运算的结果，下面是所有的位运算。

| 运算符 | 作用   |
| ------ | ------ |
| &      | 位与   |
| \|     | 位或   |
| ^      | 位异或 |
| ～     | 位取反 |
| >>     | 位右移 |
| <<     | 位左移 |

下面分别来演示一下这些例子

* `位与` 指的就是按位与，把 & 双方转换为二进制再进行 & 操作

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190917512-1880792103.png)

按位与是一个数值减小的操作

* `位或` 指的就是按位或，把 | 双方转换为二进制再进行 | 操作

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190923763-645636210.png)

位或是一个数值增大的操作

* `位异或` 指的就是对操作数的二进制位做异或操作

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190931813-835487680.png)

* `位取反` 指的就是对操作数的二进制位做 `NOT` 操作，这里的操作数只能是一位，下面看一个经典的取反例子：对 1 做位取反，具体如下所示：

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190937941-219612738.png)

为什么会有这种现象，因为在 MySQL 中，常量数字默认会以 8 个字节来显示，8 个字节就是 64 位，常量 1 的二进制表示 63 个 `0`，加 1 个 `1` ， 位取反后就是 63 个 `1` 加一个 `0` ， 转换为二进制后就是 18446744073709551614，我们可以使用 **select bin()** 查看一下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621190945479-1261639588.png)

* `位右移` 是对左操作数向右移动指定位数，例如 50 >> 3，就是对 50 取其二进制然后向右移三位，左边补上 0 ，转换结果如下

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191002650-1790158533.png)

* `位左移` 与位右移相反，是对左操作数向左移动指定位数，例如 20 << 2

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191013463-112700213.png)

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

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191023868-1180414321.png)

* CONCAT(s1,s2 ... sn) ：把传入的参数拼接成一个字符串

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191029939-1245733967.png)

上面把 `c xu an` 拼接成为了一个字符串，另外需要注意一点，任何和 NULL 进行字符串拼接的结果都是 NULL。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191036527-900368959.png)

* LEFT(str,x) 和 RIGHT(str,x) 函数：分别返回字符串最左边的 x 个字符和最右边的 x 个字符。如果第二个参数是 NULL，那么将不会返回任何字符串

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191048132-2112982563.png)

* INSERT(str,x,y,instr) ： 将字符串 str 从指定 x 的位置开始， 取 y 个长度的字串替换为 instr。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191055230-407223724.png)

* LTRIM(str) 和 RTRIM(str) 分别表示去掉字符串 str 左侧和右侧的空格

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191103526-1822256316.png)

* REPEAT(str,x) 函数：返回 str 重复 x 次的结果

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191111685-440396397.png)

* TRIM(str) 函数：用于去掉目标字符串的空格

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191119119-1227375535.png)

* SUBSTRING(str,x,y) 函数：返回从字符串 str 中第 x 位置起 y 个字符长度的字符串

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191125284-1785064004.png)

* LPAD(str,n,pad) 和 RPAD(str,n,pad) 函数：用字符串 pad 对 str 左边和右边进行填充，直到长度为 n 个字符长度

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191131796-1920054468.png)

* STRCMP(s1,s2) 用于比较字符串 s1 和 s2 的 ASCII 值大小。如果 s1 < s2，则返回 -1；如果 s1 = s2 ，返回 0 ；如果 s1 > s2 ，返回 1。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191139600-1982730833.png)

* REPLACE(str,a,b) : 用字符串 b 替换字符串 str 种所有出现的字符串 a

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191146695-991154817.png)

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

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191159438-1901367850.png)

* CEIL(x) 函数： 返回大于 x 的整数

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191206305-1318889217.png)

* MOD(x,y)，对 x 和 y 进行取模操作

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191213840-1660963808.png)

* ROUND(x,y) 返回 x 四舍五入后保留 y 位小数的值；如果是整数，那么 y 位就是 0 ；如果不指定 y ，那么 y 默认也是 0 。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191223700-871496702.png)

* FLOOR(x) : 返回小于 x 的最大整数，用法与 CEIL 相反

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191230311-1725783253.png)

* TRUNCATE(x,y): 返回数字 x 截断为 y 位小数的结果， TRUNCATE 知识截断，并不是四舍五入。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191237831-1256203391.png)

* RAND() ：返回 0 到 1 的随机值

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191244983-1131057062.png)

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

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191253918-1526292639.png)

* WEEK(DATE) 和 YEAR(DATE) ：前者返回的是一年中的第几周，后者返回的是给定日期的哪一年

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191302742-1840072675.png)

* HOUR(time) 和 MINUTE(time) : 返回给定时间的小时，后者返回给定时间的分钟

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191309666-329841314.png)

* MONTHNAME(date) 函数：返回 date 的英文月份

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191317786-1909780427.png)

* CURDATE() 函数：返回当前日期，只包含年月日

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191328117-1591627113.png)

* CURTIME() 函数：返回当前时间，只包含时分秒

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191334745-1209893325.png)

* UNIX_TIMESTAMP(date) : 返回 UNIX 的时间戳

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191341908-130213625.png)

* FROM_UNIXTIME(date) : 返回 UNIXTIME 时间戳的日期值，和 UNIX_TIMESTAMP 相反

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191349445-723883543.png)

* DATE_FORMAT(date,fmt) 函数：按照字符串 fmt 对 date 进行格式化，格式化后按照指定日期格式显示

具体的日期格式可以参考这篇文章 https://blog.csdn.net/weixin_38703170/article/details/82177837

我们演示一下将当前日期显示为**年月日**的这种形式，使用的日期格式是 **%M %D %Y**。

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191357587-989325473.png)

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

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191407239-2014544934.png)

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

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191416707-2068012968.png)

* DATABASE: 返回当前的数据库名

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191423533-702299399.png)

* USER : 返回当前登录用户名

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191429628-580411417.png)

* PASSWORD(str) : 返回字符串的加密版本，例如

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191436903-282181600.png)

* MD5(str) 函数：返回字符串 str 的 MD5 值

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191443736-91163215.png)

* INET_ATON(IP): 返回 IP 的网络字节序列

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191449939-1519184089.png)

* INET_NTOA(num)函数：返回网络字节序列代表的 IP 地址，与 INET_ATON 相对

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200621191456179-1463478735.png)



![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


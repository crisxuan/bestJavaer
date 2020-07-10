# MySQL 数据类型

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
# MySQL 常用函数

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


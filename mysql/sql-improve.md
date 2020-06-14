由于工作需要，最近做了很多 BI 取数的工作，需要用到一些比较高级的 SQL 技巧，总结了一下工作中用到的一些比较骚的进阶，特此记录一下，以方便自己查阅，主要目录如下：

* SQL 的书写规范
* SQL 的一些进阶使用技巧
* SQL 的优化方法 


## SQL 的书写规范

在介绍一些技巧之前，有必要强调一下规范，这一点我发现工作中经常被人忽略，其实遵循好的规范可读性会好很多，应该遵循哪些规范呢

1、 表名要有意义，且标准 SQL 中规定表名的第一个字符应该是字母。

2、注释，有单行注释和多行注释，如下

```sql
-- 单行注释
-- 从SomeTable中查询col_1 
SELECT col_1
  FROM SomeTable;

/*
多行注释
从 SomeTable 中查询 col_1 
*/
SELECT col_1
  FROM SomeTable;
```
多行注释很多人不知道，这种写法不仅可以用来添加真正的注释，也可以用来注释代码，非常方便

3、缩进

就像写 Java，Python 等编程语言一样 ，SQL 也应该有缩进，良好地缩进对提升代码的可读性帮助很大，以下分别是好的缩进与坏的缩进示例


```sql
-- 好的缩进
SELECT col_1, 
       col_2, 
       col_3,
       COUNT(*) 
  FROM tbl_A
 WHERE col_1 = 'a'
   AND col_2 = ( SELECT MAX(col_2)
                   FROM tbl_B
                  WHERE col_3 = 100 )
 GROUP BY col_1,
          col_2,
          col_3


-- 坏的示例
SELECT col1_1, col_2, col_3, COUNT(*)
FROM   tbl_A
WHERE  col1_1 = 'a'
AND    col1_2 = (
SELECT MAX(col_2)
FROM   tbl_B
WHERE  col_3 = 100
) GROUP BY col_1, col_2, col_3
```

4、空格

代码中应该适当留有一些空格，如果一点不留，代码都凑到一起， 逻辑单元不明确，阅读的人也会产生额外的压力，以下分别是是好的与坏的示例

```sql

-- 好的示例
SELECT col_1
  FROM tbl_A A, tbl_B B
 WHERE ( A.col_1 >= 100 OR A.col_2 IN ( 'a', 'b' ) )
   AND A.col_3 = B.col_3;

-- 坏的示例
SELECT col_1
  FROM tbl_A A,tbl_B B
 WHERE (A.col_1>=100 OR A.col_2 IN ('a','b'))
   AND A.col_3=B.col_3;
```


4、大小写

关键字使用大小写，表名列名使用小写，如下

```sql
SELECT col_1, col_2, col_3,
       COUNT(*)
  FROM tbl_A
 WHERE col_1 = 'a'
   AND col_2 = ( SELECT MAX(col_2)
                   FROM tbl_B
                  WHERE col_3 = 100 )
 GROUP BY col_1, col_2, col_3
```

花了这么多时间强调规范，有必要吗，有！好的规范让代码的可读性更好，更有利于团队合作，之后的 SQL 示例都会遵循这些规范。

## SQL 的一些进阶使用技巧

**一、巧用 CASE WHEN 进行统计**

来看看如何巧用 CASE WHEN 进行定制化统计,假设我们有如下的需求，希望根据左边各个市的人口统计每个省的人口

![](https://user-gold-cdn.xitu.io/2020/5/8/171f45f26bc2542d?w=818&h=283&f=png&s=30366)

使用 CASE WHEN 如下

```sql
SELECT CASE pref_name
               WHEN '长沙' THEN '湖南' 
               WHEN '衡阳' THEN '湖南'
               WHEN '海口' THEN '海南' 
               WHEN '三亚' THEN '海南'
       ELSE '其他' END AS district,
       SUM(population) 
FROM PopTbl
GROUP BY district;
```

**二、巧用 CASE WHEN 进行更新**

现在某公司员人工资信息表如下:

![](https://user-gold-cdn.xitu.io/2020/5/8/171f45f271f4a96f?w=318&h=280&f=png&s=16778)


现在公司出台了一个奇葩的规定

1. 对当前工资为 1 万以上的员工，降薪 10%。
2. 对当前工资低于 1 万的员工，加薪 20%。 

一些人不假思索可能写出了以下的 SQL:

```sql
--条件1
UPDATE Salaries
SET salary = salary * 0.9 WHERE salary >= 10000;
--条件2
UPDATE Salaries
SET salary = salary * 1.2
WHERE salary < 10000;
```
这么做其实是有问题的， 什么问题，对小明来说，他的工资是 10500，执行第一个 SQL 后，工资变为 10500 \* 0.9 = 9450, 紧接着又执行条件 2， 工资变为了 9450 \* 1.2 = 11340，反而涨薪了！

如果用 CASE WHEN 可以解决此类问题，如下：
```sql
UPDATE Salaries
SET salary = CASE WHEN salary >= 10000 THEN salary * 0.9
WHEN salary < 280000 THEN salary * 1.2
ELSE salary END;
```

**三、巧用 HAVING 子句**

一般 HAVING 是与 GROUP BY 结合使用的，但其实它是可以独立使用的，
假设有如下表，第一列 seq 叫连续编号，但其实有些编号是缺失的，怎么知道编号是否缺失呢，

![](https://user-gold-cdn.xitu.io/2020/5/8/171f45f26ba5842c?w=419&h=216&f=png&s=17670)

用 HAVING 表示如下:

```sql
SELECT '存在缺失的编号' AS gap
  FROM SeqTbl
HAVING COUNT(*) <> MAX(seq);
```

**四、自连接**

针对相同的表进行的连接被称为“自连接”(self join)，这个技巧常常被人们忽视，其实是有挺多妙用的

1、删除重复行

![](https://user-gold-cdn.xitu.io/2020/5/8/171f45f28a9ee43e?w=419&h=273&f=png&s=27006)

上图中有三个橘子，需要把这些重复的行给删掉，用如下自连接可以解决：

```sql
DELETE FROM Products P1
 WHERE id < ( SELECT MAX(P2.id) 
                   FROM Products P2 
                  WHERE P1.name = P2.name 
                    AND P1.price = P2.price ); 
```

2、排序

在 db 中，我们经常需要按分数，人数，销售额等进行排名，有 Oracle, DB2 中可以使用 RANK 函数进行排名，不过在 MySQL 中 RANK 函数未实现，这种情况我们可以使用自连接来实现,如对以下 Products 表按价格高低进行排名

![](https://user-gold-cdn.xitu.io/2020/5/8/171f45f1ebcb9b3c?w=366&h=175&f=png&s=17002)


使用自连接可以这么写:

```sql
-- 排序从 1 开始。如果已出现相同位次，则跳过之后的位次 
SELECT P1.name,
       P1.price,
       (SELECT COUNT(P2.price)
          FROM Products P2
         WHERE P2.price > P1.price) + 1 AS rank_1
  FROM Products P1 
  ORDER BY rank_1;
```

结果如下:

```sql
name price rank 
----- ------ ------ 
橘子    100     1 
西瓜     80     2 
苹果     50     3 
葡萄     50     3 
香蕉     50     3 
柠檬     30     6
```

**五、巧用 COALESCE 函数**

此函数作用返回参数中的第一个非空表达式，假设有如下商品，我们重新格式化一样，如果 city 为 null，代表商品不在此城市发行，但我们在展示结果的时候不想展示 null，而想展示 'N/A', 可以这么做:

```sql
SELECT 
    COALESCE(city, 'N/A')
  FROM
    customers;
```

![](https://user-gold-cdn.xitu.io/2020/5/8/171f45f23af2ffa4?w=319&h=281&f=png&s=12891)



## SQL 性能优化技巧

**一、参数是子查询时，使用 EXISTS 代替 IN**

如果 IN 的参数是（1，2，3）这样的值列表时，没啥问题，但如果参数是子查询时，就需要注意了。比如，现在有如下两个表：

![](https://user-gold-cdn.xitu.io/2020/5/8/171f45f332825699?w=1406&h=584&f=png&s=47266)

现在我们要查出同时存在于两个表的员工，即小明和小东，则以下用 IN 和 EXISTS 返回的结果是一样，但是用 EXISTS 的 SQL 会更快:

```SQL

-- 慢
SELECT * 
  FROM Class_A
WHERE id IN (SELECT id 
               FROM  CLASS_B);

-- 快
SELECT *
  FROM Class_A A 
 WHERE EXISTS
(SELECT * 
   FROM Class_B  B
  WHERE A.id = B.id);
```

为啥使用 EXISTS 的 SQL 运行更快呢，有两个原因

1. 可以`用到索引，如果连接列 (id) 上建立了索引，那么查询 Class_B 时不用查实际的表，只需查索引就可以了。
2. 如果使用 EXISTS，那么只要查到一行数据满足条件就会终止查询， 不用像使用 IN 时一样扫描全表。在这一点上 NOT EXISTS 也一样


另外如果 IN 后面如果跟着的是子查询，由于 SQL 会先执行 IN 后面的子查询，会将子查询的结果保存在一张临时的工作表里（内联视图），然后扫描**整个视图**，显然扫描整个视图这个工作很多时候是非常耗时的，而用 EXISTS 不会生成临时表。

当然了，如果 IN 的参数是子查询时，也可以用连接来代替，如下：

```sql
-- 使用连接代替 IN SELECT A.id, A.name
FROM Class_A A INNER JOIN Class_B B ON A.id = B.id;
```
用到了 「id」列上的索引，而且由于没有子查询，也不会生成临时表

**二、避免排序**

SQL 是声明式语言，即对用户来说，只关心它能做什么，不用关心它怎么做。这样可能会产生潜在的性能问题：排序，会产生排序的代表性运算有下面这些

* GROUP BY 子句
* ORDER BY 子句
* 聚合函数(SUM、COUNT、AVG、MAX、MIN) 
* DISTINCT
* 集合运算符(UNION、INTERSECT、EXCEPT) 
* 窗口函数(RANK、ROW_NUMBER 等)

如果在内存中排序还好，但如果内存不够导致需要在硬盘上排序上的话，性能就会急剧下降，所以我们需要减少不必要的排序。怎样做可以减少排序呢。

1、 使用集合运算符的 ALL 可选项

SQL 中有 UNION，INTERSECT，EXCEPT 三个集合运算符，默认情况下，这些运算符会为了避免重复数据而进行排序，对比一下使用 UNION 运算符加和不加 ALL 的情况:


![](https://user-gold-cdn.xitu.io/2020/5/8/171f45f341f95fba?w=974&h=539&f=png&s=49965)

注意：加 ALL 是优化性能非常有效的手段，不过前提是不在乎结果是否有重复数据。

2、使用 EXISTS 代表 DISTINCT

为了排除重复数据， DISTINCT 也会对结果进行排序，如果需要对两张表的连接结果进行去重，可以考虑用 EXISTS 代替 DISTINCT，这样可以避免排序。

![](https://user-gold-cdn.xitu.io/2020/5/8/171f45f36457dfd3?w=818&h=283&f=png&s=36930)

如何找出有销售记录的商品，使用如下 DISTINCT 可以：

```sql
SELECT DISTINCT I.item_no
FROM Items I INNER JOIN SalesHistory SH
ON I. item_no = SH. item_no;
```

不过更好的方式是使用 EXISTS:

```sql
SELECT item_no FROM Items I
WHERE EXISTS 
        (SELECT *
           FROM SalesHistory SH
          WHERE I.item_no = SH.item_no);
```

既用到了索引，又避免了排序对性能的损耗。

**二、在极值函数中使用索引（MAX/MIN）**

使用 MAX/ MIN 都会对进行排序，如果参数字段上没加索引会导致全表扫描，如果建有索引，则只需要扫描索引即可，对比如下

```sql
-- 这样写需要扫描全表 
SELECT MAX(item)
  FROM Items;

-- 这样写能用到索引 
SELECT MAX(item_no)
  FROM Items;
```

注意：极值函数参数推荐为索引列中并不是不需要排序，而是优化了排序前的查找速度（毕竟索引本身就是有序排列的）。

**三、能写在 WHERE 子句里的条件不要写在 HAVING 子句里**

下列 SQL 语句返回的结果是一样的:

```sql
-- 聚合后使用 HAVING 子句过滤
SELECT sale_date, SUM(quantity)
  FROM SalesHistory GROUP BY sale_date
HAVING sale_date = '2007-10-01';

-- 聚合前使用 WHERE 子句过滤
SELECT sale_date, SUM(quantity)
  FROM SalesHistory
 WHERE sale_date = '2007-10-01' 
 GROUP BY sale_date;
```

使用第二条语句效率更高，原因主要有两点

1. 使用 GROUP BY 子句进行聚合时会进行排序，如果事先通过 WHERE 子句能筛选出一部分行，能减轻排序的负担
2. 在 WHERE 子句中可以使用索引，而 HAVING 子句是针对聚合后生成的视频进行筛选的，但很多时候聚合后生成的视图并没有保留原表的索引结构


**四、在 GROUP BY 子句和 ORDER BY 子句中使用索引**

GROUP BY 子句和 ORDER BY 子句一般都会进行排序，以对行进行排列和替换，不过如果指定带有索引的列作为这两者的参数列，由于用到了索引，可以实现高速查询，由于索引是有序的，排序本身都会被省略掉

**五、使用索引时，条件表达式的左侧应该是原始字段**

假设我们在 col 列上建立了索引，则下面这些 SQL 语句无法用到索引

```sql
SELECT *
  FROM SomeTable
 WHERE col * 1.1 > 100;

SELECT *
  FROM SomeTable
 WHERE SUBSTR(col, 1, 1) = 'a';
```

以上第一个 SQL 在索引列上进行了运算, 第二个 SQL 对索引列使用了函数，均无法用到索引，正确方式是把列单独放在左侧,如下:

```sql
SELECT *
  FROM SomeTable
 WHERE col_1 > 100 / 1.1;
```


当然如果需要对此列使用函数，则无法避免在左侧运算，可以考虑使用函数索引，不过一般不推荐随意这么做。


**六、尽量避免使用否定形式**

如下的几种否定形式不能用到索引：

* <>
* !=
* NOT IN

所以以下 了SQL 语句会导致全表扫描

```sql
SELECT *
  FROM SomeTable
 WHERE col_1 <> 100;
```

可以改成以下形式

```sql
SELECT *
  FROM SomeTable
 WHERE col_1 > 100 or col_1 < 100;
```

**七、进行默认的类型转换**

假设 col 是 char 类型，则推荐使用以下第二，三条 SQL 的写法，不推荐第一条 SQL 的写法

```sql
× SELECT * FROM SomeTable WHERE col_1 = 10;
○ SELECT * FROM SomeTable WHERE col_1 = '10';
○ SELECT * FROM SomeTable WHERE col_1 = CAST(10, AS CHAR(2));
```

虽然第一条 SQL 会默认把 10 转成 '10'，但这种默认类型转换不仅会增加额外的性能开销，开会导致索引不可用，所以建议使用的时候地进行类型转换。

**八、减少中间表**

在 SQL 中，子查询的结果会产生一张新表，不过如果不加限制大量使用中间表的话，会带来两个问题，一是展示数据需要消耗内存资源，二是原始表中的索引不容易用到，所以尽量减少中间表也可以提升性能。

**九、灵活使用 HAVING 子句**

这一点与上面第八条相呼应，对聚合结果指定筛选条件时，使用 HAVING 是基本的原则，可能一些工程师会倾向于使用下面这样的写法:

```sql
SELECT *
  FROM (SELECT sale_date, MAX(quantity) AS max_qty
          FROM SalesHistory 
         GROUP BY sale_date) TMP
WHERE max_qty >= 10;
```
虽然上面这样的写法能达到目的，但会生成 TMP 这张临时表，所以应该使用下面这样的写法:

```sql
SELECT sale_date, MAX(quantity) 
  FROM SalesHistory
 GROUP BY sale_date
HAVING MAX(quantity) >= 10;
```

HAVING 子句和聚合操作是同时执行的，所以比起生成中间表后再执行 HAVING 子句，效率会更高，代码也更简洁


**10、需要对多个字段使用 IN 谓词时，将它们汇总到一处**


一个表的多个字段可能都使用了 IN 谓词，如下:

```sql
SELECT id, state, city 
  FROM Addresses1 A1
 WHERE state IN (SELECT state
                   FROM Addresses2 A2
                  WHERE A1.id = A2.id) 
    AND city IN (SELECT city
                   FROM Addresses2 A2 
                  WHERE A1.id = A2.id);
```

这段代码用到了两个子查询，也就产生了两个中间表，可以像下面这样写

```sql
SELECT *
  FROM Addresses1 A1
 WHERE id || state || city
    IN (SELECT id || state|| city
          FROM Addresses2 A2);
```

这样子查询不用考虑关联性，没有中间表产生，而且只执行一次即可。


## 总结

本文一开始花了挺大的篇幅来讲解 SQL 的规范，请大家务必重视这部分内部，良好地规范有利于团队协作，对于代码的阅读也比较友好。

之后介绍了一些 SQL 的比较高级的用法，巧用这些技巧确实能达到事半功倍的效果，由于本文篇幅有限只是介绍了一部分，下篇我们会再介绍一些其他的技巧，敬请期待哦


 **巨人的肩膀**

* <<SQL 进阶教程>>


欢迎大家关注公号，共同进步！

![](https://user-gold-cdn.xitu.io/2020/5/8/171f3cdebc558d86?w=430&h=430&f=jpeg&s=41396)

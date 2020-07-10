# MySQL 字符集

下面来认识一下 MySQL 字符集，简单来说字符集就是一套文字符号和编码、比较规则的集合。1960 年美国标准化组织 ANSI 发布了第一个计算机字符集，就是著名的 `ASCII(American Standard Code for Information Interchange)` 。自从 ASCII 编码后，每个国家、国际组织都研究了一套自己的字符集，比如 `ISO-8859-1`、`GBK` 等。

但是每个国家都使用自己的字符集为移植性带来了很大的困难。所以，为了统一字符编码，`国际标准化组织(ISO)` 指定了统一的字符标准 - Unicode 编码，它容纳了几乎所有的字符编码。下面是一些常见的字符编码

| 字符集     | 是否定长 | 编码方式            |
| ---------- | -------- | ------------------- |
| ASCII      | 是       | 单字节 7 位编码     |
| ISO-8859-1 | 是       | 单字节 8 位编码     |
| GBK        | 是       | 双字节编码          |
| UTF-8      | 否       | 1 - 4 字节编码      |
| UTF-16     | 否       | 2 字节或 4 字节编码 |
| UTF-32     | 是       | 4 字节编码          |

对数据库来说，字符集是很重要的，因为数据库存储的数据大多数都是各种文字，字符集对数据库的存储、性能、系统的移植来说都非常重要。

MySQL 支持多种字符集，可以使用 `show character set;` 来查看所有可用的字符集

![](https://img2020.cnblogs.com/blog/1515111/202007/1515111-20200706132955205-1513568840.png)

或者使用

```mysql
select character_set_name, default_collate_name, description, maxlen from information_schema.character_sets;
```

来查看。

使用 `information_schema.character_set` 来查看字符集和校对规则。

![](https://img2020.cnblogs.com/blog/1515111/202007/1515111-20200706133003359-1814346116.png)

![](https://img2020.cnblogs.com/blog/1515111/202007/1515111-20200706133035847-522276071.png)


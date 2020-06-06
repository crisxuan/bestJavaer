# Arrays.asList 解析

[TOC]

## 说明

asList 是 java.util.Arrays 类的一个方法

```java
public static <T> List<T> asList(T... a) {
        return new ArrayList<>(a);
}
```

官方的解释： 返回由指定数组支持的固定大小的列表，这个方法是array 和 collectionn API 之间的一个桥梁，它所返回的List 是序列化之后的，并且实现了 RandomAccess 接口

就是一个能够快捷指定固定大小的列表，并进行初始化指定的元素

**注意：这个List 返回的不是 java.util.ArrayList，而是 java.util.Arrays的一个内部类**

```java
ArrayList(E[] array) {
            a = Objects.requireNonNull(array);
}
```

参数接受的是一个数组，使用java.util.Objects 对象的requireNonNull 来判断是否为空

如果为空则直接抛出空指针异常，此种判空方式常用于构造函数的参数判断

## 基本用法

```java
List<String> list = Arrays.asList("Apple"); 
```

asList 是一个静态方法，能够直接被调用，如上所示，只创建了一个叫apple的元素

```java
List<String> list = Arrays.asList("Apple","Orange");
```

也可以创建多个指定元素的列表

通过以上两种方式，我们能够知道，asList方法能够创建多个指定元素的列表

```java
public class ArraysTest {

    public static void main(String[] args) {
        String[] array = {"Apple","Banana","Orange"};
        List<String> myList = Arrays.asList(array);
        for(String list : myList){
            System.out.println(list);
        }
    }
}
```

----------------------------------------------------------------------输出:------------------------------------------------------------------------------

Apple

Banana

Orange

## 陷阱

#### 陷阱一：

虽然说对于Arrays.asList 能够方便快捷的创建一个列表，但是世界上没有完美的技术，这个方法也不例外，同样会产生一些缺陷和漏洞：

```java
public class ArraysTest {
    public static void main(String[] args) {
        int[] array = {1,2,3};
        List myList = Arrays.asList(array);
        System.out.println(myList.size());
    }
}
```

----------------------------------------------------------------------输出:------------------------------------------------------------------------------

1

这时你会很好奇，我明明创建了三个元素，为什么输出的长度是 1 呢？

因为asList需要接收的参数是一个原始数组，所以上述代码对它创建了一个名为"array"的列表，只有一个元素所以长度为1

```java
System.out.println(myList.get(0))
```

输出发现上面得到的并不是1 2 3 中任意的一个值，而是一个hashcode ，这就说明这个list 唯一的元素是一个array对象

#### 陷阱二：

假如我创建了一个指定元素的list，那么我能否对这个list进行 元素添加等操作呢？

```java
public class ArraysTest {

    public static void main(String[] args) {
        String[] myArray = {"Apple","Banana","Orange"};
        List<String> myList = Arrays.asList(myArray);
        myList.add("Pear");
    }
}
```

运行后程序报错，	

```java
Exception in thread "main" java.lang.UnsupportedOperationException
	at java.util.AbstractList.add(AbstractList.java:148)
	at java.util.AbstractList.add(AbstractList.java:108)
	at Arrays.ArraysTest.main(ArraysTest.java:11)
```

说是不支持操作类型异常，Arrays.asList()创建完列表之后，你就不能够再修改元素



## 改观

#### 改观一：把私有的数组转换为List

使用了 JDK 1.8的lambda 表达式和流

```java
public class ArraysTest {

    public static void main(String[] args) {
        int[] intArray = {5, 10, 21};
        List<Integer> myList = Arrays.stream(intArray).boxed()
                .collect(Collectors.toList());
    }
}
```

#### 改观二： 把数组转换成List 来接受更多的元素

如上面所述，Arrays.asList()的结果不支持添加或删除项，如果你不能接受这种行为，可以换一种方式

```java
public class ArraysTest {

    public static void main(String[] args) {
        String[] myArray = {"Apple", "Banana", "Orange"};
        List<String> myList = new ArrayList<>(Arrays.asList(myArray));
        myList.add("Guava");
    }
}
```

可以尝试新new 一个ArrayList 来接受 Arrays.asList产生的结果

#### 改观三： 使用自己的实现将数组转换为列表

下面是将Array转换为List的简单实现

```java
public class ArraysTest {

    public static void main(String[] args) {
        String[] myArray = {"Apple", "Banana", "Orange"};
        List<String> myList = new ArrayList<>();
        for(String str : myArray){
            myList.add(str);
        }
        System.out.println(myList.size());
    }
}
```



本文参考： 

https://www.jianshu.com/p/2b113f487e5e


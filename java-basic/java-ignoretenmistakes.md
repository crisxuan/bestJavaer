# Java 开发最容易犯的 10 个错误

* [Java 开发最容易犯的 10 个错误](#java-开发最容易犯的-10-个错误)
   * [错误一：Array 转换成 ArrayList](#错误一array-转换成-arraylist)
   * [错误二：检查数组是否包含某个值](#错误二检查数组是否包含某个值)
   * [错误三：在 List 中循环删除元素](#错误三在-list-中循环删除元素)
   * [错误四：Hashtable 和 HashMap](#错误四hashtable-和-hashmap)
   * [错误五：使用原始类型的集合](#错误五使用原始类型的集合)
   * [错误六：访问级别问题](#错误六访问级别问题)
   * [错误七：ArrayList 和 LinkedList](#错误七arraylist-和-linkedlist)
   * [错误八：可变和不可变](#错误八可变和不可变)
   * [错误九：构造函数](#错误九构造函数)
   * [错误十：到底是使用 "" 还是构造函数](#错误十到底是使用--还是构造函数)
   * [后记](#后记)

那个谁，今天又写 bug 了，没错，他说的好像就是我。。。。。。

作为 Java 开发，我们在写代码的过程中难免会产生各种奇思妙想的 bug ，有些 bug 就挺让人无奈的，比如说各种空指针异常，在 ArrayList 的迭代中进行删除操作引发异常，数组下标越界异常等。

如果你不小心看到同事的代码出现了我所描述的这些 bug 后，那你就把我这篇文章甩给他！！！你甩给他一篇文章，并让他关注了一波 cxuan，你会收获他在后面像是如获至宝并满眼崇拜大神的目光。

废话不多说，下面进入正题。

## 错误一：Array 转换成 ArrayList

Array 转换成 ArrayList 还能出错？这是哪个笨。。。。。。

等等，你先别着急说，先来看看是怎么回事。

如果要将数组转换为 ArrayList，我们一般的做法会是这样

```java
List<String> list = Arrays.asList(arr);
```

Arrays.asList() 将返回一个 ArrayList，它是 Arrays 中的私有静态类，它不是 java.util.ArrayList 类。如下图所示

![](http://www.cxuan.vip/image-20230203180823167.png)

Arrays 内部的 ArrayList 只有 set、get、contains 等方法，但是没有能够像是 add 这种能够使其内部结构进行改变的方法，所以 Arrays 内部的 ArrayList 的大小是固定的。

![](http://www.cxuan.vip/image-20230203180838777.png)

如果要创建一个能够添加元素的 ArrayList ，你可以使用下面这种创建方式：

```java
ArrayList<String> arrayList = new ArrayList<String>(Arrays.asList(arr));
```

因为 ArrayList 的构造方法是可以接收一个 Collection 集合的，所以这种创建方式是可行的。

![](http://www.cxuan.vip/image-20230203180857076.png)

## 错误二：检查数组是否包含某个值

检查数组中是否包含某个值，部分程序员经常会这么做：

```java
Set<String> set = new HashSet<String>(Arrays.asList(arr));
return set.contains(targetValue);
```

这段代码虽然没错，但是有额外的性能损耗，正常情况下，不用将其再转换为 *set*，直接这么做就好了：

```java
return Arrays.asList(arr).contains(targetValue);
```

或者使用下面这种方式（穷举法，循环判断）

```java
for(String s: arr){
	if(s.equals(targetValue))
		return true;
}
return false;
```

上面第一段代码比第二段更具有可读性。

## 错误三：在 List 中循环删除元素

这个错误我相信很多小伙伴都知道了，在循环中删除元素是个禁忌，有段时间内我在审查代码的时候就喜欢看团队的其他小伙伴有没有犯这个错误。

![](http://www.cxuan.vip/image-20230203180916978.png)

说到底，为什么不能这么做（集合内删除元素）呢？且看下面代码

```java
ArrayList<String> list = new ArrayList<String>(Arrays.asList("a", "b", "c", "d"));
for (int i = 0; i < list.size(); i++) {
	list.remove(i);
}
System.out.println(list);
```

这个输出结果你能想到么？是不是蠢蠢欲动想试一波了？

答案其实是 [b,d]

为什么只有两个值？我这不是循环输出的么？

其实，在列表内部，当你使用**外部** remove 的时候，一旦 remove 一个元素后，其列表的内部结构会发生改变，一开始集合总容量是 4，remove 一个元素之后就会变为 3，然后再和 i 进行比较判断。。。。。。所以只能输出两个元素。

你可能知道使用迭代器是正确的 remove 元素的方式，你还可能知道 for-each 和 iterator 这种工作方式类似，所以你写下了如下代码

```java
ArrayList<String> list = new ArrayList<String>(Arrays.asList("a", "b", "c", "d"));
 
for (String s : list) {
	if (s.equals("a"))
		list.remove(s);
}
```

然后你充满自信的 run xxx.main() 方法，结果。。。。。。*ConcurrentModificationException*

为啥呢？

那是因为使用 ArrayList 中外部 remove 元素，会造成其内部结构和游标的改变。

在阿里开发规范上，也有不要在 for-each 循环内对元素进行 remove/add 操作的说明。

![](http://www.cxuan.vip/image-20230203180933892.png)

所以大家要使用 List 进行元素的添加或者删除操作，一定要使用迭代器进行删除。也就是

```java
ArrayList<String> list = new ArrayList<String>(Arrays.asList("a", "b", "c", "d"));
Iterator<String> iter = list.iterator();
while (iter.hasNext()) {
	String s = iter.next();
 
	if (s.equals("a")) {
		iter.remove();
	}
}
```

.next() 必须在 .remove() 之前调用。 在 foreach 循环中，编译器会在删除元素的操作后调用 .next()，导致ConcurrentModificationException。

## 错误四：Hashtable 和 HashMap

这是一条算法方面的规约：按照算法的约定，Hashtable 是数据结构的名称，但是在 Java 中，数据结构的名称是 HashMap，Hashtable 和 HashMap 的主要区别之一就是 Hashtable 是同步的，所以很多时候你不需要 Hashtable ，而是使用 HashMap。

## 错误五：使用原始类型的集合

这是一条泛型方面的约束：

在 Java 中，原始类型和无界通配符类型很容易混合在一起。以 Set 为例，Set 是原始类型，而 Set<?> 是无界通配符类型。

比如下面使用原始类型 List 作为参数的代码：

```java
public static void add(List list, Object o){
	list.add(o);
}
public static void main(String[] args){
	List<String> list = new ArrayList<String>();
	add(list, 10);
	String s = list.get(0);
}

```

这段代码会抛出 *java.lang.ClassCastException* 异常，为啥呢？

![](http://www.cxuan.vip/image-20230203180954305.png)

使用原始类型集合是比较危险的，因为原始类型会跳过泛型检查而且不安全，`Set、Set<?> 和 Set<Object>` 存在巨大的差异，而且泛型在使用中很容易造成类型擦除。

大家都知道，Java 的泛型是伪泛型，这是因为 Java 在编译期间，所有的泛型信息都会被擦掉，正确理解泛型概念的首要前提是理解类型擦除。Java 的泛型基本上都是在编译器这个层次上实现的，在生成的字节码中是不包含泛型中的类型信息的，使用泛型的时候加上类型参数，在编译器编译的时候会去掉，这个过程成为**类型擦除**。

如在代码中定义`List<Object>`和`List<String>`等类型，在编译后都会变成`List`，JVM 看到的只是`List`，而由泛型附加的类型信息对 JVM 是看不到的。Java 编译器会在编译时尽可能的发现可能出错的地方，但是仍然无法在运行时刻出现的类型转换异常的情况，类型擦除也是 Java 的泛型与 C++ 模板机制实现方式之间的重要区别。

比如下面这段示例

```java
public class Test {

    public static void main(String[] args) {

        ArrayList<String> list1 = new ArrayList<String>();
        list1.add("abc");

        ArrayList<Integer> list2 = new ArrayList<Integer>();
        list2.add(123);

        System.out.println(list1.getClass() == list2.getClass());
    }

}
```

在这个例子中，我们定义了两个`ArrayList`数组，不过一个是`ArrayList<String>`泛型类型的，只能存储字符串；一个是`ArrayList<Integer>`泛型类型的，只能存储整数，最后，我们通过`list1`对象和`list2`对象的`getClass()`方法获取他们的类的信息，最后发现结果为`true`。说明泛型类型`String`和`Integer`都被擦除掉了，只剩下原始类型。

所以，最上面那段代码，把 10 添加到 Object 类型中是完全可以的，然而将 Object 类型的 "10" 转换为 String 类型就会抛出类型转换异常。

## 错误六：访问级别问题

我相信大部分开发在设计 class 或者成员变量的时候，都会简单粗暴的直接声明 *public xxx*，这是一种糟糕的设计，声明为 public 就很容易赤身裸体，这样对于类或者成员变量来说，都存在一定危险性。

## 错误七：ArrayList 和 LinkedList 

哈哈哈，ArrayList 是我见过程序员使用频次最高的工具类，没有之一。

当开发人员不知道 ArrayList 和 LinkedList 的区别时，他们经常使用 ArrayList（其实实际上，就算知道他们的区别，他们也不用 LinkedList，因为这点性能不值一提），因为看起来 ArrayList 更熟悉。。。。。。

但是实际上，ArrayList 和 LinkedList 存在巨大的性能差异，简而言之，如果添加/删除操作大量且随机访问操作不是很多，则应首选 LinkedList。如果存在大量的访问操作，那么首选 ArrayList，但是 ArrayList 不适合进行大量的添加/删除操作。

## 错误八：可变和不可变

不可变对象有很多优点，比如简单、安全等。但是不可变对象需要为每个不同的值分配一个单独的对象，对象不具备**复用性**，如果这类对象过多可能会导致垃圾回收的成本很高。在可变和不可变之间进行选择时需要有一个平衡。

一般来说，可变对象用于避免产生过多的中间对象。 比如你要连接大量字符串。 如果你使用一个不可变的字符串，你会产生很多可以立即进行垃圾回收的对象。 这会浪费 CPU 的时间和精力，使用可变对象是正确的解决方案（例如 StringBuilder）。如下代码所示：

```java
String result="";
for(String s: arr){
	result = result + s;
}
```

所以，正确选择可变对象还是不可变对象需要慎重抉择。

## 错误九：构造函数

首先看一段代码，分析为什么会编译不通过？

![](http://www.cxuan.vip/image-20230203181025470.png)

发生此编译错误是因为未定义默认 Super 的构造函数。 在 Java 中，如果一个类没有定义构造函数，编译器会默认为该类插入一个默认的无参数构造函数。 如果在 Super 类中定义了构造函数，在这种情况下 Super(String s)，编译器将不会插入默认的无参数构造函数。 这就是上面 Super 类的情况。

要想解决这个问题，只需要在 Super 中添加一个无参数的构造函数即可。

```java
public Super(){
    System.out.println("Super");
}
```

## 错误十：到底是使用 "" 还是构造函数

考虑下面代码：

```java
String x = "abc";
String y = new String("abc");
```

上面这两段代码有什么区别吗？

可能下面这段代码会给出你回答

```java
String a = "abcd";
String b = "abcd";
System.out.println(a == b);  // True
System.out.println(a.equals(b)); // True
 
String c = new String("abcd");
String d = new String("abcd");
System.out.println(c == d);  // False
System.out.println(c.equals(d)); // True
```

这就是一个典型的内存分配问题。

## 后记

今天我给你汇总了一下 Java 开发中常见的 10 个错误，虽然比较简单，但是很容易忽视的问题，细节成就完美，看看你还会不会再犯了，如果再犯，嘿嘿嘿。

点赞在看分享朋友圈是基操哦！快来一键三连！！！

# for 、foreach 、iterator 三种遍历方式的比较

* [for 、foreach 、iterator 三种遍历方式的比较](#for-foreach-iterator-三种遍历方式的比较)
      * [习惯用法](#习惯用法)
      * [速度对比](#速度对比)
      * [remove操作三种遍历方式的影响](#remove操作三种遍历方式的影响)
         * [for循环的remove](#for循环的remove)
         * [foreach 中的remove](#foreach-中的remove)
         * [Iterator迭代器的remove](#iterator迭代器的remove)
         * [后记：](#后记)

### 习惯用法

**for、foreach循环、iterator迭代器**都是我们常用的一种遍历方式，你可以用它来遍历任何东西：包括数组、集合等

for 惯用法：

```java
List<String> list = new ArrayList<String>();
String[] arr = new String[]{"1,2,3,4"};
for(int i = 0;i < arr.length;i++){
    System.out.println(arr[i]);
}
for(int i = 0;i < list.size();i++){
    System.out.println(list.get(i));
}
```

foreach 惯用法：

```java
String[] arr = new String[]{"1,2,3,4"};
List<String> list = new ArrayList<String>();
list.add("1");
list.add("2");
for(String str : arr){
    System.out.println(str);
}
for (String item : list) {
    System.out.println(item);
}
```

Iterator 惯用法：

```java
Iterator<String> it = list.iterator();
while (it.hasNext()){
    System.out.println(it.next());
}
```

### 速度对比

性能是我们选取某一种技术手段的一种考虑方式，且看这三种遍历方式的速度对比

```java
List<Long> list = new ArrayList<Long>();
long maxLoop = 2000000;
for(long i = 0;i < maxLoop;i++){
    list.add(i);
}

// for循环
long startTime = System.currentTimeMillis();
for(int i = 0;i < list.size();i++){
    ;
}
long endTime = System.currentTimeMillis();
System.out.println(endTime - startTime + "ms");

// foreach 循环
startTime = System.currentTimeMillis();
for(Long lon : list){
    ;
}
endTime = System.currentTimeMillis();
System.out.println(endTime - startTime + "ms");

// iterator 循环
startTime = System.currentTimeMillis();
Iterator<Long> iterator = list.iterator();
while (iterator.hasNext()) {
    iterator.next();
}
endTime = System.currentTimeMillis();
System.out.println(endTime - startTime + "ms");
```

> 4ms
> 16ms
> 9ms

由以上得知，for()循环是最快的遍历方式，随后是iterator()迭代器，最后是foreach循环

### remove操作三种遍历方式的影响

#### for循环的remove

```java
List<String> list = new ArrayList<String>();
list.add("1");
list.add("2");
for(int i = 0;i < list.size();i++){
    if("2".equals(list.get(i))){
        System.out.println(list.get(i));
        list.remove(list.get(i));
    }
}
```

for循环可以直接进行remove，不会受到任何影响。

#### foreach 中的remove

```java
List<String> list = new ArrayList<String>();
list.add("1");
list.add("2");
for (String item : list) {
    if ("2".equals(item)) {
        System.out.println(item);
        list.remove(item);
    }
}
```

你觉得这段代码的正确输出是什么？我们一起来探究一下

当我执行一下这段代码的时候，出现了以下的情况

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092513653-1434465794.png)


由以上异常情况的堆栈信息得知，程序出现了并发修改的异常，为什么会这样？我们从**错误**开始入手, 

```java
at java.util.ArrayList$Itr.checkForComodification(ArrayList.java:909)
```

也就是这行代码，找到这行代码的所在地

```java
final void checkForComodification() {
    if (modCount != expectedModCount)
        throw new ConcurrentModificationException();
}
```

你会好奇， modCount 和 expectedModCount 是什么变量？在我对 ArrayList 相关用法那篇文章中有比较详细的解释。我大致说明一下： **modCount** 相当于是程序所能够进行修改 ArrayList 结构化的一个变量，怎么理解？看几个代码片段

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092530063-1062998764.png)


![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092540768-348685301.png)


![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092549830-399092778.png)


![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092600775-1022521641.png)


![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092608294-408426048.png)


你能够从中获取什么共性的特征呢？没错，也就是涉及到其中关于ArrayList的 __容量大小__ 和 __元素个数__的时候，就会触发modCount 的值的变化

**expectedModCount**这个变量又是怎么回事？从ArrayList 源码可知，这个变量是一个局部变量，也就是说每个方法内部都有expectedModCount 和 modCount 的判断机制，进一步来讲，这个变量就是 **预期的修改次数**，

先抛开这个不谈，我们先来谈论一下foreach(增强for循环)本身。

增强for循环是Java给我们提供的一个语法糖，如果将以上代码编译后的class文件进行反编译（使用jad工具）的话，可以得到以下代码：

```java
terator iterator = item.iterator();
```

**也就是说，其实foreach 每次循环都调用了一次iterator的next()方法**

因此才会有这个堆栈信息：

```java
at java.util.ArrayList$Itr.next(ArrayList.java:859)
```

下面我们来尝试分析一下这段代码报错的原因：

1、第一次 以 “1”的值进入循环，"1" != "2", 执行下一次循环

2、第二次循环以"2"的值进入，判断相等，执行remove()方法(注意这个remove方法并不是 iterator的remove()，而是ArrayList的remove()方法)，导致modCount++

3、再次调用next()的时候，modCount != expectedModCount ，所以抛出异常

#### Iterator迭代器的remove

使用迭代器进行遍历还有很多需要注意的地方：

**正确的遍历**

```java
List<String> list = new ArrayList<String>();
list.add("1");
list.add("2");
list.add("3");
Iterator<String> it = list.iterator();
while (it.hasNext()){
    System.out.println(it.next());
    it.remove();
}
```

这是一种正确的写法，如果输出语句和 remove()方法互换顺序怎么样呢？

**错误的遍历 —— next() 和 remove() 执行顺序的问题**

```java
List<String> list = new ArrayList<String>();
list.add("1");
list.add("2");
list.add("3");
Iterator<String> it = list.iterator();
while (it.hasNext()){
    it.remove();
    System.out.println(it.next());
}
```

执行程序输出就会报错：

```java
Exception in thread "main" java.lang.IllegalStateException
	at java.util.ArrayList$Itr.remove(ArrayList.java:872)
	at test.SimpleTest.main(SimpleTest.java:46)
```

这又是为什么？ 还是直接从错误入手：

定位到错误的位置

```java
at java.util.ArrayList$Itr.remove(ArrayList.java:872)
```

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092626905-575609794.png)


发现如果 lastRet 的值小于 0就会抛出非法状态的异常，这个lastRet是什么？

**且看定义：**

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092636112-73868271.png)


**lastRet的赋值场景**

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092647620-554510371.png)


由上面代码可以看出，当你执行next()方法的时候， lastRet 赋值为i，所以这个elementData[]中的下标最小是0，所以这个时候lastRet 最小的值是0， 那么只有当执行remove()方法的时候，lastRet的值赋值为-1，也就是说，你必须先执行一次next方法，再执行一次remove方法，才能够保证程序的正确运行。

**错误的遍历 —— 使用Arrays.asList() **

```java
List<String> list = Arrays.asList("1","2","3");
Iterator<String> it = list.iterator();
while (it.hasNext()){
  System.out.println(it.next());
  it.remove();
}
```

这段代码执行之后的输出是怎样的呢？

```java
1
Exception in thread "main" java.lang.UnsupportedOperationException
	at java.util.AbstractList.remove(AbstractList.java:161)
	at java.util.AbstractList$Itr.remove(AbstractList.java:374)
	at test.SimpleTest.main(SimpleTest.java:50)
```

很不幸，这段代码也抛出了异常，直接从错误处入手发现，这个remove()方法调用的是AbstractList中的remove方法，跟进入发现有一段代码

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092700726-2042221496.png)


remove()方法：

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190524092708383-355512154.png)


也就是说，只要这段代码执行了，都会报错，抛出异常

#### 后记：

上述文章主要介绍了 for循环、foreach 循环、iterator 迭代器遍历元素的速度大小的比较

还介绍了各自遍历过程中 对remove操作的影响。

**如果你有什么问题或者好的建议，欢迎你与我一起讨论**

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


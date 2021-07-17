# Comparable 和 Comparator的理解

* [Comparable 和 Comparator的理解](#comparable-和-comparator的理解)
   * [对Comparable 的解释](#对comparable-的解释)
      * [compareTo()方法与equals()方法的比较](#compareto方法与equals方法的比较)
      * [代码](#代码)
         * [compareTo()方法抛出异常](#compareto方法抛出异常)
   * [对Comparator 的解释](#对comparator-的解释)
      * [Comparator比较器的方法](#comparator比较器的方法)
      * [代码实现](#代码实现)
   * [Comparable 和 Comparator 的对比](#comparable-和-comparator-的对比)

## 对Comparable 的解释

Comparable是一个排序接口 

此接口给实现类提供了一个排序的方法，此接口有且只有一个方法

```java
public int compareTo(T o);
```

compareTo方法接受任意类型的参数，来进行比较

list或者数组实现了这个接口能够自动的进行排序，相关类的方法有Collections.sort()，Arrays.sort();

SortedMap 接口的key内置了compareTo方法来进行键排序，SortedSet 也是内置了compareTo方法作为其内部元素的比较手段

### compareTo()方法与equals()方法的比较

compareTo()方法不同于equals()方法，它的返回值是一个int类型

```java
int a = 10,b = 20,c = 30,d = 30;
a.compareTo(b) // 返回 -1 说明 a 要比 b 小
c.compareTo(b) // 返回  1 说明 c 要比 b 大
d.compareTo(c) // 返回  0 说明 d 和c  相等
```

而equals 方法返回的是boolean 类型 

```java
x.equals(y) // true 说明x 与 y 的值 相等 , false 说明x 与 y 的值 不相等
```

### 代码

Comparable 更像是一个内部排序接口，一个类实现了Comparable比较器，就意味着它本身支持排序；可以用Collections.sort() 或者 Arrays.sort() 进行排序

```java
public class Student implements Comparable<Student>{

    String name;
    int record;

    public Student(){}
    public Student(String name,int record){
        this.name = name;
        this.record = record;
    }

    public boolean equals(Student student) {
        // 拿名字和成绩进行对比
        return name.equals(student.name)
                && record == student.record;
    }

    @Override
    public int compareTo(Student stu) {
        // 调用String 类的compareTo方法，返回值 -1，0，1
        return this.name.compareTo(stu.name);
    }

    get and set...
}


public class ComparableTest {

    public static void main(String[] args) {
        List<Student> studentList = Arrays.asList(new Student("liming", 90),
                new Student("xiaohong", 95),
                new Student("zhoubin", 88),
                new Student("xiaoli", 94)
        );
		// 排序前
        System.out.println(studentList);
        Collections.sort(studentList);
        // 排序后
        System.out.println(studentList);

        for(Student student : studentList){
            System.out.println(student.equals(new Student("xiaohong", 95)));
        }
    }
}
```

输出：

[liming = 90, xiaohong = 95, zhoubin = 88, xiaoli = 94]
[liming = 90, xiaohong = 95, xiaoli = 94, zhoubin = 88]

false
true
false
false

对 Arrays.asList() 的解释说明 http://xxxx.com

#### compareTo()方法抛出异常

```java
public int compareTo(T o);
```

NullPointerException : 如果 对象o为null，抛出空指针异常

ClassCastException: 如果需要类型转换之后进行比较，可能会抛出ClassCastException



## 对Comparator 的解释

Comparator 相当于一个比较器，作用和Comparable类似，也是使用Collections.sort() 和 Arrays.sort()来进行排序，也可以对SortedMap 和 SortedSet 的数据结构进行精准的控制，你可以不用实现此接口或者Comparable接口就可以实现次序比较。 TreeSet 和 TreeMap的数据结构底层也是使用Comparator 来实现。不同于Comparable ，比较器可以任选地允许比较null参数，同时保持要求等价关系。

### Comparator比较器的方法

```java
int compare(T o1, T o2);
```

compare() 方法的用法和Comparable 的 compareTo() 用法基本一样，这个方法不允许进行null值比较，会抛出空指针异常

```java
boolean equals(Object obj);
```

jdk1.8 之后又增加了很多新的方法

很多都是关于函数式编程的，在这里先不做讨论了

### 代码实现

```java
public class AscComparator implements Comparator<Student> {

    @Override
    public int compare(Student stu1, Student stu2) {

        // 根据成绩降序排列
        return stu1.getRecord() - stu2.getRecord();
    }

}

public class ComparatorTest {

    public static void main(String[] args) {
        List<Student> studentList = Arrays.asList(new Student("liming", 90),
                new Student("xiaohong", 95),
                new Student("zhoubin", 88),
                new Student("xiaoli", 94)
        );
        // 1. 可以实现自己的外部接口进行排序
        Collections.sort(studentList,new AscComparator());

        System.out.println(studentList);

        // 2、 可以匿名内部类实现自定义排序
        Collections.sort(studentList, new Comparator<Student>() {
            @Override
            public int compare(Student stu1, Student stu2) {
                return stu2.getRecord() - stu1.getRecord();
            }
        });
        System.out.println(studentList);
    }
}
```

也可以使用Arrays.sort()进行排序，不过针对的数据结构是数组。

## Comparable 和 Comparator 的对比

1、Comparable 更像是自然排序

2、Comparator 更像是定制排序

**同时存在时采用 Comparator（定制排序）的规则进行比较。**

对于一些普通的数据类型（比如 String, Integer, Double…），它们默认实现了Comparable 接口，实现了 compareTo 方法，我们可以直接使用。

而对于一些自定义类，它们可能在不同情况下需要实现不同的比较策略，我们可以新创建 Comparator 接口，然后使用特定的 Comparator 实现进行比较。

![image-20210716163352584](https://tva1.sinaimg.cn/large/008i3skNly1gsivkbczxoj31l20t8al5.jpg)

![image-20210716163433337](https://tva1.sinaimg.cn/large/008i3skNly1gsivl4khz9j31d60h8mze.jpg)


# @SafeVarargs 使用说明

### 说明：

@SafeVarargs 是jdk1.7引入的适用于可变参数与泛型能够更好结合的一个注解。

### 官方解释：

程序员认定带有注释的主体或者构造函数不会对其执行潜在的不安全操作
将此注释应用于未经检查的方法或者构造器在"不可具体化"的和未经检查的参数类型
警告关于所有数组参数创建的时候

除了强加使用@Target 元注解的限制之外，编译器还被用在注解类型上来实现额外的限制
下面几种情况会在使用@SafeVarags 注解的时候产生编译时错误：
在声明一个固定参数的方法或者构造函数的时候

也就是说如果你认为你的方法或者构造方法是类型安全的，那么你也就可以使用@SafeVarargs 来跳过@SuppressWarnings("unchecked")检查。

### 示例：

```java
public class SafeVarargs {

    // 这其实不是一个安全的类型检查
    @SafeVarargs
    static void m(List<String>...lists){
        // 先会存储到 array[0] 的位置
        Object[] array = lists;
        List<Integer> tmpList = Arrays.asList(42);
        // array[0] 又保存了tmpList(Integer)进行覆盖
		// tmpList是一个List对象（类型已经擦除），赋值给Object类型的对象是允许的（向上转型），
        // 能够编译通过
        array[0] = tmpList;
        // 实际取出来的应该是 42
        String s = lists[0].get(0);

    }

    public static void main(String[] args) {
        List<String> list1 = Arrays.asList("one","two");
        m(list1);
    }
}
```



```java
Exception in thread "main" java.lang.ClassCastException: java.lang.Integer cannot be cast to java.lang.String
	at java7.SafeVarargs.m(SafeVarargs.java:14)
	at java7.SafeVarargs.main(SafeVarargs.java:21)

Process finished with exit code 1
```



具体分析：

```java
List<String> list1 = Arrays.asList("one","two");
```

当程序执行到这一步，会创建一个list1 ，其内部存在两个固定的值 [one,two]，

调用m(list1)方法

```java
m(list1);
```

接着

```java
Object[] array = lists;
```

程序执行到这一步，会在array数组中的第0个位置上存储一个list1 对象

```java
List<Integer> tmpList = Arrays.asList(42);
```

创建一个Integer的列表，存储一个integer类型的元素42

```java
array[0] = tmpList;
```

重新给array[0] 进行赋值，把原来位置的lists 进行覆盖，存储新的元素tmpList

```java
String s = lists[0].get(0);
```

我们预期的结果应该是取的值是42，但是实际上却报出了ClassCastException 

因为最后array[0] 中的值 42Integer 类型， 无法直接用String 对象进行接受，所以会报错。



参考： http://softlab.sdut.edu.cn/blog/subaochen/2017/04/safevarargs%E7%9A%84%E7%94%A8%E6%B3%95/ 

http://book.51cto.com/art/201205/339154.htm
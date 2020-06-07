# Spring 中的Null-Safety

之前一直在某些代码中看到过使用@Nullable 标注过的注释，当时也没有在意到底是什么意思，所以这篇文章来谈谈Spring中关于Null的那些事。

在Java中不允许让你使用类型表示其null的安全性，但Spring Framework 现在在org.sprinngframework.lang包提供以下注释，以便声明API和字段的可空性:

- `@Nullable`: 用于指定**参数、返回值或者字段**可以作为null的注释。
- `@NonNull`: 与上述注释相反，表明**指定参数、返回值或者字段**不允许为null。(不需要@NonNullApi和@NonNullFields适用的参数/返回值和字段)
- `@NonNullApi`: **包级别的注释**声明非null作为参数和返回值。
- `@NonNullFields`:**包级别的注释**声明字段默认非空

Spring Framework 本身利用了上面这几个注释，但它们也可以运用在任何基于Spring的Java 项目中，以声明空安全api 和 空安全字段。尚未支持泛型和数组元素的可空性，但应也即将发布在后来的版本。Spring Null-Safety出现在Spring5中，让我们更方便的编写空安全的代码，这叫做null-safety，null-safety不是让我们逃脱不安全的代码，而是在编译时产生警告。 此类警告可以在运行时防止灾难性空指针异常（NPE）。

## @NonNull

@NonNull注释是null-safety的所有注释中最重要的一个，我们可以使用此注释在期望对象引用的任何地方声明非空约束：字段、方法参数或者方法返回值。

先来看一个例子

```java
public class Student {

    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if(name != null && name.isEmpty()){
            name = null;
        }
        this.name = name;
    }
}
```

上述代码对name的校验是有效的，但是存在一个缺陷，如果name被设置为null的话，那么当我们使用name的时候，就会以NullPointerException来结尾。

**使用@NonNull**

Spring 的null-safety特性能够允许`idea`或者`eclipse`报告这个潜在的威胁，例如，如果我们用IDEA对属性加上@NonNull会出现如下的效果。

![](https://img2018.cnblogs.com/blog/1515111/201906/1515111-20190625094303534-1898813198.png)


> 奇怪，并没有什么变化啊，没看见有潜在的安全提示啊，**那是因为你没有在idea进行设置**

### 设置安全检查	

如果你也没有提示的话，可以通过如下的方式设置安全检查

![](https://img2018.cnblogs.com/blog/1515111/201906/1515111-20190625094317448-373150679.png)


如果还不好使的话，那就在右侧 configuration annotations 添加一下 @NonNull和 @Nullable 所在的jar包，如下：

![](https://img2018.cnblogs.com/blog/1515111/201906/1515111-20190625094336684-784638886.png)


添加上，打上 ✅ 即可看到如下效果。

![](https://img2018.cnblogs.com/blog/1515111/201906/1515111-20190625094336680-680800037.png)


> 现在fullName 已经被@NonNull 注释添加编译器检查null值的功能了！
>
> 如果你不相信的话，可以把@NonNull 注释去掉，你的鼠标再放在fullName 上，已经没有这句提示了。

## @NonNullFields

@NonNull 注解能够帮助你确保null-safety。然而，如果此注释直接装饰所有的字段的话，就会污染整个代码库。

Spring提供了另外一个不允许为null的注解 — `@NonNullFields`。这个注解适合用在包级别上，通知我们的开发工具注释包中所有的字段，默认的，不允许为null

新建一个Parent类，并在该类所属包下创建一个名为`package-info.java`的类，创建的不是Java类，而是创建的`file`，名为package-info.java，如下

package-info.java

```java
@NonNullFields
package com.nullsafety.demo.pojo;

import org.springframework.lang.NonNullFields;
```

新建一个`Parent.java` 类

```java
public class Parent {

    private String son;
    private String age;
    private String name;

    public void setSon(String son) {
        if(son != null && son.isEmpty()){
            son = null;
        }
        this.son = son;
    }

    public void setAge(String age) {
        if(age != null && age.isEmpty()){
            age = null;
        }
        this.age = age;
    }

    public void setName(String name) {
        if(name != null && name.isEmpty()){
            name = null;
        }
        this.name = name;
    }
}
```

> package-info.java 中的`@NonNullFields`能够对Parent类中所有的属性起作用，把鼠标放在任意一个属性上，会出现编译期检查的提示

![](https://img2018.cnblogs.com/blog/1515111/201906/1515111-20190625094352764-1346470517.png)


## @Nullable 

@NonNullFields注释通常比@NonNull更好，因为它有助于减少样板。 但是，有时我们想要从包级别指定的非null约束中免除某些字段，这时候就会使用到`@Nullable`注解

改造一下Person.java，Person.java 与pack-info.java 处于同一包下

```java
public class Person {

    @NonNull
    private String fullName;

    @Nullable
    private String nickName;

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        if(nickName != null && nickName.isEmpty()){
            nickName = null;
        }
        this.nickName = nickName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        if(fullName != null && fullName.isEmpty()){
            fullName = null;
        }
        this.fullName = fullName;
    }
}
```

> 在这种情况下，我们使用@Nullable注释来覆盖字段上@NonNullFields的语义。

## @NonNullApi

`@NonNullFields`注释仅适用于其名称所示的字段。 如果我们想对方法的参数和返回值产生相同的影响，我们需要@NonNullApi。

添加 @NonNullApi和 @NonNullFields 在 configure annotations 中，并选用NonNullApi

![](https://img2018.cnblogs.com/blog/1515111/201906/1515111-20190625094408468-804943371.png)


与@NonNullFields一样，我们需要在package-info.java 中定义`@NonNullApi`

package-info.java

```java
@NonNullApi
@NonNullFields
package com.nullsafety.demo.pojo;

import org.springframework.lang.NonNullApi;
import org.springframework.lang.NonNullFields;
```

加上如下注释后的效果如下: 可以在返回值的时候接受到编译期的提示。

![](https://img2018.cnblogs.com/blog/1515111/201906/1515111-20190625094410515-1701583190.png)




**后记**：

看完文章，你至少应该了解

- 四个注解 @NonNull， @Nullable, @NonNullFields, @NonNullApi 四个注解各自的作用范围
- 如何设置编译期的Null-safety检查

欢迎关注 ![](https://img2018.cnblogs.com/blog/1515111/201906/1515111-20190625112030613-2105534143.png)
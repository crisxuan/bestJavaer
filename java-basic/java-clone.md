# 细数浅拷贝和深拷贝

* [细数浅拷贝和深拷贝](#细数浅拷贝和深拷贝)
   * [关于引用](#关于引用)
   * [关于浅拷贝和深拷贝](#关于浅拷贝和深拷贝)
      * [浅拷贝](#浅拷贝)
      * [深拷贝](#深拷贝)
      * [序列化](#序列化)
      * [如何选择拷贝方式](#如何选择拷贝方式)
      * [其他拷贝方式](#其他拷贝方式)
   * [一些说明](#一些说明)

Java 对象拷贝是为对象赋值的一种方式，简单来说就是创建一个和原对象相同的对象，新创建的对象是原对象的一个`副本`，面试官贼拉喜欢在面试的时候问一问你浅拷贝和深拷贝的原理。因为它涉及到对象的引用关系，涉及到 Java 是传值还是传递引用关系，这通常是面试的重点。所以在聊深拷贝和浅拷贝之前，我们先来聊一聊引用关系。

## 关于引用

在 Java 中，除了**基本数据类型**（四类八种数据类型）之外，还存在引用数据类型。一般使用 `=` 号做赋值操作的时候，对于基本数据类型，实际上是拷贝的它的值，但是对于对象而言，其实赋值的只是这个对象的引用，也就是将原对象的引用传递过去，但是他们实际上还是指向的同一个对象。如下代码所示

```java
public class Food{

    String name;
    int num;
    String taste;

    constructor()
		get and set()
    toString()
}
```

测试类：

```java
public static void main(String[] args) {

  int i1 = 10;
  int i2 = i1; // 基本数据类型的拷贝，拷贝值
  System.out.println("i2 = " + i2);

  Food milk = new Food("milk",1,"fragrance");
  Food food = milk; 
  System.out.printf("food = " + food);
  System.out.println("milk = " + milk); // milk 和 food 都指向同一个堆内存对象
}
```

如果用图表示的话，应该是下面这样的：

![](http://www.cxuan.vip/image-20230203222438167.png)

> 不用纠结 Java 中到底是值传递还是引用传递这种无意义的争论中，你只要记得对于基本数据类型，传递的是数据类型的值，而对于引用类型来说，传递的是对象的引用，也就是对象的地址就可以了。

## 关于浅拷贝和深拷贝

浅拷贝和深拷贝其实就是在`引用`的这个基础上来做区分的，如果在拷贝的时候，只对基本数据类型进行拷贝，对引用数据类型只是进行了引用的传递，没有真正的创建一个新的对象，这种拷贝方式就认为是`浅拷贝`。反之，在对引用数据类型进行拷贝的时候，创建了一个新的对象，并且复制其内的成员变量，这种拷贝方式就被认为是`深拷贝`。

### 浅拷贝

那么如何实现`浅拷贝(Shallow copy)`呢？很简单，就是在需要拷贝的类上实现 Cloneable 接口并重写其 clone() 方法就可以了。

下面我们对 Food 类进行修改，我们让他实现 Cloneable 接口，并重写 clone() 方法。

```java
public class Food implements Cloneable{
  
  ...
  @Override
  protected Object clone() throws CloneNotSupportedException {
    return super.clone();
  }      
  ...
}
```

然后在测试类中的代码如下

```java
Food milk = new Food("milk",1,"fragrance");
Food food = (Food)milk.clone();
System.out.println("milk = " + milk);
System.out.println("food = " + food);
```

可以看到，现在的 food 对象是由 milk 对象拷贝出来的，那么此时的 food 对象和 milk 对象是同一个对象吗？我们通过打印，可以看到这两个对象的原生 `hashcode`。

```java
milk = com.cxuan.objectclone.Food@3cd1a2f1
food = com.cxuan.objectclone.Food@4d7e1886
```

可以发现，**food 和 milk 并不是同一个对象**，那 milk 中还有三个属性值，这三个属性值在 food 中是不是也一样呢？为了验证这个猜想，我们重写了 toString 方法。

```java
@Override
public String toString() {
  return "Food{" +
    "name='" + name + '\'' +
    ", num=" + num +
    ", taste='" + taste + '\'' +
    '}';
}
```

然后再次打印 food 和 milk ，可以观察到如下结果

```java
milk = Food{name='milk', num=1, taste='fragrance'}
food = Food{name='milk', num=1, taste='fragrance'}
```

嗯哼，虽然看起来"cxuan 哥"和"cuan 哥"是两种完全不同的称呼！但是他们却有一种共同的能力：**写作**！

我们还是通过图示来说明一下：

![](http://www.cxuan.vip/image-20230203222450341.png)

这幅图看出门道了么？在堆区分别出现了两个 Food 对象，这同时表明 clone 方法会重新创建一个对象并为其分配一块内存区域；虽然出现了两个对象，但是两个对象中的属性值是一样的，这也是换汤不换药，虽然汤和药是不同的东西（对象），但是他们都溶于水（属性值）。

### 深拷贝

虽然浅拷贝是一种换汤不换药的说法，但是在 Java 世界中还是有一种说法是。。。。。。是啥来着？

词穷了。。。。。。

![](http://www.cxuan.vip/image-20230203222503708.png)

哦对，还有一种改头换面的形式，它就是我们所熟悉的`深拷贝(Deep copy)`，先来抛出一下深拷贝的定义：**在进行对象拷贝的基础上，对对象的成员变量也依次拷贝的方式被称为深拷贝**。

哈哈哈哈，这故作高深的深拷贝原来就是在浅拷贝的基础上再复制一下它的属性值啊，我还以为是啥高深的东西呢！上代码！

我们先增加一个饮品类 Drink 。

```java
public class Drink implements Cloneable {

    String name;

    get and set()

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    toString()
}
```

然后更改一下 Food 类，因为 Drink 也算是 Food ，所以我们在 Food 类中增加对 Drink 的引用，然后再修改 get set 、toString 、clone 、构造方法，修改后的 Food 类代码如下

```java
public class Food implements Cloneable{

    String name;
    int num;
    String taste;
    Drink drink;

    public Food(String name, int num, String taste,Drink drink) {
        this.name = name;
        this.num = num;
        this.taste = taste;
        this.drink = drink;
    }

    get and set...

    @Override
    protected Object clone() throws CloneNotSupportedException {
        Food food = (Food)super.clone();
        food.drink = (Drink) drink.clone();
        return super.clone();
    }

    @Override
    public String toString() {
        return "Food{" +
                "name='" + name + '\'' +
                ", num=" + num +
                ", taste='" + taste + '\'' +
                ", drink=" + drink +
                '}';
    }
}
```

可以看到最大的改变是 clone 方法，我们在 clone 方法中，实现了对 Food 对象的拷贝，同时也实现了对 Drink 对象的拷贝，这就是我们上面所说的**复制对象并复制对象的成员变量**。

然后我们进行一下 Deep Copy的测试：

```java
public static void main(String[] args) throws CloneNotSupportedException {

  Drink drink = new Drink("milk");
  Food food = new Food("humberge",1,"fragrance",drink);
  Food foodClone = (Food)food.clone();
  Drink tea = new Drink("tea");
  food.setDrink(tea);
  System.out.println("food = " + food);
  System.out.println("foodClone = " + foodClone.getDrink());

}
```

运行完成后的输出结果如下：

```java
food = Food{name='humberge', num=1, taste='fragrance', drink=Drink{name='tea'}}
foodClone = Drink{name='milk'}
```

可以看到，我们把 foodClone 拷贝出来之后，修改 food 中的 drink 变量，却不会对 foodClone 造成改变，这就说明 foodClone 已经成功实现了深拷贝。

用图示表示的话，应该是下面这样的：

![](http://www.cxuan.vip/image-20230203222516077.png)

这是深拷贝之后的内存分配图，现在可以看到，food 和 foodClone 完全是两个不同的对象，它们之间不存在纽带关系。

我们上面主要探讨实现对象拷贝的方式是对象实现 `Cloneable` 接口，并且调用重写之后的 clone 方法，在 Java 中，还有一种实现对象拷贝的方式是使用 `序列化`。

### 序列化

使用序列化的方式主要是使用 `Serializable` 接口，这种方式还以解决多层拷贝的问题，**多层拷贝就是引用类型里面又有引用类型**，层层嵌套下去。使用 Serializable 的关键代码如下

```java
public Person clone() {
  Person person = null;
  try {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ObjectOutputStream oos = new ObjectOutputStream(baos);
    oos.writeObject(this);
    // 将流序列化成对象
    ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
    ObjectInputStream ois = new ObjectInputStream(bais);
    person = (Person) ois.readObject();
  } catch (IOException e) {
    e.printStackTrace();
  } catch (ClassNotFoundException e) {
    e.printStackTrace();
  }
  return person;
}
```

使用序列化可以实现深拷贝，它的原理是将二进制字节流内容写到一个文本或字节数组，然后是从这个文本或者字节数组中读取数据，原对象写入这个文本或者字节数组后再拷贝给 clone 对象，原对象的修改不会影响 clone 对象，因为 clone 对象是从文本或者字节数组中读取的。

### 如何选择拷贝方式

到现在我们已经把浅拷贝和深拷贝都介绍完了，那么如何选择浅拷贝和深拷贝呢？下面是几点注意事项⚠️

* 如果对象的属性都是基本数据类型，那么可以使用浅拷贝。

* 如果对象有引用类型，那就要基于具体的需求来选择浅拷贝还是深拷贝。
* 如果对象嵌套层数比较多，推荐使用 Serializable 接口实现深拷贝。

* 如果对象引用任何时候都不会被改变，那么没必要使用深拷贝，只需要使用浅拷贝就行了。如果对象引用经常改变，那么就要使用深拷贝。没有一成不变的规则，一切都取决于具体需求。

### 其他拷贝方式

除了对象的拷贝，Java 中还提供了其他的拷贝方式

比如数组的拷贝，你可以使用 `Arrays.copyof` 实现数组拷贝，还可以使用默认的 clone 进行拷贝，不过这两者都是浅拷贝。

```java
public void test() {
    int[] lNumbers1 = new int[5];
    int[] rNumbers1 = Arrays.copyOf(lNumbers1, lNumbers1.length);

    int[] lNumbers2 = new int[5];
    int[] rNumbers2 = lNumbers2.clone();
}
```

除了基本数组数据类型之外的拷贝，还有对象的拷贝，不过用法基本是一样的。

集合也可以实现拷贝，因为集合的底层就使用的是数组，所以用法也是一样的。

## 一些说明

针对 Cloneable 接口，有下面三点使用说明

* 如果类实现了 Cloneable 接口，再调用 Object 的 clone() 方法**可以合法地对该类实例进行按字段复制**。

* 如果在没有实现 Cloneable 接口的实例上调用 Object 的 clone() 方法，则会导致抛出`CloneNotSupporteddException`。

* 实现此接口的类应该使用公共方法重写 Object 的clone() 方法，因为 Object 的 clone() 方法是一个受保护的方法。

如果你在阅读文章的过程中发现错误和问题，请及时与我联系！

如果文章对你有帮助，希望小伙伴们三连走起！

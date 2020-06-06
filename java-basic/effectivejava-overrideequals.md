# Effective Java - 覆盖equals遵守的约定

## 避免重写 equals 方法

重写equals 方法看起来很简单，但是还会有多种方式导致出错，后果可能是严重的。最简单，最容易避免出错的方式是**避免重写equals方法**，采用这种方式的每个类只需要和自己对比即可，这样永远不会出错。如果满足了以下任何一个约定，也能产生正确的结果：

1. **该类的每个实例本质上都是唯一的**

即使对于像Thread 这种代表活动状态的实体而不是值的类来说也是如此。Object提供的equals方法也能确保这个类展现出正确的行为。

2. **类没有必要提供逻辑相等的测试**

例如：`java.util.regex.Pattern`能够重写`equals`检查是否两个Pattern 实例是否代表了同一个正则表达式。但是设计者并不认为客户需要或者期望这样的功能。在这种情况下，从Object继承的equals方法的实现就已经足够了。

3. **超类已经重写了equals方法，并且超类的行为对此类也适用**

例如：大部分`Set`实现从`AbstractSet`那里继承了equals方法，`List`实现从`AbstractList`那里继承了equals 方法，`Map`实现从`AbstractMap`那里继承了equals 方法。

4. **这个类是私有的或者包级私有的，可以确定equals方法永远不会调用**

如果你非常想要规避风险，那就确保equals方法不会突然调用

```java
@Override public boolean equals(Object o){
  throw new AssertionError();
}
```

那么何时重写equals方法呢？

当一个类具有逻辑相等的概念时，它不仅仅是对象身份，而超类还没有覆盖equals，这通常属于值类的情形。一个值类仅仅是一个代表了值的类，例如Integer 或者String。程序员用equals来比较对象的时候，往往想要知道的是两个对象在逻辑上是否相等，**而不是想了解他们是否指向同一个对象。**为了满足程序员的要求，不仅必须覆盖equals方法，而且这样做也使得这个类的实例可以用作映射表(map)的键(key)，或者集合(set)的元素，使映射或者集合表现出正确的行为。

一种不需要重写equals方法的值类是一个使用单例实现类，以确保每个值最多只有一个对象。枚举类型就属于此类别。对于这些类，逻辑相等就是对象相等，所以对象的equals方法判断的相等也表示逻辑相等。

## 重写equals 遵循的约定

如果你非要重写equals 方法，请遵循以下约定：

* 自反性：对于任何非 null 的引用值 x，x.equals(x)，必须返回true，null equals (null) 会有空指针
* 对称性：对于任何非 null 的引用值 x 和 y，当且仅当 x.equals(y) 为true时，y.equals(x) 时也必须返回true
* 传递性：对于任何非 null 的引用值 x 、y和 z ，如果 x.equals(y) 为 true 时，y.equals(z) 也是 true 时，那么x.equals(z) 也必须返回 true
* 一致性：对于任何非 null 的引用值 x 和 y，只要 equals 比较在对象中信息没有修改，多次调用 x.equals(y) 就会一致返回 true，或者一致返回 false
* 对于任何非 null 的引用值x, x.equals(null) 必须返回false。

## 解释

现在你已经知道了违反 equals 约定是多么可怕，下面将更细致的讨论，下面我们逐一查看这五个要求

### 自反性

自反性： **第一个要求仅仅说明对象必须等于它自身**，假如违背了这一条，然后把该类添加到集合中，该集合的 contains 方法会告诉你，该集合不包含你刚刚添加的实例。

### 对称性

对称性：这个要求是说，任何两个对象在对于"它们是否相等" 的问题上都必须保持一致。例如如下这个例子

```java
public class CaseInsensitiveString {

    private final String s;

    public CaseInsensitiveString(String s){
        this.s = Objects.requireNonNull(s);
    }

    @Override
    public boolean equals(Object o) {
        if(o instanceof CaseInsensitiveString){
            return s.equalsIgnoreCase(((CaseInsensitiveString)o).s);
        }
        if(o instanceof String){
            return s.equalsIgnoreCase((String)o);
        }
        return false;
    }

    public static void main(String[] args) {
        CaseInsensitiveString cis = new CaseInsensitiveString("Polish");
        String s = "Polish";
        System.out.println(cis.equals(s));
        System.out.println(s.equals(cis));
    }
}
```

不出所料，cris.equals(s) 返回true。问题在于，虽然 CaseInsensitiveString 类的 equals 方法知道普通的字符串对象，但是， String 类中的 equals 方法却并不知道不区分大小写的字符串，因此，s.equals(cris) 返回false，显然违反了对称性。

如果你用下面的示例来进行操作

```java
List<CaseInsensitiveString> list = new ArrayList<>();
list.add(cis);
System.out.println(list.contains(s));
```

会返回什么呢？

没人知道，可能在 OpenJDK 实现中会返回 false，但这只是特定实现的结果而已，在其他的实现中，也有可能返回true，或者抛出运行时异常，所以我们能总结出一点:**一旦违反了equals 约定，当面对其他对象时，你完全不知道这些对象的行为会怎么样**

为了解决这个问题，那么就需要去掉与 String 互操作的这段代码去掉，变成下面这样

```java
@Override
public boolean equals(Object o) {
  return o instanceof CaseInsensitiveString && ((CaseInsensitiveString)o).s.equalsIgnoreCase(s);
}
```

* 传递性：equals 约定的第三个要求是传递性，如果一个对象等于第二个对象，而第二个对象又等于第三个对象，那么第一个对象一定等于第三个对象。同样的，无意识的违反这条规则的情形也不难，例如

```java
public class Point {

    private final int x;
    private final int y;

    public Point(int x,int y){
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object o) {
        if(!(o instanceof Point)){
            return false;
        }
        Point p = (Point)o;
        return p.x == x && p.y == y;
    }
}
```

假如你想扩展这个类，添加一些颜色信息：

```java
public class ColorPoint extends Point{

    private final Color color;

    public ColorPoint(int x, int y,Color color) {
        super(x, y);
        this.color = color;
    }
 
}

```

equals 方法是什么样的呢？如果完全不提供equals 方法，而是直接从 Point 继承过来，在 equals 做比较的时候颜色信息就被忽略。虽然这样做不会违反 equals 约定，但这很显然是不可接受的。假设编写了一个 equals 方法，只有当它的参数是一个有色点，并且具有相同位置和颜色时，才会返回true。

```java
@Override
public boolean equals(Object o) {
  if(!(o instanceof ColorPoint)){
    return false;
  }
  return super.equals(o) && ((ColorPoint)o).color == color;
}
```

这种方法的问题在于，在比较普通点和有色点时，以及相反的情形可能会得到不同的结果。前一种比较忽略了颜色信息，而后一种比较返回 false，因为参数类型不正确。为了直观说明问题，我们创建一个普通点和一个有色点来进行测试

```java
public static void main(String[] args) {
  Point p = new Point(1,2);
  ColorPoint cp = new ColorPoint(1,2,Color.RED);
  System.out.println(p.equals(cp));
  System.out.println(cp.equals(p));
}
```

p.equals(cp) 调用的是 Point 中的 equals 方法，而此方法中没有关于颜色的比较，之比较了 x 和 y

cp.equals(p) 调用的是 ColorPoint 中的 equals 方法，而此方法中有关于颜色的比较，而 p 中没有颜色信息

你可以这样做来修正这个问题

```java
public boolean equals(Object o) {
  if(!(o instanceof Point)){
    return false;
  }

  if(!(o instanceof ColorPoint)){
    return o.equals(this);
  }
  return super.equals(o) && ((ColorPoint)o).color == color;
}
```

这种方法确实提供了对称性，但是却牺牲了传递性

```java
ColorPoint cp = new ColorPoint(1,2,Color.RED);
Point p = new Point(1,2);
ColorPoint cp2 = new ColorPoint(1,2,Color.BLUE);
```

此外，还可能会导致无限递归问题，比如 Point 有两个字类，分别是 ColorPoint 和 SmellPoint，它们各自有自己的 equals 方法，那么对 myColorPoint.equals(mySmellPoint)的调用将会抛出 StackOverflowError 异常。

你可能听过使用 getClass 方法替代 instanceof 测试，可以扩展可实例化的类和增加新的组件，同时保留 equals 约定，例如

```java
@Override
public boolean equals(Object o) {
  if(o == null || o.getClass() != getClass()){
    return false;
  }
  Point p = (Point)o;
  return p.x == x && p.y == y;
}
```

>里氏替换原则认为，一个类型的任何属性也将适用于它的字类型

一个不错的改良措施是使用 `组合优先于继承`的原则，我们不再让 ColorPoint 扩展 Point，而是让 ColorPoint 持有一个 Point 的私有域，以及一个公有视图方法，例如

```java
public class ColorPoint {

    private final Point point;
    private final Color color;

    public ColorPoint(int x, int y,Color color) {
        point = new Point(x,y);
        this.color = color;
    }

    public Point asPoint(){
        return point;
    }

    @Override
    public boolean equals(Object o) {
        if(!(o instanceof ColorPoint)){
            return false;
        }
        ColorPoint cp = (ColorPoint)o;
        return cp.point.equals(point) && cp.color.equals(color);
    }
}
```

在 Java 平台类库中，有一些类扩展了可实例化的类，并且添加了新的组件值。

例如： java.sql.Timestamp 对 java.util.Date 进行了扩展，并添加了 nanoseconds 域。Timestamp 类与 Date 类进行 equals 比较时会发生不可预期的行为，虽然工程师在 Timestamp 告诫不要和 Date 类一起使用，但是这种行为依旧不值得效仿。

### 一致性

equals 约定的第四个要求是，如果两个对象相等，它们就必须保证始终相等，除非它们中有一个对象(或者两个都)被修改了。也就是说，可变对象在不同的时候可以与不同的对象相等。不可变对象不会这样，它们会保证始终相等。

无论类是否可变，都不要使 equals 方法依赖于不可靠的资源。例如，java.net.URL 的 equals 方法依赖于对 URL中主机IP 地址的比较。将一个主机名转变成 IP 地址可能需要访问网络，随着时间的推移，就不能确保会产生相同的结果，即有可能 IP 地址发生了改变。这样会导致 URL  equals 方法违反 equals 约定，在实践中有可能引发一些问题。URL equals 方法的行为是一个大错误并且不应被模仿。遗憾的是，因为兼容性的要求，这一行为元法被改变。为了避免发生这种问题，equals 方法应该对驻留在内存中的对象执行确定性的计算。

### 非空性

非空性的意思是所有的对象都不能为 null 。尽管很难想象什么情况下 o.equals(null) 会返回 true。 但是意外抛出空指针异常的情形可不是很少见。通常不允许抛出 空指针异常，许多类的 equals 方法都通过对一个显示的 null 做判断来防止这种情况：

```java
public boolean equals(Object o) {
  if(o == null){
    return false;
  }
}
```

这项测试是不必要的。为了测试其参数的等同性，equals 方法必须先把参数转换成适当的类型，以便可以调用它的访问方法，或者访问它的域。

如果漏掉了类型检查，有传递给 equals 方法错误的类型，那么 equals 方法将会抛出 `ClassCastException`，这就违反了 equals 约定。如果 instanceof 的第一个操作数为 null ，那么，不管第二个操作数是哪种类型，intanceof 操作符都指定应该返回 false 。因此，如果把 null 传给 equals 方法，类型检查就会返回 false ，所以不需要显式的 null 检查。

遵循如下约定，可以实现高质量的空判断：

* 使用 `==` 操作符检查 **参数是否为这个对象的引用** 。如果是，返回 true 。
* 使用 `instanceof` 操作符检查 **参数是否为正确的引用类型**。 如果不是，则返回 false。
* 对于该类中的每个域，检查参数中的域是否与该对象中对应的域相匹配。

编写完成后，你还需要问自己： 它是否是对称的、传递的、一致的？

下面是一些告诫：

* 覆盖 equals 时总要覆盖 hashCode
* 不要企图让 equals 方法过于智能
* 不要将 equals 声明中的 Object 对象替换为其他的类型。
# Effective Java - 覆盖 equals 时总要覆盖 hashCode

在每个覆盖了equals 方法的类中，都必须覆盖 hashCode 方法。如果不这样做的话，就会违反 hashCode 的通用约定，从而导致该类无法结合所有的给予散列的集合一起正常运作。这类集合包括 HashSet、HashMap，下面是Object 的通用规范：

* 在应用程序的执行期间，只要对象的 equals 方法的比较操作所用到的信息没有被修改，那么同一个对象的多次调用，hashCode 方法都必须返回同一个值。在一个应用程序和另一个应用程序的执行过程中，执行 hashCode 方法返回的值可以不相同。
* 如果两个对象根据 equals 方法比较出来是相等的，那么调用这两个对象的 hashCode 方法都必须产生同样的整数结果
* 如果两个对象根据 equals 方法比较是不相等的，那么调用这两个对象的 hashCode 方法不一定要求其产生相同的结果，但是程序员应该知道，给不相等的对象产生截然不同的整数结果，有可能提高散列表的性能。

**因没有覆盖 hashCode ,容易违反上面第二条的约定，即相等的对象必须拥有相同的 hashCode 散列值**

根据类的 equals 方法，两个截然不同的实例在逻辑上有可能是相等的。但是根据 Object 的 hashCode 方法来看，它们仅仅是两个截然不同的对象而已。因此对象的 hashCode 方法返回两个看起来是随机的整数，而不是根据第二个约定所要求的那样，返回两个相等的整数。

例如下面这个例子

```java
public class PhoneNumber {

    int numbersOne;
    int numbersTwo;
    int numbersThree;

    public PhoneNumber(int numbersOne, int numbersTwo, int numbersThree) {
        this.numbersOne = numbersOne;
        this.numbersTwo = numbersTwo;
        this.numbersThree = numbersThree;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PhoneNumber)) return false;
        PhoneNumber that = (PhoneNumber) o;
        return Objects.equals(numbersOne, that.numbersOne) &&
                Objects.equals(numbersTwo, that.numbersTwo) &&
                Objects.equals(numbersThree, that.numbersThree);
    }

    public static void main(String[] args) {
        Map numberMap = new HashMap();
        numberMap.put(new PhoneNumber(707,867,5309),"Jenny");

        System.out.println(numberMap.get(new PhoneNumber(707,867,5309)));
    }
}
```

此时，你可能希望 `numberMap.get(new PhoneNumber(707,867,5309))` 会返回 "Jerry"，但它实际上返回的是null 。 这里会涉及到两个实例： 第一个实例是第一次添加进入的 PhoneNumber , 它会被添加到一个桶中。因为没有重写 hashCode 方法，所以你取的时候是去另外一个桶中取出来的 PhoneNumber 实例。所以自然两个实例不相等，因为 HashMap 有一项优化，可以将与每个项相关联的散列码缓存起来，如果散列码不匹配，也就不再去检验对象的等同性。

修正这个问题非常的简单，只要提供一个相等的散列码就可以了

```java
@Override
public int hashCode() {
  return 42;
}
```

上面这个 hashCode 方法是合法的。因为它确保了相等的对象总是具有同样的散列码。但是它也极为恶劣，因为每个对象都具有相同的散列码。因此，多个具有相同散列码的 HashMap 就会彼此连在一起形成链表。它使得本该以线性时间运行的程序编程了以平方级的时间运行。

一个好的散列通常是 "为不相等的对象产生不相等的散列码"。这正是 hashCode 约定中的第三条含义。理想情况下，散列函数应该把集合中不相等的实例均匀地分布到所有可能的 int 值上。下面是一种简单的解决办法：

1. 声明一个 int 变量并命名为 result，将它初始化为对象中的第一个关键域散列码 c

2. 对象中剩下的每一个关键域 f 都完成一下步骤：

   为该域计算 int 类型的散列码 c：

   * 如果该域是基本类型，则计算 `Type.hashCode(f)`，这里的 Type 是集装箱基本类型的类，与 f 的类型相对应
   * 如果该域是一个对象引用，并且该类的 equals 方法通过递归地调用 equals 的方式来比较这个域，则同样为这个域递归地调用 hashCode 。如果为null ，则返回0
   * 如果该域是一个数组，则要把每一个元素当作单独的域来处理。也就是说，递归地应用上述规则，对每个重要的元素计算一个散列码，然后根据步骤2 . b中的做法把这些散列值组合起来。如果数组域中没有重要的元素，可以使用一个常量，但最好不要用0。如果数组域中的所有元素都很重要，可以使用 Arrays.hashCode 方法。

   按照 下面的公式，把散列码 c 合并到 result 中。

   ```java
   result = 31 * result + c;
   ```

3. 返回result

写完了之后，还要进行验证，相等的实例是否具有相同的散列码，可以把上述解决办法用到 PhoneNumber 中

```java
@Override
public int hashCode() {
  int result = Integer.hashCode(numbersOne);
  result = 31 * result + Integer.hashCode(numbersTwo);
  result = 31 * result + Integer.hashCode(numbersThree);
  return result;
}
```

虽然上述给出了 hashCode 实现，但它不是最先进的。它们的质量堪比 Java 平台类库提供的散列函数。这些方法对于大多数应用程序而言已经足够了。

`Objects` 类有一个静态方法，它带有任意数量的对象，并为它们返回一个散列码。这个方法名为 hash 。你只需要一行代码就可以编写它的 hashCode 方法。它们的质量也是很高的，但是，它的运行速度相对慢一些，因为它们会引发数组的创建，以便传入数目可变的参数，如果参数中有基本类型，还需要装箱和拆箱。例如：

```java
@Override
public int hashCode(){
  return Objects.hash(numbersOne,numbersTwo,numbersThree);
}
```

如果一个类是不可变的，并且计算 hashCode 的开销也大，那么应该把它换存在对象内部，而不是每次请求都重新创建 hashCode。你可以选择 "延迟初始化" 的散列码。即一直到 hashCode 被第一次使用的时候进行初始化。如下：

```java
private int hashCode;

@Override
public int hashCode() {
  int result = hashCode;
  if(result == 0){
    result = Integer.hashCode(numbersOne);
    result = 31 * result + Integer.hashCode(numbersTwo);
    result = 31 * result + Integer.hashCode(numbersThree);
    hashCode = result;
  }
  return result;
}
```

当你要重写对象的 hashCode 方法时，下面这两个约定我希望你能遵守：

* 不要对 hashCode 方法的返回值做具体的规定，因此客户端无法理所当然地依赖它；这样可以为修改提供灵活性。
* 不要试图从散列码计算中排除掉一个对象的关键域来提高性能。

总而言之，每当覆盖 equals 方法时都必须覆盖 hashCode。否则程序将无法正确运行。hashCode 方法必须遵守 Object 规定的通用约定，并且一起完成一定的工作。将不相等的散列码分配给不相等的实例。这个很容易实现，但是如果不想那么费力，可以直接使用 eclipse 或者 Idea 提供的 AutoValue 自动生成就可以了。


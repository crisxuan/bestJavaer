# Enum to String 一般用法

## 一、Enum Review

		Java Enum（枚举）是jdk1.5介绍的新特性，使用Java Enum能够更有效的定义集合和常量，使用Enum 也能够增加程序的观赏性和可读性，但是有时候我们使用Enum 需要把它从Java Enum转换为String类型，下面是具体用法

**一般常量的定义**

```java
    public class EnumOrder {
        public static final int BIKE = 1;
        public static final int BUS = 2;
        public static final int CAR = 3;
        public static final int TRUCK = 4;
    }
```

> 一般使用上面的代码来定义一组常量。

**定义枚举**

```java
    public enum Vehicle {
        BIKE, BUS, CAR, TRUCK;
    }
```

> 定义枚举要比定义常量简单很多，而且枚举是final的。

## 二、使用name()方法转换为String

		给定上面定义的Vehicle枚举，让我们解决如何将其转换为String的问题。使用name() 方法能够把Java Enum转换为String

```java
    public class VehicleTest {
      public static void main(String[] args) {
          System.out.println(Vehicle.BIKE.name());
          System.out.println(Vehicle.BUS.name());
          System.out.println(Vehicle.CAR.name());
          System.out.println(Vehicle.TRUCK.name());
      }
  }
```

> 使用name()方法能够获得Enum的名称，name()方法是枚举类内置的方法。

## 三、使用toString()方法转换为String

		像大多数的对象一样，默认都会有一个toString()方法，枚举也不例外

```java
    public class VehicleTest {
      public static void main(String[] args) {
          System.out.println(Vehicle.BIKE.toString());
          System.out.println(Vehicle.BUS.toString());
          System.out.println(Vehicle.CAR.toString());
          System.out.println(Vehicle.TRUCK.toString());
      }
  }
```

> toString()方法可写可不写，默认会调用每个Enum对象的toString()方法。

## 四、使用成员属性转换为String

		Enum除了定义为final之外，它就像一个普通类一样，能够定义属性和方法、构造函数等。

```java
    public enum Vehicle {

      BIKE("Enum Bike"),
      BUS("Enum Bus"),
      CAR("Enum Car"),
      TRUCK("Enum Truck");
      
      String name;
      Vehicle(String name){
          this.name = name;
      }

      public String getName() {
          return name;
      }

      public static void main(String[] args) {
          System.out.println(Vehicle.BIKE.getName());
          System.out.println(Vehicle.BUS.getName());
          System.out.println(Vehicle.CAR.getName());
          System.out.println(Vehicle.TRUCK.getName());
      }
  }
```

> 给每个enum定义了一个name属性，提供一个getName方法访问Enum的属性
>
> 注意：给Enum定义属性的时候，必须要用构造器对属性赋值

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200603165715783-1391145441.png)
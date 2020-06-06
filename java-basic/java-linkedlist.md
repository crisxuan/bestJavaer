# LinkedList 基本示例及源码解析

### 一、JavaDoc 简介

1. **LinkedList双向链表，实现了List的 双向队列接口，实现了所有list可选择性操作，允许存储任何元素(包括null值)**
2. 所有的操作都可以表现为双向性的，遍历的时候会从首部到尾部进行遍历，直到找到最近的元素位置
3. **注意这个实现不是线程安全的,** 如果多个线程并发访问链表，并且至少其中的一个线程修改了链表的结构，那么这个链表必须进行外部加锁。(结构化的操作指的是任何添加或者删除至少一个元素的操作，仅仅对已有元素的值进行修改不是结构化的操作)。
4. **List list = Collections.synchronizedList(new LinkedList(…)),**可以用这种链表做同步访问，但是最好在创建的时间就这样做，避免意外的非同步对链表的访问
5. 迭代器返回的iterators 和 listIterator方法会造成**fail-fast**机制：如果链表在生成迭代器之后被结构化的修改了，**除了使用iterator独有的remove方法外，都会抛出并发修改的异常。**因此，在面对并发修改的时候，这个迭代器能够快速失败，从而避免非确定性的问题



### 二、LinkedList 继承接口和实现类介绍

**java.util.LinkedList** 继承了 **AbstractSequentialList** 并实现了**List , Deque , Cloneable** 接口，以及**Serializable** 接口

```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable {}
```



类之间的继承体系如下：

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190530225258916-188181914.png)


下面就对继承树中的部分节点进行大致介绍：

> AbstractSequentialList 介绍：
> 这个接口是List一系列子类接口的核心接口，以求最大限度的减少实现此接口的工作量，由顺序访问数据存储(例如链接链表)支持。对于随机访问的数据(像是数组)，AbstractList 应该优先被使用这个接口可以说是与AbstractList类相反的，它实现了随机访问方法，提供了get(int index),set(int index,E element), add(int index,E element) and remove(int index)方法
>
> 对于程序员来说：
>
> 要实现一个列表，程序员只需要扩展这个类并且提供listIterator 和 size方法即可。
> 对于不可修改的列表来说， 程序员需要实现列表迭代器的 hasNext(), next(), hasPrevious(),
> previous 和 index 方法

> AbstractList 介绍：
>
> 这个接口也是List继承类层次的核心接口，以求最大限度的减少实现此接口的工作量，由顺序访问
> 数据存储(例如链接链表)支持。对于顺序访问的数据(像是链表)，AbstractSequentialList 应该优先被使用，
> 如果需要实现不可修改的list，程序员需要扩展这个类，list需要实现get(int) 方法和List.size()方法
> 如果需要实现可修改的list，程序员必须额外重写set(int,Object) set(int,E)方法(否则会抛出
> UnsupportedOperationException的异常)，如果list是可变大小的，程序员必须额外重写add(int,Object) , add(int, E) and remove(int) 方法

> AbstractCollection 介绍：
>
> 这个接口是Collection接口的一个核心实现，尽量减少实现此接口所需的工作量
> 为了实现不可修改的collection，程序员应该继承这个类并提供呢iterator和size 方法
> 为了实现可修改的collection，程序团需要额外重写类的add方法，iterator方法返回的Iterator迭代器也必须实现remove方法



### 三、LinkedList 基本方法介绍



上面看完了LinkedList 的继承体系之后，来看看LinkedList的基本方法说明


```javascript
添加
	add():
	----> 1. add(E e) :  直接在'末尾'处添加元素
  ----> 2. add(int index,E element) : 在'指定索引处添'加元素
  ----> 3. addAll(Collections<? extends E> c) : 在'末尾'处添加一个collection集合
  ----> 4. addAll(int index,Collections<? extends E> c)：在'指定位置'添加一个collection集合
  ----> 5. addFirst(E e): 在'头部'添加指定元素
  ----> 6. addLast(E e): 在'尾部'添加指定元素
  
  offer():
  ----> 1. offer(E e)： 在链表'末尾'添加元素
  ----> 2. offerFirst(E e): 在'链表头'添加指定元素
  ----> 3. offerLast(E e): 在'链表尾'添加指定元素
  
  push(E e): 在'头部'压入元素
  
移除
  
  poll()：
  ----> 1. poll(): 访问并移除'首部'元素
  ----> 2. pollFirst(): 访问并移除'首部'元素
  ----> 3. pollLast(): 访问并移除'尾部'元素
  
  pop(): 从列表代表的堆栈中弹出元素，从'头部'弹出
  
  remove(): 
  ----> 1. remove(): 移除并返回'首部'元素
  ----> 2. remove(int index) : 移除'指定索引'处的元素
  ----> 3. remove(Object o): 移除指定元素
  ----> 4. removeFirst(): 移除并返回'第一个'元素
  ----> 5. removeFirstOccurrence(Object o): 从头到尾遍历，移除'第一次'出现的元素
  ----> 6. removeLast(): 移除并返回'最后一个'元素
  ----> 7. removeLastOccurrence(Object o): 从头到尾遍历，移除'最后一次'出现的元素
  
  clear(): 清空所有元素
  
访问

	peek(): 
  ----> 1. peek(): 只访问，不移除'首部'元素
  ----> 2. peekFirst(): 只访问，不移除'首部'元素，如果链表不包含任何元素，则返回null
  ----> 3. peekLast(): 只访问，不移除'尾部'元素，如果链表不包含任何元素，返回null
  
  element(): 只访问，不移除'头部'元素
	
  get():
  ----> 1. get(int index): 返回'指定索引'处的元素
  ----> 2. getFirst(): 返回'第一个'元素
  ----> 3. getLast(): 返回'最后一个'元素

  indexOf(Object o): 检索某个元素'第一次'出现所在的位置
  LastIndexOf(Object o): 检索某个元素'最后一次'出现的位置
  
 其他
 
 	clone() : 返回一个链表的拷贝，返回值为Object 类型
  contains(Object o): 判断链表是否包含某个元素
  descendingIterator(): 返回一个迭代器，里面的元素是倒叙返回的
  listIterator(int index) : 在指定索引处创建一个'双向遍历迭代器'
	set(int index, E element): 替换某个位置处的元素
  size() : 返回链表的长度
  spliterator(): 创建一个后期绑定并快速失败的元素
  toArray(): 将链表转变为数组返回
  
  
 	
```



### 四、LinkedList 基本方法使用

学以致用，熟悉了上面基本方法之后，来简单做一个demo测试一下上面的方法：

```java
/** 
 * 此方法描述
 * LinedList 集合的基本使用
 */
public class LinkedListTest {

    public static void main(String[] args) {

        LinkedList<String> list = new LinkedList<>();
        list.add("111");
        list.add("222");
        list.add("333");
        list.add(1,"123");

        // 分别在头部和尾部添加元素
        list.addFirst("top");
        list.addLast("bottom");
        System.out.println(list);

        // 数组克隆
        Object listClone = list.clone();
        System.out.println(listClone);

        // 创建一个首尾互换的迭代器
        Iterator<String> it = list.descendingIterator();
        while (it.hasNext()){
            System.out.print(it.next() + " ");
        }
        System.out.println();
        list.clear();
        System.out.println("list.contains('111') ? " + list.contains("111"));

        Collection<String> collec = Arrays.asList("123","213","321");
        list.addAll(collec);
        System.out.println(list);
        System.out.println("list.element = " + list.element());
        System.out.println("list.get(2) = " + list.get(2));
        System.out.println("list.getFirst() = " + list.getFirst());
        System.out.println("list.getLast() = " + list.getLast());

        // 检索指定元素出现的位置
        System.out.println("list.indexOf(213) = " + list.indexOf("213"));
        list.add("123");
        System.out.println("list.lastIndexOf(123) = " + list.lastIndexOf("123"));
        // 在首部和尾部添加元素
        list.offerFirst("first");
        list.offerLast("999");
        System.out.println("list = " + list);
        list.offer("last");
        // 只访问，不移除指定元素
        System.out.println("list.peek() = " + list.peek());
        System.out.println("list.peekFirst() = " + list.peekFirst());
        System.out.println("list.peekLast() = " + list.peekLast());

        // 访问并移除元素
        System.out.println("list.poll() = " + list.poll());
        System.out.println("list.pollFirst() = " + list.pollFirst());
        System.out.println("list.pollLast() = " + list.pollLast());
        System.out.println("list = " + list);
        // 从首部弹出元素
        list.pop();
        // 压入元素
        list.push("123");
        System.out.println("list.size() = " + list.size());
        System.out.println("list = " + list);

        // remove操作
        System.out.println(list.remove());
        System.out.println(list.remove(1));
        System.out.println(list.remove("999"));
        System.out.println(list.removeFirst());
        System.out.println("list = " + list);

        list.addAll(collec);
        list.addFirst("123");
        list.addLast("123");
        System.out.println("list = " + list);
        list.removeFirstOccurrence("123");
        list.removeLastOccurrence("123");
        list.removeLast();
        System.out.println("list = " + list);
        list.addFirst("top");
        list.addLast("bottom");
        list.set(2,"321");
        System.out.println("list = " + list);
        System.out.println("--------------------------");

        // 创建一个list的双向链表
        ListIterator<String> listIterator = list.listIterator();
        while(listIterator.hasNext()){
            // 移到list的末端
            System.out.println(listIterator.next());
        }
        System.out.println("--------------------------");
        while (listIterator.hasPrevious()){
            // 移到list的首端
            System.out.println(listIterator.previous());
        }	
    }
}
```



Console: 

```java
-------1------- [top, 111, 123, 222, 333, bottom]
-------2-------[top, 111, 123, 222, 333, bottom]
bottom 333 222 123 111 top 
list.contains('111') ? false
[123, 213, 321]
list.element = 123
list.get(2) = 321
list.getFirst() = 123
list.getLast() = 321
list.indexOf(213) = 1
list.lastIndexOf(123) = 3
-------4------- [first, 123, 213, 321, 123, 999]
list.peek() = first
list.peekFirst() = first
list.peekLast() = last
list.poll() = first
list.pollFirst() = 123
list.pollLast() = last
-------5------- [213, 321, 123, 999]
list.size() = 4
-------6------- [123, 321, 123, 999]
123
123
true
321
-------7------- []
-------8------- [123, 123, 213, 321, 123]
list = [123, 213]
-------9------- [top, 123, 321, bottom]
--------------------------
top
123
321
bottom
--------------------------
bottom
321
123
top
```



### 五、LinkedList 内部结构以及基本元素声明



1. **LinkedList内部结构是一个双向链表，**具体示意图如下

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190530230420117-1509500427.png)


每一个链表都是一个Node节点，由三个元素组成

```java
private static class Node<E> {
  		// Node节点的元素
        E item;
  		// 指向下一个元素
        Node<E> next;
  		// 指向上一个元素
        Node<E> prev;

  		// 节点构造函数
        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
}
```

**first 节点也是头节点， last节点也是尾节点**

2. LinkedList 中有三个元素，分别是

```java
transient int size = 0; // 链表的容量

transient Node<E> first; // 指向第一个节点

transient Node<E> last; // 指向最后一个节点
```

3. LinkedList 有两个构造函数，一个是空构造函数，不添加任何元素，一种是创建的时候就接收一个Collection集合。

```java
    /**
     * 空构造函数
     */
    public LinkedList() {}

    /**
     * 创建一个包含指定元素的构造函数
     */
    public LinkedList(Collection<? extends E> c) {
      this();
      addAll(c);
    }
```



### 六、LinkedList 具体源码分析



**前言: 此源码是作者根据上面的代码示例一步一步跟进去的，如果有哪些疑问或者讲的不正确的地方，请与作者联系。**

**添加**

添加的具体流程示意图：

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190530225744662-1646911093.png)


包括方法有：

- **add**([E](../../java/util/LinkedList.html) e)

- **add**(int index, [E](../../java/util/LinkedList.html) element)

- **addAll**([Collection](../../java/util/Collection.html)<? extends [E](../../java/util/LinkedList.html)> c)

- **addAll**(int index, [Collection](../../java/util/Collection.html)<? extends [E](../../java/util/LinkedList.html)> c)

- **addFirst**([E](../../java/util/LinkedList.html) e)

- **addLast**([E](../../java/util/LinkedList.html) e)

- **offer**([E](../../java/util/LinkedList.html) e)

- **offerFirst**([E](../../java/util/LinkedList.html) e)

- **offerLast**([E](../../java/util/LinkedList.html) e)

  

下面对这些方法逐个分析其源码：

**add(E e) ： **

```java
    // 添加指定元素至list末尾
    public boolean add(E e) {
          linkLast(e);
          return true;
    }

    // 真正添加节点的操作
    void linkLast(E e) {
      final Node<E> l = last;
        // 生成一个Node节点
      final Node<E> newNode = new Node<>(l, e, null);
      last = newNode;
        // 如果l = null，代表的是第一个节点，所以这个节点即是头节点
        // 又是尾节点
      if (l == null)
          first = newNode;
      else
        // 如果不是的话，那么就让该节点的next 指向新的节点
          l.next = newNode;
      size++;
      modCount++;
  	}
```

> 1. **比如第一次添加的是111，此时链表中还没有节点，所以此时的尾节点last 为null, 生成新的节点，所以   此时的尾节点也就是111，所以这个 111 也是头节点，再进行扩容，修改次数对应增加 **
> 2. **第二次添加的是 222， 此时链表中已经有了一个节点，新添加的节点会添加到尾部，刚刚添加的111 就当作头节点来使用，222被添加到111的节点后面。 **



**add(int index,E e) : **

```java
	/**
      *在指定位置插入指定的元素
      */
    public void add(int index, E element) {
        // 下标检查
        checkPositionIndex(index);

        if (index == size)
          	// 如果需要插入的位置和链表的长度相同，就在链表的最后添加
            linkLast(element);
        else
          	// 否则就链接在此位置的前面
            linkBefore(element, node(index));
    }

	
    // 越界检查
    private void checkPositionIndex(int index) {
          if (!isPositionIndex(index))
              throw new IndexOutOfBoundsException(outOfBoundsMsg(index));
    }

    // 判断参数是否是有效位置(对于迭代或者添加操作来说)
    private boolean isPositionIndex(int index) {
        return index >= 0 && index <= size;
    }

		// linkLast 上面已经介绍过

    // 查找索引所在的节点
    Node<E> node(int index) {
        // assert isElementIndex(index);

        if (index < (size >> 1)) {
            Node<E> x = first;
            for (int i = 0; i < index; i++)
                x = x.next;
            return x;
        } else {
            Node<E> x = last;
            for (int i = size - 1; i > index; i--)
                x = x.prev;
            return x;
        }
    }

    // 在非空节点插入元素
    void linkBefore(E e, Node<E> succ) {
        // assert succ != null;
      	// succ 即是插入位置的节点
    		// 查找该位置处的前面一个节点
        final Node<E> pred = succ.prev;
        final Node<E> newNode = new Node<>(pred, e, succ);
        succ.prev = newNode;
        if (pred == null)
            first = newNode;
        else
            pred.next = newNode;
        size++;
        modCount++;
    }
```

> 1. **例如在位置为1处添加值为123 的元素，首先对下标进行越界检查，判断这个位置是否等于链表的长度，如果与链表长度相同，就往最后插入，如果不同的话，就在索引的前面插入。**
> 2. **下标为1 处并不等于索引的长度，所以在索引前面插入，首先对查找 1 这个位置的节点是哪个，并获取这个节点的前面一个节点，在判断这个位置的前一个节点是否为null，如果是null，那么这个此处位置的元素就被当作头节点，如果不是的话，头节点的next 节点就指向123**



**addFirst(E e) :**

```java
    // 在头节点插入元素
    public void addFirst(E e) {
        linkFirst(e);
    }

		
    private void linkFirst(E e) {
      	// 先找到first 节点
        final Node<E> f = first;
        final Node<E> newNode = new Node<>(null, e, f);
        first = newNode;
        if (f == null)
          	// f 为null，也就代表着没有头节点
            last = newNode;
        else
            f.prev = newNode;
        size++;
        modCount++;
    }
```

> **例如要添加top 元素至链表的首部，需要先找到first节点，如果first节点为null，也就说明没有头节点，如果不为null，则头节点的prev节点是新插入的节点。**



**addLast(E e) : **

```java
		        
    public void addLast(E e) {
        linkLast(e);
    }
		
    // 链接末尾处的节点
    void linkLast(E e) {
        final Node<E> l = last;
        final Node<E> newNode = new Node<>(l, e, null);
        last = newNode;
        if (l == null)
            first = newNode;
        else
            l.next = newNode;
        size++;
        modCount++;
    }
		
```

> **方法逻辑与在头节点插入基本相同**



**addAll(Collections<? extends E> c) : **

```java
    /**
    * 在链表中批量添加数据
    */
    public boolean addAll(Collection<? extends E> c) {
        return addAll(size, c);
    }

    public boolean addAll(int index, Collection<? extends E> c) {
   	  // 越界检查
        checkPositionIndex(index);
				
      	// 把集合转换为数组
        Object[] a = c.toArray();
        int numNew = a.length;
        if (numNew == 0)
            return false;

        Node<E> pred, succ;
      	// 直接在末尾添加，所以index = size
        if (index == size) {
            succ = null;
            pred = last;
        } else {
            succ = node(index);
            pred = succ.prev;
        }
				
      	// 遍历每个数组
        for (Object o : a) {
            @SuppressWarnings("unchecked") E e = (E) o;
          	// 先对应生成节点，再进行节点的链接
            Node<E> newNode = new Node<>(pred, e, null);
            if (pred == null)
                first = newNode;
            else
                pred.next = newNode;
            pred = newNode;
        }

        if (succ == null) {
            last = pred;
        } else {
            pred.next = succ;
            succ.prev = pred;
        }

        size += numNew;
        modCount++;
        return true;
    }
```

> ```java
> Collection<String> collec = Arrays.asList("123","213","321");
> list.addAll(collec);
> ```
>
> 1. **例如要插入一个Collection为123,213,321 的集合，没有指定插入元素的位置，默认是向链表的尾部进行链接，首先会进行数组越界检查，然后会把集合转换为数组，在判断数组的大小是否为0，为0返回，不为0，继续下面操作**
> 2. **因为是直接向链尾插入，所以index = size，然后遍历每个数组，首先生成对应的节点，在对节点进行链接，因为succ 是null，此时last 节点 = pred，这个时候的pred节点就是遍历数组完成后的最后一个节点**
> 3. **然后再扩容数组，增加修改次数**



**addAll(Collections<? extends E> c) : ** 这个方法的源码同上

**offer也是对元素进行添加操作，源码和add方法相同**

**offerFirst(E e)和addFirst(E e) 源码相同**

**offerLast(E e)和addLast(E e) 源码相同)**

**push(E e) 和addFirst(E e) 源码相同**



**取出元素**

包括方法有：

- **peek**()
- **peekFirst**()
- **peekLast**()
- **element**()
- **get**(int index)
- **getFirst**()
- **getLast**()
- **indexOf**([Object](../../java/lang/Object.html) o)
- **lastIndexOf**([Object](../../java/lang/Object.html) o)



**peek()**

```java
    /**
    *	只是访问，但是不移除链表的头元素
    */
    public E peek() {
        final Node<E> f = first;
        return (f == null) ? null : f.item;
    }

```

> **peek() 源码比较简单，直接找到链表的第一个节点，判断是否为null，如果为null，返回null，否则返回链首的元素**



**peekFirst() ： 源码和peek() 相同**

**peekLast():**



```java
    /**
    * 访问，但是不移除链表中的最后一个元素
    * 或者返回null如果链表是空链表
    */
    public E peekLast() {
        final Node<E> l = last;
        return (l == null) ? null : l.item;
    }
```

> **源码也比较好理解**



**element() :**

```java
    /**
    * 只是访问，但是不移除链表的第一个元素
    */
    public E element() {
        return getFirst();
    }

    public E getFirst() {
        final Node<E> f = first;
        if (f == null)
            throw new NoSuchElementException();
        return f.item;
    }
```

> **与peek()相同的地方都是访问链表的第一个元素，不同是element元素在链表为null的时候会报空指针异常**



****get**(int index) : **

```java
    /*
    * 返回链表中指定位置的元素
    */ 
    public E get(int index) {
        checkElementIndex(index);
        return node(index).item;
    }

    // 返回指定索引下的元素的非空节点
    Node<E> node(int index) {
        // assert isElementIndex(index);

        if (index < (size >> 1)) {
            Node<E> x = first;
            for (int i = 0; i < index; i++)
                x = x.next;
            return x;
        } else {
            Node<E> x = last;
            for (int i = size - 1; i > index; i--)
                x = x.prev;
            return x;
        }
    }
```

> **get(int index)源码也是比较好理解，首先对下标进行越界检查，没有越界的话直接找到索引位置对应的node节点，进行返回**



**getFirst() ：源码和element()相同**

**getLast():  直接找到最后一个元素进行返回，和getFist几乎相同**



**indexOf(Object o) :**

```java
    /*
    * 返回第一次出现指定元素的位置，或者-1如果不包含指定元素。
    */
    public int indexOf(Object o) {
        int index = 0;
        if (o == null) {
            for (Node<E> x = first; x != null; x = x.next) {
                if (x.item == null)
                    return index;
                index++;
            }
        } else {
            for (Node<E> x = first; x != null; x = x.next) {
                if (o.equals(x.item))
                    return index;
                index++;
            }
        }
        return -1;
    }
```

> **两种情况：**
>
> 1. **如果需要检索的元素是null，对元素链表进行遍历，返回x的元素为空的位置**
> 2. **如果需要检索的元素不是null，对元素的链表遍历，直到找到相同的元素，返回元素下标**



**lastIndexOf(Object o) : **

```java
    /*
    * 返回最后一次出现指定元素的位置，或者-1如果不包含指定元素。
    */
    public int lastIndexOf(Object o) {
        int index = size;
        if (o == null) {
            for (Node<E> x = last; x != null; x = x.prev) {
                index--;
                if (x.item == null)
                    return index;
            }
        } else {
            for (Node<E> x = last; x != null; x = x.prev) {
                index--;
                if (o.equals(x.item))
                    return index;
            }
        }
        return -1;
    }
```

> **从IndexOf(Object o)源码反向理解**



**删除**

删除节点的示意图如下：

![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190530225451674-1105611196.png)


包括的方法有：

- **poll**()
- **pollFirst**()
- **pollLast**()
- **pop**()
- **remove**()
- **remove**(int index)
- **remove**([Object](../../java/lang/Object.html) o)
- **removeFirst**()
- **removeFirstOccurrence**([Object](../../java/lang/Object.html) o)
- **removeLast**()
- **removeLastOccurrence**([Object](../../java/lang/Object.html) o)
- **clear**()



**poll() : **

```java
    /*
    * 访问并移除链表中指定元素
    */
    public E poll() {
        final Node<E> f = first;
        return (f == null) ? null : unlinkFirst(f);
    }

    // 断开第一个非空节点
    private E unlinkFirst(Node<E> f) {
        // assert f == first && f != null;
        final E element = f.item;
        final Node<E> next = f.next;
        f.item = null;
        f.next = null; // help GC
        first = next;
        if (next == null)
            last = null;
        else
            next.prev = null;
        size--;
        modCount++;
        return element;
    }
```

> **poll()方法也比较简单直接，首先通过Node方法找到第一个链表头，然后把链表的元素和链表头指向的next元素置空，再把next节点的元素变为头节点的元素**



**pollFirst() :  与poll() 源码相同**

**pollLast(): 与poll() 源码很相似，不再解释**



**pop()**

```java
			
    /*
    	* 弹出链表的指定元素，换句话说，移除并返回链表中第一个元素
      */
    public E removeFirst() {
      final Node<E> f = first;
      if (f == null)
        throw new NoSuchElementException();
      return unlinkFirst(f);
    }

    // unlinkFirst 源码上面👆有
```

> **removeFirst源码就多了如果首部元素为null，就直接抛出异常的操作**



**remove**(int index): 

```java
    /*
    * 移除链表指定位置的元素
    */
    public E remove(int index) {
        checkElementIndex(index);
      	// 找到index 的节点，断开指定节点
        return unlink(node(index));
    }

    // 断开指定节点
    E unlink(Node<E> x) {
        // 找到链接节点的元素，next节点和prev节点
        final E element = x.item;
        final Node<E> next = x.next;
        final Node<E> prev = x.prev;

        if (prev == null) {
            first = next;
        } else {
            prev.next = next;
            x.prev = null;
        }

        if (next == null) {
            last = prev;
        } else {
            next.prev = prev;
            x.next = null;
        }

        x.item = null;
        size--;
        modCount++;
        return element;
    }
```



**remove**([Object](../../java/lang/Object.html) o)

```java
    /*
    * 移除列表中第一次出现的指定元素，如果存在的话。如果列表不包含指定元素，则不会改变，
    * 更进一步来说，移除索引最小的元素，前提是(o == null ? get(i) == null : o.equals(get(i)))
    */
    public boolean remove(Object o) {
      	// 如果o为null
        if (o == null) {
            for (Node<E> x = first; x != null; x = x.next) {
              	// 匹配null对象，删除控对象，返回true
                if (x.item == null) {
                    unlink(x);
                    return true;
                }
            }
        } else {
            // 如果不为null
            for (Node<E> x = first; x != null; x = x.next) {
              	// 匹配对应节点，返回true
                if (o.equals(x.item)) {
                    unlink(x);
                    return true;
                }
            }
        }
        return false;
    }
```



**removeFirst() 和remove() 源码相同** 

**removeFirstOccurrence**([Object](../../java/lang/Object.html) o)和 **remove**([Object](../../java/lang/Object.html) o) 源码相同

**removeLast**() 和 pollLast() 相同

**removeLastOccurrence**([Object](../../java/lang/Object.html) o) 和 **removeFirstOccurrence**([Object](../../java/lang/Object.html) o) 相似



**clear()**

```java
		
    /*
    * 清空所有元素
    */
    public void clear() {
      	// 遍历元素，把元素的值置为null
        for (Node<E> x = first; x != null; ) {
            Node<E> next = x.next;
            x.item = null;
            x.next = null;
            x.prev = null;
            x = next;
        }
        first = last = null;
        size = 0;
        modCount++;
    }
```

> **clear()方法，先找到链表头，循环遍历每一项，把每一项的prev，item，next属性置空，最后再清除first和last节点，注意源码有一点，x = next ，这行代码是向后遍历的意思，根据next的元素再继续向后查找**



**其他方法**

链表最常用的方法就是添加、查找、删除，下面来介绍一下其他的方法

**clone**()

```java
    /*
    * 链表复制
    */
    public Object clone() {
       	// 此处的clone 
        LinkedList<E> clone = superClone();

        // Put clone into "virgin" state
        clone.first = clone.last = null;
        clone.size = 0;
        clone.modCount = 0;

        // Initialize clone with our elements
        for (Node<E> x = first; x != null; x = x.next)
            clone.add(x.item);

        return clone;
    }

    private LinkedList<E> superClone() {
        try {
            return (LinkedList<E>) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new InternalError(e);
        }
    }
		// 本地方法
		protected native Object clone() throws CloneNotSupportedException;
```

> **clone() 方法调用superClone()能够获取拷贝过后的值，但是为什么要把first和last置为null，debug的时候就发现clone对象所有的值都为null了，而且为什么又要循环遍历链表再添加一遍？**



**contains**([Object](../../java/lang/Object.html) o) : 和index源码几乎相同



**set**(int index, [E](../../java/util/LinkedList.html) element)

```java
		
    /*
    * 在指定位置替换指定元素
    */
    public E set(int index, E element) {
    		// 越界检查
        checkElementIndex(index);
      	// 找到索引元素所在的位置
        Node<E> x = node(index);
      	// 元素替换操作，返回替换之前的元素
        E oldVal = x.item;
        x.item = element;
        return oldVal;
    }
```



**descendingIterator**()

```java
		
    public Iterator<E> descendingIterator() {
        return new DescendingIterator();
    }

    private class DescendingIterator implements Iterator<E> {
        private final ListItr itr = new ListItr(size());
        public boolean hasNext() {
            return itr.hasPrevious();
        }
        public E next() {
            return itr.previous();
        }
        public void remove() {
            itr.remove();
        }
    }
```

> **descendingIterator 就相当于创建了一个倒置的Iterator，倒叙遍历**



**listIterator**(int index) : 

```java
		
    /*
    * 在指定位置上返回一个列表的迭代器，这个list-Iterator是有快速失败机制的
    * 可以参见我的另一篇文章 ArrayList 源码解析
    */
    public ListIterator<E> listIterator(int index) {
        checkPositionIndex(index);
        return new ListItr(index);
    }

		// ListItr 是LinkedList的一个内部类
		private class ListItr implements ListIterator<E> {
      	// 上一个被返回的节点
        private Node<E> lastReturned;
      	// 下一个节点
        private Node<E> next;
      	// 下一个下标
        private int nextIndex;
      	// 期望的修改次数 = 修改次数，用于判断并发情况
        private int expectedModCount = modCount;

      	// 在指定位置创建一个迭代器
        ListItr(int index) {
            next = (index == size) ? null : node(index);
            nextIndex = index;
        }
				
      	// 判断是否有下一个元素
      	// 判断的标准是下一个索引的值 < size ,说明当前位置最大 = 链表的容量
        public boolean hasNext() {
            return nextIndex < size;
        }

      	// 查找下一个元素
        public E next() {
            checkForComodification();
            if (!hasNext())
                throw new NoSuchElementException();
						
            lastReturned = next;
          	// 指向下一个元素
            next = next.next;
            nextIndex++;
            return lastReturned.item;
        }
				
      	// 是否有之前的元素
        public boolean hasPrevious() {
          	// 通过元素索引是否等于0，来判断是否达到开头。
            return nextIndex > 0;
        }
				
      	// 遍历之前的元素
        public E previous() {
            checkForComodification();
            if (!hasPrevious())
                throw new NoSuchElementException();
						 // next指向链表的上一个元素
            lastReturned = next = (next == null) ? last : next.prev;
            nextIndex--;
            return lastReturned.item;
        }
				
      	// 下一个索引
        public int nextIndex() {
            return nextIndex;
        }

      	// 上一个索引
        public int previousIndex() {
            return nextIndex - 1;
        }

      	// 移除元素，有fail-fast机制
        public void remove() {
            checkForComodification();
            if (lastReturned == null)
                throw new IllegalStateException();

            Node<E> lastNext = lastReturned.next;
            unlink(lastReturned);
            if (next == lastReturned)
                next = lastNext;
            else
                nextIndex--;
            lastReturned = null;
            expectedModCount++;
        }
				
      	// 设置当前节点为e，有fail-fast机制
        public void set(E e) {
            if (lastReturned == null)
                throw new IllegalStateException();
            checkForComodification();
            lastReturned.item = e;
        }
				
      	// 将e添加到当前节点的前面，也有fail-fast机制
        public void add(E e) {
            checkForComodification();
            lastReturned = null;
            if (next == null)
                linkLast(e);
            else
                linkBefore(e, next);
            nextIndex++;
            expectedModCount++;
        }
				
      	// jdk1.8引入，用于快速遍历链表元素
        public void forEachRemaining(Consumer<? super E> action) {
            Objects.requireNonNull(action);
            while (modCount == expectedModCount && nextIndex < size) {
                action.accept(next.item);
                lastReturned = next;
                next = next.next;
                nextIndex++;
            }
            checkForComodification();
        }

      	// 判断 “modCount和expectedModCount是否相等”，依次来实现fail-fast机制
        final void checkForComodification() {
            if (modCount != expectedModCount)
                throw new ConcurrentModificationException();
        }
    }
```



**toArray**()

```java
	
    /*
    * 返回LinkedList的Object[]数组
    */
    public Object[] toArray() {
        Object[] result = new Object[size];
        int i = 0;
        //将链表中所有节点的数据都添加到Object[]数组中
        for (Node<E> x = first; x != null; x = x.next)
          result[i++] = x.item;
        return result;
    }
```



**toArray**(T[] a)

```java
    /*
    * 返回LinkedList的模板数组。所谓模板数组，即可以将T设为任意的数据类型
    */
    public <T> T[] toArray(T[] a) {
      	// 若数组a的大小 < LinkedList的元素个数(意味着数组a不能容纳LinkedList中全部元素)
        // 则新建一个T[]数组，T[]的大小为LinkedList大小，并将该T[]赋值给a。
        if (a.length < size)
            a = (T[])java.lang.reflect.Array.newInstance(
                                a.getClass().getComponentType(), size);
        //将链表中所有节点的数据都添加到数组a中
      	int i = 0;
        Object[] result = a;
        for (Node<E> x = first; x != null; x = x.next)
            result[i++] = x.item;

        if (a.length > size)
            a[size] = null;

        return a;
    }
```



> **后记 : 笔者才疏学浅，如果有哪处错误产生误导，请及时与笔者联系更正，一起共建积极向上的it氛围**



**文章参考： **

[Java 集合系列05之 LinkedList详细介绍(源码解析)和使用示例](https://www.cnblogs.com/skywang12345/p/3308807.html)
![](https://img2018.cnblogs.com/blog/1515111/201905/1515111-20190530230235939-272331703.png)

![](https://img2020.cnblogs.com/blog/1515111/202006/1515111-20200603165852854-60248354.png)
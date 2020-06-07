## 前言
上篇[一文学会动态规划解题技巧](https://mp.weixin.qq.com/s/15HSidWyGg5eN--ICNNjFg) 被不少号转载了，其中发现有一位读者提了一个疑惑，在求三角形最短路径和时，能否用贪心算法求解。所以本文打算对贪心算法进行简单地介绍，介绍完之后我们再来看看是否这道三角形最短路径问题能用贪心算法来求解。

本文将会从以下几个方面来介绍贪心算法

* 什么是贪心算法
* 贪心算法例题详题
* 贪心算法适用场景
* 再看三角形最短路径和是否能用贪心算法求解


## 什么是贪心算法
贪心算法是指在每个阶段做选择的时候都做出当前阶段（或状态）最好的选择，并且**期望**这样做到的结果是全局最优解（但未必是全局最优解）

贪心算法其实是动态规划的一种,由于它的「贪心」，只着眼于当前阶段的最优解，所以每个子问题**只会被计算一次**，如果由此能得出全局最优解，相对于动态规划要对每个子问题求全局最优解，它的时间复杂度无疑是会下降一个量级的。

举个简单的例子，比如给定某个数字的金额（如 250）与 100, 50, 10, 5, 1 这些纸币（不限量），怎么能用最少张的纸币来兑换这张金额呢，显然每次兑换应该先从大额的纸币兑换起，第一次选 100， 第二次还是选 100， 第三次选第二大的 50 元，每次都选小于剩余金额中的最大面额的纸币，这样得出的解一定是全局最优解！时间复杂度无疑是线性的。

我们先来看几道可以用贪心算法来求解的例题

## 贪心算法例题详题

### 分糖果
 > 有 m 个糖果和 n 个孩子。我们现在要把糖果分给这些孩子吃，但是糖果少，孩子多（m < n），所以糖果只能分配给一部分孩子。每个糖果的大小不等，这 m 个糖果的大小分别是s1，s2，s3，……，sm。除此之外，每个孩子对糖果大小的需求也是不一样的，只有糖果的大小大于等于孩子的对糖果大小的需求的时候，孩子才得到满足。假设这 n 个孩子对糖果大小的需求分别是 g1，g2，g3，……，gn。那么如何分配糖果，能尽可能满足最多数量的孩子呢?

 求解：这道题如果用贪心来解解题思路还是比较明显的，对于每个小孩的需求 gn，只要给他所有大小大于 gn 的糖果中的最小值即可，这样就能把更大的糖果让给需求更大的小孩。整个代码如下：

```java
public class Solution {
    /**
     *  获取能分配给小孩且符合条件的最多糖果数
     */
    private static int dispatchCandy(int[] gList, int[] sList) {
        Arrays.sort(gList);     // 小孩对糖果的需求从小到大排列
        Arrays.sort(sList);     // 糖果大小从小到大排列

        int maximumCandyNum = 0;
        for (int i = 0; i < gList.length; i++) {
            for (int j = 0; j < sList.length; j++) {
                // 选择最接近小孩需求的糖果，以便让更大的糖果满足需求更大的小孩
                if (gList[i] <= sList[j]) {
                    maximumCandyNum++;
                    // 糖果被选中，将其置为-1，代表无效了
                    sList[j] = -1;
                    // 糖果已选中，跳出
                    break;
                }
            }
        }
        return maximumCandyNum;
    }

    public static  void main(String[] args) {
        // 小孩对糖果的需求
        int[] gList = {1,2,4,6};
        // 糖果实际大小
        int[] sList = {1,2,7,3};
        int result = dispatchCandy(gList, sList);
        System.out.println("result = " + result);
    }
}
```

### 无重叠区间
>  给定一个区间的集合，找到需要移除区间的最小数量，使剩余区间互不重叠。
> 注意:可以认为区间的终点总是大于它的起点。区间 [1,2] 和 [2,3] 的边界相互“接触”，但没有相互重叠。
> 示例 1: 
> 输入: [ [1,2], [2,3], [3,4], [1,3] ]
> 输出: 1
> 解释: 移除 [1,3] 后，剩下的区间没有重叠。
> 
> 示例 2: 
> 输入: [ [1,2], [1,2], [1,2] ]
> 输出: 2
> 解释: 你需要移除两个 [1,2] 来使剩下的区间没有重叠。
> 
> 示例 3: 
> 输入: [ [1,2], [2,3] ]
> 输出: 0
> 解释: 你不需要移除任何区间，因为它们已经是无重叠的了。


区间重叠可以在生活中的很多场景里找到，比如任务调度，一个工人在一段时间内需要完成多项任务，每个任务需要完成的时间不同，如何在这段时间内让工人尽可能多地完成这些任务呢（任务与任务之间进行的时间不能重叠，一个工人不可能在同一段时间内同时进行两项任务）

解题思路: 这道题我们分别用动态规划和贪心算法来解一下，以便对比一下两者的时间复杂度，看下贪心算法是否在时间复杂度上更优胜一些。

**动态规划解法**
首先为了方便求解，我们把每个区间按区间的起始点从小到大进行排序，如图示

![](https://user-gold-cdn.xitu.io/2020/2/27/1708255644fbb269?w=504&h=244&f=png&s=3968)

接下来我们套用[上篇](https://mp.weixin.qq.com/s/15HSidWyGg5eN--ICNNjFg)中的说的动态规划解题四步曲来看看怎么用动态规划进行求解。

**1、 判断是否可用递归来解**

其实直观地看上面我们排好序的各个区间，这不就是个组合吗，每个区间要么选，要么不选，把所有的组合穷举出来，再看哪个组合最符合题目中的条件，所以无疑是可以用递归的（组合用递归怎么解，强烈建议看下[这篇文章](https://mp.weixin.qq.com/s/agYLGYc83cgONllSdAe-Vg)）。

不过这题的组合有点特殊，前后两个区间有条件限制，如果当前区间与前一个区间重叠，则这两者只能取其一（另一个需要剔除掉防止重叠），于是我们有如下思路：

定义两个值, pre , cur ，分别代表前一个区间与当前区间，需要进行如下步骤

1. 比较前一个区间的终点与当前区间的起始值
2. 如果前一个区间的终点小于当前区间的起始值，代表两区间不重叠，则将 pre 置为 cur, cur 置为 cur + 1, 开始接下来紧邻的两个区间的判断（即重复步骤 1）。
3. 如果前一个区间的终点大于当前区间的起始值，代表两区间重叠，则 pre 不变, cur 置为 cur + 1 (即将 cur 对应的区间移除)，注意此时移除区间数要加 1, 然后开始接下来 pre，cur+1 区间的判断（即重复步骤 1）。

**注：首次区间遍历我们定义 pre = -1，cur = 0 **

从以上的描述中可以很明显地看到存在递归现象，于是我们写出了如下代码,关键代码都作了详细的注释。

```java
public class Solution {
    // 区间类，包括起始值和终止值
    private static class Interval {
        int start;
        int end;
        Interval(int start, int end) {
            this.start = start;
            this.end = end;
        }
    }

    private static Integer removeDuplicateIntervas(Interval[] intervals) {
        // 将区间按起始点由小到大进行排序
        Arrays.sort(intervals, Comparator.comparingInt(a -> a.start));
        // 首次遍历从 -1,0 开始
        return removeSubDuplicate(-1, 0, intervals);
    }

    private static Integer removeSubDuplicate(int pre, int cur, Interval[] intervals) {
        if (cur == intervals.length) {
            return 0;
        }

        int notRemove = Integer.MAX_VALUE;
        if (pre == -1 || intervals[pre].end <= intervals[cur].start) {

            /**
             * 如果是首次遍历，或者 pre 区间的终点小于 cur 区间的起点（即区间不重叠）,
             * 则 pre = cur; cur = cur+1
             */
            notRemove = removeSubDuplicate(cur, cur+1, intervals);
        }

        /**
         * 如果 pre 区间的终点大于 cur 区间的起点，代表两区间重叠，cur 指向后一个区间，即 cur = cur + 1
         * 代表 cur 被移除，所以需要加1（代表这个区间被移除了）
         */
        int remove = removeSubDuplicate(pre, cur+1, intervals) + 1;

        // 取两者的较小值
        return Math.min(notRemove, remove);
    }

    public static  void main(String[] args) {
        // 初始化区间
        Interval[] intervals = {
                new Interval(1, 2),
                new Interval(3, 5),
                new Interval(4, 7),
                new Interval(8, 10),
                new Interval(9, 11)
        };
        int result = removeDuplicateIntervas(intervals);
        System.out.println("result = " + result);
    }
}
```

**2、 分析在递归的过程中是否存在大量的重复子问题**

怎么判断是否存在大量的重复子问题，在[一文学会动态规划解题技巧](https://mp.weixin.qq.com/s/15HSidWyGg5eN--ICNNjFg) 我们提出一种方案，画出递归树 ，不过这题如果画出递归树比较麻烦，其实对于组合问题我们可以简单分析一下，对于每个区间要么选，要么不选，我们以 1 代表该区间被选择，以 0 代表该区间不选，则简单考虑一下如下两个组合

```shell
11010
11001
```
仔细看，红框 部分，就是重复子问题！

![](https://user-gold-cdn.xitu.io/2020/2/27/1708255651bc8b51?w=129&h=106&f=png&s=6863)

可能有人会说这个分析也有点难，那我再教大家一招，打印! 如图示

![](https://user-gold-cdn.xitu.io/2020/2/27/17082556525121dc?w=687&h=198&f=png&s=33512)

在递归函数中打印出来，然后分析打印的规律

![](https://user-gold-cdn.xitu.io/2020/2/27/17082556454c79cb?w=126&h=295&f=png&s=12099)

可以看到，确实存在着重复子问题，时间复杂度是多少呢，每个区间要么选，要么不选，共有两个状态，如果有 n 个区间的话，就是 2^n,于是我们知道时间复杂度是 O(2^n)，指数级！显然无法接受

既然存在重复子问题，那我们进入动态规划第三步

**3、采用备忘录的方式来存子问题的解以避免大量的重复计算（剪枝）**
在以上的分析中基本我们看到，其实就是 pre, cur 有可能存在大量重复，于是我们保存 pre, cur 对应的中间结果，如下

```java
// 保存中间结果
private static HashMap<String, Integer> map = new HashMap();
private static Integer removeSubDuplicate(int pre, int cur, Interval[] intervals) {
    String key = pre + "," + cur;
    if (map.get(key) != null) {
        return map.get(key);
    }
    
    if (cur == intervals.length) {
        return 0;
    }

    int notRemove = Integer.MAX_VALUE;
    if (pre == -1 || intervals[pre].end <= intervals[cur].start) {
        notRemove = removeSubDuplicate(cur, cur+1, intervals);
    }

    int remove = removeSubDuplicate(pre, cur+1, intervals) + 1;
    int result = Math.min(notRemove, remove);
    map.put(key, result);
    // 取两者的较小值
    return result;
}
```
采用备忘录的方式缓存子问题的中间结果后，时间复杂度直线下降，达到 O(n^2)（因为 pre, cur 两个变量不断往后移，即两层循环，所以是 O(n^2)） 。

**4、改用自底向上的方式来递推，即动态规划**

我们定义 dp[i] 为 从 0 到  第 i 个区间 的 最大**不重叠**区间数,于是我们得出了状态转移方程

```shell
dp[i] = max{dp[j]} + 1, 其中 0 <=j < i 并且需要满足一个条件 interval[i].start > interval[j].end,即保证 i, j 指向的区间不重叠。
```
则最终的 dp[区间总个数-1] 则为最大的连续不重叠区间个数，那么 区间总个数 - 最大的连续不重叠区间个数不就是最小要移除的区间数了，有了 dp 方程，写起代码来就快了，如下

```java
/**
* 判断两区间是否重叠, i 区间的起点比 j 区间的大, 如果 j 区间的终点比 i 区间的起点大，则重叠
 */
private static boolean isOverlapping(Interval i, Interval j) {
    return j.end > i.start;
}

/**
 * 动态规划求解
 */
private static Integer removeSubDuplicateWithDP(Interval[] intervals) {
    // 将区间按起始点由小到大进行排序
    Arrays.sort(intervals, Comparator.comparingInt(a -> a.start));

    int[] dp = new int[intervals.length];
    Arrays.fill(dp, 0);
    dp[0]  = 1;    // 将 dp[0] 置为 1， 因为就算所有的区间都重叠，则连续不重叠区间到少也为 1

    int result = 1;
    for (int i = 1; i < intervals.length; i ++) {
        int max = 0;
        for (int j = 0; j < i; j ++) {
            if (!isOverlapping(intervals[i], intervals[j])) {
                max = Math.max(dp[j], max);
            }
        }
        dp[i] = max + 1;
    }
    return intervals.length - dp[intervals.length - 1];
}
```

空间复杂度是多少，由于只有一个 dp 一维数组，所以是 O(n)，时间复杂度呢， 两重循环，所以是 O(n^2)。可以看到和采用递归+备忘录的时间复杂度一样，不过之前其实说了很多次，递归容易导致栈溢出，所以建议还是采用动态规划的方式来求解。

接下来重点来了，来看看如何用贪心算法来求解。
首先要把各个区间按照区间的终点从小到大排列，如下

![](https://user-gold-cdn.xitu.io/2020/2/27/17082556c03237d3?w=430&h=240&f=png&s=3632)

我们的思路与上文中的动态规划一样，先求出最大不重叠子区间个数,再用「区间总数-最大不重叠子区间个数」即为最小要移除的重叠区间数。

用贪心算法求最大不重大子区间个数步骤如下
1. 选择终点最小的区间，设置为当前区间 cur 。
2. 按区间终点从小到大寻找下一个与区间 cur 不重叠的区间，然后将此区间设置为当前区间 cur（注意此时最大不重叠子区间个数要加1），不断重复步骤 2， 直到遍历所有的区间。

动图如下,相信大家看完动图会更容易理解

![](https://user-gold-cdn.xitu.io/2020/2/27/1708255651f73733?w=542&h=238&f=gif&s=98027)

知道了解题思路，写代码就很简单了

```java
/**
 * 贪心算法求解
 */
private static Integer removeSubDuplicateWithGreedy(Interval[] intervals) {
    // 将区间终点由小到大进行排序
    Arrays.sort(intervals, Comparator.comparingInt(a -> a.end));

    int cur = 0;            // 设置第一个为当前区间
    int count = 1;      // 最大不重叠区间数,最小为1
    for (int i = 1; i < intervals.length; i++) {
        // 不重叠
        if (intervals[cur].end < intervals[i].start) {
            cur = i;
            count++;
        }
    }
    // 总区间个数减去最大不重叠区间数即最小被移除重叠区间
    return intervals.length - count;
}
```
时间复杂度是多少呢，只有一个循环，所以是 O(n), 比起动态规划的 O(n^2),确实快了一个数量级，简单分析下为啥贪心算法这么快，由以上代码可以看到，它只关心眼前的最优解（选择下一个与当前区间不重叠的区间再依次遍历，无选完之后再也无需求关心之前的区间了！）而动态规划呢，从它的 dp 方程（dp[i] = max{dp[j]} + 1）可以看出，对于每个 i ,都要自底向上遍历一遍 0 到 i 的解以求出最大值，也就是说对于动态规划的子问题而言，由于它追求的是全局最优解，所以它有一个回溯（即自底向上求出所有子问题解的最优解）的过程，回溯的过程中就有一些重复的子问题计算，而贪心算法由于追求的是眼前的最优解，所以不会有这种回溯的求解，也就省去了大量的操作，所以如果可以用贪心算法求解，时间复杂度无疑是能上升一个量级的。


## 贪心算法适用场景
简单总结一下贪心算法，它指的是每一步只选最优的，并且期望每一步选择的最优解能达成全局的最优解，说实话这太难了，因为一般一个问题的选择都会影响下一个问题的选择，**除非子问题之间完全独立，没有关联**，比如我们在文中开头说的凑零钱的例子， 如果一个国家的钞票比较奇葩，只有 1，5，11 这三种面值的钞票，如何用最少的钞票凑出 15 呢，如果用贪心第一次选 11， 那之后只能选 4 张 1 了，即 15 = 1 x 11 + 4 x1。其实最优解应该是 3 张 5 元的钞票，为啥这种情况下用贪心不适用呢，因为第一次选了 11，影响了后面钞票的选择，也就是说子问题之间并不是独立的，而是互相制约，互有影响的，所以我们选贪心的时候一定要注意它的适用场景。

## 再看三角形最短路径和是否能用贪心算法求解
回过头来看开头的问题，三角形最短路径和能否用贪心算法求解呢

先回顾一下这个题目:

![](https://user-gold-cdn.xitu.io/2020/2/27/1708255757039284?w=878&h=692&f=png&s=40196)

如图示，以上三角形由一连串的数字构成，要求从顶点 2 开始走到最底下边的最短路径，每次只能向当前节点下面的两个节点走，如 3 可以向 6 或 5 走，不能直接走到 7。

![](https://user-gold-cdn.xitu.io/2020/2/27/1708255758c627b7?w=455&h=340&f=png&s=20035)
**如图示：要求节点 2 到底部的最短路径，它只关心节点 9， 10，之前层数的节点无需再关心！因为 9，10 已经是最优子结构了，所以只保存每层节点（即一维数组）的最值即可！**

如果用贪心算法怎么求解

1、 第一步：由 2 往下走，由于 3 比 4 小，所以选择 3

![](https://user-gold-cdn.xitu.io/2020/2/27/170825578ce8d6be?w=431&h=345&f=png&s=15865)

2、 第二步：由 3  往下走，由于 5 比 6 小，所以选择 5

![](https://user-gold-cdn.xitu.io/2020/2/27/1708255762e6e9ad?w=432&h=348&f=png&s=16911)

3. 第三步: 从 5 往下走， 1 比 8 小，选择 1
![](https://user-gold-cdn.xitu.io/2020/2/27/1708255774c7e4f6?w=440&h=351&f=png&s=17986)

答案是 11 ，与动态规划得出的解一模一样！那是否说明这道题可以用贪心算法求解？

答案是否定的！上面的解之所以是正确的，是因为这些数字恰好按贪心求解出来得出了全局最优解，如果我们换一下数字，看看会如何

![](https://user-gold-cdn.xitu.io/2020/2/27/170825585d3f00b0?w=445&h=345&f=png&s=18595)

如图示，如果数字换成如图中所示，则按贪心得出的最短路径是 66, 而实际上最短路径应该为 16，如下图所示

![](https://user-gold-cdn.xitu.io/2020/2/27/17082557b59e36d3?w=448&h=348&f=png&s=18132)

为啥用贪心行不通呢，因为贪心追求的是每一步眼前的最优解，一旦它作出了选择，就会影响后面子问题的选择，比如如果选择了 3，就再也没法选择 7 了！所以再次强调，一定要注意贪心的适用场景，子问题之间是否相互制约，相互影响！

## 总结

本文简单讲述了贪心算法的适用场景，相信大家对贪心的优劣性应该有了比较清晰的认识，贪心追求的是眼前最优解（要最好的，就现在！）不管这次选择对后面的子问题造成的影响，所以贪心求得解未必是全局最优解，这就像我们做职业规划一样，千万不可因为一时的利益只考虑当下的利益，要作出对长远的职业生涯能持续有益的选择， 所以贪心的使用场景比较小，它是动态规划的特例，所以如果能用贪心来解的也都可以用动态规划来解。

文中代码已更新到我的 github (https://github.com/allentofight/algorithm)

欢迎添加笔者微信交流

![](https://user-gold-cdn.xitu.io/2020/2/27/1708255883e44a85?w=752&h=974&f=jpeg&s=62757)
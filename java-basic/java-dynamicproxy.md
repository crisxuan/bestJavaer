# Java 动态代理

* [Java 动态代理](#java-动态代理)
   * [代理模式](#代理模式)
   * [静态代理](#静态代理)
   * [动态代理](#动态代理)
      * [JDK 动态代理](#jdk-动态代理)
      * [CGLIB 动态代理](#cglib-动态代理)
      * [Javassist 代理](#javassist-代理)
      * [ASM 代理](#asm-代理)

这篇文章我们来聊一下 Java 中的动态代理。

动态代理在 Java 中有着广泛的应用，比如 **AOP 的实现原理、RPC远程调用、Java 注解对象获取、日志框架、全局性异常处理、事务处理等**。

在了解动态代理前，我们需要先了解一下什么是代理模式。

## 代理模式

`代理模式(Proxy Pattern)`是 23 种设计模式的一种，属于`结构型模式`。他指的是一个对象本身不做实际的操作，而是通过其他对象来得到自己想要的结果。这样做的好处是可以在**目标对象实现的基础上，增强额外的功能操作，即扩展目标对象的功能**。

>这里能体现出一个非常重要的编程思想：不要随意去改源码，如果需要修改，可以通过代理的方式来扩展该方法。

![](http://www.cxuan.vip/image-20230203181600495.png)

如上图所示，用户不能直接使用目标对象，而是构造出一个代理对象，由代理对象作为中转，代理对象负责调用目标对象真正的行为，从而把结果返回给用户。

也就是说，代理的关键点就是**代理对象和目标对象的关系**。

代理其实就和经纪人一样，比如你是一个明星，有很多粉丝。你的流量很多，经常会有很多金主来找你洽谈合作等，你自己肯定忙不过来，因为你要处理的不只是谈合作这件事情，你还要懂才艺、拍戏、维护和粉丝的关系、营销等。为此，你找了一个经纪人，你让他负责和金主谈合作这件事，经纪人做事很认真负责，它圆满的完成了任务，于是，金主找你谈合作就变成了金主和你的经纪人谈合作，你就有更多的时间来忙其他事情了。如下图所示

![](http://www.cxuan.vip/image-20230203181613273.png)

这是一种静态代理，因为这个`代理(经纪人)`是你自己亲自挑选的。

但是后来随着你的业务逐渐拓展，你无法选择每个经纪人，所以你索性交给了代理公司来帮你做。如果你想在 B 站火一把，那就直接让代理公司帮你找到负责营销方面的代理人，如果你想维护和粉丝的关系，那你直接让代理公司给你找一些托儿就可以了，那么此时的关系图会变为如下

![](http://www.cxuan.vip/image-20230203181623201.png)

此时你几乎所有的工作都是由代理公司来进行打理，而他们派出谁来帮你做这些事情你就不得而知了，这得根据实际情况来定，因为代理公司也不只是负责你一个明星，而且每个人所擅长的领域也不同，所以你只有等到有实际需求后，才会给你指定对应的代理人，这种情况就叫做`动态代理`。

## 静态代理

从编译期是否能确定最终的执行方法可以把代理模式分为静态代理和动态代理，我们先演示一下动态代理，这里有一个需求，领导想在系统中添加一个用户，但是他不自己添加，他让下面的程序员来添加，我们看一下这个过程。

首先构建一个用户接口，定义一个保存用户的模版方法。

```java
public interface UserDao {

    void saveUser();
}
```

构建一个用户实现类，这个用户实现类是真正进行用户操作的方法

```java
public class UserDaoImpl implements UserDao{

    @Override
    public void saveUser() {
        System.out.println(" ---- 保存用户 ---- ");
    }
}
```

构建一个用户代理类，用户代理类也有一个保存用户的方法，不过这个方法属于代理方法，它不会执行真正的保存用户，而是内部持有一个真正的用户对象，进行用户保存。

```java
public class UserProxy {

    private UserDao userDao;
    public UserProxy(UserDao userDao){
        this.userDao = userDao;
    }

    public void saveUser() {
        System.out.println(" ---- 代理开始 ---- ");
        userDao.saveUser();
        System.out.println(" ---- 代理结束 ----");
    }
}
```

下面是测试方法。

```java
public class UserTest {

    public static void main(String[] args) {

        UserDao userDao = new UserDaoImpl();
        UserProxy userProxy = new UserProxy(userDao);
        userProxy.saveUser();

    }
}
```

新创建一个用户实现类 （UserDaoImpl），它不执行用户操作。然后再创建一个用户代理（UserProxy），执行用户代理的用户保存（saveUser），其内部会调用用户实现类的保存用户（saveUser）方法，因为我们 JVM 可以在编译期确定最终的执行方法，所以上面的这种代理模式又叫做`静态代理`。

**代理模式具有无侵入性的优点**，以后我们增加什么新功能的话，我们可以直接增加一个代理类，让代理类来调用用户操作，这样我们就实现了不通过改源码的方式增加了新的功能。然后生活很美好了，我们能够直接添加我们想要的功能，在这`美丽`的日子里，cxuan 添加了用户代理、日志代理等等无数个代理类。但是好景不长，cxuan 发现每次改代码的时候都要改每个代理类，这就很烦啊！我宝贵的时光都浪费在改每个代理类上面了吗？

## 动态代理

### JDK 动态代理

于是乎 cxuan 上网求助，发现了一个叫做动态代理的概念，通读了一下，发现有点意思，于是乎 cxuan 修改了一下静态代理的代码，新增了一个 `UserHandler` 的用户代理，并做了一下 `test`，代码如下

```java
public class UserHandler implements InvocationHandler {

    private UserDao userDao;

    public UserHandler(UserDao userDao){
        this.userDao = userDao;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        saveUserStart();
        Object obj = method.invoke(userDao, args);
        saveUserDone();
        return obj;
    }

    public void saveUserStart(){
        System.out.println("---- 开始插入 ----");
    }

    public void saveUserDone(){
        System.out.println("---- 插入完成 ----");
    }
}
```

测试类如下

```java
public static void dynamicProxy(){

  UserDao userDao = new UserDaoImpl();
  InvocationHandler handler = new UserHandler(userDao);

  ClassLoader loader = userDao.getClass().getClassLoader();
  Class<?>[] interfaces = userDao.getClass().getInterfaces();

  UserDao proxy = (UserDao)Proxy.newProxyInstance(loader, interfaces, handler);
  proxy.saveUser();
}
```

`UserHandler` 是用户代理类，构造函数中的 UserDao 是真实对象，通过把 UserDao 隐藏进 UserHandler ，通过 UserHandler 中的 UserDao 执行真正的方法。

类加载器、接口数组你可以把它理解为一个方法树，每棵叶子结点都是一个方法，通过后面的 proxy.saveUser() 来告诉 JVM 执行的是方法树上的哪个方法。

用户代理是通过类加载器、接口数组、代理类来得到的。saveUser 方法就相当于是告诉 proxy 你最终要执行的是哪个方法，这个 proxy.saveUser 方法并不是最终直接执行的 saveUser 方法，最终的 saveUser 方法是由 UserHandler 中的 invoke 方法触发的。

上面这种在编译期无法确定最终的执行方法，而只能通过运行时动态获取方法的代理模式被称为 `动态代理`。

动态代理的优势是实现`无侵入式`的代码扩展，也可以对方法进行增强。此外，也可以大大减少代码量，避免代理类泛滥成灾的情况。

所以我们现在总结一下静态代理和动态代理各自的特点。

**静态代理**

- 静态代理类：由程序员创建或者由第三方工具生成，再进行编译；在程序运行之前，代理类的 .class 文件已经存在了。
- 静态代理事先知道要代理的是什么。
- 静态代理类通常只代理一个类。

**动态代理**

- 动态代理通常是在程序运行时，通过`反射机制`动态生成的。
- 动态代理类通常代理`接口`下的所有类。
- 动态代理事先不知道要代理的是什么，只有在运行的时候才能确定。
- 动态代理的调用处理程序必须事先继承 InvocationHandler 接口，使用 Proxy 类中的 newProxyInstance 方法动态的创建代理类。

在上面的代码示例中，我们是定义了一个 UserDao 接口，然后有 UserDaoImpl 接口的实现类，我们通过 Proxy.newProxyInstance 方法得到的也是 UserDao 的实现类对象，那么其实这是一种**基于接口的动态代理**。也叫做 `JDK 动态代理`。

>是不是只有这一种动态代理技术呢？既然都这么问了，那当然不是。

除此之外，还有一些其他代理技术，不过是需要加载额外的 jar 包的，那么我们汇总一下所有的代理技术和它的特征

* JDK 的动态代理使用简单，它内置在 JDK 中，因此不需要引入第三方 Jar 包。

* CGLIB 和 Javassist 都是高级的字节码生成库，总体性能比 JDK 自带的动态代理好，而且功能十分强大。
* ASM 是低级的字节码生成工具，使用 ASM 已经近乎于在使用字节码编程，对开发人员要求最高。当然，也是`性能最好`的一种动态代理生成工具。但 ASM 的使用很繁琐，而且性能也没有数量级的提升，与 CGLIB 等高级字节码生成工具相比，ASM 程序的维护性较差，如果不是在对性能有苛刻要求的场合，还是推荐 CGLIB 或者 Javassist。

下面我们就来依次介绍一下这些动态代理工具的使用

### CGLIB 动态代理

上面我们提到 JDK 动态代理是基于接口的代理，而 CGLIB 动态代理**是针对类实现代理，主要是对指定的类生成一个子类，覆盖其中的方法** ，也就是说 CGLIB 动态代理采用类继承 -> 方法重写的方式进行的，下面我们先来看一下 CGLIB 动态代理的结构。

![](http://www.cxuan.vip/image-20230203181632728.png)

如上图所示，代理类继承于目标类，每次调用代理类的方法都会在拦截器中进行拦截，拦截器中再会调用目标类的方法。

下面我们通过一个示例来演示一下 CGLIB 动态代理的使用

首先导入 CGLIB 相关 jar 包，我们使用的是 MAVEN 的方式

```xml
<dependency>
  <groupId>cglib</groupId>
  <artifactId>cglib</artifactId>
  <version>3.2.5</version>
</dependency>
```

然后我们新创建一个 UserService 类，为了和上面的 UserDao 和 UserDaoImpl 进行区分。

```java
public class UserService {
   public void saveUser(){
       System.out.println("---- 保存用户 ----");
   }
}
```

之后我们创建一个自定义方法拦截器，这个自定义方法拦截器实现了拦截器类

```java
public class AutoMethodInterceptor implements MethodInterceptor {

    public Object intercept(Object obj, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        System.out.println("---- 方法拦截 ----");
        Object object = methodProxy.invokeSuper(obj, args);
        return object;
    }
}
```

这里解释一下这几个参数都是什么含义

* Object obj: obj 是 CGLIB 动态生成代理类实例
* Method method: Method 为实体类所调用的被代理的方法引用
* Objectp[] args: 这个就是方法的参数列表
* MethodProxy methodProxy : 这个就是生成的代理类对方法的引用。

对于 `methodProxy` 参数调用的方法，在其内部有两种选择：`invoke()` 和 `invokeSuper()` ，二者的区别不在本文展开说明，感兴趣的读者可以参考本篇文章：[Cglib源码分析 invoke和invokeSuper的差别](https://blog.csdn.net/makecontral/article/details/79593732?utm_medium=distribute.pc_relevant.none-task-blog-baidulandingword-4&spm=1001.2101.3001.4242)

然后我们创建一个测试类进行测试

```java
public static void main(String[] args) {

  Enhancer enhancer = new Enhancer();
  enhancer.setSuperclass(UserService.class);
  enhancer.setCallback(new AutoMethodInterceptor());

  UserService userService = (UserService)enhancer.create();

  userService.saveUser();
}
```

测试类主要涉及 `Enhancer` 的使用，Enhancer 是一个非常重要的类，它允许为`非接口类型`创建一个 Java 代理，Enhancer 动态的创建给定类的子类并且拦截代理类的所有的方法，和 JDK 动态代理不一样的是不管是接口还是类它都能正常工作。

JDK 动态代理与 CGLIB 动态代理都是将真实对象`隐藏`在代理对象的后面，以达到 `代理` 的效果。与 JDK 动态代理所不同的是 CGLIB 动态代理使用 Enhancer 来创建代理对象，而 JDK 动态代理使用的是 Proxy.newProxyInstance 来创建代理对象；还有一点是 CGLIB 可以代理大部分类，而 JDK 动态代理只能代理实现了接口的类。

### Javassist 代理

`Javassist`是在 Java 中编辑字节码的类库；它使 Java 程序能够在运行时定义一个新类, 并在 JVM 加载时修改类文件。我们使用最频繁的动态特性就是 `反射`，而且反射也是动态代理的基础，我们之所以没有提反射对动态代理的作用是因为我想在后面详聊，反射可以在运行时查找对象属性、方法，修改作用域，通过方法名称调用方法等。实时应用不会频繁使用反射来创建，因为反射开销比较大，另外，还有一种具有和反射一样功能强大的特性那就是 `Javaassist`。

我们先通过一个简单的示例来演示一下 Javaassist ，以及 Javaassist 如何创建动态代理。

>我们仍旧使用上面提到的 UserDao 和 UserDaoImpl 作为基类。

我们新创建一个 AssistByteCode 类，它里面有一个 createByteCode 方法，这个方法主要做的事情就是通过字节码生成 UserDaoImpl 实现类。我们下面来看一下它的代码

```java
public class AssistByteCode {

    public static void createByteCode() throws Exception{
        ClassPool classPool = ClassPool.getDefault();
        CtClass cc = classPool.makeClass("com.cxuan.proxypattern.UserDaoImpl");

        // 设置接口
        CtClass ctClass = classPool.get("com.cxuan.proxypattern.UserDao");
        cc.setInterfaces(new CtClass[] {ctClass});

        // 创建方法
        CtMethod saveUser = CtMethod.make("public void saveUser(){}", cc);
        saveUser.setBody("System.out.println(\"---- 插入用户 ----\");");
        cc.addMethod(saveUser);

        Class c = cc.toClass();
        cc.writeFile("/Users/mr.l/cxuan-justdoit");

    }
}
```

> 由于本文并不是一个具体研究 Javaassist 的文章，所以我们不会过多研究细节问题，只专注于这个框架一些比较重要的类

`ClassPool`：ClassPool 就是一个 CtClass 的容器，而一个 `CtClass` 对象就是一个 class 对象的实例，这个实例和 class 对象一样，包含属性、方法等。

那么上面代码主要做了哪些事儿呢？通过 ClassPool 来获取 CtClass 所需要的接口、抽象类的 CtClass 实例，然后通过 CtClass 实例添加自己的属性和方法，并通过它的 writeFile 把二进制流输出到当前项目的根目录路径下。writeFile 其内部是使用了 `DataOutputStream` 进行输出的。

流写完后，我们打开这个 `.class` 文件如下所示

![](http://www.cxuan.vip/image-20230203181644484.png)

```java
public class UserDaoImpl implements UserDao {
    public void saveUser() {
        System.out.println("---- 插入用户 ----");
    }

    public UserDaoImpl() {
    }
}
```

可以对比一下上面发现 UserDaoImpl 发现编译器除了为我们添加了一个公有的构造器，其他基本一致。

![](http://www.cxuan.vip/image-20230203181653950.png)

经过这个简单的示例后，cxuan 给你演示一下如何使用 Javaassist 动态代理。

首先我们先创建一个 Javaassist 的代理工厂，代码如下

```java
public class JavaassistProxyFactory {

    public Object getProxy(Class clazz) throws Exception{

        // 代理工厂
        ProxyFactory proxyFactory = new ProxyFactory();
        // 设置需要创建的子类
        proxyFactory.setSuperclass(clazz);
        proxyFactory.setHandler((self, thisMethod, proceed, args) -> {

            System.out.println("---- 开始拦截 ----");
            Object result = proceed.invoke(self, args);
            System.out.println("---- 结束拦截 ----");

            return result;
        });
        return proxyFactory.createClass().newInstance();

    }
}
```

上面我们定义了一个代理工厂，代理工厂里面创建了一个 handler，在调用目标方法时，Javassist 会回调 MethodHandler 接口方法拦截，来调用真正执行的方法，你可以在拦截方法的前后实现自己的业务逻辑。最后的 **proxyFactory.createClass().newInstance()** 就是使用字节码技术来创建了最终的子类实例，这种代理方式类似于 JDK 中的 InvocationHandler 接口。

测试方法如下

```java
public static void main(String[] args) throws Exception {

  JavaassistProxyFactory proxyFactory = new JavaassistProxyFactory();
  UserService userProxy = (UserService) proxyFactory.getProxy(UserService.class);
  userProxy.saveUser();
}
```

### ASM 代理

ASM 是一套 Java 字节码生成架构，它可以动态生成二进制格式的子类或其它代理类，或者在类被 Java 虚拟机装入内存之前，动态修改类。

下面我们使用 ASM 框架实现一个动态代理，ASM 生成的动态代理

以下代码摘自 https://blog.csdn.net/lightj1996/article/details/107305662

```java
public class AsmProxy extends ClassLoader implements Opcodes {

    public static void createAsmProxy() throws Exception {

        // 目标类类名 字节码中类修饰符以 “/” 分割
        String targetServiceName = TargetService.class.getName().replace(".", "/");
        // 切面类类名
        String aspectServiceName = AspectService.class.getName().replace(".", "/");
        // 代理类类名
        String proxyServiceName = targetServiceName+"Proxy";
        // 创建一个 classWriter 它是继承了ClassVisitor
        ClassWriter classWriter = new ClassWriter(0);
        // 访问类 指定jdk版本号为1.8, 修饰符为 public，父类是TargetService
        classWriter.visit(Opcodes.V1_8, Opcodes.ACC_PUBLIC, proxyServiceName, null, targetServiceName, null);
        // 访问目标类成员变量 为类添加切面属性 “private TargetService targetService”
        classWriter.visitField(ACC_PRIVATE, "targetService", "L" + targetServiceName+";", null, null);
        // 访问切面类成员变量 为类添加目标属性 “private AspectService aspectService”
        classWriter.visitField(ACC_PRIVATE, "aspectService", "L" + aspectServiceName+";", null, null);

        // 访问默认构造方法 TargetServiceProxy()
        // 定义函数 修饰符为public 方法名为 <init>， 方法表述符为()V 表示无参数，无返回参数
        MethodVisitor initVisitor = classWriter.visitMethod(ACC_PUBLIC, "<init>", "()V", null, null);
        // 从局部变量表取第0个元素 “this”
        initVisitor.visitVarInsn(ALOAD, 0);
        // 调用super 的构造方法 invokeSpecial在这里的意思是调用父类方法
        initVisitor.visitMethodInsn(INVOKESPECIAL, targetServiceName, "<init>", "()V", false);
        // 方法返回
        initVisitor.visitInsn(RETURN);
        // 设置最大栈数量，最大局部变量表数量
        initVisitor.visitMaxs(1, 1);
        // 访问结束
        initVisitor.visitEnd();

        // 创建有参构造方法 TargetServiceProxy(TargetService var1, AspectService var2)
        // 定义函数 修饰符为public 方法名为 <init>， 方法表述符为(TargetService, AspectService)V 表示无参数，无返回参数
        MethodVisitor methodVisitor = classWriter.visitMethod(ACC_PUBLIC, "<init>", "(L" + targetServiceName + ";L"+aspectServiceName+";)V", null, null);
        // 从局部变量表取第0个元素 “this”压入栈顶
        methodVisitor.visitVarInsn(ALOAD, 0);
        // this出栈 , 调用super 的构造方法 invokeSpecial在这里的意思是调用父类方法。 <init>的owner是AspectService, 无参无返回类型
        methodVisitor.visitMethodInsn(INVOKESPECIAL, targetServiceName, "<init>", "()V", false);
        // 从局部变量表取第0个元素 “this”压入栈顶
        methodVisitor.visitVarInsn(ALOAD, 0);
        // 从局部变量表取第1个元素 “targetService”压入栈顶
        methodVisitor.visitVarInsn(ALOAD, 1);
        // this 和 targetService 出栈, 调用targetService put 赋值给this.targetService
        methodVisitor.visitFieldInsn(PUTFIELD, proxyServiceName, "targetService", "L" + targetServiceName + ";");
        // 从局部变量表取第0个元素 “this”压入栈顶
        methodVisitor.visitVarInsn(ALOAD, 0);
        // 从局部变量表取第2个元素 “aspectService”压入栈顶
        methodVisitor.visitVarInsn(ALOAD, 2);
        // this 和 aspectService 出栈 将 targetService put 赋值给this.aspectService
        methodVisitor.visitFieldInsn(PUTFIELD, proxyServiceName, "aspectService", "L" + aspectServiceName + ";");
        // 方法返回
        methodVisitor.visitInsn(RETURN);
        // 设置最大栈数量，最大局部变量表数量
        methodVisitor.visitMaxs(2, 3);
        // 方法返回
        methodVisitor.visitEnd();

        // 创建代理方法 修饰符为public，方法名为 demoQuest
        MethodVisitor visitMethod = classWriter.visitMethod(ACC_PUBLIC, "demoQuest", "()I", null, null);
        // 从局部变量表取第0个元素 “this”压入栈顶
        visitMethod.visitVarInsn(ALOAD, 0);
        // this 出栈 将this.aspectService压入栈顶
        visitMethod.visitFieldInsn(GETFIELD, proxyServiceName, "aspectService", "L"+aspectServiceName+";");
        // 取栈顶元素出栈 也就是targetService 调用其preOperation方法， demoQuest的owner是AspectService, 无参无返回类型
        visitMethod.visitMethodInsn(INVOKEVIRTUAL, aspectServiceName,"preOperation", "()V", false);
        // 从局部变量表取第0个元素 “this”压入栈顶
        visitMethod.visitVarInsn(ALOAD, 0);
        // this 出栈, 取this.targetService压入栈顶
        visitMethod.visitFieldInsn(GETFIELD, proxyServiceName, "targetService", "L"+targetServiceName+";");
        // 取栈顶元素出栈 也就是targetService调用其demoQuest方法, demoQuest的owner是TargetService, 无参无返回类型
        visitMethod.visitMethodInsn(INVOKEVIRTUAL, targetServiceName, "demoQuest", "()I", false);
        // 方法返回
        visitMethod.visitInsn(IRETURN);
        // 设置最大栈数量，最大局部变量表数量
        visitMethod.visitMaxs(1, 1);
        // 方法返回
        visitMethod.visitEnd();

        // 生成字节码二进制流
        byte[] code = classWriter.toByteArray();
        // 自定义classloader加载类
        Class<?> clazz = (new AsmProxy()).defineClass(TargetService.class.getName() + "Proxy", code, 0, code.length);
        // 取其带参数的构造方法
        Constructor constructor = clazz.getConstructor(TargetService.class, AspectService.class);
        // 使用构造方法实例化对象
        Object object = constructor.newInstance(new TargetService(), new AspectService());

        // 使用TargetService类型的引用接收这个对象
        TargetService targetService;
        if (!(object instanceof TargetService)) {
            return;
        }
        targetService = (TargetService)object;

        System.out.println("生成代理类的名称: " + targetService.getClass().getName());
        // 调用被代理方法
        targetService.demoQuest();

        // 这里可以不用写, 但是如果想看最后生成的字节码长什么样子，可以写 "ascp-purchase-app/target/classes/"是我的根目录, 阅读者需要将其替换成自己的
        String classPath = "/Users/mr.l/cxuan-justdoit/";
        String path = classPath + proxyServiceName + ".class";
        FileOutputStream fos =
                new FileOutputStream(path);
        fos.write(code);
        fos.close();

    }
}
```

使用 ASM 生成动态代理的代码比较长，上面这段代码的含义就是生成类 TargetServiceProxy，用于代理TargetService ，在调用 targetService.demoQuest() 方法之前调用切面的方法 aspectService.preOperation();

测试类就直接调用 AsmProxy.createAsmProxy() 方法即可，比较简单。

下面是我们生成 TargetServiceProxy 的目标类

![](http://www.cxuan.vip/image-20230203181704181.png)

> 至此，我们已经介绍了四种动态代理的方式，分别是**JDK 动态代理、CGLIB 动态代理、Javaassist 动态代理、ASM 动态代理**，那么现在思考一个问题，为什么会有动态代理的出现呢？或者说动态代理是基于什么原理呢？

其实我们上面已经提到过了，没错，动态代理使用的就是`反射` 机制，反射机制是 Java 语言提供的一种基础功能，􏱥􏱩赋予程序在运行时动态修改属性、方法的能力。通过反射我们能够直接操作类或者对象，比如获取某个类的定义，获取某个类的属性和 方法等。

关于 Java 反射的相关内容可以参考 Java建设者的这一篇文章 

[精讲 Java 反射](https://github.com/crisxuan/bestJavaer/blob/master/java-basic/java-reflect.md)

另外还有需要注意的一点，从性能角度来讲，有些人得出结论说是 Java 动态代理要比 CGLIB 和 Javaassist 慢几十倍，其实，在主流 JDK 版本中，Java 动态代理可以提供相等的性能水平，**数量级的差距不是广泛存在的**。而且，在现代 JDK 中，反射已经得到了改进和优化。

我们在选型中，性能考量并不是主要关注点，**可靠性、可维护性、编码工作量**同等重要。

如果你在阅读文章的过程中发现错误和问题，请及时与我联系！

如果文章对你有帮助，希望小伙伴们三连走起！

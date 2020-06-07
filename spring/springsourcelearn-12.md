@[TOC]
> 在上篇文章中我们已经对ApplicationContext的一部分内容做了介绍，ApplicationContext主要具有以下几个核心功能：
>
> 1. 国际化
> 2. 借助Environment接口，完成了对Spring运行环境的抽象，可以返回环境中的属性，并能出现出现的占位符
> 3. 借助于Resource系列接口，完成对底层资源的访问及加载
> 4. 继承了ApplicationEventPublisher接口，能够进行事件发布监听
> 5. 负责创建、配置及管理Bean
>
> 在上篇文章我们已经分析学习了1，2两点，这篇文章我们继续之前的学习

@[TOC]
# 1、Spring的资源（Resource）

首先需要说明的是，Spring并没有让ApplicationContext直接继承Resource接口，就像ApplicationContext接口也没有直接继承Environment接口一样。这应该也不难理解，采用这种组合的方式会让我们的类更加的轻量，也起到了解耦的作用。ApplicationContext跟Resource相关的接口的继承关系如下

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200317234931371.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

不管是ResourceLoader还是ResourcePatternResolver其实都是为了获取Resource对象，不过ResourcePatternResolver在ResourceLoader的基础上扩展了一个获取多个Resource的方法，我们在后文会介绍。

## 接口简介

Resouce接口继承了 InputStreamSource.

```java
public interface InputStreamSource {
    // 每次调用都将返回一个当前资源对应的java.io. InputStream字节流
    InputStream getInputStream() throws IOException;
}
```

```java
public interface Resource extends InputStreamSource {  

	// 用于判断对应的资源是否真的存在
	boolean exists();

	// 用于判断对应资源的内容是否可读。需要注意的是当其结果为true的时候，其内容未必真的可读，但如果返回false，则其内容必定不可读
	default boolean isReadable() {
		return exists();
	}

	// 用于判断当前资源是否代表一个已打开的输入流，如果结果为true，则表示当前资源的输入流不可多次读取，而且在读取以后需要对它进行关闭，以防止内存泄露。该方法主要针对于实现类InputStreamResource，实现类中只有它的返回结果为true，其他都为false。
	default boolean isOpen() {
		return false;
	}
	
    // 当前资源是否是一个文件
	default boolean isFile() {
		return false;
	}

	//当前资源对应的URL。如果当前资源不能解析为一个URL则会抛出异常
	URL getURL() throws IOException;

	//当前资源对应的URI。如果当前资源不能解析为一个URI则会抛出异常
	URI getURI() throws IOException;

	// 返回当前资源对应的File。如果当前资源不能以绝对路径解析为一个File则会抛出异常。
	File getFile() throws IOException;

	// 返回一个ReadableByteChannel
	default ReadableByteChannel readableChannel() throws IOException {
		return Channels.newChannel(getInputStream());
	}

	//  返回资源的长度
	long contentLength() throws IOException;

	// 最后修改时间
	long lastModified() throws IOException;

	// 根据当前资源以及相对当前资源的路径创建一个新的资源，比如当前Resource代表文件资源“d:/abc/a.java”,则createRelative（“xyz.txt”）将返回表文件资源“d:/abc/xyz.txt”
	Resource createRelative(String relativePath) throws IOException;

	// 返回文件一个文件名称，通常来说会返回该资源路径的最后一段
	@Nullable
	String getFilename();

	// 返回描述信息
	String getDescription();
}
```

## UML类图

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200317234805560.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

因为实现了Resource接口的类很多，并且一些类我们也不常用到或者很简单，所以上图中省略了一些不重要的分支，接下来我们就一个个分析。

### 抽象基类AbstractResource

实现了Resource接口，是大多数Resource的实现类的基类，提供了很多通用的方法。
比如exists方法会检查是否一个文件或者输入流能够被打开。isOpen永远返回false。”getURL()” 和”getFile()”方法会抛出异常。toString将会返回描述信息。

### FileSystemResource

基于java的文件系统封装而成的一个资源对象。

### AbstractFileResolvingResource

将URL解析成文件引用，既会处理协议为：“file“的URL，也会处理JBoss的”vfs“协议。然后相应的解析成对应的文件系统引用。

### ByteArrayResource

根据一个给定的字节数组构建的一个资源。同时给出一个对应的输入流

### BeanDefinitionResource

只是对BeanDefinition进行的一次描述性的封装

### InputStreamResource

是针对于输入流封装的资源，它的构建需要一个输入流。 对于“getInputStream ”操作将直接返回该字节流，因此只能读取一次该字节流，即“isOpen”永远返回true。

### UrlResource

UrlResource代表URL资源，用于简化URL资源访问。
UrlResource一般支持如下资源访问：
-http：通过标准的http协议访问web资源，如new UrlResource(“http://地址”)；
-ftp：通过ftp协议访问资源，如new UrlResource(“ftp://地址”)；
-file：通过file协议访问本地文件系统资源，如new UrlResource(“file:d:/test.txt”)；

### ClassPathResource

JDK获取资源有两种方式

1. 使用Class对象的getResource(String path)获取资源URL，getResourceAsStream(String path)获取资源流。 参数既可以是当前class文件相对路径（以文件夹或文件开头），也可以是当前class文件的绝对路径（以“/”开头,相对于当前classpath根目录）
2. 使用ClassLoader对象的getResource(String path)获取资源URL，getResourceAsStream(String path)获取资源流。参数只能是绝对路径，但不以“/”开头

ClassPathResource代表classpath路径的资源，将使用给定的Class或ClassLoader进行加载classpath资源。 “isOpen”永远返回false，表示可多次读取资源。

### ServletContextResource

是针对于ServletContext封装的资源，用于访问ServletContext环境下的资源。ServletContextResource持有一个ServletContext的引用，其底层是通过ServletContext的getResource()方法和getResourceAsStream()方法来获取资源的。

## ResourceLoader

### 接口简介

ResourceLoader接口被设计用来从指定的位置加载一个Resource,其接口定义如下

```java
public interface ResourceLoader {
	
    // classpath:
	String CLASSPATH_URL_PREFIX = ResourceUtils.CLASSPATH_URL_PREFIX;
	
    // 核心方法，从指定位置加载一个Resource
    // 1.支持权限的的URL格式，如：file:C:/test.dat
    // 2.支持classpath的格式,如：classpath:test.dat
    // 3.支持文件相对路径，如：WEB-INF/test.dat
	Resource getResource(String location);
	
    // 返回用于加载该资源的ClassLoader
	@Nullable
	ClassLoader getClassLoader();

}

```

### UML类图

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200317234817867.png)

对于一些不是很必要的类我都省略了，其实核心的类我们只需要关注`DefaultResourceLoader`就可以了，因为其余子类（除了`GenericApplicationContext`）都是直接继承了`DefaultResourceLoader`的`getResource`方法。代码如下：

```java
	@Override
	public Resource getResource(String location) {
		Assert.notNull(location, "Location must not be null");
		
        // 正常来说protocolResolvers集合是空的，除非我们调用了它的addProtocolResolver方法添加了自定义协议处理器，调用addProtocolResolver方法所添加的协议处理器会覆盖原有的处理逻辑
		for (ProtocolResolver protocolResolver : this.protocolResolvers) {
			Resource resource = protocolResolver.resolve(location, this);
			if (resource != null) {
				return resource;
			}
		}
		
        // 如果是以“/”开头，直接返回一个classpathResource
		if (location.startsWith("/")) {
			return getResourceByPath(location);
		}
        // 如果是形如：classpath:test.dat也直接返回一个ClassPathResource
		else if (location.startsWith(CLASSPATH_URL_PREFIX)) {
			return new ClassPathResource(location.substring(CLASSPATH_URL_PREFIX.length()), getClassLoader());
		}
		else {
			try {
				// 否则将其解析为一个URL
				URL url = new URL(location);
                // 如果是一个文件，直接返回一个FileUrlResource，否则返回一个普通的UrlResource
				return (ResourceUtils.isFileURL(url) ? new FileUrlResource(url) : new UrlResource(url));
			}
			catch (MalformedURLException ex) {
				// 如果URL转换失败，还是作为一个普通的ClassPathResource
				return getResourceByPath(location);
			}
		}
	}
```

### 资源路径

#### ant-style

类似下面这种含有通配符的路径

```xml
/WEB-INF/*-context.xml
com/mycompany/**/applicationContext.xml
file:C:/some/path/*-context.xml
classpath:com/mycompany/**/applicationContext.xml
```

#### classpath跟classpath*

classpath:用于加载类路径（包括jar包）中的一个且仅一个资源；

classpath*:用于加载类路径（包括jar包）中的所有匹配的资源，可使用Ant路径模式。

# 2、Spring中的事件监听机制（publish-event）

我们知道，ApplicationContext接口继承了ApplicationEventPublisher接口，能够进行事件发布监听，那么什么是事件的发布跟监听呢？我们从监听者模式说起

### 监听者模式

#### 概念

事件源经过事件的封装传给监听器，当事件源触发事件后，监听器接收到事件对象可以回调事件的方法

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200317234830949.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

#### Spring对监听者模式的实践

我们直接通过一个例子来体会下

```java
public class Main {
	public static void main(String[] args) {
		// 创建一个事件发布器（事件源），为了方便，我这里直接通过传入EventListener.class来将监听器注册到容器中
		ApplicationEventPublisher ac = new AnnotationConfigApplicationContext(EventListener.class);
		// 发布一个事件
		ac.publishEvent(new MyEvent("hello event"));
		// 程序会打印如下：
        // 接收到事件：hello event
		// 处理事件....
	}

	static class MyEvent extends ApplicationEvent {
		public MyEvent(Object source) {
			super(source);
		}
	}

	@Component
	static class EventListener implements ApplicationListener<MyEvent> {
		@Override
		public void onApplicationEvent(MyEvent event) {
			System.out.println("接收到事件：" + event.getSource());
			System.out.println("处理事件....");
		}
	}
}
```

在上面的例子中，主要涉及到了三个角色，也就是我们之前提到的

1. 事件源：ApplicationEventPublisher
2. 事件：MyEvent，继承了ApplicationEvent
3. 事件监听器：EventListener，实现了ApplicationListener

我们通过ApplicationEventPublisher发布了一个事件（MyEvent），然后事件监听器监听到了事件，并进行了对应的处理。

#### 接口简介

##### ApplicationEventPublisher

```java
public interface ApplicationEventPublisher {
	
	default void publishEvent(ApplicationEvent event) {
		publishEvent((Object) event);
	}
	
    // 从版本4.2后新增的方法
    // 调用这个方法发布的事件不需要实现ApplicationEvent接口，会被封装成一个PayloadApplicationEvent
    // 如果event实现了ApplicationEvent接口，则会正常发布
	void publishEvent(Object event);

}
```

对于这个接口，我只需要关注有哪些子类是实现了`publishEvent(Object event)`这个方法即可。搜索发现，我们只需要关注`org.springframework.context.support.AbstractApplicationContext#publishEvent(java.lang.Object)`这个方法即可，关于这个方法在后文的源码分析中我们再详细介绍。

##### ApplicationEvent

继承关系如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200317234850107.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

我们主要关注上面4个类（*PayloadApplicationEvent*在后文源码分析时再介绍），下面几个都是Spring直接在内部使用到了的事件，比如ContextClosedEvent，在容器关闭时会被创建然后发布。

```java
// 这个类在设计时是作为整个应用内所有事件的基类，之所以被设计成抽象类，是因为直接发布这个对象没有任何意义
public abstract class ApplicationEvent extends EventObject {
	
    // 事件创建的事件
	private final long timestamp;

	public ApplicationEvent(Object source) {
		super(source);
		this.timestamp = System.currentTimeMillis();
	}

	public final long getTimestamp() {
		return this.timestamp;
	}

}

// 这个类是java的util包下的一个类，java本身也具有一套事件机制
public class EventObject implements java.io.Serializable {
	
    // 事件所发生的那个源，比如在java中，我们发起了一个鼠标点击事件，那么这个source就是鼠标
    protected transient Object  source;

    public EventObject(Object source) {
        if (source == null)
            throw new IllegalArgumentException("null source");
        this.source = source;
    }

    public Object getSource() {
        return source;
    }

    public String toString() {
        return getClass().getName() + "[source=" + source + "]";
    }
}

// 这个类是2.5版本时增加的一个类，相对于它直接的父类ApplicationEvent而言，最大的区别就是
// 将source规定为了当前的容器。就目前而言的话这个类作用不大了，一般情况下我们定义事件也不一定需要继承这个ApplicationContextEvent
// 后面我会介绍注解的方式进行事件的发布监听
public abstract class ApplicationContextEvent extends ApplicationEvent {

	public ApplicationContextEvent(ApplicationContext source) {
		super(source);
	}

	public final ApplicationContext getApplicationContext() {
		return (ApplicationContext) getSource();
	}

}

```

##### ApplicationListener

```java
// 事件监听器，实现了java.util包下的EventListener接口
public interface ApplicationListener<E extends ApplicationEvent> extends EventListener {

	// 根据接口申明的泛型类型处理对应的事件
    // 比如在我们之前的例子中，通过《EventListener implements ApplicationListener<MyEvent>》
    // 在接口中申明了泛型类型为MyEvent，所以能监听到MyEvent这一类事件
	void onApplicationEvent(E event);

}
```

#### 注解方式实现事件发布机制

在上面的例子中，我们通过传统的方式实现了事件的发布监听，但是上面的过程实在是有点繁琐，我们发布的事件需要实现指定的接口，在进行监听时又需要实现指定的接口。每增加一个发布的事件，代表我们需要多两个类。这样在项目的迭代过程中，会导致我们关于事件的类越来越多。所以，在Spring4.2版本后，新增一个注解，让我们可以快速的实现对发布的事件的监听。示例代码如下：

```java
@ComponentScan("com.dmz.official.event")
public class Main02 {
	public static void main(String[] args) {
		ApplicationEventPublisher publisher = new AnnotationConfigApplicationContext(Main02.class);
		publisher.publishEvent(new Event("注解事件"));
        // 程序打印：
        // 接收到事件:注解事件
        // 处理事件
	}

	static class Event {
		String name;

		Event(String name) {
			this.name = name;
		}

		@Override
		public String toString() {
			return name;
		}
	}

	@Component
	static class Listener {
		@EventListener
		public void listen(Event event) {
			System.out.println("接收到事件:" + event);
			System.out.println("处理事件");
		}
	}
}
```

可以看到在上面的例子中，我们使用一个`@EventListener`注解，直接标注了Listener类中的一个方法是一个事件监听器，并且通过方法的参数类型Event指定了这个监听器监听的事件类型为Event类型。在这个例子中，第一，我们事件不需要去继承特定的类，第二，我们的监听器也不需要去实现特定的接口，极大的方便了我们的开发。

#### 异步的方式实现事件监听

对于上面的例子，我们只需要按下面这种方式添加两个注解即可实现异步：

```java
@ComponentScan("com.dmz.official.event")
@Configuration
@EnableAsync  // 1.开启异步支持
public class Main02 {
	public static void main(String[] args) {
		AnnotationConfigApplicationContext publisher = new AnnotationConfigApplicationContext(Main02.class);
		publisher.publishEvent(new Event("注解事件"));
	}

	static class Event {
		String name;

		Event(String name) {
			this.name = name;
		}

		@Override
		public String toString() {
			return name;
		}
	}

	@Component
	static class Listener {
		@EventListener
		@Async
        // 2.标志这个方法需要异步执行
		public void listen(Event event) {
			System.out.println("接收到事件:" + event);
			System.out.println("处理事件");
		}
	}
}
```

对于上面的两个注解`@EnableAsync `以及`@Async`，我会在AOP系列的文章中再做介绍，目前而言，大家知道能通过这种方式开启异步支持即可。

#### 对监听器进行排序

当我们发布一个事件时，可能会同时被两个监听器监听到，比如在我们上面的例子中如果同时存在两个监听器，如下：

```java
@Component
static class Listener {
    @EventListener
    public void listen1(Event event) {
        System.out.println("接收到事件1:" + event);
        System.out.println("处理事件");
    }

    @EventListener
    public void listen2(Event event) {
        System.out.println("接收到事件2:" + event);
        System.out.println("处理事件");
    }
}
```

在这种情况下，我们可能希望两个监听器可以按顺序执行，这个时候需要用到另外一个注解了:`@Order`

还是上面的代码，我们添加注解如下：

```java
@Component
static class Listener {
    @EventListener
    @Order(2)
    public void listen1(Event event) {
        System.out.println("接收到事件1:" + event);
        System.out.println("处理事件");
    }

    @EventListener
    @Order(1)
    public void listen2(Event event) {
        System.out.println("接收到事件2:" + event);
        System.out.println("处理事件");
    }
}
```

注解中的参数越小，代表优先级越高，在上面的例子中，会执行listen2方法再执行listen1方法

------

那么Spring到底是如何实现的这一套事件发布机制呢？接下来我们进行源码分析

#### 源码分析（publishEvent方法）

我们需要分析的代码主要是`org.springframework.context.support.AbstractApplicationContext#publishEvent(java.lang.Object, org.springframework.core.ResolvableType)方法`，源码如下：

```java
protected void publishEvent(Object event, @Nullable ResolvableType eventType) {
    Assert.notNull(event, "Event must not be null");

    // 如果发布的事件是一个ApplicationEvent，直接发布
    ApplicationEvent applicationEvent;
    if (event instanceof ApplicationEvent) {
        applicationEvent = (ApplicationEvent) event;
    }
    else {
        // 如果发布的事件不是一个ApplicationEvent，包装成一个PayloadApplicationEvent
        applicationEvent = new PayloadApplicationEvent<>(this, event);
        // 我们在应用程序中发布事件时，这个eventType必定为null
        if (eventType == null) {
            // 获取对应的事件类型
            eventType = ((PayloadApplicationEvent) applicationEvent).getResolvableType();
        }
    }
    // 我们在自己的项目中调用时，这个earlyApplicationEvents必定为null
    if (this.earlyApplicationEvents != null) {
        this.earlyApplicationEvents.add(applicationEvent);
    }
    else {
        // 获取事件发布器，发布对应的事件
        getApplicationEventMulticaster().multicastEvent(applicationEvent, eventType);
    }

    // 父容器中也需要发布事件
    if (this.parent != null) {
        if (this.parent instanceof AbstractApplicationContext) {
            ((AbstractApplicationContext) this.parent).publishEvent(event, eventType);
        }
        else {
            this.parent.publishEvent(event);
        }
    }
}
```

上面这段代码核心部分就是`getApplicationEventMulticaster().multicastEvent(applicationEvent, eventType);`，我们分成以下几个部分分析

- getApplicationEventMulticaster()方法
- multicastEvent()方法

##### getApplicationEventMulticaster()方法

代码如下：

```java
ApplicationEventMulticaster getApplicationEventMulticaster() throws IllegalStateException {
    if (this.applicationEventMulticaster == null) {
        throw new IllegalStateException("ApplicationEventMulticaster not initialized - " +
                                        "call 'refresh' before multicasting events via the context: " + this);
    }
    return this.applicationEventMulticaster;
}
```

可以看到，只是简单的获取容器中已经初始化好的一个`ApplicationEventMulticaster`，那么现在有以下几问题。

###### 1、ApplicationEventMulticaster是什么？

- 接口定义

```java
public interface ApplicationEventMulticaster {
	// 添加事件监听器
	void addApplicationListener(ApplicationListener<?> listener);

	// 通过名称添加事件监听器
	void addApplicationListenerBean(String listenerBeanName);

	// 移除事件监听器
	void removeApplicationListener(ApplicationListener<?> listener);

	// 根据名称移除事件监听器
	void removeApplicationListenerBean(String listenerBeanName);

	// 移除注册在这个事件分发器上的所有监听器
	void removeAllListeners();

	// 分发事件
	void multicastEvent(ApplicationEvent event);

	// 分发事件，eventType代表事件类型，如果eventType为空，会从事件对象中推断出事件类型
	void multicastEvent(ApplicationEvent event, @Nullable ResolvableType eventType);

}
```

- UML类图

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200317234903765.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)



主要涉及到两个类：

1. `AbstractApplicationEventMulticaster`,这个类对`ApplicationEventMulticaster`这个接口基础方法做了实现，除了其核心方法`multicastEvent`。这个类最大的作用是获取监听器，稍后我们会介绍。
2. `SimpleApplicationEventMulticaster`,这是Spring默认提供的一个事件分发器，如果我们没有进行特别的配置的话，就会采用这个类生成的对象作为容器的事件分发器。

###### 2、容器在什么时候对其进行的初始化

回到我们之前的一张图

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200317234913778.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

可以看到，在第`3-8`步调用了一个`initApplicationEventMulticaster`方法，从名字上我们就知道，这是对`ApplicationEventMulticaster`进行初始化的，我们看看这个方法做了什么。

- initApplicationEventMulticaster方法

```java
protected void initApplicationEventMulticaster() {
    ConfigurableListableBeanFactory beanFactory = getBeanFactory();
    // 判断容器中是否包含了一个名为applicationEventMulticaster的ApplicationEventMulticaster类的对象，如果包含，直接获取即可。
    if (beanFactory.containsLocalBean(APPLICATION_EVENT_MULTICASTER_BEAN_NAME)) {
        this.applicationEventMulticaster =
            beanFactory.getBean(APPLICATION_EVENT_MULTICASTER_BEAN_NAME, ApplicationEventMulticaster.class);
		// 删除不必要的日志
    }
    // 如果没有包含，new一个SimpleApplicationEventMulticaster并将其注册到容器中
    else {
        this.applicationEventMulticaster = new SimpleApplicationEventMulticaster(beanFactory);
        beanFactory.registerSingleton(APPLICATION_EVENT_MULTICASTER_BEAN_NAME, this.applicationEventMulticaster);
       // 删除不必要的日志
        }
    }
}
```

这段代码的含义就是告诉我们，可以自己配置一个applicationEventMulticaster，如果没有进行配置，那么将默认使用一个SimpleApplicationEventMulticaster。

接下来，我们尝试自己配置一个简单的applicationEventMulticaster，示例代码如下：

```java
@Component("applicationEventMulticaster")
static class MyEventMulticaster extends AbstractApplicationEventMulticaster {

    @Override
    @SuppressWarnings({"unchecked", "rawtypes"})
    public void multicastEvent(@NonNull ApplicationEvent event) {
        ResolvableType resolvableType = ResolvableType.forInstance(event);
        Collection<ApplicationListener<?>> applicationListeners = getApplicationListeners(event, resolvableType);
        for (ApplicationListener applicationListener : applicationListeners) {
            applicationListener.onApplicationEvent(event);
        }
    }

    @Override
    public void multicastEvent(ApplicationEvent event, ResolvableType eventType) {
        System.out.println("进入MyEventMulticaster");
    }
}
```

运行程序后会发现“进入MyEventMulticaster”这句话打印了两次，这是一次是容器启动时会发布一个ContextStartedEvent事件，也会调用我们配置的事件分发器进行事件发布。

##### multicastEvent方法

在Spring容器中，只内置了一个这个方法的实现类，就是SimpleApplicationEventMulticaster。实现的逻辑如下：

```java
public void multicastEvent(ApplicationEvent event) {
    multicastEvent(event, resolveDefaultEventType(event));
}

@Override
public void multicastEvent(final ApplicationEvent event, @Nullable ResolvableType eventType) {
    ResolvableType type = (eventType != null ? eventType : resolveDefaultEventType(event));
    for (final ApplicationListener<?> listener : getApplicationListeners(event, type)) {
        Executor executor = getTaskExecutor();
        if (executor != null) {
            executor.execute(() -> invokeListener(listener, event));
        }
        else {
            invokeListener(listener, event);
        }
    }
}
```

上面的代码主要的实现逻辑可以分为这么几步：

1. 推断事件类型
2. 根据事件类型获取对应的监听器
3. 执行监听逻辑

我们一步步分析

- resolveDefaultEventType(event)，推断事件类型

```java
private ResolvableType resolveDefaultEventType(ApplicationEvent event) {
    return ResolvableType.forInstance(event);
}

public static ResolvableType forInstance(Object instance) {
    Assert.notNull(instance, "Instance must not be null");
    if (instance instanceof ResolvableTypeProvider) {
        ResolvableType type = ((ResolvableTypeProvider) instance).getResolvableType();
        if (type != null) {
            return type;
        }
    }
    // 返回通过事件的class类型封装的一个ResolvableType
    return ResolvableType.forClass(instance.getClass());
}
```

上面的代码涉及到一个概念就是ResolvableType，对于ResolvableType我们需要了解的是，ResolvableType为所有的java类型提供了统一的数据结构以及API，换句话说，一个ResolvableType对象就对应着一种java类型。我们可以通过ResolvableType对象获取类型携带的信息（举例如下）：

1. getSuperType()：获取直接父类型
2. getInterfaces()：获取接口类型
3. getGeneric(int...)：获取类型携带的泛型类型
4. resolve()：Type对象到Class对象的转换

另外，ResolvableType的构造方法全部为私有的，我们不能直接new，只能使用其提供的静态方法进行类型获取：

1. forField(Field)：获取指定字段的类型
2. forMethodParameter(Method, int)：获取指定方法的指定形参的类型
3. forMethodReturnType(Method)：获取指定方法的返回值的类型
4. forClass(Class)：直接封装指定的类型
5. ResolvableType.forInstance 获取指定的实例的泛型信息

关于ResolvableType跟java中的类型中的关系请关注我的后续文章，限于篇幅原因在本文就不做过多介绍了。

- getApplicationListeners(event, type)，获取对应的事件监听器

事件监听器主要分为两种，一种是我们通过实现接口直接注册到容器中的Bean，例如下面这种

```java
@Component
static class EventListener implements ApplicationListener<MyEvent> {
    @Override
    public void onApplicationEvent(MyEvent event) {
        System.out.println("接收到事件：" + event.getSource());
        System.out.println("处理事件....");
    }
}
```

另外一个是通过注解的方式，就是下面这种

```java
@Component
static class Listener {
    @EventListener
    public void listen1(Event event) {
        System.out.println("接收到事件1:" + event);
        System.out.println("处理事件");
    }
}
```

对于实现接口的方式不用多说，因为实现了这个类本身就会被扫描然后加入到容器中。对于注解这种方式，Spring是通过一个回调方法实现的。大家关注下这个接口`org.springframework.beans.factory.SmartInitializingSingleton`,同时找到其实现类，`org.springframework.context.event.EventListenerMethodProcessor`。在这个类中，会先调用`afterSingletonsInstantiated`方法，然后调用一个`processBean`方法，在这个方法中会遍历所有容器中的所有Bean，然后遍历Bean中的每一个方法判断方法上是否加了一个`@EventListener`注解。如果添加了这个注解，会将这个Method方法包装成一个`ApplicationListenerMethodAdapter`，这个类本身也实现了`ApplicationListener`接口。之后在添加到监听器的集合中。

- invokeListener，执行监听逻辑

本身这个方法没有什么好说的了，就是调用了`ApplicationListener`中的`onApplicationEvent`方法，执行我们的业务逻辑。但是值得注意的是，在调用invokeListener方法前，会先进行一个判断

```java
Executor executor = getTaskExecutor();
if (executor != null) {
    executor.execute(() -> invokeListener(listener, event));
}
else {
    invokeListener(listener, event);
}
```

会先判断是否能获取到一个Executor，如果能获取到那么会通过这个Executor异步执行监听的逻辑。所以基于这段代码，我们可以不通过@Async注解实现对事件的异步监听，而是复写`SimpleApplicationEventMulticaster`这个类中的方法，如下：

```java
@Component("applicationEventMulticaster")
public class MyEventMulticaster extends SimpleApplicationEventMulticaster {
    @Override
    public Executor getTaskExecutor() {
        // 在这里创建自己的执行器
        return executor();
    }
}

```

相比于通过`@Async注解实现对事件的异步监听`我更加倾向于这种通过复写方法的方式进行实现，主要原因就是如果通过注解实现，那么所有加了这个注解的方法在异步执行都都是用的同一个线程池，这些加了注解的方法有些可能并不是进行事件监听的，这样显然是不合理的。而后面这种方式，我们可以确保创建的线程池是针对于事件监听的，甚至可以根据不同的事件类型路由到不同的线程池。这样更加合理。

# 3、总结

在这篇文章中，我们完成了对ApplicationContext中以下两点内容的学习

1. 借助于Resource系列接口，完成对底层资源的访问及加载
2. 实现事件的发布

对于整个ApplicationContext体系，目前来说还剩一个很大的功能没有涉及到。因为我们也知道ApplicationContext也继承了一系列的BeanFactory接口。所以它还会负责创建、配置及管理Bean。

BeanFactory本身也有一套自己的体系，在下篇文章中，我们就会学习BeanFactory相关的内容。虽然这一系列文章是以ApplicationContext命名的，但是其中的内容覆盖面很广，这些东西对于我们看懂Spring很重要。

希望大家跟我一起慢慢啃掉Spring，加油！共勉！

**扫描下方二维码，关注我的公众号，更多精彩文章在等您！~~**

![公众号](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9naXRlZS5jb20vd3hfY2MzNDdiZTY5Ni9ibG9nSW1hZ2UvcmF3L21hc3Rlci8lRTUlODUlQUMlRTQlQkMlOTclRTUlOEYlQjcuanBn?x-oss-process=image/format,png)
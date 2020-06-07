@[TOC]

> BeanWrapper是Spring中一个很重要的接口，Spring在通过配置信息创建对象时，第一步首先就是创建一个BeanWrapper。这篇文章我们就分析下这个接口，本文内容主要对应官网中的`3.3`及`3.4`小结

# 接口定义

```java
// Spring低级JavaBeans基础设施的中央接口。通常来说并不直接使用BeanWrapper，而是借助BeanFactory或者DataBinder来一起使用,BeanWrapper对Spring中的Bean做了包装，为的是更加方便的操作Bean中的属性
public interface BeanWrapper extends ConfigurablePropertyAccessor {
	
	void setAutoGrowCollectionLimit(int autoGrowCollectionLimit);
	int getAutoGrowCollectionLimit();

	// 获取包装的Bean
	Object getWrappedInstance();

	// 获取包装的Bean的class
	Class<?> getWrappedClass();

	// 获取所有属性的属性描述符
	PropertyDescriptor[] getPropertyDescriptors();

	// 获取指定属性的属性描述符
	PropertyDescriptor getPropertyDescriptor(String propertyName) throws InvalidPropertyException;

}
```

这里需要解释一个概念，什么是属性描述符？

> PropertyDescriptor：属性描述符，能够描述javaBean中的属性，通过属性描述符我们能知道这个属性的类型，获取到操纵属性的方法（getter/setter）

# 继承关系

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200331082200827.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)



BeanWrapper的子类只有一个：`BeanWrapperImpl`,它继承了`ConfigurablePropertyAccessor`，这个接口的主要功能是进行属性访问，同时它又有三个父接口，接下来我们一一分析他们的功能。

# 接口功能

## 1、PropertyEditorRegistry（属性编辑器注册器）

### 接口定义

```java
// 这个接口的功能很简单，就是用来注入属性编辑器（PropertyEditor），那么什么是PropertyEditor呢？
public interface PropertyEditorRegistry {

	void registerCustomEditor(Class<?> requiredType, PropertyEditor propertyEditor);

	void registerCustomEditor(@Nullable Class<?> requiredType, @Nullable String propertyPath, PropertyEditor propertyEditor);

	@Nullable
	PropertyEditor findCustomEditor(@Nullable Class<?> requiredType, @Nullable String propertyPath);

}
```

### PropertyEditor

#### 概念

> **PropertyEditor是JavaBean规范定义的接口**，这是`java.beans`中一个接口，**其设计的意图是图形化编程上**，方便对象与String之间的转换工作，而Spring将其扩展，方便各种对象与String之间的转换工作。

#### Spring中对PropertyEditor使用的实例

1. 我们在通过XML的方式对Spring中的Bean进行配置时，不管Bean中的属性是何种类型，都是直接通过字面值来设置Bean中的属性。那么是什么在这其中做转换呢？这里用到的就是PropertyEditor
2. SpringMVC在解析请求参数时，也是使用的PropertyEditor

#### Spring内置的PropertyEditor

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200331082212430.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

## 2、PropertyAccessor（属性访问器）

### 接口定义

```java
public interface PropertyAccessor {
	
    // 嵌套属性的分隔符,比如"foo.bar"将会调用getFoo().getBar()两个方法
	String NESTED_PROPERTY_SEPARATOR = ".";
	char NESTED_PROPERTY_SEPARATOR_CHAR = '.';

   // 代表角标index的符号  如person.addresses[0]  这样就可以把值放进集合/数组/Map里了
	String PROPERTY_KEY_PREFIX = "[";
	char PROPERTY_KEY_PREFIX_CHAR = '[';
	String PROPERTY_KEY_SUFFIX = "]";
	char PROPERTY_KEY_SUFFIX_CHAR = ']';

    // 该属性是否可读/可写，不存在则返回false
	boolean isReadableProperty(String propertyName);
	boolean isWritableProperty(String propertyName);
	
    // 获取/设置属性的方法，基本见名知意
	@Nullable
	Class<?> getPropertyType(String propertyName) throws BeansException;
	@Nullable
	TypeDescriptor getPropertyTypeDescriptor(String propertyName) throws BeansException;
	@Nullable
	Object getPropertyValue(String propertyName) throws BeansException;
	void setPropertyValue(String propertyName, @Nullable Object value) throws BeansException;
	void setPropertyValue(PropertyValue pv) throws BeansException;
	void setPropertyValues(Map<?, ?> map) throws BeansException;
	void setPropertyValues(PropertyValues pvs) throws BeansException;
	void setPropertyValues(PropertyValues pvs, boolean ignoreUnknown)
			throws BeansException;
	void setPropertyValues(PropertyValues pvs, boolean ignoreUnknown, boolean ignoreInvalid)
			throws BeansException;

}
```

这里需要解释一个概念，什么是PropertyValue？

> 当设置属性值时，少不了两样东西：
>
> 1. 属性访问表达式：如`listMap[0][0]`
> 2. 属性值：
>
> `ProperyValue`对象就是用来封装这些信息的。如果某个值要给赋值给bean属性，Spring都会把这个值包装成`ProperyValue`对象。

## 3、TypeConverter（类型转换器）

### 接口定义

```java
// 定义了进行类型转换时的一些规范，就像名字定义的那样，主要用来做类型转换
public interface TypeConverter {
	
    // 将指定的值转换成指定的类型
	@Nullable
	<T> T convertIfNecessary(@Nullable Object value, @Nullable Class<T> requiredType) throws TypeMismatchException;

    // 相对于上面这个方法下面这个三种方法能处理转换过程中的泛型
	@Nullable
	<T> T convertIfNecessary(@Nullable Object value, @Nullable Class<T> requiredType,
			@Nullable MethodParameter methodParam) throws TypeMismatchException;
	@Nullable
	<T> T convertIfNecessary(@Nullable Object value, @Nullable Class<T> requiredType, @Nullable Field field)
			throws TypeMismatchException;
	default <T> T convertIfNecessary(@Nullable Object value, @Nullable Class<T> requiredType,
			@Nullable TypeDescriptor typeDescriptor) throws TypeMismatchException {

		throw new UnsupportedOperationException("TypeDescriptor resolution not supported");
	}

}
```

## 4、ConfigurablePropertyAccessor

```java
public interface ConfigurablePropertyAccessor extends PropertyAccessor, PropertyEditorRegistry, TypeConverter {
	// ConversionService：进行转换的业务类，转换系统的入口
	void setConversionService(@Nullable ConversionService conversionService);
	@Nullable
	ConversionService getConversionService();
    
    // 进行属性编辑是是否返回旧的值
	void setExtractOldValueForEditor(boolean extractOldValueForEditor);
	boolean isExtractOldValueForEditor();
	
    // 当设置（dog.name）这种嵌套属性的情况下，如果dog属性为null是否会报错
    // 为true的话不会，为false会抛出NullValueInNestedPathException
	void setAutoGrowNestedPaths(boolean autoGrowNestedPaths);
	boolean isAutoGrowNestedPaths();

}
```

**从上面可以看到，BeanWrapper接口自身对Bean进行了一层包装**。**另外它的几个通过间接继承了几个接口，所以它还能对Bean中的属性进行操作。PropertyAccessor赋予了BeanWrapper对属性进行访问及设置的能力，在对Bean中属性进行设置时，不可避免的需要对类型进行转换，而恰好PropertyEditorRegistry，TypeConverter就提供了类型转换的统一约束。**

在了解了接口之后，我们接下来看看它的唯一实现类`BeanWrapperImpl`

# 唯一子类（BeanWrapperImpl）

## 继承关系

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200331082225890.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

结合我们之前对接口的分析以及上面这张UML图，我们可以知道BeanWrapperImpl主要实现了一下几个功能

1. 对Bean进行包装
2. 对Bean的属性进行访问以及设置
3. 在操作属性的过程中，必然涉及到类型转换，所以还有类型转换的功能

## Java中的内置机制

> 在详细了解BeanWrapperImpl前，必须要了解java中的一个机制：**内省**

### 核心概念

	首先可以先了解下JavaBean的概念：一种特殊的类，主要用于传递数据信息。这种类中的方法主要用于访问私有的字段，且方法名符合某种命名规则。如果在两个模块之间传递信息，可以将信息封装进JavaBean中，这种对象称为“值对象”(Value Object)，或“VO”。

因此JavaBean都有如下几个特征：

1. 属性都是私有的；
2. 有无参的public构造方法；
3. 对私有属性根据需要提供公有的getXxx方法以及setXxx方法；
4. getters必须有返回值没有方法参数；setter值没有返回值，有方法参数；

符合这些特征的类，被称为JavaBean；JDK中提供了一套API用来访问某个属性的getter/setter方法，这些API存放在java.beans中，这就是内省(Introspector)。

**内省和反射的区别:**

> 反射：Java反射机制是在运行中，对任意一个类，能够获取得到这个类的所有属性和方法；它针对的是任意类
> 内省（Introspector）：是Java语言对JavaBean类属性、事件的处理方法

1. 反射可以操作各种类的属性，而内省只是通过反射来操作JavaBean的属性
2. 内省设置属性值肯定会调用setter方法，反射可以不用（反射可直接操作属性Field）
3. 反射就像照镜子，然后能看到.class的所有，是客观的事实。内省更像主观的判断：比如**看到getName()，内省就会认为这个类中有name字段，但事实上并不一定会有name**；通过内省可以获取bean的getter/setter

### 使用示例

```java
public class Main {
    public static void main(String[] args) throws Exception{
        BeanInfo beanInfo = Introspector.getBeanInfo(People.class);
        PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
        for (PropertyDescriptor propertyDescriptor : propertyDescriptors) {
            System.out.print(propertyDescriptor.getName()+"   ");
        }
    }
    // 程序输出：age   class   name 
    // 为什么会输出class呢？前文中有提到，“看到getName()，内省就会认为这个类中有name字段，但事实上并不一定会有name”，我们知道每个对象都会有getClass方法，所以使用内省时，默认就认为它具有class这个字段
}

class People{
    String name;

    int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

## 源码分析

```java
// 这个类我只保留一些关键的代码，其余的琐碎代码都不看了
public class BeanWrapperImpl extends AbstractNestablePropertyAccessor implements BeanWrapper {
	// 缓存内省的结果，BeanWrapperImpl就是通过这个对象来完成对包装的Bean的属性的控制
	@Nullable
	private CachedIntrospectionResults cachedIntrospectionResults;
    ......       
   	public void setBeanInstance(Object object) {
		this.wrappedObject = object;
		this.rootObject = object;
        // 实际进行类型转换的对象：typeConverterDelegate
		this.typeConverterDelegate = new TypeConverterDelegate(this, this.wrappedObject);
		setIntrospectionClass(object.getClass());
	}
    ......
    // 最终调用的就是CachedIntrospectionResults的forClass方法进行内省并缓存，底层调用的就是java的内省机制
    private CachedIntrospectionResults getCachedIntrospectionResults() {
        if (this.cachedIntrospectionResults == null) {
            this.cachedIntrospectionResults = CachedIntrospectionResults.forClass(getWrappedClass());
        }
        return this.cachedIntrospectionResults;
    }
   .......
       // 最终进行类型转换的方法
       private Object convertIfNecessary(@Nullable String propertyName, @Nullable Object oldValue,
                                         @Nullable Object newValue, @Nullable Class<?> requiredType, @Nullable TypeDescriptor td)
       throws TypeMismatchException {

       Assert.state(this.typeConverterDelegate != null, "No TypeConverterDelegate");
       try {
           // 可以看到，最后就是调用typeConverterDelegate来进行类型转换
           return this.typeConverterDelegate.convertIfNecessary(propertyName, oldValue, newValue, requiredType, td);
       }
       ......
   }
}
```

## 父类作用分析

对于接口，我们已经分析过了，这里就不再赘述了，我们重点看下BeanWrapperImpl继承的几个父类

### PropertyEditorRegistrySupport

这个类最大的作用在于管理`PropertyEditor`,添加了很多的默认的`PropertyEditor`。在`PropertyEditorRegistry`的基础上做了进一步的扩展，提供的还是属性编辑器注册的功能。

### TypeConverterSupport

```java
public abstract class TypeConverterSupport extends PropertyEditorRegistrySupport implements TypeConverter {
    	@Nullable
	TypeConverterDelegate typeConverterDelegate;
......
}
```

这个接口实现了TypeConverter，所以它具有类型转换的能力，而它这种能力的实现，依赖于它所持有的一个TypeConverterDelegate。

### AbstractPropertyAccessor

```java
public abstract class AbstractPropertyAccessor extends TypeConverterSupport implements ConfigurablePropertyAccessor {
	// 省略部分代码......
	@Override
	public void setPropertyValues(PropertyValues pvs, boolean ignoreUnknown, boolean ignoreInvalid)
			throws BeansException {

		List<PropertyAccessException> propertyAccessExceptions = null;
		List<PropertyValue> propertyValues = (pvs instanceof MutablePropertyValues ?
				((MutablePropertyValues) pvs).getPropertyValueList() : Arrays.asList(pvs.getPropertyValues()));
		for (PropertyValue pv : propertyValues) {
			try {
				setPropertyValue(pv);
			}
			// ....
		}
	}

	@Override
	@Nullable
	public abstract Object getPropertyValue(String propertyName) throws BeansException;

	@Override
	public abstract void setPropertyValue(String propertyName, @Nullable Object value) throws BeansException;

}

```

核心的代码其实就是这些，这个类继承了`TypeConverterSupport`,所以它具备了类型转换的能力。同时它也是一个属性访问器，但是它只是实现了批量设置属性的方法，真正的`setPropertyValue`还是留待子类实现。可以看到，到这个类为止，还没有将属性的设置跟类型转换的能力结合起来。

### AbstractNestablePropertyAccessor

这个类开始真正的将属性访问跟类型转换结合到一起，它真正的实现了`setPropertyValue`，并在设置属性的时候会进行类型的转换，具体代码就不看了，非常繁杂，但是整体不难。

上面我们多次提到了类型转换，但是还没有真正看到类型转换的逻辑，因为上面类最终将类型转换的逻辑委托给了`TypeConverterDelegate`。接下来我们看看，类型转换到底是怎么完成。

# 类型转换

## TypeConverterDelegate

这个类我们只看一个核心方法，如下：

```java
class TypeConverterDelegate {

	private final PropertyEditorRegistrySupport propertyEditorRegistry;

	@Nullable
	private final Object targetObject;

	public <T> T convertIfNecessary(@Nullable String propertyName, @Nullable Object oldValue, @Nullable Object newValue,
			@Nullable Class<T> requiredType, @Nullable TypeDescriptor typeDescriptor) throws IllegalArgumentException {

		// 查看是否为当前这个类型配置了定制的PropertyEditor
		PropertyEditor editor = this.propertyEditorRegistry.findCustomEditor(requiredType, propertyName);

		ConversionFailedException conversionAttemptEx = null;

		// 获取当前容器中的类型转换业务类
		ConversionService conversionService = this.propertyEditorRegistry.getConversionService();
        
        // 在这里可以看出，Spring底层在进行类型转换时有两套机制
        // 1.首选的是采用PropertyEditor
        // 2.在没有配置PropertyEditor的情况下，会采用conversionService
		if (editor == null && conversionService != null && newValue != null && typeDescriptor != null) {
			TypeDescriptor sourceTypeDesc = TypeDescriptor.forObject(newValue);
			if (conversionService.canConvert(sourceTypeDesc, typeDescriptor)) {
				try {
                    // 通过conversionService进行类型转换
					return (T) conversionService.convert(newValue, sourceTypeDesc, typeDescriptor);
				}
				catch (ConversionFailedException ex) {
					// fallback to default conversion logic below
					conversionAttemptEx = ex;
				}
			}
		}

		Object convertedValue = newValue;

		// 配置了定制的属性编辑器，采用PropertyEditor进行属性转换
		if (editor != null || (requiredType != null && !ClassUtils.isAssignableValue(requiredType, convertedValue))) {
			if (typeDescriptor != null && requiredType != null && Collection.class.isAssignableFrom(requiredType) &&
					convertedValue instanceof String) {
				TypeDescriptor elementTypeDesc = typeDescriptor.getElementTypeDescriptor();
				if (elementTypeDesc != null) {
					Class<?> elementType = elementTypeDesc.getType();
					if (Class.class == elementType || Enum.class.isAssignableFrom(elementType)) {
						convertedValue = StringUtils.commaDelimitedListToStringArray((String) convertedValue);
					}
				}
			}
			if (editor == null) {
                // 没有配置定制的属性编辑器，采用默认的属性编辑器
				editor = findDefaultEditor(requiredType);
			}
            // 采用属性编辑器进行转换，需要注意的是，默认情况下PropertyEditor只会对String类型的值进行类型转换
			convertedValue = doConvertValue(oldValue, convertedValue, requiredType, editor);
		}
        // .....
		return (T) convertedValue;
	}
	
}
```

从上面的代码中我们可以知道，Spring在实现类型转换时，有两套机制，第一套机制依赖于PropertyEditor，第二套机制依赖于ConversionService。关于属性编辑器PropertyEditor我们之前已经介绍过了，主要进行的是String到Object的转换，正因为如此，属性编辑器进行类型转换有很大的局限性，所以Spring又推出了一套ConversionService的体系。

## ConversionService体系

### 1、Converter 

##### 接口定义

```java
package org.springframework.core.convert.converter;

// 将一个S类型的数据转换成T类型
public interface Converter<S, T> {

    T convert(S source);
}
```

这个接口只能进行一对一的转换，S->T

### 2、ConverterFactory

##### 接口定义

```java
public interface ConverterFactory<S, R> {
	
    <T extends R> Converter<S, T> getConverter(Class<T> targetType);
}
```

利用这个转换工厂，我们可以进行一对多的转换，以Spring内置的一个转换器为例：

```java
final class StringToEnumConverterFactory implements ConverterFactory<String, Enum> {

	@Override
	public <T extends Enum> Converter<String, T> getConverter(Class<T> targetType) {
		return new StringToEnum(ConversionUtils.getEnumType(targetType));
	}


	private class StringToEnum<T extends Enum> implements Converter<String, T> {

		private final Class<T> enumType;

		public StringToEnum(Class<T> enumType) {
			this.enumType = enumType;
		}

		@Override
		public T convert(String source) {
			if (source.isEmpty()) {
				// It's an empty enum identifier: reset the enum value to null.
				return null;
			}
			return (T) Enum.valueOf(this.enumType, source.trim());
		}
	}

}
```

通过传入不同的枚举类型，我们可以从这个工厂中获取到不同的转换器，并把对应的String类型的参数转换成对应的枚举类型数据。

可以看到，通过ConverterFactory，我们能实现一对多的类型转换S->(T extends R)

### 3、GenericConverter

#### 接口定义

```java
public interface GenericConverter {
	
    // 获取能够转换的ConvertiblePair的集合，这个对象就是一组可以进行转换的类型
	@Nullable
	Set<ConvertiblePair> getConvertibleTypes();
	
    // 根据源数据类型转换成目标类型数据
	@Nullable
	Object convert(@Nullable Object source, TypeDescriptor sourceType, TypeDescriptor targetType);

	final class ConvertiblePair {
		// 源数据类型
		private final Class<?> sourceType;
		// 目标数据类型
		private final Class<?> targetType;

		// .....省略部分代码
	}

}
```

相比于前面的Converter以及ConverterFactory，这个接口就更加牛逼了，使用它能完成多对多的转换。因为它内部保存了一个能够进行转换的ConvertiblePair的集合，每个ConvertiblePair代表一组能进行转换的数据类型。同时，这个接口相比我们前面介绍的两个接口，更加的复杂，所以一般情况也不推荐使用这个接口，没有非常必要的话，最好是使用上面两种

一般GenericConverter会与ConditionalGenericConverter配合使用，其接口定义如下：

```java
public interface ConditionalConverter {
	// 判断是否需要对目标类型转换到原类型，返回true的话代表要执行转换，否则不执行转换
    boolean matches(TypeDescriptor sourceType, TypeDescriptor targetType);
}

// 结合了上面两个接口
public interface ConditionalGenericConverter extends GenericConverter, ConditionalConverter {
}
```

我们来看下Spring内部的一个实际使用的例子：

```java
final class StringToCollectionConverter implements ConditionalGenericConverter {

	private final ConversionService conversionService;

	@Override
	public Set<ConvertiblePair> getConvertibleTypes() {
		return Collections.singleton(new ConvertiblePair(String.class, Collection.class));
	}

	@Override
	public boolean matches(TypeDescriptor sourceType, TypeDescriptor targetType) {
		return (targetType.getElementTypeDescriptor() == null ||
                // 根据conversionService来判断是否需要执行转换
				this.conversionService.canConvert(sourceType, targetType.getElementTypeDescriptor()));
	}

	@Override
	@Nullable
	public Object convert(@Nullable Object source, TypeDescriptor sourceType, TypeDescriptor targetType) {
			// 这里会借助conversionService来执行转换
	}

}
```

可以看到，最终的实现还是借助了ConversionService，那么ConversionService到底是啥呢？

### 4、ConversionService

##### 接口定义

```java
public interface ConversionService {
	
    // 判断是否能进行类型转换
	boolean canConvert(@Nullable Class<?> sourceType, Class<?> targetType);
	boolean canConvert(@Nullable TypeDescriptor sourceType, TypeDescriptor targetType);
	
    // 进行类型转换
	@Nullable
	<T> T convert(@Nullable Object source, Class<T> targetType);
	@Nullable
	Object convert(@Nullable Object source, @Nullable TypeDescriptor sourceType, TypeDescriptor targetType);

}
```

#### UML类图

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200331082235495.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)

一般来说，实现了`ConversionService`跟`ConverterRegistry`会结合使用，对于这种`xxxRegistry`我相信大家猜都能猜出来它是干什么的了，代码如下：

##### ConverterRegistry

```java
// 就是在添加Converter或者ConverterFactory
public interface ConverterRegistry {
	
	void addConverter(Converter<?, ?> converter);

	<S, T> void addConverter(Class<S> sourceType, Class<T> targetType, Converter<? super S, ? extends T> converter);

	void addConverter(GenericConverter converter);

	void addConverterFactory(ConverterFactory<?, ?> factory);

	void removeConvertible(Class<?> sourceType, Class<?> targetType);

}
```

##### ConfigurableConversionService

```java
// 单纯的整合了ConversionService以及ConverterRegistry的功能
public interface ConfigurableConversionService extends ConversionService, ConverterRegistry {

}
```

##### GenericConversionService

这个类已经是一个具体的实现类，可以直接使用，但是我们一般不会直接使用它，而是使用它的子类`DefaultConversionService`,因为子类提供了很多默认的转换器。

##### DefaultConversionService

```java
public class DefaultConversionService extends GenericConversionService {

	@Nullable
	private static volatile DefaultConversionService sharedInstance;

	public DefaultConversionService() {
		addDefaultConverters(this);
	}

	public static ConversionService getSharedInstance() {
		DefaultConversionService cs = sharedInstance;
		if (cs == null) {
			synchronized (DefaultConversionService.class) {
				cs = sharedInstance;
				if (cs == null) {
					cs = new DefaultConversionService();
					sharedInstance = cs;
				}
			}
		}
		return cs;
	}

	public static void addDefaultConverters(ConverterRegistry converterRegistry) {
		addScalarConverters(converterRegistry);
		addCollectionConverters(converterRegistry);

		converterRegistry.addConverter(new ByteBufferConverter((ConversionService) converterRegistry));
		......
	}

	public static void addCollectionConverters(ConverterRegistry converterRegistry) {
		......
	}

	private static void addScalarConverters(ConverterRegistry converterRegistry) {
		converterRegistry.addConverterFactory(new NumberToNumberConverterFactory());
		......
	}

}

```

相比其父类`GenericConversionService`，这个子类默认添加了很多的转换器，这样可以极大的方便我们进行开发，所以一般情况下我们都会使用这个类。

### 如何配置ConversionService

讲了这么多，那么如何往容器中配置一个ConversionService呢？我们需要借助Spring提供的一个`ConversionServiceFactoryBean`。其代码如下：

```java
public class ConversionServiceFactoryBean implements FactoryBean<ConversionService>, InitializingBean {

	@Nullable
	private Set<?> converters;

	@Nullable
	private GenericConversionService conversionService;

	public void setConverters(Set<?> converters) {
		this.converters = converters;
	}

	@Override
	public void afterPropertiesSet() {
		this.conversionService = createConversionService();
		ConversionServiceFactory.registerConverters(this.converters, this.conversionService);
	}
	
	protected GenericConversionService createConversionService() {
		return new DefaultConversionService();
	}

	@Override
	@Nullable
	public ConversionService getObject() {
		return this.conversionService;
	}

	@Override
	public Class<? extends ConversionService> getObjectType() {
		return GenericConversionService.class;
	}

	@Override
	public boolean isSingleton() {
		return true;
	}

}

```

这个类的实现逻辑很简单，`ConversionServiceFactoryBean`创建完成后，在进行初始化时调用`afterPropertiesSet`方法，创建一个`DefaultConversionService`，然后将提供的`converters`全部注册到这个`DefaultConversionService`中。所以我们进行如下的配置就行了

```xml
<bean id="conversionService"
        class="org.springframework.context.support.ConversionServiceFactoryBean">
    <property name="converters">
        <set>
            # 提供自己的converter,可以覆盖默认的配置
            <bean class="example.MyCustomConverter"/>
        </set>
    </property>
</bean>
```

# 总结

这篇文章中，我们学习了BeanWrapper，知道一个BeanWrapper其实就是一个Bean的包装器，它对Bean包装的目的是为了能操纵Bean中的属性，所以它同时需要具备获取以及设置Bean中的属性能力，所以它也必须是一个属性访问器（PropertyAccessor），另外为了将各种不同类型的配置数据绑定到Bean的属性上，那么它还得具备属性转换的能力，因为它还得是一个类型转换器（TypeConverter）。

通过上面的分析，我们知道Spring中将类型转换的功能都委托给了一个`TypeConverterDelegate`，这个委托类在进行类型转换时会有两套方案：

1. PropertyEditor，这是Spring最初提供的方案，扩展了java中的PropertyEditor（java原先提供这个接口的目的更多是为了进行图形化编程）
2. ConversionService，Spring后来提供的一个进行类型转换的体系，用来取代PropertyEditor，因为PropertyEditor有很大的局限性，只能进行String->Object的转换。

画图如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200331082247233.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQxOTA3OTkx,size_16,color_FFFFFF,t_70)
**扫描下方二维码，关注我的公众号，更多精彩文章在等您！~~**

![公众号](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9naXRlZS5jb20vd3hfY2MzNDdiZTY5Ni9ibG9nSW1hZ2UvcmF3L21hc3Rlci8lRTUlODUlQUMlRTQlQkMlOTclRTUlOEYlQjcuanBn?x-oss-process=image/format,png)
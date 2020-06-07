# 使用Spring API进行验证

验证在任何时候都非常关键。考虑将数据验证作为业务逻辑开发有利也有弊，Spring 认为，验证不应该只在Web 端进行处理，在服务端也要进行相应的处理，可以防止脏数据存入数据库中，从而避免为运维同学和测试同学造成更大的困扰，因为数据造成的bug会更加难以发现，而且开发人员关注点也不会放在数据本身的问题上，所以做服务端的验证也是非常有必要的。
考虑到上面这些问题，Spring 提供了两种主要类型的验证：

* 一个是实现`Validator` 接口来创建自定义验证器，用于服务端数据校验。
* 一种是通过Spring 对` Bean Validation` 支持实现的。

## 通过使用 Spring Validator 接口进行验证

Spring 提供 `Validator` 接口用于验证对象。Validator 接口通过使用 `Errors` 对象来工作，以便在验证时，验证器可以向 Errors 对象报告验证失败。下面是一个简单的 对象示例

```java
public class Person {

    private String name;
    private int age;

    // get and set...
}
```

下面一个例子为 Person 对象提供了一种验证方式，通过实现了 `org.springframework.validation.Validator` 接口 的两个方法:

* `supports(Class)`: 表示此 Validator 是否能够验证提供的类的实例
* `validate(Object, org.springframework.validation.Errors)`: 验证给定的对象，如果验证错误，则注册具有给定 Errors 对象。

实现一个 `Validator` 非常简单，而且Spring 也提供了 `ValidationUtils` 工具类帮助进行验证。下面是一个验证 Person 对象的例子：

```java
@Component
public class PersonValidator implements Validator {

    // 此 Validator 只验证 Person 实例
    public boolean supports(Class clazz) {
        return Person.class.equals(clazz);
    }

    public void validate(Object obj, Errors e) {
        ValidationUtils.rejectIfEmpty(e, "name", "name.empty");
    }
}
```

上面代码示例中的静态方法 `rejectIfEmpty()` 方法用于拒绝name属性，当name 属性是 null 或者是 空串的时候。查看 ValidationUtils 文档关于它能够提供的功能。

然后再来编写配置类 `AppConfig`:

```java
@Configuration
@ComponentScan("com.spring.validation")
public class AppConfig {}
```

使用 @Configuration 注解声明此类为配置类(更多 @Configuration 的用法，请参照 [原创 | 我被面试官给虐懵了，竟然是因为我不懂Spring中的@Configuration](https://mp.weixin.qq.com/s?__biz=MzU2NDg0OTgyMA==&mid=2247483982&idx=1&sn=628c19492b92ae3dbba84a6bf598e03d&chksm=fc45ffbdcb3276ab4aebc84bd159fce7d3446c0f1494762e774434dcf127ab9a57ad173e1a45&token=1177970741&lang=zh_CN#rd) )

配置@ComponentScan 注解用于自动装配，默认是使用 `basePackages` 扫描指定包，字符串表示。

然后对上面的程序进行验证

```java
public class SpringValidationApplicationTests {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(AppConfig.class);

        Person person = new Person();
        person.setAge(18);
        person.setName(null);

        PersonValidator personValidator = applicationContext.getBean("personValidator", PersonValidator.class);
        BeanPropertyBindingResult result = new BeanPropertyBindingResult(person,"cxuan");

        ValidationUtils.invokeValidator(personValidator,person,result);

        List<ObjectError> allErrors = result.getAllErrors();
        allErrors.forEach(e-> System.out.println(e.getCode()));
    }
}
```

因为是基于注解的配置，所以使用 `AnnotationConfigApplicationContext`上下文启动类，把配置类 AppConfig 当作参数，然后构建一个Person 类，为了测试验证有效性，把 name 设置为 null，然后通过上下问的 `getBean` 方法获得 personValidator 的实例，通过使用 `BeanPropertyBindingResult` 把 person 绑定为 `cxuan` 的名字，然后使用 `ValidationUtils` 工具类进行验证，最后把验证的结果进行检查。

上面程序经验证后的结果如下：

org.springframework.validation.ValidationUtils - Invoking validator [com.spring.validation.PersonValidator@37918c79]
DEBUG org.springframework.validation.ValidationUtils - Validator found 1 errors
name.empty

## 使用 Bean Validation 进行验证

从 Spring4 开始，就已经实现对 JSR-349 Bean Validation 的全面支持。Bean Validation API 在 `javax.validation.constraints` 包中以 Java 注解(例如 @NonNull) 形式定义了一组可用域对象的约束。

通过使用 Bean Validation API ，可以避免耦合到特定的验证服务提供程序。Spring 对 Bean Validation API 提供了无缝支持，主要使用一些注解进行验证，下面一起来看一下

### 定义对象属性上的验证约束

首先，将验证约束应用于域对象属性。使用maven 配置需要引入对应的依赖

```xml-dtd
<dependency>
    <groupId>javax.validation</groupId>
    <artifactId>validation-api</artifactId>
    <version>1.1.0.Final</version>
</dependency>
    <dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>5.2.4.Final</version>
</dependency>
```

之后定义了一些实体类，使用 `javax.validation.constraints` 包中的注释进行标注

```java
public class Singer {

    @NotNull
    @Size(min = 2,max = 60)
    private String firstName;

    private String lastName;

    @NotNull
    private Genre genre;

    private Gender gender;

    get and set...
}
```

对于 firstName ，定义了两个约束，第一个约束由 `@NotNull` 进行控制，它表示该值不能为空。此外，`@Size`注解控制着 firstName 的长度在 2 - 60 之间。@NotNull 还用于 genre 属性。下面是`Genre` 和 `Gender` 的枚举类

```java
public enum Genre {

    POP("P"),
    JAZZ("J"),
    BLUES("B"),
    COUNTRY("C");

    private String code;

    private Genre(String code){
        this.code = code;
    }

    public String toString(){
        return this.code;
    }
}

public enum Gender {

    MALE("M"),
    FEMALE("F");

    private String code;

    Gender(String code){
        this.code = code;
    }

    @Override
    public String toString() {
        return this.code;
    }
}
```

Genre 表示歌手所属的音乐类型，而 Gender 与音乐事业不相关，所以可以为空

### 在 Spring 中配置 Bean Validation 支持

为了在 Spring 的 ApplicationContext 中配置对 Bean Validation API 的支持，可以在Spring 的配置中定义一个 `LocalValidatorFactoryBean` 的 bean如下

```java
@Configuration
@ComponentScan("com.spring.validation")
public class ValidationConfig {

    @Bean
    LocalValidatorFactoryBean validatorFactoryBean(){
        return new LocalValidatorFactoryBean();
    }
}
```

声明一个 `LocalValidatorFactoryBean` 的 bean 是必须的。默认情况下，Spring 会在类路径下搜索 `Hibernate Validator`库，验证它是否存在。

下面我们编写一个为 Singer 类提供验证服务的服务类

```java
@Service
public class SingerValidationService {

    @Autowired
    private Validator validator;

    public Set<ConstraintViolation<Singer>> validateSinger(Singer singer){
        return validator.validate(singer);
    }
}
```

注入一个 `javax.validation.Validator` 实例(请注意与 Spring 提供的 Validator 接口不同)。一旦定义了 LocalValidatorFactoryBean ,就可以在应用程序中的任意位置创建 Validator 的句柄。要在 POJO 上进行验证，需要调用 `validator.validate` 方法，验证结果以 `ConstraintViolation<T>` 接口的集合形式返回。下面是上面例子程序的验证

```java
public class SpringBeanValidationTest {

    public static void main(String[] args) {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(ValidationConfig.class);

        SingerValidationService singerBean = applicationContext.getBean(SingerValidationService.class);

        Singer singer = new Singer();
        singer.setFirstName("c");
        singer.setLastName("xuan");
        singer.setGenre(null);
        singer.setGender(null);

        validateSinger(singer,singerBean);

        applicationContext.close();
    }

    private static void validateSinger(Singer singer,SingerValidationService singerValidationService){
        Set<ConstraintViolation<Singer>> violationSet = singerValidationService.validateSinger(singer);
        listViolations(violationSet);
    }

    private static void listViolations(Set<ConstraintViolation<Singer>> violations){
        System.out.println("violations.size() = " + violations.size());
        for(ConstraintViolation<Singer> violation : violations){
            System.out.println("Validation error for property : " + violation.getPropertyPath());
            System.out.println("with value : " + violation.getInvalidValue());
            System.out.println("with error message : " + violation.getMessage());
        }
    }
}
```

上述代码构建了一个 Singer 类进行验证，因为 firstname 属性的要求是长度介于 2 - 60 之间并且不能为null，所以这里只用了一个字符验证，genre 属性不能为null，最核心的验证方法就是 `singerValidationService.validateSinger(singer).`方法，它会调用

```java
public Set<ConstraintViolation<Singer>> validateSinger(Singer singer){
  return validator.validate(singer);
}
```

进行验证，验证的结果返回的是 `ConstraintViolation<Singler> `类型，然后把对应的错误信息输出，上面的错误信息是

violations.size() = 2
Validation error for property : firstName
with value : c
with error message : 个数必须在2和60之间
Validation error for property : genre
with value : null
with error message : 不能为null

可以打印出两个错误，并输出错误的属性、值以及错误信息。
# HTTP 进阶

[HTTP 进阶](#http-进阶)
   * [HTTP 内容协商](#http-内容协商)
      * [什么是内容协商](#什么是内容协商)
      * [内容协商的种类](#内容协商的种类)
      * [为什么需要内容协商](#为什么需要内容协商)
      * [内容协商标头](#内容协商标头)
         * [Accept](#accept)
         * [Accept-Charset](#accept-charset)
         * [Accept-Language](#accept-language)
         * [Accept-Encoding](#accept-encoding)
         * [Content-Type](#content-type)
         * [Content-Encoding](#content-encoding)
      * [Content-Language](#content-language)
   * [HTTP 认证](#http-认证)
      * [通用 HTTP 认证框架](#通用-http-认证框架)
      * [代理认证](#代理认证)
         * [Proxy-Authenticate](#proxy-authenticate)
         * [Proxy-Authorization](#proxy-authorization)
      * [禁止访问](#禁止访问)
         * [WWW-Authenticate 和 Proxy-Authenticate 头](#www-authenticate-和-proxy-authenticate-头)
         * [Authorization 和 Proxy-Authorization 标头](#authorization-和-proxy-authorization-标头)
   * [HTTP 缓存](#http-缓存)
      * [不同类型的缓存](#不同类型的缓存)
         * [不缓存过期资源](#不缓存过期资源)
         * [私有缓存](#私有缓存)
         * [共享缓存](#共享缓存)
      * [缓存控制](#缓存控制)
         * [不缓存](#不缓存)
         * [缓存但需要验证](#缓存但需要验证)
         * [私有和共享缓存](#私有和共享缓存)
         * [缓存过期](#缓存过期)
         * [缓存验证](#缓存验证)
      * [什么是新鲜的数据](#什么是新鲜的数据)
      * [缓存验证](#缓存验证-1)
         * [Etag](#etag)
         * [避免碰撞](#避免碰撞)
         * [缓存未占用资源](#缓存未占用资源)
   * [HTTP CROS 跨域](#http-cros-跨域)
      * [Origin](#origin)
      * [跨域的特点](#跨域的特点)
      * [同源策略](#同源策略)
      * [跨域请求](#跨域请求)
      * [跨域功能概述](#跨域功能概述)
      * [访问控制](#访问控制)
         * [简单请求](#简单请求)
         * [预检请求](#预检请求)
         * [带凭证的请求](#带凭证的请求)
         * [Access-Control-Allow-Origin](#access-control-allow-origin)
         * [Access-Control-Allow-Credentials](#access-control-allow-credentials)
         * [Access-Control-Allow-Headers](#access-control-allow-headers)
         * [Access-Control-Allow-Methods](#access-control-allow-methods)
         * [Access-Control-Expose-Headers](#access-control-expose-headers)
         * [Access-Control-Max-Age](#access-control-max-age)
         * [Access-Control-Request-Headers](#access-control-request-headers)
         * [Origin](#origin-1)
   * [HTTP 条件请求](#http-条件请求)
      * [原则](#原则)
      * [验证](#验证)
         * [强验证](#强验证)
         * [弱验证](#弱验证)
      * [条件请求](#条件请求)
         * [If-Match](#if-match)
         * [If-None-Match](#if-none-match)
         * [If-Modified-Since](#if-modified-since)
         * [If-Range](#if-range)
         * [If-Unmodified-Since](#if-unmodified-since)
      * [条件请求示例](#条件请求示例)
         * [缓存更新](#缓存更新)
         * [断点续传](#断点续传)
         * [通过乐观锁避免丢失更新](#通过乐观锁避免丢失更新)
   * [HTTP Cookies](#http-cookies)
      * [创建 Cookie](#创建-cookie)
         * [Set-Cookie 和 Cookie 标头](#set-cookie-和-cookie-标头)
         * [会话 Cookies](#会话-cookies)
         * [永久性 Cookies](#永久性-cookies)
         * [Cookie的 Secure 和 HttpOnly 标记](#cookie的-secure-和-httponly-标记)
      * [Cookie 的作用域](#cookie-的作用域)

这是 HTTP 系列的第三篇文章，此篇文章为 HTTP 的进阶文章。

在前面两篇文章中我们讲述了 HTTP 的入门，HTTP 所有常用标头的概述，这篇文章我们来聊一下 HTTP 的一些 `黑科技`。

## HTTP 内容协商

### 什么是内容协商

在 HTTP 中，`内容协商`是一种用于在同一 URL 上提供资源的不同表示形式的机制。内容协商机制是指客户端和服务器端就响应的资源内容进行交涉，然后提供给客户端最为适合的资源。内容协商会以响应资源的语言、字符集、编码方式等作为判断的标准。	

![](http://www.cxuan.vip/image-20230202213210013.png)


### 内容协商的种类

内容协商主要有以下3种类型：

* `服务器驱动协商（Server-driven Negotiation）`

这种协商方式是由服务器端进行内容协商。服务器端会根据请求首部字段进行自动处理

* `客户端驱动协商（Agent-driven Negotiation）`

这种协商方式是由客户端来进行内容协商。

* `透明协商（Transparent Negotiation）`

是服务器驱动和客户端驱动的结合体，是由服务器端和客户端各自进行内容协商的一种方法。

内容协商的分类有很多种，主要的几种类型是 **Accept、Accept-Charset、Accept-Encoding、Accept-Language、Content-Language**。

一般来说，客户端用 Accept 头告诉服务器希望接收什么样的数据，而服务器用 Content 头告诉客户端实际发送了什么样的数据。

### 为什么需要内容协商

我们为什么需要内容协商呢？在回答这个问题前我们先来看一下 TCP 和 HTTP 的不同。

在 TCP / IP 协议栈里，传输数据基本上都是 `header+body` 的格式。但 TCP、UDP 因为是传输层的协议，它们不会关心 body 数据是什么，只要把数据发送到对方就算是完成了任务。

而 HTTP 协议则不同，它是应用层的协议，数据到达之后需要告诉应用程序这是什么数据。当然不告诉应用这是哪种类型的数据，应用也可以通过不断尝试来判断，但这种方式无疑十分低效，而且有很大几率会检查不出来文件类型。

所以鉴于此，浏览器和服务器需要就数据的传输达成一致，浏览器需要告诉服务器自己希望能够接收什么样的数据，需要什么样的压缩格式，什么语言，哪种字符集等；而服务器需要告诉客户端自己能够提供的服务是什么。

所以我们就引出了内容协商的几种概念，下面依次来进行探讨

### 内容协商标头

#### Accept

接受请求 HTTP 标头会通告客户端自己能够接受的 `MIME` 类型

那么什么是 MIME 类型呢？在回答这个问题前你应该先了解一下什么是 MIME

>MIME: MIME (Multipurpose Internet Mail Extensions) 是描述消息内容类型的因特网标准。MIME 消息能包含文本、图像、音频、视频以及其他应用程序专用的数据。

也就是说，MIME 类型其实就是一系列消息内容类型的集合。那么 MIME 类型都有哪些呢？

`文本文件`： text/html、text/plain、text/css、application/xhtml+xml、application/xml

`图片文件`： image/jpeg、image/gif、image/png

`视频文件`： video/mpeg、video/quicktime

`应用程序二进制文件`： application/octet-stream、application/zip

比如，如果浏览器不支持 PNG 图片的显示，那 Accept 就不指定image/png，而指定可处理的 image/gif 和 image/jpeg 等图片类型。

一般 MIME 类型也会和 `q` 这个属性一起使用，q 是什么？q 表示的是权重，来看一个例子

```http
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
```

这是什么意思呢？若想要给显示的**媒体类型增加优先级**，则使用 `q=` 来额外表示权重值，没有显示权重的时候默认值是1.0 ，我给你列个表格你就明白了

| q    | MIME                  |
| ---- | --------------------- |
| 1.0  | text/html             |
| 1.0  | application/xhtml+xml |
| 0.9  | application/xml       |
| 0.8  | * / *                 |

也就是说，这是一个放置顺序，权重高的在前，低的在后，`application/xml;q=0.9` 是不可分割的整体。

#### Accept-Charset

Accept-charset 属性规定服务器处理表单数据所接受的字符编码；Accept-charset 属性允许你指定一系列字符集，服务器必须支持这些字符集，从而得以正确解释表单中的数据。

Accept-Charset 没有对应的标头，服务器会把这个值放在 `Content-Type`中用 **charset=xxx**来表示，

例如，浏览器请求 GBK 或 UTF-8 的字符集，然后服务器返回的是 UTF-8 编码，就是下面这样

```http
Accept-Charset: gbk, utf-8
Content-Type: text/html; charset=utf-8
```

#### Accept-Language

首部字段 Accept-Language 用来告知服务器用户代理能够处理的自然语言集（指中文或英文等），以及自然语言集的相对优先级。可一次指定多种自然语言集。和 Accept 首部字段一样，按权重值 `q= ` 来表示相对优先级。

```http
Accept-Language: en-US,en;q=0.5
```

#### Accept-Encoding

表示 HTTP 标头会标明客户端希望服务端返回的内容编码，这通常是一种压缩算法。Accept-Encoding 也是属于`内容协商` 的一部分，使用并通过客户端选择 `Content-Encoding` 内容进行返回。

即使客户端和服务器都能够支持相同的压缩算法，服务器也可能选择不压缩并返回，这种情况可能是由于这两种情况造成的:

* 要发送的数据已经被压缩了一次，第二次压缩并不会导致发送的数据更小
* 服务器过载，无法承受压缩带来的性能开销，通常，如果服务器使用 CPU 超过 80% ，`Microsoft` 则建议不要使用压缩

下面是 Accept-Encoding 的使用方式

```http
Accept-Encoding: gzip
Accept-Encoding: compress
Accept-Encoding: deflate
Accept-Encoding: br
Accept-Encoding: identity
Accept-Encoding: *
Accept-Encoding: deflate, gzip;q=1.0, *;q=0.5
```

上面的几种表述方式就已经把 Accept-Encoding 的属性列全了

* `gzip`: 由文件压缩程序 gzip 生成的编码格式，使用 `Lempel-Ziv编码（LZ77）`和32位CRC的压缩格式，感兴趣的同学可以读一下 （https://en.wikipedia.org/wiki/LZ77_and_LZ78#LZ77）

* `compress`: 使用`Lempel-Ziv-Welch（LZW）`算法的压缩格式，有兴趣的同学可以读 （https://en.wikipedia.org/wiki/LZW）

* `deflate`: 使用 zlib 结构和 deflate 压缩算法的压缩格式，参考 （https://en.wikipedia.org/wiki/Zlib） 和 （https://en.wikipedia.org/wiki/DEFLATE）

* `br`: 使用 Brotli 算法的压缩格式，参考 （https://en.wikipedia.org/wiki/Brotli）

* 不执行压缩或不会变化的默认编码格式

* `*` : 匹配标头中未列出的任何内容编码，如果没有列出 `Accept-Encoding` ，这就是默认值，并不意味着支

  持任何算法，只是表示没有偏好

* `;q=` 采用权重 q 值来表示相对优先级，这点与首部字段 Accept 相同。

#### Content-Type

Content-Type 实体标头用于指示资源的 MIME 类型。作为响应，Content-Type 标头告诉客户端返回的内容的内容类型实际上是什么。Content-type 有两种值 : MIME 类型和字符集编码，例如

```http
Content-Type: text/html; charset=UTF-8
```

>在某些情况下，浏览器将执行 MIME 嗅探，并且不一定遵循此标头的值；为防止此行为，可以将标头 X-Content-Type-Options 设置为 nosniff。

#### Content-Encoding

Content-Encoding 实体标头用于压缩媒体类型，它让客户端知道如何进行解码操作，从而使客户端获得 Content-Type 标头引用的 MIME 类型。表示如下

```http
Content-Encoding: gzip
Content-Encoding: compress
Content-Encoding: deflate
Content-Encoding: identity
Content-Encoding: br
Content-Encoding: gzip, identity
Content-Encoding: deflate, gzip
```

### Content-Language

Content-Language 实体标头用于描述面向受众的语言，以便使用户根据用户自己的首选语言进行区分。例如

```http
Content-Language: de-DE
Content-Language: en-US
Content-Language: de-DE, en-CA
```

下面根据内容协商对应的请求/响应标头，我列了一张图供你参考，注意其中 Accept-Charset 没有对应的 Content-Charset ，而是通过 Content-Type 来表示。

![](http://www.cxuan.vip/image-20230202214202351.png)

## HTTP 认证

HTTP 提供了用于访问控制和身份认证的功能，下面就对 HTTP 的权限和认证功能进行介绍

### 通用 HTTP 认证框架

RFC 7235 定义了 HTTP 身份认证框架，服务器可以根据其文档的定义来检查客户端请求。客户端也可以根据其文档定义来提供身份验证信息。

请求/响应的工作流程如下：服务器以`401(未授权)` 的状态响应客户端告诉客户端服务器需要认证信息，客户端提供至少一个 `www-Authenticate` 的响应标头进行授权信息的认证。想要通过服务器进行身份认证的客户端可以在请求标头字段中添加认证标头进行身份认证，一般的认证过程如下

![](http://www.cxuan.vip/image-20230202214221561.png)

首先客户端发起一个 HTTP 请求，不带有任何认证标头，服务器对此 HTTP 请求作出响应，发现此 HTTP 信息未带有认证凭据，服务器通过 `www-Authenticate`标头返回 401 告诉客户端此请求未通过认证。然后客户端进行用户认证，认证完毕后重新发起 HTTP 请求，这次 HTTP 请求带有用户认证凭据（注意，整个身份认证的过程必须通过 HTTPS 连接保证安全），到达服务器后服务器会检查认证信息，如果不符合服务器认证信息，会返回 `403 Forbidden` 表示用户认证失败，如果满足认证信息，则返回 `200 OK`。

我们知道，客户端和服务器之间的 HTTP 连接可以被代理缓存重新发送，所以认证信息也适用于代理服务器。

### 代理认证

由于资源认证和代理认证可以共存，因此需要不同的头和状态码，在代理的情况下，会返回状态码 `407(需要代理认证)`， `Proxy-Authenticate` 响应头包含至少一个适用于代理的情况，`Proxy-Authorization`请求头用于将证书提供给代理服务器。下面分别来认识一下这两个标头

#### Proxy-Authenticate

HTTP `Proxy-Authenticate` 响应标头定义了身份验证方法，应使用该身份验证方法来访问代理服务器后面的资源。它将请求认证到代理服务器，从而允许它进一步发送请求。例如

```http
Proxy-Authenticate: Basic
Proxy-Authenticate: Basic realm="Access to the internal site"
```

#### Proxy-Authorization

这个 HTTP `请求`标头和上面的 `Proxy-Authenticate` 拼接很相似，但是概念不同，这个标头用于向代理服务器提供凭据，例如

```http
Proxy-Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l
```

下面是代理服务器的请求/响应认证过程

![](http://www.cxuan.vip/image-20230202214236481.png)

这个过程和通用的过程类似，我们就不再详细展开描述了。

### 禁止访问

如果`代理服务器`收到的有效凭据不足以获取对给定资源的访问权限，则服务器应使用`403 Forbidden`状态代码进行响应。与 `401 Unauthorized` 和 `407 Proxy Authorization Required` 不同，该用户无法进行身份验证。

#### WWW-Authenticate 和 Proxy-Authenticate 头

`WWW-Authenticate` 和 `Proxy-Authenticate` 响应头定义了获得对资源访问权限的身份验证方法。他们需要指定使用哪种身份验证方案，以便希望授权的客户端知道如何提供凭据。它们的一般表示形式如下

```http
WWW-Authenticate: <type> realm=<realm>
Proxy-Authenticate: <type> realm=<realm>
```

我想你从上面看到这里一定会好奇 `<type>` 和 `realm`是什么东西，现在就来解释下。

* `<type>` 是认证协议，`Basic` 是下面协议中最普遍使用的

>RFC 7617 中定义了`Basic` HTT P身份验证方案，该方案将凭据作为用户ID /密码对传输，并使用 base64 进行编码。(感兴趣的同学可以看看 https://tools.ietf.org/html/rfc7617)

其他的认证协议主要有

| 认证协议         | 参考来源                                                     |
| ---------------- | ------------------------------------------------------------ |
| Basic            | 查阅 [RFC 7617](https://tools.ietf.org/html/rfc7617)，base64编码的凭据 |
| Bearer           | 查阅 [RFC 6750](https://tools.ietf.org/html/rfc6750)，承载令牌来访问受 OAuth 2.0保护的资源 |
| Digest           | 查阅 [RFC 7616](https://tools.ietf.org/html/rfc7616)，Firefox仅支持md5哈希，请参见错误[bug 472823](https://bugzilla.mozilla.org/show_bug.cgi?id=472823)以获得SHA加密支持 |
| HOBA             | 查阅 [RFC 7486](https://tools.ietf.org/html/rfc7486)         |
| Mutual           | 查阅 [RFC 8120](https://tools.ietf.org/html/rfc8120)         |
| AWS4-HMAC-SHA256 | 查阅 [AWS docs](http://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-auth-using-authorization-header.html) |

* `realm` 用于描述保护区或指示保护范围，这可能是诸如 **Access to the staging site(访问登陆站点)** 或者类似的，这样用户就可以知道他们要访问哪个区域。

#### Authorization 和 Proxy-Authorization 标头

Authorization 和 Proxy-Authorization 请求标头包含用于通过代理服务器对用户代理进行身份验证的凭据。在此，再次需要类型，其后是凭据，取决于使用哪种身份验证方案，可以对凭据进行编码或加密。一般表示如下

```http
Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l
Proxy-Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l
```

## HTTP 缓存

通过把`请求/响应`缓存起来有助于提升系统的性能，`Web 缓存`减少了延迟和网络传输量，因此减少资源获取锁需要的时间。由于链路漫长，网络时延不可控，浏览器使用 HTTP 获取资源的成本较高。所以，非常有必要把数据缓存起来，下次再请求的时候尽可能地复用。当 Web 缓存在其存储中具有请求的资源时，它将拦截该请求并直接返回资源，而不是到达源服务器重新下载并获取。这样做可以实现两个小目标

* 减轻服务器负载
* 提升系统性能

下面我们就一起来探讨一下 HTTP 缓存都有哪些

### 不同类型的缓存

HTTP 缓存有几种不同的类型，这些可以分为两个主要类别：`私有缓存` 和 `共享缓存`。

* 共享缓存：共享缓存是一种缓存，它可以存储多个用户重复使用的请求/响应。
* 私有缓存：私有缓存也称为`专用缓存`，它只适用于单个用户。
* 不缓存过期资源：所有的请求都会直接到达服务器，由服务器来下载资源并返回。

> 我们主要探讨`浏览器缓存`和`代理缓存`，但真实情况不只有这两种缓存，还有网关缓存，CDN，反向代理缓存和负载平衡器，把它们部署在 Web 服务器上，可以提高网站和 Web 应用程序的可靠性，性能和可伸缩性。

#### 不缓存过期资源

不缓存过期资源即浏览器和代理不会缓存过期资源，客户端发起的请求会直接到达服务器，可以使用 `no-cache` 标头代表不缓存过期资源。

![](http://www.cxuan.vip/image-20230202214255587.png)

no-cache 属于 Cache-Control 通用标头，其一般的表示方法如下

```http
Cache-Control: no-cache
```

也可以使用 `max-age = 0` 来实现不缓存的效果。

```http
Cache-Control: max-age=0
```

#### 私有缓存

私有缓存只用来缓存单个用户，你可能在浏览器设置中看到了 `缓存`，浏览器缓存包含服务器通过 HTTP 下载下来的所有文档。这个高速缓存用于使访问的文档可以进行前进/后退，保存操作而无需重新发送请求到源服务器。

![](http://www.cxuan.vip/image-20230202214308223.png)

可以使用 `private` 来实现私有缓存，这与 `public` 的用法相反，缓存服务器只对特定的客户端进行缓存，其他客户端发送过来的请求，缓存服务器则不会返回缓存。它的一般表示方法如下

```http
Cache-Control: private
```

#### 共享缓存

共享缓存是一种用于存储要由多个用户重用的响应缓存。共享缓存一般使用 `public` 来表示，`public` 属性只出现在客户端响应中，表示响应可以被任何缓存所缓存。一般表示方法如下

```http
Cache-Control: public
```
![](http://www.cxuan.vip/image-20230202214318774.png)

### 缓存控制

HTTP/1.1 中的 `Cache-Control` 常规标头字段用于执行缓存控制，使用此标头可通过其提供的各种指令来定义缓存策略。下面我们依次介绍一下这些属性

#### 不缓存

`no-store` 才是真正意义上的`不缓存`，每次服务器接受到客户端的请求后，都会返回最新的资源给客户端。

```http
Cache-Control: no-store
```

#### 缓存但需要验证

同上面的 不缓存过期资源

#### 私有和共享缓存

同上

#### 缓存过期

缓存中一个很重要的指令就是`max-age`，这是资源被视为`新鲜`的最长时间 ，与 `Expires` 相反，此指令是相对于请求时间的。对于应用程序中不会更改的文件，通常可以添加主动缓存。下面是 mag-age 的表示

```http
Cache-Control: max-age=31536000
```

#### 缓存验证

`must-revalidate ` 表示缓存必须在使用之前验证过时资源的状态，并且不应使用过期的资源。

```http
Cache-Control: must-revalidate
```

下面是一个缓存验证图

![](http://www.cxuan.vip/image-20230202214336828.png)

### 什么是新鲜的数据

一旦资源存储在缓存中，理论上就可以永远被缓存使用。但是不管是浏览器缓存还是代理缓存，其存储空间是有限的，所以缓存会定期进行清除，这个过程叫做 `缓存回收(cache eviction)` （自译）。另一方面，服务器上的缓存也会定期进行更新，HTTP 作为应用层的协议，它是一种`客户-服务器`模式，HTTP 是无状态的协议，因此当资源发生更改时，服务器无法通知缓存和客户端。因此服务器必须通过某种方式告知客户端缓存已经被更新。服务器会提供`过期时间`这个概念，告知客户端在此到期时间之前，资源是`新鲜的`，也就是未更改过的。在此到期时间的范围之外，资源已过时。`过期算法(Eviction algorithms)` 通常会将新资源优先于陈旧资源使用。

这里需要注意一下，过期的资源并不会被回收或忽略，当高速缓存接收到过期资源时，它会使用 `If-None-Match` 转发此请求，以检查它是否仍然有效。如果有效，服务器会返回 `304 Not Modified`响应头并且没有任何响应体，从而节省了一些带宽。

下面是使用共享缓存代理的过程

![](http://www.cxuan.vip/image-20230202214351432.png)

这个图应该比较好理解，只说一下 Age 的作用，Age 是 HTTP 响应标头告诉客户端源服务器在多久之前创建了响应，它的单位为`秒`，Age 标头通常接近于0，如果是0则可能是从源服务器获取的，如果不是表示可能是由代理服务器创建，那么 Age 的值表示的是**缓存后的响应再次发起认证到认证完成的时间值**。

缓存的有效性是由多个标头来共同决定的，而并非某一个标头来决定。如果指定了 `Cache-control:max-age=N` ，那么缓存会保存 N 秒。如果这个通用标头不存在的话，则会检查是否存在 `Expires` 标头。如果 Exprires 标头存在，那么它的值减去 Date 标头的值就可以确定其有效性。最后，如果`max-age` 和 `expires` 都不存在，就去寻找 `Last-Modified` 标头，如果存在此标头，则高速缓存的有效性等于 Date 标头的值减去 Last-modified 标头的值除以10。

### 缓存验证

当到达缓存资源的有效期时，将对其进行验证或再次获取。仅当服务器提供了`强验证器`或`弱验证器`时，才可以进行验证。

当用户按下重新加载按钮时，将触发重新验证。如果缓存的响应包含 `Cache-control：must-revalidate`标头，则在正常浏览下也会触发该事件。另一个因素是 高级 -> 缓存首选项 面板中的缓存验证首选项。有一个选项可在每次加载文档时强制进行验证。

#### Etag

我们上面提到了强验证器和弱验证器，实现验证器功能的标头正式 Etag 的作用，这意味着 HTTP 用户代理（例如浏览器）不知道该字符串表示什么，并且无法预测其值。如果 Etag 标头是资源响应的一部分，则客户端可以在未来请求的标头中发出 `If-None-Match`，以验证缓存的资源。

`Last-Modified `响应标头可以用作弱验证器，因为它只有1秒可以分辨的时间。如果响应中存在 `Last-Modified `标头，则客户端可以发出 `If-Modified-Since `请求标头来验证缓存资源。（关于 Etag 更多我们会在条件请求介绍）

#### 避免碰撞

通过使用 Etag 和 If-Match 标头，你可以检测避免碰撞。

例如，在编辑 MDN 时，将对当前 Wiki 内容进行哈希处理并将其放入响应中的 Etag 中

```http
Etag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

当将更改保存到 Wiki 页面（发布数据）时，POST 请求将包含 If-Match 标头，其中包含 Etag 值以检查有效性。

```http
If-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

如果哈希值不匹配，则表示文档已在中间进行了编辑，并返回 `412 Precondition Failed` 错误。

#### 缓存未占用资源

Etag 标头的另一个典型用法是缓存未更改的资源，如果用户再次访问给定的 URL（已设置Etag），并且该 URL过时，则客户端将在 If-None-Match 标头字段中发送其 Etag 的值

```http
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

服务器将客户端的 Etag（通过 If-None-Match 发送）与 Etag 进行比较，以获取其当前资源版本，如果两个值都匹配（即资源未更改），则服务器会发回 `304 Not Modified `状态，没有主体，它告诉客户端响应的缓存仍然可以使用。

## HTTP CROS 跨域

CROS 的全称是 `Cross-Origin Resource Sharing(CROS)`，中文译为 `跨域资源共享`，它是一种机制。是一种什么机制呢？它是一种让运行在一个`域(origin)`上的 Web 应用被准许访问来自不同源服务器上指定资源的机制。在搞懂这个机制前，你需要线了解什么是 `域(origin)`

### Origin

Web 概念中`域(Origin)` 的内容由`scheme(protocol) - 协议`，`host(domain) - 主机`和用于访问它的 URL `port - 端口`定义。仅仅当 scheme 、host、port 都匹配时，两个对象才有相同的来源。这种协议相同，域名相同，端口相同的安全策略也被称为 `同源策略（Same Origin Policy)`。某些操作仅限于具有相同来源的内容，可以使用 CORS 取消此限制。

### 跨域的特点

* 下面是跨域问题的例子，看看你是否清楚什么是跨域了

```http
(1) http://example.com/app1/index.html
(2) http://example.com/app2/index.html
```

上面这两个 URL 是否具有跨域问题呢？

上面两个 URL 是不具有跨域问题的，因为这两个 URL 具有相同的`协议(scheme)`和`主机(host)`

* 那么下面这两个是否具有跨域问题呢？

```http
http://Example.com:80
http://example.com
```

这两个 URL 也不具有跨域问题，为什么不具有，端口不一样啊。其实它们两个端口是一样的。

或许你会认为这两个 URL 是不一样的，放心，关于一样不一样的论据我给你抛出来了

>协议和域名部分是不区分大小写的，但是路径部分则根据服务器平台而定。Windows 和 Mac OS X 系统是不区分大小写的，而采用UNIX和Linux系的服务器系统是区分大小写的，

也就是说上面的 `Example.com` 和 `example.com` 其实是一个网址，并且由于两个地址具有相同的 scheme 和 host ，默认情况下服务器通过端口80传递 HTTP 内容，所以上面这两个地址也是相同的。

* 下面这两个 URL 地址是否具有跨域问题？

```http
http://example.com/app1
https://example.com/app2
```

这两个 URL 的 scheme 不同，所以这两个 URL 具有跨域问题

* 再看下面这三个 URL 是否具有跨域问题

```http
http://example.com
http://www.example.com
http://myapp.example.com
```

这三个 URL 也是具有跨域问题的，因为它们隶属于不通服务器的主机 host。

* 下面这两个 URL 是否具有跨域问题

```http
http://example.com
http://example.com:8080
```

这两个 URL 也是具有跨域问题，因为这两个 URL 的默认端口不一样。

### 同源策略

处于安全的因素，浏览器限制了从脚本发起跨域的 HTTP 请求。 `XMLHttpRequest` 和其他 `Fetch 接口` 会遵循 `同源策略(same-origin policy)`。也就是说使用这些 API 的应用程序想要请求相同的资源，那么他们应该具有相同的来源，除非来自其他来源的响应包括正确的 CORS 标头也可以。

同源策略是一种很重要的安全策略，它限制了从一个来源加载的文档或脚本如何与另一个来源的资源进行交互。 它有助于隔离潜在的恶意文档，减少可能的攻击媒介。

我们上面提到，如果两个 URL 具有相同的协议、主机和端口号（如果指定）的话，那么两个 URL 具有相同的来源。下面有一些实例，你判断一下是不是具有相同的来源

目标来源 `http://store.company.com/dir/page.html`

| URL                                             | Outcome  | Reason       |
| ----------------------------------------------- | -------- | ------------ |
| http://store.company.com/dir2/other.html        | 相同来源 | 只有path不同 |
| http://store.company.com/dir/inner/another.html | 相同来源 | 只有path不同 |
| https://store.company.com/page.html             | 不同来源 | 协议不通     |
| http://store.company.com:81/dir/page.html       | 不同来源 | 默认端口不同 |
| http://news.company.com/dir/page.html           | 不同来源 | 主机不同     |

现在我带你认识了两遍不同的源，现在你应该知道如何区分两个 URL 是否属于同一来源了吧！

好，你现在知道了什么是跨域问题，现在我要问你，哪些请求会产生跨域请求呢？这是我们下面要讨论的问题

### 跨域请求

跨域请求可能会从下面这几种请求中发出：

1. 调用 `XMLHttpRequest` 或者 `Fetch` api。

XMLHttpRequest 是什么？（我是后端程序员，前端不太懂，简单解释下，如果解释的不好，还请前端大佬们不要胖揍我）

所有的现代浏览器都有一个内置的 `XMLHttpReqeust` 对象，这个对象可以用于从服务器请求数据。

XMLHttpReqeust 对于开发人员来说很重要，XMLHttpReqeust 对象可以用来做下面这些事情

* 更新网页无需重新刷新页面
* 页面加载后从服务器请求数据
* 页面加载后从服务端获取数据
* 在后台将数据发送到服务器

使用 XMLHttpRequest(XHR) 对象与服务器进行交互，你可以从 URL 检索数据从而不必刷新整个页面，这使网页可以更新页面的一部分，而不会中断用户的操作。XMLHttpRequest 在 `AJAX` 异步编程中使用很广泛。

再来说一下 Fetch API 是什么，Fetch 提供了请求和响应对象（以及其他网络请求）的通用定义。它还提供了相关概念的定义，例如 CORS 和 HTTP Origin 头语义，并在其他地方取代了它们各自的定义。

2. Web 字体（用于 CSS 中@ font-face中的跨域字体使用），以便服务器可以部署 TrueType 字体，这些字体只能由允许跨站点加载和使用的网站使用。
3. WebGL 纹理
4. 使用 `drawImage()` 绘制到画布上的图像/视频帧
5. 图片的 CSS 形状

### 跨域功能概述

跨域资源共享标准通过添加新的 HTTP 标头来工作，这些标头允许服务器描述允许哪些来源从 Web 浏览器读取信息。另外，对于可能导致服务器数据产生副作用的 HTTP 请求方法（尤其是 GET 或者具有某些 MIME 类型 POST 方法以外 HTTP 方法），该规范要求浏览器`预检`请求，使用 HTTP OPTIONS 请求方法从服务器请求受支持的方法，然后在服务器`批准`后发送实际请求。服务器还可以通知客户端是否应与请求一起发送`凭据`（例如 Cookies 和 HTTP 身份验证）。

>注意：CORS 故障会导致错误，但是出于安全原因，该错误的详细信息不适用于 JavaScript。 所有代码都知道发生了错误。 确定具体出问题的唯一方法是查看浏览器的控制台以获取详细信息。

### 访问控制

下面我会和大家探讨三种方案，这些方案都演示了跨域资源共享的工作方式。所有这些示例都使用XMLHttpRequest，它可以在任何支持的浏览器中发出跨站点请求。

#### 简单请求

一些请求不会触发 `CORS预检 `（关于预检我们后面再介绍）。`简单请求`是满足一下所有条件的请求

* 允许以下的方法：`GET`、`HEAD`和 `POST`

* 除了由用户代理自动设置的标头（例如 Connection、User-Agent 或者在 Fetch 规范中定义为禁止标头名称的其他标头）外，唯一允许手动设置的标头是那些 Fetch 规范将其定义为 `CORS安全列出的请求标头` ，它们是：

  * Accept
  * Accept-Language
  * Content-Language
  * Content-Type（下面会介绍）
  * DPR
  * Downlink
  * Save-Data
  * Viewport-Width
  * Width

* Content-Type 标头的唯一允许的值是

  * application/x-www-form-urlencoded
  * multipart/form-data
  * text/plain

* 没有在请求中使用的任何 XMLHttpRequestUpload 对象上注册事件侦听器；这些可以使用XMLHttpRequest.upload 属性进行访问。

* 请求中未使用 ReadableStream对象。

  例如，假定 web 内容 `https://foo.example` 想要获取 `https://bar.other` 域的资源，那么 JavaScript 中的代码可能会像下面这样写

  ```javascript
  const xhr = new XMLHttpRequest();
  const url = 'https://bar.other/resources/public-data/';
     
  xhr.open('GET', url);
  xhr.onreadystatechange = someHandler;
  xhr.send(); 
  ```

这使用 CORS 标头来处理特权，从而在客户端和服务器之间执行某种转换。

![](http://www.cxuan.vip/image-20230202214419443.png)

让我们看看在这种情况下浏览器将发送到服务器的内容，并让我们看看服务器如何响应：

```http
GET /resources/public-data/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Origin: https://foo.example
```

注意请求的标头 Origin ，它表明调用来自于 `https://foo.example`。让我们看看服务器是如何响应的

```http
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 00:23:53 GMT
Server: Apache/2
Access-Control-Allow-Origin: *
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Transfer-Encoding: chunked
Content-Type: application/xml

[…XML Data…]
```

服务端发送 `Access-Control-Allow-Origin` 作为响应。使用 `Origin` 标头和  `Access-Control-Allow-Origin`  展示了最简单的访问控制协议。在这个事例中，服务端使用 `Access-Control-Allow-Origin` 作为响应，也就说明该资源可以被任何域访问。

如果位于`https://bar.other`的资源所有者希望将对资源的访问限制为仅来自`https://foo.example`的请求，他们应该发送如下响应

```http
Access-Control-Allow-Origin: https://foo.example
```

现在除了 `https://foo.example` 之外的任何域都无法以跨域方式访问到 `https://bar.other` 的资源。

#### 预检请求

和上面探讨的简单请求不同，`预检`请求首先通过 `OPTIONS` 方法向另一个域上的资源发送 HTTP 请求，用来确定实际请求是否可以安全的发送。跨站点这样被`预检`，因为它们可能会影响用户数据。

下面是一个预检事例

```javascript
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://bar.other/resources/post-here/');
xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
xhr.setRequestHeader('Content-Type', 'application/xml');
xhr.onreadystatechange = handler;
xhr.send('<person><name>Arun</name></person>'); 
```

上面的事例创建了一个 XML 请求体用来和 POST 请求一起发送。此外，设置了非标准请求头 `X-PINGOTHER` ，这个标头不是 HTTP/1.1 的一部分，但通常对 Web 程序很有用。由于请求的 `Content-Type` 使用 `application/xml`，并且设置了自定义标头，因此该请求被`预检`。如下图所示

![](http://www.cxuan.vip/image-20230202214432747.png)

> 如下所述，实际的 POST 请求不包含 Access-Control-Request- * 标头；只有 OPTIONS 请求才需要它们。

下面我们来看一下完整的客户端/服务器交互，首先是预检请求/响应

```http
OPTIONS /resources/post-here/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Origin: http://foo.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type

```

```http
HTTP/1.1 204 No Content
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
Vary: Accept-Encoding, Origin
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
```

上面的1 -11 行代表预检请求，预检请求使用 `OPYIIONS` 方法，浏览器根据上面的 JavaScript 代码段所使用的请求参数确定是否需要发送此请求，以便服务器可以响应是否可以使用实际请求参数发送请求。OPTIONS 是一种 HTTP / 1.1方法，用于确定来自服务器的更多信息，并且是一种安全的方法，这意味着它不能用于更改资源。请注意，与 OPTIONS 请求一起，还发送了另外两个请求标头（分别是第9行和第10行）

```HTTP
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type
```

`Access-Control-Request-Method` 标头作为预检请求的一部分通知服务器，当发送实际请求时，将使用`POST` 请求方法发送该请求。

`Access-Control-Request-Headers` 标头通知服务器，当发送请求时，它将与X-PINGOTHER 和 Content-Type 自定义标头一起发送。服务器可以确定这种情况下是否接受请求。

下面的 1 - 11行是服务器发回的响应，表示`POST` 请求和 `X-PINGOTHER` 是可以接受的，我们着重看一下下面这几行

```http
Access-Control-Allow-Origin: http://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
```

服务器完成响应表明源 `http://foo.example` 是可以接受的 URL，能够允许 `POST、GET、OPTIONS` 进行请求，允许自定义标头 `X-PINGOTHER, Content-Type`。最后，`Access-Control-Max-Age` 以秒为单位给出一个值，这个值表示对预检请求的响应可以缓存多长时间，在此期间内无需发送其他预检请求。

完成预检请求后，将发送实际请求：

```http
POST /resources/post-here/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
X-PINGOTHER: pingpong
Content-Type: text/xml; charset=UTF-8
Referer: https://foo.example/examples/preflightInvocation.html
Content-Length: 55
Origin: https://foo.example
Pragma: no-cache
Cache-Control: no-cache

<person><name>Arun</name></person>
```

```http
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:40 GMT
Server: Apache/2
Access-Control-Allow-Origin: https://foo.example
Vary: Accept-Encoding, Origin
Content-Encoding: gzip
Content-Length: 235
Keep-Alive: timeout=2, max=99
Connection: Keep-Alive
Content-Type: text/plain

[Some GZIP'd payload]
```

正式响应中很多标头我们在之前的文章已经探讨过了，本篇不再做详细的介绍，读者可以参考
[你还在为 HTTP 的这些概念头疼吗？](https://mp.weixin.qq.com/s?__biz=MzU2NDg0OTgyMA==&mid=2247485214&idx=1&sn=2cec80cfd606f4b4444db974246ee75e&chksm=fc45faedcb3273fb48dd5a16e4c375680adb8c6e59a52455f14ac2c2e0afda0c9265ff544044&token=347964925&lang=zh_CN#rd) 查阅

#### 带凭证的请求

XMLHttpRequest 或 Fetch 和 CORS 最有趣的功能就是能够发出知道 HTTP Cookie 和 HTTP 身份验证的 `凭证` 请求。默认情况下，在跨站点 XMLHttpRequest 或 Fetch 调用中，浏览器将不发送凭据。调用 XMLHttpRequest对象或 Request 构造函数时必须设置一个特定的标志。

在下面这个例子中，最初从 `http://foo.example` 加载的内容对设置了 Cookies 的 `http://bar.other` 上的资源进行了简单的 GET 请求， foo.example 上可能的代码如下

```javascript
const invocation = new XMLHttpRequest();
const url = 'http://bar.other/resources/credentialed-content/';
    
function callOtherDomain() {
  if (invocation) {
    invocation.open('GET', url, true);
    invocation.withCredentials = true;
    invocation.onreadystatechange = handler;
    invocation.send(); 
  }
}
```

第7行显示 XMLHttpRequest 上的标志，必须设置该标志才能使用 Cookie 进行调用。默认情况下，调用是不在使用 Cookie 的情况下进行的。由于这是一个简单的 GET 请求，因此不会进行预检，但是浏览器将拒绝任何没有 Access-Control-Allow-Credentials 的响应：标头为true，指的是响应不会返回 web 页面的内容。

上面的请求用下图可以表示

![](http://www.cxuan.vip/image-20230202214456194.png)

这是客户端和服务器之间的示例交换：

```http
GET /resources/access-control-with-credentials/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Referer: http://foo.example/examples/credential.html
Origin: http://foo.example
Cookie: pageAccess=2
```

```http
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:34:52 GMT
Server: Apache/2
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Credentials: true
Cache-Control: no-cache
Pragma: no-cache
Set-Cookie: pageAccess=3; expires=Wed, 31-Dec-2008 01:34:53 GMT
Vary: Accept-Encoding, Origin
Content-Encoding: gzip
Content-Length: 106
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain


[text/plain payload]
```

上面第10行包含指向`http://bar.other` 上的内容 Cookie，但是如果 bar.other 没有以 `Access-Control-Allow-Credentials:true` 响应（下面第五行），响应将被忽略，并且不能使用网站返回的内容。

**请求凭证和通配符**

当回应凭证请求时，服务器必须在 `Access-Control-Allow-Credentials` 中指定一个来源，而不能直接写`*` 通配符

因为上面示例代码中的请求标头包含 Cookie 标头，如果 `Access-Control-Allow-Credentials` 中是指定的通配符 `*` 的话，请求会失败。

注意上面示例中的 `Set-Cookie` 响应标头还设置了另外一个值，如果发生故障，将引发异常（取决于所使用的API）。

###HTTP 响应标头

下面会列出一些服务器跨域共享规范定义的 HTTP 标头，上面简单概述了一下，现在一起来认识一下，主要会介绍下面这些

* Access-Control-Allow-Origin
* Access-Control-Allow-Credentials
* Access-Control-Allow-Headers
* Access-Control-Allow-Methods
* Access-Control-Expose-Headers
* Access-Control-Max-Age
* Access-Control-Request-Headers
* Access-Control-Request-Method
* Origin

#### Access-Control-Allow-Origin

`Access-Control-Allow-Origin` 是 HTTP 响应标头，指示响应是否能够和给定的源共享资源。Access-Control-Allow-Origin 指定单个资源会告诉浏览器允许指定来源访问资源。对于没有凭据的请求 `*`通配符，告诉浏览器允许任何源访问资源。

例如，如果要允许源 `https://mozilla.org` 的代码访问资源，可以使用如下的指定方式

```http
Access-Control-Allow-Origin: https://mozilla.org
Vary: Origin
```

如果服务器指定单个来源而不是`*`通配符，则服务器还应在 Vary 响应标头中包含该来源。

#### Access-Control-Allow-Credentials

`Access-Control-Allow-Credentials` 是 HTTP 的响应标头，这个标头告诉浏览器，当包含凭证请求（Request.credentials）时是否将响应公开给前端 JavaScript 代码。

这时候你会问到 `Request.credentials` 是什么玩意？不要着急，来给你看一下，首先来看 Request 是什么玩意，

实际上，Request 是 Fetch API 的一类接口代表着资源请求。一般创建 Request 对象有两种方式

* 使用 Request() 构造函数创建一个 Request 对象
* 还可以通过 FetchEvent.request api 操作来创建

再来说下 Request.credentials 是什么意思，Request 接口的凭据只读属性指示在跨域请求的情况下，用户代理是否应从其他域发送 cookie。（其他 Request 对象的方法详见 https://developer.mozilla.org/en-US/docs/Web/API/Request）

当发送的是凭证模式的请求包含 （Request.credentials）时，如果 Access-Control-Allow-Credentials 值为 true，浏览器将仅向前端 JavaScript 代码公开响应。

```http
Access-Control-Allow-Credentials: true
```

凭证一般包括 **cookie、认证头和 TLS 客户端证书**

> 当用作对预检请求响应的一部分时，这表明是否可以使用凭据发出实际请求。注意简单的 `GET` 请求不会进行预检。

可以参考一个实际的例子 https://www.jianshu.com/p/ea485e5665b3

#### Access-Control-Allow-Headers

`Access-Control-Allow-Headers` 是一个响应标头，这个标头用来响应预检请求，它发出实际请求时可以使用哪些HTTP标头。

**示例**

* 自定义标头

这是 Access-Control-Allow-Headers 标头的示例。它表明除了像 CROS 安全列出的请求标头外，对服务器的 CROS 请求还支持名为 `X-Custom-Header` 的自定义标头。

```http
Access-Control-Allow-Headers: X-Custom-Header
```

* 多个标头

这个例子展示了 Access-Control-Allow-Headers 如何使用多个标头

```http
Access-Control-Allow-Headers: X-Custom-Header, Upgrade-Insecure-Requests
```

* 绕过其他限制

尽管始终允许使用 CORS 安全列出的请求标头，并且通常不需要在 Access-Control-Allow-Headers 中列出这些标头，但是无论如何列出它们都将绕开适用的其他限制。

```http
Access-Control-Allow-Headers: Accept
```

这里你可能会有疑问，哪些是 CORS 列出的安全标头？（别嫌累，就是这么麻烦）

有下面这些 **Accep、Accept-Language、Content-Language、Content-Type** ，当且仅当包含这些标头时，无需在 CORS 上下文中发送预检请求。

#### Access-Control-Allow-Methods

`Access-Control-Allow-Methods` 也是响应标头，它指定了哪些访问资源的方法可以使用预检请求。例如

```http
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Methods: *
```

#### Access-Control-Expose-Headers

Access-Control-Expose-Headers 响应标头表明哪些标头可以作为响应的一部分公开。默认情况下，仅公开6个CORS安全列出的响应标头，分别是

* Cache-Control
* Content-Language
* Content-Type
* Expires
* Last-Modified
* Pragma

如果希望客户端能够访问其他标头，则必须使用 Access-Control-Expose-Headers 标头列出它们。下面是示例

要公开非 CORS 安全列出的请求标头，可以像如下这样指定

```http
Access-Control-Expose-Headers: Content-Length
```

要另外公开自定义标头，例如 X-Kuma-Revision，可以指定多个标头，并用逗号分隔

```http
Access-Control-Expose-Headers: Content-Length, X-Kuma-Revision
```

在不是凭证请求中，你还可以使用通配符

```http
Access-Control-Expose-Headers: *
```

但是，这不会通配 `Authorization` 标头，因此如果需要公开它，则需要明确列出

```http
Access-Control-Expose-Headers: *, Authorization
```

#### Access-Control-Max-Age

Access-Control-Max-Age 响应头表示预检请求的结果可以缓存多长时间，例如

```http
Access-Control-Max-Age: 600 
```

表示预检请求可以缓存10分钟

#### Access-Control-Request-Headers

浏览器在发出预检请求时使用 Access-Control-Request-Headers 请求标头，使服务器知道在发出实际请求时客户端可能发送的 HTTP 标头。

```http
Access-Control-Request-Headers: X-PINGOTHER, Content-Type
```

####Access-Control-Request-Method

同样的，Access-Control-Request-Method 响应标头告诉服务器发出预检请求时将使用那种 HTTP 方法。此标头是必需的，**因为预检请求始终是 OPTIONS**，并且使用的方法与实际请求不同。

```http
Access-Control-Request-Method: POST
```

#### Origin

Origin 请求标头表明匹配的来源，它不包含任何信息，仅仅包含服务器名称，它与 CORS 请求以及 POST 请求一起发送，它类似于 `Referer` 标头，但与此标头不同，它没有公开整个路径。例如

```http
Origin: https://developer.mozilla.org
```

## HTTP 条件请求

HTTP 具有条件请求的概念，通过比较资源更新生成的值与验证器的值进行比较，来确定资源是否进行过更新。这样的请求对于验证缓存的内容、条件请求、验证资源的完整性来说非常重要。

### 原则

HTTP 条件请求是根据特定标头的值执行不同的请求，这些标头定义了一个前提条件，如果前提条件匹配或不匹配，则请求的结果将有所不同。

* 对于 `安全` 的方法，像是 `GET`、用于请求文档的资源，仅当条件请求的条件满足时发回文档资源，所以，这种方式可以节约带宽。

>什么是安全的方法，对于 HTTP 来说，**安全的方法是不会改变服务器状态的方法**，换句话说，如果方法只是只读操作，那么它肯定是安全的方法，比如说 GET 请求，它肯定是安全的方法，因为它只是请求资源。几种常见的方法肯定是安全的，它们是 **GET、HEAD和 OPTIONS**。所有安全的方法都是`幂等的`（这他妈幂等又是啥意思？）但不是所有幂等的方法都是安全的，例如 PUT 和 DELETE 都是幂等的，但不安全。 
>
>幂等性：如果相同的客户端发起一次或者多次 HTTP 请求会得到相同的结果，则说明 HTTP 是幂等的。（我们这次不深究幂等性）

* 对于 `非安全` 的方法，像是 PUT，只有原始文档与服务器上存储的资源相同时，才可以使用条件请求来传输文档。（PUT 方法通常用来传输文件，就像 FTP 协议的文件上传一样）

### 验证

所有的条件请求都会尝试检查服务器上存储的资源是否与某个特定版本的资源相匹配。为了满足这种情况，条件请求需要指示资源的版本。由于无法和整个文件逐个字符进行比较，因此需要把整个文件描绘成一个值，然后把此值和服务器上的资源进行比较，这种方式称为比较器，比较器有两个条件

* 文档的最后修改日期
* 一个不透明的字符串，用于唯一标识每个版本，称为实体标签或 `Etag`。

比较两个资源是否时相同的版本有些复杂，根据上下文，有两种相等性检查

* 当期望的是字节对字节进行比较时，例如在恢复下载时，使用`强 Etag `进行验证
* 当用户代理需要比较两个资源是否具有相同的内容时，使用`若 Etag` 进行验证

HTTP 协议默认使用 `强验证`，它指定何时进行弱验证

#### 强验证

强验证保证的是`字节` 级别的验证，严格的验证非常严格，可能在服务器级别难以保证，但是它能够保证任何时候都不会丢失数据，但这种验证丢失性能。

要使用 `Last-Modified` 很难实现强验证，通常，这是通过使用带有资源的 MD5 哈希值的 `Etag` 来完成的。

#### 弱验证

弱验证不同于强验证，因为如果内容相等，它将认为文档的两个版本相同，例如，一个页面与另一个页面的不同之处仅在于页脚的日期不同，因此该页面被认为与其他页面相同。而使用强验证时则被认为这两个版本是不同的。构建一个若验证的 Etag 系统可能会非常复杂，因为这需要了解每个页面元素的重要性，但是对于优化缓存性能非常有用。

下面介绍一下 Etag 如何实现强弱验证。

Etag 响应头是`特定版本`的标识，它能够使缓存变得更高效并能够节省带宽，因为如果缓存内容未发生变更，Web 服务器则不需要重新发送完整的响应。除此之外，Etag 能够防止资源同时更新互相覆盖。

![](http://www.cxuan.vip/image-20230202214510731.png)

如果给定 URL 上的资源发生变更，必须生成一个新的 `Etag` 值，通过比较它们可以确定资源的两个表示形式是否相同。

Etag 值有两种，一种是强 Etag，一种是弱 Etag；

* 强 Etag 值，无论实体发生多么细微的变化都会改变其值，一般的表示如下

```http
Etag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

* 弱 Etag 值，弱 Etag 值只用于提示资源是否相同。只有资源发生了根本改变，产生差异时才会改变 Etag 值。这时，会在字段值最开始处附加 W/。

```http
Etag: W/"0815"
```

下面就来具体探讨一下条件请求的标头和 Etag 的关系

### 条件请求

条件请求主要包含的标头如下

* If-Match
* If-None-Match
* If-Modified-Since
* If-Unmodified-Since
* If-Range

#### If-Match

对于 `GET` 和 `POST` 方法，服务器仅在与列出的 `Etag（响应标头）` 之一匹配时才返回请求的资源。这里又多了一个新词 `Etag`，我们稍后再说 Etag 的用法。对于像是 `PUT` 和其他非安全的方法，在这种情况下，它仅仅将上传资源。

下面是两种常见的案例

* 对于 `GET` 和 `POST` 方法，会结合使用 `Range` 标头，它可以确保新发送请求的范围与上一个请求的资源相同，如果不匹配的话，会返回 `416` 响应。
* 对于其他方法，特别是 `PUT` 方法，`If-Match` 可以防止丢失更新，服务器会比对 If-Match 的字段值和资源的 Etag 值，仅当两者一致时，才会执行请求。反之，则返回状态码 412 Precondition Failed 的响应。例如

```http
If-Match: "bfc13a64729c4290ef5b2c2730249c88ca92d82d"
If-Match: *
```

#### If-None-Match

条件请求，它与 `If-Match` 的作用相反，仅当 `If-None-Match` 的字段值与 `Etag` 值不一致时，可处理该请求。对于`GET` 和 `HEAD` ，仅当服务器没有与给定资源匹配的 `Etag` 时，服务器将返回 `200 OK`作为响应。对于其他方法，仅当最终现有资源的 Etag 与列出的任何值都不匹配时，才会处理请求。

当 `GET` 和 `POST` 发送的 `If-None-Match`与 `Etag` 匹配时，服务器会返回 `304`。

```http
If-None-Match: "bfc13a64729c4290ef5b2c2730249c88ca92d82d"
If-None-Match: W/"67ab43", "54ed21", "7892dd"
If-None-Match: *
```

#### If-Modified-Since

`If-Modified-Since` 是 HTTP 条件请求的一部分，只有在给定日期之后，服务端修改了请求所需要的资源，才会返回 200 OK 的响应。如果在给定日期之后，服务端没有修改内容，响应会返回 `304` 并且不带任何响应体。If-Modified-Since 只能使用 `GET` 和 `HEAD` 请求。

If-Modified-Since 与 If-None-Match 结合使用时，它将被忽略，除非服务器不支持 If-None-Match。一般表示如下

```http
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT 
```

> 注意：这是格林威治标准时间。 HTTP 日期始终以格林尼治标准时间表示，而不是本地时间。

#### If-Range

`If-Range` 也是条件请求，如果满足条件（If-Range 的值和 Etag 值或者更新的日期时间一致），则会发出范围请求，否则将会返回全部资源。它的一般表示如下

```http
If-Range: Wed, 21 Oct 2015 07:28:00 GMT 
If-Range: bfc13a64729c4290ef5b2c2730249c88ca92d82d
```

#### If-Unmodified-Since

`If-Unmodified-Since` HTTP 请求标头也是一个条件请求，服务器只有在给定日期之后没有对其进行修改时，服务器才返回请求资源。如果在指定日期时间后发生了更新，则以状态码 `412 Precondition Failed` 作为响应返回。

```http
If-Unmodified-Since: Wed, 21 Oct 2015 07:28:00 GMT 
```

### 条件请求示例

#### 缓存更新

条件请求最常见的示例就是更新缓存，如果缓存是空或没有缓存，则以`200 OK`的状态发送回请求的资源。如下图所示

![](http://www.cxuan.vip/image-20230202214529628.png)

客户端第一次发送请求没有，缓存为空并且没有条件请求，服务器在收到客户端请求后，设置验证器 `Last-Modified` 和 `Etag` 标签，并把这两个标签随着响应一起发送回客户端。

下一次客户端再发送相同的请求后，会直接从缓存中提取，只要缓存没有过期，就不会有任何新的请求到达服务器重新下载资源。但是，一旦缓存过期，客户端不会直接使用缓存的值，而是发出条件请求。 验证器的值用作 `If-Modified-Since` 和` If-Match`标头的参数。

缓存过期后客户端重新发起请求，服务器收到请求后发现如果资源没有更改，服务器会发回 `304 Not Modified`响应，这使缓存再次刷新，并让客户端使用缓存的资源。 尽管有一个响应/请求往返消耗一些资源，但是这比再次通过有线传输整个资源更有效。

![](http://www.cxuan.vip/image-20230202214540961.png)

如果资源已经发生更改，则服务器仅使用新版本的资源返回 200 OK 响应，就像没有条件请求，并且客户端会重新使用新的资源，从这个角度来讲，**缓存是条件请求的前置条件**。

![](http://www.cxuan.vip/image-20230202214557285.png)

#### 断点续传

HTTP 可以支持文件的部分下载，通过保留已获得的信息，此功能允许恢复先前的操作，从而节省带宽和时间。

![](http://www.cxuan.vip/image-20230202214609253.png)

支持断点续传的服务器通过发送 `Accept-Ranges` 标头广播此消息，一旦发生这种情况，客户端可以通过发送缺少范围的 `Ranges `标头来恢复下载

![](http://www.cxuan.vip/image-20230202214623562.png)

这里你可能有疑问 `Ranges` 和 `Content-Range`是什么，来解释一下

**Range**

`Range` HTTP 请求标头指示服务器应返回文档指定部分的资源，可以一次请求一个 Range 来返回多个部分，服务器会将这些资源返回各个文档中。如果服务器成功返回，那么将返回 206 响应；如果 Range 范围无效，服务器返回`416 Range Not Satisfiable`错误；服务器还可以忽略 Range 标头，并且返回 200 作为响应。

```http
Range: bytes=200-1000, 2000-6576, 19000-
```

还有一种表示是 

```http
Range: bytes=0-499, -500 
```

它们分别表示请求前500个字节和最后500个字节，如果范围重叠，则服务器可能会拒绝该请求。

**Content-Range**

HTTP 的 Content-Range 响应标头是针对范围请求而设定的，返回响应时使用首部字段 `Content-Range`，能够告知客户端响应实体的哪部分是符合客户端请求的，字段以字节为单位。它的一般表示如下

```http
Content-Range: bytes 200-1000/67589 
```

上段代码表示从所有 `67589` 个字节中返回 `200-1000` 个字节的内容

那么上面的 `Content-Range`你也应该知道是什么意思了

`断点续传`的原理比较简单，但是这种方式存在潜在的问题：如果在两次下载资源的期间进行了资源更新，那么获得的范围将对应于资源的两个不同版本，并且最终文档将被破坏。

为了阻止这种情况的出现，就会使用`条件请求`。对于范围来说，有两种方法可以做到这一点。一种方法是使用 `If-Modified-Since`和`If-Match`，如果前提条件失败，服务器将返回错误；然后客户端从头开始重新下载。

![](http://www.cxuan.vip/image-20230202214635564.png)

即使此方法有效，当文档资源发生改变时，它也会添加额外的 `响应/请求` 交换。这会降低性能，并且 HTTP 具有特定的标头来避免这种情况 `If-Range`。

![](http://www.cxuan.vip/image-20230202214647507.png)

该解决方案效率更高，但灵活性稍差一些，因为在这种情况下只能使用一个 Etag。

#### 通过乐观锁避免丢失更新

Web 应用程序中最普遍的操作是资源更新。这在任何文件系统或应用程序中都很常见，但是任何允许存储远程资源的应用程序都需要这种机制。

使用 `put` 方法，你可以实现这一点，客户端首先读取原始文件对其进行修改，然后把它们发送到服务器。

![](http://www.cxuan.vip/image-20230202214658190.png)

上面这种请求响应存在问题，一旦考虑到并发性，事情就会变得不准确。当客户端在本地修改资源打算重新发送之前，第二个客户端可以获取相同的资源并对资源进行修改操作，这样就会造成问题。当它们重新发送请求到服务器时，第一个客户端所做的修改将被第二次客户端的修改所覆盖，因为第二次客户端修改并不知道第一次客户端正在修改。资源提交并更新的一方不会传达给另外一方，所以要保留哪个客户的更改，将随着他们提交的速度而变化； 这取决于客户端，服务器的性能，甚至取决于人工在客户端编辑文档的性能。 例如下面这个流程

![](http://www.cxuan.vip/image-20230202214712279.png)

如果没有两个用户同时操作服务器，也就不存在这个问题。但是，现实情况是不可能只有单个用户出现的，所以为了规避或者避免这个问题，我们希望客户端资源在更新时进行提示或者修改被拒绝时收到通知。

条件请求允许实现乐观锁算法。这个概念是允许所有的客户端获取资源的副本，然后让他们在本地修改资源，并成功通过允许第一个客户端提交更新来控制并发，基于此服务端的后面版本的更新都将被拒绝。

![](http://www.cxuan.vip/image-20230202214723065.png)

这是使用 `If-Match` 或 `If-Unmodified-Since`标头实现的。如果 Etag 与原始文件不匹配，或者自获取以来已对文件进行了修改，则更改为拒绝更新，并显示`412 Precondition Failed`错误。

## HTTP Cookies

HTTP 协议中的 Cookie 包括 `Web Cookie` 和`浏览器 Cookie`，它是服务器发送到 Web 浏览器的一小块数据。服务器发送到浏览器的 Cookie，浏览器会进行存储，并与下一个请求一起发送到服务器。通常，它用于判断两个请求是否来自于同一个浏览器，例如用户保持登录状态。

>HTTP Cookie 机制是 HTTP 协议无状态的一种补充和改良

Cookie 主要用于下面三个目的

* `会话管理`

登陆、购物车、游戏得分或者服务器应该记住的其他内容

* `个性化`

用户偏好、主题或者其他设置

* `追踪`

记录和分析用户行为

Cookie 曾经用于一般的客户端存储。虽然这是合法的，因为它们是在客户端上存储数据的唯一方法，但如今建议使用现代存储 API。Cookie 随每个请求一起发送，因此它们可能会降低性能（尤其是对于移动数据连接而言）。客户端存储的现代 API 是 Web 存储 API（localStorage 和 sessionStorage）和 IndexedDB。

### 创建 Cookie

当接收到客户端发出的 HTTP 请求时，服务器可以发送带有响应的 `Set-Cookie` 标头，Cookie 通常由浏览器存储，然后将 Cookie 与 HTTP 标头一同向服务器发出请求。可以指定到期日期或持续时间，之后将不再发送Cookie。此外，可以设置对特定域和路径的限制，从而限制 cookie 的发送位置。

#### Set-Cookie 和 Cookie 标头

`Set-Cookie` HTTP 响应标头将 cookie 从服务器发送到用户代理。下面是一个发送 Cookie 的例子

```http
HTTP/2.0 200 OK
Content-type: text/html
Set-Cookie: yummy_cookie=choco
Set-Cookie: tasty_cookie=strawberry

[page content]
```

此标头告诉客户端存储 Cookie

现在，随着对服务器的每个新请求，浏览器将使用 Cookie 头将所有以前存储的 cookie 发送回服务器。

```http
GET /sample_page.html HTTP/2.0
Host: www.example.org
Cookie: yummy_cookie=choco; tasty_cookie=strawberry
```

Cookie 主要分为三类，它们是 `会话Cookie`、`永久Cookie` 和 `Cookie的 Secure 和 HttpOnly 标记`，下面依次来介绍一下

#### 会话 Cookies

上面的示例创建的是会话 Cookie ，会话 Cookie 有个特征，客户端关闭时 Cookie 会删除，因为它没有指定Expires 或 Max-Age 指令。 这两个指令你看到这里应该比较熟悉了。

但是，Web 浏览器可能会使用会话还原，这会使大多数会话 Cookie 保持永久状态，就像从未关闭过浏览器一样

#### 永久性 Cookies

永久性 Cookie 不会在客户端关闭时过期，而是在特定日期（Expires）或特定时间长度（Max-Age）外过期。例如

```http
Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT;
```

#### Cookie的 Secure 和 HttpOnly 标记

安全的 Cookie 需要经过 HTTPS 协议通过加密的方式发送到服务器。即使是安全的，也不应该将敏感信息存储在cookie 中，因为它们本质上是不安全的，并且此标志不能提供真正的保护。

**HttpOnly 的作用**

* 会话 cookie 中缺少 HttpOnly 属性会导致攻击者可以通过程序(JS脚本、Applet等)获取到用户的 cookie  信息，造成用户cookie 信息泄露，增加攻击者的跨站脚本攻击威胁。

* HttpOnly 是微软对 cookie 做的扩展，该值指定 cookie 是否可通过客户端脚本访问。 

* 如果在 Cookie 中没有设置 HttpOnly 属性为 true，可能导致 Cookie 被窃取。窃取的 Cookie 可以包含标识站点用户的敏感信息，如 ASP.NET 会话 ID 或 Forms 身份验证票证，攻击者可以重播窃取的 Cookie，以便伪装成用户或获取敏感信息，进行跨站脚本攻击等。 

### Cookie 的作用域

`Domain` 和 `Path` 标识定义了 Cookie 的作用域：即 Cookie 应该发送给哪些 URL。

`Domain` 标识指定了哪些主机可以接受 Cookie。如果不指定，默认为当前主机(**不包含子域名**）。如果指定了`Domain`，则一般包含子域名。

例如，如果设置 `Domain=mozilla.org`，则 Cookie 也包含在子域名中（如`developer.mozilla.org`）。

例如，设置 `Path=/docs`，则以下地址都会匹配：

- `/docs`
- `/docs/Web/`
- `/docs/Web/HTTP`

如果你在阅读文章的过程中发现错误和问题，请及时与我联系！

如果文章对你有帮助，希望小伙伴们三连走起！


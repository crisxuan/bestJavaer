# HTTP 核心概念

* [HTTP 核心概念](#http-核心概念)
   * [HTTP 标头](#http-标头)
      * [通用标头](#通用标头)
         * [Cache-Control](#cache-control)
         * [Connection](#connection)
         * [Date](#date)
         * [Pragma](#pragma)
         * [Trailer](#trailer)
         * [Transfer-Encoding](#transfer-encoding)
         * [Upgrade](#upgrade)
         * [Via](#via)
         * [Warning](#warning)
      * [请求标头](#请求标头)
         * [Accept](#accept)
         * [Accept-Charset](#accept-charset)
         * [Accept-Encoding](#accept-encoding)
         * [Accept-Language](#accept-language)
         * [Authorization](#authorization)
         * [Expect](#expect)
         * [From](#from)
         * [Host](#host)
         * [If-Match](#if-match)
         * [If-Modified-Since](#if-modified-since)
         * [If-None-Match](#if-none-match)
         * [If-Range](#if-range)
         * [If-Unmodified-Since](#if-unmodified-since)
         * [Max-Forwards](#max-forwards)
         * [Proxy-Authorization](#proxy-authorization)
         * [Range](#range)
         * [Referer](#referer)
         * [TE](#te)
         * [User-Agent](#user-agent)
      * [响应标头](#响应标头)
         * [Accept-Ranges](#accept-ranges)
         * [Age](#age)
         * [ETag](#etag)
         * [Location](#location)
         * [Proxy-Authenticate](#proxy-authenticate)
         * [Retry-After](#retry-after)
         * [Server](#server)
         * [Vary](#vary)
         * [www-Authenticate](#www-authenticate)
         * [Access-Control-Allow-Origin](#access-control-allow-origin)
      * [实体标头](#实体标头)
         * [Allow](#allow)
         * [Content-Encoding](#content-encoding)
         * [Content-Language](#content-language)
         * [Content-Length](#content-length)
         * [Content-Location](#content-location)
         * [Content-MD5](#content-md5)
         * [Content-Range](#content-range)
         * [Content-Type](#content-type)
         * [Expires](#expires)
         * [Last-Modified](#last-modified)
   * [总结](#总结)

上一篇文章我们大致讲解了一下 HTTP 的基本特征和使用，大家反响很不错，那么本篇文章我们就来深究一下 HTTP 的特性。我们接着上篇文章没有说完的 HTTP 标头继续来介绍（此篇文章会介绍所有标头的概念，但没有深入底层）

## HTTP 标头

先来回顾一下 HTTP1.1 标头都有哪几种

HTTP 1.1 的标头主要分为四种，`通用标头`、`实体标头`、`请求标头`、`响应标头`，现在我们来对这几种标头进行介绍

### 通用标头

HTTP 通用标头之所以这样命名，是因为与其他三个类别不同，它们不是限定于特定种类的消息或者消息组件（请求，响应或消息实体）的。HTTP 通用标头主要用于传达有关消息本身的信息，而不是它所携带的内容。它们提供一般信息并控制如何处理和处理消息。

尽管通用标头不会限定于是请求还是响应报文，但是某些通用标头大部分或全部用于一种特定类型的请求中。也就是说，如果某个通用标头出现在请求报文中，那么大部分通用标头都会显示在该请求报文中。响应报文也是一样的。

先列出来一个清单，讲明我们都需要介绍哪些通用标头

* Cache-Control
* Connection
* Date
* Pragma
* Trailer
* Transfer-Encoding
* Upgrade
* Via
* Warning

#### Cache-Control

`缓存（Cache）`是计算机领域里的一个重要概念，是优化系统性能的利器。不仅计算机中的 CPU 为了提高指令执行效率从而选择使用寄存器作为辅助，计算机网络同样存在缓存，下面我们就来介绍一下计算机网络中的缓存。

`Cache-Control` 是通用标头的指令，它能够管理如何对 HTTP 的请求或者响应使用缓存。

因为计算机网络中是可以有`第三者`出现的，也就是`缓存服务器`，这个指令通过影响`请求/响应`中的缓存服务器从而达到控制缓存的目的；不仅有缓存服务器，还有浏览器内部缓存也会影响链路的缓存。

这个标头中可以出现许多单独的指令，其详细信息可以在 RFC 2616 中找到，**即使这是常规标头，某些指令也只能出现在请求或响应中**。下表提供了一个 Cache-Control 选项的总结并告诉你如何去使用

>请注意，在 Cache-Control 标头中只能出现一个指令，但是在消息中可以出现多个这样的标头。

![](http://www.cxuan.vip/image-20230202213249541.png)

上面这个表格其实会有四种分类

* `可缓存性`： 它们分别是 `no-cache`、`no-store`、`private` 和 `public`
* `缓存有效性时间`： 它们分别是 `max-age`、`s-maxage`、`max-stale`、`min-fresh`
* `重新验证并重新加载`： 它们分别是 `must-revalidate` 和 `proxy-revalidate`
* `其他`： 它们分别是 `only-if-cached` 和 `no-transform`

分别对表格中的内容进行一下详细介绍

**no-cache**

`no-cache` 很容易和 `no-store` 混淆，一般都会把 `no-cache` 认为是不缓存，其实不是这样。

使用 no-cache 指令的目的是**为了防止从缓存中返回过期的资源**，例如下图所示

```http
Cache-Control: no-cache
```

![](http://www.cxuan.vip/image-20230202213306924.png)

举个例子你就明白了，No-Cache 就相当于是`吃着碗里的，占着锅里的`，如果锅里还有新的肉片，就先吃锅里的，如果锅里没有新的，再吃自己的，这里`锅里的`就相当于是源服务器产生的，`碗里的`就相当于是缓存的。

**no-store**

`no-store` 才是真正意义上的`不缓存`，每次服务器接受到客户端的请求后，都会返回最新的资源给客户端。

```http
Cache-Control: no-store
```

**max-age**

`max-age` 可以用在请求或者响应中，当客户端发送带有 max-age 的指令时，缓存服务器会判断自己缓存时间的数值和 max-age 的大小，如果比 max-age 小，那么缓存有效，可以继续给客户端返回缓存的数据，如果比 max-age 大，那么缓存服务器将不能返回给客户端缓存的数据。

```http
Cache-Control: max-age=60
```

如果 `max-age = 0`，那么缓存服务器将会直接把请求转发到服务器

```http
Cache-Control: max-age=0
```

>注意：这个 max-age 的值是相对于请求时间的

**must-revalidate**

表示一旦资源过期，缓存就必须在原始服务器上没有成功验证的情况下才使用其过期的数据。

```http
Cache-Control: must-revalidate
```

`no-store` 、`no_cache` 、 `must-revalidate` 和 `max-age` 可以一起看，下面是一个这四个标头的流程图

![](http://www.cxuan.vip/image-20230202213557104.png)

**public**

`public` 属性只出现在客户端响应中，表示响应可以被任何缓存所缓存。在计算机网络中，分为两种缓存，共享缓存和私有缓存，如下所示

```http
Cache-Control: public
```

![](http://www.cxuan.vip/image-20230202213611342.png)

**private**

当指定 `private ` 指令后，响应只以特定的用户作为对象，这与 `public` 的用法相反，缓存服务器只对特定的客户端进行缓存，其他客户端发送过来的请求，缓存服务器则不会返回缓存。

```http
Cache-Control: private
```

![](http://www.cxuan.vip/image-20230202213623143.png)

**s-maxage**

`s-maxage` 指令的功能和 `max-age` 指令的功能相同，不同点之处在于 s-maxage 不能用于私有缓存，只能用于多用户使用的公共服务器，对于同一用户的重复请求和响应来说，这个指令没有任何作用。

```http
Cache-Control: s-maxage=60
```

**min-fresh**

`min-fresh`只能出现在请求中，`min-fresh` 要求缓存服务器返回 min-fresh 时间内的缓存数据。例如 `Cache-Control:min-fresh=60`，这就要求缓存服务器发送60秒内的数据。

```http
Cache-Control: min-fresh=60
```

**max-stable**

`max-stable` 只能出现在请求中，表示客户端会接受缓存数据，即使过期也照常接收。

```http
Cache-Control: max-stable=60
```

**only-if-cached**

这个标头只能出现在请求中，使用 `only-if-cached` 指令表示客户端仅在缓存服务器本地缓存目标资源的情况下才会要求其返回。

```http
Cache-Control: only-if-cached
```

**proxy-revalidate**

`proxy-revalidate` 指令要求所有的缓存服务器在接收到客户端带有该指令的请求返回响应之前，必须再次验证缓存的有效性。

```http
Cache-Control: proxy-revalidate
```

**no-transform**

使用 `no-transform` 指令规定无论是在请求还是响应中，缓存都不能改变实体主体的媒体类型。

```http
Cache-Control: no-transform
```

#### Connection

HTTP 协议使用 TCP 来管理连接方式，主要有两种连接方式，`持久性连接` 和 `非持久性连接`。

**持久性连接**

持久性连接指的是一次会话完成后，TCP 连接并未关闭，第二次再次发送请求后，就不再需要建立 TCP 连接，而是可以直接进行请求和响应。它的一般表示形式如下

```http
Connection: keep-alive
```

**从 HTTP 1.1 开始，默认使用持久性连接**。

`keep-alive` 也是一个通用标头，一般 Connection 都会和 keep-alive 一起使用，keep-alive 有两个参数，一个是 `timeout`；另一个是 `max`，它们的主要表现形式如下

```http
Connection: Keep-Alive
Keep-Alive: timeout=5, max=1000
```

* timeout: 指的是空闲连接必须打开的最短时间，也就是说这次请求的连接时间不能少于5秒，

* max: 指的是在连接关闭之前服务器所能够收到的最大请求数。

**非持久性连接**

非持久性连接表示一次会话请求/响应后关闭连接的方式。HTTP 1.1 之前使用的连接都是非持久连接，也就是

```http
Connection: close
```

#### Date

Date 是一个通用标头，它可以出现在请求标头和响应标头中，它的基本表示如下

```http
Date: Wed, 21 Oct 2015 07:28:00 GMT 
```

表示的是格林威治标准时间，这个时间要比北京时间慢八个小时

![](http://www.cxuan.vip/image-20230202213633690.png)

#### Pragma

`Pragma`是 http 1.1 之前版本的历史遗留字段，仅作为与 http 的向后兼容而定义。它的一般形式如下

```http
Pragma: no-cache
```

只用于客户端发送的请求中。客户端会要求所有的中间服务器不返回缓存的资源。

如果所有的中间服务器都以实现 HTTP /1.1为标准，那么直接使用 Cache-Control: no-cache 即可，如果不是的话，就要包含两个字段，如下

```http
Cache-Control: no-cache
Pragma: no-cache
```

#### Trailer

首部字段 Trailer 会事先说明在报文主体后记录了哪些首部字段。该首部字段可应用在 HTTP/1.1 版本分块传输编码时。一般用法如下

```http
Transfer-Encoding: chunked
Trailer: Expires
```

以上用例中，指定首部字段 Trailer 的值为 Expires，在报文主体之后（分块长度 0 之后）出现了首部字段 Expires。

#### Transfer-Encoding 

Transfer-Encoding 属于内容协商的范畴，下面会具体介绍一下内容协商，现在先做个预告：`Transfer-Encoding` 规定了传输报文所采用的编码方式

>注意：HTTP 1.1 的传输编码方式仅对分块传输有效，但是 HTTP 2.0 就不再支持分块传输，而提供了自己更有效的数据传输机制。

```http
Transfer-Encoding: chunked
```

Transfer-Encoding 也属于 `Hop-by-hop（逐跳） 首部` ，下面来回顾一下，HTTP 报文标头除了可以根据属性所在的位置分为 `通用标头`、`请求标头`、`响应标头` 和 `实体标头`；还可以按照是否被缓存分为 `端到端首部(End-to-End)` 和 `逐跳首部(Top-to-Top)`。

除了下面八种属于逐跳首部外，其余都属于端到端首部

**Connection、Keep-Alive、Proxy-Authenticate、Proxy-Authorization、Trailer、TE、Transfer-Encoding、Upgrade**

下面回到讨论中来，Transfer-Encoding 用于两个节点之间传输消息，而不是资源本身。在多个节点传输消息的过程中，每一段消息的传输都可以使用不同的 `Transfer-Encoding`。如图所示

![](http://www.cxuan.vip/image-20230202213647072.png)

Transfer-Encoding 支持文件压缩，如果你想要以文件压缩后的形式发送的话。Transfer-Encoding 所有可选类型如下

* `chunked`： 数据按照一系列块发送，在这种情况下，将省略 `Content-Length` 标头，并在每个块的开头，需要以十六进制填充当前块的长度，后跟 `'\r\n'`，然后是块本身，然后是另一个`'\r\n'`。当将大量数据发送到客户端并且在请求已被完全处理之前，可能无法知道响应的总大小时，分块编码很有用。 例如，在生成由数据库查询产生的大型 HTML 表时或在传输大型图像时。 分块的响应看起来像这样

```http
HTTP/1.1 200 OK 
Content-Type: text/plain 
Transfer-Encoding: chunked

7\r\n
Mozilla\r\n 
9\r\n
Developer\r\n
7\r\n
Network\r\n
0\r\n 
\r\n
```

终止块通常是0。紧随`Transfer-Encoding` 后面的是 `Trailer` 标头， Trailer 可能为空。

* `compress`： 使用 `Lempel-Ziv-Welch(LZW)` 算法的格式。值名称取自 `UNIX` 压缩程序，该程序实现了该算法。现在几乎没有浏览器使用这种内容编码了，因为这个专利在 2003 年就停掉了。
* `deflate`：使用 `zlib(在 RFC 1950 定义)` 结构和 deflate 压缩算法
* `gzip`： 使用`Lempel-Ziv编码（LZ77）`和32位`CRC`的格式。这最初是 `UNIX gzip` 程序的格式。`HTTP / 1.1`标准还建议出于兼容性目的，支持此内容编码的服务器应将 x-gzip 识别为别名。
* `identity`： 使用身份功能（即无压缩或修改）。

也可以列出多个值，以逗号分隔，类似一个集合列表

```http
Transfer-Encoding: gzip, chunked
```

#### Upgrade

首部字段 Upgrade 用于检测 HTTP 协议及其他协议是否可使用更高的版本进行通信，其参数值可以用来指定一个完全不同的通信协议。

![](http://www.cxuan.vip/image-20230202213659243.png)

上图用例中，首部字段 `Upgrade` 指定的值为 `TLS/1.0`。请注意此处两个字段首部字段的对应关系，Connection 的值被指定为 Upgrade。
Upgrade 首部字段产生作用的对象仅限于客户端和临近服务器之间。因此，使用首部字段 Upgrade 时，还需要额外指定 `Connection: Upgrade`。
对于附有首部字段 Upgrade 的请求，服务器可用 `101 Switching Protocols` 状态码作为响应返回。

#### Via

使用 Via 是为了跟踪客户端和服务器之间的请求/响应路径，避免请求循环以及能够识别`请求/响应`链中发送者协议的功能。Via 字段由代理服务器添加，不论是正向代理还是反向代理，并且可以出现在请求标头和响应标头中。它用于跟踪消息转发。例如下图所示

![](http://www.cxuan.vip/image-20230202213714568.png)

Via 后面的的 `1.1, 1.0` 表示接收服务器上的 HTTP 版本，Via 首部是为了跟踪路径，经常和 `TRACE` 方法一起使用。

#### Warning

>注意：Warning 字段即将被弃用
>
>查阅 [Warning (https://github.com/httpwg/http-core/issues/139)](https://github.com/httpwg/http-core/issues/139) and [Warning: header & stale-while-revalidate (https://github.com/whatwg/fetch/issues/913)](https://github.com/whatwg/fetch/issues/913) 获取更多细节

Warning 通用 HTTP 标头通常会告知用户一些与缓存相关的问题的警告

HTTP/1.1 中定义了 7 种警告。它们分别如下

![](http://www.cxuan.vip/image-20230202213727529.png)

### 请求标头

请求标头用于客户端发送 HTTP 请求到服务器中所使用的字段，下面我们一起来看一下 HTTP 请求标头都包含哪些字段，分别是什么意思。下面会介绍

* Accept
* Accept-Charset
* Accept-Encoding
* Accept-Language
* Authorization
* Expect
* From
* Host
* If-Match
* If-Modified-Since
* If-None-Match
* If-Range
* If-Unmodified-Since
* Max-Forwards
* Proxy-Authorization
* RangeReferer
* TE
* User-Agent

下面分别来介绍一下

#### Accept

HTTP 请求标头会告知客户端能够接收的 MIME 类型是什么

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

这是什么意思呢？若想要给显示的**媒体类型增加优先级**，则使用 q= 来额外表示权重值，没有显示权重的时候默认值是1.0 ，我给你列个表格你就明白了

| q    | MIME                  |
| ---- | --------------------- |
| 1.0  | text/html             |
| 1.0  | application/xhtml+xml |
| 0.9  | application/xml       |
| 0.8  | * / *                 |

也就是说，这是一个放置顺序，权重高的在前，低的在后，`application/xml;q=0.9` 是不可分割的整体。

#### Accept-Charset

`Accept-Charset` 表示客户端能够接受的字符编码。Accept-Charset 也是属于`内容协商`的一部分，它和 

`Accept` 一样，也可以用 q 来表示字符集，用`逗号`进行分割，例如

```http
Accept-Charset: iso-8859-1
Accept-Charset: utf-8, iso-8859-1;q=0.5
Accept-Charset: utf-8, iso-8859-1;q=0.5, *;q=0.1
```

>事实上，很多以 `Accept-*` 开头的标头，都是属于内容协商的范畴，关于内容协商我们下面会说。

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

#### Accept-Language

`Accept-Language` 请求表示客户端需要服务端返回的语言类型，Accept-Language 也属于内容协商的范畴。服务端通过 `Content-Language` 进行响应，和 Accept 首部字段一样，按权重值 `q `来表示相对优先级。例如

```http
Accept-Language: de
Accept-Language: de-CH
Accept-Language: en-US,en;q=0.5
```

#### Authorization

HTTP `Authorization` 请求头用于向服务器认证用户代理的凭据，通常用在服务器以401未经授权状态和WWW-Authenticate标头响应之后，啥意思呢？你不明白的话我画张图给你看

![](http://www.cxuan.vip/image-20230202213750422.png)

请求标头 `Authorization` 是用来告知服务器，用户的认证信息，服务器在只有收到认证后才会返回给客户端 200 OK 的响应，如果没有认证信息，则会返回 401 并告知客户端需要认证信息。详细关于 Authorization 的信息，后面也会详细解释

#### Expect

Expect HTTP 请求标头指示服务器需要满足的期望才能正确处理请求。如果服务器没有办法完成客服端所期望完成的事情并且服务端存在错误的话，会返回 `417 Expectation Failed` 。HTTP 1.1 只规定了`100-continue` 。

* 如果服务器能正常完成客户端所期望的事情，会返回 100
* 如果不能满足期望或返回任何其他`4xx` 的状态码，会返回 417

例如

```http
PUT /somewhere/fun HTTP/1.1
Host: origin.example.com
Content-Type: video/h264
Content-Length: 1234567890987
Expect: 100-continue
```

#### From

`From` 请求头用来告知服务器使用用户代理的电子邮件地址。通常情况下，其使用目的就是为了显示搜索引擎等用户代理的负责人的电子邮件联系方式。我们在使用代理的情况下，应尽可能包含 From 首部字段。例如 

```http
From: webmaster@example.org
```

>你不应该将 From 用在访问控制或者身份验证中

#### Host

`Host` 请求头指明了服务器的域名（对于虚拟主机来说），以及（可选的）服务器监听的TCP端口号。如果没有给定端口号，会自动使用被请求服务的默认端口（比如请求一个 HTTP 的 URL 会自动使用80作为端口）。

```http
Host: developer.mozilla.org
```

Host 首部字段在 HTTP/1.1 规范内是唯一一个必须被包含在请求内的首部字段。

#### If-Match

If-Match 后面可以跟一大堆属性，形式像 If-Match 这种的请求头称为`条件请求`，服务器接收到条件请求后，需要判定条件请求是否满足，只有条件请求为真，才会执行条件请求

类似的还有 **If-Match、If-Modified-Since、If-None-Match、If-Range、If-Unmodified-Since**

对于 `GET` 和 `POST` 方法，服务器仅在与列出的 `ETag（响应标头）` 之一匹配时才返回请求的资源。这里又多了一个新词 `ETag`，我们稍后再说 ETag 的用法。对于像是 `PUT` 和其他非安全的方法，在这种情况下，它仅仅将上传资源。

下面是两种常见的案例

* 对于 `GET` 和 `POST` 方法，会结合使用 `Range` 标头，它可以确保新发送请求的范围与上一个请求的资源相同，如果不匹配的话，会返回 `416` 响应。
* 对于其他方法，特别是 `PUT` 方法，`If-Match` 可以防止丢失更新，服务器会比对 If-Match 的字段值和资源的 ETag 值，仅当两者一致时，才会执行请求。反之，则返回状态码 412 Precondition Failed 的响应。例如

```http
If-Match: "bfc13a64729c4290ef5b2c2730249c88ca92d82d"
If-Match: *
```

#### If-Modified-Since

`If-Modified-Since` 是 HTTP 条件请求的一部分，只有在给定日期之后，服务端修改了请求所需要的资源，才会返回 200 OK 的响应。如果在给定日期之后，服务端没有修改内容，响应会返回 `304` 并且不带任何响应体。If-Modified-Since 只能使用 `GET` 和 `HEAD` 请求。

If-Modified-Since 与 If-None-Match 结合使用时，它将被忽略，除非服务器不支持 If-None-Match。一般表示如下

```http
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT 
```

> 注意：这是格林威治标准时间。 HTTP 日期始终以格林尼治标准时间表示，而不是本地时间。

#### If-None-Match

条件请求，它与 `If-Match` 的作用相反，仅当 `If-None-Match` 的字段值与 `ETag` 值不一致时，可处理该请求。对于`GET` 和 `HEAD` ，仅当服务器没有与给定资源匹配的 `ETag` 时，服务器将返回 200 作为响应。对于其他方法，仅当最终现有资源的 ETag 与列出的任何值都不匹配时，才会处理请求。

当 `GET` 和 `POST` 发送的 `If-None-Match`与 `ETag` 匹配时，服务器会返回 `304`。

```http
If-None-Match: "bfc13a64729c4290ef5b2c2730249c88ca92d82d"
If-None-Match: W/"67ab43", "54ed21", "7892dd"
If-None-Match: *
```

有同学可能会好奇 `W/` 是什么意思，这其实是 ETag 的弱匹配，关于 ETag 我们会在响应标头中详细讲述。

#### If-Range

`If-Range` 也是条件请求，如果满足条件（If-Range 的值和 ETag 值或者更新的日期时间一致），则会发出范围请求，否则将会返回全部资源。它的一般表示如下

```http
If-Range: Wed, 21 Oct 2015 07:28:00 GMT 
```

#### If-Unmodified-Since

`If-Unmodified-Since` HTTP 请求标头也是一个条件请求，服务器只有在给定日期之后没有对其进行修改时，服务器才返回请求资源。如果在指定日期时间后发生了更新，则以状态码 `412 Precondition Failed` 作为响应返回。

```http
If-Unmodified-Since: Wed, 21 Oct 2015 07:28:00 GMT 
```

#### Max-Forwards

MDN 把这个标头置灰了，所以下面内容取自《图解 HTTP》

`Max-Forwards` 一般用于 `TRACE` 和 `OPTION` 方法，发送包含 `Max-Forwards` 的首部字段时，每经过一个服务器，Max-Forwards 的值就会 -1，直到 Max-Forwards 为0时返回。Max-Forwards 是一个十进制的整数值。

```http
Max-Forwards: 10
```

可以灵活使用首部字段 Max-Forwards，针对以上问题产生的原因展开调查。由于当 Max-Forwards 字段值为 0 时，服务器就会立即返回响应，由此我们至少可以对以那台服务器为终点的传输路径的通信状况有所把握。

#### Proxy-Authorization

`Proxy-Authorization` 是属于请求与认证的范畴，我们在上面提到一个认证的 HTTP 标头是 Authorization，不同于 Authorization 发生在客户端 - 服务器之间；`Proxy-Authorization` 发生在代理服务器和客户端之间。它表示接收到从代理服务器发来的认证时，客户端会发送包含首部字段 Proxy-Authorization 的请求，以告知服务器认证所需要的信息。

```http
Proxy-Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l
```

#### Range

`Range` HTTP 请求标头指示服务器应返回文档指定部分的资源，可以一次请求一个 Range 来返回多个部分，服务器会将这些资源返回各个文档中。如果服务器成功返回，那么将返回 206 响应；如果 Range 范围无效，服务器返回`416 Range Not Satisfiable`错误；服务器还可以忽略 Range 标头，并且返回 200 作为响应。

```http
Range: bytes=200-1000, 2000-6576, 19000-
```

#### Referer

HTTP Referer 属性是请求标头的一部分，当浏览器向 web 服务器发送请求的时候，一般会带上 Referer，告诉服务器该网页是从哪个页面链接过来的，服务器因此可以获得一些信息用于处理。

```http
Referer: https://developer.mozilla.org/testpage.html
```

#### TE

首部字段 `TE` 会告知服务器客户端能够处理响应的传输编码方式及相对优先级。它和首部字段 Accept-Encoding 的功能很相像，但是用于传输编码。

```http
TE: gzip, deflate;q=0.5
```

首部字段 TE 除指定传输编码之外，还可以指定伴随 trailer 字段的分块传输编码的方式。应用后者时，只需把 trailers 赋值给该字段值。

```http
TE: trailers, deflate;q=0.5
```

#### User-Agent

首部字段 `User-Agent` 会将创建请求的浏览器和用户代理名称等信息传达给服务器。

```http
Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0
```

### 响应标头

刚刚我们的着重点一直放在客户端请求，现在我们把关注点转换一下放在服务器上。响应首部字段是由服务器发送给客户端响应中所包含的字段，用于补充相应信息等，这部分标头也是非常多，我们先一起来看一下

* Accept-Ranges
* Age
* ETag
* Location
* Proxy-Authenticate
* Retry-After
* Server
* Vary
* www-Authenticate

#### Accept-Ranges

Accept-Ranges HTTP 响应标头，这个标头有两个值

* 当服务器能够处理客户端发送过来的请求时，使用`bytes` 来指定
* 当服务器不能处理客户端发来的请求时，使用 `none` 来指定

```http
Accept-Ranges: bytes
Accept-Ranges: none
```

#### Age

Age HTTP 响应标头告诉客户端源服务器在多久之前创建了响应，它的单位为`秒`，Age 标头通常接近于0，如果是0则可能是从源服务器获取的，如果不是表示可能是由代理服务器创建，那么 Age 的值表示的是缓存后的响应再次发起认证到认证完成的时间值。代理创建响应时必须加上首部字段 Age。一般表示如下

```http
Age: 24
```

#### ETag

ETag 对于条件请求来说真是太重要了。因为条件请求就是根据 ETag 的值进行匹配的，下面我们就来详细了解一下。

ETag 响应头是`特定版本`的标识，它能够使缓存变得更高效并能够节省带宽，因为如果缓存内容未发生变更，Web 服务器则不需要重新发送完整的响应。除此之外，ETag 能够防止资源同时更新互相覆盖。

![](http://www.cxuan.vip/image-20230202213827106.png)

如果给定 URL 上的资源发生变更，必须生成一个新的 `ETag` 值，通过比较它们可以确定资源的两个表示形式是否相同。

ETag 值有两种，一种是强 ETag，一种是弱 ETag；

* 强 ETag 值，无论实体发生多么细微的变化都会改变其值，一般的表示如下

```http
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

* 弱 ETag 值，弱 ETag 值只用于提示资源是否相同。只有资源发生了根本改变，产生差异时才会改变 ETag 值。这时，会在字段值最开始处附加 W/。

```http
ETag: W/"0815"
```

#### Location

Location 响应标头表示 URL 需要重定向页面，它仅仅与 `3xx(重定向)` 或 `201(已创建)` 状态响应一起使用。下面是一个页面重定向的过程

![](http://www.cxuan.vip/image-20230202213847919.png)

使用首部字段 Location 可以将响应接受方引导至某个与请求 URI 位置不同的资源。

`Location` 和 `content-Location` 是不一样的：Location 表示目标的重定向（或新创建资源的 URL）。然而 Content-Location 表示发生内容协商时用于访问资源的直接 URL，而无须进一步协商。Location 是与响应相关联的标头，而 Content-Location 与返回的实体相关联。

```http
Location: /index.html
```

#### Proxy-Authenticate

HTTP 响应标头 `Proxy-Authenticate` 会定义认证方法，应该使用身份验证方法来访问代理服务器后面的资源即客户端。

它与 HTTP 客户端和服务端之间的访问认证行为相似，不同之处在于 `Proxy-Authenticate` 的认证双方是客户端与代理之间。它的一般表示形式如下

```http
Proxy-Authenticate: Basic
Proxy-Authenticate: Basic realm="Access to the internal site"
```

#### Retry-After

HTTP 响应标头 Retry-After 告知客户端需要在多久之后重新发送请求，使用此标头主要有如下三种情况

* 当发送 `503(服务不可用) `响应时，这表示该服务预计无法使用多长时间。
* 当发送 `429(太多请求)`响应时，这表示发出新请求之前要等待多长时间。
* 当发送重定向的响应像是 `301(永久移动)`，这表示在发出重定向请求之前要求用户客户端等待的最短时间。

字段值可以指定为具体的日期时间，也可以是创建响应后所持续的秒数，例如

```http
Retry-After: Wed, 21 Oct 2015 07:28:00 GMT
Retry-After: 120
```

#### Server

服务器标头包含有关原始服务器用来处理请求的软件的信息。

应该避免使用过于冗长和详细的 Server 值，因为它们可能会泄露内部实施细节，这可能会使攻击者容易地发现并利用已知的安全漏洞。例如下面这种写法

```http
Server: Apache/2.4.1 (Unix)
```

#### Vary

Vary HTTP 响应标头确定如何匹配请求标头，以决定是否可以使用缓存的响应，而不是从原始服务器请求一个新的响应。

```http
Vary: User-Agent
```

#### www-Authenticate

HTTP `WWW-Authenticate` 响应标头定义了应用于获得对资源的访问权限的身份验证方法。WWW-Authenticate标头与401未经授权的响应一起发送。它的一般表示形式如下

```http
WWW-Authenticate: Basic
WWW-Authenticate: Basic realm="Access to the staging site", charset="UTF-8"
```

#### Access-Control-Allow-Origin

一个返回的 HTTP 标头可能会具有 Access-Control-Allow-Origin ，`Access-Control-Allow-Origin` 指定一个来源，它告诉浏览器允许该来源进行资源访问。 否则-对于没有凭据的请求 `*`通配符，告诉浏览器允许任何源访问资源。例如，要允许源 `https://mozilla.org` 的代码访问资源，可以指定：

```http
Access-Control-Allow-Origin: https://mozilla.org
Vary: Origin
```

如果服务器指定单个来源而不是 `* `通配符的话 ，则服务器还应在 Vary 响应标头中包含 `Origin` ，以向客户端指示 服务器响应将根据原始请求标头的值而有所不同。

### 实体标头

实体标头用于HTTP请求和响应中，例如 Content-Length，Content-Language，Content-Encoding 的标头是实体标头。实体标头不局限于请求标头或者响应标头，下面例子中，`Content-Length` 是一个实体标头，但是却出现在了请求报文中

```http
POST /myform.html HTTP/1.1
Host: developer.mozilla.org
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0
Content-Length: 128
```

下面就来说一下实体标头都包含哪些

* Allow
* Content-Encoding
* Content-Language
* Content-Length
* Content-Location
* Content-MD5
* Content-Range
* Content-Type
* Expires
* Last-Modified

下面来分开说一下

#### Allow

HTTP 实体标头 `Allow` 列出了资源支持的方法集合。如果服务器响应`405 Method Not Allowed`状态码以指示可以使用哪些请求方法，则必须发送此标头。例如

```http
Allow: GET, POST, HEAD
```

这段代码表示服务器允许支持 `GET` 、`POST` 和 `HEAD` 方法。当服务器接收到不支持的 HTTP 方法时，会以状态码 `405 Method Not Allowed` 作为响应返回。

#### Content-Encoding

我们上面讲过 `Accept-Encoding` 是客户端希望服务端返回的内容编码，但是实际上服务端返回给客户端的内容编码实际上是通过 `Content-Encoding` 返回的。内容编码是指在不丢失实体信息的前提下所进行的压缩。主要也是四种，和 Accept-Encoding 相同，它们是 **gzip、compress、deflate、identity**。下面是一组请求/响应内容压缩编码

```http
Accept-Encoding: gzip, deflate
Content-Encoding: gzip
```

#### Content-Language

首部字段 Content-Language 会告知客户端，服务器使用的自然语言是什么，它与 Accept-Language 相对，下面是一组请求/响应使用的语言类型

```http
Content-Language: de-DE, en-CA
```

#### Content-Length

Content-Length 的实体标头指服务器发送给客户端的实际主体大小，以字节为单位。

```http
Content-Length: 3000
```

如上，服务器返回给客户端的主体大小是 3000 字节。

#### Content-Location

Content-Location 可不是对应 Accept-Location，因为没有这个标头哈哈哈哈。实际上 Content-Location 对应的是 `Location`。

Location 和 Content-Location 是不一样的，Location 表示重定向的 URL，而 Content-Location 表示用于访问资源的直接 URL，以后无需进行进一步的内容协商。Location 是与响应关联的标头，而 Content-Location 是与返回的数据相关联的标头，如果你不好理解，看一下下面的表格

| Request header                        | Response header                         |
| ------------------------------------- | --------------------------------------- |
| `Accept: application/json, text/json` | `Content-Location: /documents/foo.json` |
| `Accept: application/xml, text/xml`   | `Content-Location: /documents/foo.xml`  |
| `Accept: text/plain, text/*`          | `Content-Location: /documents/foo.txt`  |

#### Content-MD5

客户端会对接收的报文主体执行相同的 MD5 算法，然后与首部字段 Content-MD5 的字段进行比较。

```http
Content-MD5: e10adc3949ba59abbe56e057f20f883e
```

首部字段 Content-MD5 是一串由 MD5 算法生成的值，其目的在于检查报文主体在传输过程中是否保持完整，有无被修改的情况，以及确认传输到达。

![](http://www.cxuan.vip/image-20230202213907659.png)

#### Content-Range

HTTP 的 Content-Range 响应标头是针对范围请求而设定的，返回响应时使用首部字段 `Content-Range`，能够告知客户端响应实体的哪部分是符合客户端请求的，字段以字节为单位。它的一般表示如下

```http
Content-Range: bytes 200-1000/67589 
```

上段代码表示从所有 `67589` 个字节中返回 `200-1000` 个字节的内容

#### Content-Type

HTTP 响应标头 Content-Type 说明了实体内对象的媒体类型，和首部字段 Accept 一样使用，表示服务器能够响应的媒体类型。

#### Expires

HTTP Expires 实体标头包含 `日期/时间`，在该日期/时间之后，响应被认为过期；在响应时间之内被认为有效。特殊的值比如0表示过去的日期，表示资源已过期。

```http
Expires: Wed, 21 Oct 2015 07:28:00 GMT
```

源服务器会将资源失效的日期或时间发送给客户端，缓存服务器在接受到 Expires 的响应后，会判断是否把缓存返回给客户端。

源服务器不希望缓存服务器对资源缓存时，最好在 Expires 字段内写入与首部字段 Date 相同的时间值。但是，当首部字段 Cache-Control 有指定 max-age 指令时，比起首部字段 Expires，会优先处理 max-age 指令。

#### Last-Modified

实体字段 `Last-Modified` 指明资源的最后修改时间，它用作验证器来确定接收或存储的资源是否相同。它的作用不如 `ETag` 那么准确，它可以作为一种后备机制，包含 `If-Modified-Since` 或 `If-Unmodified-Since` 标头的条件请求将使用此字段。它的一般表示如下

```http
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

## 总结

本篇文章主要介绍了 HTTP 四种标头的基本概念，但是并没有涵盖全部，毕竟 HTTP 标头内容确实太多了，以上介绍的基本都是平常工作中常用的一些概念，下一篇文章预告 **HTTP 的黑科技**

如果你在阅读文章的过程中发现错误和问题，请及时与我联系！

如果文章对你有帮助，希望小伙伴们三连走起！

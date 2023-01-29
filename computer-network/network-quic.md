# 什么是 QUIC 协议？

* [什么是 QUIC 协议？](#什么是-quic-协议)
   * [HTTP/2.0](#http20)
   * [QUIC 协议](#quic-协议)
   * [QUIC 相关资料](#quic-相关资料)

> 这是计算机网络连载系列的第十六篇文章，前十五篇文章见
>
> [计算机网络基础知识总结](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247486242&idx=1&sn=fac49b0b79515a5ed6afd4b341aff87b&chksm=e999fe30deee772637e1c52fb9001c60e60a772e7adba6701329c81974e76c57bb7b2e570225&token=850264305&lang=zh_CN#rd)
>
> [TCP/IP 基础知识总结](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247486408&idx=1&sn=c332ae7ae448f3eb98865003ecade589&chksm=e999fedadeee77cc6281d1b170bd906b58220d6cd83054bc741821f4167f1f18ceee9ba0e449&token=850264305&lang=zh_CN#rd)
>
> [计算机网络应用层](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247486507&idx=1&sn=622cc363b34bce54f4953076faa1cad6&chksm=e999f939deee702f2444df83ad9805de8c70fb88b89d299fdf0a82b3463e253f32372963c039&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络传输层](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247487108&idx=1&sn=7b47f421bb1dee4edb357a10399b7fec&chksm=e999fb96deee7280a17bfff44c27ef11a60e93e48f9da738670a779ecf6accb5a6a4ebd3cbcc&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络网络层](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247487683&idx=1&sn=e0949e72e039759545450852d8bc0ada&chksm=e999e5d1deee6cc7ab9e42b50329924fee39c45955516b406046605d27928825a0f628d13e7c&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络链路层](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247488884&idx=1&sn=0fdb91b7f5081d2e24c82d891fcc6126&chksm=e999e066deee69704d162b97be2ff0d33225fa9a3d12e4d3bec90a34996e7db7134535f36e8e&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络 ARP 协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247487804&idx=1&sn=f001a24a308053b3723dfb12d36045ee&chksm=e999e42edeee6d383fbb411792e22e4028bb8c2441255786f50cf848443af7b1bd5e382078dc&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络 DNS 协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247487880&idx=1&sn=fd38ce30ae82fa7d08e5f83fabb9d497&chksm=e999e49adeee6d8c1adacbfe27dc59097e4cb9d39c6a04802b0fe61877653330e75721cbde0b&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络 ICMP 协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247488316&idx=1&sn=360c3e6eb45e9cbd7c38f3d43e8850e7&chksm=e999e62edeee6f3806dfe9b5c8d00c5e521cae1a1e7b85fd33d7a7c64fa897b3632dd31b9d50&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络 DHCP 协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247488546&idx=1&sn=9a8ec2b6900d930e51c55d01de3dd7b5&chksm=e999e130deee6826bac33f3f395f763b33b7cbe6809ae5e3b02a2e24daf816b13851d4f3246e&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络 NAT 协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247495224&idx=1&sn=8146e152840c65adccf7e4e1044e3860&chksm=e99a1b2adeed923c154dac426bd36d24a1243a1d0fd6125aeade22645aafbc172fa5d930dfbe&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络 web 请求过程](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247489155&idx=1&sn=8bcd1dda63e3e34c672973fd56e4f48f&chksm=e999e391deee6a8735ab4b0c0473b79cbeee577c2f8c4fb964e5ef6d932dc1614151b6a8a554&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络 Socket](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247494554&idx=1&sn=6cfa7a5ac3bd443e7734b0a688b53294&chksm=e99a1e88deed979ed721e9885dcb4a0ac86bd4fd14eb76056832050762eeb9b8c7423870f2fc&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络路由协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247496972&idx=1&sn=fa73c2e35ae34f3e0a8f0055cd78825c&chksm=e99a001edeed890883feda823a31dbb537461de86f33b14a00c271a1b0bf097ead0905e5fe0a&token=1398464113&lang=zh_CN#rd)
>
> [计算机网络 HTTP 2.0](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247492836&idx=1&sn=d48541fc7c7f5aeb0134ebd67ccf27f2&chksm=e99a11f6deed98e04ee6ea4c99f54bfe2876a78957a8cc0ac46014b4c0d7f7b283faf97e7eff&token=1398464113&lang=zh_CN#rd)

建议阅读本文需要搭配作者 HTTP 相关文章食用。

历史 HTTP 系列文章：

[看完这篇HTTP，跟面试官扯皮就没问题了](https://mp.weixin.qq.com/s?__biz=MzkwMDE1MzkwNQ==&mid=2247496030&idx=1&sn=82f56874f82f372af71e23a8e385f8cd&chksm=c04ae600f73d6f16d707c1d32b00e3f0d47e893c9cf59a2eb60ace418943aeb5c5c679cb27ea&token=157440081&lang=zh_CN#rd)

[HTTP 2.0 ，有点炸 ！](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247492836&idx=1&sn=d48541fc7c7f5aeb0134ebd67ccf27f2&chksm=e99a11f6deed98e04ee6ea4c99f54bfe2876a78957a8cc0ac46014b4c0d7f7b283faf97e7eff&token=335347796&lang=zh_CN&scene=21#wechat_redirect)

这里先来回顾一下 HTTP 的发展过程。首先，我们想要一种能够在网络上获取文档内容的协议，通过一种叫做 GET 请求的方式进行获取，后来这种 GET 请求被写入了官方文档，HTTP/1.0 应运而生。HTTP/1.0 的出现可以说是颠覆性的，它里面涵盖的一些标准我们目前还仍在使用，例如 HTTP header，协议号的概念，不过，这个版本的 HTTP 还有一 些明显的缺陷，比如它不支持持久性连接，每次请求响应后，都需要断开连接，这样效率很差。没过了多久，制定了 HTTP/1.1 标准，这个标准是互联网上使用最频繁的一个标准，HTTP/1.1 解决了之前不支持持久性连接的缺陷，而且 HTTP/1.1 还增加了缓存和控制模块。

但是，即便 HTTP/1.1 解决了一部分连接性能问题，它的效率仍不是很高，而且 HTTP 还有一个队头阻塞问题（关于队头阻塞我已经在 HTTP 2.0 的那篇文章中进行了说明和介绍。）

假如有五个请求被同时发出，如果第一个请求没有处理完成，就会导致后续的请求也无法得到处理，如下图所示

![](http://www.cxuan.vip/image-20230128084711099.png)

如果第一个请求没有被处理，那么 2 3 4 5 这四个请求会直接阻塞在客户端，等到请求 1 被处理完毕后，才能逐个发出。网络通畅的时候性能影响不大，不过一旦请求 1 因为某些原因没有抵达服务器，或者请求因为网络阻塞没有及时返回，影响的就是所有后续请求，导致后续请求无限阻塞下去，问题就变得比较严重了。

虽然 HTTP/1.1 使用了 pipling 的设计用于解决队头阻塞问题，但是在 pipling 的设计中，每个请求还是按照顺序先发先回，并没有从根本上解决问题。随着协议的不断更新，提出了 HTTP/2.0 。

## HTTP/2.0 

HTTP/2.0 解决队头阻塞的问题是采用了 stream 和分帧的方式。

HTTP/2.0 会将一个 TCP 连接切分成为多个 stream，每个 stream 都有自己的 stream id，这个 stream 可以是客户端发往服务端，也可以是服务端发往客户端。

HTTP/2.0 还能够将要传输的信息拆分为帧，并对它们进行二进制格式编码。也就是说，HTTP/2.0 会将 Header 头和 Data 数据分别进行拆分，而且拆分之后的二进制格式位于多个 stream 中。下面来看张图。

![](http://www.cxuan.vip/image-20230128084933820.png)

可以看到，HTTP/2.0 通过这两种机制，将多个请求分到了不同的 stream 中，然后将请求进行分帧，进行二进制传输，每个 stream 可以不用保证顺序乱序发送，到达客户端后，客户端会根据每个 stream 进行重组，而且可以根据优先级来优先处理哪个 stream。

## QUIC 协议

虽然 HTTP/2.0 解决了队头阻塞问题，但是每个 HTTP 连接都是由 TCP 进行连接建立和传输的，TCP 协议在处理包时有严格的顺序要求。这也就是说，当某个包切分的 stream 由于某些原因丢失后，服务器不会处理其他 stream，而会优先等待客户端发送丢失的 stream 。举个例子来说，假如有一个请求有三个 stream，其中 stream2 由于某些原因丢失了，那么 stream1 和 stream 2 的处理也会阻塞，只有收到重发的 stream2 之后，服务器才会再次进行处理。

>这就是 TCP 连接的症结所在。

鉴于这个问题，我们先把 TCP 放一放，先来认识一波 QUIC 协议。

QUIC 的小写是 quic，谐音 quick，意思就是`快`。它是 Google 提出来的一个基于 UDP 的传输协议，所以 QUIC 又被叫做**快速 UDP 互联网连接**。

首先 QUIC 的第一个特征就是快，为什么说它快，它到底快在哪呢？

我们大家知道，HTTP 协议在传输层是使用了 TCP 进行报文传输，而且 HTTPS 、HTTP/2.0 还采用了 TLS 协议进行加密，这样就会导致三次握手的连接延迟：即 TCP 三次握手（一次）和 TLS 握手（两次），如下图所示。

![](http://www.cxuan.vip/image-20230128084955298.png)

对于很多短连接场景，这种握手延迟影响较大，而且无法消除。

相比之下，QUIC 的握手连接更快，因为它使用了 UDP 作为传输层协议，这样能够减少三次握手的时间延迟。而且 QUIC 的加密协议采用了 TLS 协议的最新版本 *TLS 1.3*，相对之前的 *TLS 1.1-1.2*，TLS1.3 允许客户端无需等待 TLS 握手完成就开始发送应用程序数据的操作，可以支持1 RTT 和 0 RTT，从而达到**快速建立连接**的效果。

我们上面还说过，HTTP/2.0 虽然解决了队头阻塞问题，但是其建立的连接还是基于 TCP，无法解决请求阻塞问题。

而 UDP 本身没有建立连接这个概念，并且 QUIC 使用的 stream 之间是相互隔离的，不会阻塞其他 stream 数据的处理，所以使用 UDP 并不会造成队头阻塞。

在 TCP 中，TCP 为了保证数据的可靠性，使用了**序号+确认号**机制来实现，一旦带有 synchronize sequence number 的包发送到服务器，服务器都会在一定时间内进行响应，如果过了这段时间没有响应，客户端就会重传这个包，直到服务器收到数据包并作出响应为止。

>那么 TCP 是如何判断它的重传超时时间呢？

TCP 一般采用的是**自适应重传算法**，这个超时时间会根据往返时间 RTT 动态调整的。每次客户端都会使用相同的 syn 来判断超时时间，导致这个 RTT 的结果计算的不太准确。

虽然 QUIC 没有使用 TCP 协议，但是它也保证了可靠性，QUIC 实现可靠性的机制是使用了 *Packet Number*，这个序列号可以认为是 synchronize  sequence number 的替代者，这个序列号也是递增的。与 syn 所不同的是，不管服务器有没有接收到数据包，这个 Packet Number 都会 + 1，而 syn 是只有服务器发送 ack 响应之后，syn 才会 + 1。

![](http://www.cxuan.vip/image-20230128085043287.png)

比如有一个 PN = 10 的数据包在发送的过程中由于某些原因迟迟没到服务器，那么客户端会重传一个 PN = 11 的数据包，经过一段时间后客户端收到 PN = 10 的响应后再回送响应报文，此时的 RTT 就是 PN = 10 这个数据包在网络中的生存时间，这样计算相对比较准确。

>虽然 QUIC 保证了数据包的可靠性，但是数据的可靠性是如何保证的呢？

QUIC 引入了一个 *stream offset* 的概念，一个 stream 可以传输多个 stream offset，每个 stream offset 其实就是一个 PN 标识的数据，即使某个 PN 标识的数据丢失，PN + 1 后，它重传的仍旧是 PN 所标识的数据，等到所有 PN 标识的数据发送到服务器，就会进行重组，以此来保证数据可靠性。到达服务器的 stream offset 会按照顺序进行组装，这同时也保证了数据的顺序性。

![](http://www.cxuan.vip/image-20230128085113622.png)

众所周知，TCP 协议的具体实现是由操作系统内核来完成的，应用程序只能使用，不能对内核进行修改，随着移动端和越来越多的设备接入互联网，性能逐渐成为一个非常重要的衡量指标。虽然移动网络发展的非常快，但是用户端的更新却非常缓慢，我仍然看见有很多地区很多计算机还仍旧使用 xp 系统，尽管它早已发展了很多年。服务端系统不依赖用户升级，但是由于操作系统升级涉及到底层软件和运行库的更新，所以也比较保守和缓慢。

QUIC 协议的一个重要特点就是**可插拔性**，能够动态更新和升级，QUIC 在应用层实现了拥塞控制算法，不需要操作系统和内核的支持，遇到拥塞控制算法切换时，只需要在服务器重新加载一边即可，不需要停机和重启。

我们知道 TCP 的流量控制是通过**滑动窗口**来实现的，如果你对滑动窗口不太熟悉，你可以看下我写的这篇文章 

[TCP 基础知识](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247491621&idx=1&sn=78a182f89093ef1cc807bdef21cdcb4d&chksm=e99a1537deed9c2169257574c17877933b68fadd061f371c2f53a50e7f640d52f5f1667c895c&token=2108481110&lang=zh_CN#rd) 

在文章后面有提到了滑动窗口的一些概念。

而 QUIC 也实现了流量控制，QUIC 的流量控制也是使用了窗口更新 *window_update*，来告诉对端它可以接受的字节数。

TCP 协议头部没有经过加密和认证，所以在传输的过程中很可能被篡改，与之不同的是，QUIC 中的报文头部都是经过认证，报文也经过加密处理。这样只要对 QUIC 的报文有任何修改，接收端都能够及时发现，保证了安全性。

总的来说，QUIC 相比于 HTTP/2.0 来说，具有下面这些优势

* 使用 UDP 协议，不需要三次连接进行握手，而且也会缩短 TLS 建立连接的时间。
* 解决了队头阻塞问题
* 实现动态可插拔，在应用层实现了拥塞控制算法，可以随时切换。
* 报文头和报文体分别进行认证和加密处理，保障安全性。
* 连接能够平滑迁移

连接平滑迁移指的是，你的手机或者移动设备在 4G 信号下和 WiFi 等网络情况下切换，不会断线重连，用户甚至无任何感知，能够直接实现平滑的信号切换。

## QUIC 相关资料

QUIC 协议比较复杂，想自己完全实现一套对笔者来说还比较困难。

读者有兴趣的话可以先看看开源实现有哪些。

1）[Chromium](https://github.com/hanpfei/chromium-net)： https://github.com/hanpfei/chromium-net

这个是官方支持的。优点自然很多，Google 官方维护基本没有坑，随时可以跟随 chrome 更新到最新版本。不过编译 Chromium 比较麻烦，它有单独的一套编译工具。暂时不建议考虑这个方案。

2）[proto-quic](https://github.com/google/proto-quic)：https://github.com/google/proto-quic

从 chromium 剥离的一个 QUIC 协议部分，但是其 github 主页已宣布不再支持，仅作实验使用。不建议考虑这个方案。[]()

3）[goquic](https://github.com/devsisters/goquic)：https://github.com/devsisters/goquic

goquic 封装了 libquic 的 go 语言封装，而 libquic 也是从 chromium 剥离的，好几年不维护了，仅支持到 quic-36， goquic 提供一个反向代理，测试发现由于 QUIC 版本太低，最新 chrome 浏览器已无法支持。不建议考虑这个方案。

4）[quic-go](https://github.com/lucas-clemente/quic-go)：https://github.com/lucas-clemente/quic-go

quic-go 是完全用 go 写的 QUIC 协议栈，开发很活跃，已在 Caddy 中使用，MIT 许可，目前看是比较好的方案。

那么，对于中小团队或个人开发者来说，比较推荐的方案是最后一个，即采用 [caddy](https://github.com/mholt/caddy/wiki/QUIC) https://github.com/caddyserver/caddy/wiki/QUIC 来部署实现 QUIC。[caddy](https://github.com/mholt/caddy/wiki/QUIC) 这个项目本意并不是专门用来实现 QUIC 的，它是用来实现一个免签的 HTTPS web 服务器的（caddy 会自动续签证书）。而QUIC 只是它的一个附属功能（不过现实是——好像用它来实现 QUIC 的人更多）。

从 Github 的技术趋势来说，有关 QUIC 的开源资源越来越多，有兴趣可以自已逐一研究研究：[https://github.com/search?q=quic](https://github.com/search%3Fq%3Dquic)

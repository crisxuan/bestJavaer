# HTTP 3.0

[toc]

>这是计算机网络连载系列的第十七篇文章，前十六篇文章见
>
>[计算机网络基础知识总结](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247486242&idx=1&sn=fac49b0b79515a5ed6afd4b341aff87b&chksm=e999fe30deee772637e1c52fb9001c60e60a772e7adba6701329c81974e76c57bb7b2e570225&token=850264305&lang=zh_CN#rd)
>
>[TCP/IP 基础知识总结](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247486408&idx=1&sn=c332ae7ae448f3eb98865003ecade589&chksm=e999fedadeee77cc6281d1b170bd906b58220d6cd83054bc741821f4167f1f18ceee9ba0e449&token=850264305&lang=zh_CN#rd)
>
>[计算机网络应用层](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247486507&idx=1&sn=622cc363b34bce54f4953076faa1cad6&chksm=e999f939deee702f2444df83ad9805de8c70fb88b89d299fdf0a82b3463e253f32372963c039&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络传输层](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247487108&idx=1&sn=7b47f421bb1dee4edb357a10399b7fec&chksm=e999fb96deee7280a17bfff44c27ef11a60e93e48f9da738670a779ecf6accb5a6a4ebd3cbcc&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络网络层](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247487683&idx=1&sn=e0949e72e039759545450852d8bc0ada&chksm=e999e5d1deee6cc7ab9e42b50329924fee39c45955516b406046605d27928825a0f628d13e7c&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络链路层](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247488884&idx=1&sn=0fdb91b7f5081d2e24c82d891fcc6126&chksm=e999e066deee69704d162b97be2ff0d33225fa9a3d12e4d3bec90a34996e7db7134535f36e8e&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络 ARP 协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247487804&idx=1&sn=f001a24a308053b3723dfb12d36045ee&chksm=e999e42edeee6d383fbb411792e22e4028bb8c2441255786f50cf848443af7b1bd5e382078dc&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络 DNS 协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247487880&idx=1&sn=fd38ce30ae82fa7d08e5f83fabb9d497&chksm=e999e49adeee6d8c1adacbfe27dc59097e4cb9d39c6a04802b0fe61877653330e75721cbde0b&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络 ICMP 协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247488316&idx=1&sn=360c3e6eb45e9cbd7c38f3d43e8850e7&chksm=e999e62edeee6f3806dfe9b5c8d00c5e521cae1a1e7b85fd33d7a7c64fa897b3632dd31b9d50&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络 DHCP 协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247488546&idx=1&sn=9a8ec2b6900d930e51c55d01de3dd7b5&chksm=e999e130deee6826bac33f3f395f763b33b7cbe6809ae5e3b02a2e24daf816b13851d4f3246e&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络 NAT 协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247495224&idx=1&sn=8146e152840c65adccf7e4e1044e3860&chksm=e99a1b2adeed923c154dac426bd36d24a1243a1d0fd6125aeade22645aafbc172fa5d930dfbe&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络 web 请求过程](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247489155&idx=1&sn=8bcd1dda63e3e34c672973fd56e4f48f&chksm=e999e391deee6a8735ab4b0c0473b79cbeee577c2f8c4fb964e5ef6d932dc1614151b6a8a554&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络 Socket](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247494554&idx=1&sn=6cfa7a5ac3bd443e7734b0a688b53294&chksm=e99a1e88deed979ed721e9885dcb4a0ac86bd4fd14eb76056832050762eeb9b8c7423870f2fc&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络路由协议](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247496972&idx=1&sn=fa73c2e35ae34f3e0a8f0055cd78825c&chksm=e99a001edeed890883feda823a31dbb537461de86f33b14a00c271a1b0bf097ead0905e5fe0a&token=1398464113&lang=zh_CN#rd)
>
>[计算机网络HTTP/2.0](https://github.com/crisxuan/bestJavaer/blob/master/computer-network/network-http2.0.md)
>
>[计算机网络QUIC协议](https://github.com/crisxuan/bestJavaer/blob/master/computer-network/network-quic.md)

HTTP 3.0 是 HTTP 协议的第三个主要版本，前两个分别是 HTTP 1.0 和 HTTP 2.0 ，但其实 HTTP 1.1 我认为才是真正的 HTTP 1.0。

如果你对 HTTP 1.1 和 HTTP 2.0 不太了解的话，可以阅读笔者的这两篇文章。

[看完这篇HTTP，跟面试官扯皮就没问题了](https://mp.weixin.qq.com/s?__biz=MzkwMDE1MzkwNQ==&mid=2247496030&idx=1&sn=82f56874f82f372af71e23a8e385f8cd&chksm=c04ae600f73d6f16d707c1d32b00e3f0d47e893c9cf59a2eb60ace418943aeb5c5c679cb27ea&token=920849200&lang=zh_CN#rd)

[HTTP 2.0 ，有点炸 ！](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247492836&idx=1&sn=d48541fc7c7f5aeb0134ebd67ccf27f2&chksm=e99a11f6deed98e04ee6ea4c99f54bfe2876a78957a8cc0ac46014b4c0d7f7b283faf97e7eff&token=772859712&lang=zh_CN#rd)

我们大家知道，HTTP 是应用层协议，应用层产生的数据会通过传输层协议作为载体来传输到互联网上的其他主机中，而其中的载体就是 TCP 协议，这是 HTTP 2 之前的主流模式。

但是随着 TCP 协议的缺点不断暴露出来，新一代的 HTTP 协议 - HTTP 3.0 毅然决然的切断了和 TCP 的联系，转而拥抱了 UDP 协议，这么说不太准确，其实 HTTP 3.0 其实是拥抱了 **QUIC 协议**，而 QUIC 协议是建立在 UDP 协议基础上的。

## HTTP 3.0 

HTTP 3.0 于 2022 年 6 月 6 日正式发布，IETF 把 HTTP 3.0 标准制定在了 [RFC 9114](https://datatracker.ietf.org/doc/html/rfc9114) 中，HTTP 3.0 其实相较于 HTTP 2.0 要比 HTTP 2.0 相较于 HTTP 1.1 的变化来说小很多，最大的提升就在于效率，替换 TCP 协议为 UDP 协议，HTTP 3.0 具有更低的延迟，它的效率甚至要比 HTTP 1.1 快 3 倍以上。

其实每一代 HTTP 协议的不断发展都是建立在上一代 HTTP 的缺点上的，就比如 HTTP 1.0 最大的问题就是传输安全性和不支持持久连接上，针对此出现了 HTTP 1.1 ，引入了 Keep-Alive 机制来保持长链接和 TLS 来保证通信安全性。但此时的 HTTP 协议并发性还做的不够好。

随着网络的不断发展，每个网站所需资源（CSS、JavaScript、图像等）的数量逐年增加，浏览器发现自己在获取和呈现网页时需要越来越多的并发性。但是由于 HTTP 1.1 只能够允许客户端/服务器进行一次 HTTP 请求交换，因此在网络层获得并发性的唯一方法是并行使用多个 TCP 连接到同一个源，不过使用多个 TCP 链接就失去了  keep-Alive 的意义。

然后出现了 *SPDY* 协议，主要解决 HTTP 1.1 效率不高的问题，包括降低延迟，压缩 header 等等，这些已经被 Chrome 浏览器证明能够产生优化效果，后来 HTTP 2.0 基于 SPDY ，并且引入了**流( Stream )** 的概念，它允许将不同的 HTTP 交换多路复用到同一个 TCP 连接上，从而达到让浏览器重用 TCP 链接的目的。

![](http://www.cxuan.vip/image-20230128084812565.png)

TCP 的主要作用是以正确的顺序将整个字节流从一个端点传输到另一个端点，但是当流中的某些数据包丢失时，TCP 需要重新发送这些丢失的数据包，等到丢失的数据包到达对应端点时才能够被 HTTP 处理，这被称为 TCP 的队头阻塞问题。

那么可能就会有人考虑到去修改 TCP 协议，其实这已经是一件不可能完成的任务了。因为 TCP 存在的时间实在太长，已经充斥在各种设备中，并且这个协议是由操作系统实现的，更新起来不大现实。

基于这个原因，**Google 就更起炉灶搞了一个基于 UDP 协议的 QUIC 协议，并且使用在了 HTTP/3 上**，HTTP/3 之前名为 HTTP-over-QUIC，从这个名字中我们也可以发现，HTTP/3 最大的改造就是使用了 QUIC。

![](http://www.cxuan.vip/image-20230128084824739.png)

## QUIC 协议

QUIC 的小写是 quic，谐音 quick，意思就是`快`。它是 Google 提出来的一个基于 UDP 的传输协议，所以 QUIC 又被叫做**快速 UDP 互联网连接**。

首先 QUIC 的第一个特征就是快，为什么说它快，它到底快在哪呢？

我们大家知道，HTTP 协议在传输层是使用了 TCP 进行报文传输，而且 HTTPS 、HTTP/2.0 还采用了 TLS 协议进行加密，这样就会导致三次握手的连接延迟：即 TCP 三次握手（一次）和 TLS 握手（两次），如下图所示。

![](http://www.cxuan.vip/image-20230128090530140.png)

对于很多短连接场景，这种握手延迟影响较大，而且无法消除。毕竟 RTT 是人类和效率的终极斗争。

相比之下，QUIC 的握手连接更快，因为它使用了 UDP 作为传输层协议，这样能够减少三次握手的时间延迟。而且 QUIC 的加密协议采用了 TLS 协议的最新版本 *TLS 1.3*，相对之前的 *TLS 1.1-1.2*，TLS1.3 允许客户端无需等待 TLS 握手完成就开始发送应用程序数据的操作，可以支持1 RTT 和 0 RTT，从而达到**快速建立连接**的效果。

我们上面还说过，HTTP/2.0 虽然解决了队头阻塞问题，但是其建立的连接还是基于 TCP，无法解决请求阻塞问题。

而 UDP 本身没有建立连接这个概念，并且 QUIC 使用的 stream 之间是相互隔离的，不会阻塞其他 stream 数据的处理，所以使用 UDP 并不会造成队头阻塞。

在 TCP 中，TCP 为了保证数据的可靠性，使用了**序号+确认号**机制来实现，一旦带有 synchronize sequence number 的包发送到服务器，服务器都会在一定时间内进行响应，如果过了这段时间没有响应，客户端就会重传这个包，直到服务器收到数据包并作出响应为止。

>那么 TCP 是如何判断它的重传超时时间呢？

TCP 一般采用的是**自适应重传算法**，这个超时时间会根据往返时间 RTT 动态调整的。每次客户端都会使用相同的 syn 来判断超时时间，导致这个 RTT 的结果计算的不太准确。

虽然 QUIC 没有使用 TCP 协议，但是它也保证了可靠性，QUIC 实现可靠性的机制是使用了 *Packet Number*，这个序列号可以认为是 synchronize  sequence number 的替代者，这个序列号也是递增的。与 syn 所不同的是，不管服务器有没有接收到数据包，这个 Packet Number 都会 + 1，而 syn 是只有服务器发送 ack 响应之后，syn 才会 + 1。

![](http://www.cxuan.vip/image-20230128090602116.png)

比如有一个 PN = 10 的数据包在发送的过程中由于某些原因迟迟没到服务器，那么客户端会重传一个 PN = 11 的数据包，经过一段时间后客户端收到 PN = 10 的响应后再回送响应报文，此时的 RTT 就是 PN = 10 这个数据包在网络中的生存时间，这样计算相对比较准确。

>虽然 QUIC 保证了数据包的可靠性，但是数据的可靠性是如何保证的呢？

QUIC 引入了一个 *stream offset* 的概念，一个 stream 可以传输多个 stream offset，每个 stream offset 其实就是一个 PN 标识的数据，即使某个 PN 标识的数据丢失，PN + 1 后，它重传的仍旧是 PN 所标识的数据，等到所有 PN 标识的数据发送到服务器，就会进行重组，以此来保证数据可靠性。到达服务器的 stream offset 会按照顺序进行组装，这同时也保证了数据的顺序性。

![](http://www.cxuan.vip/image-20230128090628827.png)

众所周知，TCP 协议的具体实现是由操作系统内核来完成的，应用程序只能使用，不能对内核进行修改，随着移动端和越来越多的设备接入互联网，性能逐渐成为一个非常重要的衡量指标。虽然移动网络发展的非常快，但是用户端的更新却非常缓慢，我仍然看见有很多地区很多计算机还仍旧使用 xp 系统，尽管它早已发展了很多年。服务端系统不依赖用户升级，但是由于操作系统升级涉及到底层软件和运行库的更新，所以也比较保守和缓慢。

QUIC 协议的一个重要特点就是**可插拔性**，能够动态更新和升级，QUIC 在应用层实现了拥塞控制算法，不需要操作系统和内核的支持，遇到拥塞控制算法切换时，只需要在服务器重新加载一边即可，不需要停机和重启。

我们知道 TCP 的流量控制是通过**滑动窗口**来实现的，如果你对滑动窗口不太熟悉，你可以看下我写的这篇文章 

[TCP 基础知识](https://mp.weixin.qq.com/s?__biz=MzI0ODk2NDIyMQ==&mid=2247491621&idx=1&sn=78a182f89093ef1cc807bdef21cdcb4d&chksm=e99a1537deed9c2169257574c17877933b68fadd061f371c2f53a50e7f640d52f5f1667c895c&token=2108481110&lang=zh_CN#rd) 

在文章后面有提到了滑动窗口的一些概念。

而 QUIC 也实现了流量控制，QUIC 的流量控制也是使用了窗口更新 *window_update*，来告诉对端它可以接受的字节数。

TCP 协议头部没有经过加密和认证，所以在传输的过程中很可能被篡改，与之不同的是，QUIC 中的报文头部都是经过认证，报文也经过加密处理。这样只要对 QUIC 的报文有任何修改，接收端都能够及时发现，保证了安全性。

总的来说，QUIC 具有下面这些优势

* 使用 UDP 协议，不需要三次连接进行握手，而且也会缩短 TLS 建立连接的时间。
* 解决了队头阻塞问题。
* 实现动态可插拔，在应用层实现了拥塞控制算法，可以随时切换。
* 报文头和报文体分别进行认证和加密处理，保障安全性。
* 连接能够平滑迁移。

连接平滑迁移指的是，你的手机或者移动设备在 4G 信号下和 WiFi 等网络情况下切换，不会断线重连，用户甚至无任何感知，能够直接实现平滑的信号切换。

QUCI 协议已经被写在了 [RFC 9000](https://datatracker.ietf.org/doc/html/rfc9000) 中。

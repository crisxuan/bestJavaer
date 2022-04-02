# 学习计算机网络，看哪本书好？

不能单纯的比较哪本书好，只是侧重点不同。

我是先看过一遍计算机网络：自顶向下方法，然后最近才开始看谢老师的计算机网络。来说一下我看过的感受吧。

首先计算机网络：自顶向下方法是一本好书这没错，但是这本书并不是一本入门级别的书，书中很多内容都是从设计者的角度来讲的，这本书鼓励动手实践，wireshark 抓包，动手编程，比如第二章末尾就鼓励我们使用 Python 来编写一个套接字，来为后面的 TCP 、UDP 的理解做铺垫。比如第三章讲 TCP 的时候，就鼓励我们站在设计者的角度来思考问题：你如何构建一个可靠的数据传输协议。

你不要以一个开发的角度来看这本书，而是要以一个思考者的角度，设计者的角度来看，这本书有大量的专业词汇，我的这篇文章汇总了一下这本书中有哪些比较重要的概念和解释。

如果把计算机网络书籍按照难度来分成五个等级，那么这本书的级别在 3 - 4 级，难点体现在它是一本外文书，翻译成中文会有一些解释不到位的地方，二来是这本书的思想层次从开发的角度来看有些偏高。说白了就不是一本通俗易懂讲计算机网络的书籍。

如果你只是想要简简单单入门计算机网络的话，请移步至这两本书：

**《[图解TCP/IP](https://www.zhihu.com/search?q=图解TCP%2FIP&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2404934724})》**

![img](https://pic3.zhimg.com/80/v2-7e82ad04f03978207d4b6e5a9a63c3bf_720w.jpg?source=c8b7c179)

**《网络是怎样连接的》**

![img](https://pic2.zhimg.com/80/v2-b7d0d87f89e272bbfd736238388f1316_720w.jpg?source=c8b7c179)

计算机网络[自顶向下](https://www.zhihu.com/search?q=自顶向下&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2404934724})这本书需要多看几遍，反正我每次看都有新的感悟，好书应该都是这样的。

最好把后面的习题做了，这样你会对计算机网络的理解上升到一个更深的层次，而不单单的只是面向八股文来学计算机网络，计算机网络千万别背。。。。。。重在理解和实现。

这本书教给我的东西，比协议本身要重要得多。

1、思考并理解。虽然协议前辈都设计好了，我们用起来也很舒服。但是作者写这本书，他的目的不在于让你记住，而是让你站在设计者的角度去思考。比如讲TCP的时候，作者并没有一开始就拿出来完备的TCP的各种规则来让读者去记住，而是从一个最简单的底层模型开始，让读者去思考，如果你是设计者，你会怎么设计这个协议。当底层模型慢慢变得没那么理想，设计的协议要做哪些改动。一本好的教材就应该这样授人以渔。

2、实践实践再实践。计算机网络方面的知识，没有实践，很难学到东西。我在用wireshark抓包的时候，就发现了一些细节上的实践，书中说的和实际的情况已经不一样了，毕竟协议都是人定的。只有掌握在实践中分析问题，解决问题的能力，才是长久之道。

3、把握重点。计算机网络是我学习计算机以来，重点最不明确的一门学科。所以我刚开始学的时候，总是抓不住门道，觉得好复杂啊，这么多协议要学，什么TCP,UDP,IP,ARP,ICMP,BGP,RIP,OSFP根本记不住啊。现在虽然我可能也记不住，但是只要我知道怎么去得到我想要的信息，这就够了。时间应该就是这样节约下来的吧。

作者：颠颠De我（来自豆瓣）

来源：[学习计算机网络过程中的感悟](https://link.zhihu.com/?target=https%3A//book.douban.com/review/9915389/)

这本书对于绝大多数童鞋看 1 - 6 章就可以了，这六章能够涵盖我们日常开发中所用到的大部分内容。

如果你是通信方向的童鞋，那你需要看第七章，关于无线网络和移动网络这块。

如果你是搞网络安全的，那么第八章是你必不可少的内容。

至于多媒体应用这块，如果你有此业务场景，可以看一下这章。

这本书最大的特点就是从应用程序开始讲起，因为应用层是距离我们开发最近的一层，通过应用层下探，来讲述一个数据包是如何经过层层封装的，每一层都封装了哪些属性，这些属性都是做什么的，这些属性对于网络传输有哪些影响，到了服务器后，这些数据包是如何给上层应用使用的。

如果你看这本书的过程中有觉得晦涩难懂的，不妨看看我写的关于计算机网络的系列文章

[第一篇：计算机网络基础知识总结](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247486242%26idx%3D1%26sn%3Dfac49b0b79515a5ed6afd4b341aff87b%26chksm%3De999fe30deee772637e1c52fb9001c60e60a772e7adba6701329c81974e76c57bb7b2e570225%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第二篇：TCP/IP 基础知识总结](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247486408%26idx%3D1%26sn%3Dc332ae7ae448f3eb98865003ecade589%26chksm%3De999fedadeee77cc6281d1b170bd906b58220d6cd83054bc741821f4167f1f18ceee9ba0e449%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第三篇：计算机网络应用层协议](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247486507%26idx%3D1%26sn%3D622cc363b34bce54f4953076faa1cad6%26chksm%3De999f939deee702f2444df83ad9805de8c70fb88b89d299fdf0a82b3463e253f32372963c039%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第四篇：40张图带你搞懂TCP/UDP](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247487108%26idx%3D1%26sn%3D7b47f421bb1dee4edb357a10399b7fec%26chksm%3De999fb96deee7280a17bfff44c27ef11a60e93e48f9da738670a779ecf6accb5a6a4ebd3cbcc%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第五篇：计算机网络网络层协议](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247487683%26idx%3D1%26sn%3De0949e72e039759545450852d8bc0ada%26chksm%3De999e5d1deee6cc7ab9e42b50329924fee39c45955516b406046605d27928825a0f628d13e7c%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第六篇：ARP 协议总结](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247487804%26idx%3D1%26sn%3Df001a24a308053b3723dfb12d36045ee%26chksm%3De999e42edeee6d383fbb411792e22e4028bb8c2441255786f50cf848443af7b1bd5e382078dc%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第七篇：万字长文爆肝 DNS 协议！](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247487880%26idx%3D1%26sn%3Dfd38ce30ae82fa7d08e5f83fabb9d497%26chksm%3De999e49adeee6d8c1adacbfe27dc59097e4cb9d39c6a04802b0fe61877653330e75721cbde0b%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第八篇：ICMP 是个啥？](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247488316%26idx%3D1%26sn%3D360c3e6eb45e9cbd7c38f3d43e8850e7%26chksm%3De999e62edeee6f3806dfe9b5c8d00c5e521cae1a1e7b85fd33d7a7c64fa897b3632dd31b9d50%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第九篇：趣聊 DHCP ，有点意思](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247488546%26idx%3D1%26sn%3D9a8ec2b6900d930e51c55d01de3dd7b5%26chksm%3De999e130deee6826bac33f3f395f763b33b7cbe6809ae5e3b02a2e24daf816b13851d4f3246e%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第十篇：带带弟弟彻底搞懂链路层协议](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247488884%26idx%3D1%26sn%3D0fdb91b7f5081d2e24c82d891fcc6126%26chksm%3De999e066deee69704d162b97be2ff0d33225fa9a3d12e4d3bec90a34996e7db7134535f36e8e%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第十一篇：浏览器输入「xxxxhub」的背后.....](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247489155%26idx%3D1%26sn%3D8bcd1dda63e3e34c672973fd56e4f48f%26chksm%3De999e391deee6a8735ab4b0c0473b79cbeee577c2f8c4fb964e5ef6d932dc1614151b6a8a554%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第十二篇：TCP 基础知识总结（修正版）](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247490677%26idx%3D1%26sn%3Dd91b0edc0b25cdda0b2b2c635f53761e%26chksm%3De999e967deee607162d3c907987fbc77d2f45ca6a7b403e68587174a0048909c2840ad0935e3%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第十三篇：TCP 的两个细节点](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247491176%26idx%3D1%26sn%3D41647e2d965aea492f0fd2f21d2918b5%26chksm%3De999eb7adeee626c4828ae1c89cd57f48fb8bbb0a6321f44fed7e50bb817d4dbd1ff0c010732%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第十四篇：图解 HTTP 连接管理](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247492355%26idx%3D1%26sn%3D23ebe79ead7a2541f7d2f570f37baf1c%26chksm%3De99a1611deed9f0747877e386880cc0d2fcee2aa4e0c72c64e9011e7df4a45c736bec4a0565e%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第十五篇：HTTP 2.0 ，有点炸 ！](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247492836%26idx%3D1%26sn%3Dd48541fc7c7f5aeb0134ebd67ccf27f2%26chksm%3De99a11f6deed98e04ee6ea4c99f54bfe2876a78957a8cc0ac46014b4c0d7f7b283faf97e7eff%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第十六篇：5 分钟带你了解 HTTP 代理](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247493884%26idx%3D1%26sn%3Dc0783f628ef7a69346c94a1c1a341dc0%26chksm%3De99a1deedeed94f8f32324bec4fbf8ed6dd6367bc7d62de94de515ebee5ed3f01ee93177e293%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第十七篇：原来这才是 Socket！](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247494554%26idx%3D1%26sn%3D6cfa7a5ac3bd443e7734b0a688b53294%26chksm%3De99a1e88deed979ed721e9885dcb4a0ac86bd4fd14eb76056832050762eeb9b8c7423870f2fc%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第十八篇：NAT 协议？？？](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247495224%26idx%3D1%26sn%3D8146e152840c65adccf7e4e1044e3860%26chksm%3De99a1b2adeed923c154dac426bd36d24a1243a1d0fd6125aeade22645aafbc172fa5d930dfbe%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第十九篇：计算机网络简史](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247495339%26idx%3D1%26sn%3D4278a4815bd168f60800e2a3ae5ec79f%26chksm%3De99a1bb9deed92af0f403e6056438c10d7c1497523a36279c031b3a9403f1829a50479e44eff%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第二十篇：计算机网络的 166 个核心概念](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247495371%26idx%3D1%26sn%3D6129d43742af9b043666eb0d379f5709%26chksm%3De99a1bd9deed92cf7f0f29489f03b58b6c02fa4ecc26258d54ce45bff73617c66352461a396c%26token%3D750274947%26lang%3Dzh_CN%23rd)

[第二十一篇：10 分钟讲完 QUIC 协议](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247495609%26idx%3D1%26sn%3D3d8a29b3713952d9e664145500e672dd%26chksm%3De99a1aabdeed93bdcb4f51ff80c86c34aebf84bc22283dda39654d2cc1a4fb4be5ff05d5b26b%26token%3D750274947%26lang%3Dzh_CN%23rd)

另外，还有一篇如何学习计算机网络的文章。

[如何系统学习计算机网络？](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzI0ODk2NDIyMQ%3D%3D%26mid%3D2247488287%26idx%3D1%26sn%3Dcb169ed027447d691923dba9ae83d887%26chksm%3De999e60ddeee6f1b0ff69018aa8e4eb826306a99d8279ea4f8aa834bb870803f35cb2b69590d%26token%3D750274947%26lang%3Dzh_CN%23rd)

另外再给大家推荐一个自顶向下的搭配视频，食用起来更香

这是国立清华大学的课程 - [CS 321202 計算機網路概論](https://link.zhihu.com/?target=https%3A//ocw.nthu.edu.tw/ocw/index.php%3Fpage%3Dcourse%26cid%3D13%26)

我最近又在补谢老师的计算机网络，与自顶向下这本书不同的是，谢老师的计算机网络更多是从五层模型的底层开始讲起，而且我认为谢老师的计算机网络更多是偏向通信方向，比如物理层就讲到了各种信道技术、通信知识以及[网络接入技术](https://www.zhihu.com/search?q=网络接入技术&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2404934724})。讲到链路层会提到各种拓扑、以太网技术。所以这两本书侧重点不同，不能同一而论。大家可以根据需要选择。

不可否认这本书作为学生的教材来说是比较合适的，同时这本书也是国内教材中难得一见的好书，我认为可以和王爽的汇编语言并列。

希望广大教授和学者能够多出版这样的经典书籍，而不是出版一些驴唇不对马嘴的**噱头书籍**，目录看似很全，内容却一塌糊涂。


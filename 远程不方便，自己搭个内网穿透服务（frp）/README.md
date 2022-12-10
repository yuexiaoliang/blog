# 远程开发不方便，自己搭个内网穿透服务（frp）

本人前端，最近疫情原因经常远程办公，而使用远程桌面进行开发又十分卡顿，然乎就琢磨着自己搭一套内网穿透服务，代理一下公司测试环境的 http 地址不就可以了。

## 前置条件

- 一台可以外网访问的服务器
- 一个域名

## 概要

frp 主要分为两部分，一部分部署在公网服务器上，称为服务端(frps)，一部分部署在内网机器上，称为客户端(frpc)。必须两端都处于启动状态，才能使服务可用。可以通过 github 下载，也可以到[这里](https://d.frps.cn/)下载。

## 服务端部署

**以 linux 为例**

1. 执行 `wget https://d.frps.cn/file/frp/v0.37.0/frp_0.37.0_linux_amd64.tar.gz` 下载（下载地址可以换成自己需要的）。

2. 执行 `tar zxvf frp_0.37.0_linux_amd64.tar.gz` 解压（可以根据自己需要，解压到其他位置）。

3. 修改配置文件 `vim frps.ini`（可以根据自己习惯使用其他编辑器）。

```ini
[common]
bind_addr=0.0.0
; frp 要绑定的端口号，可以改成自己需要的
bind_port=7684
; http 服务要使用的端口，可以改成其他的，不过后边访问的时候要带上端口号
vhost_http_port=80
; token 自己随意搞一个
token=123456
```

这里要特别注意的是，服务器的防火墙要放开上边配置所用到的端口，否则会导致 frps 启动失败，或者代理失败。

可能用到的 linux 命令：

```bash
# 查看防火墙是否放开 7684 端口
$ sudo iptables -L -n --line-numbers | grep 7684

# 使防火墙放开 7684 端口
$ sudo iptables -I INPUT -ptcp --dport 7684 -j ACCEPT
```

## 部署服务端

**以 windows 为例**

```ini
[common]
; 公网服务器 IP 地址
server_addr = 63.98.37.53
; 公网服务器 frps 所绑定的端口
server_port = 7684
; token 要和服务端配置的一致
token=123456

; http 服务名称可以自定义
[dev74]
type=http
; 要代理的内网 IP
local_ip=192.168.1.74
; 要代理的端口
local_port=8080
; 自定义的域名，需要解析到服务器上
custom_domains=74.abc.com

; 可以配置多个
[dev75]
type=http
local_ip=192.168.1.75
local_port=9990
custom_domains=75.abc.com
```

## 启动

```bash
# 启动服务端
$ ./frps -c ./frps.ini

# 启动客户端，windows中也需要在命令行启动
$ ./frpc.exe -c ./frpc.ini
```

接下来访问 http://75.abc.com 就会代理到内网的 http://192.168.1.75:9990 上了，访问 http://74.abc.com 就会代理到内网的 http://192.168.1.74:8080 上了。这里要注意服务端的 `vhost_http_port` 如果不是 `80` 的话，记得加上端口号访问。

## 结语

本文提到的只是代理 http 服务，其实 frp 还提供了其他玩法，比如 https、ssh、tcp、udp 等，有兴趣可以到[这里](https://frps.cn/document)自行探索。

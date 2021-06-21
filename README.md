
# tenp-watch
- 支持监听所有请求接口的header，method，body，query，耗时，接口体积等，
- 自带半完善的监控界面，清晰显示每一条接口的各种状态已经参数
- 轻松识别get/post/delete/put/或其他接口，筛选查找需要观察的接口
- 支持多接口监听，可以同时添加多个监听链接
- 支持添加接口拦截器

## 接口拦截器功能
- 添加真实url，控制真实url接口返回的参数，控制header，query，body传参，控制接口返回的耗时，修改接口返回的状态码，自定义接口返回值
- 添加虚假url，包含上述所有功能，监听服务器不存在此接口，通过服务内部生成此url

## 安装
```base
$ npm i @tenp/watch -g
// 如果是linux/mac系统
$ sudo npm i @tenp/watch -g
```

## 常用命令
```base
--config                        查看默认配置
--set                           设置默认配置
    url=https://www.aacom       设置默认监听url
    port=1234                   设置默认服务端口
start                           启动监听服务
    https://www.aa.com          启动监听的url
    --port 1234                 设置启动监听的端口号
kill                            杀死进程
   端口号
list                            查看目前启动的进程
```
- 完整使用方式
```base
$ proxy start https://www.aaa.com --port 1234
```
- 配置默认访问
```base
$ proxy --set url=https://www.aaa.com
$ proxy --set port=1234
$ proxy start
```
- 杀死进程
```base
$ proxy kill 1234
```
- 查看所有启动的进程
```base
$ proxy list
```
![image](https://user-images.githubusercontent.com/15777183/122579669-b887c500-d087-11eb-9b7f-860fec7e0d2e.png)


## 系统界面
![QQ截图20210618221922](https://user-images.githubusercontent.com/15777183/122579402-752d5680-d087-11eb-8502-396480fe8e1c.png)

![QQ截图20210618222017](https://user-images.githubusercontent.com/15777183/122579447-81191880-d087-11eb-8c06-f9531c0e075a.png)

![QQ截图20210618222048](https://user-images.githubusercontent.com/15777183/122579455-837b7280-d087-11eb-8744-769416f90b73.png)

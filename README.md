<<<<<<< HEAD
# Eggjs+Tarojs+AntDesign+Typescript全栈无人商城开源版

### 一、项目介绍

youdidao 项目是一套无人电商售货系统，包含前台商城系统（小程序，快应用，h5，APP）、后台管理系统以及服务端。

#### 演示地址：

- 前端：![]()

- 商城管理系统：[]()

#### 安装部署：

- **开发环境安装**

1. 手动下载zip代码或者使用命令下载git clone 
2. 进入代码根目录：
   - shop-admin 后台管理系统代码
   - shop-client 前台商城系统代码
   - shop-server 服务端代码

3. 配置config文件：

   - 后台管理系统配置：

     shop-admin/config/config.js中配置'umi-plugin-apollo'的uri默认为

     http://127.0.0.1:7001/graphql对应服务端的接口

   - 前台商城系统配置：

     shop-client/src/utils/client.ts中配置new ApolloClient中的uri默认为

     http://127.0.0.1:7001/graphql对应服务端的接口

   - 服务端的配置

     shop-server/config/config.default.ts中配置对应的redis，mysql，以及第三方的接口配置。

4. 启动程序

   - 首先启动后台也就是服务端

     ```shell
     # 安装依赖包
     npm i
     npm run dev
     open http://localhost:7001/
     ```

   - 启动后台管理系统

     ```shell
     npm i
     npm run tsc
     npm run start
  ```
   
- 启动前台商城系统
   
     ```shell
     npm i
     # 微信小程序
     npm run dev:weapp
     # 百度小程序
     npm run dev:swan
     # 支付宝小程序
     npm run dev:alipay
     # h5网页
     npm run dev:h5
     # react-native
     npm run dev:rn
     ```



- **线上环境安装**

在本地安全平稳运行后，如果您想在您的生产环境上面部署，你可能需要搭建线上的安全生产环境。

1. 服务端

   到shop-server目录下打开控制台或者cd到shop-server目录进行

   ```shell
   npm i
   npm run start
   ```

   Eggjs框架内置了 [egg-cluster](https://github.com/eggjs/egg-cluster) 来启动 [Master 进程](https://eggjs.org/zh-cn/core/cluster-and-ipc.html#master)，Master 有足够的稳定性，不再需要使用 [pm2](https://github.com/Unitech/pm2) 等进程守护模块。

2. 前台商城系统

   ```shell
   npm i
   # 微信小程序
   npm run build:weapp
   # 百度小程序
   npm run build:swan
   # 支付宝小程序
   npm run build:alipay
   # h5网页
   npm run build:h5
   # react-native
   npm run build:rn
   ```

   按照您的需求可以进行按需打包，得到的代码在shop-client/dist目录下，按需上传服务器。

3. 后台管理系统

   ```shell
   npm i
   npm run build
   ```

   打包后的文件在shop-admin/dist目录下，倒出后进行服务器代码上传。

   

### 二、协议规定

 未获取商业授权之前，不得将本软件用于商业用途（包括但不限于二次开发销售，以营利为目的的商业用途等）。



### 三、联系我们



### 四、对有地道感兴趣？

官网：https://globecat.cn/

微信公众号：

QQ群：
=======
# unmanned-shop

#### 介绍
Unmanned-Shop全栈无人商城：前后端，管理端全部开源，技术栈：Eggjs+Tarojs+AntDesign+React+Graphql+Typescript，我们做全网首个公布无人商城开源。


#### 软件架构
软件架构说明


#### 安装教程

1.  xxxx
2.  xxxx
3.  xxxx

#### 使用说明

1.  xxxx
2.  xxxx
3.  xxxx

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 码云特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  码云官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解码云上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是码云最有价值开源项目，是码云综合评定出的优秀开源项目
5.  码云官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  码云封面人物是一档用来展示码云会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
>>>>>>> 25d3b5c63cc430db71cd4b43af037880680c5c21

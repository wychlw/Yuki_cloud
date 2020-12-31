# Yuki_cloud

[TOC]

## 简介

这个项目是一个个人网盘，目前暂时只支持本地文件存储。
尽管准备做密码、多用户访问和外链分享，但仍主要聚焦于个人使用。

## feature

（绝对不是bug！）
我正在努力的开发它呢...孩子要傻了，给孩子一点时间吧...

## 计划

- [x] 文件下载
- [ ] 文件上传
- [ ] 密码访问支持
- [ ] 用户系统
- [ ] 外部分享
- [ ] 文本文件&markdown文件预览

## 开始

安装
```shell
npn install yuki_cloud
```

初始化：自行配置config.js

启动
```shell
npm run
```
or
```shell
node main.js
```

！千万不要把它装到网站目录里，除非你想让它直接变成全透明的

### 程序结构


> index.html 单页面前端模块
> 
> main.js 路由处理，基本预处理
> 
> components 后端分模块
> > file_system.js 文件处理+鉴权模块 
> >
> > user_system.js 用户系统+用户鉴权模块
> >
> > user_db.json 用户账户存储地址
>
> contents 所有文件的存储目录

### 文件系统

由Yuki_config.json定义，接下来详解这个东西

每个文件夹下都有这样的一个文件，其中存储了这个文件夹内的结构

它的格式长这样：

```json
{
    "file_num": /*num*/, //记录了这个文件夹内项目的数量
    "file":[ //这里将会详细存储每个项目的信息
        {
            "name": "file name", //项目名
            "type":"file/folder/...", //项目种类，目前用来鉴别是文件/文件夹，接下来有些功能可能会依托于此
            "last_modification_time":"0", //项目的其他属性
            "access":{ //访问控制
                "user":[ //存储哪些用户能访问
                    "example" //用户名
                ],
                "password":"" //项目密码加盐后的SHA256值
            } //注：若某一项认证值为空，则连object都不要有，如下
        },
        {
            "name":"test1.txt",
            "type":"file",
            "last_modification_time":"0",
            "access":{}
        }
    ]
}
```

暂时想不到还有什么要写的了（毕竟还没开发完喵...）
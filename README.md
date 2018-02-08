## 我爱答题

1.负责题目及答案的分发、用户回答题目的计算等等

2.接受来自客户端与导播台的请求

## 运行
```
sh build.sh && ./idati
```

## 配置说明
```
listen:     // 服务监听端口
    8080
user:		// 用户信息
    accesskeyid: ace6d6b7731549bb81a3da1f4cde565b
    secretaccesskey: 98be3fbb93c44a258e9ebyc1f0fe8b7f
storage:	// 存储信息，默认为redis，支持改为其他
    redis:
        host: 127.0.0.1:6379
        password: ''
        defaultExpiration: 6000
log:		// 日志存储文件
    file: 'idati.log'
live:      // 默认流播放地址
    playurl: rtmp://play.domain.com/live/stream
```

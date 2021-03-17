# express-weixin

## 快速使用

1. 修改config/wx.config.js 的配置

- port 是你的端口号
- wxToken、wxAppId、wxAppSecret 是你在公众号后台填写的

2. 修改data/wx.config.db.json

menuTime: 菜单修改时间，每次修改菜单需要修改该值
menu: 菜单内容，格式参考微信开发文档
keyWords: 关键字回复功能
subscribeMsg: 关注时，回复的内容
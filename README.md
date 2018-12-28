# BabyUpload

这是一个使用FormData上传文件的小插件

## 创建对象
```js
var instance = new BabyUpload(options)
or
var instance = BabyUpload(options)
```
options是一个对象，参数如下

```js
var instance = new BabyUpload({
  el: '#id', // 选择器或者dom元素，必填
  url: 'path', // 上传的api，必填
  isChangeUpload: true, // 选择后是否立即上传
  name: 'file', // 上传的文件字段名
  data: {}, // 额外的参数
  withCredentials: false, // 支持发送 cookie 凭证信息
  success: function() {}, // http成功
  error: function() {}, // http失败
  change: function() {}, // 选择文件的回调
  beforeUpload: function() {} //发送之前的回调
})
```


 

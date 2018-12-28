# BabyUpload

这是一个使用FormData上传文件的小插件

## 创建实例对象
```js
var instance = new BabyUpload(options)
or
var instance = BabyUpload(options)
```
options是一个对象，参数如下

```js
{
  el: '#id', // 选择器或者dom元素，必填
  url: 'string', // 上传的api，必填
  isChangeUpload: true, // 选择后是否立即上传
  name: 'file', // 上传的文件字段名
  data: {}, // 额外的参数
  multiple: false, // 是否多张
  accept: '', // 接受上传的文件类型
  withCredentials: false, // 支持发送 cookie 凭证信息
  success: function(res) {}, // http成功
  error: function(err) {}, // http失败
  change: function(file, files) {}, // 选择文件的回调
  beforeUpload: function(files) {} //发送之前的回调
}
```
## 实例方法 - upload

isChangeUpload为flase才触发upload方法

```js
var instance = BabyUpload({
  el: '#id',
  url: 'string',
  isChangeUpload: false,
  name: 'file',
  success: function(res) {}, // http成功
  error: function(err) {}, // http失败
  change: function(file, files) {}, // 选择文件的回调
  beforeUpload: function(files) {} //发送之前的回调
})

$('#submit').click(function(ev) {
  instance.upload();
})
```

## 实例方法 - remove(index)

移除选中的图片，传入选中图片的索引，multiple为false可以不传
```
$('#btn').click(function(ev) {
  instance.remove(0);
})
```

## example

```html
<p>
  <img src="" class="img">
  <button id="remove">移除</button>
</p>
<button id="submit">upload</button>
```
```js
var upload = BabyUpload({
  el: '.img',
  url: '/api/v1/admin/common/file/upload',
  isChangeUpload: false,
  accept: 'image/gif, image/jpeg, image/png',
  success: function(res) {
    console.log('success', res)
  },
  error: function(res) {
    console.log('error', res)
  },
  change: function(file, files) {
    console.log('change', file, files)
    var path = URL.createObjectURL(file);
    $('.img').attr('src', path)
  },
  beforeUpload: function(files) {
    // console.log('beforeUpload', files)
  }
})

$('#submit').click(function(ev) {
  upload.upload();
})

$('#remove').click(function(ev) {
  upload.remove(0);
  $('.img').attr('src', '')
})
```



 

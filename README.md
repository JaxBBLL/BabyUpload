<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [BabyUpload](#babyupload)
  - [创建实例对象](#%E5%88%9B%E5%BB%BA%E5%AE%9E%E4%BE%8B%E5%AF%B9%E8%B1%A1)
  - [实例方法 - upload](#%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95---upload)
  - [实例方法 - remove(index)](#%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95---removeindex)
  - [example](#example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# BabyUpload

这是一个使用FormData上传文件的小插件，支持IE10+

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
  url: 'string', // 上传的url，必填
  isChangeUpload: false, // 选择后是否立即上传，默认false
  name: 'file', // 上传的文件字段名，默认file
  data: {}, // 额外的参数
  multiple: false, // 是否多个，默认false
  method: 'POST', // ajax上传的类型
  accept: '', // 接受上传的文件类型
  withCredentials: false, // 支持发送 cookie 凭证信息，默认false
  success: function(res) {}, // http成功, res是个数组，返回多个上传的结果
  error: function(err) {}, // http失败
  // 选择文件的回调，selectFiles当前操作选中的文件，allfiles是所有选择的文件
  change: function(selectFiles, allfiles) {}, 
  beforeUpload: function(files) {} //发送之前的回调，files是所有选择的文件
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
  accept: 'image/gif, image/jpeg, image/png',
  multiple: false,
  success: function(res) {
    console.log('success', res)
  },
  error: function(res) {
    console.log('error', res)
  },
  change: function(selectFiles, allfiles) {
    var path = URL.createObjectURL(selectFiles[0]);
    $('.img').attr('src', path)
  },
  beforeUpload: function(files) {
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



 

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [BabyUpload](#babyupload)
  - [预览](#%E9%A2%84%E8%A7%88)
  - [创建实例对象](#%E5%88%9B%E5%BB%BA%E5%AE%9E%E4%BE%8B%E5%AF%B9%E8%B1%A1)
  - [实例方法 - on](#%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95---on)
  - [实例方法 - upload](#%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95---upload)
  - [实例方法 - remove](#%E5%AE%9E%E4%BE%8B%E6%96%B9%E6%B3%95---remove)
  - [example](#example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# BabyUpload

这是一个使用FormData上传文件的小插件，支持单张多张上传，支持图片前端压缩，支持IE10+

## 预览

![image](https://github.com/JaxBBLL/BabyUpload/blob/master/preview.gif)

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
  multiple: false, // 是否多个，默认false，多个上传为ajax队列上传
  isCompress: false, //是否压缩
  method: 'POST', // ajax上传的类型
  accept: '', // 接受上传的文件类型
  withCredentials: false // 支持发送 cookie 凭证信息，默认false
}
```

## 实例方法 - on

on用来监听实例对象的事件
```js
on(eventName, callback)
```
[eventName]，有`change`、`beforeUpload`、`success`、`error`四个事件

- change, callback(selectFiles, allfiles) 监听选择文件的事件，selectFiles当前操作选中的文件，allfiles是所有选择的文件
- beforeUpload, callback(files) 监听发送之前的事件，files是所有选择的文件
- success, callback(res) 监听上传成功事件, res是个数组，返回多个上传的结果
- error, callback(err) 监听发送之前的事件，files是所有选择的文件

```js
var instance = BabyUpload(options)

instance.on('change', function(selectFiles, allfiles) { 
  
}).on('beforeUpload', function(files) {
  
}).on('success', function(res) {
  
}).on('error', function(err) {
  
})
```
## 实例方法 - upload

isChangeUpload为flase才触发upload方法

```js
var instance = BabyUpload({
  el: '#id',
  url: 'string',
  isChangeUpload: false,
  name: 'file'
}).on('success', function(res) {
  
}).on('beforeUpload', function(files) {
  
}).on('error', function(err) {
  
}).on('change', function(selectFiles, allfiles) {
  
})

$('#submit').click(function(ev) {
  instance.upload();
})
```

## 实例方法 - remove
```js
remove(index)
```
移除选中的图片，传入选中图片的索引，multiple为false可以不传
```
$('#btn').click(function(ev) {
  instance.remove(0);
})
```

## example

```html
<div class="upload-wrap">
  <img src="" class="img" id="upload1">
  <button id="remove1">移除</button>
  <button id="submit1">上传</button>
</div>
```
```js
var upload1 = new BabyUpload({
  el: '#upload1',
  url: '/api/v1/admin/common/file/upload',
  accept: 'image/gif, image/jpeg, image/png',
  multiple: false,
  isCompress: true, //是否压缩
  maxWidth: 500, //isCompress:true才起作用
  maxHeight: 500 //isCompress:true才起作用
}).on('change', function(selectFiles, allfiles) {
  console.log('change', selectFiles, allfiles)
  var path = URL.createObjectURL(selectFiles[0]);
  $('#upload1').attr('src', path)
}).on('success', function(res) {
  console.log('success', res)
}).on('error', function(err) {

}).on('beforeUpload', function() {
  console.log('beforeUpload')
})

$('#submit1').click(function(ev) {
  upload1.upload();
})

$('#remove1').click(function(ev) {
  upload1.remove(0);
  $('#upload1').attr('src', '')
})
```



 

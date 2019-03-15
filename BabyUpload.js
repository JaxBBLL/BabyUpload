/**
 * BabyUpload
 * Version 1.0.0
 * https://github.com/JaxBBLL/BabyUpload
 *
 * Copyright (c) 2018-present JaxBBLL
 * Released under the MIT license
 */
;
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.BabyUpload = factory());
}(this, function() {
  'use strict';

  function merge(target) {
    for (var i = 1, j = arguments.length; i < j; i++) {
      var source = arguments[i] || {};
      for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
          var value = source[prop];
          if (value !== undefined) {
            target[prop] = value;
          }
        }
      }
    }
    return target;
  };

  var noop = function() {};

  function Upload(options) {
    if (!(this instanceof Upload)) {
      return new Upload(options);
    }
    var defaults = {
      isChangeUpload: false, // 选择后是否立即上传
      name: 'file', // 上传的文件字段名,
      isCompress: false, //是否压缩
      maxWidth: 500, //isCompress:true才起作用
      maxHeight: 500, //isCompress:true才起作用
      multiple: false, // 是否多张
      data: {}, // 额外的参数,
      method: 'POST', // ajax上传的类型
      accept: '', // 接受上传的文件类型
      withCredentials: false, // 支持发送 cookie 凭证信息
      change: noop,
      beforeUpload: noop,
      success: noop, // http成功
      error: noop // http失败
    }

    var _opts = merge(defaults, options);
    var _this = this;

    var el = typeof _opts.el === 'string' ?
      document.querySelector(_opts.el) : _opts.el;
    this._opts = _opts;
    this.files = [];

    var eInput = document.createElement('input');
    eInput.setAttribute('type', 'file');
    eInput.setAttribute('name', 'file');
    if (this._opts.multiple) {
      eInput.setAttribute('multiple', 'multiple');
    }
    if (this._opts.accept) {
      eInput.setAttribute('accept', this._opts.accept);
    }
    eInput.style.display = 'none'
    document.body.appendChild(eInput)
    el.addEventListener('click', function(ev) {
      eInput.value = ''; // 修复图片移除后，添加同张图片不成功的问题
      eInput.click();
    }, false)

    eInput.addEventListener('change', function(ev) {
      var selectFiles = Array.prototype.slice.call(this.files)
      if (_this._opts.multiple) {
        _this.files = _this.files.concat(selectFiles)
      } else {
        _this.files = selectFiles
      }
      if (_this._opts.isCompress) {
        // 压缩begin
        var newFiles = []
        for (var i = 0; i < _this.files.length; i++) {
          compress(_this.files[i], {
            maxWidth: _this._opts.maxWidth,
            maxHeight: _this._opts.maxHeight
          }, function(newFile) {
            console.log(newFile)
            newFiles.push(newFile)
          })
        }
        _this.files = newFiles;
        // 压缩end
        console.log(_this.files)
      }
      // 压缩是异步的，这里立即上传可能有问题
      _this._opts.change(selectFiles, _this.files)
      if (_this._opts.isChangeUpload) {
        _this.upload();
      }
    }, false)
  }

  Upload.prototype.upload = function() {
    this._opts.beforeUpload(this.files);
    if (!this.files.length) {
      return false;
    }

    var url = this._opts.url;
    var method = this._opts.method;
    var cb = this._opts.success;
    var ecb = this._opts.error;
    var _this = this;
    var resultArr = [];
    for (var i = 0, size = this.files.length; i < this.files.length; i++) {
      var file = this.files[i];
      (function(file) {
        var formData = new FormData();
        formData.append(_this._opts.name, _this.files[i]);
        for (var k in _this._opts.data) {
          formData.append(k, _this._opts.data[k])
        }
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.withCredentials = _this._opts.withCredentials;
        xhr.onreadystatechange = function() {
          if (this.status == 200) {
            if (this.readyState == 4) {
              size -= 1;
              resultArr.push(toJson(this.responseText))
              if (size === 0) {
                cb && cb(resultArr)
              }
            }
          } else {
            ecb && ecb(toJson(this.responseText))
          }
        };
        xhr.send(formData);
      }(file));
    }
    this.files = []
  }
  Upload.prototype.remove = function(index) {
    if (!this.files.length) {
      return;
    }
    index = index === undefined ? 0 : index;
    this.files.splice(index, 1);
  }

  function toJson(string) {
    try {
      return JSON.parse(string)
    } catch (e) {
      return { data: string }
    }
  }

  function compress(file, options, cb) { // file获取选择的文件，这里是图片类型
    var maxWidth = options.maxWidth;
    var maxHeight = options.maxHeight;
    var reader = new FileReader()
    reader.readAsDataURL(file) //读取文件并将文件以URL的形式保存在resulr属性中 base64格式
    reader.onload = function(e) { // 文件读取完成时触发 
      var result = e.target.result // base64格式图片地址 
      var image = new Image();
      image.src = result // 设置image的地址为base64的地址 
      image.onload = function() {
        // 缩放图片需要的canvas
        var canvas = document.createElement('canvas');
        var context = canvas.getContext("2d");
        var ratio = parseFloat((image.width / image.height).toFixed(2))
        var maxValue = ratio > 1 ? image.width : image.height;
        if (ratio >= 1) { // 按照原图比例计算压缩后图的值
          maxHeight = maxWidth / ratio;
        } else {
          maxWidth = maxHeight / ratio;
        }
        var width = Math.min(maxWidth, image.width)
        var height = Math.min(maxHeight, image.height)
        canvas.width = width; // 设置canvas的画布宽度为图片宽度 
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height) // 在canvas上绘制图片 
        var dataUrl = canvas.toDataURL('image/jpeg', 0.1) // 0.92为压缩比，可根据需要设置，设置过小会影响图片质量
        var oFile = dataURLtoFile(dataUrl, ~new Date() + '.jpg')
        cb && cb(oFile)
      }
    }
  }

  function dataURLtoFile(dataurl, filename) { //将base64转换为文件
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
      type: mime
    });
  }

  return Upload;
}));

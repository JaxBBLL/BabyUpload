/**
 * BabyUpload
 * Version 1.0.0
 * https://github.com/JaxBBLL/BabyUpload
 *
 * Copyright 2018-2019 JaxBBLL
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

  var defaults = {
    isChangeUpload: true, // 选择后是否立即上传
    name: 'file', // 上传的文件字段名
    multiple: false, // 是否多张
    data: {}, // 额外的参数
    accept: '', // 接受上传的文件类型
    withCredentials: false, // 支持发送 cookie 凭证信息
    change: noop,
    beforeUpload: noop,
    success: noop, // http成功
    error: noop // http失败
  }

  function Upload(options) {
    if (!(this instanceof Upload)) {
      return new Upload(options);
    }
    options = merge(defaults, options);
    var _this = this;

    var el = typeof options.el === 'string' ?
      document.querySelector(options.el) : options.el;
    this.options = options;
    this.files = [];
    this.formData = new FormData();

    var eInput = document.createElement('input');
    eInput.setAttribute('type', 'file');
    eInput.setAttribute('name', 'file');
    if (this.options.multiple) {
      eInput.setAttribute('multiple', 'multiple');
    }
    if (this.options.accept) {
      eInput.setAttribute('accept', this.options.accept);
    }
    eInput.style.display = 'none'
    document.body.appendChild(eInput)
    el.addEventListener('click', function(ev) {
      eInput.value = ''; // 修复图片移除后，添加同张图片不成功的问题
      eInput.click();
    }, false)

    eInput.addEventListener('change', function(ev) {
      var file = this.files[0];
      if (_this.options.multiple) {
        _this.files.push(file)
      } else {
        _this.files = [file]
      }
      _this.options.change(file, _this.files)
      if (_this.options.isChangeUpload) {
        _this.upload();
      }
    }, false)
  }

  Upload.prototype.upload = function() {
    var url = this.options.url;
    var cb = this.options.success;
    var ecb = this.options.error;
    this.options.beforeUpload(this.files);
    if (!this.files.length) {
      return false;
    }
    for (var i = 0; i < this.files.length; i++) {
      this.formData.append(this.options.name, this.files[i]);
    }
    for (var k in this.options.data) {
      this.formData.append(k, this.options.data[k])
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.withCredentials = this.options.withCredentials;
    xhr.onreadystatechange = function() {
      if (this.status == 200) {
        if (this.readyState == 4) {
          cb && cb(toJson(this.responseText))
        }
      } else {
        ecb && ecb(toJson(this.responseText))
      }
    };
    xhr.send(this.formData);
    this.formData = new FormData();
    this.files = []
  }
  Upload.prototype.remove = function(index) {
    if (!this.files.length) {
      return;
    }
    index = this.options.multiple ? index : 0;
    this.files.splice(index, 1);
  }

  function toJson(string) {
    try {
      return JSON.parse(string)
    } catch (e) {
      return string
    }
  }

  return Upload;
}));

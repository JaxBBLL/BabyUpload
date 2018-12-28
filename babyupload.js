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
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory(global);
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(global);
  } else {
    global.BabyUpload = factory(global);
  }
}(typeof window !== 'undefined' ? window : this, function(window) {

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

  var defaults = {
    isChangeUpload: true, // 选择后是否立即上传
    name: 'file', // 上传的文件字段名
    data: {}, // 额外的参数
    withCredentials: false, // 支持发送 cookie 凭证信息
    success: function() {}, // http成功
    error: function() {}, // http失败
    change: function() {},
    beforeUpload: function() {}
  }

  function Upload(options) {
    if (!(this instanceof Upload)) {
      return new Upload(options);
    }
    options = merge(defaults, options);
    var _this = this;

    this.el = typeof options.el === 'string' ?
      document.querySelector(options.el) : options.el;
    this.options = options;
    this.files = [];
    this.formData = new FormData();

    var eInput = document.createElement('input');
    eInput.setAttribute('type', 'file');
    eInput.setAttribute('name', 'file');
    eInput.style.display = 'none'
    document.body.appendChild(eInput)
    this.el.addEventListener('click', function(ev) {
      eInput.click();
    }, false)

    eInput.addEventListener('change', function(ev) {
      var file = this.files[0];
      _this.files = [file]
      _this.options.change(file)
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
    this.formData.append(this.options.name, this.files[0]);
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
  Upload.prototype.remove = function() {
    this.files = [];
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

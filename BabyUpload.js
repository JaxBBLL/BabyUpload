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

  if (!HTMLCanvasElement.prototype.toBlob) { // 为IE方法
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      value: function(callback, type, quality) {
        var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
          len = binStr.length,
          arr = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
        }
        callback(new Blob([arr], {
          type: type || 'image/png'
        }));
      }
    });
  }

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

  function insertAfter(el, newEl) {
    var parentNode = el.parentNode;
    if (el.nextSibling) { //将在原有的后面插入新创建的元素,原因是没有insetAfter
      parentNode.insertBefore(newEl, el.nextSibling)
    } else { // 当前元素是最后一个，直接在父元素追加
      parentNode.appendChild(newEl)
    }
  }

  function readerImg(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = document.createElement("img");
      // 将解析的base64字符串赋值给img标签
      img.onload = function() {
        callback(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function compress(image, options, cb) {
    var maxWidth = options.maxWidth;
    var maxHeight = options.maxHeight;
    readerImg(image, function(image) {
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
      // 清除画布
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height) // 在canvas上绘制图片 
      // canvas转为blob
      canvas.toBlob(function(blob) {
        cb && cb(blob)
      }, 'image/jpeg');
    })
  }

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
      maxSize: 0 // 上图图片最大size, 0为不限制
    }

    var _opts = merge({}, defaults, options);
    var _this = this;

    var el = typeof _opts.el === 'string' ?
      document.querySelector(_opts.el) : _opts.el;
    this._opts = _opts;
    this.eventMap = this.eventMap || {};
    this.files = [];

    var eInput = document.createElement('input');
    eInput.setAttribute('type', 'file');
    eInput.setAttribute('name', el.name || '');
    if (this._opts.multiple) {
      eInput.setAttribute('multiple', 'multiple');
    }
    if (this._opts.accept) {
      eInput.setAttribute('accept', this._opts.accept);
    }
    eInput.style.display = 'none'
    insertAfter(el, eInput)
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
      var n = _this.files.length; // 记录总共选中了几张图片
      if (_this._opts.isCompress) {
        // 压缩begin
        var newFiles = []
        for (var i = 0; i < _this.files.length; i++) {
          compress(_this.files[i], {
            maxWidth: _this._opts.maxWidth,
            maxHeight: _this._opts.maxHeight
          }, function(newFile) {
            newFiles.push(newFile)
            n--;
            if (n == 0) { // 所有图片都压缩完
              _this.files = newFiles;
              if (_this._opts.isChangeUpload) {
                _this.upload();
              }
            }
          })
        }
      } else {
        if (_this._opts.isChangeUpload) {
          _this.upload();
        }
      }
      _this.trigger('change', selectFiles, _this.files)

    }, false)
  }

  Upload.prototype.upload = function() {
    this.trigger('beforeUpload', this.files);
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
        formData.append(_this._opts.name, _this.files[i], +new Date() + '.jpg'); // 需添加第三个参数filename
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
                _this.trigger('success', resultArr)
              }
            }
          } else {
            _this.trigger('error', toJson(this.responseText))
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
  Upload.prototype.on = function(evt, handler) {
    var evts = evt.split(' ');
    var isFunction = typeof(handler) === 'function';
    for (var i = 0; i < evts.length; i++) {
      this.eventMap[evts[i]] = this.eventMap[evts[i]] || [];
      if (isFunction) {
        this.eventMap[evts[i]].push(handler);
      }
    }
    return this;
  }

  Upload.prototype.trigger = function(evt) {
    var eventQueue = this.eventMap[evt];
    if (!eventQueue) {
      return;
    }
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < eventQueue.length; i++) {
      eventQueue[i].apply(this.el, args)
    }
  }

  function toJson(string) {
    try {
      return JSON.parse(string)
    } catch (e) {
      return { data: string }
    }
  }

  return Upload;
}));
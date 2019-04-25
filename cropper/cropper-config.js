!(function() {
  function createHtml() {
    var html = $('<div class="m-copper-wrap">\
      <div class="m-copper">\
        <div class="body">\
          <img src="" class="photo">\
        </div>\
        <div class="footer">\
          <button class="btn btn-default" type="button" data-action="cancel">取消</button>\
          <button class="btn btn-primary" type="button" data-action="upload">确定上传</button>\
        </div>\
      </div>\
    </div>');
    return html;
  }
  function CropperInit(input, opts) {
    var $dom = createHtml();
    $('body').append($dom);
    var baseWidth;
    var baseHeight;
    var $image = $dom.find('.photo');
    var options = {        
      aspectRatio: 1, // 纵横比
      viewMode: 2
    };
    var _opts = $.extend({}, {
      uploadSuccess: $.noop,
      cropSuccess: $.noop,
      fileName: 'file',
      url: '',
      width: '500',
      extra: {} // 额外的参数
    }, opts)
    this._opts = _opts;
    var _this = this;
    this.$dom = $dom;
    this.$image = $image;
    this.$inputImage = input;
    this.$image.cropper(options);     
    var uploadedImageURL;      
    if (URL) {         // 给input添加监听
      this.$inputImage.change(function() {          
        var files = this.files;          
        var file;          
        if (!_this.$image.data('cropper')) {            
          return;          
        }          
        if (files && files.length) {            
          file = files[0];
          if (/^image\/\w+$/.test(file.type)) { // 判断是否是图像文件
            readerImg(file, function(img) {
              uploadedImageURL = URL.createObjectURL(file);
              baseWidth = img.width;
              baseHeight = img.height;
              if (img.width < 450 || img.height < 450) {
                window.alert('图片宽和高不能小于450像素');
                _this.$inputImage.val('');
                return;
              }
              _this.$image.cropper('destroy').attr('src', uploadedImageURL).cropper(options);
              _this.$inputImage.val('');
              _this.$dom.show()
            })
          } else {             
            window.alert('请选择一个图像文件！');           
          }         
        }       
      });      
    } else {        
      _this.$inputImage.prop('disabled', true).addClass('disabled');      
    }
    this.$dom.on('click', '[data-action="upload"]', function() {
      _this.send()
    })

    this.$dom.on('click', '[data-action="cancel"]', function() {
      _this.$dom.hide();
    })
  }
  CropperInit.prototype.send = function() {
    var _this = this;
    this.$image.cropper('getCroppedCanvas', {        
      width: 450,
      height: 450
    }).toBlob(function(blob) {
      blobToDataURL(blob, function(base64) {
        _this.sendImg(blob, base64)
      })
    }, 'image/jpeg');
  }

  CropperInit.prototype.sendImg = function(file, base64) {
    var _this = this;
    var formData = new FormData();
    formData.append(this._opts.fileName, file, +new Date() + '.jpg');
    for(var k in this._opts.extra) {
      formData.append(k, this._opts.extra[k]);
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this._opts.url, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function() {
      if (this.status == 200) {
        if (this.readyState == 4) {
          _this._opts.uploadSuccess(JSON.parse(xhr.responseText), base64);
          _this.$dom.hide();
        }
      } else {

      }
    };
    xhr.send(formData);
  };

  function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {
      callback(e.target.result);
    }
    a.readAsDataURL(blob);
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
  if (!HTMLCanvasElement.prototype.toBlob) {
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

  window.CropperInit = CropperInit;
  $.cropperInit = function(input, opts) {
    return new CropperInit(input, opts)
  }
})();

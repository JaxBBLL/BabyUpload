!(function() {
  var $albumDialog = $('#albumDialog');
  var $albumAddBtn = $albumDialog.find('.album-add');
  var $uploadBtn = $albumDialog.find('.upload-btn');

  var albumObject = {
    init: function() { // 初始化操作
      var _this = this;
      $albumAddBtn.click(function() {
        _this.addDialogOpen();
      })

      // 必须先引入截图相关文件
      if ($.cropperInit !== undefined) {
        $.cropperInit($uploadBtn, {
          url: '/api/v1/admin/common/file/upload',
          uploadSuccess: function(res, base64) {
            console.log('1', res);
          }
        });
      } else {
        alert('请引入截图相关文件');
      }
    },
    dialogOpen: function() {
      $albumDialog.modal('show');
      $albumDialog.find(':checkbox').prop('checked', false); // 清空选中的图片
      $albumDialog.find(":radio").eq(0).attr("checked", true); // 默认选中第一个相册
    },
    addDialogOpen: function() {
      var msg = '<form><input type="text" class="form-control" placeholder="请输入相册名称"></form>'
      bootbox.dialog({
        title: '添加相册',
        message: msg,
        size: 'small',
        closeButton: true,
        buttons: {
          ok: {
            label: "确定",
            className: 'btn-primary',
            callback: function() {
              console.log('do something')
              return false;
            }
          }
        }
      });
    },
    albumAdd: function() {}
  }
  albumObject.init();
  window.albumObject = albumObject;
}());

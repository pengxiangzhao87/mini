// pages/my/editInfo/editInfo.js
var app = getApp();
Page({

  data: {
    info:{}
  },

  onLoad:function(e) {
    var info = JSON.parse(e.json);
    var baseUrl = app.globalData.baseUrl;
    this.setData({
      info:info,
      baseUrl:baseUrl
    })
  },
  chooseImg:function(){
    var that = this;
    var baseUrl=that.data.baseUrl;
    wx.chooseImage({
       count: 1, // 默认9
       sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
       sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
       success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        wx.showToast({
          icon: "loading",
          title: "正在上传"
        })
        wx.uploadFile({
          url: baseUrl+"user/uploadAvatar",
          filePath: tempFilePaths[0], 
          name: 'file',
          formData:{'uId':4},
          success:function(res){
            var data = JSON.parse(res.data);
            if(data.code==200){
              wx.showToast({
                title: '上传成功',
                icon: 'success',
                duration: 2000
              })
            }else{
              wx.showToast({
                icon:'none',
                title: '服务器异常'
              })
            }
          }
        })

       }
    })
  },
  logout:function(){
    var that = this;
    var baseUrl=that.data.baseUrl;
    var paras = {};
    paras.phone=that.data.info.u_phone;
    wx.request({
      url: baseUrl+"user/logOut",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          console.info(res)
        }else{  
          wx.showToast({
            title: res.data.msg
          })
        }
      },fail(res){
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  updateNickName:function(){
    var json = JSON.stringify(this.data.info);
    wx.navigateTo({
      url: '../update/updateNickName/updateNickName?json='+json
    })
  },
  updateContent:function(){
    var json = JSON.stringify(this.data.info);
    wx.navigateTo({
      url: '../update/updateContent/updateContent?json='+json
    })
  }
})

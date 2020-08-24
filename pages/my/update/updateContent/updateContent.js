// pages/my/update/updateContent/updateContent.js
var app = getApp();
Page({
  data: {
    info:{},
    baseUrl:''
  },

  onLoad:function(e) {
    var info = JSON.parse(e.json);
    var baseUrl = app.globalData.baseUrl;
    this.setData({
      info:info,
      baseUrl:baseUrl
    })
  },
  save:function(e){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var content = e.detail.value.content.replace(/\s+/g,"");
    if(content==''){
      wx.showToast({
        icon:'none',
        title: '不能为空',
        duration:1500
      })
      return;
    }
    var info = that.data.info;
    info.u_content=content;
    var json = JSON.stringify(info);
    wx.request({
      url: baseUrl+"user/updateUserSetting",
      method: 'post',
      data: json,
      success(res) {
        if(res.data.code==200){
          wx.showToast({
            title: '保存成功',
            success:function(){
              var pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
              var prevPage = pages[ pages.length - 2 ];  
              //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
              prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                nextFlag:1,
                info:info
              })
              //延时2秒
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 1500);
            }
          })
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },
      fail:function(res){
        wx.showToast({
          title: '服务器异常'
        })
      }
    })
 
     
  }
})

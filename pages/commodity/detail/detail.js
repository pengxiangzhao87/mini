// pages/commodity/detail/detail.js
var app = getApp();
Page({
  data: {
    baseUrl:"",
    detail:{}
  },
  onLoad:function(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    that.setData({
      baseUrl:baseUrl
    })
    var data={};
    data.sId=e.sid;
    data.userId=1;
    wx.request({
      url: baseUrl+"commodity/queryCollage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var result = res.data.data;
          if(result.s_address_video!=''){
            var urlList=[];
            urlList.push(result.s_address_video);
            var imgList = result.s_address_img.split('~');
            urlList = urlList.concat(imgList);
            result.urlList=urlList;
            result.isVideo=1;
          }else{
            result.isVideo=0;
          }
          console.info(result)
          that.setData({
            detail:result
          })
        }else{
          wx.showToast({
            title: "服务器异常"
          })
        }
      },
      fail(res) {
        wx.showToast({
          title: "服务器异常"
        })
      }
    })
  },
  subtract:function(){

  },
  add:function(){
    
  }
})

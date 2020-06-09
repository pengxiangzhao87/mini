// pages/shoppingCar/address/address.js
var app = getApp();
Page({

  data: {
    baseUrl:''
  },

  onLoad:function (){
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.uId=1;
    wx.request({
      url: baseUrl+"user/queryAddressList",
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
          title: res.data.msg
        })
      }
    })
  }
})

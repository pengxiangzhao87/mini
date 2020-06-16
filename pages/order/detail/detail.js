// pages/my/order/detail/detail.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    detail:[]
  },
  onLoad:function(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.oId=e.oid;
    wx.request({
      url: baseUrl+"order/queryOrderDetail",
      method: 'get',
      data: paras,
      success(res) {
        console.info(res)
        if(res.data.code==200){
          that.setData({
            detail:res.data.data,
            baseUrl:baseUrl
          })
        }
      }
    })
  }
})

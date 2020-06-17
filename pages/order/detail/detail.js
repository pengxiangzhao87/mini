// pages/my/order/detail/detail.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    detailList:[],
    info:{}

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
          var detailList = res.data.data.detailList;
          that.setData({
            detailList:detailList,
            info:res.data.data.info,
            baseUrl:baseUrl
          })
        }
      }
    })
  }
})

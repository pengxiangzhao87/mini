// pages/my/deal/deal.js
var app = getApp();
Page({

  data: {
    dealList:[],
    baseUrl:''
  },

  onLoad:function() {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras = {};
    paras.uId=wx.getStorageSync('uId');
    wx.request({
      url: baseUrl+"user/queryAccountDetail",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.setData({
            baseUrl:baseUrl,
            dealList:res.data.data
          })
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
  toDetail:function(e){
    var direction = e.currentTarget.dataset.direction;
    if(direction!=1){
      var oid = e.currentTarget.dataset.oid;
      wx.navigateTo({
        url: '/pages/order/detail/detail?oid='+oid
      })
    }
  }
})

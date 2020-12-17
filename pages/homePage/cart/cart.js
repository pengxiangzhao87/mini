// pages/homePage/cart/cart.js
var app = getApp();
Page({
  data: {
    baseUrl:''
  },
  /**
   * 组件的方法列表
   */
  onShow(){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    console.info(baseUrl)
    wx.request({
      url: baseUrl+"menu/queryCartList",
      method: 'get',
      data: {'uId':wx.getStorageSync('uId')},
      success(res) {
        console.info(res)
        that.setData({
          menuList:res.data.data.list
        })
      }
    })
  }
})

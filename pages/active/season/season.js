// pages/avtive/season/season.js
var app = getApp();
Page({

  /**
   * 组件的初始数据
   */
  data: {
    baseUrl:'',
    commodity:[]
  },

  /**
   * 组件的方法列表
   */
  onLoad: function(){
    var baseUrl = app.globalData.baseUrl;
    this.setData({
      baseUrl:baseUrl
    })
  },
  onShow:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var paras = {};
    paras.userId=4
    wx.request({
      url: baseUrl+"commodity/queryInSeason",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data;
          console.info(list)
          that.setData({
            commodity:list
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
  }
  
})

const { touchStart } = require("../../utils/util");

// pages/homePage/homePage.js
var app = getApp();
Page({
 
  data: {
    baseUrl:'',
    topH:'',
    bannerH:'',
    categoryList:[],
    menuList:[]
  },

  /**
   * 组件的方法列表
   */
  onLoad:function() {
    var baseUrl = app.globalData.baseUrl;
    var bannerH = app.globalData.ww*0.94*495/1530;
    var that = this;
    that.setData({
      baseUrl:baseUrl,
      bannerH:bannerH,
      topH:bannerH+40
    })
  },
  onShow:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var paras={};
    paras.page=1;
    paras.rows=10;
    wx.request({
      url: baseUrl+"menu/queryMenuList",
      method: 'get',
      data: paras,
      success(res) {
        that.setData({
          menuList:res.data.data.list
        })
      }
    })
    wx.request({
      url: baseUrl+"menu/queryHomePageCategory",
      method: 'get',
      success(res) {
        that.setData({
          categoryList:res.data.data
        })
      }
    })

  },
  toDetail:function(e){
    var mid = e.currentTarget.dataset.mid;
    wx.navigateTo({
      url: 'detail/detail?mid='+mid
    })

  },
  
})

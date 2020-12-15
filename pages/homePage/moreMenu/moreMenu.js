// pages/homePage/moreMenu/moreMenu.js
var app = getApp();
Page({
 
  data: {
    baseUrl:'',
    foodId:-1,
    menuList:[]
  },

  
  onLoad(e) {
    var baseUrl = app.globalData.baseUrl;
    this.setData({
      baseUrl:baseUrl,
      foodId:e.foodid
    })
  },
  onShow(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var paras={};
    paras.page=1;
    paras.rows=10;
    paras.foodId = that.data.foodId;
    console.info(paras)
    wx.request({
      url: baseUrl+"menu/queryMenuList",
      method: 'get',
      data:paras,
      success(res) {
        console.info(res)
        var menuList = res.data.data.list;
        that.setData({
          menuList:menuList
        })
      }
    })
  },
  toMenuDetail(e){
    var menuid = e.currentTarget.dataset.menuid;
    wx.navigateTo({
      url: '../detail/detail?mid='+menuid
    })
  }
})

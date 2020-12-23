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
  },
  addMenuDefaultToCart(e){
    var that = this;
    var mid = e.currentTarget.dataset.mid;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/addMenuDefaultToCart",
      method: 'get',
      data: {'menuId':mid,'uId':wx.getStorageSync('uId')},
      success(res) {
        console.info(res)
      }
    })
  },
})

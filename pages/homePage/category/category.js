// pages/homePage/category/category.js
var app = getApp();
Page({

  data: {
    baseUrl:'',
    flag:0,//0:美食，1：食材
    category1:-1,
    category2:-1,
    categoryList:[],
    menuList:[],
    foodList:[]

  },

  onLoad(e) {
    var baseUrl = app.globalData.baseUrl;
    var that = this;
    that.setData({
      baseUrl:baseUrl,
      flag:e==undefined?0:e.flag,
      category1:e==undefined?-1:e.category1
    })
    wx.request({
      url: baseUrl+"menu/queryCategoryList",
      method: 'get',
      success(res) {
        console.info(res)
        that.setData({
          categoryList:res.data.data.list
        })
      }
    })
  },
  onShow(){
    var that = this;
    var category1 = that.data.category1;
    var category2 = that.data.category2;
    var flag = that.data.flag;
    if(flag == 0){
      var paras={};
      paras.page=1;
      paras.rows=10;
      if(category1!=-1){
        paras.category1Id = category1;
      }
      if(category2!=-1){
        paras.category2Id = category2;
      }
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
    }else{
      var paras={};
      paras.page=1;
      paras.rows=10;
      if(category1!=-1){
        paras.category1Id = category1;
      }
      if(category2!=-1){
        paras.category2Id = category2;
      }
      wx.request({
        url: baseUrl+"menu/queryFoodList",
        method: 'get',
        data: paras,
        success(res) {
      
          that.setData({
            foodList:res.data.data.list
          })
        }
      })
    }
    
  }
})

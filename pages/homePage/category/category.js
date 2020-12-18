// pages/homePage/category/category.js
var app = getApp();
Page({

  data: {
    baseUrl:'',
    type:0,//0:美食，1：食材
    category1:1,
    category2:1,
    categoryList:[],
    menuList:[],
    foodList:[],
    ww:0,
    hh:0

  },

  onLoad() {
    var baseUrl = app.globalData.baseUrl;
    var ww = app.globalData.ww;
    var hh = app.globalData.hh;
    var cid = app.globalData.cid;
    var type = app.globalData.type;
    var that = this;
    that.setData({
      baseUrl:baseUrl,
      type:type,
      category1:cid,
      ww:ww-55,
      hh:hh-90
    })
    wx.request({
      url: baseUrl+"menu/queryCategoryList",
      method: 'get',
      success(res) {
    
        that.setData({
          categoryList:res.data.data
        })
      }
    })
  },
  onShow(){
    var that = this;
    var category1 = that.data.category1;
    var category2 = that.data.category2;
    var type = that.data.type;
    var baseUrl = that.data.baseUrl;
    var paras={};
    paras.page=1;
    paras.rows=10;
    paras.category1Id = category1;
    paras.category2Id = category2;
    if(type == 0){
      that.queryMenu(that,baseUrl,paras);
    }else{
      that.queryFood(that,baseUrl,paras);
    }
  },
  queryMenu(that,baseUrl,paras){
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
  },
  queryFood(that,baseUrl,paras){
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
  },
  chooseFirst(e){
    var cid = e.currentTarget.dataset.cid;
    var type = e.currentTarget.dataset.type;
    var that = this;
    var categoryList = that.data.categoryList;
    var category2 = 0;
    for(var idx in categoryList){
      var item = categoryList[idx];
      if(item.c_id==cid){
        var detail = item.category2List;
        if(detail.length>0){
          category2 = detail[0].c_id;
        }
        break;
      }
    }
    that.setData({
      type:type,
      category1:cid,
      category2:category2
    })
    that.onShow();
  },
  chooseSecond(e){
    var that = this;
    var cid = e.currentTarget.dataset.cid;
    that.setData({
      category2:cid
    })
    that.onShow();
  },
  toMenuDetail(e){
    var mid = e.currentTarget.dataset.mid;
    wx.navigateTo({
      url: '../detail/detail?mid='+mid
    })
  },
  tofoodDetail(e){
    var fid = e.currentTarget.dataset.fid;
    wx.navigateTo({
      url: '../foodDetail/foodDetail?foodid='+fid
    })
  },
  toSearch(){
    var type = this.data.type;
    wx.navigateTo({
      url: '../search/history/history?type='+type
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

      }
    })
  },
  addFoodToCart(e){
    var foodid = e.currentTarget.dataset.foodid;
    var num = e.currentTarget.dataset.num;
    var that = this;
    var data = {};
    data.foodId = foodid;
    data.cNumber = num;
    data.userId = wx.getStorageSync('uId');

    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/addFoodToCart",
      method: 'post',
      data: data,
      success(res) {
 
      }
    })
  },
})

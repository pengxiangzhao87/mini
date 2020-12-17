// pages/commodity/search/search.js
var util= require('../../../utils/util.js')
var app = getApp();
Page({
   
  data: {
    baseUrl:"",
    sName:"",
    type:0,
    menuList:[],
    foodList:[],
    floorstatus:true
  },
  onLoad:function(e){
    this.setData({
      type:e.type,
      ww:app.globalData.ww-90,
      sName:e.sName,
      baseUrl:app.globalData.baseUrl
    })
  },
  onShow:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var sName = that.data.sName;
    var type = that.data.type;
    var paras={};
    paras.page=1;
    paras.rows=10;
    if(type==0){
      paras.menuName = sName;
      that.queryMenu(that,baseUrl,paras);
    }else{
      paras.foodName = sName;
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
  turnSearch(){
    this.setData({
      sName:'',
      type:this.data.type==0?1:0
    })
    this.onShow();
  },
  searchName(e){
    this.setData({
      sName:e.detail.value
    })
    this.onShow();
  },
  onPageScroll: function (e) {
    var that = this;
    if (e.scrollTop > 500) {
      that.setData({
        floorstatus: false
      });
    } else {
      that.setData({
        floorstatus: true
      });
    }
  },
  //回到顶部
  goTop:function(){
    wx.pageScrollTo({
      scrollTop:0
    })
  },
  toCart(){
    wx.switchTab({
      url: 'category/category'
    })
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
  addFoodToCart(e){
    var foodid = e.currentTarget.dataset.foodid;
    var num = e.currentTarget.dataset.num;
    var that = this;
    var data = {};
    data.foodId = foodid;
    data.cNumber = num;
    data.userId = wx.getStorageSync('uId');
    console.info(data)
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/addFoodToCart",
      method: 'post',
      data: data,
      success(res) {
        console.info(res)
      }
    })
  },
   
})

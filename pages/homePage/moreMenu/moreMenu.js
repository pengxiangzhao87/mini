// pages/homePage/moreMenu/moreMenu.js
var util= require('../../../utils/util.js')
var app = getApp();
Page({
 
  data: {
    baseUrl:'',
    foodId:-1,
    menuList:[],
    carSum:0,
    bus_x:0,
    bus_y:0,
    busPos:[],
    pointHid:true,
  },

  
  onLoad(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var busPos = [];
    busPos['x'] = 22;
    busPos['y'] = 13;
    var paras={};
    paras.page=1;
    paras.rows=10;
    paras.foodId = e.foodid;
    paras.uId = wx.getStorageSync('uId');
    wx.request({
      url: baseUrl+"menu/queryMenuList",
      method: 'get',
      data:paras,
      success(res) {
        var menuList = res.data.data.list;
        that.setData({
          menuList:menuList,
          baseUrl:baseUrl,
          foodId:e.foodid,
          busPos:busPos
        })
      }
    })
  },
  onShow(){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras = {};
    paras.uId=wx.getStorageSync('uId');
    util.getCarNum(that,paras,baseUrl,false);
  },
  toMenuDetail(e){
    var menuid = e.currentTarget.dataset.menuid;
    wx.navigateTo({
      url: '../detail/detail?mid='+menuid
    })
  },
  addMenuDefaultToCart(e){
    this.finger = {};
    this.finger['x'] = e.detail.x-10;
    this.finger['y'] = e.detail.y-30;
    var that = this;
    var mid = e.currentTarget.dataset.mid;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/addMenuDefaultToCart",
      method: 'get',
      data: {'menuId':mid,'uId':wx.getStorageSync('uId')},
      success(res) {
        if(res.data.code==200){
          that.touchOnGoods();
        }
      }
    })
  },
  toCart(){
    wx.switchTab({
      url: '../cart/cart'
    })
  },
  onPageScroll: function (e) {
    var that = this;
    var busPos = that.data.busPos;
    busPos['y'] = app.globalData.hh+e.scrollTop;
    that.setData({
      busPos:busPos
    })
  },
  touchOnGoods: function(sid) {
    // 如果good_box正在运动
    //当前点击位置的x，y坐标
    var that = this;
    var busPos = that.data.busPos;
    var topPoint = {};
    topPoint['y'] = this.finger['y']+100;
    if (this.finger['x'] < busPos['x']) {
        topPoint['x'] = Math.abs(this.finger['x'] - busPos['x'])/2 + this.finger['x'];
    } else {
        topPoint['x'] = Math.abs(this.finger['x'] - busPos['x'])/2 + busPos['x'];
    }
    this.linePos = app.bezier([this.finger, topPoint, busPos], 150);
    this.startAnimation(sid);
  },
  //开始动画
  startAnimation:function(sid) {
      var that = this;
      var bezier_points = that.linePos['bezier_points'];
      that.setData({
          pointHid:false,
          bus_x: that.finger['x'],
          bus_y: that.finger['y']
      })
      this.timer = setInterval(bus_set,30);
      function bus_set(){
        for(var index=0;index<bezier_points.length;index++){
          that.setData({
              bus_x: bezier_points[index]['x'],
              bus_y: bezier_points[index]['y']
          })
          if(index==bezier_points.length-1){
            clearInterval(that.timer);
            that.setData({
              pointHid:true
            })
            that.onShow();
          }
        }
      }
  },
})

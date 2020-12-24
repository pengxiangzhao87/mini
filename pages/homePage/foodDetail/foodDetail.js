// pages/homePage/foodDetail/foodDetail.js
var util= require('../../../utils/util.js')
var app = getApp();
Page({
 
  data: {
    baseUrl:'',
    detail:{},
    imgList:[],
    descList:[],
    animation:'',
    carSum:0,
    bus_x:0,
    bus_y:0,
    busPos:[],
    pointHid:true,

  },

  /**
   * 组件的方法列表
   */
  onLoad(e) {
    var baseUrl = app.globalData.baseUrl;
    var that = this;
    var busPos = [];
    busPos['x'] = 25;
    busPos['y'] = app.globalData.hh-30;
    wx.request({
      url: baseUrl+"menu/queryFoodDetail",
      method: 'get',
      data:{'foodId':e.foodid},
      success(res) {
        var detail = res.data.data;
        var imgList = detail.f_img_adr.split('~');
        var descList = detail.f_desc_img_adr.split('~');
        that.setData({
          baseUrl:baseUrl,
          detail:detail,
          imgList:imgList,
          descList:descList,
          busPos:busPos
        })
      }
    })
    var paras = {};
    paras.uId=wx.getStorageSync('uId');
    util.getCarNum(that,paras,baseUrl,false);
  },
  onShow(){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras = {};
    paras.uId=wx.getStorageSync('uId');
    util.getCarNum(that,paras,baseUrl,false);
  },
  sub(){
    var that = this;
    var detail = that.data.detail;
    var number = detail.f_init_number;
    var price = detail.f_price*1;
    var totalPrice = detail.totalPrice*1;
    var type = detail.f_type;
    var newNumber = type==0?number-1:number-50;
    if(newNumber<=0){
      return;
    }
    detail.f_init_number = newNumber;
    detail.totalPrice = (totalPrice-price).toFixed(2);
    that.setData({
      detail:detail
    })
  },
  add(){
    var that = this;
    var detail = that.data.detail;
    var number = detail.f_init_number;
    var price = detail.f_price*1;
    var totalPrice = detail.totalPrice*1;
    var type = detail.f_type;
    var newNumber = type==0?number+1:number+50;
    detail.f_init_number = newNumber;
    detail.totalPrice = (totalPrice+price).toFixed(2);
    that.setData({
      detail:detail
    })
  },
  moreMenu(e){
    var foodid = e.currentTarget.dataset.foodid;
    wx.navigateTo({
      url: '../moreMenu/moreMenu?foodid='+foodid
    })
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
  addFoodToCart(e){
    this.finger = {};
    this.finger['x'] = e.detail.x-10;
    this.finger['y'] = e.detail.y-30;
    var that = this;
    var detail = that.data.detail;
    var data = {};
    data.foodId = detail.f_id;
    data.cNumber = detail.f_init_number;
    data.userId = wx.getStorageSync('uId');
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/addFoodToCart",
      method: 'post',
      data: data,
      success(res) {
        if(res.data.code==200){
          that.touchOnGoods();
        }
      }
    })
  },
  touchOnGoods: function(sid) {
    // 如果good_box正在运动
    //当前点击位置的x，y坐标
    var that = this;
    var busPos = that.data.busPos;
    var topPoint = {};
    topPoint['y'] = this.finger['y']-100;
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


// pages/homePage/homePage.js
var util= require('../../utils/util.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var app = getApp();
var qqMap = new QQMapWX({
  key: '5ZNBZ-VAPWP-THWD3-LBXL6-UK6GQ-UZBGN' // 必填
});
Page({
 
  data: {
    baseUrl:'',
    topH:'',
    bannerH:'',
    categoryList:[],
    menuList:[],
    address:'',
    bus_x:0,
    bus_y:0,
    busPos:[],
    pointHid:true,
  },

  /**
   * 组件的方法列表
   */
  onLoad:function() {
    var baseUrl = app.globalData.baseUrl;
    var bannerH = app.globalData.ww*0.94*495/1530;
    var that = this;
    var ww = app.globalData.ww;
    var hh = app.globalData.hh;
    var busPos = [];
    busPos['x'] = ww*5/8;
    busPos['y'] = hh;
    that.setData({
      baseUrl:baseUrl,
      bannerH:bannerH,
      topH:bannerH+40,
      busPos:busPos
    })
  },
  onShow:function(){
    var that = this;
    that.setData({
      topFlag:0
    })
    if(!wx.getStorageSync('uId')){
      app.wxGetOpenID().then(function(){
        if(!wx.getStorageSync('areaFlag')){
          //没有收获信息时，获取当前坐标
          wx.getLocation({
            type:'gcj02 ',
            complete(res){
              var latitude = res.latitude;
              var longitude = res.longitude;
              if(latitude!=undefined){
                //根据坐标获取所在省份
                qqMap.reverseGeocoder({ //  调用解析SDK
                  location: {
                      latitude: latitude,
                      longitude: longitude
                  },
                  success: function (res) {
                    var adcode = res.result.ad_info.adcode;
                    if(adcode.indexOf('11')!=0 && adcode.indexOf('12')!=0 && adcode.indexOf('13')!=0){
                      wx.setStorageSync('areaFlag', '3');
                      that.showData(that);
                    }else{
                      if(adcode.indexOf('11')!=0 ){
                        wx.setStorageSync('areaFlag', '2,3');
                        that.showData(that);
                      }else{
                        var toParam = latitude+','+longitude;
                        var fromParam = '39.889236,116.270721';
                        //在北京，获取距离
                        qqMap.calculateDistance({
                          from: fromParam, //若起点有数据则采用起点坐标，若为空默认当前地址
                          to: toParam, //终点坐标
                          success: function(res) {
                            var distance = res.result.elements[0].distance;
                            if(distance>4000){
                              wx.setStorageSync('areaFlag', '1,2,3');
                              that.showData(that);
                            }else{
                              wx.setStorageSync('areaFlag', '0,1,2,3');
                              that.showData(that);
                            }
                          }
                        })
                      }
                    }
                  }
                }) 
              }else{
                wx.setStorageSync('areaFlag', '0,1,2,3');
                that.showData(that);
              }
            }
          })
        }else{
          that.showData(that);
        }
        
      })
    }else{
      that.showData(that);
    }
  },
  showData:function(that){
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
    paras.uId=wx.getStorageSync('uId');
    paras.isUsed=1;
    paras.userId=wx.getStorageSync('uId');
    that.queryAddressList(that,paras,baseUrl);
    util.getCarNum(that,paras,baseUrl);
  },
  //查询使用收货地址
  queryAddressList:function(that,data,baseUrl){
    wx.request({
      url: baseUrl+"user/queryAddressList",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          if(res.data.data.length>0){
            var aCity = res.data.data[0].aCity;
            var aDetail = res.data.data[0].aDetail;
            that.setData({
              address:aCity+aDetail
            })
          }
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
  },
  toDetail:function(e){
    var mid = e.currentTarget.dataset.mid;
    wx.navigateTo({
      url: 'detail/detail?mid='+mid
    })
  },
  toCategory(e){
    var cid = e.currentTarget.dataset.cid;
    var type = e.currentTarget.dataset.type;
    app.globalData.cid=cid;
    app.globalData.type=type;
    wx.switchTab({
      url: 'category/category'
    })
  },
  toAddress:function(){
    wx.navigateTo({
      url: '/pages/address/address?flag=2'
    })
  },
  onPageScroll:function(e){
    var that = this;
    var busPos = that.data.busPos;
    busPos['y'] = app.globalData.hh+e.scrollTop;
    that.setData({
      busPos:busPos
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
        setTimeout(function () {
          if(res.data.code==200){
            that.touchOnGoods();
          }else{
            wx.showToast({
              title: "服务器异常"
            })
          }
        }, 300)
      }
    })
  },
  touchOnGoods: function(sid) {
    // 如果good_box正在运动
    //当前点击位置的x，y坐标
    var that = this;
    var busPos = that.data.busPos;
    var topPoint = {};
    topPoint['y'] = this.finger['y']-50;
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

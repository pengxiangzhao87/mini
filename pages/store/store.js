// pages/store/store.js
var util= require('../../utils/util.js');
var app = getApp();
Page({

  data: {
    baseUrl:'',
    name:'',
    sId:0,
    tId:-1,
    categoryList:[],
    goods:[],
    page:1,
    totalPage:0,
    isPhone:'',
    ww:0,

    totalPrice:0,
    totalSum:0,
    idxFlag:0,
    disabled:false,
    hideFlag: true,//true-隐藏  false-显示
    addFlag:true,
    bus_x:0,
    bus_y:0,
    busPos:[],
    pointHid:true,
    carSum:0,
  },

  /**
   * 组件的方法列表
   */
  onLoad:function(e) {
    var that = this;
    var busPos = [];
    busPos['x'] = 40;
    busPos['y'] = app.globalData.hh-120;
    var baseUrl = app.globalData.baseUrl;
    that.setData({
      sId:e.sid,
      name:e.name,
      baseUrl:baseUrl,
      ww:app.globalData.ww-200,
      busPos:busPos
    })
  },
  onShow:function(){
    var that = this;
    if(!wx.getStorageSync('uId')){
      app.wxGetOpenID().then(function(){
        that.showData(that);
      })
    }else{
      that.showData(that);
    }
    
  },
  showData:function(that){
    var baseUrl = that.data.baseUrl;
    var paras={};
    paras.sId=that.data.sId;
    wx.request({
      url: baseUrl+"commodity/queryCategoryList",
      method: 'get',
      data: paras,
      success(res) {
        var categoryList = res.data.data;
        paras.page=1;
        paras.rows=10;
        paras.userId=wx.getStorageSync('uId');
        var tId = that.data.tId;
        paras.tId=tId==-1?categoryList[0].tId:tId;
        paras.areaFlag = wx.getStorageSync('areaFlag');
        wx.request({
          url: baseUrl+"commodity/queryCommodityByPage",
          method: 'get',
          data: paras,
          success(res) {
            if(res.data.code==200){
              var list = res.data.data.list;
              if(tId==-1){
                categoryList[0].selected = true;
              }else{
                for(var idx in categoryList){
                  var item = categoryList[idx];
                  if(item.tId==tId){
                    item.selected = true;
                  }else{
                    item.selected = false;
                  }
                }
              }
              that.setData({
                categoryList:categoryList,
                goods:list,
                tId:paras.tId,
                totalPage:res.data.data.totalPage,
                isPhone:wx.getStorageSync('isPhone')
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
        util.getCarNum(that,paras,baseUrl,false)
      }
    })
    
  },
  disableRoll(){},
  checkType(e){
    var that = this;
    that.setData({
      tId:e.currentTarget.dataset.tid
    })
    that.showData(that);
  },
  findByPage(){
    var that = this;
    var totalPage = that.data.totalPage;
    var page = that.data.page;
    if(page==totalPage){
      return;
    }
    var baseUrl = that.data.baseUrl;
    var paras={};
    paras.page=page+1;
    paras.rows=10;
    paras.userId=wx.getStorageSync('uId');
    paras.sId=that.data.sId;
    paras.tId=that.data.tId;
    paras.areaFlag = wx.getStorageSync('areaFlag');
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          var goods = that.data.goods.concat(list);
          that.setData({
            goods:goods,
            page:paras.page
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
  },
  showCar:function(e){
    var that = this;
    var idx = e.currentTarget.dataset.idx;
    var detail = that.data.goods[idx];
    if(detail.state==0){
      wx.showToast({
        icon:'none',
        title: '补货中',
        duration:2000
      })
      return;
    }
    var sum = detail.init_num;
    var unit = detail.init_unit;
    var totalPrice = (detail.price_unit * (unit==0?sum/50:sum)).toFixed(2);
    that.setData({
      idxFlag:idx,
      totalSum:sum,
      totalPrice:totalPrice
    })

    this.finger = {};
    this.finger['x'] = e.detail.x-10;
    this.finger['y'] = e.detail.y-30;
    that.showAddModal();
  },
  showAddModal:function(){
    var that = this;
    that.setData({
      addFlag: false,
    })
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间
      timingFunction: 'ease',//动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    })
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      that.slideIn();//调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100)
  },
  // 隐藏遮罩层
  hideAddModal:function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间 默认400ms
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown();//调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        addFlag: true
      })
      clearTimeout(time1);
      time1 = null;
    }, 220)//先执行下滑动画，再隐藏模块
    
  },
  //动画 -- 滑入
  slideIn: function () {
    this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export()
    })
  },
  //动画 -- 滑出
  slideDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  subtract:function(){
    var that = this;
    var idx = that.data.idxFlag;
    var commodity = that.data.goods;
    var detail = commodity[idx];
    if(detail.init_unit==0 && detail.init_num<=50 || detail.init_unit==1 && detail.init_num==1){
      return;
    }
    var num = 0;
    if(detail.init_unit==0){
      num = detail.init_num-50;
    }else{
      num = detail.init_num-1;
    }
    detail.init_num = num;
    var sum = detail.init_unit==0?num/50:num;
    var totalPrice = (detail.price_unit * sum).toFixed(2);
    var disabled = false;
    if(detail.init_unit==0 && num<=50 || detail.init_unit==1 && num==1){
      disabled = true;
    }
    that.setData({
      totalPrice:totalPrice,
      totalSum:num,
      disabled:disabled
    })
  },
  add:function(){
    var that = this;
    var idx = that.data.idxFlag;
    var commodity = that.data.goods;
    var detail = commodity[idx];
    var num = 0;
    if(detail.init_unit==0){
      num = detail.init_num+50;
    }else{
      num = detail.init_num+1;
    }
    detail.init_num = num;
    var sum = detail.init_unit==0?num/50:num;
    var totalPrice = (detail.price_unit * sum).toFixed(2);
    that.setData({
      totalPrice:totalPrice,
      totalSum:num,
      disabled:false
    })
  },
  addShoppingCar:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var sum = that.data.totalSum;
    var idx = that.data.idxFlag;
    var commodity = that.data.goods;
    var detail = commodity[idx];
    var shoppingInfo = {};
    shoppingInfo.uId=wx.getStorageSync('uId');
    shoppingInfo.sId=detail.s_id;
    shoppingInfo.sNum=sum;
    var json = JSON.stringify(shoppingInfo);
    wx.request({
      url: baseUrl+"shoppingCart/addShoppingCart",
      method: 'post',
      data: json,
      success(res) {
        that.hideAddModal();
        setTimeout(function () {
          if(res.data.code==200){
            that.touchOnGoods();
          }else{
            wx.showToast({
              title: "服务器异常"
            })
          }
        }, 300)
      },
      fail(res) {
        that.hideAddModal();
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  touchOnGoods: function() {
    // 如果good_box正在运动
    //当前点击位置的x，y坐标
    var that = this;
    var busPos = that.data.busPos;
    var topPoint = {};
    topPoint['x'] = Math.abs(that.finger['x'] - busPos['x'])/2 + busPos['x'];
    if(that.finger['y']>busPos['y']){
      topPoint['y'] = busPos['y']-100;
    }else{
      topPoint['y'] = that.finger['y']-50;
    }
    that.linePos = app.bezier([that.finger, topPoint, busPos], 150);
    that.startAnimation();
  },
  //开始动画
  startAnimation:function() {
      var that = this;
      var bezier_points = that.linePos['bezier_points'];
      this.setData({
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
  errorPic:function(e){
    var data = this.data.goods;
    if(data.length==0){
      return;
    }
    var idx= e.target.dataset.idx; //获取循环的下标
    var item="goods["+idx+"].coverUrl" //commodity为数据源，对象数组
    var commodity = {};
    commodity[item]='/image/moren.png';
    this.setData(commodity);
  },
  toShoppingCar(){
    wx.switchTab({
      url: '/pages/shoppingCar/shoppingCar'
    })
  }
})

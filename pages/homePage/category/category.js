// pages/homePage/category/category.js
var util= require('../../../utils/util.js');
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
    hh:0,
    addFoodFlag:true,
    idxFlag:0,
    addMenuFlag:true,
    idxMenuFlag:0,
    bus_x:0,
    bus_y:0,
    busPos:[],
    pointHid:true,
  },

  onLoad() {
    var baseUrl = app.globalData.baseUrl;
    var ww = app.globalData.ww;
    var hh = app.globalData.hh;
    var cid = app.globalData.cid;
    var type = app.globalData.type;
    var that = this;
    var busPos = [];
    busPos['x'] = ww*5/8;
    busPos['y'] = hh;
    that.setData({
      baseUrl:baseUrl,
      type:type,
      category1:cid,
      ww:ww-55,
      hh:hh-90,
      busPos:busPos
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
    paras.uId = wx.getStorageSync('uId');
    paras.category1Id = category1;
    paras.category2Id = category2;
    if(type == 0){
      that.queryMenu(that,baseUrl,paras);
    }else{
      that.queryFood(that,baseUrl,paras);
    }
    var paras = {};
    paras.uId=wx.getStorageSync('uId');
    util.getCarNum(that,paras,baseUrl,true);
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
  onPageScroll: function (e) {
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


  showMenuCar:function(e){
    var that = this;
    var idx = e.currentTarget.dataset.idx;
    that.setData({
      idxMenuFlag:idx
    })

    this.finger = {};
    this.finger['x'] = e.detail.x-10;
    this.finger['y'] = e.detail.y-30;
    that.showModal();
  },
  // 显示遮罩层
  showModal:function () {
    var that = this;
    that.setData({
      addMenuFlag: false,
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
  hideModal:function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间 默认400ms
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown();//调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        addMenuFlag: true
      })
      clearTimeout(time1);
      time1 = null;
    }, 220)//先执行下滑动画，再隐藏模块
    
  },

  showCar:function(e){
    var that = this;
    var idx = e.currentTarget.dataset.idx;
    that.setData({
      idxFlag:idx
    })

    this.finger = {};
    this.finger['x'] = e.detail.x-10;
    this.finger['y'] = e.detail.y-30;
    that.showAddModal();
  },


  showAddModal:function(){
    var that = this;
    that.setData({
      addFoodFlag: false,
    })
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间
      timingFunction: 'ease',//动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    })
    this.animation = animation; //将animation变量赋值给当前动画
    var time = setTimeout(function () {
      that.slideIn();//调用动画--滑入
      clearTimeout(time);
      time = null;
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
    var time = setTimeout(function () {
      that.setData({
        addFoodFlag: true
      })
      clearTimeout(time);
      time = null;
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
  sub(){
    var that = this;
    var idx = that.data.idxFlag;
    var foodList = that.data.foodList;
    var food = foodList[idx];
  
    var type = food.f_type;
    var num = food.f_init_number;
    var newNum = type==0?num-1:num-50;
    if(newNum<=0){
      return;
    }
    food.f_init_number=newNum;
    var totalPrice = food.totalPrice*1;
    var price = food.f_price*1;
    food.totalPrice = (totalPrice-price).toFixed(2);
    that.setData({
      foodList:foodList
    })
    
  },
  add(){
    var that = this;
    var idx = that.data.idxFlag;
    var foodList = that.data.foodList;
    var food = foodList[idx];
  
    var type = food.f_type;
    var num = food.f_init_number;
    var newNum = type==0?num+1:num+50;
    food.f_init_number=newNum;
    var totalPrice = food.totalPrice*1;
    var price = food.f_price*1;
    food.totalPrice = (totalPrice+price).toFixed(2);
    that.setData({
      foodList:foodList
    })
    
  },
  addFoodToCart(e){
    var that = this;
    var idx = that.data.idxFlag;
    var food = that.data.foodList[idx];
    var data = {};
    data.foodId = food.f_id;
    data.cNumber = food.f_init_number;
    data.userId = wx.getStorageSync('uId');

    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/addFoodToCart",
      method: 'post',
      data: data,
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

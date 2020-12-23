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
    floorstatus:true,
    carSum:0,
    addFoodFlag:true,
    idxFlag:0,
    bus_x:0,
    bus_y:0,
    busPos:[],
    pointHid:true,
  },
  onLoad:function(e){
    var that = this;
    var busPos = [];
    busPos['x'] = 22;
    busPos['y'] = 13;
    that.setData({
      type:e.type,
      ww:app.globalData.ww,
      sName:e.sName,
      baseUrl:app.globalData.baseUrl,
      busPos:busPos
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
    paras.uId=wx.getStorageSync('uId');
    util.getCarNum(that,paras,baseUrl,false);

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
    var type = this.data.type;
    this.animation_main = wx.createAnimation({
      duration:500,
      timingFunction:'linear'
    })
    this.animation_back = wx.createAnimation({
      duration:500,
      timingFunction:'linear'
    })
    // 点击正面

    if (type==0) {
      this.animation_main.rotateX(180).step()
      this.animation_back.rotateX(0).step()
      this.setData({
        animationMain: this.animation_main.export(),
        animationBack: this.animation_back.export(),
        type:1,
        sName:'',
      })
    }
    // 点击背面
    else{
      this.animation_main.rotateX(0).step()
      this.animation_back.rotateX(-180).step()
      this.setData({
        animationMain: this.animation_main.export(),
        animationBack: this.animation_back.export(),
        type:0,
        sName:'',
      })
    }
    console.info(this.animation_main)
    this.onShow();
  },
  toSearch(e){
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
      url: '../cart/cart'
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
    topPoint['y'] = this.finger['y']+50;
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

// pages/homePage/detail/detail.js
var util= require('../../../utils/util.js')
var app = getApp();
Page({

  data: {
    baseUrl:'',
    mid:'',
    imgList:[],
    detail:[],
    freeList:[],
    optionList:[],
    otherOptionList:[],
    foodList:[],
    group:-1,
    foodId:'',
    allPrice:0,
    standard:0,//0:常规，1:一人食
    remark:'',
    animation:'',
    carSum:0,
    addFoodFlag:true,
    idxFlag:0,
    bus_x:0,
    bus_y:0,
    busPos:[],
    pointHid:true,
  },

  /**
   * 组件的方法列表
   */
  onLoad:function(e) {
    var baseUrl = app.globalData.baseUrl;
    var that = this;
    var busPos = [];
    busPos['x'] = 25;
    busPos['y'] = app.globalData.hh-30;
    that.setData({
      baseUrl:baseUrl,
      mid:e.mid,
      busPos:busPos
    })
    wx.request({
      url: baseUrl+"menu/queryMenuDetail",
      method: 'get',
      data:{'menuId':e.mid},
      success(res) {
        var allPrice = that.data.allPrice*1;
        var data = res.data.data;
        allPrice += data.mCookPrice*1;
        var imgList = data.mImgAdr.split('~');
        that.setData({
          detail:data,
          imgList:imgList
        })
        wx.request({
          url: baseUrl+"menu/queryMenuOption",
          method: 'get',
          data:{'menuId':e.mid},
          success(res) {
            var optionList = res.data.data;
            for(var idx in optionList){
              var totalPrice = optionList[idx].sumPrice*1;
              allPrice += totalPrice;
            }
            that.setData({
              optionList:optionList,
              allPrice:allPrice.toFixed(2)
            })
          }
        })
      }
      
    })
    wx.request({
      url: baseUrl+"menu/queryMenuFreeFood",
      method: 'get',
      data:{'menuId':e.mid},
      success(res) {
        that.setData({
          freeList:res.data.data
        })
      }
    })
    
  },
  onShow(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var paras = {};
    paras.uId=wx.getStorageSync('uId');
    util.getCarNum(that,paras,baseUrl,false);

  },
  otherOption(e){
    var menuId = e.currentTarget.dataset.menuid;
    var group = e.currentTarget.dataset.group;
    var foodid = e.currentTarget.dataset.foodid;
    var that =this;
    var baseUrl = that.data.baseUrl;
    var groupData = that.data.group;
    if(group!=groupData){
      wx.request({
        url: baseUrl+"menu/queryOtherOption",
        method: 'get',
        data:{'menuId':menuId,'group':group},
        success(res) {
          that.setData({
            otherOptionList:res.data.data,
            group:group,
            foodId:foodid
          })
          
        }
      })
    }else{
      that.setData({
        group:-1
      })
    }
    
  },
  chooseFood(e){
    var foodid = e.currentTarget.dataset.foodid;
    var menuid = e.currentTarget.dataset.menuid;
    var that = this;
    var allPrice = that.data.allPrice*1;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/queryMenuOption",
      method: 'get',
      data:{'menuId':menuid,'foodId':foodid},
      success(res) {
        var foodInfo = res.data.data[0];
        var optionList = that.data.optionList;
        for(var idx in optionList){
          var item = optionList[idx];
          if(foodInfo.m_group == item.m_group){
            var sumPrice = item.sumPrice*1;
            var newPrice = foodInfo.sumPrice*1;
            allPrice = allPrice-sumPrice + newPrice;
            optionList[idx] = foodInfo;
            break;
          }
        }
        that.setData({
          optionList:optionList,
          foodId:foodid,
          allPrice:allPrice.toFixed(2)
        })
      }
    })
  },
  toFoodDetail(e){
    var foodid = e.currentTarget.dataset.foodid;
    wx.navigateTo({
      url: '../foodDetail/foodDetail?foodid='+foodid
    })
  },
  sub(e){
    var idx = e.currentTarget.dataset.idx;
    var that = this;
    var optionList = that.data.optionList;
    var option = optionList[idx];
    var number = option.m_number;
    var type = option.f_type;
    var newNum = type==0?number-1:number-50;
    if(newNum<=0){
      return;
    }
    var price = option.f_price*1;
    var sumPrice = option.sumPrice*1
    option.sumPrice = (sumPrice-price).toFixed(2);
    option.m_number=newNum;
    optionList[idx] = option;
    var allPrice = that.data.allPrice*1;
    var newAllPrice = allPrice - price;
    that.setData({
      optionList:optionList,
      allPrice:newAllPrice.toFixed(2)
    })
  },
  add(e){
    var idx = e.currentTarget.dataset.idx;
    var that = this;
    var optionList = that.data.optionList;
    var option = optionList[idx];
    var number = option.m_number;
    var type = option.f_type;
    var price = option.f_price*1;
    var sumPrice = option.sumPrice*1;
    option.sumPrice = (sumPrice+price).toFixed(2);
    option.m_number=type==0?number+1:number+50;
    optionList[idx] = option;
    var allPrice = that.data.allPrice*1;
    var newAllPrice = allPrice + price;
    that.setData({
      optionList:optionList,
      allPrice:newAllPrice.toFixed(2)
    })
  },
  chooseStandard(e){
    var standard = e.currentTarget.dataset.standard;
    this.setData({
      standard:standard
    })
  },
  showTip(){
    wx.showModal({
      content: '选择一人食，配菜员会尽可能选择小规格的食材。产生的差价，会及时退款。',
      showCancel:false
    })
  },
  toCart(){
    wx.switchTab({
      url: '../cart/cart'
    })
  },
  saveRemark(e){
    this.setData({
      remark:e.detail.value
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
  addMenuToCart(e){
    var that = this;
    this.finger = {};
    this.finger['x'] = e.detail.x-10;
    this.finger['y'] = e.detail.y-30;
    var detail = that.data.detail;
    var optionList = that.data.optionList;
    var remark = that.data.remark;
    var data = {};
    data.mId = detail.mId;
    data.remark = remark;
    data.uId = wx.getStorageSync('uId');
    var foodList = [];
    for(var idx in optionList){
      var item = optionList[idx];
      var food = {};
      food.foodId = item.f_id;
      food.cNumber = item.m_number;
      food.cGroup = item.m_group;
      foodList[foodList.length]=food;
    }
    data.list = foodList;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/addMenuToCart",
      method: 'post',
      data: data,
      success(res) {
        if(res.data.code==200){
          that.touchOnGoods();
        }
      }
    })
  },
  showCar:function(e){
    var that = this;
    var idx = e.currentTarget.dataset.idx;
    var foodList = e.currentTarget.dataset.item;
    that.setData({
      idxFlag:idx,
      foodList:foodList
    })
    this.finger = {};
    this.finger['x'] = e.detail.x-10;
    this.finger['y'] = e.detail.y-30;
    that.showAddModal();
  },

  subFood(){
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
  addFood(){
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
              icon:'none',
              title: "服务器异常"
            })
          }
        }, 300)
        
      }
    })
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

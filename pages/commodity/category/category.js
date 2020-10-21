// pages/commodity/category/category.js
var util= require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    tid:-1,
    commodity:[],
    category:[],
    page:1,
    rows:20,
    baseUrl:"",
    totalPage:0,
    hidden:true,
    floorstatus:true,
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
    isPhone:1
  },

  onLoad:function(e) {
    var tid = e.tid;
    //首先计算购物车的位置
    var busPos = [];
    busPos['x'] = 40;
    busPos['y'] = app.globalData.hh-120;
    var baseUrl = app.globalData.baseUrl;
    var that = this;
    that.setData({
      busPos:busPos,
      baseUrl:baseUrl,
      tid:tid
    })
    var paras={};
    paras.userId=4
    that.getCategory(that,baseUrl,tid);
    //获取类别下的商品
    
  },
  getCategory(that,baseUrl,tid){
    wx.request({
      url: baseUrl+"commodity/queryCategoryList",
      method: 'get',
      success(res) {
        if(res.data.code==200){
          var list = res.data.data;
          for(var idx in list){
            var item = list[idx];
            if(item.tId==tid){
              item.selected = true;
            }else{
              item.selected = false;
            }
          }
          that.setData({
            baseUrl:baseUrl,
            category:list,
            tid:tid
          })
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },
      fail(res) {
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
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
  showData(that){
    var data = that.data;
    var baseUrl = data.baseUrl;
    var paras = {};
    paras.page=1;
    var page = that.data.page;
    paras.rows=data.rows*page;
    paras.userId=wx.getStorageSync('uId');
    that.getCarNum(that,paras,baseUrl);
    paras.tId=that.data.tid;
    paras.areaFlag=wx.getStorageSync('areaFlag');
    that.queryCommodity(that,paras,baseUrl);
  },
  
  getCarNum:function(that,paras,baseUrl){
    wx.request({
      url: baseUrl+"shoppingCart/queryShoppingCartList",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data;
          var checkNum = parseInt(0);
          for(var idx in list){
            var detail = list[idx];
            for(var index in detail.goods){
              var item = detail.goods[index];
              if(item.is_check==1){
                ++checkNum;
              }
            }
          }
          if(checkNum!=0){
            that.setData({
              carSum:checkNum
            })
          }
        }
      }
    })
  },
  queryCommodity(that,data,baseUrl){
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          var totalPage = res.data.data.totalPage;
          var total = that.data.totalPrice; 
          var pageAll = total==0?totalPage:total; 
          that.setData({
            commodity:list,
            totalPage:pageAll,
            isPhone:wx.getStorageSync('isPhone')
          })
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },
      fail(res) {
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  //上拉获取新数据
  onReachBottom:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var totalPage = that.data.totalPage;
    var rows = that.data.rows;
    var page = that.data.page+1;
    var tid = that.data.tid;
    if(totalPage>=page){
      var paras={};
      paras.page=page;
      paras.rows=rows;
      paras.userId=wx.getStorageSync('uId');
      paras.tId=tid;
      paras.areaFlag=wx.getStorageSync('areaFlag');
      wx.request({
        url: baseUrl+"commodity/queryCommodityByPage",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            var list = res.data.data.list;
            var result = that.data.commodity.concat(list);
            that.setData({
              commodity:result,
              page:page
            })
          }else{
            wx.showToast({
              title: res.data.msg
            })
          }
        },
        fail(res) {
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      })
    }else{
      that.setData({
        hidden:false
      })
    }
  },
  //切换类别
  changeCategory:function(e){
    var tid = e.currentTarget.dataset.tid;
    var that = this;
    var data = that.data;
    var category = data.category;
    var baseUrl = data.baseUrl;
    for(var idx in category){
      var item = category[idx];
      if(item.tId==tid){
        item.selected = true;
      }else{
        item.selected = false;
      }
    }
    var paras={};
    paras.tId=tid;
    paras.userId=wx.getStorageSync('uId');
    paras.page=1;
    paras.rows=data.rows;
    paras.areaFlag=wx.getStorageSync('areaFlag');
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          var totalPage = res.data.data.totalPage;
          that.setData({
            commodity:list,
            totalPage:totalPage,
            category:category,
            tid:tid,
            page:1
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      },
      fail(res) {
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  //跳转详情
  toDetail:function(e){
    var sid = e.currentTarget.dataset.sid;
    wx.navigateTo({
      url: '/pages/commodity/detail/detail?sid='+sid
    })
  },
  //手机号授权
  getPhoneNumber:function(e){
    if(e.detail.iv==undefined){
      return;
    }
    var that = this;
    var baseUrl = that.data.baseUrl;
    var data={};
    data.encryptedData = e.detail.encryptedData;
    data.iv = e.detail.iv;
    data.token=wx.getStorageSync('token');
    util.getPhone(baseUrl,data,that,app);
  },
  showCar:function(e){
    var that = this;
    var idx = e.currentTarget.dataset.idx;
    var detail = that.data.commodity[idx];
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

  //回到顶部
  goTop:function(){
    wx.pageScrollTo({
      scrollTop:0
    })
  },
  // 获取滚动条当前位置
  onPageScroll: function (e) {
    var that = this;
    var busPos = that.data.busPos;
    busPos['y'] = app.globalData.hh+e.scrollTop-120;
    if (e.scrollTop > 800) {
      that.setData({
        floorstatus: false,
        busPos:busPos
      });
    } else {
      that.setData({
        floorstatus: true,
        busPos:busPos
      });
    }
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
  // 显示遮罩层
  showModal:function () {
    var that = this;
    that.setData({
      hideFlag: false,
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
        hideFlag: true
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
    var commodity = that.data.commodity;
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
    var commodity = that.data.commodity;
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
    var commodity = that.data.commodity;
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
  toShoppingCar:function(e){
    wx.switchTab({
      url: '/pages/shoppingCar/shoppingCar'
    })
  },
  errorPic:function(e){
    var data = this.data.commodity;
    if(data.length==0){
      return;
    }
    var idx= e.target.dataset.idx; //获取循环的下标
    var item="commodity["+idx+"].coverUrl" //commodity为数据源，对象数组
    var commodity = {};
    commodity[item]='/image/moren.png';
    this.setData(commodity);
  }
})

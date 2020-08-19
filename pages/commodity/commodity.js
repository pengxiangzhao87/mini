// pages/commodity.js
var app = getApp();
Page({
  data: {
    address:"", 
    commodity:[],
    page:1,
    rows:20,
    totalPage:0,
    baseUrl:"",
    hidden:true,
    hideFlag: true,//true-隐藏  false-显示
    addFlag:true,
    animationData: {},
    idxFlag:0,
    disabled:false,
    totalPrice:0,
    totalSum:0,
    topFlag:0,
    bus_x:0,
    bus_y:0,
    busPos:[],
    pointHid:true,
    bannerH:110,
    topH:150
  },
  onLoad:function(){
    var that = this;
    //首先计算购物车的位置
    var busPos = [];
    busPos['x'] = app.globalData.ww*0.5;
    busPos['y'] = app.globalData.hh;
    var baseUrl = app.globalData.baseUrl;
    var bannerH = app.globalData.ww*0.94*495/1530;
    that.setData({
      busPos:busPos,
      baseUrl:baseUrl,
      bannerH:bannerH,
      topH:bannerH+40
    })
  },
  onShow:function(){
    var that = this;
    that.setData({
      topFlag:0
    })
    var data = that.data;
    var baseUrl = data.baseUrl;
    var paras = {};
    paras.userId=4;
    that.getCarNum(paras,baseUrl);
    paras.uId=4;
    paras.isUsed=1;
    that.queryAddressList(that,paras,baseUrl);
    var page = that.data.page;
    paras.page=1;
    paras.rows=data.rows*page;
    paras.tId=-1;
    that.queryCommodity(that,paras,baseUrl);
  },
  getCarNum:function(paras,baseUrl){
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
            wx.setTabBarBadge({//tabbar右上角添加文本
              index: 1,//tabbar下标
              text: checkNum+'' //显示的内容,必须为字符串
            })
          }else{
            wx.removeTabBarBadge({
              index: 1,
            })
          }
        }
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
    if(totalPage>=page){
      var paras={};
      paras.page=page;
      paras.rows=rows;
      paras.userId=4;
      paras.tId=-1;
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
    }else{
      that.setData({
        hidden:false
      })
    }
    
  },
  //热销商品分页查询
  queryCommodity:function(that,data,baseUrl,busPos){
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
          console.info(list)
          that.setData({
            commodity:list,
            totalPage:pageAll
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
  //跳转模糊查询
  searchByName:function(e){
    var sName = e.detail.value;
    wx.navigateTo({
      url: 'search/search?sName='+sName
    })
  },
  //跳转分类
  toCategory:function(e){
    var tid = e.currentTarget.dataset.tid;
    wx.navigateTo({
      url: 'category/category?tid='+tid
    })
  },
  //跳转详情
  toDetail:function(e){
    var sid = e.currentTarget.dataset.sid;
    wx.navigateTo({
      url: 'detail/detail?sid='+sid
    })
  },
  //加入购物车
  addCar:function(e){
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
    //点击位置有偏移
    this.finger['x'] = e.detail.x-10;
    this.finger['y'] = e.detail.y-30;
    wx.hideTabBar({
      animation: true,
    })
    that.showAddModal();
  },

  //双击回到顶部
  onTabItemTap:function(e){
    var that = this;
    var topFlag = that.data.topFlag;
    if(topFlag>0){
      wx.pageScrollTo({
        scrollTop:0
      })
      that.setData({
        topFlag:0
      })
    }else{
      that.setData({
        topFlag:1
      })
    }

  },
  onPageScroll:function(e){
    var that = this;
    var busPos = that.data.busPos;
    busPos['y'] = app.globalData.hh+e.scrollTop;
    that.setData({
      busPos:busPos
    })
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
    wx.showTabBar({
      animation: true,
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
  toLogin:function(){
    wx.navigateTo({
      url: '/pages/login/login'
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
  addShoppingCar:function(e){
    var that = this;
   
    // that.imgPosit(that,e);
    var baseUrl = that.data.baseUrl;
    var sum = that.data.totalSum;
    var idx = that.data.idxFlag;
    var commodity = that.data.commodity;
    var detail = commodity[idx];
    var shoppingInfo = {};
    shoppingInfo.uId=4;
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
            that.touchOnGoods(detail.s_id);
            setTimeout(function () {
              that.onShow();
            }, 600)
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
          }
        }
      }
  },
  disableRoll:function(){},
  toSeason:function(){
    wx.navigateTo({
      url: '/pages/active/season/season',
    })
  },
  toNews:function(){
    wx.navigateTo({
      url: '/pages/active/news/news',
    })
  },
  toSale:function(){
    wx.navigateTo({
      url: '/pages/active/sales/sales',
    })
  },
  errorPic:function(e){
    var idx= e.target.dataset.idx; //获取循环的下标
    var item="commodity["+idx+"].coverUrl" //commodity为数据源，对象数组
    var commodity = {};
    commodity[item]='/image/moren.png';
    this.setData(commodity);
  }

})

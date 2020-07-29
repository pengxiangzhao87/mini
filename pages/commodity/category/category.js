// pages/commodity/category/category.js
var app = getApp();
Page({
  data: {
    tid:null,
    commodity:[],
    category:[],
    page:1,
    rows:10,
    baseUrl:"",
    totalPage:0,
    hidden:true,
    floorstatus:true,
    totalPrice:0,
    totalSum:0,
    idxFlag:0,
    disabled:false,
    hideFlag: true,//true-隐藏  false-显示
    addFlag:true
  },

  onLoad:function(e) {
    var tid = e.tid;
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    //获取所有类别
    that.getCategory(that,baseUrl,tid);
    //获取类别下的商品
    var data = that.data;
    var paras={};
    paras.tId=tid;
    paras.userId=4
    paras.page=data.page;
    paras.rows=data.rows;
    that.getCommodity(that,baseUrl,paras);
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
  getCommodity(that,baseUrl,data){
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          var totalPage = res.data.data.totalPage;
          that.setData({
            commodity:list,
            totalPage:totalPage
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
      paras.userId=4;
      paras.tId=tid;
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
    that.setData({
      category:category,
      tid:tid,
      page:1
    })
    var paras={};
    paras.tId=tid;
    paras.userId=4
    paras.page=1;
    paras.rows=data.rows;
    this.getCommodity(that,baseUrl,paras);
  },
  //跳转详情
  toDetail:function(e){
    var sid = e.currentTarget.dataset.sid;
    wx.navigateTo({
      url: '/pages/commodity/detail/detail?sid='+sid
    })
  },
  //加入购物车
  addCar:function(e){
    var that = this;
    var idx = e.currentTarget.dataset.idx;
    var detail = that.data.commodity[idx];
    var sum = detail.init_num;
    var unit = detail.init_unit;
    var totalPrice = (detail.price_unit * (unit==0?sum/50:sum)).toFixed(2);
    that.setData({
      idxFlag:idx,
      totalSum:sum,
      totalPrice:totalPrice
    })
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
    if (e.scrollTop > 800) {
      this.setData({
        floorstatus: false
      });
    } else {
      this.setData({
        floorstatus: true
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
    shoppingInfo.uId=4;
    shoppingInfo.sId=detail.s_id;
    shoppingInfo.sNum=sum;
    var json = JSON.stringify(shoppingInfo);
    wx.request({
      url: baseUrl+"shoppingCart/addShoppingCart",
      method: 'post',
      data: json,
      success(res) {
        if(res.data.code==200){
          wx.showToast({
            title: '添加成功'
          })
          that.hideAddModal();
          that.onShow();
        }else{
          wx.showToast({
            title: "服务器异常"
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

})

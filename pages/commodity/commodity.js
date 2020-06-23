// pages/commodity.js
var app = getApp();
Page({
  data: {
    address:"", 
    commodity:[],
    page:1,
    rows:10,
    totalPage:0,
    baseUrl:"",
    hidden:true,
    hideFlag: true,//true-隐藏  false-显示
    animationData: {}
  },
  onLoad:function(){
    var that = this;
    var data = that.data;
    var baseUrl = app.globalData.baseUrl;
    var paras = {};
    paras.page=data.page;
    paras.rows=data.rows;
    paras.userId=4;
    paras.tId=-1;
    this.queryCommodity(that,paras,baseUrl);
    paras.uId=4;
    paras.isUsed=1;
    this.queryAddressList(that,paras,baseUrl);
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
              title: res.data.msg
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
  queryCommodity:function(that,data,baseUrl){
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          var totalPage = res.data.data.totalPage;
          that.setData({
            baseUrl:baseUrl,
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
            that.setData({
              address:aCity
            })
          }
        }else{
          wx.showToast({
            title: res.data.msg
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
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          var sid = e.currentTarget.dataset.sid;
          var data={};
          data.sid=sid;
          data.uid=4;
          var json = JSON.stringify(data);
          wx.request({
            url: app.globalData.baseUrl+"shoppingCart/addShoppingCart",
            method: 'post',
            data: json,
            success(res) {
              if(res.data.code!=200){
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
          this.showModal();
        }
      }
    })
    
  },
  //回到顶部
  onTabItemTap:function(){
    wx.pageScrollTo({
      scrollTop:0
    })
  },
  //禁止下拉
  onPageScroll:function(e){
    if(e.scrollTop<0){
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  },
  // 显示遮罩层
  showModal: function () {
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
  }
})

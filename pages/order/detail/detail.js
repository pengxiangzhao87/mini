// pages/my/order/detail/detail.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    detailList:[],
    info:{},
    oid:0,
    hideFlag: true,//true-隐藏  false-显示
    animationData: {},
    method:1
  },
  onLoad:function(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.oId=e==undefined?that.data.oid:e.oid;
    wx.request({
      url: baseUrl+"order/queryOrderDetail",
      method: 'get',
      data: paras,
      success(res) {
        console.info(res)
        if(res.data.code==200){
          var detailList = res.data.data.detailList;
          that.setData({
            detailList:detailList,
            info:res.data.data.info,
            baseUrl:baseUrl,
            oid:e==undefined?that.data.oid:e.oid
          })
        }
      }
    })
  },
  //退款
  refund:function(e){
    var id = e.currentTarget.dataset.id;
    var status = e.currentTarget.dataset.status;
    var that = this;
    if(status==1){
      wx.showModal({
        title: '提示',
        content: '确定申请退款吗？',
        success: function (sm) {
          if (sm.confirm) {
            var baseUrl = app.globalData.baseUrl;
            var paras={};
            paras.ids=id;
            wx.request({
              url: baseUrl+"order/applyForRefundDetail",
              method: 'get',
              data: paras,
              success(res) {
                console.info(res)
                if(res.data.code==200){
                  that.onLoad();
                }
              }
            })
          }
        }
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
  chechMethod:function(e){
    var method = e.currentTarget.dataset.method;
    this.setData({
      method:method
    })
  }
})

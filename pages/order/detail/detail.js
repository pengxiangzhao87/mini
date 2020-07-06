// pages/my/order/detail/detail.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    detailList:[],
    info:{},
    deal:[],
    goodsPrice:0,
    oid:0,
    countDown:'',
    hideFlag: true,//true-隐藏  false-显示
    animationData: {},
    status:1,
    method:1
  },
  onLoad:function(e){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.oId=e==undefined?that.data.oid:e.oid;
    wx.request({
      url: baseUrl+"order/queryOrderDetail",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var detailList = res.data.data.detailList;
          var info = res.data.data.info;
          that.setData({
            detailList:detailList,
            info:info,
            deal:res.data.data.deal,
            status:info.order_status,
            goodsPrice:(info.post_cost==0?info.total_price:info.total_price-4).toFixed(2),
            oid:e==undefined?that.data.oid:e.oid,
            baseUrl:app.globalData.baseUrl
          })
          if(info.order_status==5){
            that.countDown();
          }
        }
      }
    })
  },
  //倒计时
  countDown:function(){
    var that = this;
    var info = that.data.info;
    var start = new Date(info.order_time).getTime()
    var now = new Date().getTime();//现在时间（时间戳）
    var value = (now-start)/1000;
    if(value>=300){
      var baseUrl = that.data.baseUrl;
      var paras={};
      paras.oId=that.data.oid;
      wx.request({
        url: baseUrl+"order/closeOrder",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            that.onLoad();
          }
        }
      })
    }else{
      var min = parseInt((300-value) % (60 * 60 * 24) % 3600 / 60);
      var sec = parseInt((300-value) % (60 * 60 * 24) % 3600 % 60);
      that.setData({
        countDown: min+':'+sec
      })
      setTimeout(that.countDown(), 1000);
    }
 
 
  },
  //退款
  refund:function(e){
    var id = e.currentTarget.dataset.id;
    var that = this;
    var status = that.data.info.order_status;
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
  },
  copy:function(e){
    var oid = e.currentTarget.dataset.oid+'';
    wx.setClipboardData({
      data: oid,
      success (res) {}
    })
  },
  //支付订单
  payment:function(){
    var that = this;
    var method = that.data.method;
    var info = that.data.info;
    if(method==3 && (info.post_cost==0?info.total_price:info.total_price+4)>info.accountPrice){
      return;
    }else{
      var baseUrl = that.data.baseUrl;
      var orderBasic = {};
      orderBasic.oId=info.o_id
      orderBasic.paymentChannel=method;
      orderBasic.uId=4;
      orderBasic.totalPrice=info.post_cost==0?info.total_price:info.total_price+4
      wx.request({
        url: baseUrl+"order/payment",
        method: 'post',
        data: orderBasic,
        success(res) {
          if(res.data.code==200){
            that.hideModal();
            wx.showToast({
              title: '支付成功',
              success:function(){ }
            })
            that.onLoad();
          }else{
            wx.showToast({
              title: res.data.msg
            })
          }
        },fail(res){
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      })
    }
  },
  //二次支付
  extraPayment:function(){
    var that = this;
    var method = that.data.method;
    var info = that.data.info;
    if(method==3 && info.extraPrice>info.accountPrice){
      return;
    }else{
      var baseUrl = that.data.baseUrl;
      var orderBasic = {};
      orderBasic.oId = info.o_id
      orderBasic.uid = 4;
      orderBasic.extra_payment = info.extraPrice;
      orderBasic.extra_status=1;
      orderBasic.extra_channel=method;
      wx.request({
        url: baseUrl+"order/extraOrder",
        method: 'post',
        data: orderBasic,
        success(res) {
          if(res.data.code==200){
            that.hideModal();
            wx.showToast({
              title: '支付成功',
              success:function(){ }
            })
            that.onLoad();
          }else{
            wx.showToast({
              title: res.data.msg
            })
          }
        },fail(res){
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      })
    }
  }
})

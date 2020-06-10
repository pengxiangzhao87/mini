// pages/shoppingCar/payment/payment.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    dateRange:'',
    detailList:[],
    address:{},
    totalPrice:0,
    postage:0,
    allPrice:0,
    //是否下一页返回，1：是
    nextFlag:0,

    hideFlag: true,//true-隐藏  false-显示
    animationData: {}
  },
  onLoad:function(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var postage = e.postage;
    var totalPrice = e.totalPrice;
    var detailList = JSON.parse(e.json);
    var startDate = this.getDateRange(new Date());
    var endDate = new Date(startDate.getTime()+1000*60*30);
    var dateRange = startDate.getHours()+':'+(startDate.getMinutes()==0?'00':startDate.getMinutes())+'-'+endDate.getHours()+':'+(endDate.getMinutes()==0?'00':endDate.getMinutes());
    var paras={};
    paras.uId=1;
    paras.isUsed=1;
    wx.request({
      url: baseUrl+"user/queryAddressList",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.setData({
            dateRange:dateRange,
            detailList:detailList,
            baseUrl:baseUrl,
            postage:postage,
            totalPrice:totalPrice,
            allPrice:postage==1?parseFloat(totalPrice)+parseInt(4):totalPrice,
            address:res.data.data[0]
          })
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },fail(res){
        wx.showToast({
          title: res.data.msg
        })
      }
    })
  },
  onShow:function(){
    var that = this;
    //下一级返回时执行
    if(that.data.nextFlag==1){
      var baseUrl = that.data.baseUrl;
      var paras={};
      paras.uId=1;
      paras.isUsed=1;
      wx.request({
        url: baseUrl+"user/queryAddressList",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            that.setData({
              address:res.data.data[0]
            })
          }else{
            wx.showToast({
              title: res.data.msg
            })
          }
        },fail(res){
          wx.showToast({
            title: res.data.msg
          })
        }
      })
    }
  },
  getDateRange:function(now){
    var time = now.getTime() + 1000*60*15;
    var afterDate = new Date(time);
    var afterHour = afterDate.getHours();
    var afterMinute = afterDate.getMinutes();
    var endMinute = '00';
    if(afterMinute>=5 && afterMinute<20){
      endMinute = '15';
    }else if(afterMinute>=20 && afterMinute<35){
      endMinute = '30';
    }else if(afterMinute>=35 && afterMinute<50){
      endMinute = '45';
    }else if(afterMinute>=50 || afterMinute<5){
      ++afterHour ;
      endMinute = '00';
    }
    return new Date(afterDate.getFullYear()+'-'+afterDate.getMonth()+'-'+afterDate.getDay()+' '+afterHour+':'+endMinute);

  },
  toAddress:function(){
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },



  // 显示遮罩层
  showModal: function () {
    var that = this;
    var rangeList=[];
    var startDate = this.getDateRange(new Date());
    var endDate = new Date(startDate.getTime()+1000*60*30);
    var dateRange = startDate.getHours()+':'+(startDate.getMinutes()==0?'00':startDate.getMinutes())+'-'+endDate.getHours()+':'+(endDate.getMinutes()==0?'00':endDate.getMinutes());





    that.setData({
      hideFlag: false
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
  hideModal: function () {
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
  }
})

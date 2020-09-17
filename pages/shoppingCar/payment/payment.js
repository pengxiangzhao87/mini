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
    rangeList:[],
    range:[],
    today:0,
    hideFlag: true,//true-隐藏  false-显示
    animationData: {},
    hidePay:true,
    method:1,
    oId:0
  },
  onLoad:function(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var postage = e.postage;
    var totalPrice = e.totalPrice;
    var detailList = JSON.parse(e.json);
    var paras={};
    paras.userId=wx.getStorageSync('uId');
    paras.isUsed=1;
    wx.request({
      url: baseUrl+"user/queryAddressList",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.setData({
            detailList:detailList,
            baseUrl:baseUrl,
            postage:postage,
            totalPrice:totalPrice,
            allPrice:totalPrice,
            address:res.data.data[0]
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      },fail(res){
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
    wx.request({
      url: baseUrl+"order/getRangeTime",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.setData({
            dateRange:res.data.data
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      },fail(res){
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  onShow:function(){
     
  },
  //跳转地址
  toAddress:function(){
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  // 显示遮罩层
  showModal: function () {
    var that = this;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"order/getRangeList",
      method: 'get',
      data: [],
      success(res) {
        if(res.data.code==200){
          var data = res.data.data;
          that.setData({
            rangeList:data,
            range:data[0].rangeList,
            hideFlag: false,
            today:data.length==2?0:1
          })
          // 创建动画实例
          var animation = wx.createAnimation({
            duration: 400,//动画的持续时间
            timingFunction: 'ease',//动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
          })
          that.animation = animation; //将animation变量赋值给当前动画
          var time1 = setTimeout(function () {
            that.slideIn();//调用动画--滑入
            clearTimeout(time1);
            time1 = null;
          }, 100)
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
  today:function(){
    var that = this;
    var list = that.data.rangeList;
    var range = list[0].rangeList;
    that.setData({
      range:range,
      today:0
    })
  },
  tomorrow:function(){
    var that = this;
    var list = that.data.rangeList;
    var range = list[list.length-1].rangeList;
    that.setData({
      range:range,
      today:1
    })
  },
  //选择配送时间
  checkDate:function(e){
    var that = this;
    var date = that.data.today==0?'今天 ':'明天 ';
    that.setData({
      dateRange:date+e.currentTarget.dataset.time
    })
    that.hideModal();
  },
  chechMethod:function(e){
    var method = e.currentTarget.dataset.method;
    this.setData({
      method:method
    })
  },
  //下单 TODO
  // toPayment:function(){
  //   var that = this;
  //   wx.getSetting({
  //     withSubscriptions: true,
  //     complete(res){
  //       if(typeof(res.subscriptionsSetting.itemSettings)=='object' ){
  //          that.toOrder(that);
  //       }else{
  //         wx.requestSubscribeMessage({
  //           tmplIds: ['c-wwagnYAUYK0dj5QeEjvT64J_P39vNTnXiHs3EXVgA','jq5UENIsQBT7dg8AwBj2MVd7GJpcEl8oQm7ztx_FPDA','xq__fUa5dSTSkOautbRcm9R9Y9ynSOeD4Ooh8roxctc'],
  //           complete (res) { 
  //             that.toOrder(that);
  //           }
  //         })
  //       }
  //     }
  //   })
  // },
  toPayment:function(){
    var that = this;
    var range = '';
    var address = that.data.address;

    if(address==undefined){
      wx.showToast({
        title: '请选择收货地址',
        icon:'none'
      })
      return;
    }
    var dateRange = that.data.dateRange;
    if(dateRange=='请选择时间'){
      wx.showToast({
        title: '请选择送达时间',
        icon:'none'
      })
      return;
    }
    var today = that.data.today;
    var now = new Date();
    if(today==1){
      now.setTime(now.getTime()+24*60*60*1000);
    }
    var month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    var day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    range = now.getFullYear() +'-'+month+'-'+day+' '+dateRange.substr(2,dateRange.length-1);
    wx.showLoading({
      title: '生成订单中...',
    })
    var allPrice = that.data.allPrice;
    var baseUrl = that.data.baseUrl;
    var list = that.data.detailList;
    var data = {};
    data.rangeTime = range;
    data.uId=wx.getStorageSync('uId');
    data.totalPrice = allPrice;
    data.name = address.name;
    data.phone = address.phone;
    data.address = address.aCity+address.aDetail;
    data.channel = 1;
    var detail = [];
    for(var idx in list){
      var goods = list[idx].goods;
      for(var index in goods){
        var item = goods[index];
        var result = {};
        result.sId=item.s_id;
        result.paymentPrice=item.totalPrice;
        result.orderNum=item.s_num;
        detail[detail.length]=result;
      }
    }
    data.details = detail;
    data.token=wx.getStorageSync('token');
    wx.request({
      url: baseUrl+"order/addOrder",
      method: 'post',
      data: data,
      success(res) {
        if(res.data.code==200){
          var data = res.data.data.data;
          var oId = res.data.data.oId;
          //支付
          wx.requestPayment({
            'timeStamp':data.timeStamp,
            'nonceStr': data.nonceStr,
            'package': data.package,
            'signType': 'MD5',
            'paySign': data.paySign,
            success (res) {
              //查询是否支付
              var param = {};
              param.oId = oId;
              param.type = 1;
              param.token = wx.getStorageSync('token');
              wx.request({
                url: baseUrl+"mini/queryPayOrder",
                method: 'get',
                data: param,
                success(res) {
                  wx.hideLoading();
                  var result = res.data.msg;
                  wx.showModal({
                    content: result,
                    showCancel:false,
                    success (res) {
                      if (res.confirm) {
                        wx.redirectTo({
                          url: '/pages/order/detail/detail?oid='+oId,
                        })
                      }
                    }
                  })
                },
                fail(res){
                  wx.hideLoading();
                  wx.showModal({
                    content: '支付中',
                    showCancel:false,
                    success (res) {
                      if (res.confirm) {
                        wx.redirectTo({
                          url: '/pages/order/detail/detail?oid='+oId,
                        })
                      }
                    }
                  })

                }
              })
            },
            fail (res) {
              wx.showToast({
                icon:'none',
                title: '支付失败，请重新支付',
                success:function(){
                  setTimeout(function () {
                    wx.redirectTo({
                      url: '/pages/order/detail/detail?oid='+oId,
                    })
                  }, 1500);
                }
              })
            }
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      },fail(res){
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  
  disableRoll:function(){},
  errorPic:function(e){
    var idx= e.target.dataset.idx; 
    var idxx= e.target.dataset.idxx; 
    var that =this;
    var item="detailList["+idxx+"].goods["+idx+"].imgUrl" ; 
    var detail = {};
    detail[item]='/image/moren.png';
    that.setData(detail);
  }

})

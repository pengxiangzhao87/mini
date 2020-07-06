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
    today:0,
    todayHide:false,
    hideFlag: true,//true-隐藏  false-显示
    animationData: {},
    method:1,
    accountPrice:0,
    hidePay:true,
    method:1,
    oId:0,
    check:false
  },
  onLoad:function(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var postage = e.postage;
    var totalPrice = e.totalPrice;
    var detailList = JSON.parse(e.json);
    var now = new Date();
    var month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    var day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    var dateRange = '';
    var todayHide = false;
    var today=0;
    var endTime = new Date(now.getFullYear()+'-'+month+'-'+day+' 20:30:00').getTime();
    if(now.getTime()>endTime){
      dateRange = '选择时间';
      todayHide = true;
      today=1;
    }else{
      var startTime = new Date(now.getFullYear()+'-'+month+'-'+day+' 10:15:00');
      if(now.getTime()<startTime.getTime()){
        now = startTime;
      }
      var prDate = now.getFullYear()+'-'+month+'-'+day;
      var startDate = this.getDateRange(now,prDate);
      var endDate = new Date(startDate.getTime()+1000*60*30);
      dateRange = '今天 '+startDate.getHours()+':'+(startDate.getMinutes()==0?'00':startDate.getMinutes())+' - '+endDate.getHours()+':'+(endDate.getMinutes()==0?'00':endDate.getMinutes());
    }
    var paras={};
    paras.uId=4;
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
            allPrice:totalPrice,
            address:res.data.data[0],
            todayHide:todayHide,
            today:today
          })
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
    wx.request({
      url: baseUrl+"user/queryAccount",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.setData({
            accountPrice:res.data.data
          })
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
  onShow:function(){
    var that = this;
    //下一级返回时执行
    if(that.data.nextFlag==1){
      var baseUrl = that.data.baseUrl;
      var paras={};
      paras.uId=4;
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
            icon:'none',
            title: '服务器异常'
          })
        }
      })
    }
  },
  getDateRange:function(now,prDate){
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
      endMinute = '00';
    }
    return new Date(prDate+' '+afterHour+':'+endMinute);

  },
  getRangeList:function(now){
    var rangeList=[];
    var month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    var day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    var prDate = now.getFullYear()+'-'+month+'-'+day;
    var startDate = this.getDateRange(now,prDate);
    for(var i=0;i<100;){
      var endDate = new Date(startDate.getTime()+1000*60*30);
      var dateRange = startDate.getHours()+':'+(startDate.getMinutes()==0?'00':startDate.getMinutes())+' - '+endDate.getHours()+':'+(endDate.getMinutes()==0?'00':endDate.getMinutes());
      rangeList[i]=dateRange;
      if(endDate.getHours()>21){
        break;
      }
      startDate = endDate;
      ++i;
    }
    return rangeList;
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
    var now = that.data.todayHide?new Date('2020-06-10 10:15:00'):new Date();
    var month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    var day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    var startTime = new Date(now.getFullYear()+'-'+month+'-'+day+' 10:15:00');
    if(now.getTime()<startTime.getTime()){
      now= startTime;
    }
    var rangeList=that.getRangeList(now);
    that.setData({
      hideFlag: false,
      rangeList:rangeList
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


  // 显示遮罩层
  showPayModal: function () {
    var that = this;
    that.setData({
      hidePay: false,
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
  hidePayModal:function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间 默认400ms
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown();//调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        hidePay: true
      })
      clearTimeout(time1);
      time1 = null;
    }, 220)//先执行下滑动画，再隐藏模块
    wx.redirectTo({
      url: '/pages/order/detail/detail?oid='+that.data.oId,
    })
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
    var now = new Date();
    var month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    var day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    var startTime = new Date(now.getFullYear()+'-'+month+'-'+day+' 10:15:00');
    if(now.getTime()<startTime.getTime()){
      now= startTime;
    }
    var rangeList=that.getRangeList(now);
    that.setData({
      rangeList:rangeList,
      today:0
    })
  },
  tomorrow:function(){
    var that = this;
    var rangeList=that.getRangeList(new Date('2020-06-10 10:15:00'));
    that.setData({
      rangeList:rangeList,
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
  toPayment:function(){
    var that = this;
    var check = that.data.check;
    var range = '';
    if(check){
      var dateRange = that.data.dateRange;
      if(dateRange=='选择时间'){
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
    }
    wx.showLoading({
      title: '生成订单中',
    })
    var allPrice = that.data.allPrice;
    var baseUrl = that.data.baseUrl;
    var list = that.data.detailList;
    var address = that.data.address;
    var postage = that.data.postage;
    var dateRange = that.data.dateRange;
    var data = {};
    data.rangeTime = range;
    data.uId=4;
    data.totalPrice = allPrice;
    data.name = address.name;
    data.phone = address.phone;
    data.address = address.aCity;
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
    that.showPayModal();
    wx.request({
      url: baseUrl+"order/addOrder",
      method: 'post',
      data: data,
      success(res) {
        if(res.data.code==200){
          wx.hideLoading({
            complete: (res) => {},
          })
          that.setData({
            oId:res.data.data
          })
          //支付完成，弹窗提示支付完成，跳到待发货列表；未支付，跳到订单详情
          that.showPayModal();
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
  //选择支付方式
  chechMethod:function(e){
    var method = e.currentTarget.dataset.method;
    this.setData({
      method:method
    })
  },
  //选择配送方式
  checkDelivery:function(){
    this.setData({
      check:!this.data.check
    })
  },
  //支付
  payment:function(){
    var that = this;
    var method = that.data.method;
    var accountPrice = that.data.accountPrice;
    var allPrice = that.data.allPrice;
    if(method==3 && allPrice>accountPrice){
      return;
    }else{
      var baseUrl = that.data.baseUrl;
      var orderBasic = {};
      orderBasic.oId=that.data.oId
      orderBasic.paymentChannel=method;
      wx.request({
        url: baseUrl+"order/payment",
        method: 'post',
        data: orderBasic,
        success(res) {

          if(res.data.code==200){
            wx.showToast({
              title: '支付成功',
              success:function(){
                setTimeout(function () {
                  wx.redirectTo({
                    url: '/pages/order/order?id=1',
                  })
                }, 1000);
              }
            })
            
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

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
    allPrice:0
  },
  onLoad:function(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var postage = e.postage;
    var totalPrice = e.totalPrice;
    var detailList = JSON.parse(e.json);
    console.info(detailList)
    var dateRange = this.getDateRange();
    var paras={};
    paras.uId=1;
    paras.isUsed=1;
    wx.request({
      url: baseUrl+"user/queryAddressList",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          console.info(res.data.data[0])
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
  getDateRange:function(){
    var now = new Date();
    var time = now.getTime() + 1000*60*15;
    var afterDate = new Date(time);
    var afterHour = afterDate.getHours();
    var afterMinute = afterDate.getMinutes();
    var endMinute = '0';
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
    var startDate = new Date(afterDate.getFullYear()+'-'+afterDate.getMonth()+'-'+afterDate.getDay()+' '+afterHour+':'+endMinute);
    var endDate = new Date(startDate.getTime()+1000*60*30);
    return afterHour+':'+endMinute+'-'+endDate.getHours()+':'+endDate.getMinutes();
  },
  toAddress:function(){
    wx.navigateTo({
      url: '../address/address'
    })
  }
})

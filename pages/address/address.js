// pages/shoppingCar/address/address.js
var app = getApp();
Page({

  data: {
    baseUrl:'',
    address:[]
  },

  onLoad:function (){
    var that =  this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.uId=1;
    wx.request({
      url: baseUrl+"user/queryAddressList",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          console.info(res)
          var list = res.data.data;
          that.setData({
            address:list
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
  check:function(e){
    var aId = e.currentTarget.dataset.aid;
    console.info(aId)
    var that = this;
    var address = that.data.address;
    for(var idx in address){
      var item = address[idx];
      if(item.aId==aId){
        item.isUsed=1;
      }else{
        item.isUsed=0;
      }
    }
    that.setData({
      address:address
    })
  }
})

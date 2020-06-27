// pages/login/login.js
Page({

  data: {
    phone:''
  },

  onLoad:function(){

  },
  getPhone:function(e){
    this.setData({
      phone:e.detailwx.readBLECharacteristicValue({
        characteristicId: 'characteristicId',
        deviceId: 'deviceId',
        serviceId: 'serviceId',
      })
    })
  },
  sendCode:function(){
    var phone = this.data.phone;
    console.info(phone)
    var paras=[];
    paras.phone = phone;
    wx.request({
      url: baseUrl+"user/sendPhoneVerificationCode",
      method: 'get',
      data: paras,
      success(res) {
      }
    })
  },
  login:function(){
    // wx.request({
    //   url: baseUrl+"user/login",
    //   method: 'get',
    //   data: data,
    //   success(res) {
    //   }
    // })
  }
})


// pages/my/my.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    myInfo:{},
    eyeFlag:0
  },
  onLoad:function() {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.uId=2;
    wx.request({
      url: baseUrl+"user/queryMyInfo",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var myInfo = res.data.data;
          if(myInfo.imgUrl!=''){
            myInfo.imgList = myInfo.imgUrl.split('~');
          }
          that.setData({
            baseUrl:baseUrl,
            myInfo:myInfo
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

  changeEye:function(){
    var that = this;
    that.setData({
      eyeFlag:that.data.eyeFlag?false:true
    })
  },
  toEditInfo:function(){
    var json = JSON.stringify(this.data.myInfo);
    wx.navigateTo({
      url: 'editInfo/editInfo?json='+json
    })
  },
  //跳转地址管理
  toAddress:function(){
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },
  //跳转地址管理
  toOrder:function(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/order/order?id='+id
    })
  },
  withdraw:function(){

  },
  detail:function(){
    
  }

})

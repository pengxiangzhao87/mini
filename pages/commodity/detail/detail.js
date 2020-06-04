// pages/commodity/detail/detail.js
var app = getApp();
Page({
  data: {
    disabled:false,
    baseUrl:"",
    detail:{}
  },
  onLoad:function(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    that.setData({
      baseUrl:baseUrl
    })
    var data={};
    data.sId=e.sid;
    data.userId=4;
    wx.request({
      url: baseUrl+"commodity/queryCollage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var result = res.data.data;
          var urlList=[];
          if(result.s_address_video!=''){
            urlList.push(result.s_address_video);
            var imgList = result.s_address_img.split('~');
            urlList = urlList.concat(imgList);
            result.isVideo=1;
          }else{
            urlList= result.s_address_img.split('~');
            result.isVideo=0;
          }
          result.urlList=urlList;
          result.totalPrice = (result.price_unit * result.init_num).toFixed(2);
          console.info(result)
          that.setData({
            detail:result
          })
        }else{
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
  },
  subtract:function(){
    var that = this;
    var detail = that.data.detail;
    var num = 0;
    if(detail.init_unit==0){
      num = 50;
    }else{
      num = 1;
    }
    detail.init_num = detail.init_num-num;
    detail.totalPrice = (detail.price_unit * detail.init_num).toFixed(2);
    var disabled = false;
    if(detail.init_num==0){
      disabled = true;
    }
    that.setData({
      detail:detail,
      disabled:disabled
    })
  },
  add:function(){
    var that = this;
    var detail = that.data.detail;
    var num = 0;
    if(detail.init_unit==0){
      num = 50;
    }else{
      num = 1;
    }
    detail.init_num = detail.init_num+num;
    detail.totalPrice = (detail.price_unit * detail.init_num).toFixed(2);
    that.setData({
      detail:detail,
      disabled:false
    })
  },
  //调到购物车
  toShoppingCar:function(){
    wx.switchTab({
      url: '/pages/shoppingCar/shoppingCar'
    })
  },
  //添加到购物车
  addShoppingCar:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var detail = that.data.detail;
    var shoppingInfo = {};
    shoppingInfo.uId=4;
    shoppingInfo.sId=detail.s_id;
    shoppingInfo.sNum=detail.init_num;
    var json = JSON.stringify(shoppingInfo);
    wx.request({
      url: baseUrl+"shoppingCart/addShoppingCart",
      method: 'post',
      data: json,
      success(res) {
        console.info(res)
        if(res.data.code==200){
           
        }else{
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
  }
})

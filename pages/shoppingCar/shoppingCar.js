// pages/shoppingCar/shoppingCar.js
var app = getApp();
Page({
  data: {
    shoppingCar:[],
    hidden:false,
    baseUrl:"",
    selectedAll:false,
    totalPrice:0,
    restPrice:0,
    checkOut:'(0)'
  },
  onLoad: function(){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras=[];
    paras.userId = 1;
    wx.request({
      url: baseUrl+"shoppingCart/queryShoppingCartList",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data;
          var totalPrice = parseInt(0);
          var checkOut = parseInt(0);
          for(var idx in list){
            var item = list[idx];
            if(item.init_unit==0 && item.s_num<=50 || item.init_unit==1 && item.s_num==1){
              item.disabled = true;
            }else{
              item.disabled = false;
            }
            if(item.is_check==1){
              var sum = item.init_unit==0?item.s_num/50:item.s_num;
              totalPrice += parseFloat((item.price_unit*sum).toFixed(2));
              ++checkOut;
            }
          }
          var restPrice = parseInt(0);
          if(totalPrice<30 && totalPrice!=0){
            restPrice=30-totalPrice;
          }
          that.setData({
            baseUrl:baseUrl,
            shoppingCar:list,
            totalPrice:totalPrice,
            restPrice:restPrice,
            checkOut:'('+checkOut+')'
          })
        }else{
          wx.showToast({
            title: res.data.msg
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
  closePostage:function(){
    this.setData({
      hidden:true
    })
  },
  //微调，减少
  subtract:function(e){
    var sid = e.currentTarget.dataset.sid;
    var that = this;
    var list = that.data.shoppingCar;
    var totalPrice = parseFloat(that.data.totalPrice);
    var restPrice = parseFloat(that.data.restPrice);
    for(var idx in list){
      var item = list[idx];
      if(sid==item.s_id){
        item.s_num = item.init_unit==0?item.s_num-50:item.s_num-1;
        item.totalPrice = (item.price_unit*item.s_num).toFixed(2);
        totalPrice = (totalPrice-item.price_unit).toFixed(2);
        restPrice = totalPrice>30?0:(restPrice+parseFloat(item.price_unit)).toFixed(2);
        break;
      }
    }
    that.setData({
      shoppingCar:list,
      totalPrice:totalPrice,
      restPrice:restPrice
    })
  }
})

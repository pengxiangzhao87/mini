// pages/my/order/detail/detail.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    detailList:[],
    info:{},
    totalPrice:0

  },
  onLoad:function(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.oId=e.oid;
    wx.request({
      url: baseUrl+"order/queryOrderDetail",
      method: 'get',
      data: paras,
      success(res) {
        
        if(res.data.code==200){
          var detailList = res.data.data.detailList;
          var totalPrice = parseFloat(0);
          for(var idx in detailList){
            var item = detailList[idx]
            item.extraUrl = item.extra_img_url.split('~');
            console.info(item.extra_price);
            if(item.is_extra==2){
              totalPrice += parseFloat((item.extra_price).toFixed(2));
              console.info(totalPrice);
            }
          }
          console.info(detailList)
          console.info(totalPrice)
          console.info(totalPrice==0)
          that.setData({
            detailList:detailList,
            info:res.data.data.info,
            baseUrl:baseUrl,
            totalPrice:totalPrice
          })
        }
      }
    })
  }
})

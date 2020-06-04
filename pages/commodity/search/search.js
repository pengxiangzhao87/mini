// pages/commodity/search/search.js
var app = getApp();
Page({
   
  data: {
    baseUrl:"",
    sName:"",
    commodity:[],
    page:1,
    rows:10,
  },
  onLoad:function(e){
    var that = this;
    var sName = e.sName; 
    var baseUrl = app.globalData.baseUrl;
    that.setData({
      sName:sName,
      baseUrl:baseUrl
    })
    var data={};
    data.userId=4;
    data.sName = sName;
    data.page=that.data.page;
    data.rows=that.data.rows;
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          console.info(res)
          that.setData({
            commodity:list
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
  }
})

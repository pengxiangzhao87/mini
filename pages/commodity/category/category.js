// pages/commodity/category/category.js
var app = getApp();
Page({
  data: {
    commodity:[],
    category:[],
    page:1,
    rows:10,
    baseUrl:""
  },

  onLoad:function(e) {
    var tid = e.tid;
    console.info(tid)
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    wx.request({
      url: baseUrl+"commodity/queryCategoryList",
      method: 'get',
      success(res) {
        if(res.data.code==200){
          var list = res.data.data;
          for(var idx in list){
            var item = list[idx];
            if(item.tId==tid){
              item.selected = true;
            }else{
              item.selected = false;
            }
          }
          that.setData({
            baseUrl:baseUrl,
            category:list
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
    // wx.request({
    //   url: baseUrl+"commodity/queryCommodityByPage",
    //   method: 'get',
    //   data: data,
    //   success(res) {
    //     if(res.data.code==200){
    //       var list = res.data.data.list;
    //       that.setData({
    //         commodity:list
    //       })
    //     }else{
    //       wx.showToast({
    //         title: res.data.msg
    //       })
    //     }
    //   },
    //   fail(res) {
    //     wx.showToast({
    //       title: "服务器异常"
    //     })
    //   }
    // })
  }
})

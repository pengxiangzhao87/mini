// pages/my/editInfo/editInfo.js
var app = getApp();
Page({

  data: {
    info:{}
  },

  onLoad:function(e) {
    var info = JSON.parse(e.json);
    var baseUrl = app.globalData.baseUrl;
    this.setData({
      info:info,
      baseUrl:baseUrl
    })
    console.info(info)
  }
})

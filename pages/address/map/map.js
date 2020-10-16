// pages/address/map/map.js
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  data: {

  },

  /**
   * 组件的方法列表
   */
  onLoad:function() {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '5ZNBZ-VAPWP-THWD3-LBXL6-UK6GQ-UZBGN'
    });
    this.mapCtx = wx.createMapContext('myMap')
  }
})

// pages/store/store.js
var util= require('../../utils/util.js');
var app = getApp();
Page({

  data: {
    baseUrl:'',
    sId:0,
    categoryList:[],
    goods:[],
    tId:0,
    page:{},
    isPhone:'',
    ww:0,
    hh:0
  },

  /**
   * 组件的方法列表
   */
  onLoad:function(e) {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    
    that.setData({
      sId:e.sid,
      baseUrl:baseUrl,
      ww:app.globalData.ww-200,
      hh:app.globalData.hh-120
    })
  },
  onShow:function(){
    var that = this;
    if(!wx.getStorageSync('uId')){
      app.wxGetOpenID().then(function(){
        that.showData(that);
      })
    }else{
      that.showData(that);
    }
    
  },
  showData:function(that){
    var baseUrl = that.data.baseUrl;
    var paras={};
    paras.sId=that.data.sId;
    wx.request({
      url: baseUrl+"commodity/queryCategoryList",
      method: 'get',
      data: paras,
      success(res) {
        var categoryList = res.data.data;
        var item = categoryList[0];
        item.selected = true;
        console.info(categoryList)
        paras.page=1;
        paras.rows=10;
        paras.userId=wx.getStorageSync('uId');
        paras.tId=categoryList[0].tId;
        paras.areaFlag = wx.getStorageSync('areaFlag');
        wx.request({
          url: baseUrl+"commodity/queryCommodityByPage",
          method: 'get',
          data: paras,
          success(res) {
            if(res.data.code==200){
              var list = res.data.data.list;
              console.info(list)
              that.setData({
                categoryList:categoryList,
                goods:list,
                tId:categoryList[0].tId,
                isPhone:wx.getStorageSync('isPhone')
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
        // util.getCarNum(that,baseUrl, paras)
      }
    })
    
  },
  disableRoll(){},
  checkType(e){
    var tid = e.currentTarget.dataset.tid;
    console.info(e)
    var that = this;
    var categoryList = that.data.categoryList;
    for(var idx in categoryList){
      var item = categoryList[idx];
      if(item.tId = tid){
        item.selected = true;
      }else{
        item.selected = false;
      }
    }
    console.info(categoryList)
    that.setData({
      categoryList:categoryList
    })
  }
})

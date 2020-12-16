// pages/commodity/search/history/history.js
var app = getApp();
Page({
  data: {
    type:0,
    searchList:[],
    hotList:[],
    name:''
  },
  onLoad:function(e) {
    var that = this;
    that.setData({
      type:e.type,
      searchList:app.globalData.searchList
    })
    var baseUrl = app.globalData.baseUrl;
    wx.request({
      url: baseUrl+"menu/queryHotSearch",
      method: 'get',
      success(res) {
        console.info(res)
        that.setData({
          hotList:res.data.data,
        })
      }
    })
  },
  onShow:function(){
    this.setData({
      searchList:app.globalData.searchList
    })
  },
  toSearch:function(e){
    var that = this;
    var sName = e.detail.value;
    var inputName = sName.replace(/\s*/g,"");
    if(inputName!=''){
      var searchList=that.data.searchList;
      var can = true;
      for(var idx in searchList){
        var item = searchList[idx];
        if(item==inputName){
          can = false;
        }
      }
      if(can){
        searchList.unshift(inputName);
        console.info('searchList',searchList)
        app.globalData.searchList=searchList;
      }
      
    }
    var type = that.data.type;
    wx.navigateTo({
      url: '../search?sName='+sName+'&type='+type
    })
  },
  checkItem:function(e){
    var name = e.currentTarget.dataset.name;
    var type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../search?sName='+name+'&type='+type
    })
  },
  //清空
  empty:function(){
    app.globalData.searchList=[];
    this.setData({
      searchList:[]
    })
  }
})

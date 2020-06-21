// pages/commodity/search/history/history.js
var app = getApp();
Page({
  data: {
    searchList:[],
    name:''
  },
  onLoad:function() {
    this.setData({
      searchList:app.globalData.searchList
    })
  },
  toSearch:function(e){
    var that = this;
    var sName = e.detail.value;
    if(sName!=''){
      var searchList=that.data.searchList;
      searchList.unshift(sName);
      that.setData({
        searchList:searchList
      })
      app.globalData.searchList=searchList;
    }
    wx.navigateTo({
      url: '../search?sName='+sName
    })
  },
  checkItem:function(e){
    var name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '../search?sName='+name
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

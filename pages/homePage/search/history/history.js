// pages/commodity/search/history/history.js
var app = getApp();
Page({
  data: {
    searchList:[],
    name:''
  },
  onLoad:function() {
    
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
        app.globalData.searchList=searchList;
      }
      
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

// pages/commodity/search/history/history.js
var app = getApp();
Page({
  data: {
    type:0,
    searchList:[],
    hotList:[],
    ww:0,
  },
  onLoad:function(e) {
    var that = this;
    that.setData({
      type:e.type,
      searchList:app.globalData.searchList,
      ww:app.globalData.ww
    })
    var baseUrl = app.globalData.baseUrl;
    wx.request({
      url: baseUrl+"menu/queryHotSearch",
      method: 'get',
      success(res) {
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
    var type = that.data.type;
    var inputName = sName.replace(/\s*/g,"");
    if(inputName!=''){
      var searchList=that.data.searchList;
      var can = true;
      for(var idx in searchList){
        var item = searchList[idx];
        if(item.sName==inputName){
          can = false;
        }
      }
      if(can){
        var item = {};
        item.sName = inputName;
        item.type=type;
        searchList.unshift(item);
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
  },
  turnSearch(){
    var type = this.data.type;
    this.animation_main = wx.createAnimation({
      duration:500,
      timingFunction:'linear'
    })
    this.animation_back = wx.createAnimation({
      duration:500,
      timingFunction:'linear'
    })
    // 点击正面

    if (type==0) {
      this.animation_main.rotateX(180).step()
      this.animation_back.rotateX(0).step()
      this.setData({
        animationMain: this.animation_main.export(),
        animationBack: this.animation_back.export(),
        type:1
      })
    }
    // 点击背面
    else{
      this.animation_main.rotateX(0).step()
      this.animation_back.rotateX(-180).step()
      this.setData({
        animationMain: this.animation_main.export(),
        animationBack: this.animation_back.export(),
        type:0
      })
    }
  }
})

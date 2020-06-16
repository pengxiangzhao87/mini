// pages/commodity/search/search.js
var app = getApp();
Page({
   
  data: {
    baseUrl:"",
    sName:"",
    commodity:[],
    page:1,
    rows:6,
    totalPage:0,
    hidden:true
  },
  onLoad:function(e){
    var that = this;
    var sName = e.sName; 
    var baseUrl = app.globalData.baseUrl;
    that.setData({
      sName:sName,
      baseUrl:baseUrl
    })
    var paras={};
    paras.userId=4;
    paras.sName = sName;
    paras.page=that.data.page;
    paras.rows=that.data.rows;
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          var totalPage = res.data.data.totalPage;
          console.info(res)
          that.setData({
            commodity:list,
            totalPage:totalPage
          })
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },
      fail(res) {
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  //上拉获取新数据
  onReachBottom:function(){
    var that = this;
    var page = that.data.page+1;
    var rows = that.data.rows;
    var sName = that.data.sName;
    var totalPage = that.data.totalPage;
    var baseUrl = that.data.baseUrl;
    if(totalPage>=page){
      var paras={};
      paras.userId=4;
      paras.sName = sName;
      paras.page=page;
      paras.rows=rows;
      wx.request({
        url: baseUrl+"commodity/queryCommodityByPage",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            var list = res.data.data.list;
            var result = that.data.commodity.concat(list);
            console.info(res)
            that.setData({
              commodity:result,
              page:page
            })
          }else{
            wx.showToast({
              title: res.data.msg
            })
          }
        },
        fail(res) {
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      })
    }else{
      that.setData({
        hidden:false
      })
    }
  },
  //跳转详情
  toDetail:function(e){
    var sid = e.currentTarget.dataset.sid;
    wx.navigateTo({
      url: '../detail/detail?sid='+sid
    })
  },
  //禁止下拉
  onPageScroll:function(e){
    if(e.scrollTop<0){
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  }
})

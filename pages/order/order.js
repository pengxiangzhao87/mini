// pages/my/order/order.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    rows:10,

    allOrder:true,
    allList:[],
    allPage:1,
    allTotalPage:0,

    sendOrder:false,
    sendList:[],
    sendPage:1,
    sendTotalPage:0,

    takeOrder:false,
    takeList:[],
    takePage:1,
    takeTotalPage:0
  },
 
  onLoad:function(e) {
    var id = e.id;
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.userId=1;
    paras.page=1;
    paras.rows=that.data.rows;
    if(id==1){
      paras.status=1
    }else if(id==2){
      paras.status=2
    }
    wx.request({
      url: baseUrl+"order/queryOrderBasicByPage",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var data = res.data.data.list;
          var totalPage = res.data.data.totalPage;
          for(var idx in data){
            var item = data[idx];
            item.imgUrl = item.imgUrl.split('~');
          }
          if(id==1){
            that.setData({
              baseUrl:baseUrl,
              sendList:data,
              sendTotalPage:totalPage,
              allOrder:false,
              sendOrder:true,
              takeOrder:false
            })
          }else if(id==2){
            that.setData({
              baseUrl:baseUrl,
              takeList:data,
              takeTotalPage:totalPage,
              allOrder:false,
              sendOrder:false,
              takeOrder:true
            })
          }else{
            that.setData({
              baseUrl:baseUrl,
              allList:data,
              allTotalPage:totalPage,
              allOrder:true,
              sendOrder:false,
              takeOrder:false
            })
          }
          
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },
      fail:function(){
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  //全部
  allOrder:function(){
    var that = this;
    var list = that.data.allList;
    if(list.length==0){
      var baseUrl = app.globalData.baseUrl;
      var page = that.data.allPage;
      var rows = that.data.rows;
      var paras={};
      paras.userId=1;
      paras.page=page;
      paras.rows=rows;
      wx.request({
        url: baseUrl+"order/queryOrderBasicByPage",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            var data = res.data.data.list;
            var totalPage = res.data.data.totalPage;
            for(var idx in data){
              var item = data[idx];
              item.imgUrl = item.imgUrl.split('~');
            }
            that.setData({
              allList:data,
              allTotalPage:totalPage,
              allOrder:true,
              sendOrder:false,
              takeOrder:false
            })
          }else{
            wx.showToast({
              title: res.data.msg
            })
          }
        },
        fail:function(){
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      })
    }else{
      that.setData({
        allOrder:true,
        sendOrder:false,
        takeOrder:false
      })
    } 
  },
  //待发货
  sendOrder:function(){
    var that = this;
    var list = that.data.sendList;
    if(list.length==0){
      var baseUrl = app.globalData.baseUrl;
      var page = that.data.sendPage;
      var rows = that.data.rows;
      var paras={};
      paras.userId=1;
      paras.page=page;
      paras.rows=rows;
      paras.status=1;
      wx.request({
        url: baseUrl+"order/queryOrderBasicByPage",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            var data = res.data.data.list;
            var totalPage = res.data.data.totalPage;
            for(var idx in data){
              var item = data[idx];
              item.imgUrl = item.imgUrl.split('~');
            }
            that.setData({
              sendList:data,
              sendTotalPage:totalPage,
              allOrder:false,
              sendOrder:true,
              takeOrder:false
            })
          }else{
            wx.showToast({
              title: res.data.msg
            })
          }
        },
        fail:function(){
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      })
    }else{
      that.setData({
        allOrder:false,
        sendOrder:true,
        takeOrder:false
      })
    } 
  },
  //待收货
  takeOrder:function(){
    var that = this;
    var list = that.data.sendList;
    if(list.length==0){
      var baseUrl = app.globalData.baseUrl;
      var page = that.data.takePage;
      var rows = that.data.rows;
      var paras={};
      paras.userId=1;
      paras.page=page;
      paras.rows=rows;
      paras.status=2;
      wx.request({
        url: baseUrl+"order/queryOrderBasicByPage",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            var data = res.data.data.list;
            var totalPage = res.data.data.totalPage;
            for(var idx in data){
              var item = data[idx];
              item.imgUrl = item.imgUrl.split('~');
            }
            that.setData({
              takeList:data,
              takeTotalPage:totalPage,
              allOrder:false,
              sendOrder:false,
              takeOrder:true
            })
          }else{
            wx.showToast({
              title: res.data.msg
            })
          }
        },
        fail:function(){
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      })
    }else{
      that.setData({
        allOrder:false,
        sendOrder:false,
        takeOrder:true
      })
    } 
  },
  //上拉加载更多
  onReachBottom:function(){
    var that = this;
    var list = null;
    var totalPage = 0;
    var page = 0;
    if(that.data.sendOrder){
      list = that.data.sendList;
      totalPage = that.data.sendTotalPage;
      page = that.data.sendPage+1;
    }else if(that.data.takeOrder){
      list = that.data.takeList;
      totalPage = that.data.takeTotalPage;
      page = that.data.takePage+1;
    }else{
      list = that.data.allList;
      totalPage = that.data.allTotalPage;
      page = that.data.allPage+1;
    }
    if(page>totalPage){
      return;
    }
    var baseUrl = app.globalData.baseUrl;
    var rows = that.data.rows;
    var paras={};
    paras.userId=1;
    paras.page=page;
    paras.rows=rows;
    if(that.data.sendOrder){
      paras.status=1;
    }else if(that.data.takeOrder){
      paras.status=2;
    }
    wx.request({
      url: baseUrl+"order/queryOrderBasicByPage",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var data = res.data.data.list;
          for(var idx in data){
            var item = data[idx];
            item.imgUrl = item.imgUrl.split('~');
          }
          if(that.data.sendOrder){
            that.setData({
              sendList:list.concat(data),
              sendPage:page
            })
          }else if(that.data.takeOrder){
            that.setData({
              takeList:list.concat(data),
              takePage:page
            })
          }else{
            that.setData({
              allList:list.concat(data),
              allPage:page
            })
          }
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },
      fail:function(){
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  toDetail:function(e){
    var oid = e.currentTarget.dataset.oid;
    wx.navigateTo({
      url: 'detail/detail?oid='+oid
    })
  },
  toFeedBack:function(){
    wx.navigateTo({
      url: 'feedBack/feedBack'
    })
  },
  toAgain:function(){
    wx.navigateTo({
      url: 'again/again'
    })
  }

})

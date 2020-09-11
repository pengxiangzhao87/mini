// pages/my/order/order.js
var app = getApp();
Page({
  data: {
    animationData: {},
    baseUrl:'',
    rows:20,

    payOrder:true,
    payList:[],
    payPage:1,
    payTotalPage:0,

    sendOrder:false,
    sendList:[],
    sendPage:1,
    sendTotalPage:0,

    takeOrder:false,
    takeList:[],
    takePage:1,
    takeTotalPage:0,

    allOrder:false,
    allList:[],
    allPage:1,
    allTotalPage:0
  },
 
  onLoad:function(e) {
    var id = e.id;
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    if(id==1){
      that.setData({
        baseUrl:baseUrl,
        payOrder:false,
        allOrder:false,
        sendOrder:true,
        takeOrder:false
      })
    }else if(id==2){
      that.setData({
        baseUrl:baseUrl,
        payOrder:false,
        allOrder:false,
        sendOrder:false,
        takeOrder:true
      })
    }else if(id==5){
      that.setData({
        baseUrl:baseUrl,
        payOrder:true,
        allOrder:false,
        sendOrder:false,
        takeOrder:false
      })
    }else{
      that.setData({
        baseUrl:baseUrl,
        payOrder:false,
        allOrder:true,
        sendOrder:false,
        takeOrder:false
      })
    }
  },
  onShow:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var status =that.data.payOrder?5:(that.data.sendOrder?1:(that.data.takeOrder?2:-1));
    var paras={};
    paras.userId=wx.getStorageSync('uId');
    paras.page=1;
    var page = status==1?that.data.sendPage:(status==2?that.data.takePage:(status==5?that.data.payPage:that.data.allPage));
    paras.rows=that.data.rows*page;
    paras.status=status;
    wx.request({
      url: baseUrl+"order/queryOrderBasicByPage",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var data = res.data.data.list;
          var totalPage = res.data.data.totalPage;
          var total = status==1?that.data.sendTotalPage:(status==2?that.data.takeTotalPage:(status==5?that.data.payTotalPage:that.data.allTotalPage));
          var pageAll = total==0?totalPage:total;
          for(var idx in data){
            var item = data[idx];
            item.imgUrl = item.imgUrl.split('~');
          }
          if(status==1){
            that.setData({
              sendList:data,
              sendTotalPage:pageAll
            })
          }else if(status==2){
            that.setData({
              takeList:data,
              takeTotalPage:pageAll
            })
          }else if(status==5){
            that.setData({
              payList:data,
              payTotalPage:pageAll
            })
          }else{
            that.setData({
              allList:data,
              allTotalPage:pageAll
            })
          }
          
        }else{
          wx.showToast({
            icon:'none',
            title: '服务器异常'
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
      var rows = that.data.rows*page;
      var paras={};
      paras.userId=wx.getStorageSync('uId');
      paras.page=page;
      paras.rows=rows;
      paras.status=-1;
      wx.request({
        url: baseUrl+"order/queryOrderBasicByPage",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            var data = res.data.data.list;
            var totalPage = res.data.data.totalPage;
            var total = that.data.allTotalPage;
            var pageAll = total==0?totalPage:total;
            for(var idx in data){
              var item = data[idx];
              item.imgUrl = item.imgUrl.split('~');
            }
            that.setData({
              allList:data,
              allTotalPage:pageAll,
              payOrder:false,
              allOrder:true,
              sendOrder:false,
              takeOrder:false
            })
          }else{
            wx.showToast({
              icon:'none',
              title: '服务器异常'
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
        payOrder:false,
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
      var rows = that.data.rows*page;
      var paras={};
      paras.userId=wx.getStorageSync('uId');
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
            var total = that.data.sendTotalPage;
            var pageAll = total==0?totalPage:total;
            for(var idx in data){
              var item = data[idx];
              item.imgUrl = item.imgUrl.split('~');
            }
            that.setData({
              sendList:data,
              sendTotalPage:pageAll,
              payOrder:false,
              allOrder:false,
              sendOrder:true,
              takeOrder:false
            })
          }else{
            wx.showToast({
              icon:'none',
              title: '服务器异常'
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
        payOrder:false,
        allOrder:false,
        sendOrder:true,
        takeOrder:false
      })
    } 
  },
  //待收货
  takeOrder:function(){
    var that = this;
    var list = that.data.takeList;
    if(list.length==0){
      var baseUrl = app.globalData.baseUrl;
      var page = that.data.takePage;
      var rows = that.data.rows*page;
      var paras={};
      paras.userId=wx.getStorageSync('uId');
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
            var total = that.data.takeTotalPage;
            var pageAll = total==0?totalPage:total;
            for(var idx in data){
              var item = data[idx];
              item.imgUrl = item.imgUrl.split('~');
            }
            that.setData({
              takeList:data,
              takeTotalPage:pageAll,
              payOrder:false,
              allOrder:false,
              sendOrder:false,
              takeOrder:true
            })
          }else{
            wx.showToast({
              icon:'none',
              title: '服务器异常'
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
        payOrder:false,
        allOrder:false,
        sendOrder:false,
        takeOrder:true
      })
    } 
  },
  //待支付
  payOrder:function(){
    var that = this;
    var list = that.data.payList;
    if(list.length==0){
      var baseUrl = app.globalData.baseUrl;
      var page = that.data.payPage;
      var rows = that.data.rows*page;
      var paras={};
      paras.userId=wx.getStorageSync('uId');
      paras.page=page;
      paras.rows=rows;
      paras.status=5;
      wx.request({
        url: baseUrl+"order/queryOrderBasicByPage",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            var data = res.data.data.list;
            var totalPage = res.data.data.totalPage;
            var total = that.data.payTotalPage;
            var pageAll = total==0?totalPage:total;
            for(var idx in data){
              var item = data[idx];
              item.imgUrl = item.imgUrl.split('~');
            }
            that.setData({
              payList:data,
              payTotalPage:pageAll,
              payOrder:true,
              allOrder:false,
              sendOrder:false,
              takeOrder:false
            })
          }else{
            wx.showToast({
              icon:'none',
              title: '服务器异常'
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
        payOrder:true,
        allOrder:false,
        sendOrder:false,
        takeOrder:false
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
    }else if(that.data.payOrder){
      list = that.data.payList;
      totalPage = that.data.payTotalPage;
      page = that.data.payPage+1;
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
    paras.userId=wx.getStorageSync('uId');
    paras.page=page;
    paras.rows=rows;
    if(that.data.sendOrder){
      paras.status=1;
    }else if(that.data.takeOrder){
      paras.status=2;
    }else if(that.data.payOrder){
      paras.status=5;
    }else{
      paras.status=-1;
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
          }else if(that.data.payOrder){
            that.setData({
              payList:list.concat(data),
              payPage:page
            })
          }else{
            that.setData({
              allList:list.concat(data),
              allPage:page
            })
          }
        }else{
          wx.showToast({
            icon:'none',
            title: '服务器异常'
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
    var status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: 'detail/detail?oid='+oid+'&status='+status
    })
  },
  errorPic:function(e){
    var idx= e.target.dataset.idx; 
    var idxx= e.target.dataset.idxx; 
    var that =this;
    var item = null;
    if(that.data.sendOrder){
      item="sendList["+idxx+"].imgUrl["+idx+"]" ; 
    }else if(that.data.takeOrder){
      item="takeList["+idxx+"].imgUrl["+idx+"]" ; 
    }else if(that.data.payOrder){
      item="payList["+idxx+"].imgUrl["+idx+"]" ; 
    }else{
      item="allList["+idxx+"].imgUrl["+idx+"]" ; 
    }
    var detail = {};
    detail[item]='/image/moren.png';
    that.setData(detail);
  }
})

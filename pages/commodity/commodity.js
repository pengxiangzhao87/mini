// pages/commodity.js
var app = getApp();
Page({
  data: {
    address:"", 
    commodity:[],
    page:1,
    rows:4,
    totalPage:0,
    baseUrl:"",
    hidden:true
  },
  onLoad:function(){
    var that = this;
    var data = that.data;
    var baseUrl = app.globalData.baseUrl;
    that.setData({
      baseUrl:baseUrl
    })
    var paras = {};
    paras.page=data.page;
    paras.rows=data.rows;
    paras.userId=4;
    this.queryCommodity(that,paras,baseUrl);
    paras.uId=4;
    paras.isUsed=1;
    this.queryAddressList(that,paras,baseUrl);
  },
  //跳转到搜索页
  searchByName:function(e){
    var sName = e.detail.value; 
    wx.navigateTo({
      url: 'search/search?sName='+sName
    })
  },
  //上拉获取新数据
  onReachBottom:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var totalPage = that.data.totalPage;
    var paras={};
    paras.page=that.data.page;
    paras.rows=that.data.rows;
    paras.userId=4;
    if(totalPage!=that.data.page){
      wx.request({
        url: baseUrl+"commodity/queryCommodityByPage",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            var list = res.data.data.list;
            var result = that.data.commodity.concat(list);
            that.setData({
              commodity:result,
              page:that.data.page+1
            })
          }else{
            wx.showToast({
              title: res.data.msg
            })
          }
        },
        fail(res) {
          wx.showToast({
            title: "服务器异常"
          })
        }
      })
    }else{
      that.setData({
        hidden:false
      })
    }
    
  },
  //热销商品分页查询
  queryCommodity:function(that,data,baseUrl){
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          var totalPage = res.data.data.totalPage;
          that.setData({
            commodity:list,
            page:that.data.page+1,
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
          title: "服务器异常"
        })
      }
    })
  },
  //查询使用收货地址
  queryAddressList:function(that,data,baseUrl){
    wx.request({
      url: baseUrl+"user/queryAddressList",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          if(res.data.data.length>0){
            var aCity = res.data.data[0].aCity;
            that.setData({
              address:aCity
            })
          }
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },
      fail(res) {
        wx.showToast({
          title: "服务器异常"
        })
      }
    })
  },
  //跳转模糊查询
  searchByName:function(e){
    var sName = e.detail.value;
    wx.navigateTo({
      url: 'search/search?sName='+sName
    })
  },
  //跳转分类
  toCategory:function(e){
    var tid = e.currentTarget.dataset.tid;
    wx.navigateTo({
      url: 'category/category?tid='+tid
    })
  },
  //跳转详情
  toDetail:function(e){
    var sid = e.currentTarget.dataset.sid;
    wx.navigateTo({
      url: 'detail/detail?sid='+sid
    })
  },
  //加入购物车
  addCar:function(e){
    var sid = e.currentTarget.dataset.sid;
    var data={};
    data.sid=sid;
    data.uid=4;
    var json = JSON.stringify(data);
    wx.request({
      url: app.globalData.baseUrl+"shoppingCart/addShoppingCart",
      method: 'post',
      data: json,
      success(res) {
        if(res.data.code!=200){
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
  },
  //回到顶部
  onTabItemTap:function(){
    wx.pageScrollTo({
      scrollTop:0
    })
  },
  onPageScroll:function(e){
    if(e.scrollTop<0){
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  }
})
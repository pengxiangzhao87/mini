// pages/commodity.js
var app = getApp();
Page({
  data: {
    address:"",
    sName:"",    
    commodity:[],
    page:1,
    rows:10,
    baseUrl:""
  },
  onLoad:function(){
    var that = this;
    var data = that.data;
    var baseUrl = app.globalData.baseUrl;
    that.setData({
      baseUrl:baseUrl
    })
    var paras = [];
    paras.page=data.page;
    paras.rows=data.rows;
    if(data.sName!=''){
      paras.sName = data.sName;
    }
    paras.userId=1;
    this.queryCommodity(that,paras,baseUrl);
    paras.uId=1;
    paras.isUsed=1;
    this.queryAddressList(that,paras,baseUrl);
  },

  searchByName:function(e){
    var sName = e.detail.value; 
    wx.navigateTo({
      url: 'search/search?sName='+sName
    })
  },

  //热销商品分页查询/模糊查询/类别查询
  queryCommodity:function(that,data,baseUrl){
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          that.setData({
            commodity:list
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
          var aCity = res.data.data[0].aCity;
          that.setData({
            address:aCity
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
    data.uid=1;
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
  }
})

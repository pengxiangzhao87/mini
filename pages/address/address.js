// pages/shoppingCar/address/address.js
var util= require('../../utils/util.js');
var app = getApp();
Page({

  data: {
    baseUrl:'',
    address:[]
  },

  onLoad:function (){   
    
  },
  onShow:function(){
    var that =  this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.userId=wx.getStorageSync('uId');
    wx.request({
      url: baseUrl+"user/queryAddressList",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data;
          for(var idx in list){
            list[idx].isTouchMove = false;
          }
          that.setData({
            address:list,
            baseUrl:baseUrl
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      },fail(res){
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  //选择默认
  check:function(e){
    var aId = e.currentTarget.dataset.aid;
    var that = this;
    var baseUrl = that.data.baseUrl;
    var paras={};
    paras.uId=wx.getStorageSync('uId');
    paras.aId=aId;
    wx.request({
      url: baseUrl+"user/checkAddress",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var address = that.data.address;
          var result = {};
          for(var idx in address){
            var item = address[idx];
            if(item.aId==aId){
              item.isUsed=1;
              result = item;
            }else{
              item.isUsed=0;
            }
          }
          that.setData({
            address:address
          })
          wx.setStorageSync('areaFlag', res.data.data)
          var pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
          var prevPage = pages[ pages.length - 2 ];  
          //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
          prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
            nextFlag:1,
            address:result
          })
          wx.navigateBack({
            delta: 1
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      },fail(res){
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })

  },
  //编辑
  toEdit:function(e){
    var that = this;
    var aId = e.currentTarget.dataset.aid;
    var address = that.data.address;
    var json = '';
    for(var idx in address){
      var item = address[idx];
      if(item.aId==aId){
        json = JSON.stringify(item);
        break;
      }
    }
    wx.navigateTo({
      url: 'edit/edit?flag=1&json='+json
    })
  },
  //新增
  add:function(){
    var address = {};
    address.isUsed=0;
    address.uId=wx.getStorageSync('uId');
    wx.navigateTo({
      url: 'edit/edit?flag=0&json='+JSON.stringify(address)
    })
  },



  //手指触摸动作开始 记录起点X坐标
  touchstart: function(e) {
    //开始触摸时 重置所有删除
    var data = util.touchStart(e, this.data.address)
    this.setData({
      address: data
    })
  },

  //滑动事件处理
  touchmove: function(e) {
    var data = util.touchMove(e, this.data.address)
    this.setData({
      address: data
    })
  },
  del:function(e){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var aId = e.currentTarget.dataset.aid;
    wx.showModal({
      content: '确定删除吗',
      success (res) {
        if (res.confirm) {
          var paras={};
          paras.aId=aId;
          wx.request({
            url: baseUrl+"user/deleAddress",
            method: 'get',
            data: paras,
            success(res) {
              wx.showToast({
                icon:'none',
                title: '删除成功',
              })
              that.onShow();
            }
          })
        }
      }
    })
    
  }

    
})

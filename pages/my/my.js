// pages/my/my.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    myInfo:{},
    eyeFlag:0,
    showModal:false,
    windowHeight:0,
    windowWidth:0,
    aniState: false,
    classState:false 
  },
  onShow:function() {
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.uId=wx.getStorageSync('uId');
    wx.request({
      url: baseUrl+"user/queryMyInfo",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var myInfo = res.data.data;
 
          if(myInfo.imgUrl!='' && myInfo.imgUrl!=undefined){
            myInfo.imgList = myInfo.imgUrl.split('~');
          }
          that.setData({
            baseUrl:baseUrl,
            myInfo:myInfo
          })
        }else{
          wx.showToast({
            title: res.data.msg
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

  changeEye:function(){
    var that = this;
    that.setData({
      eyeFlag:that.data.eyeFlag?false:true
    })
  },
  toEditInfo:function(){
    var json = JSON.stringify(this.data.myInfo);
    wx.navigateTo({
      url: 'editInfo/editInfo?json='+json
    })
  },
  getUser:function(e){
    var that = this;
    wx.getSetting({
      success (res) {
        if(res.authSetting["scope.userInfo"]){
          wx.showLoading({
            title: '授权中...',
          })
          var baseUrl = that.data.baseUrl;
          var data={};
          data.encryptedData = e.detail.encryptedData;
          data.iv = e.detail.iv;
          data.token=wx.getStorageSync('token');
          wx.request({
            url: baseUrl+"mini/getUserInfo",
            method: 'get',
            data: data,
            success(res) {
              if(res.data.code==200){
                that.onShow();
                wx.showToast({
                  icon:'none',
                  title: '授权成功',
                  duration:1500
                })
              }else{
                wx.showModal({
                  content: '请重新授权',
                  showCancel:false
                })
              }
            },
            fail(res) {
              wx.showModal({
                content: '请重新授权',
                showCancel:false
              })
            }
          })
        } 
      }
    })
    
  },
  //跳转地址管理
  toAddress:function(){
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },
  //跳转地址管理
  toOrder:function(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/order/order?id='+id
    })
  },
  toDeal:function(){
    wx.navigateTo({
      url: 'deal/deal'
    })
  },
  errorPic:function(e){
    var item="myInfo.u_avatar_url" //commodity为数据源，对象数组
    var myInfo = {};
    myInfo[item]='/image/logo.png';
    this.setData(myInfo);
  },

  showModal:function(){
    var that = this;
    var ww = app.globalData.ww;
    var hh = app.globalData.hh;
    that.setData({
      showModal: true,
      windowHeight:hh,
      windowWidth:ww
    })
  },
  hiddenModal:function(){
    var that = this;
    that.setData({
      showModal: false
    })
  },
  feedBack:function(e){
    var content = e.detail.value.content;
    if(''==content){
      wx.showToast({
        icon:'none',
        title: '和小夕说点什么吧？'
      })
      return;
    }
    var that = this;
    var baseUrl = that.data.baseUrl;
    var paras = {};
    paras.content= content;
    paras.uId = wx.getStorageSync('uId');
    wx.request({
      url: baseUrl+"user/feedBack",
      method: 'get',
      data: paras,
      success(res) {
        wx.showModal({
          content: '再次感谢您的支持!',
          showCancel:false
        })
        that.setData({
          showModal:false
        })
      }
    })
  },
  fadeInOut() {
    var that = this,
        aniState = that.data.aniState,
        classState = that.data.classState
  
      // 执行淡入淡出动画
      that.setData({
        classState: !classState
      })
  
      // 延时600ms切换图片
      setTimeout(()=> {
        that.setData({
          aniState: !aniState
        })
      },500)
  }
   
})

// pages/homePage/cart/cart.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    cart:{},
    ww:0
  },
  /**
   * 组件的方法列表
   */
  onShow(){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    wx.request({
      url: baseUrl+"menu/queryCartList",
      method: 'get',
      data: {'uId':wx.getStorageSync('uId')},
      success(res) {
        console.info(res)
        that.setData({
          baseUrl:baseUrl,
          cart:res.data.data,
          ww:app.globalData.ww
        })
      }
    })
  },
  toMenuDetail(e){
    var mid = e.currentTarget.dataset.mid;
    wx.navigateTo({
      url: '../detail/detail?mid='+mid
    })
  },
  toMenuOption(e){
    var mid = e.currentTarget.dataset.mid;
    wx.navigateTo({
      url: 'option/option?mid='+mid
    })
  },
  toFoodDetail(e){
    var fid = e.currentTarget.dataset.fid;
    wx.navigateTo({
      url: '../foodDetail/foodDetail?foodid='+fid
    })
  },
  checkItem(e){
    var cid = e.currentTarget.dataset.cid;
    var check = e.currentTarget.dataset.check==0?1:0;
    var that = this;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/checkCartItem",
      method: 'get',
      data: {'cId':cid,'isSelected':check},
      success(res) {
        if(res.data.code==200){
          that.onShow();
        }
      }
    })
  },
  checkAll(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var selectedAll = that.data.cart.selectedAll==0?1:0;
    wx.request({
      url: baseUrl+"menu/checkCartItem",
      method: 'get',
      data: {'uId':wx.getStorageSync('uId'),'isSelected':selectedAll},
      success(res) {
        if(res.data.code==200){
          that.onShow();
        }
      }
    })
  },
  switchMenuNum(e){
    var idx = e.currentTarget.dataset.idx;
    var that = this;
    var cart = that.data.cart;
    var item = cart.menuList[idx];
    item.isHidden=0;
    that.setData({
      cart:cart
    })
  },
  sub(e){
    var num = e.currentTarget.dataset.num;
    if(num==1){
      return;
    }
    var cid = e.currentTarget.dataset.cid;
    var that = this;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/fineCart",
      method: 'get',
      data: {'cId':cid,'flag':1},
      success(res) {
        if(res.data.code==200){
          that.onShow();
        }
      }
    })
  },
  add(e){
    var cid = e.currentTarget.dataset.cid;
    var that = this;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/fineCart",
      method: 'get',
      data: {'cId':cid,'flag':0},
      success(res) {
        if(res.data.code==200){
          that.onShow();
        }
      }
    })
  },


})

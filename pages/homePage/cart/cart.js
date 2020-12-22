// pages/homePage/cart/cart.js
var util= require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    baseUrl:'',
    cart:{},
    ww:0,
    cIds:''
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
        var cIds = that.data.cIds;
        var cart = res.data.data;
        var menuList = cart.menuList;
        for(var idx in menuList){
          var item = menuList[idx];
          if(cIds.indexOf(item.cId)!=-1){
            item.isHidden = 0;
          }
        }
        that.setData({
          baseUrl:baseUrl,
          cart:cart,
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
    var cid = e.currentTarget.dataset.cid;
    var mid = e.currentTarget.dataset.mid;
    wx.navigateTo({
      url: 'option/option?cid='+cid+'&mid='+mid
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
    var cid = e.currentTarget.dataset.cid;
    var that = this;
    var cIds = that.data.cIds;
    cIds = cIds +','+cid;
    that.setData({
      cIds:cIds
    })
    that.onShow();
  },
  sub(e){
    var num = e.currentTarget.dataset.num;
    if(num==1){
      return;
    }
    var cid = e.currentTarget.dataset.cid;
    var type = e.currentTarget.dataset.type;
    var that = this;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/fineCart",
      method: 'get',
      data: {'cId':cid,'flag':1,'type':type},
      success(res) {
        if(res.data.code==200){
          that.onShow();
        }
      }
    })
  },
  add(e){
    var cid = e.currentTarget.dataset.cid;
    var type = e.currentTarget.dataset.type;
    var that = this;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/fineCart",
      method: 'get',
      data: {'cId':cid,'flag':0,'type':type},
      success(res) {
        if(res.data.code==200){
          that.onShow();
        }
      }
    })
  },

  del(e){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var cid = e.currentTarget.dataset.cid;
    wx.request({
      url: baseUrl+"menu/deleteCart",
      method: 'get',
      data: {'cIds':cid},
      success(res) {
        if(res.data.code==200){
          that.onShow();
          var paras = {};
          paras.uId=wx.getStorageSync('uId');
          util.getCarNum(that,paras,baseUrl);
        }
      }
    })
  },

  delMore(e){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定清空商品吗？',
      success: function (sm) {
        if (sm.confirm) {
          var list = e.currentTarget.dataset.list;
          var baseUrl = that.data.baseUrl;
          var cids = '';
          for(var idx  in list){
            cids += list[idx].cId+',';
          }
          wx.request({
            url: baseUrl+"menu/deleteCart",
            method: 'get',
            data: {'cIds':cids.substring(0,cids.length-1)},
            success(res) {
              if(res.data.code==200){
                that.onShow();
                var paras = {};
                paras.uId=wx.getStorageSync('uId');
                util.getCarNum(that,paras,baseUrl);
              }
            }
          })
        }
      }
    })
    
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function(e) {
    var cart = this.data.cart;
    var menuList = cart.menuList;
    var foodList = cart.foodList;
    //开始触摸时 重置所有删除
    util.touchStart(e, menuList);
    util.touchStart(e, foodList);
    this.setData({
      cart: cart
    })
  },

  //滑动事件处理
  touchmove: function(e) {
    var cart = this.data.cart;
    var list = [];
    var flag = e.currentTarget.dataset.flag;
    if(flag==0){
      list = cart.menuList;
    }else{
      list = cart.foodList;
    }
    list = util.touchMove(e, list);
    this.setData({
      cart: cart
    })
  },
})

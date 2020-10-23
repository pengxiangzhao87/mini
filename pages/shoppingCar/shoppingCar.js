// pages/shoppingCar/shoppingCar.js
var util= require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    shoppingCar:[],
    baseUrl:""
  },
  onShow:function(){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras=[];
    paras.userId = wx.getStorageSync('uId');
    paras.areaFlag = wx.getStorageSync('areaFlag');
    wx.request({
      url: baseUrl+"shoppingCart/queryShoppingCartList",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.setData({
            baseUrl:baseUrl,
            shoppingCar:res.data.data
          })
          var paras = {};
          paras.userId= wx.getStorageSync('uId');
          paras.areaFlag=wx.getStorageSync('areaFlag');
          util.getCarNum(that,paras,baseUrl)
        }else{
          wx.showToast({
            icon:'none',
            title: '服务器异常'
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
  //微调
  fineTuning:function(e){
    //购物车ID
    var id = e.currentTarget.dataset.id;
    //0：减少，1：增加
    var flag = e.currentTarget.dataset.flag;
    var that = this;
    var list = that.data.shoppingCar;
    var baseUrl = that.data.baseUrl;
    var paras = [];
    paras.id=id;
    for(var idx in list){
      var detail = list[idx];
      for(var index in detail.goods){
        var item = detail.goods[index];
        if(id==item.id){
          if(flag==0 && item.disabled){
            return;
          }else{
            item.disabled=false;
          }
          item.s_num = item.init_unit==0?(flag==0?item.s_num-50:item.s_num+50):(flag==0?item.s_num-1:item.s_num+1);
          paras.sId=item.s_id;
          paras.number=item.s_num;
          break;
        }
      }
    }
    wx.request({
      url: baseUrl+"shoppingCart/fineTuning",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.onShow();
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
  //选中商品
  checkBox:function(e){
    //购物车ID
    var id = e.currentTarget.dataset.id;
    var check = e.currentTarget.dataset.check;
    var that = this;
    var baseUrl = that.data.baseUrl;
    var paras = [];
    paras.id=id;
    paras.isCheck=check==0?1:0;
    wx.request({
      url: baseUrl+"shoppingCart/checkCommodity",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.onShow();
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
   //跳转详情
   toDetail:function(e){
    var sid = e.currentTarget.dataset.sid;
    wx.navigateTo({
      url: '/pages/commodity/detail/detail?sid='+sid
    })
  },
  //选择所有
  checkAll:function(e){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var list = that.data.shoppingCar;
    var idx = e.currentTarget.dataset.idx;
    var detail = list[idx];
    var id = '';
    for(var index in detail.goods){
      var item = detail.goods[index];
      id += item.id+',';
    }
    var paras = [];
    paras.id=id.substring(0,id.length-1);
    paras.isCheck=detail.selectedAll?0:1;
    wx.request({
      url: baseUrl+"shoppingCart/checkCommodity",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.onShow();
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
  deleteFn:function(e){ 
    var that = this;
    var baseUrl = that.data.baseUrl;
    var list = that.data.shoppingCar;
    var idx = e.currentTarget.dataset.idx;
    var detail = list[idx];
    var ids = '';
    for(var index in detail.goods){
      var item = detail.goods[index];
      ids += item.id+',';
    }
    if(ids==''){
      return;
    }else{
      wx.showModal({
        title: '提示',
        content: '确定清空所有商品吗？',
        success: function (sm) {
          if (sm.confirm) {
            var paras = [];
            paras.ids=ids.substring(0,ids.length-1);
            wx.request({
              url: baseUrl+"shoppingCart/delteShoppingCart",
              method: 'get',
              data: paras,
              success(res) {
                if(res.data.code==200){
                  wx.showToast({
                    title: '删除成功'
                  })
                  that.onShow();
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
          }
        }
      })
    }
    
  },
  toPayment:function(e){
    var btn = e.currentTarget.dataset.btn; 
    var supId = e.currentTarget.dataset.supid; 
    wx.navigateTo({
      url: 'payment/payment?supid='+supId
    })
    if(btn){
    
      // var list = that.data.shoppingCar;
      // var item = list[idx];
      // var detailList=[];
      // var supplier = item.supplier;
      // var goods = item.goods
      // var detail = [];
      // for(var index in goods){
      //   var item = goods[index];
      //   if(item.is_check==1){
      //     detail[detail.length] = item;
      //   }
      // }
      // if(detail.length>0){
      //   var result={};
      //   result.supplier = supplier;
      //   result.goods = detail;
      //   detailList.push(result);
      // } 
      // var json = JSON.stringify(detailList);
      // var postage = 1;
      // if(restPrice==0 || restPrice==30){
      //   postage = 0;
      // }
      // wx.navigateTo({
      //   url: 'payment/payment?json='+json+'&postage='+postage+'&totalPrice='+that.data.totalPrice
      // })
    }
  },
  deleteLose:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var list = that.data.shoppingCar;
    var ids = '';
    for(var idx in list){
      var detail = list[idx];
      for(var index in detail.goods){
        var item = detail.goods[index];
        ids += item.id+',';
      }
    }
    if(ids.length>0){
      var paras = {};
      paras.ids = ids.substr(0,ids.length-1);
      wx.request({
        url: baseUrl+"shoppingCart/delteShoppingCart",
        method: 'get',
        data: paras,
        success(res) {
          that.onShow();
        },fail(res){
          wx.showToast({
            icon:'none',
            title: '服务器异常'
          })
        }
      })
    }  
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function(e) {
    var shoppingCar = this.data.shoppingCar;
    var idx = e.currentTarget.dataset.idx; //当前索引
    var goods = shoppingCar[idx].goods;
    //开始触摸时 重置所有删除
    var data = util.touchStart(e, goods)
    shoppingCar[idx].goods = data;
    for(var index in shoppingCar){
      if(index!=idx){
        var item = shoppingCar[index];
        for(var idx in  item.goods){
          item.goods[idx].isTouchMove=false;
        }
      }
    }
    this.setData({
      shoppingCar: shoppingCar
    })
  },

  //滑动事件处理
  touchmove: function(e) {
    var shoppingCar = this.data.shoppingCar;
    var idx = e.currentTarget.dataset.idx; //当前索引
    var goods = shoppingCar[idx].goods;
    var data = util.touchMove(e, goods)
    shoppingCar[idx].goods = data;
    this.setData({
      shoppingCar: shoppingCar
    })
  },
  del:function(e){
    var ids = e.currentTarget.dataset.id; //当前索引
    var that = this;
    var baseUrl = that.data.baseUrl;
    wx.showModal({
      content: '确定删除吗',
      success (res) {
        if (res.confirm) {
          var paras = [];
          paras.ids=ids;
          wx.request({
            url: baseUrl+"shoppingCart/delteShoppingCart",
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

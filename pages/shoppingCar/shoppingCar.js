// pages/shoppingCar/shoppingCar.js
var app = getApp();
Page({
  data: {
    shoppingCar:[],
    baseUrl:"",
    //是否全选
    selectedAll:false,
    //选择的总价
    totalPrice:0,
    //是否可以删除
    isDelete:false,
    //已选择商品数量
    checkNum:0,
  },
  onLoad: function(){

  },
  onShow:function(){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras=[];
    paras.userId = 4;
    wx.request({
      url: baseUrl+"shoppingCart/queryShoppingCartList",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data;
          var totalPrice = parseFloat(0);
          var checkNum = parseInt(0);
          var selectedAll = true;
          var isDelete = false;
          for(var idx in list){
            var detail = list[idx];
            for(var index in detail.goods){
              var item = detail.goods[index];
              if(item.init_unit==0 && item.s_num<=50 || item.init_unit==1 && item.s_num==1){
                item.disabled = true;
              }else{
                item.disabled = false;
              }
              if(item.is_check==1){
                var sum = item.init_unit==0?item.s_num/50:item.s_num;
                totalPrice += parseFloat((item.price_unit*sum).toFixed(2));
                ++checkNum;
                isDelete = true;
              }else{
                selectedAll = false;
              }
            }
          }
          that.setData({
            baseUrl:baseUrl,
            shoppingCar:list,
            totalPrice:totalPrice.toFixed(2),
            checkNum:checkNum,
            selectedAll:selectedAll,
            isDelete:isDelete
          })
          that.getCarNum(baseUrl);
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
  getCarNum:function(baseUrl){
    var paras = {};
    paras.userId=4;
    wx.request({
      url: baseUrl+"shoppingCart/queryShoppingCartList",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data;
          var checkNum = parseInt(0);
          for(var idx in list){
            var detail = list[idx];
            for(var index in detail.goods){
              var item = detail.goods[index];
              if(item.is_check==1){
                ++checkNum;
              }
            }
          }
          if(checkNum!=0){
            wx.setTabBarBadge({//tabbar右上角添加文本
              index: 1,//tabbar下标
              text: checkNum+'' //显示的内容,必须为字符串
            })
          }else{
            wx.removeTabBarBadge({
              index: 1,
            })
          }
        }
      }
    })
  },
  closePostage:function(){
    this.setData({
      hidden:true
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
   //跳转详情
   toDetail:function(e){
    var sid = e.currentTarget.dataset.sid;
    wx.navigateTo({
      url: '/pages/commodity/detail/detail?sid='+sid
    })
  },
  //选择所有
  checkAll:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var list = that.data.shoppingCar;
    console.info(list)
    if(list.length==0){
      return;
    }
    var selectedAll = that.data.selectedAll;
    var id = '';
    for(var idx in list){
      var detail = list[idx];
      for(var index in detail.goods){
        var item = detail.goods[index];
        id += item.id+',';
      }
    }
    var paras = [];
    paras.id=id.substring(0,id.length-1);
    paras.isCheck=selectedAll?0:1;
    wx.request({
      url: baseUrl+"shoppingCart/checkCommodity",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.onShow();
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
  deleteFn:function(){ 
    var that = this;
    var baseUrl = that.data.baseUrl;
    var list = that.data.shoppingCar;
    var isDelete = that.data.isDelete;
    if(!isDelete){
      return;
    }else{
      wx.showModal({
        title: '提示',
        content: '确定删除选中的商品吗？',
        success: function (sm) {
          if (sm.confirm) {
            var ids = '';
            for(var idx in list){
              var detail = list[idx];
              for(var index in detail.goods){
                var item = detail.goods[index];
                if(item.is_check==1){
                  ids += item.id+',';
                }
              }
            }
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
          }
        }
      })
    }
    
  },
  toPayment:function(){
    var that = this;
    var checkNum = that.data.checkNum;
    var restPrice = that.data.restPrice;
    if(checkNum==0){
      wx.showToast({
        icon:'none',
        title: '请先选择商品'
      })
    }else{
      var list = that.data.shoppingCar;
      var detailList=[];
      detailList.a=1;
      for(var idx in list){
        var supplier = list[idx].supplier;
        var goods = list[idx].goods
        var detail = [];
        for(var index in goods){
          var item = goods[index];
          if(item.is_check==1){
            detail[detail.length] = item;
          }
        }
        if(detail.length>0){
          var result={};
          result.supplier = supplier;
          result.goods = detail;
          detailList.push(result);
        } 
      }
      var json = JSON.stringify(detailList);
      var postage = 1;
      if(restPrice==0 || restPrice==30){
        postage = 0;
      }
      wx.navigateTo({
        url: 'payment/payment?json='+json+'&postage='+postage+'&totalPrice='+that.data.totalPrice
      })
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
  }
})

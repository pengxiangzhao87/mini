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
    //差价免配送费
    restPrice:30,
    //隐藏配送费提醒
    hidden:false,
    isDelete:false,
    //已选择商品数量
    checkNum:0
  },
  onLoad: function(){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras=[];
    paras.userId = 1;
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
            var item = list[idx];
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
          var restPrice = parseFloat(that.data.restPrice);
          if(totalPrice<30 && totalPrice!=0){
            restPrice=30-totalPrice;
          }
          console.info(list)
          that.setData({
            baseUrl:baseUrl,
            shoppingCar:list,
            totalPrice:totalPrice.toFixed(2),
            restPrice:restPrice.toFixed(2),
            checkNum:checkNum,
            selectedAll:selectedAll,
            isDelete:isDelete
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
    var totalPrice = parseFloat(that.data.totalPrice);
    var restPrice = parseFloat(that.data.restPrice);
    var paras = [];
    paras.id=id;
    for(var idx in list){
      var item = list[idx];
      if(id==item.id){
        if(flag==0 && item.disabled){
          return;
        }else{
          item.disabled=false;
        }
        item.s_num = item.init_unit==0?(flag==0?item.s_num-50:item.s_num+50):(flag==0?item.s_num-1:item.s_num+1);
        if(item.init_unit==0 && item.s_num==50 || item.init_unit==1 && item.s_num==1){
          item.disabled=true;
        }
        item.totalPrice = (item.price_unit*(item.init_unit==0?item.s_num/50:item.s_num)).toFixed(2);
        if(item.is_check==1){
          totalPrice = (flag==0?totalPrice-item.price_unit:totalPrice+item.price_unit).toFixed(2);
          restPrice = totalPrice>30?0:(flag==0?restPrice+parseFloat(item.price_unit):restPrice-parseFloat(item.price_unit)).toFixed(2);
        }
        paras.sId=item.s_id;
        paras.number=item.s_num;
        break;
      }
    }
    wx.request({
      url: baseUrl+"shoppingCart/fineTuning",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.setData({
            shoppingCar:list,
            totalPrice:totalPrice,
            restPrice:restPrice
          })
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },fail(res){
        wx.showToast({
          title: res.data.msg
        })
      }
    })
  },
  //选中商品
  checkBox:function(e){
    //购物车ID
    var id = e.currentTarget.dataset.id;
    var that = this;
    var list = that.data.shoppingCar;
    var baseUrl = that.data.baseUrl;
    var checkNum = that.data.checkNum;
    var totalPrice = parseFloat(that.data.totalPrice);
    var restPrice = parseFloat(that.data.restPrice);
    var paras = [];
    paras.id=id;
    var selectedAll = true;
    var isDelete = false;
    for(var idx in list){
      var item = list[idx];
      if(id==item.id){
        item.is_check=item.is_check==0?1:0;
        selectedAll = selectedAll==false?false:(item.is_check==0?false:true);
        paras.isCheck=item.is_check;
        checkNum = item.is_check==0?checkNum-1:checkNum+1;
        totalPrice = item.is_check==0?(totalPrice - parseFloat(item.totalPrice)).toFixed(2):(totalPrice + parseFloat(item.totalPrice)).toFixed(2);
        restPrice = totalPrice>30?0:(item.is_check==0?(restPrice+parseFloat(item.totalPrice)).toFixed(2):(restPrice-parseFloat(item.totalPrice)).toFixed(2));
      }else{
        selectedAll = selectedAll==false?false:(item.is_check==0?false:true); 
      }
      isDelete = item.is_check==1?true:false;
    }
    wx.request({
      url: baseUrl+"shoppingCart/checkCommodity",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          that.setData({
            shoppingCar:list,
            totalPrice:totalPrice,
            restPrice:restPrice,
            checkNum:checkNum,
            selectedAll:selectedAll,
            isDelete:isDelete
          })
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },fail(res){
        wx.showToast({
          title: res.data.msg
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
    var checkNum = that.data.checkNum;
    var totalPrice = parseFloat(that.data.totalPrice);
    var restPrice = parseFloat(that.data.restPrice);
    var selectedAll = that.data.selectedAll;
    var isDelete = false;
    var id = '';
    for(var idx in list){
      var item = list[idx];
      id += item.id+',';
      var isCheck = item.is_check;
      var itemTotalPrice = parseFloat(item.totalPrice);
      if(selectedAll){
        //变更后为：全不选
        checkNum = isCheck==1?checkNum-1:checkNum;
        totalPrice = parseFloat(isCheck==1?(totalPrice - itemTotalPrice).toFixed(2):totalPrice);
        restPrice = parseFloat(totalPrice>30?0:(isCheck==1?(restPrice + itemTotalPrice).toFixed(2):restPrice));
      }else{
        //变更后为：全选
        checkNum = isCheck==0?checkNum+1:checkNum;
        totalPrice = parseFloat(isCheck==0?(totalPrice + itemTotalPrice).toFixed(2):totalPrice);
        restPrice = parseFloat(totalPrice>30?0:(isCheck==0?(restPrice - itemTotalPrice).toFixed(2):restPrice));
        isDelete = true;
      }
      item.is_check=isCheck==0?1:0;
      
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
          that.setData({
            shoppingCar:list,
            totalPrice:totalPrice.toFixed(2),
            restPrice:restPrice.toFixed(2),
            checkNum:checkNum,
            selectedAll:!selectedAll,
            isDelete:isDelete
          })
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },fail(res){
        wx.showToast({
          title: res.data.msg
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
              var item = list[idx];
              if(item.is_check==1){
                ids += item.id+',';
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
                  that.onLoad();
                }else{
                  wx.showToast({
                    title: res.data.msg
                  })
                }
              },fail(res){
                wx.showToast({
                  title: res.data.msg
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
      for(var idx in list){
        var item = list[idx];
        if(item.is_check==1){
          var detail={};
          detail.sId=item.s_id;
          detail.paymentPrice=item.totalPrice;
          detail.orderNum=item.s_num
          detailList[detailList.length]=detail;
        }
      }
      var json = JSON.stringify(detailList);
      var postage = 1;
      if(restPrice==0 || restPrice==30){
        postage = 0;
      }

      wx.navigateTo({
      url: 'payment/payment?json='+json+'&postage='+postage
    })
    }
  }
})

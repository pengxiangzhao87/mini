// pages/my/order/detail/detail.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    detailList:[],
    info:{},
    goodsPrice:0,
    oid:0,
    countDown:'',
    hideFlag: true,//true-隐藏  false-显示
    animationData: {},
    status:1,
    urls:[],
    hideExtra:true
  },
  onLoad:function(e){
    var baseUrl = app.globalData.baseUrl;
    this.setData({
      baseUrl:baseUrl,
      oid:e.oid
    }) 
  },
  onShow(){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.oId=that.data.oid;
    wx.request({
      url: baseUrl+"order/queryOrderDetail",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var detailList = res.data.data.detailList;
          var urls = [];
          var hideExtra = true;
          for(var idx in detailList){
            var goods = detailList[idx].goods;
            for(var index in goods){
              if(goods[index].extra_pay_status==2 && goods[index].chargeback_status==undefined){
                hideExtra = false;
              }
              var imgUrlList = goods[index].extra_img_url;
              if(imgUrlList!=''){
                var imgList = {};
                imgList.id=goods[index].id;
                imgList.urlList=imgUrlList;
                urls.push(imgList);
              }
              var hidMsg = true;
              if(goods[index].is_extra==2 && goods[index].extra_pay_status!=undefined){
                hidMsg = false;
              }else if(goods[index].is_extra==1 && goods[index].extra_back_status==2){
                hidMsg = false;
              }
              goods[index].hidMsg = hidMsg;
            }
          }
          var info = res.data.data.info;
          that.setData({
            detailList:detailList,
            info:info,
            status:info.order_status,
            goodsPrice:(info.total_price).toFixed(2),
            urls:urls,
            hideExtra:hideExtra
          })
          if(info.order_status==5){
            that.countDown();
          }
        }
      }
    })
  },
  //倒计时
  countDown:function(){
    var that = this;
    var info = that.data.info;
    var orderTime = info.order_time;
    var now = Date.parse(new Date());//现在时间（时间戳）
    var system = wx.getSystemInfoSync()
    if(system.platform=='ios'){
      orderTime = orderTime.replace(/\-/g,'/');
    }
    var start = Date.parse(new Date(orderTime));//现在时间（时间戳）
    var value = (now-start)/1000;
    var min = parseInt((1800-value) % (60 * 60 * 24) % 3600 / 60);
    var sec = parseInt((1800-value) % (60 * 60 * 24) % 3600 % 60);
    if(sec>=0 && sec<10){
      sec = '0'+sec;
    }
    that.setData({
      countDown: min+':'+sec
    })
    this.timer = setInterval(calculate,1000);
    function calculate(){
      var now = Date.parse(new Date());//现在时间（时间戳）
      var value = (now-start)/1000;
      if(value>=1800){

        var baseUrl = that.data.baseUrl;
        var paras={};
        paras.oId=that.data.oid;
        paras.outRradeNo=info.out_trade_no;
        wx.request({
          url: baseUrl+"mini/closeOrder",
          method: 'get',
          data: paras,
          success(res) {
            if(res.data.code==200){
              wx.showModal({
                content: '订单超时，已自动取消',
                showCancel:false,
                success (res) {
                  if (res.confirm) {
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                }
              })
            }
          }
        })
        clearInterval(that.timer);
      }else{
        var min = parseInt((1800-value) % (60 * 60 * 24) % 3600 / 60);
        var sec = parseInt((1800-value) % (60 * 60 * 24) % 3600 % 60);
        if(sec>=0 && sec<10){
          sec = '0'+sec;
        }
        that.setData({
          countDown: min+':'+sec
        })
      }
    }
    
  },
  //退款
  refund:function(e){
    var id = e.currentTarget.dataset.id;
    var that = this;
    var status = e.currentTarget.dataset.status;
    if(status!=undefined){
      return;
    }
    var lastTime = that.data.info.last_time;
    if(lastTime!=undefined){
      var system = wx.getSystemInfoSync()
      if(system.platform=='ios'){
        lastTime = lastTime.replace(/\-/g,'/');
      }
      var limitTime = new Date(lastTime).getTime()+24*60*60*1000;
      if(new Date().getTime()>limitTime){
        wx.showModal({
          content: '收到商品24小时后，不受理退款',
          showCancel:false
        })
        return;
      }
    }
    wx.showModal({
      title: '提示',
      content: '确定申请退款吗？',
      success: function (sm) {
        if (sm.confirm) {
          var baseUrl = app.globalData.baseUrl;
          var paras={};
          paras.id=id;
          wx.request({
            url: baseUrl+"order/applyForRefundDetail",
            method: 'get',
            data: paras,
            success(res) {
              if(res.data.code==200){
                if(res.data.msg=='1'){
                  wx.showModal({
                    content: '配送中，无法申请退款',
                    showCancel:false
                  })
                }else{
                  that.onShow();
                }
              }
            }
          })
        }
      }
    })
    
  },

  copy:function(e){
    var oid = e.currentTarget.dataset.oid+'';
    wx.setClipboardData({
      data: oid,
      success (res) {}
    })
  },
  continuePayment:function(e){
    var that = this;
    wx.getSetting({
      withSubscriptions: true,
      complete(res){
        if(typeof(res.subscriptionsSetting.itemSettings)=='object' ){
           that.toContinuePayment(that,e);
        }else{
          wx.requestSubscribeMessage({
            tmplIds: ['c-wwagnYAUYK0dj5QeEjvT64J_P39vNTnXiHs3EXVgA','jq5UENIsQBT7dg8AwBj2MVd7GJpcEl8oQm7ztx_FPDA','xq__fUa5dSTSkOautbRcm9R9Y9ynSOeD4Ooh8roxctc'],
            complete (res) { 
              that.toContinuePayment(that,e);
            }
          })
        }
      }
    })
  },
  //继续支付
  toContinuePayment:function(that,e){
    wx.showLoading({
      title: '发起支付...',
    })
    var oid = e.currentTarget.dataset.oid;
    var baseUrl = that.data.baseUrl;
    var param = {};
    param.oId=oid;
    param.token=wx.getStorageSync('token');
    wx.request({
      url: baseUrl+"mini/continuePayment",
      method: 'get',
      data: param,
      success(res) {
        if(res.data.code==200){
          var data = res.data.data;
          //支付
          wx.requestPayment({
            'timeStamp':data.timeStamp,
            'nonceStr': data.nonceStr,
            'package': data.package,
            'signType': 'MD5',
            'paySign': data.paySign,
            success (res) {
              var param = {};
              param.oId = oid;
              param.type = 1;
              param.token = wx.getStorageSync('token');
              //查询是否支付
              wx.request({
                url: baseUrl+"mini/queryPayOrder",
                method: 'get',
                data: param,
                success(res) {
                  wx.hideLoading();
                  var result = res.data.msg;
                  wx.showModal({
                    content: result,
                    showCancel:false
                  })
                  that.onShow();
                },
                fail(res){
                  wx.hideLoading()
                  wx.showModal({
                    content: '支付中',
                    showCancel:false
                  })
                  that.onShow();
                }
              })
            
            },fail (res) {
              wx.hideLoading();
              wx.showModal({
                content: '支付失败，请重新支付',
                showCancel:false
              })
            }
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
  extraPayment:function(){
    var that = this;
    wx.getSetting({
      withSubscriptions: true,
      complete(res){
        if(typeof(res.subscriptionsSetting.itemSettings)=='object' ){
           that.toExtraPayment(that);
        }else{
          wx.requestSubscribeMessage({
            tmplIds: ['c-wwagnYAUYK0dj5QeEjvT64J_P39vNTnXiHs3EXVgA','jq5UENIsQBT7dg8AwBj2MVd7GJpcEl8oQm7ztx_FPDA','xq__fUa5dSTSkOautbRcm9R9Y9ynSOeD4Ooh8roxctc'],
            complete (res) { 
              that.toExtraPayment(that);
            }
          })
        }
      }
    })
  },
  //二次支付
  toExtraPayment:function(that){
    wx.showLoading({
      title: '发起支付...',
    })
    var info = that.data.info;
    var baseUrl = that.data.baseUrl;
    var param = {};
    param.oId = info.o_id;
    param.token = wx.getStorageSync('token');
    param.totalPrice = info.extraPrice;
    wx.request({
      url: baseUrl+"mini/extraPayment",
      method: 'get',
      data: param,
      success(res) {
        if(res.data.code==200){
          wx.hideLoading();
          var data = res.data.data;
          //支付
          wx.requestPayment({
            'timeStamp':data.timeStamp,
            'nonceStr': data.nonceStr,
            'package': data.package,
            'signType': 'MD5',
            'paySign': data.paySign,
            success (res) {
              //查询是否支付
              var param = {};
              param.oId = info.o_id;
              param.type = 2;
              param.token = wx.getStorageSync('token');
              wx.request({
                url: baseUrl+"mini/queryPayOrder",
                method: 'get',
                data: param,
                success(res) {
                  var result = res.data.msg;
                  wx.showModal({
                    content: result,
                    showCancel:false
                  })
                  that.onShow();
                },
                fail(res){
                  wx.hideLoading()
                  wx.showModal({
                    content: '支付中',
                    showCancel:false
                  })
                  that.onShow();
                }
              })
            
            },fail (res) {
              wx.hideLoading();
              wx.showModal({
                content: '支付失败，请重新支付',
                showCancel:false
              })
            }
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
  enlargement:function(e){
    var id = e.currentTarget.dataset.id;
    var pic = e.currentTarget.dataset.pic;
    var that = this;
    var urls = that.data.urls;
    var baseUrl = that.data.baseUrl;
    var preUrl = baseUrl+'upload/';
    var urlList = [];
    for(var idx in urls){
      var item = urls[idx];
      if(item.id==id){
        for(var index in item.urlList){
          urlList.push(preUrl+item.urlList[index]);
        }
       
      }
    }
    wx.previewImage({
      current: preUrl+pic, // 当前显示图片的http链接
      urls: urlList // 需要预览的图片http链接列表
    })
  },
  //取消订单
  closeOrder:function(e){
    var oid = e.currentTarget.dataset.oid;
    var tradeno = e.currentTarget.dataset.tradeno;
    var that = this;
    var baseUrl = that.data.baseUrl;
    wx.showModal({
      title: '提示',
      content: '确定取消订单吗？',
      success: function (sm) {
        if(sm.cancel){
          return;
        }
        var param = {};
        param.oId=oid;
        param.outRradeNo=tradeno;
        wx.request({
          url: baseUrl+"mini/closeOrder",
          method: 'get',
          data: param,
          success(res) {
            if(res.data.code==200){
              wx.showModal({
                content: '取消成功',
                showCancel:false,
                success (res) {
                  if (res.confirm) {
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                }
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
  errorPic:function(e){
    var idx= e.target.dataset.idx; //获取循环的下标
    var idxx= e.target.dataset.idxx; //获取循环的下标
    var item="detailList["+idxx+"].goods["+idx+"].imgUrl" //commodity为数据源，对象数组
    var detailList = {};
    detailList[item]='/image/moren.png';
    this.setData(detailList);
  },
  errorExtraPic:function(e){
    var idx= e.target.dataset.idx; //获取循环的下标
    var idxx= e.target.dataset.idxx; //获取循环的下标
    var index= e.target.dataset.index; //获取循环的下标
    var item="detailList["+idxx+"].goods["+idx+"].extra_img_url["+index+"]" //commodity为数据源，对象数组
    var detailList = {};
    detailList[item]='/image/moren.png';
    this.setData(detailList);
  }
})

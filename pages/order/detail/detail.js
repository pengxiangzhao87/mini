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
    urls:[]
  },
  onUnload:function(){
    clearInterval(this.timer);
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
          for(var idx in detailList){
            var goods = detailList[idx].goods;
            for(var index in goods){
              var imgUrlList = goods[index].extra_img_url
              if(imgUrlList!=''){
                var imgList = {};
                imgList.id=goods[index].id;
                imgList.urlList=imgUrlList;
                urls.push(imgList);
              }
            }
          }
          var info = res.data.data.info;
          that.setData({
            detailList:detailList,
            info:info,
            status:info.order_status,
            goodsPrice:(info.total_price).toFixed(2),
            urls:urls
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
              wx.showToast({
                icon:'none',
                title: '订单超时，已自动取消',
                success:function(){
                  setTimeout(function () {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 1500);
                }
              })
            }
          }
        })
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
    var orderStatus = that.data.info.order_status;
    var status = e.currentTarget.dataset.status;
    if(orderStatus==2){
      wx.showToast({
        icon:'none',
        title: '配送中，无法申请退款',
        duration:3000
      })
      return;
    }
    if(orderStatus==3){
      var lastTime = that.data.info.last_time;
      var system = wx.getSystemInfoSync()
      if(system.platform=='ios'){
        lastTime = lastTime.replace(/\-/g,'/');
      }
      var limitTime = new Date(lastTime).getTime()+24*60*60*1000;
      if(new Date().getTime()>limitTime){
        wx.showToast({
          icon:'none',
          title: '收到商品24小时后，不受理退款',
          duration:3000
        })
        return;
      }
    }
    if(status==3){
      wx.showModal({
        title: '提示',
        content: '确定申请退款吗？',
        success: function (sm) {
          if (sm.confirm) {
            var baseUrl = app.globalData.baseUrl;
            var paras={};
            paras.ids=id;
            wx.request({
              url: baseUrl+"order/applyForRefundDetail",
              method: 'get',
              data: paras,
              success(res) {
                if(res.data.code==200){
                  that.onShow();
                }
              }
            })
          }
        }
      })
    }else if(status==1){
      wx.showToast({
        icon:'none',
        title: '待商家处理',
        duration:1500
      })
      return;
    } 
  },

  copy:function(e){
    var oid = e.currentTarget.dataset.oid+'';
    wx.setClipboardData({
      data: oid,
      success (res) {}
    })
  },
  //继续支付
  continuePayment:function(e){
    wx.showLoading({
      title: '发起支付',
    })
    var oid = e.currentTarget.dataset.oid;
    var that = this;
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
          wx.hideLoading({
            complete: (res) => {},
          })
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
                  var result = res.data.msg;
                  wx.showToast({
                    icon:"none",
                    title: result,
                     duration:1500
                  })
                  that.onShow();
                },
                fail(res){
                  wx.showToast({
                    icon:'none',
                    title: '服务器异常'
                  })
                }
              })
            
            },fail (res) {
              wx.showToast({
                icon:"none",
                title: '支付失败，请重新支付',
                duration:1500,
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
  //二次支付
  extraPayment:function(){
    wx.showLoading({
      title: '发起支付',
    })
    var that = this;
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
          wx.hideLoading({
            complete: (res) => {},
          })
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
                  wx.showToast({
                    icon:"none",
                    title: result,
                      duration:1500
                  })
                  that.onShow();
                },
                fail(res){
                  wx.showToast({
                    icon:'none',
                    title: '服务器异常'
                  })
                }
              })
            
            },fail (res) {
              wx.showToast({
                icon:"none",
                title: '支付失败，请重新支付',
                duration:1500,
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
              wx.showToast({
                icon:'none',
                title: '取消成功',
                success:function(){
                  setTimeout(function () {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 1000);
                }
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

// pages/my/order/detail/detail.js
var app = getApp();
Page({
  data: {
    baseUrl:'',
    detailList:[],
    info:{},
    deal:[],
    goodsPrice:0,
    oid:0,
    countDown:'',
    hideFlag: true,//true-隐藏  false-显示
    animationData: {},
    status:1,
    method:1,
    urls:[]
  },
  onUnload:function(){
    clearInterval(this.timer);
    var pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    var prevPage = pages[ pages.length - 2 ];  
    //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      back:true
    })
  },
  onLoad:function(e){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    var paras={};
    paras.oId=e==undefined?that.data.oid:e.oid;
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
            deal:res.data.data.deal,
            status:info.order_status,
            goodsPrice:(info.total_price).toFixed(2),
            oid:e==undefined?that.data.oid:e.oid,
            baseUrl:app.globalData.baseUrl,
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
    var min = '0'+parseInt((300-value) % (60 * 60 * 24) % 3600 / 60);
    var sec = parseInt((300-value) % (60 * 60 * 24) % 3600 % 60);
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
      if(value>=300){
        clearInterval(this.timer);
        var baseUrl = that.data.baseUrl;
        var paras={};
        paras.oId=that.data.oid;
        wx.request({
          url: baseUrl+"order/closeOrder",
          method: 'get',
          data: paras,
          success(res) {
            if(res.data.code==200){
              wx.showToast({
                icon:'none',
                title: '订单超时，已自动取消',
                success:function(){
                  var pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
                  var prevPage = pages[ pages.length - 2 ];  
                  //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
                  prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                    back:true
                  })
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
        var min = '0'+parseInt((300-value) % (60 * 60 * 24) % 3600 / 60);
        var sec = parseInt((300-value) % (60 * 60 * 24) % 3600 % 60);
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
                  that.onLoad();
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
  
  // 显示遮罩层
  showModal: function () {
    var that = this;
    that.setData({
      hideFlag: false,
    })
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间
      timingFunction: 'ease',//动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    })
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      that.slideIn();//调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100)
  },
 
  // 隐藏遮罩层
  hideModal:function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间 默认400ms
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown();//调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        hideFlag: true
      })
      clearTimeout(time1);
      time1 = null;
    }, 220)//先执行下滑动画，再隐藏模块
    
  },
  //动画 -- 滑入
  slideIn: function () {
    this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export()
    })
  },
  //动画 -- 滑出
  slideDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  chechMethod:function(e){
    var method = e.currentTarget.dataset.method;
    this.setData({
      method:method
    })
  },
  copy:function(e){
    var oid = e.currentTarget.dataset.oid+'';
    wx.setClipboardData({
      data: oid,
      success (res) {}
    })
  },
  //支付订单
  payment:function(){
    var that = this;
    var method = that.data.method;
    var info = that.data.info;
    if(method==3 && (info.post_cost==0?info.total_price:info.total_price+4)>info.accountPrice){
      return;
    }else{
      var baseUrl = that.data.baseUrl;
      var orderBasic = {};
      orderBasic.oId=info.o_id
      orderBasic.paymentChannel=method;
      orderBasic.uId=4;
      orderBasic.totalPrice=info.total_price;
      wx.request({
        url: baseUrl+"order/payment",
        method: 'post',
        data: orderBasic,
        success(res) {
          if(res.data.code==200){
            that.hideModal();
            wx.showToast({
              title: '支付成功',
              success:function(){ }
            })
            that.onLoad();
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
  },
  //二次支付
  extraPayment:function(){
    var that = this;
    var method = that.data.method;
    var info = that.data.info;
    if(method==3 && info.extraPrice>info.accountPrice){
      return;
    }else{
      var baseUrl = that.data.baseUrl;
      var orderBasic = {};
      orderBasic.oId = info.o_id
      orderBasic.uid = 4;
      orderBasic.extra_payment = info.extraPrice;
      orderBasic.extra_status=1;
      orderBasic.extra_channel=method;
      wx.request({
        url: baseUrl+"order/extraOrder",
        method: 'post',
        data: orderBasic,
        success(res) {
          if(res.data.code==200){
            that.hideModal();
            wx.showToast({
              title: '支付成功',
              success:function(){ }
            })
            that.onLoad();
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
  closeOrder:function(){
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
        param.oId=that.data.oid;
        wx.request({
          url: baseUrl+"order/closeOrder",
          method: 'get',
          data: param,
          success(res) {
            if(res.data.code==200){
              wx.showToast({
                icon:'none',
                title: '取消成功',
                success:function(){
                  var pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
                  var prevPage = pages[ pages.length - 2 ];  
                  //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
                  var payList = prevPage.data.payList;
                  var result = {};
                  var index = 0;
                  for(var idx in payList){
                    var item = payList[idx];
                    if(item.o_id==that.data.oid){
                      result = item;
                      index = idx;
                      break;
                    }
                  }
                  payList.splice(index,1);
                  var allList = prevPage.data.allList;
                  if(allList.length>0){
                    var indexx = 0
                    for(var idx in allList){
                      var item = payList[idx];
                      if(item.o_id==that.data.oid){
                        indexx = idx;
                        break;
                      }
                    }
                    allList.splice(indexx,1);
                    allList.reverse();
                    allList.push(result);
                    allList.reverse();
                    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                      payList:payList,
                      allList:allList
                    })
                  }else{
                    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                      payList:payList
                    })
                  }
                  setTimeout(function () {
                    clearInterval(this.timer);
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
    
  }
})

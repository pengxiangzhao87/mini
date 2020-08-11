// pages/commodity/detail/detail.js
var app = getApp();
Page({
  data: {
    disabled:false,
    baseUrl:"",
    detail:{},
    sid:0,
    shareUrl:'',
    hideFlag: true,
    animationData: {},
  },
  onLoad:function(e) {
    var baseUrl = app.globalData.baseUrl;
    this.setData({
      baseUrl:baseUrl,
      sid:e.sid
    })
  },
  onShow:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var sId = that.data.sid;
    var data={};
    data.sId=sId;
    data.userId=4;
    wx.request({
      url: baseUrl+"commodity/queryCollage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var result = res.data.data;
          var urlList=[];
          if(result.s_address_video!='' && result.s_address_video!=undefined){
            urlList.push(result.s_address_video);
            var imgList = result.s_address_img.split('~');
            urlList = urlList.concat(imgList);
            result.isVideo=1;
          }else{
            urlList= result.s_address_img.split('~');
            result.isVideo=0;
          }
          result.urlList=urlList;
          var disabled = false;
          if(result.init_unit==0 && result.init_num<=50 || result.init_unit==1 && result.init_num==1){
            disabled = true;
          }
          var sum = result.init_unit==0?result.init_num/50:result.init_num;
          result.totalPrice = (result.price_unit * sum).toFixed(2);
          that.setData({
            detail:result,
            disabled:disabled,
            shareUrl:baseUrl+'upload/'+result.s_address_img.split('~')[0]
          })
        }else{
          wx.showToast({
            title: "服务器异常"
          })
        }
      },
      fail(res) {
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  subtract:function(){
    var that = this;
    var detail = that.data.detail;
    if(detail.init_unit==0 && detail.init_num<=50 || detail.init_unit==1 && detail.init_num==1){
      return;
    }
    var num = 0;
    if(detail.init_unit==0){
      num = detail.init_num-50;
    }else{
      num = detail.init_num-1;
    }
    detail.init_num = num;
    var sum = detail.init_unit==0?num/50:num;
    detail.totalPrice = (detail.price_unit * sum).toFixed(2);
    var disabled = false;
    if(detail.init_unit==0 && num<=50 || detail.init_unit==1 && num==1){
      disabled = true;
    }
    that.setData({
      detail:detail,
      disabled:disabled
    })
  },
  add:function(){
    var that = this;
    var detail = that.data.detail;
    var num = 0;
    if(detail.init_unit==0){
      num = detail.init_num+50;
    }else{
      num = detail.init_num+1;
    }
    detail.init_num = num;
    var sum = detail.init_unit==0?num/50:num;
    detail.totalPrice = (detail.price_unit * sum).toFixed(2);
    that.setData({
      detail:detail,
      disabled:false
    })
  },
  //调到购物车
  toShoppingCar:function(){
    wx.switchTab({
      url: '/pages/shoppingCar/shoppingCar'
    })
  },
  //添加到购物车
  addShoppingCar:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var detail = that.data.detail;
    var shoppingInfo = {};
    shoppingInfo.uId=4;
    shoppingInfo.sId=detail.s_id;
    shoppingInfo.sNum=detail.init_num;
    var json = JSON.stringify(shoppingInfo);
    wx.request({
      url: baseUrl+"shoppingCart/addShoppingCart",
      method: 'post',
      data: json,
      success(res) {
        console.info(res)
        if(res.data.code==200){
          wx.showToast({
            title: '添加成功'
          })
          that.onShow();
        }else{
          wx.showToast({
            title: "服务器异常"
          })
        }
      },
      fail(res) {
        wx.showToast({
          icon:'none',
          title: '服务器异常'
        })
      }
    })
  },
  toShare:function(){
    this.showModal();
  },
  // 显示遮罩层
  showModal:function () {
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
  onShareAppMessage: (e) => {
    // if (res.from === 'button') {
    //   console.log("来自页面内转发按钮");
    //   console.log(res.target);
    // }
    // else {
    //   console.log("来自右上角转发菜单")
    // }
    var sid = e.target.dataset.id;
    var name = '[好友推荐] '+e.target.dataset.name;
    var img = e.target.dataset.img;
    return {
      title: name,
      imageUrl:img,
      path: '/pages/commodity/detail/detail?sid='+sid,
      success: (res) => {},
      fail: (res) => {}
    }
  },
  shareToCircle:function(){
    
  }
   

})

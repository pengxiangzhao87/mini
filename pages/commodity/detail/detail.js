// pages/commodity/detail/detail.js
var util= require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
    disabled:false,
    baseUrl:"",
    detail:{},
    sid:0,
    shareUrl:'',
    hideFlag: true,
    hideShareFlag:true,
    animationData: {},
    qrPic:'qr_user.jpg',
    fxBg:'fx_bg.png',
    avatarUrl:'',
    isPhone:1
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
    if(!wx.getStorageSync('uId')){
      app.wxGetOpenID().then(function(){
        that.showData(that);
      })
    }else{
      that.showData(that);
    }
  },
  showData(that){
    var baseUrl = that.data.baseUrl;
    var sId = that.data.sid;
    var data={};
    data.sId=sId;
    data.userId=wx.getStorageSync('uId');
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
          if(result.s_desc!='' && result.s_desc!=undefined){
            result.descList = result.s_desc.split('~');
          }
          if(result.sales_desc!='' && result.sales_desc!=undefined){
            result.salesList = result.sales_desc.split('~');
          }
          var disabled = false;
          if(result.init_unit==0 && result.init_num<=50 || result.init_unit==1 && result.init_num==1){
            disabled = true;
          }
          var sum = result.init_unit==0?result.init_num/50:result.init_num;
          result.totalPrice = (result.price_unit * sum).toFixed(2);
          that.setData({
            detail:result,
            disabled:disabled,
            shareUrl:baseUrl+'upload/'+result.s_address_img.split('~')[0],
            isPhone:wx.getStorageSync('isPhone')
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
    wx.getSetting({
      success: (res) => {
        if(res.authSetting['scope.userInfo']){
          var paras={};
          paras.uId=wx.getStorageSync('uId');
          wx.request({
            url: baseUrl+"user/queryMyInfo",
            method: 'get',
            data: paras,
            success(res) {
              if(res.data.code==200){
                var myInfo = res.data.data;
                that.setData({
                  avatarUrl:myInfo.u_avatar_url
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
  //手机号授权
  getPhoneNumber:function(e){
    if(e.detail.iv==undefined){
      return;
    }
    var that = this;
    var baseUrl = that.data.baseUrl;
    var data={};
    data.encryptedData = e.detail.encryptedData;
    data.iv = e.detail.iv;
    data.token=wx.getStorageSync('token');
    util.getPhone(baseUrl,data,that,app);
  },
  //添加到购物车
  addShoppingCar:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var detail = that.data.detail;
    var shoppingInfo = {};
    shoppingInfo.uId=wx.getStorageSync('uId');
    shoppingInfo.sId=detail.s_id;
    shoppingInfo.sNum=detail.init_num;
    var json = JSON.stringify(shoppingInfo);
    wx.request({
      url: baseUrl+"shoppingCart/addShoppingCart",
      method: 'post',
      data: json,
      success(res) {
        if(res.data.code==200){
          wx.showToast({
            title: '添加成功'
          })
          that.showData(that);
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
  toShare:function(e){
    var that = this;
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
          wx.showToast({
            icon:'none',
            title: '授权成功',
            duration:1500
          })
          that.setData({
            avatarUrl:res.data.msg
          })
          that.showModal();
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
  // 显示遮罩层
  showShareModal:function () {
    var that = this;
    that.slideDown();//调用动画--滑出
    that.setData({
      hideShareFlag: false,
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
        hideFlag: true,
        hideShareFlag:true
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
  disableRoll:function(){},
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
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success () {
              that.producePic();
              that.showShareModal();
            }
          })
        }else{
          that.producePic();
          that.showShareModal();
        }
      }
    })
  },
  producePic:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var detail = that.data.detail;
    var qrPic = baseUrl + 'upload/' + that.data.qrPic;
    var fxBg = baseUrl + 'upload/' + that.data.fxBg;
    var avatarUrl = baseUrl + 'upload/' + that.data.avatarUrl;
    var shareUrl = that.data.shareUrl;
    Promise.all([
      wx.getImageInfo({
        src: fxBg
      }),
      wx.getImageInfo({
        src: shareUrl
      }),
      wx.getImageInfo({
          src: qrPic
      }),
      wx.getImageInfo({
        src: avatarUrl
      })
    ]).then(res => {
        const ctx = wx.createCanvasContext('shareCanvas')
        var width = res[1].width;
        var height = res[1].height;
        var ww = 200;
        var hh = 200;
        var yy = 75;
        if(width>height){
          hh =  ww*height/width;
          yy = 75+(200-hh)/2;
        }

        // 底图
        ctx.drawImage(res[0].path, 0, 0, 246, 400);
        
        //头像
        ctx.drawImage(res[3].path, 35, 35, 30, 30);

        //图片
        ctx.drawImage(res[1].path, 25, yy , ww, hh);

        //QR
        ctx.drawImage(res[2].path, 135, 285, 80, 80);

        //标题
        ctx.setFontSize(10)         
        ctx.fillText('“这里有好物，快来看”', 80, 53)
        
        //价格
        ctx.setFontSize(16)        
        ctx.setFillStyle('red')
        ctx.fillText(detail.price, 35, 300)
        //单位
        ctx.setFontSize(14)        
        ctx.setFillStyle('#666666')
        ctx.fillText(detail.unit, 35+(detail.price.length*16), 300)
 
        //名称
        ctx.setFontSize(12);
        ctx.setFillStyle('black')    
        var name = detail.s_name;    
        var len = name.length;
        ctx.fillText(name.substring(0,8), 35,333);
        if(len>8){
          if(len>16){
            name = name.substring(8,15)+'...';
          }else{
            name = name.substring(8,len);
          }
          ctx.fillText(name, 35, 350)
        }
      
        ctx.stroke()
        ctx.draw()

    })
  },
  saveToPhoto:function(){
    wx.showLoading({
      title: '保存中...',
    })
    wx.canvasToTempFilePath({
      canvasId: 'shareCanvas'
    }, this).then(res => {
        return wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath
        })
    }).then(res => {
        wx.showToast({
            icon:'none',
            title: '已保存到相册',
            duration:2000
        })
    })
  },
  errorPic:function(e){
    var idx= e.target.dataset.idx; //获取循环的下标
    var item="detail.urlList["+idx+"]" //commodity为数据源，对象数组
    var detail = {};
    detail[item]='/image/moren.png';
    this.setData(detail);
  }

})

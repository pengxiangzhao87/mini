// pages/commodity/detail/detail.js
var app = getApp();
Page({
  data: {
    disabled:false,
    baseUrl:"",
    detail:{},
    sid:0,
    shareUrl:''
  },
  onUnload:function(){
    var pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    var prevPage = pages[ pages.length - 2 ];  
    //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      back:true
    })
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
          that.cropImg(that,baseUrl+'upload/1590560923(1).jpg')
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
            disabled:disabled
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
  onShareAppMessage: (e) => {
    // if (res.from === 'button') {
    //   console.log("来自页面内转发按钮");
    //   console.log(res.target);
    // }
    // else {
    //   console.log("来自右上角转发菜单")
    // }
    var sid = e.target.dataset.id;
    var img = e.target.dataset.img;
    console.info(img)
     

    return {
      title: '食朝夕推荐',
      path: '/pages/commodity/detail/detail?sid='+sid,
    
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  cropImg:function(that,url){
    wx.getImageInfo({
      src: url,
      success: function(ret) {
        console.info('ret',ret)
        var orWidth = ret.width
        var orHeight = ret.height     
        var ctx = wx.createCanvasContext('myShare')
        ctx.drawImage(ret.path, 0, 0, orWidth, orHeight);     
        ctx.draw(false, function(res) {     
          console.info(res)
          wx.canvasToTempFilePath({      
            canvasId: 'share',
            fileType: 'jpeg',
            success: function(resl) {
              var shareUrl = resl.tempFilePath
              console.info(resl)
              that.setData({
                shareUrl: shareUrl
              })
            },
            fail: function(res) {console.info(res)}
          })
        })
      }
    })
  }

})

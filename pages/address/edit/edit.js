// pages/address/edit/edit.js
var app = getApp();
Page({
  data: {
    address:{},
    baseUrl:'',
    //0:新增，1:修改
    flag:0
  },

  onLoad:function(e) {
    var flag = e.flag;
    var that =  this;
    var baseUrl = app.globalData.baseUrl;
    that.setData({
      address:JSON.parse(e.json),
      baseUrl:baseUrl,
      flag:flag
    })
  },
  //保存
  save:function(e){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var address = e.detail.value;
    if(that.data.flag==1){
      address.aId=that.data.address.aId;
    }
    var json = JSON.stringify(address);
    wx.request({
      url: baseUrl+"user/saveAddress",
      method: 'post',
      data: json,
      success(res) {
        if(res.data.code==200){
          wx.showToast({
            title: '保存成功',
            success:function(){
              var pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
              var prevPage = pages[ pages.length - 2 ];  
              //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
              prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                nextFlag:1
              })
              //延时2秒
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 1500);
            }
          })
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },fail(res){
        wx.showToast({
          title: 'server fail!'
        })
      }
    })

  }
})

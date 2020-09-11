// pages/address/edit/edit.js
var app = getApp();
Page({
  data: {
    address:{},
    baseUrl:'',
    //0:新增，1:修改
    flag:false
  },

  onLoad:function(e) {
    var flag = e.flag==1?true:false;
    var text = e.flag==1?'编辑地址':'新增地址';
    wx.setNavigationBarTitle({
      title: text,
    })
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
    if(that.data.flag){
      address.aId=that.data.address.aId;
    }
    var json = JSON.stringify(address);
    wx.request({
      url: baseUrl+"user/saveAddress",
      method: 'post',
      data: json,
      success(res) {
        if(res.data.code==200){
          wx.navigateBack({
            delta: 1
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
  focusValue:function(){
    this.setData({
      flag:true
    })
  },
  changeValue:function(e){
    var that = this;
    if(e.detail.value==''){
      that.setData({
        flag:false
      })
    }else{
      that.setData({
        flag:true
      })
    }
  }
})

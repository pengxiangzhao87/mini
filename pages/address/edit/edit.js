// pages/address/edit/edit.js
const QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var app = getApp();
var qqMap = new QQMapWX({
  key: '5ZNBZ-VAPWP-THWD3-LBXL6-UK6GQ-UZBGN' // 必填
});
Page({
  data: {
    address:{},
    baseUrl:'',
    //0:新增，1:修改
    flag:false,
    region: [],
    switch1Checked: false,
    chooseAddress: '',
    IDNo: '',
    lng: '',
    lat: '',
    isshop: true, //判断来源
    i:''
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

    if(!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(address.phone))){ 
      wx.showToast({
        icon:'none',
        title: '手机号输入有误',
      })
      return false; 
    } 
    if(that.data.flag){
      address.aId=that.data.address.aId;
    }
    address.isUsed=1;
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
  },
  toMap:function(){
    wx.navigateTo({
      url: '/pages/address/map/map'
    })
  },
  //地区选择
  bindRegionChange: function(e) {
    console.log('picker发送选择改变，携带值为', e)
    this.setData({
      region: e.detail.value
    })
    console.log(e.detail.value[0] + e.detail.value[1] + e.detail.value[2])
    qqMap.geocoder({
      address: e.detail.value[0] + e.detail.value[1] + e.detail.value[2],
      complete: (res => {
        console.log(res.result.location); //经纬度对象
        this.setData({
          lng: res.result.location.lng,
          lat: res.result.location.lat
        })
      })
    })
  },
  //移动选点
  onChangeAddress: function() {
    var _page = this;
    wx.chooseLocation({
      latitude: _page.data.lat,
      longitude: _page.data.lng,
      success: function(res) {
        _page.setData({
          chooseAddress: res.name
        });
      },
      fail: function(err) {
        console.log(err)
      }
    });
  }
})

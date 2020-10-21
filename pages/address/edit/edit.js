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
    region: []
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
    if(address.aCity==''){
      wx.showToast({
        icon:'none',
        title: '所在地区不能为空',
      })
      return false; 
    } 
    if(address.aDetail==''){
      wx.showToast({
        icon:'none',
        title: '详细地址不能为空',
      })
      return false; 
    } 
    if(that.data.flag){
      address.aId=that.data.address.aId;
    }

    qqMap.geocoder({
      address: address.aCity+address.aDetail,
      complete: (res => {
        address.latitude = res.result.location.lat;
        address.longitude = res.result.location.lng;
        var toParam = address.latitude+','+address.longitude;
        // var fromParam = wx.getStorageSync('lat')+','+wx.getStorageSync('lng');
        var fromParam = '39.889236,116.270721';
        qqMap.calculateDistance({
          //mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行），不填默认：'walking',可不填
          //from参数不填默认当前地址
          //获取表单提交的经纬度并设置from和to参数（示例为string格式）
          from: fromParam, //若起点有数据则采用起点坐标，若为空默认当前地址
          to: toParam, //终点坐标
          success: function(res) {//成功后的回调
            var distance = res.result.elements[0].distance;
            address.distance=distance;
            var json = JSON.stringify(address);
            wx.request({
              url: baseUrl+"user/saveAddress",
              method: 'post',
              data: json,
              success(res) {
                if(res.data.code==200){
                  if(address.isUsed==1){
                    wx.setStorageSync('areaFlag', res.data.data);
                  }
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
          }
        });
      })
    })
  },
  changeName(e){
    var that = this;
    var address =that.data.address;
    address.name=e.detail.value;
    that.setData({
      address:address
    })
  },
  changePhone(e){
    var that = this;
    var address =that.data.address;
    address.phone=e.detail.value;
    that.setData({
      address:address
    })
  },
  changeSwitch(e){
    var that = this;
    var address = that.data.address;
    if(e.detail.value){
      address.isUsed=1;
    }else{
      address.isUsed=0;
    }
    that.setData({
      address:address
    })
  },
  //地区选择
  bindRegionChange: function(e) {
    var that = this;
    var _address = that.data.address;
    _address.aCity = e.detail.value[0] + e.detail.value[1] + e.detail.value[2];
    that.setData({
      address:_address
    })
  },
  //移动选点
  onChangeAddress: function() {
    var _page = this;
    var address = _page.data.address;
    wx.getSetting({
      success (res) {
        if(res.authSetting["scope.userLocation"]==false){
          wx.openSetting({
            success(res) {
              if (res.authSetting["scope.userLocation"]) {
                wx.chooseLocation({
                  latitude: _page.data.lat,
                  longitude: _page.data.lng,
                  success: function(res) {
                    address.aCity=res.address+res.name;
                    _page.setData({
                      address: address
                    });
                  }
                });
              }
            }
          })
        }else{
          wx.chooseLocation({
            latitude: _page.data.lat,
            longitude: _page.data.lng,
            success: function(res) {
              address.aCity=res.address+res.name;
              _page.setData({
                address: address
              });
            }
          });
        }
      }
    })

    
    
  },
  weChat() {
    var that = this;
    wx.chooseAddress({
      success(res) {
        var address = that.data.address;
        address.name=res.userName;
        address.phone=res.telNumber;
        var aCity = res.provinceName+res.cityName+res.countyName;
        address.aCity = aCity;
        address.aDetail = res.detailInfo;
        qqMap.geocoder({
          address: aCity,
          complete: (res => {
            address.latitude = res.result.location.lat;
            address.longitude = res.result.location.lng;
            that.setData({
              address:address
            })
          })
        });
      }
    })
  },
})

// pages/homePage/foodDetail/foodDetail.js
var app = getApp();
Page({
 
  data: {
    baseUrl:'',
    detail:[],
    imgList:[],
    descList:[]
  },

  /**
   * 组件的方法列表
   */
  onLoad(e) {
    var baseUrl = app.globalData.baseUrl;
    var that = this;
 
    wx.request({
      url: baseUrl+"menu/queryFoodDetail",
      method: 'get',
      data:{'foodId':e.foodid},
      success(res) {
        var detail = res.data.data;
        var imgList = detail.f_img_adr.split('~');
        var descList = detail.f_desc_img_adr.split('~');
        console.info(detail)
        that.setData({
          baseUrl:baseUrl,
          detail:detail,
          imgList:imgList,
          descList:descList
        })
      }
    })
  },
  sub(){
    var that = this;
    var detail = that.data.detail;
    var number = detail.f_init_number;
    var price = detail.f_price*1;
    var totalPrice = detail.totalPrice*1;
    var type = detail.f_type;
    var newNumber = type==0?number-1:number-50;
    if(newNumber<=0){
      return;
    }
    detail.f_init_number = newNumber;
    detail.totalPrice = (totalPrice-price).toFixed(2);
    that.setData({
      detail:detail
    })
  },
  add(){
    var that = this;
    var detail = that.data.detail;
    var number = detail.f_init_number;
    var price = detail.f_price*1;
    var totalPrice = detail.totalPrice*1;
    var type = detail.f_type;
    var newNumber = type==0?number+1:number+50;
    detail.f_init_number = newNumber;
    detail.totalPrice = (totalPrice+price).toFixed(2);
    that.setData({
      detail:detail
    })
  },
  moreMenu(e){
    var foodid = e.currentTarget.dataset.foodid;
    wx.navigateTo({
      url: '../moreMenu/moreMenu?foodid='+foodid
    })
  },
  toMenuDetail(e){
    var menuid = e.currentTarget.dataset.menuid;
    wx.navigateTo({
      url: '../detail/detail?mid='+menuid
    })
  },
  addMenuDefaultToCart(e){
    var that = this;
    var mid = e.currentTarget.dataset.mid;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/addMenuDefaultToCart",
      method: 'get',
      data: {'menuId':mid,'uId':wx.getStorageSync('uId')},
      success(res) {
        console.info(res)
      }
    })
  },
})

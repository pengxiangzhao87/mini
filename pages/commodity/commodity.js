// pages/commodity.js
var app = getApp();
Page({
  data: {
    sName:"",    
    commodity:[],
    page:1,
    rows:10
  },
  onLoad:function(){
    var that = this;
    var data = that.data;
    var baseUrl = app.globalData.baseUrl;
    var paras = [];
    paras.page=data.page;
    paras.rows=data.rows;
    if(data.sName!=''){
      paras.sName = data.sName;
    }
    this.queryCommodity(that,paras);
  },
  //热销商品分页查询/模糊查询/类别查询
  queryCommodity:function(that,data){
    wx.request({
      url: app.globalData.baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          that.setData({
            commodity:list
          })
        }else{
          wx.showToast({
            title: res.data.msg
          })
        }
      },
      fail(res) {
        wx.showToast({
          title: "服务器异常"
        })
      }
    })
  }
})

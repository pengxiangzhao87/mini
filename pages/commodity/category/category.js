// pages/commodity/category/category.js
var app = getApp();
Page({
  data: {
    tid:null,
    commodity:[],
    category:[],
    page:1,
    rows:10,
    baseUrl:"",
    totalPage:0,
    hidden:true,
    floorstatus:true
  },

  onLoad:function(e) {
    var tid = e.tid;
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    //获取所有类别
    that.getCategory(that,baseUrl,tid);
    //获取类别下的商品
    var data = that.data;
    var paras={};
    paras.tId=tid;
    paras.userId=4
    paras.page=data.page;
    paras.rows=data.rows;
    that.getCommodity(that,baseUrl,paras);
  },
  getCategory(that,baseUrl,tid){
    wx.request({
      url: baseUrl+"commodity/queryCategoryList",
      method: 'get',
      success(res) {
        if(res.data.code==200){
          var list = res.data.data;
          for(var idx in list){
            var item = list[idx];
            if(item.tId==tid){
              item.selected = true;
            }else{
              item.selected = false;
            }
          }
          that.setData({
            baseUrl:baseUrl,
            category:list,
            tid:tid
          })
        }else{
          wx.showToast({
            title: res.data.msg
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
  getCommodity(that,baseUrl,data){
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: data,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          var totalPage = res.data.data.totalPage;
          that.setData({
            commodity:list,
            totalPage:totalPage
          })
        }else{
          wx.showToast({
            title: res.data.msg
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
  //上拉获取新数据
  onReachBottom:function(){
    var that = this;
    var baseUrl = that.data.baseUrl;
    var totalPage = that.data.totalPage;
    var rows = that.data.rows;
    var page = that.data.page+1;
    var tid = that.data.tid;
    if(totalPage>=page){
      var paras={};
      paras.page=page;
      paras.rows=rows;
      paras.userId=4;
      paras.tId=tid;
      wx.request({
        url: baseUrl+"commodity/queryCommodityByPage",
        method: 'get',
        data: paras,
        success(res) {
          if(res.data.code==200){
            var list = res.data.data.list;
            var result = that.data.commodity.concat(list);
            that.setData({
              commodity:result,
              page:page
            })
          }else{
            wx.showToast({
              title: res.data.msg
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
    }else{
      that.setData({
        hidden:false
      })
    }
  },
  //切换类别
  changeCategory:function(e){
    var tid = e.currentTarget.dataset.tid;
    var that = this;
    var data = that.data;
    var category = data.category;
    var baseUrl = data.baseUrl;
    for(var idx in category){
      var item = category[idx];
      if(item.tId==tid){
        item.selected = true;
      }else{
        item.selected = false;
      }
    }
    that.setData({
      category:category,
      tid:tid,
      page:1
    })
    var paras={};
    paras.tId=tid;
    paras.userId=4
    paras.page=1;
    paras.rows=data.rows;
    this.getCommodity(that,baseUrl,paras);
  },
  //跳转详情
  toDetail:function(e){
    var sid = e.currentTarget.dataset.sid;
    wx.navigateTo({
      url: '/pages/commodity/detail/detail?sid='+sid
    })
  },
  //加入购物车
  addCar:function(e){
    var sid = e.currentTarget.dataset.sid;
    var data={};
    data.sid=sid;
    data.uid=4;
    var json = JSON.stringify(data);
    wx.request({
      url: app.globalData.baseUrl+"shoppingCart/addShoppingCart",
      method: 'post',
      data: json,
      success(res) {
        if(res.data.code!=200){
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
  //回到顶部
  goTop:function(){
    wx.pageScrollTo({
      scrollTop:0
    })
  },
  // 获取滚动条当前位置
  onPageScroll: function (e) {
    console.info(e)
    if (e.scrollTop > 800) {
      this.setData({
        floorstatus: false
      });
    } else {
      this.setData({
        floorstatus: true
      });
    }
  }

})

// pages/commodity/search/search.js
var app = getApp();
Page({
   
  data: {
    baseUrl:"",
    sName:"",
    commodity:[],
    page:1,
    rows:10,
    totalPage:0,
    hidden:true
  },
  onLoad:function(e){
    var that = this;
    var sName = e.sName; 
    var inputName = sName.replace(/\s*/g,"");
    var baseUrl = app.globalData.baseUrl;
    that.setData({
      sName:sName,
      baseUrl:baseUrl
    })
    var paras={};
    paras.userId=4;
    paras.sName = inputName;
    paras.page=that.data.page;
    paras.rows=that.data.rows;
    paras.tId=-1;
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: paras,
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
    var page = that.data.page+1;
    var rows = that.data.rows;
    var sName = that.data.sName;
    var inputName = sName.replace(/\s*/g,"");
    var totalPage = that.data.totalPage;
    var baseUrl = that.data.baseUrl;
    if(totalPage>=page){
      var paras={};
      paras.userId=4;
      paras.sName = inputName;
      paras.page=page;
      paras.rows=rows;
      paras.tId=-1;
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
  //跳转详情
  toDetail:function(e){
    var sid = e.currentTarget.dataset.sid;
    wx.navigateTo({
      url: '../detail/detail?sid='+sid
    })
  },
  searchName:function(e){
    var that = this;
    var sName = e.detail.value;
    var inputName = sName.replace(/\s*/g,"");
    var baseUrl = app.globalData.baseUrl;
    that.setData({
      sName:sName,
      baseUrl:baseUrl
    })
    var paras={};
    paras.userId=4;
    paras.sName = inputName;
    paras.page=that.data.page;
    paras.rows=that.data.rows;
    paras.tId=-1;
    wx.request({
      url: baseUrl+"commodity/queryCommodityByPage",
      method: 'get',
      data: paras,
      success(res) {
        if(res.data.code==200){
          var list = res.data.data.list;
          var totalPage = res.data.data.totalPage;
          that.setData({
            commodity:list,
            totalPage:totalPage
          })
          if(inputName!=''){
            var searchList=app.globalData.searchList;
            var can = true;
            for(var idx in searchList){
              var item = searchList[idx];
              if(item==inputName){
                can = false;
              }
            }
            if(can){
              searchList.unshift(inputName);
              app.globalData.searchList=searchList;
            }
            
          }
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
  //禁止下拉
  onPageScroll:function(e){
    if(e.scrollTop<0){
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  }
})

// pages/homePage/detail/detail.js
var app = getApp();
Page({

  data: {
    baseUrl:'',
    mid:'',
    imgList:[],
    detail:[],
    freeList:[],
    optionList:[],
    otherOptionList:[],
    group:-1,
    foodId:'',
    allPrice:0,
    standard:0,//0:常规，1:一人食
    remark:''
  },

  /**
   * 组件的方法列表
   */
  onLoad:function(e) {
    var baseUrl = app.globalData.baseUrl;
    var that = this;
    that.setData({
      baseUrl:baseUrl,
      mid:e.mid
    })
    wx.request({
      url: baseUrl+"menu/queryMenuDetail",
      method: 'get',
      data:{'menuId':e.mid},
      success(res) {
        var allPrice = that.data.allPrice*1;
        var data = res.data.data;
        allPrice += data.mCookPrice*1;
        var imgList = data.mImgAdr.split('~');
        that.setData({
          detail:data,
          imgList:imgList
        })
        wx.request({
          url: baseUrl+"menu/queryMenuOption",
          method: 'get',
          data:{'menuId':e.mid},
          success(res) {
            var optionList = res.data.data;
            for(var idx in optionList){
              var totalPrice = optionList[idx].totalPrice*1;
              allPrice += totalPrice;
            }
            that.setData({
              optionList:optionList,
              allPrice:allPrice.toFixed(2)
            })
          }
        })
      }
    })
    wx.request({
      url: baseUrl+"menu/queryMenuFreeFood",
      method: 'get',
      data:{'menuId':e.mid},
      success(res) {
        that.setData({
          freeList:res.data.data
        })
      }
    })
    

  },
  onShow(){

  },
  otherOption(e){
    var menuId = e.currentTarget.dataset.menuid;
    var group = e.currentTarget.dataset.group;
    var foodid = e.currentTarget.dataset.foodid;
    var that =this;
    var baseUrl = that.data.baseUrl;
    var groupData = that.data.group;
    if(group!=groupData){
      wx.request({
        url: baseUrl+"menu/queryOtherOption",
        method: 'get',
        data:{'menuId':menuId,'group':group},
        success(res) {
          that.setData({
            otherOptionList:res.data.data,
            group:group,
            foodId:foodid
          })
        }
      })
    }else{
      that.setData({
        group:-1
      })
    }
    
  },
  chooseFood(e){
    var foodid = e.currentTarget.dataset.foodid;
    var menuid = e.currentTarget.dataset.menuid;
    var that = this;
    var allPrice = that.data.allPrice*1;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/queryMenuOption",
      method: 'get',
      data:{'menuId':menuid,'foodId':foodid},
      success(res) {
        var foodInfo = res.data.data[0];
        var optionList = that.data.optionList;
        for(var idx in optionList){
          var item = optionList[idx];
          if(foodInfo.m_group == item.m_group){
            var totalPrice = item.totalPrice*1;
            var newPrice = foodInfo.totalPrice*1;
            allPrice = allPrice-totalPrice + newPrice;
            optionList[idx] = foodInfo;
            break;
          }
        }
        that.setData({
          optionList:optionList,
          foodId:foodid,
          allPrice:allPrice.toFixed(2)
        })
      }
    })
  },
  toFoodDetail(e){
    var foodid = e.currentTarget.dataset.foodid;
    wx.navigateTo({
      url: '../foodDetail/foodDetail?foodid='+foodid
    })
  },
  sub(e){
    var idx = e.currentTarget.dataset.idx;
    var that = this;
    var optionList = that.data.optionList;
    var option = optionList[idx];
    var number = option.m_number;
    var type = option.f_type;
    var newNum = type==0?number-1:number-50;
    if(newNum<=0){
      return;
    }
    var price = option.f_price*1;
    var totalPrice = option.totalPrice*1
    option.totalPrice = (totalPrice-price).toFixed(2);
    option.m_number=newNum;
    optionList[idx] = option;
    var allPrice = that.data.allPrice*1;
    var newAllPrice = allPrice - price;
    that.setData({
      optionList:optionList,
      allPrice:newAllPrice.toFixed(2)
    })
  },
  add(e){
    var idx = e.currentTarget.dataset.idx;
    var that = this;
    var optionList = that.data.optionList;
    var option = optionList[idx];
    var number = option.m_number;
    var type = option.f_type;
    var price = option.f_price*1;
    var totalPrice = option.totalPrice*1;
    option.totalPrice = (totalPrice+price).toFixed(2);
    option.m_number=type==0?number+1:number+50;
    optionList[idx] = option;
    var allPrice = that.data.allPrice*1;
    var newAllPrice = allPrice + price;
    that.setData({
      optionList:optionList,
      allPrice:newAllPrice.toFixed(2)
    })
  },
  chooseStandard(e){
    var standard = e.currentTarget.dataset.standard;
    this.setData({
      standard:standard
    })
  },
  showTip(){
    wx.showModal({
      content: '选择一人食，配菜员会尽可能选择小规格的食材。产生的差价，会及时退款。',
      showCancel:false
    })
  },
  
  saveRemark(e){
    this.setData({
      remark:e.detail.value
    })
  },
  addMenuToCart(){
    var that = this;
    var detail = that.data.detail;
    var optionList = that.data.optionList;
    var remark = that.data.remark;
    var data = {};
    data.mId = detail.mId;
    data.remark = remark;
    data.uId = wx.getStorageSync('uId');
    var foodList = [];
    for(var idx in optionList){
      var item = optionList[idx];
      var food = {};
      food.foodId = item.f_id;
      food.cNumber = item.m_number;
      food.cGroup = item.m_group;
      foodList[foodList.length]=food;
    }
    data.list = foodList;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/addMenuToCart",
      method: 'post',
      data: data,
      success(res) {
        console.info(res)
      }
    })
  },
  addFoodToCart(e){
    var foodid = e.currentTarget.dataset.foodid;
    var num = e.currentTarget.dataset.num;
    var that = this;
    var data = {};
    data.foodId = foodid;
    data.cNumber = num;
    data.userId = wx.getStorageSync('uId');
    data.cType=that.data.standard;
    var baseUrl = that.data.baseUrl;
    wx.request({
      url: baseUrl+"menu/addFoodToCart",
      method: 'post',
      data: data,
      success(res) {
        console.info(res)
      }
    })
  },
})

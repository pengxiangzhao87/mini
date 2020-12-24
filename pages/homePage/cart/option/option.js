// pages/homePage/cart/option/option.js
var app = getApp();
Page({

  data: {
    baseUrl:'',
    menuInfo:{},
    group:-1,
    otherOptionList:[],
    foodid:-1,
    allPrice:0
  },

  /**
   * 组件的方法列表
   */
  onLoad(e){
    var that = this;
    var baseUrl = app.globalData.baseUrl;
    wx.request({
      url: baseUrl+"menu/queryCartMenuOption",
      method: 'get',
      data: {'cId':e.cid,'mId':e.mid},
      success(res) {
        var menuInfo = res.data.data;
        var allPrice = menuInfo.m_cook_price*1;
        for(var idx in menuInfo.optionList){
          var option = menuInfo.optionList[idx];
          allPrice += option.totalPrice*1
        }
        that.setData({
          baseUrl:baseUrl,
          menuInfo:menuInfo,
          allPrice:allPrice.toFixed(2)
        })
        wx.setNavigationBarTitle({
          title: res.data.data.m_name,
        })
      }
    })
  },
  otherOption(e){
    var menuId = e.currentTarget.dataset.menuid;
    var group = e.currentTarget.dataset.group;
    var foodid = e.currentTarget.dataset.foodid;
    var that =this;
    var baseUrl = that.data.baseUrl;
    var groupData = that.data.group;
    if(groupData!=group){
      wx.request({
        url: baseUrl+"menu/queryOtherOption",
        method: 'get',
        data:{'menuId':menuId,'group':group},
        success(res) {
          that.setData({
            otherOptionList:res.data.data,
            group:group,
            foodid:foodid
          })
        }
      })
    }else{
      that.setData({
        group:-1
      })
    }
    
  },
  sub(e){
    var idx = e.currentTarget.dataset.idx;
    var that = this;
    var menuInfo = that.data.menuInfo;
    var option = menuInfo.optionList[idx];
    var type = option.f_type;
    var num = option.c_number;
    var newNum = type==0?num-1:num-50;
    if(newNum<=0){
      return;
    }
    option.c_number = newNum;
    var price = option.f_price*1;
    var totalPrice = option.totalPrice*1;
    option.totalPrice = (totalPrice-price).toFixed(2)
    var allPrice = that.data.allPrice*1;
    that.setData({
      menuInfo:menuInfo,
      allPrice:(allPrice-price).toFixed(2)
    })
  },
  add(e){
    var idx = e.currentTarget.dataset.idx;
    var that = this;
    var menuInfo = that.data.menuInfo;
    var option = menuInfo.optionList[idx];
    var type = option.f_type;
    var num = option.c_number;
    var newNum = type==0?num+1:num+50;
    option.c_number = newNum;
    var price = option.f_price*1;
    var totalPrice = option.totalPrice*1;
    option.totalPrice = (totalPrice+price).toFixed(2)
    var allPrice = that.data.allPrice*1;
    that.setData({
      menuInfo:menuInfo,
      allPrice:(allPrice+price).toFixed(2)
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
        if(res.data.code==200){
          wx.showToast({
            icon:'none',
            title: '添加成功'
          })
        }
      }
    })
  },
  chooseStandard(e){
    var standard = e.currentTarget.dataset.standard;
    var that = this;
    var menuInfo = that.data.menuInfo;
    menuInfo.c_type=standard;
    that.setData({
      menuInfo:menuInfo
    })
  },
  chooseFood(e){
    var idx = e.currentTarget.dataset.idx;
    var group = e.currentTarget.dataset.group;
    var that = this;
    var food = that.data.otherOptionList[idx];
    var menuInfo = that.data.menuInfo;
    var optionList = menuInfo.optionList;
    var allPrice = that.data.allPrice*1;
    for(var index in optionList){
      var option = optionList[index];
      if(option.c_group==group){
        allPrice = (allPrice-option.totalPrice*1+food.totalPrice*1).toFixed(2);
        option.c_number = food.m_number;
        option.f_id = food.f_id;
        option.f_img_adr = food.f_img_adr;
        option.f_name=food.f_name;
        option.f_price=food.f_price;
        option.f_type=food.f_type;
        option.f_unit=food.f_unit;
        option.totalPrice = food.totalPrice;
        break;
      }
    }
    that.setData({
      menuInfo:menuInfo,
      allPrice:allPrice,
      foodid:food.f_id
    })
  },
  saveRemark(e){
    var that = this;
    var menuInfo = that.data.menuInfo;
    menuInfo.c_remark=e.detail.value;
    that.setData({
      menuInfo:menuInfo
    })
    
  },
  saveMenu(){
    var that = this;
    var menuInfo = that.data.menuInfo;
    var baseUrl = that.data.baseUrl;
    var menu = {};
    menu.cId = menuInfo.c_id;
    menu.cType = menuInfo.c_type;
    menu.cRemark = menuInfo.c_remark;
    var list = [];
    for(var idx in menuInfo.optionList){
      var item = menuInfo.optionList[idx];
      var detail = {};
      detail.cId = item.c_id;
      detail.foodId = item.f_id;
      detail.cNumber = item.c_number;
      list[list.length] = detail;
    }
    menu.list = list;
    wx.request({
      url: baseUrl+"menu/fineMenuCart",
      method: 'post',
      data: menu,
      success(res) {
        if(res.data.code==200){
          wx.showToast({
            icon:'none',
            title: '修改成功',
            success(){
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 1500);
            }
          })
          
        }
      }
    })
  }
})

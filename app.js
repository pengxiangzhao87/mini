//app.js
App({
  globalData:{
    baseUrl:"http://192.168.1.142:9000/CMTGP/",
    //baseUrl:"https://www.sotardust.cn/CMTGP/",
    searchList:[]
  },
  onLaunch: function () {
    var baseUrl = this.globalData.baseUrl;
    // 登录
    wx.login({
      success: res => {
        wx.request({
          url: baseUrl+"user/getOpendId",
          method: 'get',
          data: {code:res.data,type:3},
          success(res) {
            if(res.data.code==200){
              var data = res.data.data;
              wx.setStorageSync('token', data.token);
              wx.setStorageSync('isLogin', data.isLogin)
            }else{
              wx.showToast({
                title: res.data.msg
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
    })
  }
 
})
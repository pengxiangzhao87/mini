// pages/login/login.js
Page({
  data: {

  },
  onLoad:function() {

  },
  userEnter:function(){
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              console.info(res)
            }
          })
        }
      }
    })
  }
})


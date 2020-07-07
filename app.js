//app.js
App({
  globalData:{
    //baseUrl:"https://www.sotardust.cn/CMTGP/",
    baseUrl:"http://192.168.1.4:9000/CMTGP/",
    searchList:[]
  },
  onLaunch: function () {
    var that = this;
    // 登录
    wx.login({
      success: res => {
      //  console.info(res)
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              that.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                that.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    //获取用户唯一ID
    // wx.login({
    //   success: function (res) {
    //     if (res.code) {
    //       wx.request({
    //         url: 'https://api.weixin.qq.com/sns/jscode2session',
    //         data: {
    //           //填上自己的小程序唯一标识
    //           appid: 'wx73415b963d21e2f4',
    //           //填上自己的小程序的 app secret
    //           secret: '60aa412a233213f7a2924ccf22017148',
    //           grant_type: 'authorization_code',
    //           js_code: res.code
    //         },
    //         method: 'GET',
    //         header: { 'content-type': 'application/json' },
    //         success: function (res) {
    //           console.info(res)
    //           wx.setStorage({
    //             key: 'openid',
    //             data: res.data.openid,
    //           })

    //         },
    //         fail: function (error) {
    //           console.error("获取用户openId失败");
    //           console.error(error);
    //         }
    //       })
    //     }
    //   }
    // })
  }
})
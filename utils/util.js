const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function  getPhone(baseUrl,data,that,app){
  wx.checkSession({
    success: (res) => {
      wx.request({
        url: baseUrl+"user/getPhone",
        method: 'get',
        data: data,
        success(res) {
          if(res.data.code==200){
            var data = res.data.data;
            wx.setStorageSync('isPhone', data.isPhone);
            wx.setStorageSync('uId', data.uId);
            that.setData({
              isPhone:data.isPhone
            })
            wx.showToast({
              icon:'none',
              title: '绑定成功',
              duration:1500
            })
          }else{
            wx.showToast({
              title: "服务器异常"
            })
          }
        },
        fail(res) {
          wx.showToast({
            title: "服务器异常"
          })
        }
      })
    },
    fail: (res) => {
      app.wxGetOpenID().then(function(){
        if(wx.getStorageSync('isPhone')==0){
          wx.request({
            url: baseUrl+"user/getPhone",
            method: 'get',
            data: data,
            success(res) {
              if(res.data.code==200){
                var data = res.data.data;
                wx.setStorageSync('isPhone', data.isPhone);
                that.setData({
                  isPhone:data.isPhone
                })
                wx.showToast({
                  icon:'none',
                  title: '绑定成功',
                  duration:1500
                })
              }else{
                wx.showToast({
                  title: "服务器异常"
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
    }
  })
}

module.exports = {
  formatTime: formatTime,
  getPhone:getPhone
}

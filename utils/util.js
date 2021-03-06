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

// function getCarNum(that,paras,baseUrl){
//   wx.request({
//     url: baseUrl+"shoppingCart/queryShoppingCartList",
//     method: 'get',
//     data: paras,
//     success(res) {
//       if(res.data.code==200){
//         var list = res.data.data;
//         var checkNum = parseInt(0);
//         for(var idx in list){
//           var detail = list[idx];
//           for(var index in detail.goods){
//             var item = detail.goods[index];
//             if(item.is_check==1 && item.state==1){
//               ++checkNum;
//             }
//           }
//         }
//         if(checkNum!=0){
//           wx.setTabBarBadge({//tabbar右上角添加文本
//             index: 2,//tabbar下标
//             text: checkNum+'' //显示的内容,必须为字符串
//           })
//           that.setData({
//             carSum:checkNum
//           })
//         }else{
//           wx.removeTabBarBadge({
//             index: 1,
//           })
//         }
//       }
//     }
//   })
// }


function getCarNum(that,paras,baseUrl,flag){
  wx.request({
    url: baseUrl+"menu/queryCartNum",
    method: 'get',
    data: paras,
    success(res) {
      if(res.data.code==200){
        var checkNum = res.data.data;
        if(checkNum!=0){
          if(flag){
            wx.setTabBarBadge({//tabbar右上角添加文本
              index: 2,//tabbar下标
              text: checkNum+'' //显示的内容,必须为字符串
            })
          }
          that.setData({
            carSum:checkNum
          })
        }else{
          wx.removeTabBarBadge({
            index: 1,
          })
        }
      }
    }
  })
}

function  getPhone(baseUrl,data,that,app){
  wx.checkSession({
    success: (res) => {
      wx.request({
        url: baseUrl+"mini/getPhone",
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
var startX
var startY
function _touchstart(e, items) {
  //开始触摸时 重置所有删除
  items.forEach(function (v, i) {
    if (v.isTouchMove) //只操作为true的
      v.isTouchMove = false;
  })
  
  startX = e.changedTouches[0].clientX
  startY = e.changedTouches[0].clientY
  
  return items
}

function _touchmove(e, items){
  var index = e.currentTarget.dataset.index; //当前索引
  var touchMoveX = e.changedTouches[0].clientX; //滑动变化坐标
  var touchMoveY = e.changedTouches[0].clientY; //滑动变化坐标
  //获取滑动角度
  var _X = touchMoveX-startX;
  var _Y = touchMoveY-startY;
  var angle = 360 * Math.atan(_Y / _X) / (2 * Math.PI);

  items.forEach(function (v, i) {
    v.isTouchMove = false
    //滑动超过30度角 return
    if (Math.abs(angle) > 30) return;
    if (i == index) {
      if (touchMoveX > startX) //右滑
        v.isTouchMove = false
      else //左滑
        v.isTouchMove = true
    }
  })

  return items
}


module.exports = {
  formatTime: formatTime,
  getPhone:getPhone,
  touchStart:_touchstart,
  touchMove:_touchmove,
  getCarNum:getCarNum
}

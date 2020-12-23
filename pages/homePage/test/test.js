// pages/homePage/test/test.js
 
Page({
 
  data: {
    carSum:3,
    type:1,
    animationMain:null,//正面
  	animationBack:null,//背面

  },

  /**
   * 组件的方法列表
   */
  onLoad(){

  },
  turnSearch(){
    var type = this.data.type;
    this.animation_main = wx.createAnimation({
      duration:800,
      timingFunction:'linear'
    })
    this.animation_back = wx.createAnimation({
      duration:800,
      timingFunction:'linear'
    })
    // 点击正面

    if (type==1) {
      this.animation_main.rotateX(180).step()
      this.animation_back.rotateX(0).step()
      this.setData({
        animationMain: this.animation_main.export(),
        animationBack: this.animation_back.export(),
        type:0
      })
    }
    // 点击背面
    else{
      this.animation_main.rotateX(0).step()
      this.animation_back.rotateX(-180).step()
      this.setData({
        animationMain: this.animation_main.export(),
        animationBack: this.animation_back.export(),
        type:1
      })
    }
  },
  rotateFn(e) {
  	var id = e.currentTarget.dataset.id
  	this.animation_main = wx.createAnimation({
        duration:400,
        timingFunction:'linear'
      })
      this.animation_back = wx.createAnimation({
        duration:400,
        timingFunction:'linear'
      })
  	// 点击正面
 
  	if (id==1) {
      this.animation_main.rotateX(180).step()
      this.animation_back.rotateX(0).step()
      this.setData({
      	animationMain: this.animation_main.export(),
      	animationBack: this.animation_back.export(),
      })
  	}
  	// 点击背面
  	else{
      this.animation_main.rotateX(0).step()
      this.animation_back.rotateX(-180).step()
      this.setData({
      	animationMain: this.animation_main.export(),
      	animationBack: this.animation_back.export(),
      })
  	}
  },
})

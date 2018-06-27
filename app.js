// 设置国际化 https://www.jianshu.com/p/5d0da1e43948
import locales from './utils/i18n/locale'
import T from './utils/i18n/weapp-i18n'

var Api = require('./utils/api.js');
var common = require('./common/helper.js');

// 国际化组件注册
T.registerLocale(locales)
T.setLocale('zh-Hans')
// T.setLocale('en')
wx.T = T

/* 
  ===== 本地存储 =====
  * sessionId
    从服务器端获取到的会话标识

  * token
    用户token，每次调用服务器端服务需携带token

  ===== 全局变量 =====
  * userInfo
    从服务端获取到的用户信息
  
  * userInfoLocal
    从微信服务器获取到的用户信息

  * currencyUnits
    货币服务器端单位列表

  * essentialDone
    判断app是否已经将初始化完成必须项目
 */

//app.js
App({
  onLaunch: function () {
    // 登录
    wx.login({
      success: res => {
        var code = res.code;
        if (code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId，本地存储session_id
          console.log('获取用户登录凭证：' + code);
          var api_url = Api.auth_url + '?code=' + code;
          Api.fetchPost(api_url, '', (err, res) => {
            var sessionId = res.data.session_id;
            var userId = res.data.user_id;
            wx.setStorageSync('sessionId', sessionId)

            // （无需token）获取单位列表，并保存为全局变量
            var api_url = Api.currency_unit_url;
            Api.fetchGet(api_url, (err, res) => {
              console.log('正常获取货币单位列表');
              // 必须项目已经初始化完成
              this.globalData.currencyUnits = res.currency_units
              this.globalData.essentialDone = true
              console.log('必须项目初始化完成');

              // （测试token）尝试获取用户信息来验证token是否过期，过期则将token设置为空
              var token = wx.getStorageSync('token');
              var api_url = Api.user_url + '?token=' + token;
              Api.fetchGet(api_url, (err, res) => {
                if (common.isCallSuccess(res)) {
                  console.log('正常获取服务端用户数据：' + res.name);
                  this.globalData.userInfo = res

                  // 获取微信用户数据，并保存为全局变量
                  wx.getUserInfo({
                    success: res => {
                      console.log('正常获取微信端用户数据：' + res.userInfo.nickName);
                      // 可以将 res 发送给后台解码出 unionId
                      this.globalData.userInfoLocal = res.userInfo

                      // 启动后回调
                      if (this.userInfoReadyCallback) {
                        console.log('调用回调函数');
                        this.userInfoReadyCallback()
                      }
                    }
                  })
                } else {
                  wx.setStorageSync('token', null)
                  console.log('token已经过期，token已经被设置为空');

                  // 启动后回调
                  if (this.userInfoReadyCallback) {
                    console.log('调用回调函数');
                    this.userInfoReadyCallback()
                  }
                }
              })
            })
          })
        } else {
          console.log('获取用户登录态失败：' + res.errMsg);
        }
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
              this.globalData.userInfoLocal = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.localUserInfoReadyCallback) {
                this.localUserInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
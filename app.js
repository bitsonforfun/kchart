// 设置国际化 https://www.jianshu.com/p/5d0da1e43948
import locales from './utils/i18n/locale'
import T from './utils/i18n/weapp-i18n'

var Api = require('./utils/api.js');

T.registerLocale(locales)
T.setLocale('zh-Hans')
// T.setLocale('en')
wx.T = T

//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = res.code;
        if (code) {
          console.log('获取用户登录凭证：' + code);
          var api_url = Api.auth_url + '?code=' + code;
          Api.fetchPost(api_url, '', (err, res) => {
            var sessionId = res.data.session_id;
            var userId = res.data.user_id;
            wx.setStorageSync('sessionId', sessionId)
            wx.setStorageSync('userId', userId)
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
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
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
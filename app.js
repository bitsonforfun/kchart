// 设置国际化 https://www.jianshu.com/p/5d0da1e43948
import locales from './utils/i18n/locale'
import T from './utils/i18n/weapp-i18n'

var Api = require('./utils/api.js');
var Common = require('./common/helper.js');
var Prom = require('./utils/prom.js');
var wsAPILib = require('./utils/wsAPI.js');
var wxAPI = wsAPILib.wsAPI;

T.registerLocale(locales)
T.setLocale('zh-Hans')
// T.setLocale('en')
wx.T = T

//app.js
App({
  onLaunch: function () {
    wxAPI.taskSequence()
    .then(() => wxAPI.login())
    .then((res) => {
      var code = res.code;
      if (code) {
        console.log('获取用户登录凭证：' + code);
        var api_url = Api.auth_url + '?code=' + code;
        return wxAPI.fetchPost(api_url, '')
      }
    })
    .then((res) => {
      var sessionId = res.data.session_id;
      var userId = res.data.user_id;
      wx.setStorageSync('sessionId', sessionId)
      this.globalData.currencyUnitRefreshed = false
      this.globalData.myCurrencyRefreshed = false

      var api_url = Api.currency_unit_url;
      return wxAPI.fetchGet(api_url)
    })
    .then((res) => {
      this.globalData.currencyUnits = res.currency_units
      this.globalData.essentialDone = true
      console.log('必须项目初始化完成');

      var token = wx.getStorageSync('token');
      var api_url = Api.user_url + '?token=' + token;
      return wxAPI.fetchGet(api_url)
    })
    .then((res) => {
      if (Common.isCallSuccess(res)) {
        console.log('正常获取服务端用户数据：' + res.name);
        this.globalData.userInfo = res
        return wxAPI.getUserInfo()
      } else {
        wx.setStorageSync('token', null)
        console.log('token已经过期，token已经被设置为空');

        if (this.userInfoReadyCallback) {
          console.log('调用回调函数');
          this.userInfoReadyCallback()
        }
      }
    })
    .then((res) => {
      if (res) {
        console.log('正常获取微信端用户数据：' + res.userInfo.nickName);
        this.globalData.userInfoLocal = res.userInfo
        if (this.userInfoReadyCallback) {
          console.log('调用回调函数');
          this.userInfoReadyCallback()
        }
      }
    })


    // // 登录
    // wx.login({
    //   success: res => {
    //     var code = res.code;
    //     if (code) {
    //       // 发送 res.code 到后台换取 openId, sessionKey, unionId，本地存储session_id
    //       console.log('获取用户登录凭证：' + code);
    //       var api_url = Api.auth_url + '?code=' + code;
    //       Api.fetchPost(api_url, '', (err, res) => {
    //         var sessionId = res.data.session_id;
    //         var userId = res.data.user_id;
    //         wx.setStorageSync('sessionId', sessionId)
    //         this.globalData.currencyUnitRefreshed = false
    //         this.globalData.myCurrencyRefreshed = false

    //         // （无需token）获取列表，并保存为全局变量
    //         var api_url = Api.currency_unit_url;
    //         Api.fetchGet(api_url, (err, res) => {
    //           // 必须项目已经初始化完成
    //           this.globalData.currencyUnits = res.currency_units
    //           this.globalData.essentialDone = true
    //           console.log('必须项目初始化完成');

    //           // （测试token）尝试获取用户信息来验证token是否过期，过期则将token设置为空
    //           var token = wx.getStorageSync('token');
    //           var api_url = Api.user_url + '?token=' + token;
    //           Api.fetchGet(api_url, (err, res) => {
    //             if (Common.isCallSuccess(res)) {
    //               console.log('正常获取服务端用户数据：' + res.name);
    //               this.globalData.userInfo = res

    //               // 获取微信用户数据，并保存为全局变量
    //               wx.getUserInfo({
    //                 success: res => {
    //                   console.log('正常获取微信端用户数据：' + res.userInfo.nickName);
    //                   // 可以将 res 发送给后台解码出 unionId
    //                   this.globalData.userInfoLocal = res.userInfo

    //                   // 启动后回调
    //                   if (this.userInfoReadyCallback) {
    //                     console.log('调用回调函数');
    //                     this.userInfoReadyCallback()
    //                   }
    //                 }
    //               })
    //             } else {
    //               wx.setStorageSync('token', null)
    //               console.log('token已经过期，token已经被设置为空');

    //               // 启动后回调
    //               if (this.userInfoReadyCallback) {
    //                 console.log('调用回调函数');
    //                 this.userInfoReadyCallback()
    //               }
    //             }
    //           })
    //         })
    //       })
    //     } else {
    //       console.log('获取用户登录态失败：' + res.errMsg);
    //     }
    //   }
    // })
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
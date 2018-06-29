/**
 * Created by Lipeizhao on 2018/6/20.
 */

// user.js
var app = getApp()
var Api = require('../../utils/api.js');
var Common = require('../../common/helper.js');
const _ = wx.T._

Page({
  /**
   * 页面的初始数据
   */
  data: {
    labelCurrencyUnit: _('LabelMineCurrencyUnitSetupDesc'),
    aboutUs: _('LabelMineAboutUs'),
    
    currencyUnits: null,
    currencyUnit: null,
    userInfo: null,

    show: false,
    hasLogin: false,
    cancelWithMask: true,
    userInfoLocal: null,

    D: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // for mini
    this.data.D = wx.D
    this.setData({
      D: this.data.D,
    });
    
    let that = this
    if (Common.hasToken()) {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfoLocal = res.userInfo
          that.setData({
            userInfoLocal: app.globalData.userInfoLocal,
          });
        }
      })
    }

    if (Common.hasToken()) {
      var token = wx.getStorageSync('token');
      var api_url = Api.user_url + '?token=' + token;
      Api.fetchGet(api_url, (err, res) => {
        let userInfo = res;
        that.setData({
          userInfo: userInfo,
          currencyUnit: userInfo.currencyUnit,
          hasLogin: true
        });
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    // if (Common.hasToken()) {
    //   wx.getUserInfo({
    //     success: res => {
    //       wx.userInfoLocal = res.userInfo
    //       that.setData({
    //         userInfo: wx.userInfoLocal,
    //       });
    //     }
    //   })
    // }

    // if (Common.hasToken()) {
    //   var token = wx.getStorageSync('token');
    //   var api_url = Api.user_url + '?token=' + token;
    //   Api.fetchGet(api_url, (err, res) => {
    //     let userInfo = res;
    //     that.setData({
    //       userInfo: userInfo,
    //       currencyUnit: userInfo.currencyUnit,
    //     });
    //   })
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var tmp = 123;
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var tmp = 123;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 用户点击登录
   */
  toLogin: function (e) {
    wx.login({
      success: res => {
        var code = res.code;
        if (code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          console.log('获取用户登录凭证：' + code);
          var api_url = Api.auth_url + '?code=' + code;
          Api.fetchPost(api_url, '', (err, res) => {
            var sessionId = res.data.session_id;
            var userId = res.data.user_id;
            wx.setStorageSync('sessionId', sessionId)
            wx.setStorageSync('userId', userId)

            // 根据session_id获取token
            var userinfo = e.detail.userInfo;
            var sessionId = wx.getStorageSync('sessionId');
            var api_url = Api.token_url + '?sessionId=' + sessionId;
            var data = {
              nickName: userinfo.nickName,
              avatarUrl: userinfo.avatarUrl,
              gender: userinfo.gender,
              country: userinfo.country,
              province: userinfo.province,
              city: userinfo.city,
              language: userinfo.language,
            }
            Api.fetchPost(api_url, data, (err, res) => {
              var token = res.data;
              wx.setStorageSync('token', token)

              // 根据token从服务端获取用户信息
              var token = wx.getStorageSync('token');
              var api_url = Api.user_url + '?token=' + token;
              Api.fetchGet(api_url, (err, res) => {
                if (Common.isCallSuccess(res)) {
                  app.globalData.userInfo = res
                } else {
                  wx.setStorageSync('token', null)
                }
                // 刷新页面
                app.globalData.currencyUnitRefreshed = true

                // 根据获取到的所有信息更新页面模型
                this.setData({
                  hasLogin: true,
                  userInfoLocal: userinfo,
                  currencyUnit: app.globalData.userInfo.currencyUnit
                })
              })
            })
          })
        } else {
          console.log('获取用户登录态失败：' + res.errMsg);
        }
      }
    })
  },
  openCurrencyUnitsheet() {
    var api_url = Api.currency_unit_url;
    Api.fetchGet(api_url, (err, res) => {
      //更新数据
      var currencyUnits = res.currency_units;
      this.data.currencyUnits = currencyUnits;
      this.data.actions = new Array();
      for (var i = 0; i < currencyUnits.length; ++i) {
        this.data.actions.push({
          name: currencyUnits[i].name,
          className: 'action-class',
          loading: false
        })
      }

      this.setData({
        actions: this.data.actions,
        show: true
      });
    })
  },
  closeCurrencyUnitsheet() {
    this.setData({
      show: false
    });
  },
  clickSelectCurrencyUnit({ detail }) {
    const { index } = detail;
    var currencyUnit = this.data.currencyUnits[index];
    this.setData({
      [`actions[${index}].loading`]: true
    });

    var token = wx.getStorageSync('token');
    var api_url = Api.user_url + '?token=' + token;
    var data = {
      "key": "currencyUnit",
      "value": currencyUnit.name
    }
    Api.fetchPut(api_url, data, (err, res) => {
      var currencyUnit = res.data;
      app.globalData.userInfo.currencyUnit = currencyUnit
      app.globalData.currencyUnitRefreshed = true
      this.setData({
        currencyUnit: currencyUnit,
        [`show`]: false,
        [`actions[${index}].loading`]: false
      });
    })
  }
})

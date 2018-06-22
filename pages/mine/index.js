/**
 * Created by Lipeizhao on 2018/6/20.
 */

// user.js
var _app = getApp()
var Api = require('../../utils/api.js');
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

    show: false,
    cancelWithMask: true,
    actions: [{
      name: 'USD',
      subname: '',
      className: 'action-class',
      loading: false
    }, {
      name: 'CNY',
      subname: '',
      className: 'action-class',
      loading: false
    }],
    // cancelText: '关闭 Action'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    var userId = wx.getStorageSync('userId');

    that.setData({
      userId: userId,
    })
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
    // _app.getUserInfo(function (userinfo) {
    //   console.log(userinfo)
    //   console.log(getApp().globalData.userSign)
    //   that.setData({
    //     userinfo: userinfo,
    //     userSign: getApp().globalData.userSign,
    //   })
    // })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
    var userinfo = e.detail.userInfo;
    var sessionId = wx.getStorageSync('sessionId');
    var api_url = Api.token_url + '?sessionId=' + sessionId;
    var data = {
      nickName: userinfo.nickName,
      gender: userinfo.gender,
      country: userinfo.country,
      province: userinfo.province,
      city: userinfo.city,
      language: userinfo.language,
    }
    Api.fetchPost(api_url, data, (err, res) => {
      var token = res.data;
      // save token for later use
      wx.setStorageSync('token', token)

      this.setData({
        userinfo: userinfo,
      })
    })
  },
  // 货币单位选择弹层
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
      this.setData({
        currencyUnit: currencyUnit,
        [`show`]: false,
        [`actions[${index}].loading`]: false
      });
    })

    // setTimeout(() => {
    //   this.setData({
    //     [`show`]: false,
    //     [`actions[${index}].loading`]: false
    //   });
    // }, 1500);
  }
})

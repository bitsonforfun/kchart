/**
 * Created by Lipeizhao on 2018/6/20.
 */

var app = getApp()
var Api = require('../../utils/api.js');
const _ = wx.T._

Page({
  /**
   * 页面的初始数据
   */
  data: {
    countPerPage: 15,
    cursor: 0,
    currencies: [],
    hasMore: true,
    coinListingLimit: 50,
    coinListLoading: false,

    currencyUnit: '$'
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
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          winH: res.windowHeight
        });
      }
    })
    this.getData(this.data.countPerPage, this.data.cursor, '');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
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

  getData: function (countPerPage, cursor, searchWord) {
    var that = this;
    var token = wx.getStorageSync('token');
    var api_url = Api.currency_url + '?sort=rank_asc&limit=' + countPerPage + '&start=' + cursor + '&token=' + token;
    if (searchWord != '') {
      api_url = api_url + '&searchWord=' + searchWord;
    }
    Api.fetchGet(api_url, (err, res) => {
      if (res == 'Invalid token') {

      } else {
        var count = that.data.currencies.length;
        for (var i = 0; i < res.currencies.length; i++) {
          if (count < that.data.coinListingLimit) {
            that.currencToLocalString(res.currencies[i])
            that.data.currencies.push(res.currencies[i])
            count += 1
          }
        }
        if (that.data.currencies.length >= that.data.coinListingLimit) {
          that.data.hasMore = false;
        }
      }

      // 更新页面模型
      that.setData({
        currencies: that.data.currencies,
        hasMore: that.data.hasMore,
      });

      that.data.cursor = that.data.cursor + that.data.countPerPage;

      // 防止上拉页面后重复加载
      this.data.coinListLoading = false
    })
  },
  addControlProperies: function (currency) {
    currency.name = currency.symbol + ' ' + currency.name
    // currency.value = currency.isOptionalCurrency
    currency.value = true
  },
  currencToLocalString: function (currency) {
    currency.quotesPrice = currency.quotesPrice && currency.quotesPrice.toLocaleString()
    currency.quotesMarketCap = currency.quotesMarketCap && currency.quotesMarketCap.toLocaleString()
    currency.circulatingSupply = currency.circulatingSupply && currency.circulatingSupply.toLocaleString()
    currency.totalSupply = currency.totalSupply && currency.totalSupply.toLocaleString()
    currency.maxSupply = currency.maxSupply && currency.maxSupply.toLocaleString()
  },
  loadMore: function (e) {
    if (!this.data.coinListLoading) {
      this.data.coinListLoading = true
      this.getData(this.data.countPerPage, this.data.cursor, '');
      console.log('上拉加载更多', new Date());
    }
  },
  /**
   * 用户选
   */
  onCheck: function (e) {
    var that = this;
    let checked = e.currentTarget.dataset.checked;
    let symbol = e.currentTarget.dataset.symbol;
    let currency = e.currentTarget.dataset.currency;
    let type = null;

    app.globalData.myCurrencyRefreshed = true
    if (checked == true) {
      type = 'delete'
    } else if (checked == false) {
      type = 'add'
    }
    var token = wx.getStorageSync('token');
    var api_url = Api.my_currency_url + '?token=' + token;
    var data = {
      type: type,
      symbol: symbol
    };
    Api.fetchPut(api_url, data, (err, res) => {
      let symbol = res.data.symbol;
      let type = res.data.type;
      let checked = null;
      if (type == 'add') {
        checked = true
      } else if (type == 'delete') {
        checked = false
      }
      for (var i = 0; i < that.data.currencies.length; ++i) {
        if (that.data.currencies[i].symbol == symbol) {
          that.data.currencies[i].isOptionalCurrency = checked
        }
      }
      that.setData({
        currencies: that.data.currencies,
      });
    })
  },
  /**
   * 用户索
   */
  onInput: function (e) {
    var word = e.detail.value;
    var cursor = e.detail.cursor;
    var timeStamp = e.timeStamp;

    this.data.currenceis = []
    this.data.cursor = 0
    this.setData({
      currencies: [],
    });
    this.getData(this.data.countPerPage, this.data.cursor, word);
  }
})

/**
 * Created by Lipeizhao on 2018/5/28.
 */

var Api = require('../../utils/api.js');
const app = getApp();
const _ = wx.T._

Page({
  onReady: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          winH: res.windowHeight
        });
      }
    })
    this.data.coin_img_url = Api.coin_img_url
    this.setData({
      coin_img_url: this.data.coin_img_url
    });
    // for mini
    this.getExchange()
  },
  data: {
    ec: {
      lazyLoad: true
    },

    // icon url
    coin_img_url: '',

    // currency query result
    currencies: [],
    currencyUnit: '$',
    
    // currency query
    countPerPage: 15,
    cursor: 0,
    hasMore: true,
    coinListingLimit: 50,
    coinListLoading: false,

    percentageMark: '%',
    // tab
    tab: {
      list: [{
        id: '1',
        // title: _('TabNumberOneName'),
        title: ''
      }, {
        id: '2',
        title: ''
      }, {
        id: '3',
        title: ''
      }],
      selectedId: '1',
      scroll: false,
      height: 30
    },
    labelMarketCap: _('LabelMarketCap')
  },
  onLoad: function () {
  },
  onShareAppMessage: function (res) {
    return {
      title: '行情查询',
      path: '/pages/index/index'
    }
  },
  open: function (e) {
    wx.navigateTo({
      url: '../basic/index?symbol=' + e.currentTarget.dataset.currency.symbol
    });
  },
  tap: function (e) {
    for (var i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        this.setData({
          toView: order[i + 1],
          scrollTop: (i + 1) * 200
        })
        break
      }
    }
  },
  tapMove: function (e) {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
  },
  // for mini
  getExchange: function () {
    var api_url = Api.base_url + '/exchange';
    Api.fetchGet(api_url, (err, res) => {
      wx.D = res

      // for mini, update labels
      this.data.tab = {
        list: [{
          id: '1',
          title: wx.D ? '广州楼盘均价' : _('TabNumberOneName')
        }, {
          id: '2',
          title: ''
        }, {
          id: '3',
          title: ''
        }],
        selectedId: '1',
        scroll: false,
        height: 30
      }
      this.data.labelMarketCap = wx.D ? '排序' : _('LabelMarketCap')

      this.setData({
        tab: this.data.tab,
        labelMarketCap: this.data.labelMarketCap
      })

      // for mini, get data
      this.getData(this.data.countPerPage, this.data.cursor);
    })
  },
  // 获取货币列表数据
  getData: function (countPerPage, cursor) {
    // for project d
    if (wx.D) {
      var that = this;
      var api_url = Api.currency_url + '?sort=rank_asc&limit=' + countPerPage + '&start=' + cursor + '&d=1';
      Api.fetchGet(api_url, (err, res) => {
        //更新数据
        for (var i = 0; i < res.currencies.length; i++) {
          if (that.data.currencies.length <= that.data.coinListingLimit) {
            res.currencies[i].quotesUSDMarketCap = ''
            res.currencies[i].rank = res.currencies[i].rank - 10000
            // res.currencies[i].quotesUSDPercentChange24h = (res.currencies[i].quotesUSDPercentChange24h * 100).toFixed(2)
            res.currencies[i].quotesUSDPercentChange24h = ''
            that.currencToLocalString(res.currencies[i])
            that.setChangePercentColor(res.currencies[i])
            that.data.currencies.push(res.currencies[i])
          }
        }

        if (that.data.currencies.length >= that.data.coinListingLimit) {
          that.data.hasMore = false;
        }

        // 更新页面模型
        that.setData({
          currencies: that.data.currencies,
          currencyUnit: '￥',
          percentageMark: '',
          hasMore: that.data.hasMore
        });

        that.data.cursor = that.data.cursor + that.data.countPerPage;

        // 防止上拉页面后重复加载
        this.data.coinListLoading = false
      })
    } else {
      var that = this;
      var api_url = Api.currency_url + '?sort=rank_asc&limit=' + countPerPage + '&start=' + cursor;
      Api.fetchGet(api_url, (err, res) => {
        //更新数据
        var count = that.data.currencies.length;
        for (var i = 0; i < res.currencies.length; i++) {
          if (count < that.data.coinListingLimit) {
            that.currencToLocalString(res.currencies[i])
            that.setChangePercentColor(res.currencies[i])
            that.data.currencies.push(res.currencies[i])
            count += 1
          }
        }
        if (that.data.currencies.length >= that.data.coinListingLimit) {
          that.data.hasMore = false;
        }

        // 更新页面模型
        that.setData({
          currencies: that.data.currencies,
          hasMore: that.data.hasMore,
          percentageMark: '%'
        });

        that.data.cursor = that.data.cursor + that.data.countPerPage;

        // 防止上拉页面后重复加载
        this.data.coinListLoading = false
      })
    }

  },
  currencToLocalString: function (currency) {
    currency.quotesUSDPrice = currency.quotesUSDPrice && currency.quotesUSDPrice.toLocaleString()
    currency.quotesUSDMarketCap = currency.quotesUSDMarketCap && currency.quotesUSDMarketCap.toLocaleString()
    currency.circulatingSupply = currency.circulatingSupply && currency.circulatingSupply.toLocaleString()
    currency.totalSupply = currency.totalSupply && currency.totalSupply.toLocaleString()
    currency.maxSupply = currency.maxSupply && currency.maxSupply.toLocaleString()
  },
  setChangePercentColor: function (currency) {
    if (currency.quotesUSDPercentChange24h > 0) {
      currency.isPercentChangePositive = true
    } else {
      currency.isPercentChangePositive = false
    }
  },
  loadMore: function (e) {
    if (!this.data.coinListLoading) {
      this.data.coinListLoading = true
      this.getData(this.data.countPerPage, this.data.cursor);
      console.log('上拉加载更多', new Date());
    }
  },
})

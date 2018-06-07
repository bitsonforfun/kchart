var Api = require('../../utils/api.js');
const app = getApp();
const _ = wx.T._

function setOption(chart, data) {
  const option = {
    backgroundColor: "#fff",
    color: ["#37A2DA", "#67E0E3", "#9FE6B8"],

    // tooltip: {
    //   trigger: 'axis'
    xAxis: {
      show: false,
      type: 'category',
      boundaryGap: false,
    },
    yAxis: {
      show: false,
      x: 'center',
      type: 'value'
    },
    series: [{
      type: 'line',
      smooth: true,
      areaStyle: {},
      data: data
    }
    ]
  };
  chart.setOption(option);
}

Page({
  onReady: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          winH: res.windowHeight
        });
      }})    
    this.data.coin_img_url = Api.coin_img_url
    this.setData({
      coin_img_url: this.data.coin_img_url
    });
    this.getData(this.data.countPerPage, this.data.cursor);
  },
  data: {
    ec: {
      lazyLoad: true
    },

    // icon url
    coin_img_url: '',

    // currency query result
    currencies: [],

    // currency query
    countPerPage: 15,
    cursor: 0,
    hasMore: true,
    coinListingLimit: 50,
    coinListLoading: false,
    // // percent change color, green when positive, otherwise red
    // isPercentChangePositive: true,

    // tab
    tab: {
      list: [{
        id: '1',
        title: _('TabNumberOneName')
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
      title: '数字货币行情',
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
  // onReachBottom: function () {
  //   // this.loadMore();
  //   this.getData(this.data.countPerPage, this.data.cursor);
  //   console.log('上拉加载更多', new Date());
  // },

  // 获取货币列表数据
  getData: function (countPerPage, cursor) {
    var that = this;
    var api_url = Api.currency_url + '?sort=rank_asc&limit=' + countPerPage + '&start=' + cursor;

    Api.fetchGet(api_url, (err, res) => {
      //更新数据
      // that.data.currencies = res.currencies
      for (var i = 0; i < res.currencies.length; i++) {
        if (that.data.currencies.length <= that.data.coinListingLimit) {
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
        hasMore: that.data.hasMore
      });
      
      that.data.cursor = that.data.cursor + that.data.countPerPage;

      // 防止上拉页面后重复加载
      this.data.coinListLoading = false

      // setTimeout(function () {
      //   that.setData({ hidden: true });
      //   wx.hideNavigationBarLoading();
      // }, 300);
    })
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

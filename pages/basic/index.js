/**
 * Created by Lipeizhao on 2018/5/28.
 */

var Api = require('../../utils/api.js');
var Common = require('../../common/helper.js');
const app = getApp();
const _ = wx.T._

// wx chart
var wxCharts = require('../../utils/wxcharts.js');
var areaChart = null;

Page({
  onReady: function () {
  },
  data: {
    currencyInfo: {
      name: '',
      symbol: '',
      rank: -1,
      quotesPrice: 0,
      quotesMarketCap: 0,
      quotesVolume24h: 0,
      history: null,
      volumeOfCountSuffix: '',
      volumeSuffix: '',
    },
    label24Hour: _('Label24Hour'),
    labelPercentChange: _('LabelPercentChange'),
    labelVolume: _('LabelVolume'),
    labelVolume2: _('LabelVolume2'),
    labelCoinPair: _('LabelCoinPair'),
    labelStats: _('LabelStats'),
    labelRank: _('LabelRank'),
    labelMarketCap: _('LabelMarketCap'),
    labelCirculatingSupply: _('LabelCirculatingSupply'),
    labelTotalSupply: _('LabelTotalSupply'),
    labelMaxSupply: _('LabelMaxSupply'),

    ec: {
      lazyLoad: true
    },
    isPercentUp: true,
    labelCurrencyUnit: '$',
    currencyUnit: 'USD',
    D: true,
  },
  onShareAppMessage: function (res) {
    return {
      title: '价格列表',
      path: '/pages/basic/index?symbol=' + this.data.currencyInfo.symbol
    }
  },
  onLoad: function (options) {
    this.data.coin_img_url = Api.coin_img_url
    this.setData({
      coin_img_url: this.data.coin_img_url
    });

    if (Common.hasToken()) {
      this.data.currencyUnit = app.globalData.userInfo.currencyUnit
      this.data.labelCurrencyUnit = Common.getCurrencyUnitSymbol(this.data.currencyUnit)
    } else {
      this.data.currencyUnit = 'USD'
      this.data.labelCurrencyUnit = Common.getCurrencyUnitSymbol(this.data.currencyUnit)
    }
    this.setData({
      currencyUnit: this.data.currencyUnit,
      labelCurrencyUnit: this.data.labelCurrencyUnit,
      D: wx.D,
    })
    
    this.data.currencyInfo.symbol = options.symbol
    this.getBasicInfo(this.data.currencyInfo.symbol)
    this.getHistory()
    this.getCoinPairs()
  },
  onShow: function (options) {

  },
  touchHandler: function (e) {
    console.log(areaChart.getCurrentDataIndex(e));
    areaChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ': ' + item.data
      }
    });
  },  

  init_wxchart: function () {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    areaChart = new wxCharts({
      // background: '#123456',
      dataLabel: false,
      dataPointShape: false,
      canvasId: 'areaCanvas',
      legend: false,
      type: 'area',
      categories: this.data.currencyInfo.history.date,
      // categories: ['1', '2', '3', '4', '5', '6'],
      animation: false,
      series: [{
        name: '价格',
        data: this.data.currencyInfo.history.close,
        format: function (val, name) {
          return val.toFixed(2); 
        }
      }],
      yAxis: {
        disabled: true,
        gridColor: '#FFFFFF',
      },
      xAxis: {
        disableGrid: true,
        fontColor: '#FFFFFF'
      },
      extra: {
        lineStyle: 'curve',
        legendTextColor: '#cb2431'
      },
      // width: windowWidth,
      width: windowWidth,
      height: 190
    });
  },
  init_chart: function (currencyInfo) {
    var item = currencyInfo;
    var chart_id = '#chart-line-' + item.id;
    // var ecComponent = new Array();
    var ecComponent = this.selectComponent(chart_id);

    ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });

      // var data = item.line.split(",")
      this.setOption(chart, currencyInfo);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },
  open: function (e) {
    // wx.navigateTo({
    //   url: '../chart/index?ex=' + e.target.dataset.pair.ex + '&symbol=' + e.target.dataset.pair.symbol
    // });

    wx.navigateTo({
      url: '../chart/index?ex=' + e.currentTarget.dataset.pair.ex + '&symbol=' + e.currentTarget.dataset.pair.symbol
    });
  },
  // tap: function (e) {
  //   for (var i = 0; i < order.length; ++i) {
  //     if (order[i] === this.data.toView) {
  //       this.setData({
  //         toView: order[i + 1],
  //         scrollTop: (i + 1) * 200
  //       })
  //       break
  //     }
  //   }
  // },
  // tapMove: function (e) {
  //   this.setData({
  //     scrollTop: this.data.scrollTop + 10
  //   })
  // },
  getHistory: function () {
    var api_url = Api.history_url + '/' + this.data.currencyInfo.symbol + '?currencyUnit=' + this.data.currencyUnit;
    Api.fetchGet(api_url, (err, res) => {
      //更新数据
      this.data.currencyInfo.history = res      
      // this.setData({
      //   currencyInfo: this.data.currencyInfo
      // });

      // this.init_chart(this.data.currencyInfo)
      this.init_wxchart()
    })
  },
  getCoinPairs: function () {
    var api_url = Api.coinpair_url + '/' + this.data.currencyInfo.symbol;
    if (this.data.currencyUnit) {
      api_url = api_url + '?currencyUnit=' + this.data.currencyUnit
    }
    Api.fetchGet(api_url, (err, res) => {
      //更新数据
      this.data.currencyInfo.coinpairs = res.spiders
      for (var i = 0; i < this.data.currencyInfo.coinpairs.length; i++) {
        this.data.currencyInfo.coinpairs[i].quotesVolume24h = Common.autoRoundNumPrecision(this.data.currencyInfo.coinpairs[i].quotesVolume24h)
        this.data.currencyInfo.coinpairs[i].quotesVolume24h = Common.localeString(this.data.currencyInfo.coinpairs[i].quotesVolume24h)

        this.data.currencyInfo.coinpairs[i].quotesPrice = Common.autoRoundNumPrecision(this.data.currencyInfo.coinpairs[i].quotesPrice)
        this.data.currencyInfo.coinpairs[i].quotesPrice = Common.localeString(this.data.currencyInfo.coinpairs[i].quotesPrice)

        this.data.currencyInfo.coinpairs[i].quotesPriceInCurrencyUnit = Common.autoRoundNumPrecision(this.data.currencyInfo.coinpairs[i].quotesPriceInCurrencyUnit)
        this.data.currencyInfo.coinpairs[i].quotesPriceInCurrencyUnit = Common.localeString(this.data.currencyInfo.coinpairs[i].quotesPriceInCurrencyUnit)
      }

      if (res.spiders.length == 0) {
        this.setData({
          coinpairs: null
        });
      } else {
        this.setData({
          coinpairs: this.data.currencyInfo.coinpairs
        });
      }

    })
  },
  // 获取数据
  getBasicInfo: function (symbol) {
    if (wx.D) {
      var api_url = Api.currency_url + '/' + symbol
      Api.fetchGet(api_url, (err, res) => {
        res.rank = res.rank - 10000
        res.quotesPercentChange24h = (res.quotesPercentChange24h * 100).toFixed(2)
        // res.quotesVolume24h = ''
        this.currencyToLocalString(res)
        this.setChangePercentColor(res)
        this.data.currencyInfo = res
        this.setData({
          currencyInfo: this.data.currencyInfo
        });

        //set navigation bar title text
        this.setNavigationBarTitleText()
        // this.init_chart(this.data.currencyInfo)
        var exName = '广州地区';
        var ex = '';
        var exchange = {
          ex: this.data.currencyInfo.name,
          symbol: this.data.currencyInfo.symbol
        }
        this.setData({
          labelCurrencyUnit: '￥',
          labelVolume: '',
          label24Hour: '1个月',
          exchange: exchange,
          exName: exName
        });
      })
    } else {
      var api_url = Api.currency_url + '/' + symbol + '?currencyUnit=' + this.data.currencyUnit;
      Api.fetchGet(api_url, (err, res) => {
        //更新数据
        this.currencyToLocalString(res)
        this.setChangePercentColor(res)
        this.data.currencyInfo = res
        this.setData({
          currencyInfo: this.data.currencyInfo
        });

        //set navigation bar title text
        this.setNavigationBarTitleText()
        // this.init_chart(this.data.currencyInfo)
      })
    }
  },
  setOption: function(chart, currencyInfo) {
    const option = {
      backgroundColor: "",
      // color: ["#e7f3fe"],
      color: ["#4EABD9", "#67E0E3", "#9FE6B8"],
      title: {
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: currencyInfo.history.date,
        show: false
      },
      yAxis: {
        show: false,
        x: 'center',
        type: 'value'
      },
      grid: {
        top: 0,
        bottom: -10,
        left: -15,
        right: -15
      },
      series: [{
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: currencyInfo.history.close,
        areaStyle: {
        }
      }],
    };
    chart.setOption(option);
  },
  setNavigationBarTitleText: function() {
    // set navigation bar title text
    wx.setNavigationBarTitle({ title: this.data.currencyInfo.name + ' ('  + this.data.currencyInfo.symbol + ')' })
  },
  currencyToLocalString: function (currency) {
    currency.quotesPrice = currency.quotesPrice && currency.quotesPrice.toLocaleString()
    currency.quotesMarketCap = currency.quotesMarketCap && currency.quotesMarketCap.toLocaleString()
    currency.circulatingSupply = currency.circulatingSupply && currency.circulatingSupply.toLocaleString()
    currency.totalSupply = currency.totalSupply && currency.totalSupply.toLocaleString()
    currency.maxSupply = currency.maxSupply && currency.maxSupply.toLocaleString()

    if (currency.quotesVolumeInCount24h) {
      var fixNum = Number(currency.quotesVolumeInCount24h.toFixed(0));
      var obj = Common.numFormat(fixNum);
      currency.volumeInCountSuffix = obj.suffix
      currency.quotesVolumeInCount24h = obj.number
    }
    else {
      currency.quotesVolumeInCount24h = '-'
    }
    var fixNum = Number(currency.quotesVolume24h.toFixed(0));
    var obj = Common.numFormat(fixNum);
    currency.volumeSuffix = obj.suffix
    currency.quotesVolume24h = obj.number
    // currency.quotesVolume24h = currency.quotesVolume24h && Number(currency.quotesVolume24h.toFixed(1)).toLocaleString()
  },
  setChangePercentColor: function (currency) {
    if (currency.quotesPercentChange24h > 0) {
      this.data.isPercentUp = true
    } else {
      this.data.isPercentUp = false
    }
    this.setData({
      isPercentUp: this.data.isPercentUp
    })
  }
})

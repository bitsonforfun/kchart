import * as echarts from '../../utils/ec-canvas/echarts';

var Api = require('../../utils/api.js');
const app = getApp();

// function setOption(chart, currencyInfo) {
//   const option = {
//     backgroundColor: "#fff",
//     color: ["#9FE6B8"],
//     title: {
//       text: this.data.currencyInfo.name + ' Charts',
//       subtext: 'Price (USD)'
//       // subtext: currencyInfo.name
//     },
//     tooltip: {
//       trigger: 'axis'
//     },
//     dataZoom: {
//       show: true,
//       start: 70
//     },
//     xAxis: {
//       type: 'category',
//       boundaryGap: false,
//       data: currencyInfo.history.date
//     },
//     yAxis: {
//       x: 'center',
//       type: 'value'
//     },
//     series: [{
//       type: 'line',
//       smooth: true,
//       areaStyle: {},
//       data: currencyInfo.history.close
//     }
//     ]
//   };
//   chart.setOption(option);
// }

Page({
  onReady: function () {
  },
  data: {
    ex: '',
    symbol: '',
    line: {
      date: [],
      prices: []
    },
    ec: {
      lazyLoad: true
    },
    // tab
    tab: {
      list: [{
        id: '1',
        title: 'Coin List'
      }, {
        id: '2',
        title: 'Tab two'
      }, {
        id: '3',
        title: 'Tab three'
      }],
      selectedId: '1',
      scroll: false,
      height: 30
    }
  },
  onLoad: function (options) {
    this.data.ex = options.ex
    this.data.symbol = options.symbol
    // set navigation bar title text
    this.setNavigationBarTitleText()
    this.getPrices()
    // this.getCoinPairs()
  },
  init_chart: function () {
    var chart_id = '#chart-candle';
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
      this.setOption(chart);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },
  open: function (e) {
    wx.navigateTo({
      url: '../chart/index?ex=' + e.target.dataset.pair.ex + '&symbol=' + e.target.dataset.pair.symbol
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
  getPrices: function () {
    var api_url = Api.price_url + '?ex=' + this.data.ex + '&symbol=' + this.data.symbol
    Api.fetchGet(api_url, (err, res) => {
      //更新数据
      this.data.line.date = res.date
      this.data.line.prices = res.prices

      // this.setData({
      //   currencyInfo: this.data.currencyInfo
      // });

      this.init_chart(this.data.prices)
    })
  },
  getCoinPairs: function () {
    var api_url = Api.coinpair_url + '/' + this.data.currencyInfo.symbol
    Api.fetchGet(api_url, (err, res) => {
      //更新数据
      this.data.currencyInfo.coinpairs = res.spiders
      // this.setData({
      //   currencyInfo: this.data.currencyInfo
      // });
      this.setData({
        coinpairs: this.data.currencyInfo.coinpairs
      });
    })
  },
  // 获取货币数据
  getBasicInfo: function (symbol) {
    var api_url = Api.currency_url + '/' + symbol
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


    // var that = this;
    // var limit = '2';
    // var api_url = Api.currency_url + '?sort=rank_asc&limit=' + limit;

    // Api.fetchGet(api_url, (err, res) => {
    //   //更新数据
    //   that.data.currencies = res.currencies
    //   that.setData({
    //     currencies: that.data.currencies
    //   });
    //   that.ecComponent = that.selectComponent('#chart-line');
    //   that.init(that.data.currencies);
    //   // setTimeout(function () {
    //   //   that.setData({ hidden: true });
    //   //   wx.hideNavigationBarLoading();
    //   // }, 300);
    // })
  },
  setOption: function (chart) {
    const option = {



      backgroundColor: "#fff",
      color: ["#B7D7FD"],
      title: {
        text: this.data.symbol + ' (' + this.data.ex + ')',
        subtext: 'Price (USD)'
      },
      // dataZoom: {
      //   show: true,
      //   type: 'inside',
      //   start: 70
      // },
      // dataZoom: [
      //   // {
      //   //   show: false,
      //   //   type: 'inside',
      //   //   start: 50,
      //   //   end: 100
      //   // },
      //   {
      //     show: false,
      //     type: 'slider',
      //     y: '90%',
      //     start: 50,
      //     end: 100
      //   }
      // ],
      xAxis: {
        type: 'category',
        data: this.data.line.date,
        scale: true,
        boundaryGap: true,
        axisLine: { onZero: false },
        splitLine: { show: false },
        // splitNumber: 20,
        // min: 'dataMin',
        // max: 'dataMax'
      },
      // xAxis: {
      //   type: 'category',
      //   splitLine: {
      //     show: false
      //   }
      //   // data: this.data.line.date
      // },
      yAxis: {
        scale: true,
        splitArea: {
          show: true
        }
      },
      grid: {
        left: 50
      },
      series: [{
        type: 'candlestick',
        data: this.data.line.prices,
        itemStyle: {
          normal: {
            color: '#ff0000',
            color0: '#00ff00',
            borderWidth: 1,
            opacity: 1,
          }
        }
      }]







      
      // color: ["#B7D7FD"],
      // title: {
      //   text: this.data.currencyInfo.name + ' Charts',
      //   subtext: 'Price (USD)'
      //   // subtext: currencyInfo.name
      // },
      // tooltip: {
      //   trigger: 'axis'
      // },
      // dataZoom: {
      //   show: true,
      //   type: 'inside',
      //   start: 70
      // },
      // xAxis: {
      //   type: 'category',
      //   boundaryGap: false,
      //   data: currencyInfo.history.date
      // },
      // yAxis: {
      //   x: 'center',
      //   type: 'value'
      // },
      // series: [{
      //   type: 'line',
      //   smooth: true,
      //   areaStyle: {},
      //   data: currencyInfo.history.close
      // }
      // ]
    };
    chart.setOption(option);
  },
  setNavigationBarTitleText: function () {
    // set navigation bar title text
    wx.setNavigationBarTitle({ title: this.data.symbol + ' (' + this.data.ex + ')'})
  },

})

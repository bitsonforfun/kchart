import * as echarts from '../../utils/ec-canvas/echarts';

var Api = require('../../utils/api.js');
const app = getApp();


// wx chart
var wxCharts = require('../../utils/wxcharts.js');
var areaChart = null;


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
    currencyInfo: {
      name: '',
      symbol: '',
      rank: -1,
      quotesUSDPrice: 0,
      quotesUSDMarketCap: 0,
      quotesUSDVolume24h: 0,
      history: null
    },
    ec: {
      lazyLoad: true
    },
    changePercentColor: "#259D22",
  },
  onLoad: function (options) {
    // this.setData({
    //   symbol: options.symbol
    // })
    this.data.currencyInfo.symbol = options.symbol
    this.getBasicInfo(this.data.currencyInfo.symbol)
    this.getHistory()
    this.getCoinPairs()
  },
  // touchHandler: function (e) {
  //   console.log(areaChart.getCurrentDataIndex(e));
  //   areaChart.showToolTip(e);
  // },

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
          return '$' + val.toFixed(2); 
        }
        // format: function (val) {
        //   return '价格: $' + val.toFixed(2) + '/n test'; 
        //   // return val.toFixed(2) + '万';
        // }
      }],
      yAxis: {
        disabled: true,
        gridColor: '#FFFFFF',
        // title: '成交金额 (万元)',
        // format: function (val) {
        //   return val.toFixed(2);
        // },
        // min: 0,
        // fontColor: '#8085e9',
        // gridColor: '#8085e9',
        // titleFontColor: '#f7a35c'
      },
      xAxis: {
        disableGrid: true,
        fontColor: '#FFFFFF'
        // fontColor: '#7cb5ec',
        // gridColor: '#2233ec'
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
  getHistory: function () {
    var api_url = Api.history_url + '/' + this.data.currencyInfo.symbol
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
    var api_url = Api.coinpair_url + '/' + this.data.currencyInfo.symbol
    Api.fetchGet(api_url, (err, res) => {
      //更新数据
      this.data.currencyInfo.coinpairs = res.spiders
      // this.setData({
      //   currencyInfo: this.data.currencyInfo
      // });
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
  },
  setOption: function(chart, currencyInfo) {
    const option = {
      // timeline: {
      //   data: [
      //     '1小时', '24小时', '7天', '1月', '3月', '6月', '1年'
      //   ],
      //   // label: {
      //   //   formatter: function (s) {
      //   //     return s.slice(0, 4);
      //   //   }
      //   // },
      //   // autoPlay: true,
      //   // playInterval: 1000
      // },
      backgroundColor: "",
      // color: ["#e7f3fe"],
      color: ["#4EABD9", "#67E0E3", "#9FE6B8"],
      title: {
        // text: this.data.currencyInfo.name + ' Charts',
        // subtext: 'Price (USD)'
        // subtext: currencyInfo.name
      },
      tooltip: {
        trigger: 'axis'
      },
      // dataZoom: {
      //   show: false,
      //   type: 'inside',
      //   start: 70
      // },
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
        // itemStyle: {
        //   normal: {
        //     lineStyle: {
        //       color: '#0084ff',
        //       width: 1.5
        //     }
        //   }
        // },
        areaStyle: {
          // normal: {
          //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          //     offset: 0,
          //     color: '#e7f3fe'
          //   }, {
          //     offset: 1,
          //     color: 'rgba(0,0,0,0)'
          //   }]),
          // }
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
    currency.quotesUSDPrice = currency.quotesUSDPrice && currency.quotesUSDPrice.toLocaleString()
    currency.quotesUSDMarketCap = currency.quotesUSDMarketCap && currency.quotesUSDMarketCap.toLocaleString()
    currency.circulatingSupply = currency.circulatingSupply && currency.circulatingSupply.toLocaleString()
    currency.totalSupply = currency.totalSupply && currency.totalSupply.toLocaleString()
    currency.maxSupply = currency.maxSupply && currency.maxSupply.toLocaleString()
    currency.quotesUSDVolume24h = currency.quotesUSDVolume24h && currency.quotesUSDVolume24h.toLocaleString()
  },
  setChangePercentColor: function (currency) {
    if (currency.quotesUSDPercentChange24h > 0) {
      this.data.changePercentColor = '#259D22'
    } else {
      this.data.changePercentColor = '#DC143C'
    }
    this.setData({
      changePercentColor: this.data.changePercentColor
    })
  }
})
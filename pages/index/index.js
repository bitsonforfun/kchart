import * as echarts from '../../utils/ec-canvas/echarts';

var Api = require('../../utils/api.js');
const app = getApp();

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
    // 获取组件
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
    
    // // percent change color, green when positive, otherwise red
    // isPercentChangePositive: true,

    // tab
    tab: {
      list: [{
        id: '1',
        title: '基础链'
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
  },
  onLoad: function () {
  },
  // init_charts: function (items) {
  //   this.chartArray = new Array();
  //   for (var i = 0; i < items.length; i++) {
  //     var item = items[i];
  //     var chart_id = '#chart-line-' + item.id;
  //     var ecComponentArray = new Array();
  //     ecComponentArray[item.id] = this.selectComponent(chart_id);
      
  //     ecComponentArray[item.id].init((canvas, width, height) => {
  //       // 获取组件的 canvas、width、height 后的回调函数
  //       // 在这里初始化图表
  //       const chart = echarts.init(canvas, null, {
  //         width: width,
  //         height: height
  //       });

  //       var data = item.line.split(",")
  //       setOption(chart, data);

  //       // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
  //       this.chartArray[item.id] = chart;

  //       // 注意这里一定要返回 chart 实例，否则会影响事件处理等
  //       return chart;
  //     });
  //   }
  // },
  open: function (e) {
    wx.navigateTo({
      url: '../basic/index?symbol=' + e.currentTarget.dataset.currency.symbol
      // url: '../chart2/index'
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
  onReachBottom: function () {
    // this.loadMore();
    this.getData(this.data.countPerPage, this.data.cursor);
    console.log('上拉加载更多', new Date());
  },
  // 获取货币列表数据
  getData: function (countPerPage, cursor) {
    var that = this;
    var api_url = Api.currency_url + '?sort=rank_asc&limit=' + countPerPage + '&start=' + cursor;

    Api.fetchGet(api_url, (err, res) => {
      //更新数据
      // that.data.currencies = res.currencies
      for (var i = 0; i < res.currencies.length; i++) {
        that.currencToLocalString(res.currencies[i])
        that.setChangePercentColor(res.currencies[i])
        that.data.currencies.push(res.currencies[i])
      }

      // 更新页面模型
      that.setData({
        currencies: that.data.currencies
      });
      
      // 更新历史线图
      // that.init_charts(that.data.currencies);
      that.data.cursor = that.data.cursor + that.data.countPerPage;

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
  loadMore: function (limit) {
    // var that = this;
    // var api_url = Api.currency_url + '?sort=rank_asc&limit=' + limit;

    // Api.fetchGet(api_url, (err, res) => {
    //   //更新数据
    //   that.data.currencies = res.currencies
    //   that.setData({
    //     currencies: that.data.currencies
    //   });
    //   // that.ecComponent = that.selectComponent('#chart-line');
    //   that.init_charts(that.data.currencies);
    //   // setTimeout(function () {
    //   //   that.setData({ hidden: true });
    //   //   wx.hideNavigationBarLoading();
    //   // }, 300);
    // })
  },
})

/**
 * Created by Lipeizhao on 2018/5/28.
 */

var Api = require('../../utils/api.js');
var Common = require('../../common/helper.js');
const _ = wx.T._

var app = getApp();
var kl = require('../../utils/wxChart/k-line');
var axisShow = require('../../utils/wxChart/axis-show');
var kAxisShow
var getOptionKline1 = function (type) {
  return {
    name: type || 'dk',
    width: 'auto',
    height: 250,
    average: [5, 10, 20],
    axis: {
      row: 4,
      col: 5,
      showX: false,
      showY: true,
      showEdg: true,
      paddingTop: 0,
      paddingBottom: 1,
      paddingLeft: 0,
      paddingRight: 0,
      color: '#cdcdcd'
    },
    xAxis: {
      data: [],
      averageLabel: []
    },
    yAxis: [],
    callback: function (time) {
      var page = getCurrentPages();
      page = page[page.length - 1];
      page.setData({
        kl1RenderTime: time
      });
    }
  };
};
var getOptionKline2 = function (type) {
  return {
    name: type || 'dk',
    width: 'auto',
    height: 80,
    average: [5, 10, 20],
    axis: {
      row: 1,
      col: 5,
      showX: false,
      showY: true,
      showEdg: true,
      paddingTop: 0,
      paddingBottom: 14,
      paddingLeft: 0,
      paddingRight: 0,
      color: '#cdcdcd'
    },
    xAxis: {
      times: [],
      data: [],
      averageLabel: []
    },
    yAxis: [],
    callback: function (time) {
      var page = getCurrentPages();
      page = page[page.length - 1];
      page.setData({
        kl2RenderTime: time
      });
    }
  };
};
var kLine, kLineB;
var ma5Arr, ma10Arr, ma20Arr,
  ma5bArr, ma10bArr, ma20bArr;

Page({
  data: {
    ma5: '',
    ma10: '',
    ma20: '',
    ma5b: '',
    ma10b: '',
    ma20b: '',
    tabName: '',
    stock: '',
    code: '',
    time: '',
    yc: '',
    kl1RenderTime: 0,
    kl2RenderTime: 0,
    selectIndex: 0,
    minArray: ['1天'],
    symbol: '',
    ex: '',
    data: null,
    market: null,
    tabSlices: [],
    selectSlices: null,
    sliceNames: {
      '1m': _('Label1Minute'),
      '5m': _('Label5Minute'),
      '15m': _('Label15Minute'),
      '30m': _('Label30Minute'),
      '1h': _('Label1Hour'),
      '6h': _('Label6Hour'),
      '1d': _('Label1Day'),
      '1mon': _('Label1Month')
    },
    xStart: 0,
    xEnd: 0,
    chartLoaded: 1,
    initialPrices: null,
    // 国际化
    labelKHigh: _('LabelKHigh'),
    labelKLow: _('LabelKLow'),
    labelKOpen: _('LabelKOpen'),
    labelKCloseYesterday: _('LabelKCloseYesterday'),
    labelKVolume: _('LabelKVolume'),
    labelKValue: _('LabelKValue'),

    currencyUnit: 'USD'
  },
  onShareAppMessage: function (res) {
    return {
      title: '价格列表',
      path: 'pages/chart/index?ex=' + this.data.ex + '&symbol=' + this.data.symbol
    }
  },
  onLoad: function (options) {
    if (Common.hasToken()) {
      this.data.currencyUnit = app.globalData.userInfo.currencyUnit
      this.data.labelCurrencyUnit = Common.getCurrencyUnitSymbol(this.data.currencyUnit)
    } else {
      this.data.currencyUnit = 'USD'
      this.data.labelCurrencyUnit = Common.getCurrencyUnitSymbol(this.data.currencyUnit)
    }
    this.setData({
      currencyUnit: this.data.currencyUnit,
      labelCurrencyUnit: this.data.labelCurrencyUnit
    })

    // 从上一个页面传进参数
    this.data.ex = options.ex
    this.data.symbol = options.symbol

    // 设置导航文字
    this.setNavigationBarTitleText()

    this.getSlice()

    if (wx.D) {
      this.tabChart({
        target: {
          dataset: {
            type: '1mon'
          }
        }
      })
    } else {
      this.tabChart({
        target: {
          dataset: {
            type: '15m'
          }
        }
      })
    }
  },
  getSlice: function () {
    if (wx.D) {
      this.data.tabSlices.push('1mon')
      this.setData({
        tabSlices: this.data.tabSlices,
        selectSlices: this.data.selectSlices,
        sliceNames: this.data.sliceNames
      });
    } else {
      var api_url = Api.market_url + '/' + this.data.ex;
      Api.fetchGet(api_url, (err, res) => {
        this.data.market = res
        var slicesLength = res.slices.length;
        if (res) {
          for (var i = 0; i < slicesLength; i++) {
            if (slicesLength <= 4) {
              this.data.tabSlices.push(res.slices[i])
            } else {
              if (i < 3) {
                this.data.tabSlices.push(res.slices[i])
              } else {
                if (!this.data.selectSlices) {
                  this.data.selectSlices = new Array()
                }
                // var displayName = this.data.sliceNames[res.slices[i]];
                // this.data.selectSlices.push(displayName)
                var obj = {
                  id: res.slices[i],
                  name: this.data.sliceNames[res.slices[i]]
                }
                this.data.selectSlices.push(obj)
              }
            }
          }
        }
        this.setData({
          tabSlices: this.data.tabSlices,
          selectSlices: this.data.selectSlices,
          sliceNames: this.data.sliceNames
        });
      })
    }
  },
  setChartLoading: function () {
    this.setData({
      chartLoaded: 1
    });
  },
  setChartLoaded: function () {
    this.setData({
      chartLoaded: 0
    });
  },
  tabChart: function (e) {
    this.setChartLoading()
    var type = e.target.dataset.type;
    var api_url = Api.price_url + '?ex=' + this.data.ex + '&symbol=' + this.data.symbol + '&slice=' + type + '&currencyUnit=' + this.data.currencyUnit;
    this.data.tabName = type;
    // clear axis show

    Api.fetchGet(api_url, (err, res) => {
      this.data.data = {
        "symbol": "测试数据",
        "ex": "gdax",
        "code": "100000",
        "info": {
          "yc": "15.99",
          "pricedigit": "0.00"
        },
        "data": res.prices
      }
      this.setChartLoaded()
      this.setData({
        tabName: this.data.tabName,
        symbol: this.data.symbol,
        ex: this.data.ex,
      });

      this.draw(this.data.data, this.data.tabName);
      
      // 设置初始值的显示
      var lastPos = kLine.getLastCandleXAxis();
      this.setPrice(lastPos)
    })

    //bitson
    kAxisShow = axisShow('kline-axis', {
      //todo: 配置项
      type: 'ts',
      height: 350,
      width: 'auto',
      maxY: 100,
      minY: 0
    });
    kAxisShow.init();
    kAxisShow.stop();
  },
  tabMinChart: function (e) {
    this.setChartLoading()
    var index = e.detail.value;
    // index = index === '' ? 0 : index;
    // var type = this.data.selectSlices[index];
    var type = this.data.selectSlices[index].id;
    var api_url = Api.price_url + '?ex=' + this.data.ex + '&symbol=' + this.data.symbol + '&slice=' + type;
    this.data.tabName = 'selectK';

    Api.fetchGet(api_url, (err, res) => {
      this.data.data = {
        "symbol": "测试数据",
        "ex": "gdax",
        "code": "100000",
        "info": {
          "yc": "15.99",
          "pricedigit": "0.00"
        },
        "data": res.prices
      }
      this.setChartLoaded()
      this.setData({
        selectIndex: e.detail.value,
        tabName: this.data.tabName,
        symbol: this.data.symbol,
        ex: this.data.ex,
      });
      this.draw(this.data.data, this.data.tabName);

      // 设置初始值的显示
      var lastPos = kLine.getLastCandleXAxis();
      this.setPrice(lastPos)
    })
    //bitson
    kAxisShow = axisShow('kline-axis', {
      //todo: 配置项
      type: 'ts',
      height: 260,
      width: 'auto',
      maxY: 100,
      minY: 0
    });
    kAxisShow.init();
    kAxisShow.stop();
  },
  draw: function (data, type) {
    kLine = kl('k-line').init(getOptionKline1(type));
    kLine.metaData1(data, getOptionKline1(type));
    kLine.draw();

    kLineB = kl('k-line-b').init(getOptionKline2(type));
    kLineB.metaData2(data, getOptionKline2(type));
    kLineB.draw();

    var yAxis1 = kLine.options.yAxis;
    var yAxis2 = kLineB.options.yAxis;
    ma5Arr = yAxis1[1].dataShow;
    ma10Arr = yAxis1[2].dataShow;
    ma20Arr = yAxis1[3].dataShow;
    ma5bArr = yAxis2[1].dataShow;
    ma10bArr = yAxis2[2].dataShow;
    ma20bArr = yAxis2[3].dataShow;
    this.showLastAverage();
  },
  showLastAverage: function () {
    this.setData({
      ma5: ma5Arr[ma5Arr.length - 1],
      ma10: ma10Arr[ma10Arr.length - 1],
      ma20: ma20Arr[ma20Arr.length - 1],
      ma5b: ma5bArr[ma5bArr.length - 1],
      ma10b: ma10bArr[ma10bArr.length - 1],
      ma20b: ma20bArr[ma20bArr.length - 1]
    });
  },
  setNavigationBarTitleText: function () {
    // set navigation bar title text
    wx.setNavigationBarTitle({ title: this.data.ex + ' ' + this.data.symbol })
  },
  numFormat: function (value, symbol) {
    var obj = {
      symbol: symbol || "",    //类型  
      int: undefined,    //整数位  
      dec: undefined,  //小数位  
      targ: "",          //正负  
      times: ['', '万', '亿', '万亿', '亿亿']
    }
    value = String(value);
    var reg = /^-?\d+\.?\d+$/;
    if (!reg.test(value)) {
      return false;
    }

    if (value[0] == "-") {
      obj.targ = "-";
      value = value.substring(1, value.length)
    }

    var times = 0;
    value = Number(value);
    while (value > 10000) {
      value = value / 10000;
      times++;
    }

    value = value.toFixed(1)

    var arr = String(value).split(".")
    obj.dec = arr[1];
    obj.int = arr[0];
    if (obj.int.length > 3) {
      obj.int = obj.int.replace(/(.{1})/, '$1,')
    }

    return obj.symbol + obj.targ + obj.int + "." + obj.dec + obj.times[times];
  },
  autoRoundNumPrecision: function(value) {
    var arr = String(value).split(".");
    if (arr[0] && Number(arr[0]) != 0) {
      return value.toFixed(2)
    } else {
      return value.toFixed(6)
    }
  },
  setPrice: function (x) {
    var rightMostCandelXAxis = kLine.getLastCandleXAxis();
    if (x < 0 || x > rightMostCandelXAxis) {
      return
    }
    //bitson
    var p = kLine.getPriceByXaxis(x);

    //bitson color
    var cColor = p.f > 0 ? "#fd4040" : "#30ac30";
    // var f = p.f.split("%")[0];
    // f = parseFloat(f);
    // var cColor = f > 0 ? "#fd4040" : "#30ac30";

    //bitson volume
    var v = this.numFormat(p.v, '');

    this.setData({
      date: p.date,
      l: this.autoRoundNumPrecision(p.l),
      h: this.autoRoundNumPrecision(p.h),
      s: this.autoRoundNumPrecision(p.s),
      c: this.autoRoundNumPrecision(p.c),
      y: this.autoRoundNumPrecision(p.y),
      v: v,
      e: p.e? p.e:'-',
      f: parseFloat((p.f * 100).toFixed(4)),
      ze: '-',
      cColor: cColor
    });
  },
 
  axisStart: function (e) {
    var x = e.touches[0].x;
    var y = e.touches[0].y;
    this.data.isShowAxis = true;
    kAxisShow.start(x, y);
    this.setPrice(x);
  },
  moveStart: function (e) {
    var x = e.touches[0].x;
    var y = e.touches[0].y;
    kAxisShow.stop();
    this.data.isShowAxis = false;
    this.data.xStart = x
  },
  axisMove: function (e) {
    var x = e.touches[0].x;
    var y = e.touches[0].y;
    if (this.data.isShowAxis) {
      kAxisShow.move(x, y);
      this.setPrice(x);
    } else {
      if (!this.data.isXSet) {
        this.data.isXSet = true;
        this.data.xStart = x
      } else {
        if (Math.abs(x - this.data.xStart) > 10) {
          var length = x - this.data.xStart;
          kLine.tapMove1(length);
          kLineB.tapMove2(length);
          kLine.draw();
          kLineB.draw();
          this.data.isXSet = false;
        }
      }
    }
  },
  axisStop: function () {
    if (this.data.isShowAxis) {
      this.data.isShowAxis = false;
    } else {
    }
  }
});

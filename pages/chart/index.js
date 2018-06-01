/**
 * Created by Lipeizhao on 2018/5/28.
 */
var Api = require('../../utils/api.js');

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
      '1m': '1分钟',
      '5m': '5分钟',
      '15m': '15分钟',
      '30m': '30分钟',
      '1h': '1小时',
      '6h': '6小时',
      '1d': '1天'
    }
  },
  onLoad: function (options) {
    // 从上一个页面传进参数
    this.data.ex = options.ex
    this.data.symbol = options.symbol

    // 设置导航文字
    this.setNavigationBarTitleText()

    // 获取k线粒度
    this.getSlice()

    // 默认切换到15m钟线
    this.tabChart({
      target: {
        dataset: {
          type: '15m'
        }
      }
    })
  },
  getSlice: function () {
    var api_url = Api.market_url + '/' + this.data.ex;
    Api.fetchGet(api_url, (err, res) => {
      this.data.market = res
      if (res) {
        for (var i = 0; i < res.slices.length; i++) {
          if (i < 3) {
            this.data.tabSlices.push(res.slices[i])
          } else {
            if (!this.data.selectSlices) {
              this.data.selectSlices = new Array()
            }
            this.data.selectSlices.push(res.slices[i])
          }
        }
      }
      this.setData({
        tabSlices: this.data.tabSlices,
        selectSlices: this.data.selectSlices,
        sliceNames: this.data.sliceNames
      });
    })
  },
  tabChart: function (e) {
    var type = e.target.dataset.type;
    var api_url = Api.price_url + '?ex=' + this.data.ex + '&symbol=' + this.data.symbol + '&slice=' + type;
    this.data.tabName = type;
    // clear axis show

    Api.fetchGet(api_url, (err, res) => {
      this.data.data = {
        "symbol": "测试数据",
        "ex": "gdax",
        "code": "100000",
        "info": {
          // "c": "15.77",
          // "h": "15.90",
          // "l": "15.70",
          // "o": "15.80",
          // "a": "231127600",
          // "v": "146514",
          "yc": "15.99",
          // "time": "2017-01-18 10:49:21",
          // "ticks": "34200|54000|0|34200|41400|46800|54000",
          // "total": "678",
          "pricedigit": "0.00"
        },
        "data": res.prices
      }

      this.setData({
        tabName: this.data.tabName,
        symbol: this.data.symbol,
        ex: this.data.ex,
      });
      this.draw(this.data.data, this.data.tabName);
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
    // var type = 'd';
    var index = e.detail.value;
    index = index === '' ? 0 : index;

    // var typeList = ['1', '7', '30', '365'];
    var type = this.data.selectSlices[index];

    var api_url = Api.price_url + '?ex=' + this.data.ex + '&symbol=' + this.data.symbol + '&slice=' + type;
    this.data.tabName = 'selectK';

    Api.fetchGet(api_url, (err, res) => {
      // this.data.data = res.prices

      this.data.data = {
        "symbol": "测试数据",
        "ex": "gdax",
        "code": "100000",
        "info": {
          // "c": "15.77",
          // "h": "15.90",
          // "l": "15.70",
          // "o": "15.80",
          // "a": "231127600",
          // "v": "146514",
          "yc": "15.99",
          // "time": "2017-01-18 10:49:21",
          // "ticks": "34200|54000|0|34200|41400|46800|54000",
          // "total": "678",
          "pricedigit": "0.00"
        },
        "data": res.prices
      }

      this.setData({
        tabName: this.data.tabName,
        symbol: this.data.symbol,
        ex: this.data.ex,
      });
      this.draw(this.data.data, this.data.tabName);
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
      symbol: symbol || "",    //货币类型  
      int: undefined,    //整数位  
      dec: undefined,  //小数位  
      targ: "",          //正负  
      times: ['', '万', '亿', '万亿', '亿亿']
    }
    value = String(value);
    var reg = /^-?\d+\.?\d+$/;
    if (!reg.test(value)) {
      // alert("请输入数字");
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

    value = value.toFixed(2)

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
      // l: p.l?p.l:p.l.toFixed(2), // 低
      // h: p.h ? p.h : p.h.toFixed(2), // 高 
      // s: p.s ? p.s : p.s.toFixed(2), // 开
      // c: p.c ? p.c : p.c.toFixed(2), // 收
      // y: p.y ? p.y : p.y.toFixed(2), // 昨收

      l: this.autoRoundNumPrecision(p.l), // 低
      h: this.autoRoundNumPrecision(p.h), // 高 
      s: this.autoRoundNumPrecision(p.s), // 开
      c: this.autoRoundNumPrecision(p.c), // 收
      y: this.autoRoundNumPrecision(p.y), // 昨收
      v: v, // 量
      e: p.e? p.e:'-', // 额
      f: parseFloat((p.f * 100).toFixed(4)), // 震幅 取4位小数
      ze: '-', // 震额
      cColor: cColor
    });
  },
  // axisStart: function (e) {
  //   var x = e.touches[0].x;
  //   var y = e.touches[0].y;
  //   this.data.isShowAxis = true;
  //   kAxisShow.start(x, y);

  //   this.setPrice(x);
  // },
  // axisMove: function (e) {
  //   if (this.data.isShowAxis) {
  //     var x = e.touches[0].x;
  //     var y = e.touches[0].y;
  //     kAxisShow.move(x, y);
  //     this.setPrice(x);
  //   }
  // },
  axisStart: function (e) {
    var x = e.touches[0].x;
    var y = e.touches[0].y;
    // var x = e.detail.x;
    // var y = e.detail.y;
    this.data.isShowAxis = true;
    kAxisShow.start(x, y);
    this.setPrice(x);
  },
  axisMove: function (e) {
    if (this.data.isShowAxis) {
      var x = e.touches[0].x;
      var y = e.touches[0].y;
      kAxisShow.move(x, y);
      this.setPrice(x);
    }
  },
  axisStop: function () {
    // this.data.isShowAxis = false;
    // kAxisShow.stop();
  }
});

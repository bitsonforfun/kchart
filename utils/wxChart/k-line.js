/**
 * Created by ChenChao on 2017/1/4.
 */

var common = require('./common');
var axis = require('./axis-k')();

// 精度
var AVERAGE_CALCULATION_PRECISION = 5

module.exports = function (canvasId) {
  return {
    unit: 60,  //不同K线，X轴的单位，默认60
    canvasId: canvasId,
    averageColors: ['#6A6969', '#F69A43', '#EDB2EB'],
    ctx: null,
    canvasWidth: 0,
    canvasHeight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    options: null,
    dataStore: null,
    index: 0,
    yMax: 0,
    yMin: 1000000,
    isNew: false,
    offsetX: 0,
    startTime: '',
    endTime: '',
    txtColor: 'white',
    axisObj: null,
    cursor: null,
    init: function (options) {
      this.ctx = wx.createCanvasContext(this.canvasId);
      this.initConfig(options);
      return this;
    },
    initConfig: function (options) {
      var that = this;
      var axis = options.axis;
      var w = options.width;
      var h = options.height;
      if (w === 'auto') {
        wx.getSystemInfo({
          success: function (result) {
            w = that.canvasWidth = result.windowWidth;
          }
        });
      }
      if (h === 'auto') {
        h = 225;
      }
      this.canvasWidth = w;
      this.canvasHeight = h;
      this.unit = options.unit || this.unit;
      this.paddingTop = axis.paddingTop;
      this.paddingBottom = axis.paddingBottom;
      this.paddingLeft = axis.paddingLeft;
      this.paddingRight = axis.paddingRight;
      this.dataStore = options;
    },
    getLastCandleXAxis: function () {
      var rightMost = this.canvasWidth - this.paddingRight - 1;
      return rightMost
    },
    getPriceByXaxis: function (xAxis) {
      var barW = (this.canvasWidth - this.paddingLeft - this.paddingRight) / this.unit;
      var gap = this.options.yAxis[0].gap;
      var index = null;
      var data = null;
      var y = null;

      if (this.offsetX > 0) {
        index = Math.floor((xAxis - this.paddingLeft) / (gap + barW));
        data = this.options.yAxis[0];
        y = 0;
        if (index > this.offsetX) {
          return {
            date: '',
            l: 0,
            h: 0,
            c: 0,
            s: 0,
            y: 0,
            v: 0,
            e: 0,
            f: 0,
            index: index
          }
        } else {
          if (index != 0) {
            y = data.data_c[index + this.offsetX]
          }
          return {
            date: this.options.xAxis.data[index + this.offsetX],
            l: data.data_l[index + this.offsetX],
            h: data.data_h[index + this.offsetX],
            c: data.data_c[index + this.offsetX],
            s: data.data_s[index + this.offsetX],
            y: y,
            v: data.data_v[index + this.offsetX],
            e: data.data_e[index + this.offsetX],
            f: data.data_f[index + this.offsetX],
            index: index
          }
        }
      } else {
        index = Math.floor((xAxis - this.paddingLeft) / (gap + barW));
        data = this.options.yAxis[0];
        y = 0;
        if (index != 0) {
          y = data.data_c[index - 1]
        }
        return {
          date: this.options.xAxis.data[index],
          l: data.data_l[index],
          h: data.data_h[index],
          c: data.data_c[index],
          s: data.data_s[index],
          y: y,
          v: data.data_v[index],
          e: data.data_e[index],
          f: data.data_f[index],
          index: index
        }
      }
      
      
    },
    // bitsonbitson
    tapMove1: function (length) {
      //////////////////////////
      // k 线部分
      //////////////////////////
      var dataStore = this.options;
      if (dataStore.originData.length < this.offsetX) {
        return
      }

      var yMax = this.yMax = 0;
      var yMin = this.yMin = 1000000;

      dataStore.yAxis = []
      var xAxis = dataStore.xAxis;
      var yAxis = dataStore.yAxis;
      var originData = dataStore.originData;
      var canvasWidth = this.canvasWidth;
      var paddingLeft = this.paddingLeft;
      var paddingRight = this.paddingRight;
      var unit = this.unit;
      var average = dataStore.average;
      var averageColors = this.averageColors;
      var historyStep = Math.max.apply(null, average) || 0;
      var odl = originData.length;

      // moveUnit 可以是正数或负数，正数是向左移动，负数是向右移动
      var moveUnit = Math.ceil(length / (canvasWidth - paddingLeft - paddingRight) * unit);
      var cursor = this.cursor;

      cursor = cursor - moveUnit
      // 如果数据不足以支持移动的幅度，则只移动显示剩下的数据
      if (cursor - unit - historyStep < 0) {
        cursor = unit + historyStep
      } else if (cursor > originData.length) {
        cursor = originData.length
      }
      this.cursor = cursor

      var data = originData.slice(cursor - unit, cursor);
      var historyData = originData.slice(0, cursor - unit);
      if (cursor - unit > historyStep) {
        historyData = historyData.slice(historyData.length - historyStep)
      }
      var totalData = historyData.concat(data);
      
      yAxis.push({  //创建蜡烛趋势
        type: 'candle',
        gap: 0,
        showLabel: true,
        data_h: [],  //最高
        data_l: [],  //最低
        data_s: [],  //开盘
        data_c: [],  //收盘（现价）

        //bitson
        data_v: [],
        data_e: [],
        data_f: [],

        yin_yang: [] //阴阳: true为阳，false为阴
      });

      average.forEach(function (val, index) {
        // dataStore.xAxis.averageLabel.push('MA' + val + ':');
        yAxis.push({  //创建均线趋势
          name: 'MA' + val,
          type: 'line',
          lineColor: averageColors[index],
          data: [],
          dataShow: [],
          val: val,
          isNew: dataStore.isNew,
          odl: odl,
          hide: odl < val
        });
      });

      totalData.forEach(function (item, index) {
        var d = item.split(',');
        var t = d[0]; //时间
        var s = d[1] / 1; //开盘价
        var c = d[2] / 1; //现价
        var h = d[3] / 1; //最高价
        var l = d[4] / 1; //最低价

        // bitson
        var v = d[5] / 1; //量
        var e = d[6] / 1; //额
        var f = d[7];   //振幅

        if (index >= historyStep) { //从历史数据之后开始计算画图所需数据
          var dataIndex = index - historyStep;
          var candleOpt = yAxis[0];
          yMin = Math.min(l == 0 ? yMin : l, yMin);
          xAxis.data[dataIndex] = t;
          candleOpt['data_h'].push(h);
          candleOpt['data_l'].push(l);
          candleOpt['data_s'].push(s);
          candleOpt['data_c'].push(c);

          //bitson
          candleOpt['data_v'].push(v);
          candleOpt['data_e'].push(e);
          candleOpt['data_f'].push(f);

          candleOpt['yin_yang'].push(c >= s);
          yMax = Math.max(h, yMax);
          average.forEach(function (val, i) { //计算均线数据
            var dataValue = dealAverage(val, index, totalData, 2, odl); //收盘（现）价均值
            yAxis[i + 1].data.push(dataValue);
            yAxis[i + 1].dataShow.push(common.metaUnit(dataValue));
          });
        }
      });

      dataStore.axis.yMax = this.yMax = yMax;
      dataStore.axis.yMin = this.yMin = yMin;
      dataStore.unit = this.unit;
      dataStore.canvasWidth = this.canvasWidth;
      dataStore.canvasHeight = this.canvasHeight;
      this.setOptions(dataStore);
    },
    tapMove2: function (length) {
      //////////////////////////
      // 成交量部分
      //////////////////////////
      var dataStore = this.options;
      if (dataStore.originData.length < this.offsetX) {
        return
      }
      
      var startTime = this.startTime;
      var endTime = this.endTime;
      var yMax = this.yMax = 0;
      var yMin = this.yMin = 1000000;
      var baseV = dataStore.origin.info.v;

      dataStore.yAxis = []
      var xAxis = dataStore.xAxis;
      var yAxis = dataStore.yAxis;
      var originData = dataStore.originData;
      var canvasWidth = this.canvasWidth;
      var paddingLeft = this.paddingLeft;
      var paddingRight = this.paddingRight;
      var unit = this.unit;
      var average = dataStore.average;
      var averageColors = this.averageColors;
      var historyStep = Math.max.apply(null, average) || 0;
      var odl = originData.length;

      // moveUnit 可以是正数或负数，正数是向左移动，负数是向右移动
      var moveUnit = Math.ceil(length / (canvasWidth - paddingLeft - paddingRight) * unit);
      var cursor = this.cursor;

      cursor = cursor - moveUnit
      // 如果数据不足以支持移动的幅度，则只移动显示剩下的数据
      if (cursor - unit - historyStep < 0) {
        cursor = unit + historyStep
      } else if (cursor > originData.length) {
        cursor = originData.length
      }
      this.cursor = cursor
      
      var data = originData.slice(cursor - unit, cursor);
      var historyData = originData.slice(0, cursor - unit);
      if (cursor - unit > historyStep) {
        historyData = historyData.slice(historyData.length - historyStep)
      }
      var totalData = historyData.concat(data);

      yAxis.push({  //创建成交量图
        type: 'bar',
        color: [],
        data: [],
        cData: [],
        gap: 1,
        isBottomBar: true,
        showMax: true
      });
      /*if(odl < 20){
          average.pop();
      }
      if(odl < 10){
          average.pop();
      }
      if(odl < 5){
          average.pop();
      }*/
      average.forEach(function (val, index) {
        dataStore.xAxis.averageLabel.push('MA' + val + ':');
        yAxis.push({  //创建均线趋势
          name: 'MA' + val,
          type: 'line',
          lineColor: averageColors[index],
          data: [],
          dataShow: [],
          hide: odl < val
        });
      });
      
      var barOpt = yAxis[0];
      totalData.forEach(function (item, index) {
        var d = item.split(',');
        var t = d[0]; //时间
        var v = d[5] / 1; //成交量
        var c = d[2] / 1; //现价
        yMax = Math.max(v, yMax);
        yMin = Math.min(v, yMin);
        if (index >= historyStep) { //从历史数据之后开始计算画图所需数据
          var dataIndex = index - historyStep;
          xAxis.data[dataIndex] = t;
          if (dataIndex === 0) {
            startTime = t.split('-').join('');
          }
          if (dataIndex + 1 === totalData.length - historyStep) {
            endTime = t.split('-').join('');
          }
          barOpt.data[dataIndex] = v;
          barOpt.cData[dataIndex] = c;
          average.forEach(function (val, i) { //计算均线数据
            var dataValue = dealAverage(val, index, totalData, 5, odl); //成交量均值
            yAxis[i + 1].data.push(dataValue);
            yAxis[i + 1].dataShow.push(common.metaUnit(dataValue));
          });
        }
      });

      barOpt.data.forEach(function (item, index) {
        //barOpt.color[index] = '#E6DB74';
        //console.log(barOpt.cData[index], barOpt.cData[index - 1], barOpt.cData[index] - barOpt.cData[index - 1]);
        barOpt.color[index] = barOpt.cData[index] - (index === 0 ? baseV : barOpt.cData[index - 1]) < 0 ? '#4cda64' : '#ff2f2f';
      });

      dataStore.axis.yMax = this.yMax = yMax;
      dataStore.axis.yMin = this.yMin = 0;
      dataStore.metaUnit = true;
      if (odl < 60) {
        startTime = origin.data[0].split(',')[0];
        startTime = startTime.split('-').join('');
      }
      this.startTime = startTime;
      this.endTime = endTime;
      xAxis.times = [startTime, endTime];
      this.setOptions(dataStore);
    },
    metaData1: function (origin, options) {
      var dataStore = options;
      var yMax = this.yMax = 0;
      var yMin = this.yMin = 1000000;
      var xAxis = dataStore.xAxis;
      var yAxis = dataStore.yAxis;
      var average = dataStore.average;
      var averageColors = this.averageColors;
      var historyStep = Math.max.apply(null, average) || 0;
      var originData = origin.data.slice(0);
      var odl = origin.data.length;

      //存下原始数据，待之后使用
      dataStore.originData = originData

      //处理小于 unit 条数据的情况
      dataStore.isNew = this.isNew;
      dataStore.offsetX = this.offsetX;
      if (odl < this.unit) {
        dataStore.isNew = this.isNew = true;
        dataStore.offsetX = this.offsetX = odl;
      }
      var tempArr = [];
      if (originData.length < (this.unit + historyStep)) {
        for (var i = 0; i < this.unit + historyStep - originData.length; i++) {
          tempArr.push("0000-00-00,00.00,00.00,00.00,00.00,00.00,00.00,0.00%");
        }
        originData = tempArr.concat(originData);
      }
      var data = originData.slice(originData.length - this.unit);
      var historyData = originData.slice(0, originData.length - this.unit);  //计算均线所需历史数据
      historyData = historyData.slice(historyData.length - historyStep);
      var totalData = historyData.concat(data);

      // bitson 记录cursor位置，即显示数据的最右端在数据集中的偏移量
      this.cursor = originData.length

      yAxis.push({  //创建蜡烛趋势
        type: 'candle',
        gap: 0,
        showLabel: true,
        data_h: [],  //最高
        data_l: [],  //最低
        data_s: [],  //开盘
        data_c: [],  //收盘（现价）

        //bitson
        data_v: [],
        data_e: [],
        data_f: [],

        yin_yang: [] //阴阳: true为阳，false为阴
      });
      /*if(odl < 20){
          average.pop();
      }
      if(odl < 10){
          average.pop();
      }
      if(odl < 5){
          average.pop();
      }*/
      average.forEach(function (val, index) {
        dataStore.xAxis.averageLabel.push('MA' + val + ':');
        yAxis.push({  //创建均线趋势
          name: 'MA' + val,
          type: 'line',
          lineColor: averageColors[index],
          data: [],
          dataShow: [],
          val: val,
          isNew: dataStore.isNew,
          odl: odl,
          hide: odl < val
        });
      });
      //"2017-01-06,17.00,17.10,17.40,16.90,1462083,25.1亿,2.95%" [日期，开盘价，现价，最高价，最低价，成交量，成交额，振幅]
      totalData.forEach(function (item, index) {
        var d = item.split(',');
        var t = d[0]; //时间
        var s = d[1] / 1; //开盘价
        var c = d[2] / 1; //现价
        var h = d[3] / 1; //最高价
        var l = d[4] / 1; //最低价

        // bitson
        var v = d[5] / 1; //量
        var e = d[6] / 1; //额
        var f = d[7];   //振幅

        if (index >= historyStep) { //从历史数据之后开始计算画图所需数据
          var dataIndex = index - historyStep;
          var candleOpt = yAxis[0];
          yMin = Math.min(l == 0 ? yMin : l, yMin);
          xAxis.data[dataIndex] = t;
          candleOpt['data_h'].push(h);
          candleOpt['data_l'].push(l);
          candleOpt['data_s'].push(s);
          candleOpt['data_c'].push(c);

          //bitson
          candleOpt['data_v'].push(v);
          candleOpt['data_e'].push(e);
          candleOpt['data_f'].push(f);

          candleOpt['yin_yang'].push(c >= s);
          yMax = Math.max(h, yMax);
          average.forEach(function (val, i) { //计算均线数据
            var dataValue = dealAverage(val, index, totalData, 2, odl); //收盘（现）价均值
            yAxis[i + 1].data.push(dataValue);
            yAxis[i + 1].dataShow.push(common.metaUnit(dataValue));
          });
        }
      });

      dataStore.axis.yMax = this.yMax = yMax;
      dataStore.axis.yMin = this.yMin = yMin;
      dataStore.unit = this.unit;
      dataStore.canvasWidth = this.canvasWidth;
      dataStore.canvasHeight = this.canvasHeight;
      this.setOptions(dataStore);
    },
    metaData2: function (origin, options) {
      var dataStore = options;
      var yMax = this.yMax;
      var yMin = this.yMin;
      var startTime = this.startTime;
      var endTime = this.endTime;
      var xAxis = dataStore.xAxis;
      var yAxis = dataStore.yAxis;
      var average = dataStore.average;
      var averageColors = this.averageColors;
      var baseV = origin.info.v;
      var historyStep = Math.max.apply(null, average) || 0;
      var originData = origin.data.slice(0);
      var odl = origin.data.length;

      //存下原始数据，待之后使用
      dataStore.originData = originData
      dataStore.origin = origin

      //处理小于 unit 条数据的情况
      dataStore.isNew = this.isNew;
      dataStore.offsetX = this.offsetX;
      if (odl < this.unit) {
        dataStore.isNew = this.isNew = true;
        dataStore.offsetX = this.offsetX = odl;
      }
      var tempArr = [];
      if (originData.length < (this.unit + historyStep)) {
        for (var i = 0; i < this.unit + historyStep - originData.length; i++) {
          tempArr.push("0000-00-00,00.00,00.00,00.00,00.00,00.00,00.00,0.00%");
        }
        originData = tempArr.concat(originData);
      }
      var data = originData.slice(originData.length - this.unit);
      var historyData = originData.slice(0, originData.length - this.unit);  //计算均线所需历史数据
      historyData = historyData.slice(historyData.length - historyStep);
      var totalData = historyData.concat(data);

      // bitson 记录cursor位置，即显示数据的最右端在数据集中的偏移量
      this.cursor = originData.length

      yAxis.push({  //创建成交量图
        type: 'bar',
        color: [],
        data: [],
        cData: [],
        gap: 1,
        isBottomBar: true,
        showMax: true
      });
      /*if(odl < 20){
          average.pop();
      }
      if(odl < 10){
          average.pop();
      }
      if(odl < 5){
          average.pop();
      }*/
      average.forEach(function (val, index) {
        dataStore.xAxis.averageLabel.push('MA' + val + ':');
        yAxis.push({  //创建均线趋势
          name: 'MA' + val,
          type: 'line',
          lineColor: averageColors[index],
          data: [],
          dataShow: [],
          hide: odl < val
        });
      });
      var barOpt = yAxis[0];
      totalData.forEach(function (item, index) {
        var d = item.split(',');
        var t = d[0]; //时间
        var v = d[5] / 1; //成交量
        var c = d[2] / 1; //现价
        yMax = Math.max(v, yMax);
        yMin = Math.min(v, yMin);
        if (index >= historyStep) { //从历史数据之后开始计算画图所需数据
          var dataIndex = index - historyStep;
          xAxis.data[dataIndex] = t;
          if (dataIndex === 0) {
            startTime = t.split('-').join('');
          }
          if (dataIndex + 1 === totalData.length - historyStep) {
            endTime = t.split('-').join('');
          }
          barOpt.data[dataIndex] = v;
          barOpt.cData[dataIndex] = c;
          average.forEach(function (val, i) { //计算均线数据
            var dataValue = dealAverage(val, index, totalData, 5, odl); //成交量均值
            yAxis[i + 1].data.push(dataValue);
            yAxis[i + 1].dataShow.push(common.metaUnit(dataValue));
          });
        }
      });

      barOpt.data.forEach(function (item, index) {
        //barOpt.color[index] = '#E6DB74';
        //console.log(barOpt.cData[index], barOpt.cData[index - 1], barOpt.cData[index] - barOpt.cData[index - 1]);
        barOpt.color[index] = barOpt.cData[index] - (index === 0 ? baseV : barOpt.cData[index - 1]) < 0 ? '#4cda64' : '#ff2f2f';
      });

      dataStore.axis.yMax = this.yMax = yMax;
      dataStore.axis.yMin = this.yMin = 0;
      dataStore.metaUnit = true;
      if (odl < 60) {
        startTime = origin.data[0].split(',')[0];
        startTime = startTime.split('-').join('');
      }
      this.startTime = startTime;
      this.endTime = endTime;
      xAxis.times = [startTime, endTime];
      this.setOptions(dataStore);
    },
    setOptions: function (options) {
      this.options = options;
    },
    axis: function (ctx, options) {
      this.axisObj = axis.init(ctx, options);
    },
    bezierLine: function (option) {
      common.bezierLine.call(this, option);
    },
    line: function (option) {
      if (option.hide) {
        return;
      }
      var that = this;
      var ctx = this.ctx;
      var canvasHeight = this.canvasHeight;
      var canvasWidth = this.canvasWidth;
      var unit = this.unit;
      var step = (canvasWidth - this.paddingLeft - this.paddingRight) / this.unit;
      var areaH = canvasHeight - this.paddingBottom - this.paddingTop;
      var max = this.yMax;
      var min = this.yMin;
      if (option.isBottomBar) {
        min = 0;
      }
      var data = [];
      option.xAxis.data.map(function (item, index) {
        var d = option.data[index];
        var value = areaH - areaH * (d - min) / (max - min) + that.paddingTop;
        data.push([index * step - that.paddingLeft + step / 2, value]);
      });
      var barW = (canvasWidth - this.paddingLeft - this.paddingRight) / this.unit;
      if (this.offsetX > 0) {
        ctx.translate(-(this.unit - this.offsetX) * barW + 1, 0);
      }
      ctx.beginPath();
      data.map(function (item, index) {
        var x0 = item[0];
        var x1 = item[1];
        if (option.isNew) {
          var startIndex = unit - (option.odl - option.val) - 1;
          if (index == startIndex) {
            ctx['moveTo'](x0, x1);
          }
          if (index > startIndex) {
            ctx['lineTo'](x0, x1);
          }
        } else {
          ctx[index === 0 ? 'moveTo' : 'lineTo'](x0, x1);
        }
      });
      ctx.setLineWidth(1);
      ctx.setLineCap('square');
      ctx.setStrokeStyle(option.lineColor);
      ctx.stroke();
      if (this.offsetX > 0) {
        ctx.translate((this.unit - this.offsetX) * barW + 1, 0);
      }
    },
    bar: function (option) {
      var startTime = +new Date();
      var data = option.data;
      var ctx = this.ctx;
      var canvasHeight = this.canvasHeight;
      var canvasWidth = this.canvasWidth;
      var pb = this.paddingBottom;
      var barW = (canvasWidth - this.paddingLeft - this.paddingRight) / this.unit;
      barW -= 1;
      var max = Math.max.apply(null, data);
      var step = (canvasHeight - this.paddingTop - pb) / max;
      if (this.offsetX > 0) {
        ctx.translate(-(this.unit - this.offsetX) * (barW + 1), 0);
      }
      data.forEach(function (item, index) {
        var barH = item * step;
        var color = option.color[index];
        /*if(color === 'red'){
            ctx.setLineWidth(1);
            ctx.setStrokeStyle(color);
            ctx.strokeRect(index * barW - 2, canvasHeight - pb - barH, barW, barH);
        }else{*/
        ctx.beginPath();
        ctx.setLineWidth(barW);
        ctx.moveTo(index * (barW + 1) + barW / 2 + 1, canvasHeight - pb);
        ctx.lineTo(index * (barW + 1) + barW / 2 + 1, canvasHeight - pb - barH);
        ctx.setStrokeStyle(color);
        ctx.stroke();
        //}
      });
      if (this.offsetX > 0) {
        ctx.translate((this.unit - this.offsetX) * (barW + 1), 0);
      }
      if (option.complete) {
        option.complete(+new Date() - startTime);
      }
      // if(option.showMax){
      //     ctx.setFillStyle(this.txtColor);
      //     ctx.fillText(common.metaUnit(max), this.paddingLeft + 3, this.paddingTop + 30);
      // }
    },
    candle: function (option) {
      var that = this;
      var ctx = this.ctx;
      var canvasWidth = this.canvasWidth;
      var canvasHeight = this.canvasHeight;
      var dataX = option.xAxis.data;
      var data_h = option.data_h;
      var data_l = option.data_l;
      var data_s = option.data_s;
      var data_c = option.data_c;
      var yin_yang = option.yin_yang;

      // bitson
      // var tmp = this.getPriceByXaxis(373)

      var max = this.yMax;//Math.max.apply(null, data_h);
      var min = this.yMin;//Math.min.apply(null, data_l);
      var areaH = canvasHeight - this.paddingBottom - this.paddingTop;
      var areaUnit = areaH / (max - min);

      var barW = (canvasWidth - this.paddingLeft - this.paddingRight) / this.unit;
      var yMin = this.yMin;
      var gap = option.gap;
      if (this.offsetX > 0) {
        ctx.translate(-(this.unit - this.offsetX) * barW, 0);
      }
      ctx.translate(0, that.paddingTop);
      data_h.forEach(function (time, index) {
        var h = data_h[index];
        var l = data_l[index];
        var s = data_s[index];
        var c = data_c[index];
        var yy = yin_yang[index];
        var cx = that.paddingLeft + (gap + barW) * index;
        common.candle(ctx, cx, barW, h, l, s, c, yy, max, min, areaH);
      });
      ctx.translate(0, -that.paddingTop);
      if (this.offsetX > 0) {
        ctx.translate((this.unit - this.offsetX) * barW, 0);
      }
    },
    showAverage: function (option) {
      var ctx = this.ctx;
      var step = this.canvasWidth / 3;
      var offsetY = 26;
      var yAxis = this.options.yAxis;
      var ma5 = yAxis[1].data;
      var ma10 = yAxis[2].data;
      var ma20 = yAxis[3].data;
      var index = this.unit - 1;
      if (option) {
        index = Math.round(option.x * this.unit / this.canvasWidth);
      }
      ctx.setFontSize(14);
      ctx.setFillStyle(this.averageColors[0]);
      ctx.fillText('MA5:' + ma5[index], 4, offsetY);
      ctx.setFillStyle(this.averageColors[1]);
      ctx.fillText('MA10:' + ma10[index], step, offsetY);
      ctx.setFillStyle(this.averageColors[2]);
      ctx.fillText('MA20:' + ma20[index], 2 * step, offsetY);
    },
    changeAverage: function (option) {
      var ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvasWidth, 30);
      this.showAverage(option);
      ctx.draw();
    },
    clear: function () {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    },
    draw: function (opt) {
      var that = this;
      var ctx = this.ctx;
      var options = this.options;
      if (!options) {
        console.log('Warn: No setting options!');
        return;
      }

      var xAxis = options.xAxis;
      var startTime = +new Date();
      this.clear();
      this.axis(ctx, options);
      options.yAxis.map(function (option, index) {
        option.xAxis = xAxis;
        that[option.type](option);
      });
      this.axisObj.drawYUnit();
      this.ctx.draw();
      options.callback && options.callback(+new Date() - startTime);
    }
  };

  function dealAverage(val, index, totalData, averageIndex, old) {
    var arr = [];
    var dataArr = totalData.slice(0).splice(Math.abs(index - val + 1), val);
    dataArr.forEach(function (item, index) {
      var d = item.split(',');
      var s = d[averageIndex] / 1;
      arr.push(s);
    });
    return averageArray(arr, old < val ? old : arr.length).toFixed(AVERAGE_CALCULATION_PRECISION) / 1;
  }

  function averageArray(arr, averageNum) {
    var result = 0;
    var len = arr.length;
    for (var i = 0; i < len; i++) {
      result += arr[i];
    }
    return len === 0 ? 0 : result / averageNum;
  }
};
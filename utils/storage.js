/**
 * Created by Lipeizhao on 2018/5/28.
 * 获取k线数据
 */
// var Api = require('../../utils/api.js');
// const app = getApp();


module.exports = {
  getTsData: function () {

  },
  getTs5Data: function () {

  },
  getDkData: function () {

  },
  getWkData: function () {

  },
  getMkData: function () {

  },
  getMin5Data: function () {

  },
  getMin15Data: function () {
    // var api_url = Api.price_url + '?ex=' + this.data.ex + '&symbol=' + this.data.symbol
    // Api.fetchGet(api_url, (err, res) => {
    //   //更新数据
    //   this.data.line.date = res.date
    //   this.data.line.prices = res.prices

    //   // this.setData({
    //   //   currencyInfo: this.data.currencyInfo
    //   // });

    //   this.init_chart(this.data.prices)
    // })
  },
  getMin152Data: function () {
    return {
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
      "data": ["2016-11-18 09:45,20.20,20.16,20.24,20.09,41239,8314万,-", "2016-11-18 10:00,20.14,20.31,20.36,20.13,44020,8928万,1.14%", "2016-11-18 10:15,20.32,20.29,20.39,20.29,35880,7297万,0.49%", "2016-11-18 10:30,20.29,20.40,20.40,20.26,26884,5465万,0.69%", "2016-11-18 10:45,20.39,20.30,20.40,20.28,16383,3331万,0.59%", "2016-11-18 11:00,20.30,20.30,20.30,20.23,15924,3227万,0.34%", "2016-11-18 11:15,20.29,20.28,20.33,20.23,11694,2371万,0.49%", "2016-11-18 11:30,20.27,20.18,20.29,20.16,19754,3995万,0.64%", "2016-11-18 13:15,20.18,20.22,20.26,20.16,11214,2267万,0.50%", "2016-11-18 13:30,20.22,20.19,20.23,20.15,14229,2873万,0.40%", "2016-11-18 13:45,20.19,20.21,20.25,20.18,10034,2028万,0.35%", "2016-11-18 14:00,20.21,20.18,20.23,20.14,16296,3290万,0.45%", "2016-11-18 14:15,20.17,20.12,20.19,20.11,29638,5968万,0.40%", "2016-11-18 14:30,20.13,20.22,20.23,20.12,24150,4873万,0.55%", "2016-11-18 14:45,20.23,20.12,20.23,20.10,46712,9408万,0.64%", "2016-11-18 15:00,20.12,20.08,20.13,20.03,57874,1.16亿,0.50%", "2016-11-21 09:45,19.99,20.24,20.30,19.95,54878,1.10亿,1.74%", "2016-11-21 10:00,20.23,20.22,20.26,20.19,44866,9076万,0.35%", "2016-11-21 10:15,20.22,20.32,20.49,20.20,89596,1.82亿,1.43%", "2016-11-21 10:30,20.32,20.25,20.34,20.24,32990,6689万,0.49%", "2016-11-21 10:45,20.25,20.30,20.36,20.22,27372,5551万,0.69%", "2016-11-21 11:00,20.31,20.35,20.39,20.29,29265,5954万,0.49%"]
    };
  },
  getMin30Data: function () {

  },
  getMin60Data: function () {

  }
};
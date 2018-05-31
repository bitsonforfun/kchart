// var host = '192.168.31.46:6060'
// var host = '192.168.0.104:6060'
// var host = '127.0.0.1:6060'
// var host = '112.74.58.94'
// var host = '172.128.11.10:6060' // sugar

var host = 'theta.meinvjpg.com'
var base_url = 'https://' + host + '/api/1'
var img_url = 'https://' + host + '/static/img'

// var base_url = 'http://' + host + '/api/1'
// var img_url = 'http://' + host + '/static/img'
var coin_img_url = img_url + '/coin'

var currency_url = base_url + '/currencies';
var history_url = base_url + '/histories';
var coinpair_url = base_url + '/spiders';
var price_url = base_url + '/prices';
var market_url = base_url + '/market'

// get请求方法
function fetchGet(url, callback) {
  wx.request({
    url: url,
    data: {},
    header: { 'Content-Type': 'json' },
    success(res) {
      callback(null, res.data)
    },
    fail(e) {
      console.log(e);
      //callback(e);
    }
  })
}

// post请求方法
function fetchPost(url, data, callback) {
  wx.request({
    method: 'POST',
    url: url,
    data: data,
    success(res) {
      callback(null, res.data)
    },
    fail(e) {
      console.log(e);
      //callback(e);
    }
  })
}

function serialize(object) {
  return Object.keys(object).map(function (k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(object[k]);
  }).join('&');
}

module.exports = {
  //api
  coin_img_url: coin_img_url,
  currency_url: currency_url,
  history_url: history_url,
  price_url: price_url,
  market_url,
  coinpair_url,
  fetchGet: fetchGet,
  fetchPost: fetchPost,
}


// for testing
// var host = '192.168.31.46:6060'
var host = '192.168.3.101:6060'
// var host = '172.128.11.10:6060' // sugar

var image_host = 'thetacdn.meinvjpg.com'
var img_url = 'http://' + image_host
var coin_img_url = img_url

// var host = 'theta.meinvjpg.com'
// var base_url = 'https://' + host + '/api/2'
var base_url = 'http://' + host + '/api/2'

// old image path
// var img_url = 'https://' + host + '/static/img'
// var img_url = 'http://' + host + '/static/img'

var currency_url = base_url + '/currencies';
var history_url = base_url + '/histories';
var coinpair_url = base_url + '/spiders';
var price_url = base_url + '/prices';
var market_url = base_url + '/market';
var auth_url = base_url + '/mini_auth';
var token_url = base_url + '/mini_token';
var currency_unit_url = base_url + '/currency-units';
var user_url = base_url + '/users/me';
var my_currency_url = base_url + '/users/me/my-currencies';

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

// put请求方法
function fetchPut(url, data, callback) {
  wx.request({
    method: 'PUT',
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
  base_url,
  coin_img_url: coin_img_url,
  currency_url: currency_url,
  history_url: history_url,
  price_url: price_url,
  market_url,
  coinpair_url,
  auth_url,
  token_url,
  currency_unit_url,
  user_url,
  my_currency_url,
  fetchGet: fetchGet,
  fetchPost: fetchPost,
  fetchPut: fetchPut,
}


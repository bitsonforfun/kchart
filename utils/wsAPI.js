var Common = require('../common/helper.js');

let nullFn = () => {
};
function IllegalAPIException(name) {
  this.message = "No Such API [" + name + "]";
  this.name = 'IllegalAPIException';
}
let services = {
  sleep: (time) => {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, time);
    })
  },
  stop: () => {
    return new Promise(function (resolve, reject) {
    })
  },
  taskSequence: () => {
    return new Promise(function (resolve, reject) {
      resolve()
    })
  },
  fetchGet: (url) => {
    return new Promise(function (resolve, reject) {
      var that = this;
      wx.request({
        url: url,
        data: {},
        header: { 'Content-Type': 'json' },
        success(res) {
          if (Common.isCallSuccess(res)) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        },
        fail(e) {
          reject(res);
        }
      })
    })
  },
  fetchPost: (url, data) => {
    return new Promise(function (resolve, reject) {
      var that = this;
      var postData = data;

      wx.request({
        url: url,
        data: postData,
        method: 'POST',
        success: function (res) {
          if (Common.isCallSuccess(res)) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        },
        error: function (e) {
          reject(res.data);
        }
      })
    })
  },
  fetchPut: (url, data) => {
    return new Promise(function (resolve, reject) {
      var that = this;
      var postData = data;

      wx.request({
        url: url,
        data: postData,
        method: 'PUT',
        success: function (res) {
          if (Common.isCallSuccess(res)) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        },
        error: function (e) {
          reject(res.data);
        }
      })
    })
  }
};

export let wsAPI = new Proxy(services, {
  get: function (target, property) {
    if (property in target) {
      return target[property];
    } else if (property in wx) {
      return (obj) => {
        return new Promise(function (resolve, reject) {
          obj = obj || {};
          obj.success = (...args) => {
            var tmp = args;
            resolve(...args)
          };
          obj.fail = (...args) => {
            reject(...args);
          };
          obj.complete = nullFn;
          wx[property](obj);
        });
      }
    } else {
      throw new IllegalAPIException(property);
    }
  }
});
// const app = getApp();

function hasToken() {
  var token = wx.getStorageSync("token");
  if (token == null) {
    return false
  } else {
    return true
  }
}

function isCallSuccess(res) {
  if (res.message == "Invalid token") {
    return false
  } else {
    return true
  }
}

function getCurrencyUnitSymbol(currencyUnit) {
  var app = getApp();
  var currencyUnits = app.globalData.currencyUnits;
  for (var i = 0; i < currencyUnits.length; i++) {
    if (currencyUnits[i].name == currencyUnit) {
      return currencyUnits[i].symbol
    }
  }
  return '$'
}

function autoRoundNumPrecision(value) {
  if (value) {
    var arr = String(value).split(".");
    if (arr[0] && Number(arr[0]) != 0) {
      var valueStr = value.toFixed(2)
      return Number(valueStr)
    } else {
      return value.toFixed(6)
    }
  } else {
    return null
  }
}

function localeString(value) {
  if (value) {
    return value.toLocaleString()
  }
}

function numFormat (value, symbol) {
  var obj = {
    symbol: symbol || "",
    int: undefined,
    dec: undefined,
    targ: "",
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
  return {
    number: obj.symbol + obj.targ + obj.int + "." + obj.dec,
    suffix: obj.times[times]
  }

  // return obj.symbol + obj.targ + obj.int + "." + obj.dec + obj.times[times];
}

module.exports = {
  hasToken: hasToken,
  isCallSuccess: isCallSuccess,
  getCurrencyUnitSymbol: getCurrencyUnitSymbol,
  autoRoundNumPrecision: autoRoundNumPrecision,
  localeString: localeString,
  numFormat: numFormat,
}


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
    var tmp = value.toLocaleString()
    return tmp
  }
  // return value && value.toLocaleString()
}

module.exports = {
  hasToken: hasToken,
  isCallSuccess: isCallSuccess,
  getCurrencyUnitSymbol: getCurrencyUnitSymbol,
  autoRoundNumPrecision: autoRoundNumPrecision,
  localeString: localeString
}


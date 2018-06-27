/**
 * Created by Lipeizhao on 2018/5/28.
 */

// 导入组件
var Api = require('../../utils/api.js');
var Common = require('../../common/helper.js');

// 初始化变量
const app = getApp();
const _ = wx.T._

Page({
  /*
   * 小程序启动时的执行顺序有可能是app初始化后执行首页的onLoad（以下称onLoad），
   * 也有可能在app初始化完之前执行onLoad，假如在app初始化完之前执行onLoad，则
   * 将onLoad里的首页初始化逻辑作为回调函数传给app最后回调，假如在app初始化完后执行
   * onLoad，则按照正常逻辑在onLoad里执行首页初始化逻辑
   */
  onLoad: function () {
    app.userInfoReadyCallback = () => {
      this.pageInit()
    }
    if (app.globalData.essentialDone == true) {
      this.pageInit()
    }
  },
  pageInit: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          winH: res.windowHeight
        });
      }
    })
    this.data.coin_img_url = Api.coin_img_url

    this.setData({
      coin_img_url: this.data.coin_img_url
    });

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

    // for mini
    this.getExchange()

    this.data.initLock = false
  },
  onReady: function () {
  },
  onShow: function () {
    if (this.data.initLock != true) {
      // 清除所有数据
      this.data.currencies = []
      this.data.cursor = 0
      this.data.hasMore = true
      this.data.coinListLoading = false

      this.data.myCurrencies = []
      this.data.myCursor = 0
      this.data.myHasMore = true
      this.data.myCoinListLoading = false

      this.setData({
        currencies: this.data.currencies,
        myCurrencies: this.data.myCurrencies,
      })

      // 重新获取列表数据
      this.getExchange()

      // 重新设置用户数据
      if (app.globalData.userInfo) {
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
    }
  },
  data: {
    // init lock
    initLock: true,

    // user
    hasLogin: false,

    // icon url
    coin_img_url: '',

    // currency query result
    currencies: [],
    lableCurrencyUnit: '$',

    // my currency query result
    myCurrencies: [],
    
    // currency query
    countPerPage: 15,
    cursor: 0,
    hasMore: true,
    coinListingLimit: 50,
    coinListLoading: false,

    // my currency query
    myCountPerPage: 15,
    myCursor: 0,
    myHasMore: true,
    myCoinListingLimit: 50,
    myCoinListLoading: false,

    percentageMark: '%',
    // tab
    tab: {
      list: [{
        id: '1',
        // title: _('TabNumberOneName'),
        title: ''
      }, {
        id: '2',
        title: ''
      }, {
        id: '3',
        title: ''
      }],
      // selectedId: '1',
      scroll: false,
      height: 30
    },
    tabIndex: 1,

    labelMarketCap: _('LabelMarketCap')
  },
  onShareAppMessage: function (res) {
    return {
      title: '行情查询',
      path: '/pages/index/index'
    }
  },
  open: function (e) {
    wx.navigateTo({
      url: '../basic/index?symbol=' + e.currentTarget.dataset.currency.symbol
    });
  },
  myOpen: function (e) {
    wx.navigateTo({
      url: '../basic/index?symbol=' + e.currentTarget.dataset.currency.symbol
    });
  },
  openSelectMyCurrencies: function (e) {
    wx.navigateTo({
      url: '../selectmine/index'
    });
  }, 
  // for mini
  getExchange: function () {
    var api_url = Api.base_url + '/exchange';
    Api.fetchGet(api_url, (err, res) => {
      wx.D = res

      // for mini, update labels
      this.data.tab = {
        list: [{
          id: '1',
          title: wx.D ? '广州楼盘均价' : _('TabNumberOneName')
        }, {
          id: '2',
          title: wx.D ? '': _('TabNumberTwoName')
        }, {
          id: '3',
          title: ''
        }],
        // selectedId: '1',
        scroll: false,
        height: 30
      }
      this.data.labelMarketCap = wx.D ? '排序' : _('LabelMarketCap')

      this.setData({
        tab: this.data.tab,
        labelMarketCap: this.data.labelMarketCap
      })

      // for mini, get data
      this.getData(this.data.countPerPage, this.data.cursor);
      this.getMyData(this.data.myCountPerPage, this.data.myCursor);
    })
  },
  tabChange: function (e) {
    var tabIndex = parseInt(e.detail);
    this.setData({
      tabIndex: tabIndex,
    });
  },
  // 获取货币列表数据
  getData: function (countPerPage, cursor) {
    // for mini
    if (wx.D) {
      var that = this;
      var api_url = Api.currency_url + '?sort=rank_asc&limit=' + countPerPage + '&start=' + cursor + '&d=1';
      Api.fetchGet(api_url, (err, res) => {
        //更新数据
        for (var i = 0; i < res.currencies.length; i++) {
          if (that.data.currencies.length <= that.data.coinListingLimit) {
            res.currencies[i].quotesMarketCap = ''
            res.currencies[i].rank = res.currencies[i].rank - 10000
            // res.currencies[i].quotesPercentChange24h = (res.currencies[i].quotesPercentChange24h * 100).toFixed(2)
            res.currencies[i].quotesPercentChange24h = ''
            that.currencToLocalString(res.currencies[i])
            that.setChangePercentColor(res.currencies[i])
            that.data.currencies.push(res.currencies[i])
          }
        }

        if (that.data.currencies.length >= that.data.coinListingLimit) {
          that.data.hasMore = false;
        }

        // 更新页面模型
        that.setData({
          currencies: that.data.currencies,
          currencyUnit: '￥',
          percentageMark: '',
          hasMore: that.data.hasMore
        });

        that.data.cursor = that.data.cursor + that.data.countPerPage;

        // 防止上拉页面后重复加载
        this.data.coinListLoading = false
      })
    } else {
      var that = this;
      var api_url = Api.currency_url + '?sort=rank_asc&limit=' + countPerPage + '&start=' + cursor + '&currencyUnit=' + this.data.currencyUnit;
      Api.fetchGet(api_url, (err, res) => {

        //更新数据
        var count = that.data.currencies.length;
        for (var i = 0; i < res.currencies.length; i++) {
          if (count < that.data.coinListingLimit) {
            that.currencToLocalString(res.currencies[i])
            that.setChangePercentColor(res.currencies[i])
            that.data.currencies.push(res.currencies[i])
            count += 1
          }
        }
        if (that.data.currencies.length >= that.data.coinListingLimit) {
          that.data.hasMore = false;
        }

        // 更新页面模型
        that.setData({
          currencies: that.data.currencies,
          hasMore: that.data.hasMore,
          percentageMark: '%'
        });

        that.data.cursor = that.data.cursor + that.data.countPerPage;

        // 防止上拉页面后重复加载
        this.data.coinListLoading = false
      })
    }
  },
  getMyData: function (countPerPage, cursor) {
    var that = this;
    
    // 若token不为空，则获取用户自选股列表，否则则提示用户登录
    if (Common.hasToken()) {
      var token = wx.getStorageSync("token");
      var api_url = Api.currency_url + '?sort=rank_asc&limit=' + countPerPage + '&start=' + cursor + '&onlyOptionalCurrency=true&currencyUnit=' + this.data.currencyUnit + '&token=' + token;
      Api.fetchGet(api_url, (err, res) => {
        if (Common.isCallSuccess(res)) {
          var count = that.data.myCurrencies.length;
          for (var i = 0; i < res.currencies.length; i++) {
            if (count < that.data.myCoinListingLimit) {
              that.currencToLocalString(res.currencies[i])
              that.setChangePercentColor(res.currencies[i])
              that.data.myCurrencies.push(res.currencies[i])
              count += 1
            }
          }
          if (that.data.myCurrencies.length >= that.data.myCoinListingLimit) {
            that.data.myHasMore = false;
          }

          // 更新页面模型
          that.setData({
            myCurrencies: that.data.myCurrencies,
            myHasMore: that.data.myHasMore,
            percentageMark: '%'
          });

          that.data.myCursor = that.data.myCursor + that.data.myCountPerPage;

          // 防止上拉页面后重复加载
          this.data.coinListLoading = false

          // 显示自选
          this.setData({
            hasLogin: true
          });
        } else {
          // 隐藏自选
          this.setData({
            hasLogin: false
          });
        }
      })
    } else {
      // 隐藏自选
      this.setData({
        hasLogin: false
      });
    }
  },
  currencToLocalString: function (currency) {
    currency.quotesPrice = currency.quotesPrice && currency.quotesPrice.toLocaleString()
    currency.quotesMarketCap = currency.quotesMarketCap && currency.quotesMarketCap.toLocaleString()
    currency.circulatingSupply = currency.circulatingSupply && currency.circulatingSupply.toLocaleString()
    currency.totalSupply = currency.totalSupply && currency.totalSupply.toLocaleString()
    currency.maxSupply = currency.maxSupply && currency.maxSupply.toLocaleString()
  },
  setChangePercentColor: function (currency) {
    if (currency.quotesPercentChange24h > 0) {
      currency.isPercentChangePositive = true
    } else {
      currency.isPercentChangePositive = false
    }
  },
  loadMore: function (e) {
    if (!this.data.coinListLoading) {
      this.data.coinListLoading = true
      this.getData(this.data.countPerPage, this.data.cursor);
      console.log('上拉加载更多', new Date());
    }
  },
  myLoadMore: function (e) {
    if (!this.data.myCoinListLoading) {
      this.data.myCoinListLoading = true
      this.getMyData(this.data.myCountPerPage, this.data.myCursor);
      console.log('上拉加载更多', new Date());
    }
  },
})

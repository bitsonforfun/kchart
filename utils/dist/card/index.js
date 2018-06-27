Component({
  options: {
    multipleSlots: true
  },

  externalClasses: ['card-class'],

  properties: {
    useThumbSlot: {
      type: Boolean,
      value: false
    },
    useDetailSlot: {
      type: Boolean,
      value: false
    },
    isPercentChangePositive: {
      type: Boolean,
      value: false
    },
    isPercentChangePositive: {
      type: Boolean,
      value: false
    },
    percentageMark: String,
    arrowUpSrc: String,
    arrowDownSrc: String,
    text: String,
    thumb: String,
    price: String,
    title: String,
    rank: Number,
    desc: String,
    status: String,
  }
});

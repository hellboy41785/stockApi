const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const stockData = new Schema({
  i: {
    type: Array,
    require: true,
  },
  w: {
    type: Array,
    require: true,
  },
  v: {
    type: Array,
    require: true,
  },
  wp: {
    type: Array,
    require: true,
  },
  t: {
    type:Array,
    require: true,
  },
},{timestamps: true});


const  myData = mongoose.model('myData',stockData)
const  bankNifty = mongoose.model('bankNifty',stockData)

module.exports = {myData,bankNifty}

const morgan = require("morgan");
const mongoose = require("mongoose");
const {myData,bankNifty }= require("./stocks");
const schedule = require('node-schedule-tz');

const fetchData =  async(stockName,saveName) => {
  const stocks = {
    i: [],
    w: [],
    v: [],
    wp: [],
    t: [],
  };

  const myStock = new saveName(stocks);
  myStock.save()
  
  const setData = async () => {
    const response = await fetch(
      `https://www.nseindia.com/api/option-chain-indices?symbol=${stockName}`
    );
    const data = await response.json();

    const filtered = data.filtered.data;

    const callChange = filtered.reduce(
      (acc, current) => acc + current.CE?.changeinOpenInterest,
      0
    );
    const putChange = filtered.reduce(
      (acc, current) => acc + current.PE?.changeinOpenInterest,
      0
    );

    const intraDayPCR = (putChange / callChange).toFixed(2);

    const weightCall = filtered?.map((item, index) =>
      item.CE.changeinOpenInterest === undefined
        ? 1
        : item.CE.changeinOpenInterest * item.CE.lastPrice
    );

    const weightCallData = weightCall.reduce(
      (acc, current) => acc + current,
      0
    );

    const weightPut = filtered?.map(
      (item, index) => item.PE.changeinOpenInterest * item.PE.lastPrice
    );

    const weightPutData = weightPut.reduce((acc, current) => acc + current, 0);

    const weightAge = (weightPutData / weightCallData).toFixed(2);

    //Weighted PCR

    const weightedCall = filtered?.map(
      (item, index) => item.CE.openInterest * item.CE.lastPrice
    );

    const weightedCallData = weightedCall.reduce(
      (acc, current) => acc + current,
      0
    );

    const weightedPut = filtered?.map(
      (item, index) => item.PE.openInterest * item.PE.lastPrice
    );

    const weightedPutData = weightedPut.reduce(
      (acc, current) => acc + current,
      0
    );

    const weightedPCR = (weightedPutData / weightedCallData).toFixed(2);

    //Volume Weighted PCR

    const volCall = filtered?.map(
      (item, index) => item.CE.totalTradedVolume * item.CE.lastPrice
    );

    const volWeightedCall = volCall.reduce((acc, current) => acc + current, 0);
    const volPut = filtered?.map(
      (item, index) => item.PE.totalTradedVolume * item.PE.lastPrice
    );

    const volWeightedPut = volPut.reduce((acc, current) => acc + current, 0);

    const volWeightedPCR = (volWeightedPut / volWeightedCall).toFixed(2);

    stocks.i = [intraDayPCR, ...stocks.i];
    stocks.w = [weightAge, ...stocks.w];
    stocks.v = [volWeightedPCR, ...stocks.v];
    stocks.wp = [weightedPCR, ...stocks.wp];
    stocks.t = [Math.floor(Date.now() / 1000), ...stocks.t];

    const nifty = await saveName.findOneAndUpdate(
      {},
      { $set: stocks },
      { new: true }
    );
    
  };

  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = new schedule.Range(1, 5);
  rule.hour = 15;
  rule.minute = 05;
  rule.tz = 'Asia/Kolkata'
  let intervalId
  schedule.scheduleJob(rule, () => {
    console.log("Started data Collection")
    intervalId = setInterval(() => {
      
      setData();
    }, 180000);

    const stopRule = new schedule.RecurrenceRule();
    stopRule.dayOfWeek = new schedule.Range(1, 5);
    stopRule.hour = 16; // 4 PM
    stopRule.minute = 00;
    stopRule.tz = 'Asia/Kolkata'

    const j = schedule.scheduleJob(stopRule, () => {
      console.log("Stoping data Collection")
      clearInterval(intervalId)
    });
  });
};

const nf =  fetchData( "NIFTY",myData);
const bn = fetchData( "BANKNIFTY",bankNifty);

module.exports = {nf,bn}



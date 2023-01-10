const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();
const  {myData,bankNifty}  = require("./stocks");
const { nf,bn } = require("./info");
const cors = require("cors")
const app = express();

app.use(cors())
app.use(express.json());
const dbURI = process.env.MONGO_URI
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log("connected to db ......."))
  .catch((err) => console.log(err));



app.get("/",  (req, res) => {
  res.status(200).send({
    message: "use this route",
    nifty: "/api/v1/NIFTY",
    banknifty:"/api/v1/BANKNIFTY"
  })
});
app.get("/api/v1/NIFTY",  async(req, res) => {
 const data = await myData.find({})
  res.status(200).send(data)
});
app.get("/api/v1/BANKNIFTY",  async(req, res) => {
 const data = await bankNifty.find({})
  res.status(200).send(data)
});

const PORT = process.env.PORT  || 5000
app.listen(PORT,()=> console.log(`Server is running on port ${PORT}`));

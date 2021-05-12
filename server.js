require('dotenv').config();
const express = require('express')
const cors = require('cors');
const mongoose = require('mongoose')
const mongodb = require('mongodb')
const shortId = require('shortid')
const url = require('url')
const dns = require('dns')
const {Schema, model} = require('mongoose')
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

//Schema 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(console.log("Database Connected"))
  .catch((err) => console.log(err))


const urlSchema = new Schema({
  original_url: String,
  short_url: String
})

const Url = model('Url', urlSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.post('/api/shorturl', async(req, res) => {
  const {url: reqUrl} = req.body
  const shortUrl = shortId.generate()
  const {href, hostname} = url.parse(reqUrl)
  if(hostname === null) return res.json({
    error: "Invalid URL"
  })
  try{
    let findUrl = await Url.findOne({
      original_url: href
    })
      if(findUrl){
      console.log(findUrl)
    }else{
      findUrl = new Url({
        original_url: href,
        short_url:shortUrl ,
      })
    }
    await findUrl.save()
    res.json({
      original_url: href,
      short_url: shortUrl
    })

  }catch(err){
    console.log(err)
  }
});

app.get('/api/shorturl/:short', async (req, res) => {
  const {short} = req.params
  console.log(short)
  try{
    const findShort = await Url.findOne({
      short_url: short
    })
    if(findShort){
      res.redirect(findShort.original_url)
    }else{
      res.status(404).end()
    }
  }catch(err){
    console.log(err)
  }
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

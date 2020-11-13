const express = require('express')
const app = express()

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cancionesRoute = require('./routes/canciones')
const atlasSchesma= 'mongodb+srv://user:mongoDB1234!@cluster0.tj8kp.mongodb.net/mongo?retryWrites=true&w=majority'
const localSchema='mongodb://localhost:27017'

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
})
app.use(bodyParser.json())
app.use('/cancion', cancionesRoute)

app.get('/', (req, res) => {
  res.send('Home')
})

mongoose.connect(
  // atlasSchesma
  localSchema
  ,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  () => console.log('conectado a db'))

app.listen(3000)

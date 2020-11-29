const express = require("express");
require("dotenv/config");
const app = express();

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cancionesRoute = require("./routes/canciones");
const categoriasRoute = require("./routes/categorias");
const reporteRoute = require("./routes/reporte");

// Poner varibales de configuracion en un archivo .env
// const atlasSchesma =
//   "mongodb+srv://user:mongoDB1234!@cluster0.tj8kp.mongodb.net/mongo?retryWrites=true&w=majority";
// const localSchema = "mongodb://localhost:27017";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE, PATCH"
  );
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE, PATCH");
  next();
});
app.use(bodyParser.json());
app.use("/cancion", cancionesRoute);
app.use("/reporte", reporteRoute);
app.use("/categoria", categoriasRoute);

app.get("/", (req, res) => {
  res.send("Home");
});

mongoose.connect(
  process.env.MONGO_SCHEMA,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log("conectado a db")
);

app.listen(3000);

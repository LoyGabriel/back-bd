const express = require("express");
const fs = require("fs");
require("dotenv/config");
const multer = require("multer");
const UPLOAD_DIR = process.env.UPLOAD_DIR;
// Poner varibales de configuracion en un archivo .env
// const UPLOAD_DIR = "C:/Users/loyga/Desktop/BD/back-bd/uploads/";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const router = express.Router();
const Cancion = require("../models/Cancion");

// Buscar todas las canciones activas
router.get("/", async (req, res) => {
  try {
    const canciones = await Cancion.find({ isActive: true });
    console.log("N° de canciones: ", canciones.length);
    res.json(canciones);
  } catch (err) {
    res.json({ message: err });
  }
});

// Buscar cancion por id
router.get("/:cancionID", async (req, res) => {
  try {
    const cancion = await Cancion.findById(req.params.cancionID);
    res.json(cancion);
  } catch (err) {
    res.json({ message: err });
  }
});

// Actualizar cancion
router.patch("/:cancionID", async (req, res) => {
  try {
    const cancion = await Cancion.updateOne(
      { _id: req.params.cancionID },
      { $set: { titulo: req.body.titulo, categoria: req.body.categoria } }
    );
    res.json(cancion);
  } catch (err) {
    res.json({ message: err });
  }
});

// Agregar comentario a la cancion
router.put("/agregar-comentario", async (req, res) => {
  console.log("AGREGAR COMENTARIO ", req.body);
  try {
    const cancion = await Cancion.updateOne(
      { _id: req.body.cancionId },
      { $push: { comentarios: req.body.comentario } }
    );
    res.json(cancion);
  } catch (err) {
    res.json({ message: err });
  }
});

// Agregar cancion
router.post("/", upload.single("contenido"), async (req, res) => {
  console.log("Llega al agregar cancion", req.file);
  console.log("BODY", req.body);
  const cancionParam = req.body.cancion;
  if (req.file && req.body.titulo) {
    const cancion = new Cancion({
      isActive: true,
      titulo: req.body.titulo,
      categoria: req.body.categoria,
      extension: req.body.mimetype,
      descargas: [],
      comentarios: [],
      fileName: req.file.originalname,
      filePath: req.file.path,
      extension: req.body.extension,
    });
    try {
      const cancionGuardada = await cancion.save();
      console.log("CANCION GUARDADA ", cancionGuardada);
      res.json(cancionGuardada);
    } catch (err) {
      console.log(err);
      res.json({ message: err });
    }
  } else {
    res.json("No toma el archivo");
  }
});

// Eliminar cancion
router.patch("/delete/:cancionID", async (req, res) => {
  try {
    const cancion = await Cancion.findByIdAndUpdate(
      { _id: req.params.cancionID },
      { $set: { isActive: false } }
    );
    const path = UPLOAD_DIR + cancion.fileName;
    fs.unlinkSync(path);
    res.json(cancion);
  } catch (err) {
    await Cancion.findByIdAndUpdate(
      { _id: req.params.cancionID },
      { $set: { isActive: true } }
    );
    res.status(500).send("Error del sistema");
  }
});

// Descargar cancion
// 4657dfdef4610c00309e6b3f182a1c14
router.get("/download/:id", async (req, res) => {
  const cancion = await Cancion.findOne({ _id: req.params.id });
  const path = UPLOAD_DIR + cancion.fileName;
  res.download(path, async (err) => {
    if (err) {
      console.log(err);
    } else {
      await Cancion.updateOne(
        { _id: cancion.id },
        { $push: { descargas: 111 } }
      );
    }
  });
});

module.exports = router;

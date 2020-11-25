const express = require("express");
const fs = require("fs");
const multer = require("multer");
const UPLOAD_DIR = "L:\\Bases de datos\\back-bd\\uploads\\";
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

// Buscar todas las canciones mas descargadas
router.get("/mas-descargadas", async (req, res) => {
  try {
    const canciones = await Cancion.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $project: {
          titulo: "$titulo",
          fechaDePublicacion: "$fechaDePublicacion",
          extension: "$extension",
          cantidadComentarios: { $size: "$comentarios" },
          cantidadDescargas: { $size: "$descargas" },
        },
      },
      { $sort: { cantidadDescargas: -1 } },
      { $limit: 5 },
    ]);
    res.json(canciones);
  } catch (err) {
    res.json({ message: err });
  }
});

// Buscar todas las canciones activas, contar la cantidad de descargas y comentarios
router.get("/list", async (req, res) => {
  try {
    const canciones = await Cancion.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $project: {
          titulo: "$titulo",
          fechaDePublicacion: "$fechaDePublicacion",
          categoria: "$categoria",
          extension: "$extension",
          descargas: { $size: "$descargas" },
          comentarios: { $size: "$comentarios" },
        },
      },
    ]);
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

// FILTROS
// filtrar por cantidad de elementos a mostrar
router.get("/filtro/cantidad-elementos/:cantidad", async (req, res) => {
  try {
    const cantidad = Number(req.params.cantidad);
    const canciones = await Cancion.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $project: {
          titulo: "$titulo",
          fechaDePublicacion: "$fechaDePublicacion",
          extension: "$extension",
          comentarios: { $size: "$comentarios" },
          descargas: { $size: "$descargas" },
        },
      },
      {
        $sort: {
          descargas: -1,
        },
      },
      {
        $limit: cantidad,
      },
    ]);
    res.json(canciones);
  } catch (err) {
    res.json({ message: err });
  }
});

//filtrar por extension
router.get("/filtro/extension/:extension", async (req, res) => {
  try {
    const extension = req.params.extension;
    const canciones = await Cancion.find({
      extension: extension,
      isActive: true,
    });
    res.json(canciones);
  } catch (err) {
    res.json({ message: err });
  }
});

//filtrar por periodo
// formato de fechas en el body:
//"date1":"2020-10-17T01:24:54.417Z",
//"date2":"2020-12-17T01:24:54.417Z"
router.post("/filtro/periodo", async (req, res) => {
  try {
    const canciones = await Cancion.find({
      fechaDePublicacion: {
        $gte: new Date(req.body.date1),
        $lt: new Date(req.body.date2),
      },
      isActive: true,
    });
    res.json(canciones);
  } catch (err) {
    res.json({ message: err });
  }
});

//filtrar por cantidad de comentarios
router.get("/filtro/cantidad-comentarios/:cantidad", async (req, res) => {
  try {
    const cantidad = Number(req.params.cantidad);
    const canciones = await Cancion.find({
      isActive: true,
      comentarios: { $size: cantidad },
    });
    res.json(canciones);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;

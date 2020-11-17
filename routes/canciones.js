const express = require("express");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/' );
  },
  filename: function (req, file, cb) {
    cb(null,file.originalname );
  },
});
const upload = multer({storage:storage});

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
          cantidadDescargas: { $sum: "$descargas" },
        },
      },
      {$sort:{cantidadDescargas:-1}},
      {$limit: 5}
    ])
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

// Eliminar cancion
// TODO: agregar logica para eliminar archivo
router.patch("/delete/:cancionID", async (req, res) => {
  try {

    const cancion = await Cancion.findByIdAndUpdate(
      { _id: req.params.cancionID },
      { $set: { isActive: false } }
    );
    res.json(cancion);
  } catch (err) {
    console.log(err)
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

// Agregar cancion
router.post("/", upload.single('contenido'), async (req, res) => {
  console.log("Llega al agregar cancion", req.file)
  console.log("BODY", req.body);
  const cancionParam = req.body.cancion;
  if (req.file&&req.body.titulo) {
    const cancion = new Cancion({
      isActive: true,
      titulo: req.body.titulo,
      categoria: req.body.categoria,
      extension: req.body.mimetype,
      descargas: [],
      comentarios: [],
      fileName: req.file.originalname,
      filePath: req.file.path,
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


// Descargar cancion
//4657dfdef4610c00309e6b3f182a1c14
router.get('/download/:documentName',(req,res)=>{  
  console.log("PARAMWS",req.params)
 cancionId= req.params.documentName
         var path= 'C:/Users/loyga/Desktop/BD/back-bd/uploads/'+ cancionId;  
         
res.download
(path);  
  })
module.exports = router;

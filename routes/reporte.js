/*
 * REPORTE
 * {
    "cantidad": 1,
    "extension": "mp3",
    "comentarios": 2,
    "descargas": null
   }
 * */

const express = require("express");
const Cancion = require("../models/Cancion");
const router = express.Router();

const addLimiteCantidad = (pipeline, cantidad) => {
  if (cantidad) pipeline.push({ $limit: cantidad });
};

const addFiltroExtension = (pipline, extension) => {
  if (extension) pipline[0].$match.extension = extension;
};

router.get("/", async (req, res) => {
  const reporte = req.body;
  const pipeline = [
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
  ];
  addFiltroExtension(pipeline, reporte.extension);
  addLimiteCantidad(pipeline, reporte.cantidad);
  const canciones = await Cancion.aggregate(pipeline);
  res.json(canciones);
});

module.exports = router;

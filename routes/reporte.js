/* json reporte
{
  "cantidad": 10,
  "extension": "mp3",
  "comentarios": 11,
  "descargas": 30,
  "fechaInicio": "2020-1-19T02:00:00.000Z",
  "fechaFin": "2020-11-19T02:00:00.000Z"
}*/

const express = require("express");
const Cancion = require("../models/Cancion");
const router = express.Router();

const addLimiteCantidad = (pipeline, cantidad) => {
  if (cantidad) pipeline.push({ $limit: cantidad });
};

const addFiltroExtension = (pipline, extension) => {
  if (extension) pipline[0].$match.extension = extension;
};

const addFiltroCantidadComentarios = (pipeline, comentarios) => {
  if (comentarios) pipeline[0].$match.comentarios = { $size: comentarios };
};

const addLimiteFecha = (pipeline, fechaInicio, fechaFin) => {
  if (fechaInicio || fechaFin) {
    pipeline[0].$match.fechaDePublicacion = {};

    if (fechaInicio) {
      pipeline[0].$match.fechaDePublicacion.$gte = new Date(fechaInicio);
    }

    if (fechaFin) {
      pipeline[0].$match.fechaDePublicacion.$lt = new Date(fechaFin);
    }
  }
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
  ];

  addFiltroExtension(pipeline, reporte.extension);
  addFiltroCantidadComentarios(pipeline, reporte.comentarios);
  addLimiteCantidad(pipeline, reporte.cantidad);
  addLimiteFecha(pipeline, reporte.fechaInicio, reporte.fechaFin);

  pipeline.push({ $sort: { cantidadDescargas: -1 } });
  const canciones = await Cancion.aggregate(pipeline);
  res.json(canciones);
});

module.exports = router;

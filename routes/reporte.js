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
  if (extension) {
    if (!pipline[0].$match) pipline[0] = { $match: {} };
    pipline[0].$match.extension = extension;
  }
};

const addFiltroCantidadComentarios = (pipeline, comentarios) => {
  if (comentarios) {
    if (!pipeline[0].$match) pipeline[0] = { $match: {} };
    pipeline[0].$match.comentarios = { $size: comentarios };
  }
};

const addLimiteFecha = (pipeline, fechaInicio, fechaFin) => {
  if (fechaInicio || fechaFin) {
    if (!pipeline[0].$match) pipeline[0] = { $match: {} };
    pipeline[0].$match.fechaDePublicacion = {};

    if (fechaInicio) {
      pipeline[0].$match.fechaDePublicacion.$gte = new Date(fechaInicio);
    }

    if (fechaFin) {
      pipeline[0].$match.fechaDePublicacion.$lt = new Date(fechaFin);
    }
  }
};

router.post("/", async (req, res) => {
  const reporte = req.body;
  const pipeline = [
    {
      $project: {
        titulo: "$titulo",
        fechaDePublicacion: "$fechaDePublicacion",
        extension: "$extension",
        comentarios: { $size: "$comentarios" },
        descargas: { $size: "$descargas" },
      },
    },
  ];

  addFiltroExtension(pipeline, reporte.extension);
  addFiltroCantidadComentarios(pipeline, reporte.comentarios);
  addLimiteCantidad(pipeline, reporte.cantidad);
  addLimiteFecha(pipeline, reporte.fechaInicio, reporte.fechaFin);

  pipeline.push({ $sort: { descargas: -1 } });
  const canciones = await Cancion.aggregate(pipeline);
  res.json(canciones);
});

module.exports = router;

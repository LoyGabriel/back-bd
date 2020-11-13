const express = require('express')
const router = express.Router()
const Cancion = require('../models/Cancion')

// Buscar todas las canciones activas
router.get('/', async (req, res) => {
  try {
    const canciones = await Cancion.find(
      {isActive: true}
    )
    res.json(canciones)
  } catch (err) {
    res.json({message: err})
  }
})

// Buscar todas las canciones activas, contar la cantidad de descargas y comentarios
router.get('/list', async (req, res) => {
  try {
    const canciones = await Cancion.aggregate([
        {
          $match:
            {
              isActive: true
            }
        },
        {
          $project:
            {
              titulo: "$titulo",
              fechaDePublicacion: "$fechaDePublicacion",
              categoria: "$categoria",
              extension: "$extension",
              descargas: {$size: "$descargas"},
              comentarios: {$size: "$comentarios"}
            }
        }
      ]
    )
    res.json(canciones)
  } catch (err) {
    res.json({message: err})
  }
})

// Agregar cancion
router.post('/', async (req, res) => {
  const cancion = new Cancion({
    _id: 6, // TODO: autoincrementar id o usar el que da mongo
    isActive: true,
    titulo: req.body.titulo,
    categoria: req.body.categoria,
    extension: req.body.extension,
    descargas: [],
    comentarios: []
  })

  try {
    const cancionGuardada = await cancion.save()
    res.json(cancionGuardada)
  } catch (err) {
    res.json({message: err})
  }
})

// Buscar cancion por id
router.get('/:cancionID', async (req, res) => {
  try {
    const cancion = await Cancion.findById(req.params.cancionID)
    res.json(cancion)
  } catch (err) {
    res.json({message: err})
  }
})

// Eliminar cancion
// TODO: agregar logica para eliminar archivo
router.patch('/delete/:cancionID', async (req, res) => {
  try {
    const cancion = await Cancion.updateOne(
      {_id: req.params.cancionID},
      {$set: {isActive: false}}
    )
    res.json(cancion)
  } catch (err) {
    res.json({message: err})
  }
})

// Actualizar cancion
// TODO: agregar mas campos que se modifican, definir que viene del front
router.patch('/:cancionID', async (req, res) => {
  try {
    const cancion = await Cancion.updateOne(
      {_id: req.params.cancionID},
      {$set: {nombre: req.body.nombre}}
    )
    res.json(cancion)
  } catch (err) {
    res.json({message: err})
  }
})

module.exports = router

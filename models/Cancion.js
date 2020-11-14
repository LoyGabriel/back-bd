const mongoose = require('mongoose')

const Replica = mongoose.Schema({
  _id:{
    type: Number,
    required: true
  },
  detalle: {
    type: String,
    required: true
  },
  apodo: {
    type: String,
    required: true
  },
  replica: [this]
})

const Comentario = mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  apodo: {
    type: String,
    required: true
  },
  replica: [Replica]
})

const CancionSchema = mongoose.Schema({
  _id:{
    type: Number,
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  categoria: {
    type: Array,
    required: true
  },
  fechaDePublicacion: {
    type: Date,
    default: Date.now
  },
  comentarios: [Comentario],
  descargas: {
    type: Array,
    required: true,
    default: []
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  },
  contenido:{
    data: Buffer,
    contentType: String,
    default:""    
  }
}, {collection: 'canciones'})

module.exports = mongoose.model('Cancion', CancionSchema)

const mongoose = require("mongoose");

const CategoriaSchema = mongoose.Schema(
    {
      categoria: {
        type: String,
        required: true,
      }
  }, {collection: 'categorias'})
  
  
  module.exports = mongoose.model("Categoria", CategoriaSchema);
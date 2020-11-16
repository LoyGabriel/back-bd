const express = require("express");
const router = express.Router();
const Categoria = require("../models/Categoria");

// Buscar todas las categorias 
router.get("/", async (req, res) => {
    try {
      const categorias = await Categoria.find();
      console.log("N° de categorias: ", categorias.length);
      res.json(categorias);
    } catch (err) {
      res.json({ message: err });
    }
  });

  module.exports=router
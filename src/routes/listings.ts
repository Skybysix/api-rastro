import { Router } from "express";
import { listingsCollection } from "../db";
import { ObjectId } from "mongodb";
import type { Filter } from "mongodb";
import type { Listing } from "../types";

const router = Router();

// Campos que queremos mostrar en el listado
const LIST_FIELDS = {
  title: 1,
  price: 1,
  category: 1,
  city: 1,
  status: 1,
};

// GET /api/listings (listado)
router.get("/", async (req, res) => {
  const filter: Filter<Listing> = {};

  if (typeof req.query.category === "string") {
    filter.category = req.query.category;
  }
  if (typeof req.query.city === "string") {
    filter.city = req.query.city;
  }
  if (typeof req.query.maxPrice === "string") {
    const maxPrice = Number(req.query.maxPrice);

    if (Number.isNaN(maxPrice)) {
      res.status(400).json({ error: "maxPrice debe ser un número" });
      return;
    }

    filter.price = { $lte: maxPrice };
  }

  const listings = await listingsCollection()
    .find(filter)
    .project(LIST_FIELDS)
    .sort({ publishedAt: -1 })
    .toArray();

  res.json(listings);
});
// GET /api/listings/:id (ficha completa)
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Comprobar que el ID tiene formato válido
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "ID de anuncio no válido" });
    return;
  }

  // Buscar el anuncio, sumar una visita y devolverlo actualizado
  const listing = await listingsCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $inc: { views: 1 } },
    { returnDocument: "after" },
  );

  // Si no existe el anuncio
  if (!listing) {
    res.status(404).json({ error: "Anuncio no encontrado" });
    return;
  }

  res.json(listing);
});

export default router;
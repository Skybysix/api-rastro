import { Router } from "express";
import { listingsCollection, usersCollection } from "../db";
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
// POST /api/listings (publicar anuncio)
router.post("/", async (req, res) => {
  const body = req.body;
  if (
    typeof body.title !== "string" ||
    body.title.trim() === "" ||
    typeof body.description !== "string" ||
    body.description.trim() === "" ||
    typeof body.category !== "string" ||
    body.category.trim() === "" ||
    typeof body.city !== "string" ||
    body.city.trim() === ""
  ) {
    res.status(400).json({ error: "Faltan campos de texto obligatorios" });
    return;
  }
  if (typeof body.price !== "number" || body.price < 0) {
    res.status(400).json({ error: "price debe ser un número mayor o igual que 0" });
    return;
  }
  if (typeof body.sellerId !== "string" || !ObjectId.isValid(body.sellerId)) {
    res.status(400).json({ error: "sellerId no tiene un formato válido" });
    return;
  }
  const seller = await usersCollection().findOne({
    _id: new ObjectId(body.sellerId),
  });

  if (!seller) {
    res.status(400).json({ error: "No existe ningún usuario con ese sellerId" });
    return;
  }
  const newListing: Listing = {
    title: body.title.trim(),
    description: body.description.trim(),
    price: body.price,
    category: body.category.trim(),
    status: "AVAILABLE",
    city: body.city.trim(),
    publishedAt: new Date(),
    views: 0,
    seller: {
      id: seller._id,
      name: seller.name,
    },
    photos: [],
    attributes: body.attributes ?? {},
  };
  const result = await listingsCollection().insertOne(newListing);

  res.status(201).json({
    _id: result.insertedId,
    ...newListing,
  });
});

// PATCH /api/listings/:id (cambiar precio)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  // Comprobar que el ID es válido
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "ID de anuncio no válido" });
    return;
  }

  // Comprobar que el precio es un número mayor o igual que 0
  if (typeof price !== "number" || price < 0) {
    res.status(400).json({
      error: "price debe ser un número mayor o igual que 0",
    });
    return;
  }

  // Actualizar únicamente el precio
  const listing = await listingsCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { price } },
    { returnDocument: "after" },
  );

  // Comprobar que el anuncio existe
  if (!listing) {
    res.status(404).json({ error: "Anuncio no encontrado" });
    return;
  }

  res.json(listing);
});

// DELETE /api/listings/:id (borrar anuncio)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // Comprobar que el ID es válido
  if (!ObjectId.isValid(id)) {
    res.status(400).json({ error: "ID de anuncio no válido" });
    return;
  }

  // Eliminar el anuncio
  const result = await listingsCollection().deleteOne({
    _id: new ObjectId(id),
  });

  // Comprobar si existía
  if (result.deletedCount === 0) {
    res.status(404).json({ error: "Anuncio no encontrado" });
    return;
  }

  res.status(204).send();
});

export default router;
import { Router } from "express";
import { ObjectId } from "mongodb";
import {
  listingsCollection,
  usersCollection,
  offersCollection,
} from "../db";
import type { Offer } from "../types";

const router = Router();

// POST /api/offers (crear una oferta)
router.post("/", async (req, res) => {
  const { listingId, buyerId, amount } = req.body;

  // 1. Comprobar que los IDs tienen formato válido
  if (
    typeof listingId !== "string" ||
    !ObjectId.isValid(listingId) ||
    typeof buyerId !== "string" ||
    !ObjectId.isValid(buyerId)
  ) {
    res.status(400).json({ error: "listingId o buyerId no tienen un formato válido" });
    return;
  }

  // 2. Comprobar que amount es un número mayor que 0
  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ error: "amount debe ser un número mayor que 0" });
    return;
  }

  // 3. Comprobar que el anuncio existe
  const listing = await listingsCollection().findOne({
    _id: new ObjectId(listingId),
  });

  if (!listing) {
    res.status(400).json({ error: "El anuncio no existe" });
    return;
  }

  // 4. Comprobar que el comprador existe
  const buyer = await usersCollection().findOne({
    _id: new ObjectId(buyerId),
  });

  if (!buyer) {
    res.status(400).json({ error: "El comprador no existe" });
    return;
  }

  // 5. Comprobar que el anuncio está disponible
  if (listing.status !== "AVAILABLE") {
    res.status(409).json({ error: "El anuncio no está disponible" });
    return;
  }

  // Crear la oferta con copias de los datos del anuncio y comprador
  const newOffer: Offer = {
    amount,
    status: "PENDING",
    createdAt: new Date(),
    listing: {
      id: new ObjectId(listingId),
      title: listing.title,
      price: listing.price,
    },
    buyer: {
      id: new ObjectId(buyerId),
      name: buyer.name,
    },
  };

  const result = await offersCollection().insertOne(newOffer);

  res.status(201).json({
    _id: result.insertedId,
    ...newOffer,
  });
});

export default router;
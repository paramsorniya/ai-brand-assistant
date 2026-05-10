import { Request, Response, Router } from "express";
import { createBrand, getAllBrands, getBrandById, getMessagesByBrandId } from "../services/brand.service";

const router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const brands = await getAllBrands();
    return res.status(200).json(brands);
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return res.status(500).json({ error: "Unable to load brands right now" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name?: unknown };

    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Brand name is required" });
    }

    const brand = await createBrand(name.trim());
    return res.status(201).json(brand);
  } catch (error) {
    console.error("Failed to create brand:", error);
    return res.status(500).json({ error: "Unable to create the brand" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      return res.status(400).json({ error: "Invalid brand id format" });
    }

    const brand = await getBrandById(id);

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const messages = await getMessagesByBrandId(id);

    return res.status(200).json({
      brand,
      messages,
    });
  } catch (error) {
    console.error("Failed to fetch brand details:", error);
    return res.status(500).json({ error: "Unable to load the selected brand" });
  }
});

export default router;

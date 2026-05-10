import { sql } from "../db";
import { Brand, BrandSummary, Message } from "../types";

type BrandRow = Omit<Brand, "summary"> & { summary: BrandSummary | null };

function normalizeSummary(summary: BrandSummary | null | undefined): BrandSummary {
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    return {};
  }

  return summary;
}

function mapBrand(row: BrandRow): Brand {
  return {
    ...row,
    summary: normalizeSummary(row.summary),
  };
}

export async function createBrand(name: string): Promise<Brand> {
  const result = (await sql`
    INSERT INTO brands (name, summary)
    VALUES (${name}, ${JSON.stringify({})}::jsonb)
    RETURNING *
  `) as BrandRow[];

  return mapBrand(result[0]);
}

export async function getAllBrands(): Promise<Brand[]> {
  const result = (await sql`
    SELECT *
    FROM brands
    ORDER BY created_at DESC
  `) as BrandRow[];

  return result.map(mapBrand);
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const result = (await sql`
    SELECT *
    FROM brands
    WHERE id = ${id}
  `) as BrandRow[];

  if (!result[0]) {
    return null;
  }

  return mapBrand(result[0]);
}

export async function updateBrandSummary(id: string, summary: BrandSummary): Promise<Brand> {
  const result = (await sql`
    UPDATE brands
    SET summary = ${JSON.stringify(summary)}::jsonb, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `) as BrandRow[];

  return mapBrand(result[0]);
}

export async function saveMessage(
  brandId: string,
  role: "user" | "assistant",
  content: string,
): Promise<void> {
  await sql`
    INSERT INTO messages (brand_id, role, content)
    VALUES (${brandId}, ${role}, ${content})
  `;

  await sql`
    WITH stale_messages AS (
      SELECT id
      FROM messages
      WHERE brand_id = ${brandId}
      ORDER BY created_at DESC, id DESC
      OFFSET 6
    )
    DELETE FROM messages
    WHERE id IN (SELECT id FROM stale_messages)
  `;
}

export async function getMessagesByBrandId(brandId: string): Promise<Message[]> {
  const result = (await sql`
    SELECT *
    FROM messages
    WHERE brand_id = ${brandId}
    ORDER BY created_at ASC, id ASC
  `) as Message[];

  return result;
}

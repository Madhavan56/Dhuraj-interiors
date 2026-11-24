import type { CategoryRow } from "./projects.ts";

export type FieldErrors = Record<string, string>;

export type ProjectInput = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: number;
  status: "published" | "draft";
  isFeatured: boolean;
  displayOrder: number;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseBoolean(value: unknown): boolean {
  const raw = typeof value === "string" ? value.toLowerCase() : value;
  return raw === "true" || raw === "1" || raw === 1 || raw === "yes" || raw === "on";
}

export function parseProjectInput(
  body: Record<string, unknown>,
  categoryLookup: (id: number) => CategoryRow | undefined,
): { data?: ProjectInput; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const title = text(body.title);
  if (title.length < 2) errors.title = "Give the project a title of at least 2 characters.";
  else if (title.length > 120) errors.title = "Keep the title under 120 characters.";

  const shortDescription = text(body.shortDescription);
  if (!shortDescription) errors.shortDescription = "A short description is required.";
  else if (shortDescription.length > 300) {
    errors.shortDescription = "Keep the short description under 300 characters.";
  }

  const fullDescription = text(body.fullDescription);
  if (!fullDescription) errors.fullDescription = "A full description is required.";
  else if (fullDescription.length > 20_000) {
    errors.fullDescription = "The full description is too long.";
  }

  const categoryId = Number.parseInt(text(body.categoryId), 10);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    errors.categoryId = "Choose a project category.";
  } else if (!categoryLookup(categoryId)) {
    errors.categoryId = "That category no longer exists. Choose another.";
  }

  const status = text(body.status) === "published" ? "published" : "draft";

  const rawOrder = text(body.displayOrder);
  const displayOrder = rawOrder === "" ? 0 : Number(rawOrder);
  if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 9999) {
    errors.displayOrder = "Display order must be a whole number between 0 and 9999.";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    data: {
      title,
      shortDescription,
      fullDescription,
      categoryId,
      status,
      isFeatured: parseBoolean(body.isFeatured),
      displayOrder,
    },
  };
}

export function parseKeepImageIds(value: unknown): number[] {
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => Number.isInteger(id) && Number(id) > 0).map(Number);
  } catch {
    return [];
  }
}

export function validWhatsapp(value: unknown): string | null {
  const digits = text(value).replace(/[^\d]/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

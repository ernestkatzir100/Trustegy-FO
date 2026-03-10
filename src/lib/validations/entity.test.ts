import { describe, expect, it } from "vitest";
import {
  insertEntitySchema,
  updateEntitySchema,
  insertTaxCategorySchema,
} from "./entity";

describe("insertEntitySchema", () => {
  it("validates a valid entity", () => {
    const result = insertEntitySchema.safeParse({
      name: "Test Entity",
      description: "A test",
    });
    expect(result.success).toBe(true);
  });

  it("requires a name", () => {
    const result = insertEntitySchema.safeParse({
      description: "No name",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = insertEntitySchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("allows optional description", () => {
    const result = insertEntitySchema.safeParse({
      name: "Just a name",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
    }
  });
});

describe("updateEntitySchema", () => {
  it("allows partial updates", () => {
    const result = updateEntitySchema.safeParse({
      name: "New Name",
    });
    expect(result.success).toBe(true);
  });

  it("allows empty object", () => {
    const result = updateEntitySchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("insertTaxCategorySchema", () => {
  it("validates a valid tax category", () => {
    const result = insertTaxCategorySchema.safeParse({
      name: "הכנסות מייעוץ",
      description: "הכנסות מפעילות ייעוץ",
    });
    expect(result.success).toBe(true);
  });

  it("requires a name", () => {
    const result = insertTaxCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { toAgorot, fromAgorot, formatILS, calculateVat } from "./money";

describe("toAgorot", () => {
  it("converts ILS to agorot", () => {
    expect(toAgorot(10.54)).toBe(1054);
  });

  it("converts large ILS amounts", () => {
    expect(toAgorot(1054975)).toBe(105497500);
  });

  it("handles zero", () => {
    expect(toAgorot(0)).toBe(0);
  });

  it("handles negative amounts", () => {
    expect(toAgorot(-25.5)).toBe(-2550);
  });

  it("rounds correctly for floating point edge cases", () => {
    expect(toAgorot(0.1 + 0.2)).toBe(30);
  });

  it("handles very small amounts", () => {
    expect(toAgorot(0.01)).toBe(1);
  });
});

describe("fromAgorot", () => {
  it("converts agorot to ILS", () => {
    expect(fromAgorot(105497500)).toBe(1054975);
  });

  it("handles zero", () => {
    expect(fromAgorot(0)).toBe(0);
  });

  it("handles negative amounts", () => {
    expect(fromAgorot(-2550)).toBe(-25.5);
  });

  it("handles single agorot", () => {
    expect(fromAgorot(1)).toBe(0.01);
  });
});

describe("formatILS", () => {
  it("formats large amounts with commas", () => {
    const result = formatILS(105497500);
    expect(result).toContain("1,054,975.00");
    expect(result).toContain("₪");
  });

  it("formats zero", () => {
    const result = formatILS(0);
    expect(result).toContain("0.00");
    expect(result).toContain("₪");
  });

  it("formats small amounts", () => {
    const result = formatILS(150);
    expect(result).toContain("1.50");
    expect(result).toContain("₪");
  });

  it("formats negative amounts", () => {
    const result = formatILS(-50000);
    expect(result).toContain("500.00");
  });
});

describe("calculateVat", () => {
  it("calculates 17% VAT on ₪1,000", () => {
    expect(calculateVat(100000, 1700)).toBe(17000);
  });

  it("uses floor — never rounds up", () => {
    expect(calculateVat(99999, 1700)).toBe(16999);
  });

  it("handles zero base", () => {
    expect(calculateVat(0, 1700)).toBe(0);
  });

  it("handles zero rate", () => {
    expect(calculateVat(100000, 0)).toBe(0);
  });

  it("handles large amounts", () => {
    expect(calculateVat(10000000, 1700)).toBe(1700000);
  });

  it("floors fractional results", () => {
    expect(calculateVat(1, 1700)).toBe(0);
  });

  it("handles 18% VAT", () => {
    expect(calculateVat(100000, 1800)).toBe(18000);
  });
});

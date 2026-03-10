import { describe, expect, it } from "vitest";
import { actionError, actionSuccess } from "./actions";

describe("actionError", () => {
  it("creates an error result", () => {
    const result = actionError("UNAUTHORIZED", "Not logged in");
    expect(result.data).toBeNull();
    expect(result.error).toEqual({
      code: "UNAUTHORIZED",
      message: "Not logged in",
    });
  });
});

describe("actionSuccess", () => {
  it("creates a success result with data", () => {
    const result = actionSuccess({ id: "123", name: "Test" });
    expect(result.data).toEqual({ id: "123", name: "Test" });
    expect(result.error).toBeNull();
  });

  it("works with primitive values", () => {
    const result = actionSuccess(42);
    expect(result.data).toBe(42);
    expect(result.error).toBeNull();
  });

  it("works with arrays", () => {
    const result = actionSuccess([1, 2, 3]);
    expect(result.data).toEqual([1, 2, 3]);
    expect(result.error).toBeNull();
  });
});

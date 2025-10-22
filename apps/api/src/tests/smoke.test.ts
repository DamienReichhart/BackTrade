const { describe, it, expect } = require("vitest");

describe("smoke", () => {
  it("runs a simple assertion", () => {
    expect(1 + 1).toBe(2);
  });
});

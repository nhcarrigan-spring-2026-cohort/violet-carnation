import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("should handle conditional classes", () => {
    const result = cn("base-class", {
      "conditional-class": true,
      "false-class": false,
    });
    expect(result).toContain("base-class");
    expect(result).toContain("conditional-class");
    expect(result).not.toContain("false-class");
  });

  it("should merge Tailwind classes without conflicts", () => {
    const result = cn("px-2 py-1", "p-4");
    expect(result).toBe("p-4");
  });

  it("should handle undefined and null values", () => {
    const result = cn("base", undefined, null, "other");
    expect(result).toBe("base other");
  });
});

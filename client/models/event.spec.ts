import { getTimeOfDay } from "./event";

describe("getTimeOfDay", () => {
  describe("Mornings (6:00 - 11:59)", () => {
    it("should return 'Mornings' for 06:00", () => {
      expect(getTimeOfDay("06:00")).toBe("Mornings");
    });

    it("should return 'Mornings' for 09:30", () => {
      expect(getTimeOfDay("09:30")).toBe("Mornings");
    });

    it("should return 'Mornings' for 11:59", () => {
      expect(getTimeOfDay("11:59")).toBe("Mornings");
    });

    it("should return 'Mornings' for ISO 8601 format with T separator", () => {
      expect(getTimeOfDay("2026-02-17T08:00:00")).toBe("Mornings");
    });

    it("should return 'Mornings' for space-separated datetime", () => {
      expect(getTimeOfDay("2026-02-17 10:30:00")).toBe("Mornings");
    });
  });

  describe("Afternoons (12:00 - 16:59)", () => {
    it("should return 'Afternoons' for 12:00", () => {
      expect(getTimeOfDay("12:00")).toBe("Afternoons");
    });

    it("should return 'Afternoons' for 14:30", () => {
      expect(getTimeOfDay("14:30")).toBe("Afternoons");
    });

    it("should return 'Afternoons' for 16:59", () => {
      expect(getTimeOfDay("16:59")).toBe("Afternoons");
    });

    it("should return 'Afternoons' for ISO 8601 format", () => {
      expect(getTimeOfDay("2026-02-17T15:00:00")).toBe("Afternoons");
    });
  });

  describe("Evenings (17:00 - 21:59)", () => {
    it("should return 'Evenings' for 17:00", () => {
      expect(getTimeOfDay("17:00")).toBe("Evenings");
    });

    it("should return 'Evenings' for 19:30", () => {
      expect(getTimeOfDay("19:30")).toBe("Evenings");
    });

    it("should return 'Evenings' for 21:59", () => {
      expect(getTimeOfDay("21:59")).toBe("Evenings");
    });

    it("should return 'Evenings' for ISO 8601 format", () => {
      expect(getTimeOfDay("2026-02-17T18:00:00")).toBe("Evenings");
    });
  });

  describe("Outside defined ranges (late night)", () => {
    it("should return null for 05:59 (before morning)", () => {
      expect(getTimeOfDay("05:59")).toBeNull();
    });

    it("should return null for 22:00 (after evening)", () => {
      expect(getTimeOfDay("22:00")).toBeNull();
    });

    it("should return null for 00:00 (midnight)", () => {
      expect(getTimeOfDay("00:00")).toBeNull();
    });

    it("should return null for 23:59 (late night)", () => {
      expect(getTimeOfDay("23:59")).toBeNull();
    });

    it("should return null for 03:30 (early morning)", () => {
      expect(getTimeOfDay("03:30")).toBeNull();
    });
  });

  describe("Edge cases and boundaries", () => {
    it("should handle boundary at start of Mornings (06:00)", () => {
      expect(getTimeOfDay("06:00")).toBe("Mornings");
    });

    it("should handle boundary at end of Mornings (11:00)", () => {
      expect(getTimeOfDay("11:00")).toBe("Mornings");
    });

    it("should handle boundary at start of Afternoons (12:00)", () => {
      expect(getTimeOfDay("12:00")).toBe("Afternoons");
    });

    it("should handle boundary at end of Afternoons (16:00)", () => {
      expect(getTimeOfDay("16:00")).toBe("Afternoons");
    });

    it("should handle boundary at start of Evenings (17:00)", () => {
      expect(getTimeOfDay("17:00")).toBe("Evenings");
    });

    it("should handle boundary at end of Evenings (21:00)", () => {
      expect(getTimeOfDay("21:00")).toBe("Evenings");
    });
  });

  describe("Invalid input", () => {
    it("should return null for invalid time format", () => {
      expect(getTimeOfDay("invalid")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(getTimeOfDay("")).toBeNull();
    });

    it("should return null for malformed datetime", () => {
      expect(getTimeOfDay("2026-02-17")).toBeNull();
    });
  });

  describe("Various datetime formats", () => {
    it("should handle ISO 8601 with milliseconds", () => {
      expect(getTimeOfDay("2026-02-17T09:30:00.000Z")).toBe("Mornings");
    });

    it("should handle ISO 8601 with timezone", () => {
      expect(getTimeOfDay("2026-02-17T14:30:00+00:00")).toBe("Afternoons");
    });

    it("should handle space-separated without seconds", () => {
      expect(getTimeOfDay("2026-02-17 18:00")).toBe("Evenings");
    });
  });
});

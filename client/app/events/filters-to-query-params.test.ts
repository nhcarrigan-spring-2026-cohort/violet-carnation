import { Filters } from "@/models/filters";
import { filtersToQueryParams } from "./filters-to-query-params";

describe("filtersToQueryParams", () => {
  describe("no availability filters", () => {
    it("should return empty params when availability is null", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: null,
      };

      const params = filtersToQueryParams(filters);

      expect(params.toString()).toBe("");
    });

    it("should return empty params when availability is empty array", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: [],
      };

      const params = filtersToQueryParams(filters);

      expect(params.toString()).toBe("");
    });
  });

  describe("scope and category are ignored (not supported by API)", () => {
    it("should not include scope params even when scope is set", () => {
      const filters: Filters = {
        scope: "myOrgs",
        category: null,
        availability: null,
      };

      const params = filtersToQueryParams(filters);

      expect(params.has("scope")).toBe(false);
      expect(params.toString()).toBe("");
    });

    it("should not include category params even when category is set", () => {
      const filters: Filters = {
        scope: "all",
        category: "Education & Tutoring",
        availability: null,
      };

      const params = filtersToQueryParams(filters);

      expect(params.has("category")).toBe(false);
      expect(params.toString()).toBe("");
    });
  });

  describe("single time-of-day availability", () => {
    it("should map Mornings to begin_time=06:00 and end_time=11:59", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Mornings"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("06:00");
      expect(params.get("end_time")).toBe("11:59");
      expect(params.has("is_weekday")).toBe(false);
    });

    it("should map Afternoons to begin_time=12:00 and end_time=16:59", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Afternoons"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("12:00");
      expect(params.get("end_time")).toBe("16:59");
    });

    it("should map Evenings to begin_time=17:00 and end_time=21:59", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Evenings"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("17:00");
      expect(params.get("end_time")).toBe("21:59");
    });
  });

  describe("weekends availability", () => {
    it("should map Weekends to is_weekday=false", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Weekends"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("is_weekday")).toBe("false");
      expect(params.has("begin_time")).toBe(false);
      expect(params.has("end_time")).toBe(false);
    });
  });

  describe("multiple time-of-day availability (broadest range)", () => {
    it("should use broadest range for Mornings + Evenings (06:00-21:59)", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Mornings", "Evenings"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("06:00");
      expect(params.get("end_time")).toBe("21:59");
      expect(params.has("is_weekday")).toBe(false);
    });

    it("should use broadest range for Mornings + Afternoons (06:00-16:59)", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Mornings", "Afternoons"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("06:00");
      expect(params.get("end_time")).toBe("16:59");
    });

    it("should use broadest range for all three time slots (06:00-21:59)", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Mornings", "Afternoons", "Evenings"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("06:00");
      expect(params.get("end_time")).toBe("21:59");
    });

    it("should use broadest range for Afternoons + Evenings (12:00-21:59)", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Afternoons", "Evenings"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("12:00");
      expect(params.get("end_time")).toBe("21:59");
    });
  });

  describe("weekends + time-of-day (OR semantics cannot be expressed)", () => {
    it("should return empty params for Weekends + Mornings (can't express OR)", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Weekends", "Mornings"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.toString()).toBe("");
    });

    it("should return empty params for Weekends + Evenings (can't express OR)", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Weekends", "Evenings"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.toString()).toBe("");
    });

    it("should return empty params for Weekends + multiple time slots", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Weekends", "Mornings", "Evenings"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.toString()).toBe("");
    });
  });

  describe("Flexible availability", () => {
    it("should return empty params when Flexible is selected alone", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Flexible"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.toString()).toBe("");
    });

    it("should return empty params when Flexible is selected with other options", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Flexible", "Mornings"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.toString()).toBe("");
    });

    it("should return empty params when Flexible is selected with Weekends", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Flexible", "Weekends"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.toString()).toBe("");
    });
  });

  describe("combined with scope and category (should only produce availability params)", () => {
    it("should produce time params even when scope and category are set", () => {
      const filters: Filters = {
        scope: "admin",
        category: "Environmental Conservation",
        availability: ["Mornings"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("06:00");
      expect(params.get("end_time")).toBe("11:59");
      expect(params.has("scope")).toBe(false);
      expect(params.has("category")).toBe(false);
    });

    it("should produce weekend params even when scope is set", () => {
      const filters: Filters = {
        scope: "myOrgs",
        category: null,
        availability: ["Weekends"],
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("is_weekday")).toBe("false");
      expect(params.has("scope")).toBe(false);
    });
  });
});

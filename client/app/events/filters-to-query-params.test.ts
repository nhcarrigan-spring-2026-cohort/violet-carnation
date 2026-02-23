import { Filters } from "@/models/filters";
import { Role } from "@/models/roles";
import { filtersToQueryParams } from "./filters-to-query-params";

describe("filtersToQueryParams", () => {
  describe("no availability filters", () => {
    it("should return empty params when availability is null", () => {
      const filters: Filters = {
        scope: "all",
        availability: null,
      };

      const params = filtersToQueryParams(filters);

      expect(params.toString()).toBe("");
    });
  });

  // category filter removed from the Filters model until API support is added.
  // describe("category is ignored (not supported by API)", () => { ... });

  describe("scope maps to organization_id params", () => {
    const roles: Role[] = [
      { user_id: 1, organization_id: 10, permission_level: "volunteer" },
      { user_id: 1, organization_id: 20, permission_level: "admin" },
      { user_id: 1, organization_id: 30, permission_level: "admin" },
    ];

    it("should produce no organization_id params when scope is 'all'", () => {
      const filters: Filters = { scope: "all", availability: null };

      const params = filtersToQueryParams(filters, roles);

      expect(params.has("organization_id")).toBe(false);
    });

    it("should produce organization_id for every role when scope is 'myOrgs'", () => {
      const filters: Filters = { scope: "myOrgs", availability: null };

      const params = filtersToQueryParams(filters, roles);

      expect(params.getAll("organization_id")).toEqual(["10", "20", "30"]);
    });

    it("should produce organization_id only for admin roles when scope is 'admin'", () => {
      const filters: Filters = { scope: "admin", availability: null };

      const params = filtersToQueryParams(filters, roles);

      expect(params.getAll("organization_id")).toEqual(["20", "30"]);
    });

    it("should produce no organization_id params when scope is 'myOrgs' but user has no roles", () => {
      const filters: Filters = { scope: "myOrgs", availability: null };

      const params = filtersToQueryParams(filters, []);

      expect(params.has("organization_id")).toBe(false);
      expect(params.toString()).toBe("");
    });

    it("should combine organization_id with availability params", () => {
      const filters: Filters = {
        scope: "myOrgs",
        availability: "Mornings",
      };

      const params = filtersToQueryParams(filters, roles);

      expect(params.getAll("organization_id")).toEqual(["10", "20", "30"]);
      expect(params.get("begin_time")).toBe("06:00");
      expect(params.get("end_time")).toBe("11:59");
    });
  });

  describe("time-of-day availability", () => {
    it("should map Mornings to begin_time=06:00 and end_time=11:59", () => {
      const filters: Filters = {
        scope: "all",
        availability: "Mornings",
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("06:00");
      expect(params.get("end_time")).toBe("11:59");
      expect(params.has("is_weekday")).toBe(false);
    });

    it("should map Afternoons to begin_time=12:00 and end_time=16:59", () => {
      const filters: Filters = {
        scope: "all",
        availability: "Afternoons",
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("12:00");
      expect(params.get("end_time")).toBe("16:59");
    });

    it("should map Evenings to begin_time=17:00 and end_time=21:59", () => {
      const filters: Filters = {
        scope: "all",
        availability: "Evenings",
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
        availability: "Weekends",
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("is_weekday")).toBe("false");
      expect(params.has("begin_time")).toBe(false);
      expect(params.has("end_time")).toBe(false);
    });
  });

  describe("Flexible availability", () => {
    it("should return empty params when Flexible is selected", () => {
      const filters: Filters = {
        scope: "all",
        availability: "Flexible",
      };

      const params = filtersToQueryParams(filters);

      expect(params.toString()).toBe("");
    });
  });

  describe("location filter", () => {
    it("should set location param when location is provided", () => {
      const filters: Filters = {
        scope: "all",
        availability: null,
        location: "Austin",
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("location")).toBe("Austin");
    });

    it("should not set location param when location is null", () => {
      const filters: Filters = {
        scope: "all",
        availability: null,
        location: null,
      };

      const params = filtersToQueryParams(filters);

      expect(params.has("location")).toBe(false);
    });

    it("should combine location with other filters", () => {
      const filters: Filters = {
        scope: "all",
        availability: "Mornings",
        location: "New York",
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("location")).toBe("New York");
      expect(params.get("begin_time")).toBe("06:00");
      expect(params.get("end_time")).toBe("11:59");
    });
  });

  describe("combined with scope (should only produce availability params)", () => {
    it("should produce time params even when scope is set", () => {
      const filters: Filters = {
        scope: "admin",
        availability: "Mornings",
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("begin_time")).toBe("06:00");
      expect(params.get("end_time")).toBe("11:59");
      expect(params.has("scope")).toBe(false);
    });

    it("should produce weekend params even when scope is set", () => {
      const filters: Filters = {
        scope: "myOrgs",
        availability: "Weekends",
      };

      const params = filtersToQueryParams(filters);

      expect(params.get("is_weekday")).toBe("false");
      expect(params.has("scope")).toBe(false);
    });
  });
});

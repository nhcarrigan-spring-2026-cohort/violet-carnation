import { Event } from "@/models/event";
import { Filters } from "@/models/filters";
import { Role } from "@/models/roles";
import { applyEventFilters } from "./apply-event-filters";

describe("applyFilters", () => {
  const mockEvents: Event[] = [
    {
      id: 1,
      name: "Morning Cleanup",
      description: "Beach cleanup",
      location: "Beach",
      category: "Environmental Conservation",
      date: "2026-03-15",
      time: "09:00",
      time_zone: "PST",
      organization_id: 1,
      signup_count: 10,
      user_signed_up: false,
      is_weekend: false,
    },
    {
      id: 2,
      name: "Evening Tutoring",
      description: "Help students",
      location: "School",
      category: "Education & Tutoring",
      date: "2026-03-16",
      time: "18:00",
      time_zone: "PST",
      organization_id: 2,
      signup_count: 5,
      user_signed_up: false,
      is_weekend: false,
    },
    {
      id: 3,
      name: "Weekend Food Drive",
      description: "Collect food",
      location: "Community Center",
      category: "Community Development",
      date: "2026-03-20",
      time: "10:00",
      time_zone: "PST",
      organization_id: 1,
      signup_count: 20,
      user_signed_up: true,
      is_weekend: true,
    },
    {
      id: 4,
      name: "Afternoon Workshop",
      description: "Skills workshop",
      location: "Library",
      category: "Education & Tutoring",
      date: "2026-03-17",
      time: "14:00",
      time_zone: "PST",
      organization_id: 3,
      signup_count: 15,
      user_signed_up: false,
      is_weekend: false,
    },
  ];

  const mockUserRoles: Role[] = [
    { user_id: 1, organization_id: 1, permission_level: "admin" },
    { user_id: 1, organization_id: 2, permission_level: "volunteer" },
  ];

  describe("scope filtering", () => {
    it("should return all events when scope is 'all'", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: null,
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(4);
      expect(result).toEqual(mockEvents);
    });

    it("should filter events by user organizations when scope is 'myOrgs'", () => {
      const filters: Filters = {
        scope: "myOrgs",
        category: null,
        availability: null,
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(3);
      expect(result.map((e) => e.organization_id)).toEqual([1, 2, 1]);
    });

    it("should filter events by admin organizations when scope is 'admin'", () => {
      const filters: Filters = {
        scope: "admin",
        category: null,
        availability: null,
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(2);
      expect(result.every((e) => e.organization_id === 1)).toBe(true);
    });

    it("should return empty array when user has no roles and scope is 'myOrgs'", () => {
      const filters: Filters = {
        scope: "myOrgs",
        category: null,
        availability: null,
      };

      const result = applyEventFilters(mockEvents, filters, []);

      expect(result).toHaveLength(0);
    });
  });

  describe("category filtering", () => {
    it("should filter events by category", () => {
      const filters: Filters = {
        scope: "all",
        category: "Education & Tutoring",
        availability: null,
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(2);
      expect(result.every((e) => e.category === "Education & Tutoring")).toBe(true);
    });

    it("should return empty array when no events match category", () => {
      const filters: Filters = {
        scope: "all",
        category: "Health & Medical",
        availability: null,
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(0);
    });
  });

  describe("availability filtering", () => {
    it("should filter events by weekend availability", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Weekends"],
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(1);
      expect(result[0].is_weekend).toBe(true);
    });

    it("should filter events by morning time", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Mornings"],
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id)).toEqual([1, 3]);
    });

    it("should filter events by evening time", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Evenings"],
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(1);
      expect(result[0].time).toBe("18:00");
    });

    it("should filter events by afternoon time", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Afternoons"],
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(1);
      expect(result[0].time).toBe("14:00");
    });

    it("should filter events by multiple availability options", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Mornings", "Evenings"],
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(3);
    });

    it("should combine weekend and time of day filters", () => {
      const filters: Filters = {
        scope: "all",
        category: null,
        availability: ["Weekends", "Mornings"],
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(2);
    });
  });

  describe("combined filtering", () => {
    it("should apply scope and category filters together", () => {
      const filters: Filters = {
        scope: "myOrgs",
        category: "Education & Tutoring",
        availability: null,
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("should apply all filters together", () => {
      const filters: Filters = {
        scope: "admin",
        category: "Environmental Conservation",
        availability: ["Mornings"],
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("should return empty array when combined filters match nothing", () => {
      const filters: Filters = {
        scope: "admin",
        category: "Education & Tutoring",
        availability: ["Weekends"],
      };

      const result = applyEventFilters(mockEvents, filters, mockUserRoles);

      expect(result).toHaveLength(0);
    });
  });
});

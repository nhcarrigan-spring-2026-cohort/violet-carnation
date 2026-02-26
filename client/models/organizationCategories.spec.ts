import {
  getOrganizationCategoryLabel,
  ORGANIZATION_CATEGORIES,
} from "./organizationCategories";

describe("getOrganizationCategoryLabel", () => {
  it("should return the correct label for a known category value", () => {
    expect(getOrganizationCategoryLabel("animal_welfare")).toBe("Animal Welfare");
  });

  it("should return the correct label for another known category value", () => {
    expect(getOrganizationCategoryLabel("mental_health_and_crisis_support")).toBe(
      "Mental Health & Crisis Support",
    );
  });

  it("should return the raw value when the category is unknown", () => {
    expect(getOrganizationCategoryLabel("unknown_category")).toBe("unknown_category");
  });

  it("should return the raw value for an empty string", () => {
    expect(getOrganizationCategoryLabel("")).toBe("");
  });

  it("should return correct labels for all entries in ORGANIZATION_CATEGORIES", () => {
    for (const { value, label } of ORGANIZATION_CATEGORIES) {
      expect(getOrganizationCategoryLabel(value)).toBe(label);
    }
  });
});

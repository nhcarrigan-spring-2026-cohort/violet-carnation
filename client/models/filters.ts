export interface Filters {
	scope: "all" | "myOrgs" | "admin";
	category: string | null;
	radius: number | null;
	timeFrame: string | null;
}

export type Availability = "Full-time" | "Part-time" | "Weekends" | "Evenings";

export interface User {
	user_id: number;
	email: string;
	first_name: string;
	last_name: string;
	availability: Availability;
}

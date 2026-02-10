export interface Event {
	id: number;
	name: string;
	description: string;
	location: string;
	date: string;
	time: string;
	time_zone: string;
	organization_id: number;
	signup_count: number;
	user_signed_up: boolean;
}

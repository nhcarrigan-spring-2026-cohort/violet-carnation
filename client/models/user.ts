export type Availability =
  | "Mornings"
  | "Afternoons"
  | "Evenings"
  | "Weekends"
  | "Flexible";

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  availability: Availability;
}

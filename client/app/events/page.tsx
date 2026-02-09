import React from "react";
import NavBar from "../components/NavBar";

interface Event {
	id: number;
	name: string;
	description: string;
	location: string;
	date: string;
	time: string;
	organizationName: string;
	signupCount: number; // How many signed up
	userSignedUp: boolean; // Is current user signed up
}

interface User {
	id: number;
	name: string;
	role: "admin" | "volunteer"; // Just two options!
}

const EventsPage = async () => {
	const res = await fetch("https://jsonplaceholder.typicode.com/users");
	const users: User[] = await res.json();

	console.log(users);
  
	return (
		<div>
			<NavBar />
			EventsPage
		</div>
	);
};

export default EventsPage;

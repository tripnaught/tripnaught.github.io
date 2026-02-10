// @ts-check

/** @type {HTMLDivElement | null} */
const navDiv = document.querySelector('#nav')

document.addEventListener("DOMContentLoaded", buildNav);


function buildNav() {
	if (!navDiv || navDiv === null) throw new Error('No #nav found on this site!');

	const a = document.createElement("a");
	a.href = "https://tripnaught.github.io/";

	const profilePic = document.createElement("img");
	profilePic.alt = "tripnaught profile picture";
	profilePic.id = "pfp";
	
	const trip = document.createElement("span");
	trip.innerHTML = '<mark class="outline-accent">trip</mark>';
	
	const naught = document.createElement("span");
	naught.classList.add('outline-white');
	naught.innerHTML = 'naught';
	
	
	a.appendChild(profilePic);
	a.appendChild(trip);
	a.appendChild(naught);
}
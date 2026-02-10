// @ts-check

document.addEventListener("DOMContentLoaded", generateNav);

function generateNav() {
	const navDiv = document.getElementById('nav')
	if (!navDiv || navDiv === null) throw new Error('oh no: No #nav found on this page!');
	if (!(navDiv instanceof HTMLDivElement)) throw new Error('oh no: #nav found, but it\'s not a div!');

	const a = document.createElement("a");
	a.href = "https://tripnaught.github.io/";

	const profilePic = document.createElement("img");
	profilePic.src = "images/profile-pic.png";
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

	navDiv.appendChild(a);
}
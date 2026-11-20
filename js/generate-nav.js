// @ts-check

document.addEventListener("DOMContentLoaded", generateNav);

function generateNav() {
	const navDiv = document.getElementById('nav')
	if (!navDiv || navDiv === null) throw new Error('oh no: no #nav found on this page!');
	if (!(navDiv instanceof HTMLDivElement)) throw new Error('oh no: #nav found, but it\'s not a div!');

	const a = document.createElement("a");
	a.href = "https://tripnaught.github.io/";

	const profilePic = document.createElement("img");
	profilePic.src = "images/banner-new-wide.png";
	profilePic.alt = "tripnaught profile picture";
	profilePic.id = "pfp";
	
	
	a.appendChild(profilePic);

	navDiv.appendChild(a);
}
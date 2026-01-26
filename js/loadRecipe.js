// @ts-check

async function loadRecipe() {
	const hash = window.location.hash.slice(1);

	/** @type {HTMLDivElement | null} */
	const linksDiv = document.querySelector("#recipe-links");
	if (!linksDiv) throw new Error('no linksDiv found!');

	/** @type {HTMLDivElement | null} */
	const recipeDiv = document.querySelector("#recipe");
	if (!recipeDiv) throw new Error('no recipeDiv found!');

	if (hash) {
		const response = await fetch(`/recipies/${hash}.json`);
		/** @type {Recipe} */
		const recipe = await response.json();
		renderRecipe(recipe);
		linksDiv.style.display = "none";
		recipeDiv.style.display = "block";
	} else {
		linksDiv.style.display = "block";
		recipeDiv.style.display = "none";
	}
}

document.querySelector("#back-button")?.addEventListener("click", () => {
	window.location.hash = "";
});

window.addEventListener("hashchange", loadRecipe);
document.addEventListener("DOMContentLoaded", loadRecipe);
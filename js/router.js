// @ts-check

async function router() {
	const hash = window.location.hash.slice(1);

	if (hash) {
		const response = await fetch(`/recipies/${hash}.json`);
		/** @type {Object} */
		const recipe = await response.json();
		renderRecipe(recipe);
	}
}

window.addEventListener("hashchange", router);
document.addEventListener("DOMContentLoaded", router);
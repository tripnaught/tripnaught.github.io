// @ts-check

/** 
 * @typedef {Object} Recipe
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {string} yield
 * @property {Ingredient[]} ingredients
 * @property {string[]} steps
 * @property {string} notes
 * 
 * @typedef {Object} Ingredient
 * @property {number} amount
 * @property {string} unit
 * @property {string} name
 * @property {string} notes
 */

async function loadRecipe() {
	const hash = window.location.hash.slice(1);

	/** @type {HTMLDivElement | null} */
	const linksDiv = document.querySelector("#recipe-links");
	if (!linksDiv) throw new Error('no linksDiv found!');

	/** @type {HTMLDivElement | null} */
	const recipeDiv = document.querySelector("#recipe");
	if (!recipeDiv) throw new Error('no recipeDiv found!');

	/** @type {HTMLDivElement | null} */
	const recipeMobileDiv = document.querySelector("#recipe-mobile");
	if (!recipeMobileDiv) throw new Error('no recipeMobileDiv found!');

	if (hash && hash !== '') {
		const response = await fetch(`/recipes/${hash}.json`);
		/** @type {Recipe} */
		const recipe = await response.json();
		renderRecipe(recipe);
		linksDiv.style.display = "none";
		recipeDiv.style.display = "block";
	} else {
		linksDiv.style.display = "block";
		recipeDiv.style.display = "none";
		recipeMobileDiv.style.display = "none";
	}
}

document.querySelector("#back-button")?.addEventListener("click", () => {
	window.location.hash = "";
});

window.addEventListener("hashchange", loadRecipe);
document.addEventListener("DOMContentLoaded", loadRecipe);

/** @param {Recipe} recipe */
function renderRecipe(recipe) {
	// set title
	const title = document.querySelector("#title");
	if (!title) throw new Error('no title found');
	title.textContent = recipe.title;

	// clear out ingredients
	const ingredientsList = document.querySelector("#ingredients");
	if (!ingredientsList) throw new Error('no ingredientsList found');
	ingredientsList.innerHTML = "";

	// add ingredients
	for (const ingredient of recipe.ingredients) {
		const li = document.createElement("li");
		let notes = ingredient.notes ?? '';
		if (notes !== '' && notes !== undefined) {
			notes = ", " + notes;
		}
		
		li.textContent = `${ingredient.amount} ${ingredient.unit} ${ingredient.name}${notes}`;
		ingredientsList.appendChild(li);
	}

	// clear out ingredients
	const stepsList = document.querySelector("#steps");
	if (!stepsList) throw new Error('no stepsList found');
	stepsList.innerHTML = "";

	// add ingredients
	for (const step of recipe.steps) {
		const li = document.createElement("li");
		li.textContent = `${step}`;
		stepsList.appendChild(li);
	}
}
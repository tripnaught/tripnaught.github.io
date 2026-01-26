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

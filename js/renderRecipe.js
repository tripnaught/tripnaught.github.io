// @ts-check



/** @param {Object} recipe */
function renderRecipe(recipe) {
	const title = document.querySelector("#title");
	if (!title) throw new Error('no title found');
	title.textContent = recipe.title;

	const ul = document.querySelector("#ingredients");
	ul.innerHTML = "";

	for (const ing of recipe.ingredients) {
		const li = document.createElement("li");
		li.textContent = `${ing.amount} ${ing.unit} ${ing.name}`;
		ul.appendChild(li);
	}
}

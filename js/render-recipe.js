// @ts-check

/** 
 * @typedef {Object} Recipe
 * @property {string} slug
 * @property {string} title
 * @property {string} source
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

	if (hash && hash !== '') {
		try {
			const response = await fetch(`/recipes/${hash}.json`);
			if (!response.ok) {
				// Invalid hash - show links, hide recipe
				linksDiv.style.display = "block";
				recipeDiv.style.display = "none";
				return;
			}
			/** @type {Recipe} */
			const recipe = await response.json();
			renderRecipe(recipe);
			linksDiv.style.display = "none";
			recipeDiv.style.display = "block";
		} catch (error) {
			// Fetch error - show links, hide recipe
			console.error('Error loading recipe:', error);
			linksDiv.style.display = "block";
			recipeDiv.style.display = "none";
		}
	} else {
		linksDiv.style.display = "block";
		recipeDiv.style.display = "none";
	}
}

window.addEventListener("hashchange", loadRecipe);
document.addEventListener("DOMContentLoaded", loadRecipe);

/** @param {Recipe} recipe */
function renderRecipe(recipe) {
	// set title
	const title = document.querySelector("#title");
	if (!title) throw new Error('no title found');
	title.textContent = recipe.title;

	// set source
	const source = document.querySelector("#source");
	if (!source) throw new Error('no source found');
	if (recipe.source && recipe.source !== '') {
		source.innerHTML = "source: " + recipe.source;
	}

	// clear out ingredients
	const ingredientsList = document.querySelector("#ingredients");
	if (!ingredientsList) throw new Error('no ingredientsList found');
	ingredientsList.innerHTML = "";

	// add ingredients
	for (const ingredient of recipe.ingredients) {
		const li = document.createElement("li");

		let textContent = '';

		let amount = Number(ingredient.amount);
		if (Number.isFinite(amount)) {
			textContent += decimalToVulgarFraction(amount);
		}

		textContent += " ";

		let unit = ingredient.unit ?? '';
		if (unit !== undefined) {
			textContent += unit;
		}

		textContent += " ";
		textContent += ingredient.name;

		let notes = ingredient.notes ?? '';
		if (notes !== '' && notes !== undefined) {
			textContent += ", "
			textContent += notes;
		}

		li.textContent = textContent
		
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

/** 
 * @param {number} value 
 * @returns {string}
*/
function decimalToVulgarFraction(value) {
	/** @type {Record<number, string>} */
	const fractions = {
		0.125: "⅛",
		0.1666667: "⅙",
		0.2: "⅕",
		0.25: "¼",
		0.3333333: "⅓",
		0.375: "⅜",
		0.5: "½",
		0.625: "⅝",
		0.6666667: "⅔",
		0.75: "¾",
		0.8333333: "⅚",
		0.875: "⅞"
	};

	if (value === undefined) return '';

	const whole = Math.trunc(value);
	const decimal = value - whole;

	const tolerance = 1e-4;

	for (const key in fractions) {
		if (Math.abs(decimal - Number(key)) < tolerance) {
			return whole === 0
				? fractions[key]
				: `${whole}${fractions[key]}`;
		}
	}

	return value.toString();
}

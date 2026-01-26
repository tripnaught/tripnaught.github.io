function router() {
	const path = window.location.pathname;

	if (path.startsWith("/recipes/") && path !== "/recipes.html") {
		const slug = path.split("/").pop();
		loadRecipe(slug);
		return;
	}

	renderRecipeIndex();
}

window.addEventListener("popstate", router);
document.addEventListener("DOMContentLoaded", router);
/* Mobile Recipe View Logic - Swipe Navigation */

class MobileRecipeView {
	constructor() {
		this.currentStep = 0;
		this.totalSteps = 0;
		this.touchStartX = 0;
		this.touchEndX = 0;
		this.minSwipeDistance = 50; // minimum pixels to register as swipe

		this.init();
	}

	init() {
		// Listen for orientation changes
		window.addEventListener('orientationchange', () => this.onOrientationChange());
		window.addEventListener('resize', () => this.onOrientationChange());

		// Only set up swipe listeners in landscape mode
		if (this.isLandscape()) {
			this.setupSwipeListeners();
			this.setupKeyboardListeners();
		}
	}

	isLandscape() {
		return window.matchMedia('(orientation: landscape)').matches;
	}

	onOrientationChange() {
		if (this.isLandscape()) {
			this.setupSwipeListeners();
			this.setupKeyboardListeners();
			this.resetToFirstStep();
			this.addNavigationUI();
		} else {
			this.removeNavigationUI();
			this.showAllSteps();
		}
	}

	setupSwipeListeners() {
		const stepsContainer = document.getElementById('steps');
		if (!stepsContainer) return;

		stepsContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
		stepsContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
	}

	setupKeyboardListeners() {
		document.addEventListener('keydown', (e) => this.handleKeyPress(e));
	}

	handleTouchStart(e) {
		this.touchStartX = e.changedTouches[0].screenX;
	}

	handleTouchEnd(e) {
		this.touchEndX = e.changedTouches[0].screenX;
		this.handleSwipe();
	}

	handleSwipe() {
		const diff = this.touchStartX - this.touchEndX;
		const absDiff = Math.abs(diff);

		// Only process if swipe distance exceeds threshold
		if (absDiff < this.minSwipeDistance) return;

		if (diff > 0) {
			// Swiped left - next step
			this.nextStep();
		} else {
			// Swiped right - previous step
			this.prevStep();
		}
	}

	handleKeyPress(e) {
		if (!this.isLandscape()) return;

		if (e.key === 'ArrowRight') {
			this.nextStep();
		} else if (e.key === 'ArrowLeft') {
			this.prevStep();
		}
	}

	resetToFirstStep() {
		this.currentStep = 0;
		this.updateDisplay();
	}

	nextStep() {
		if (this.currentStep < this.totalSteps - 1) {
			this.currentStep++;
			this.updateDisplay();
		}
	}

	prevStep() {
		if (this.currentStep > 0) {
			this.currentStep--;
			this.updateDisplay();
		}
	}

	updateDisplay() {
		const steps = document.querySelectorAll('#steps li');

		// Update step visibility
		steps.forEach((step, index) => {
			if (index === this.currentStep) {
				step.classList.add('active');
			} else {
				step.classList.remove('active');
			}
		});

		// Update step counter
		const counter = document.querySelector('.step-counter');
		if (counter) {
			counter.textContent = `Step ${this.currentStep + 1} of ${this.totalSteps}`;
		}

		// Update button states
		const prevBtn = document.querySelector('.step-nav-prev');
		const nextBtn = document.querySelector('.step-nav-next');

		if (prevBtn) {
			prevBtn.disabled = this.currentStep === 0;
		}
		if (nextBtn) {
			nextBtn.disabled = this.currentStep === this.totalSteps - 1;
		}
	}

	addNavigationUI() {
		// Attach button listeners to existing elements
		const prevBtn = document.querySelector('.step-nav-prev');
		const nextBtn = document.querySelector('.step-nav-next');

		if (prevBtn && !prevBtn.dataset.listenerAttached) {
			prevBtn.addEventListener('click', () => this.prevStep());
			prevBtn.dataset.listenerAttached = 'true';
		}
		if (nextBtn && !nextBtn.dataset.listenerAttached) {
			nextBtn.addEventListener('click', () => this.nextStep());
			nextBtn.dataset.listenerAttached = 'true';
		}

		this.updateDisplay();
	}

	removeNavigationUI() {
		// Navigation UI is part of HTML scaffolding, stays in DOM but hidden via CSS
	}

	showAllSteps() {
		const steps = document.querySelectorAll('#steps li');
		steps.forEach(step => {
			step.classList.remove('active');
		});
	}

	setRecipe(stepsArray) {
		this.totalSteps = stepsArray.length;
		this.currentStep = 0;

		if (this.isLandscape()) {
			this.addNavigationUI();
		}
	}
}

// Initialize when recipe is loaded
document.addEventListener('DOMContentLoaded', () => {
	window.mobileRecipeView = new MobileRecipeView();
});

// Hook into the existing renderRecipe function
const originalRenderRecipe = window.renderRecipe;

if (originalRenderRecipe) {
	window.renderRecipe = function (recipe) {
		originalRenderRecipe(recipe);

		// Initialize mobile view for this recipe
		if (window.mobileRecipeView) {
			window.mobileRecipeView.setRecipe(recipe.steps);
		}
	};
}

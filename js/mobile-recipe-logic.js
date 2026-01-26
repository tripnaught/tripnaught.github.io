/* Mobile Recipe App Logic - Swipe Navigation */

class MobileRecipeNavigator {
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
    // Only add if not already present
    if (document.querySelector('.step-counter')) return;

    const stepsContainer = document.getElementById('steps');
    if (!stepsContainer) return;

    // Add counter above steps
    const counter = document.createElement('div');
    counter.className = 'step-counter';
    stepsContainer.parentElement.insertBefore(counter, stepsContainer);

    // Add navigation buttons below steps
    const navButtons = document.createElement('div');
    navButtons.className = 'step-nav-buttons';
    navButtons.innerHTML = `
      <button class="step-nav-prev">← Previous</button>
      <button class="step-nav-next">Next →</button>
    `;

    // Insert after steps container
    stepsContainer.parentElement.appendChild(navButtons);

    // Attach button listeners
    document.querySelector('.step-nav-prev').addEventListener('click', () => this.prevStep());
    document.querySelector('.step-nav-next').addEventListener('click', () => this.nextStep());

    this.updateDisplay();
  }

  removeNavigationUI() {
    const counter = document.querySelector('.step-counter');
    const navButtons = document.querySelector('.step-nav-buttons');
    
    if (counter) counter.remove();
    if (navButtons) navButtons.remove();
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
  window.mobileRecipeNav = new MobileRecipeNavigator();
});

// Hook into the existing renderRecipe function
const originalRenderRecipe = window.renderRecipe;

if (originalRenderRecipe) {
  window.renderRecipe = function(recipe) {
    originalRenderRecipe(recipe);
    
    // Initialize mobile navigation for this recipe
    if (window.mobileRecipeNav) {
      window.mobileRecipeNav.setRecipe(recipe.steps);
    }
  };
}

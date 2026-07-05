const body = document.body;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const sm = document.createElement("div");
sm.classList.add("dot-layer")
sm.classList.add("dot-layer--sm");
body.appendChild(sm);

const md = document.createElement("div");
md.classList.add("dot-layer")
md.classList.add("dot-layer--md");
body.appendChild(md);

const lg = document.createElement("div");
lg.classList.add("dot-layer")
lg.classList.add("dot-layer--lg");
body.appendChild(lg);


if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
	const updateParallax = (event) => {
		const offsetX = ((event.clientX / window.innerWidth) - 0.5) * 16;
		const offsetY = ((event.clientY / window.innerHeight) - 0.5) * 16;
		body.style.setProperty('--parallax-x', `${offsetX}px`);
		body.style.setProperty('--parallax-y', `${offsetY}px`);
	};

	window.addEventListener('pointermove', updateParallax, { passive: true });
	window.addEventListener('pointerleave', () => {
		body.style.setProperty('--parallax-x', '0px');
		body.style.setProperty('--parallax-y', '0px');
	});
}
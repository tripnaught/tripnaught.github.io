//@ts-check

// ----------------------------
// Assumed external inputs
// ----------------------------
// These should come from your UI
// (e.g., document.getElementById(...).value)

let NUMBER_OF_GROUPS = 11;
let DISPLAY_FRIEND_LISTS_IN_FINAL_GROUPS = false;

let BOY_TOKEN = '^';
let GIRL_TOKEN = '+';

let NUM_OPTIMIZATION_RUNS = 100;

// Advanced settings
let ITERATIONS_PER_RUN = 10000;
let RNG_SEED = 67;
let GROUP_COHESION_DEGREE = 4;

let HTML_TAB = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

// ----------------------------
// CSV Parsing
// ----------------------------
/**
 * @param {string} text
 */
function parseCSV(text) {
	return text.split(/\r?\n/).map(line => line.split(','));
}

// ----------------------------
// Main Processing
// ----------------------------
/**
 * @param {string[][]} rows
 */
async function processData(rows) {
	print("Loading dataset...\n");

	console.log("Parsed rows:", rows); // Debug: log the parsed rows

	// Read settings from UI
	const numGroupsInput = /** @type {HTMLInputElement} */ (document.getElementById('num-groups'));
	const NUMBER_OF_GROUPS = parseInt(numGroupsInput.value) || 11;
	const displayFriendsInput = /** @type {HTMLInputElement} */ (document.getElementById('display-friends'));
	const DISPLAY_FRIEND_LISTS_IN_FINAL_GROUPS = displayFriendsInput.checked;
	const boyTokenInput = /** @type {HTMLInputElement} */ (document.getElementById('boy-token'));
	const BOY_TOKEN = boyTokenInput.value || '^';
	const girlTokenInput = /** @type {HTMLInputElement} */ (document.getElementById('girl-token'));
	const GIRL_TOKEN = girlTokenInput.value || '+';
	const numRunsInput = /** @type {HTMLInputElement} */ (document.getElementById('num-runs'));
	const NUM_OPTIMIZATION_RUNS = parseInt(numRunsInput.value) || 100;
	const rngSeedInput = /** @type {HTMLInputElement} */ (document.getElementById('rng-seed'));
	const RNG_SEED = parseInt(rngSeedInput.value) || 67;

	// RNG (seeded)
	/**
	 * @param {number} seed
	 */
	function mulberry32(seed) {
		let t = seed;
		return function () {
			t += 0x6D2B79F5;
			let r = Math.imul(t ^ (t >>> 15), t | 1);
			r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
			return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
		};
	}

	const rand = mulberry32(RNG_SEED);

	/**
	 * @param {number} max
	 */
	function randInt(max) {
		return Math.floor(rand() * max);
	}

	/**
	 * @param {any[]} arr
	 */
	function shuffle(arr) {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = randInt(i + 1);
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
	}

	/** @type {Record<string, "boy"|"girl">} */
	const people_gender = {};

	// Pass 1: determine gender
	for (const row of rows) {
		if (!row.length || !row[0].trim()) continue;

		const raw = row[0].trim().toLowerCase();

		if (raw.includes(BOY_TOKEN)) {
			const person = raw.slice(1).replace(/\*/g, '').trim();
			people_gender[person] = 'boy';
		} else if (raw.includes(GIRL_TOKEN)) {
			const person = raw.slice(1).replace(/\*/g, '').trim();
			people_gender[person] = 'girl';
		}
	}

	print(`Detected ${Object.keys(people_gender).length} total people\n`);

	/** @type {Record<string, Set<string>>} */
	const friendships = {};
	for (const p in people_gender) friendships[p] = new Set();

	// Pass 2: friendships
	for (const row of rows) {
		if (!row.length || !row[0].trim()) continue;

		const raw = row[0].trim().toLowerCase();
		if (![BOY_TOKEN, GIRL_TOKEN].includes(raw[0])) continue;

		const person = raw.slice(1).replace(/\*/g, '').trim();
		const person_gender = people_gender[person];

		for (const raw_friend of row.slice(1)) {
			const friend = raw_friend.trim().toLowerCase().replace(/\*/g, '');
			if (!friend) continue;

			if (people_gender[friend] === person_gender) {
				friendships[person].add(friend);
			}
		}
	}

	// Bidirectional
	for (const p in friendships) {
		for (const f of friendships[p]) {
			if (!friendships[f]) friendships[f] = new Set();
			friendships[f].add(p);
		}
	}

	const boys = Object.keys(people_gender).filter(p => people_gender[p] === 'boy').sort();
	const girls = Object.keys(people_gender).filter(p => people_gender[p] === 'girl').sort();

	print(`Boys: ${boys.length}, Girls: ${girls.length}\n`);

	const total_edges = Object.values(friendships)
		.reduce((sum, s) => sum + s.size, 0) / 2;

	print(`Total friendships detected: ${total_edges}\n`);

	// ----------------------------
	// Scoring
	// ----------------------------
	/**
	 * @param {string} person
	 * @param {Set<string>} groupSet
	 * @returns {number}
	 */
	function friendsInGroup(person, groupSet) {
		let count = 0;
		for (const f of friendships[person] || []) {
			if (groupSet.has(f)) count++;
		}
		return count;
	}

	/**
	 * @param {string[]} group
	 * @returns {[number, number, number, number]}
	 */
	function groupMetrics(group) {
		const set = new Set(group);
		const degrees = group.map(p => friendsInGroup(p, set));

		const unhappy = degrees.filter(k => k === 0).length;
		const single = degrees.filter(k => k === 1).length;

		const edges = degrees.reduce((a, b) => a + b, 0) / 2;
		const cohesion = degrees.reduce((sum, k) => sum + k ** GROUP_COHESION_DEGREE, 0);

		return [unhappy, single, -cohesion, -edges];
	}

	/**
	 * @param {string[][]} groups
	 * @returns {[number, number, number, number]}
	 */
	function totalMetrics(groups) {
		let u = 0, s = 0, nc = 0, ne = 0;
		for (const g of groups) {
			const [gu, gs, gnc, gne] = groupMetrics(g);
			u += gu; s += gs; nc += gnc; ne += gne;
		}
		return [u, s, nc, ne];
	}

	// ----------------------------
	// Optimizer
	// ----------------------------
	/**
	 * @param {string[]} people
	 * @param {number} numGroups
	 * @param {string} label
	 * @returns {Promise<[string[][], [number, number, number, number]]>}
	 */
	function optimizePeople(people, numGroups, label) {
		return new Promise((resolve) => {
			print(`\nStarting optimization for ${label}...\n`);

			function makeInitial() {
				const arr = [...people];
				shuffle(arr);

				const base = Math.floor(arr.length / numGroups);
				const rem = arr.length % numGroups;

				const groups = [];
				let idx = 0;

				for (let i = 0; i < numGroups; i++) {
					const size = base + (i < rem ? 1 : 0);
					groups.push(arr.slice(idx, idx + size));
					idx += size;
				}
				return groups;
			}

			/**
			 * @returns {[string[][], [number, number, number, number]]}
			 */
			function runOnce() {
				let groups = makeInitial();
				let current = totalMetrics(groups);
				let best = groups.map(g => [...g]);
				let bestScore = current;

				for (let i = 0; i < ITERATIONS_PER_RUN; i++) {
					const g1 = randInt(numGroups);
					let g2 = randInt(numGroups);
					while (g2 === g1) g2 = randInt(numGroups);

					if (!groups[g1].length || !groups[g2].length) continue;

					const i1 = randInt(groups[g1].length);
					const i2 = randInt(groups[g2].length);

					// swap
					[groups[g1][i1], groups[g2][i2]] =
						[groups[g2][i2], groups[g1][i1]];

					const newScore = totalMetrics(groups);

					if (compare(newScore, current) < 0) {
						current = newScore;
						if (compare(newScore, bestScore) < 0) {
							bestScore = newScore;
							best = groups.map(g => [...g]);
						}
					} else {
						// revert
						[groups[g1][i1], groups[g2][i2]] =
							[groups[g2][i2], groups[g1][i1]];
					}
				}

				return [best, bestScore];
			}

			/** @type {String[][] | null} */
			let bestGroups = null;
			/** @type {[number, number, number, number] | null} */
			let bestScore = null;

			let i = 0;
			function next() {
				if (i < NUM_OPTIMIZATION_RUNS) {
					if ((i+1) % 5 == 0 || (i+1) == 1 || (i+1) == NUM_OPTIMIZATION_RUNS) {
						print(`${label} Run ${i + 1} / ${NUM_OPTIMIZATION_RUNS}\n`);
					}
					const [g, s] = runOnce();
					if (bestScore === null || compare(s, bestScore) < 0) {
						bestGroups = g;
						bestScore = s;
					}
					i++;
					setTimeout(next, 0);
				} else {
					resolve(/** @type {[string[][], [number, number, number, number]]} */ ([bestGroups, bestScore]));
				}
			}
			next();
		});
	}

	/**
	 * @param {[number, number, number, number]} a
	 * @param {[number, number, number, number]} b
	 * @returns {number}
	 */
	function compare(a, b) {
		for (let i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) return a[i] - b[i];
		}
		return 0;
	}

	// ----------------------------
	// Run
	// ----------------------------
	const total = boys.length + girls.length;
	const boyGroups = Math.round(NUMBER_OF_GROUPS * (boys.length / total));
	const girlGroups = NUMBER_OF_GROUPS - boyGroups;

	print(`Group split → Boys: ${boyGroups}, Girls: ${girlGroups}\n`);

	const [boysGroups] = await optimizePeople(boys, boyGroups, "BOYS");
	const [girlsGroups] = await optimizePeople(girls, girlGroups, "GIRLS");

	const finalGroups = [...boysGroups, ...girlsGroups];

	// ----------------------------
	// Output
	// ----------------------------
	/**
	 * @param {string} name
	 * @returns {string}
	 */
	function formatName(name) {
		return name.split(' ').map(p => p[0].toUpperCase() + p.slice(1)).join(' ');
	}

	print("\n===== FINAL GROUPS =====\n");

	finalGroups.forEach((group, i) => {
		const set = new Set(group);
		print(`\n\nGROUP ${i + 1} (${group.length} people)\n`);

		group.sort().forEach(person => {
			const friends = [...(friendships[person] || [])];
			const inGroup = friends.filter(f => set.has(f));

			if (inGroup.length === 0) {
				print(`<span style="color: red">${HTML_TAB}${formatName(person)} (0 friends)</span>\n`);
			} else if (inGroup.length === 1) {
				print(`<span style="color: yellow">${HTML_TAB}${formatName(person)} (1 friend)</span>\n`);
			} else {
				print(`${HTML_TAB}${formatName(person)} (${inGroup.length} friends)\n`);
			}

			if (DISPLAY_FRIEND_LISTS_IN_FINAL_GROUPS) {
				const friendNames = inGroup.map(f => formatName(f)).join(', ');
				if (friendNames) {
					print(`${HTML_TAB}${HTML_TAB}Friends in group: ${friendNames}\n`);
				}
			}
		});
	});

	const [u, s, , ne] = totalMetrics(finalGroups);

	print("\n===== STATISTICS =====\n");
	print(`Unhappy (0 friends): ${u}\n`);
	print(`Single-friend: ${s}\n`);
	print(`Friendships preserved: ${-ne}\n`);
	print(`Preservation rate: ${((-ne / Math.max(total_edges, 1)) * 100).toFixed(1)}%\n`);
}

// ----------------------------
// Hook to file input
// ----------------------------
/**
 * @param {File} file
 */
function handleFile(file) {
	const reader = new FileReader();

	reader.onload = () => {
		const text = reader.result;
		if (typeof text !== "string") return;

		const outputDiv = document.getElementById("output");
		if (outputDiv) {
			outputDiv.innerHTML = ""; // Clear previous output
		}

		const rows = parseCSV(text);
		processData(rows);
	};

	reader.readAsText(file);
}

/** print */
/**
 * @param {string} str
 * @param {boolean} newLine
 */
function print(str, newLine = true) {
	const outputDiv = document.getElementById("output");
	if (!outputDiv || outputDiv == null) {
		throw new Error("no output div found !!");
	}
	if (newLine) {
		outputDiv.innerHTML += "<br />";
	}
	outputDiv.innerHTML += str;
}

// ----------------------------
// Event listeners
// ----------------------------
document.addEventListener('DOMContentLoaded', () => {
	const form = /** @type {HTMLFormElement} */ (document.querySelector('form'));
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const fileInput = /** @type {HTMLInputElement} */ (document.getElementById('csv-file-upload'));
		const file = fileInput.files?.[0];
		if (file) {
			handleFile(file);
			print("Loading dataset... (this might take a while...)\n");
		} else {
			alert('Please select a CSV file.');
		}
	});
});
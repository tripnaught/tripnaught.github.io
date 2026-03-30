// @ts-check

// Audio parameters
const sampleRate = 44100;
const initialBpm = 160;
const accelBpm = 4;

const rootFreq = 261.63;
const pause = 0.0; // seconds between notes
const volume = 0.1; // volume level (0.0 to 1.0)

// Initialize Web Audio API
const audioCtx = new window.AudioContext();

// Playback control
let isPlaying = false;
/** @type {Number} */
let bpm;

/**
 * 
 * @param {Number} newBpm 
 */
function setBpm(newBpm) {
    const bpmDisplay = document.getElementById('bpmDisplay');
    if (!bpmDisplay) throw new Error('no bpmDisplay!');

    if (newBpm < 0) {
        bpmDisplay.textContent = ``;
    } else {
        bpm = newBpm;
        bpmDisplay.textContent = `BPM: ${newBpm}`;
    }
}

/**
 * @param {*} frequency 
 * @param {*} dur 
 * @returns 
 */
function playNote(frequency, dur) {
    if (!isPlaying) {
        setBpm(-1);
        return
    };
    return new Promise((resolve) => {
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = volume;
        gainNode.connect(audioCtx.destination);

        // Create oscillators for harmonics
        /** @type {OscillatorNode[]} */
        const oscillators = [];
        const harmonics = [1, 2, 3, 4];
        const amplitudes = [1, 0.5, 0.25, 0.125];

        harmonics.forEach((harmonic, index) => {
            const oscillator = audioCtx.createOscillator();
            oscillator.frequency.value = frequency * harmonic;
            oscillator.type = 'sine';
            
            // Create a gain node for this harmonic with its amplitude
            const harmonicGain = audioCtx.createGain();
            harmonicGain.gain.value = amplitudes[index];
            oscillator.connect(harmonicGain);
            harmonicGain.connect(gainNode);
            
            oscillators.push(oscillator);
        });

        // Start all oscillators
        oscillators.forEach(osc => osc.start());

        // Stop after duration
        setTimeout(() => {
            oscillators.forEach(osc => osc.stop());
            // Small pause between notes
            setTimeout(resolve, pause * 1000);
        }, dur * 1000);
    });
}

/**
 * @param {Number} n 
 * @returns {Number}
 */
function pitchFromNumber(n) {
    return rootFreq * Math.pow(2, n / 12);
}

/**
 * @returns {Number}
 */
function getDurationSecondsFromBpm() { 
    return (60 / bpm / 2) * 0.965 ; // eighth notes
}

/**
 * @param {*} pitches 
 * @param {*} root 
 */
async function playMelody(pitches, root) {
    for (const n of pitches) {
        const freq = root * Math.pow(2, n / 12);
        await playNote(freq, getDurationSecondsFromBpm());
    }
    if (isPlaying) {
        setBpm(bpm + accelBpm);
    } else {
        setBpm(-1);
    }
}

const scale = [
    0,      // 1
    // 1,  // b2
    2,      // 2
    // 3,  // b3
    4,      // 3
    5,      // 4
    // 6,  // b5
    7,      // 5
    // 8,  // b6
    9,      // 6
    // 10, // b7
    11,     // 7
    12,
];

const upCoda = [0, 2, 4, 5, 7, 9, 10, 7];
const downCoda = [0, 4, 7, 4, 0, -2, -3, -5];

/**
 * 
 * @param {'up' | 'down'} codaType 
 * @returns {Number[]}
 */
function buildScalePattern(codaType) {
    // Extend scale pattern to 2 octaves
    const extendedScale = [...scale];

    // extendedScale.push(24);
    for (let i = 1; i < scale.length; i++) {
        extendedScale.push(scale[i] + 12);
    }
    extendedScale.push(24);

    let pattern = [];

    for (let i = 0; i < scale.length; i++) {
        for (let j = 0; j < scale.length; j++) {
            pattern.push(extendedScale[i + j]);
        }
    }
    pattern[pattern.length - 1] = pattern[1] + 12 + 12;
    for (let i = scale.length - 1; i > 0; i--) {
        for (let j = scale.length - 1; j >= 0; j--) {
            pattern.push(extendedScale[i + j]);
        }
    }
    if (codaType === "up") {
        pattern = pattern.concat(upCoda);
    } else if (codaType === "down") {
        pattern = pattern.concat(downCoda);
    }

    return pattern;
}

async function scaleSequence() {
    let currentDuration = getDurationSecondsFromBpm();

    // Wait a bit before starting
    await new Promise(resolve => setTimeout(resolve, 10));

    while (isPlaying) {
        let root = 174.615; // F
        await playMelody(buildScalePattern("down"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, -7 / 12); // Bb
        await playMelody(buildScalePattern("up"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, 5 / 12); // Eb
        await playMelody(buildScalePattern("down"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, -7 / 12); // Ab
        await playMelody(buildScalePattern("up"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, 5 / 12); // Db
        await playMelody(buildScalePattern("down"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, -7 / 12); // Gb
        await playMelody(buildScalePattern("up"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, 5 / 12); // B
        await playMelody(buildScalePattern("up"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, 5 / 12); // E (up twice!)
        await playMelody(buildScalePattern("up"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, 5 / 12); // A
        await playMelody(buildScalePattern("down"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, -7 / 12); // D
        await playMelody(buildScalePattern("up"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, 5 / 12); // G
        await playMelody(buildScalePattern("down"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);

        root *= Math.pow(2, -7 / 12); // C
        await playMelody(buildScalePattern("up"), root);
        //currentDuration -= durationSecondsFromBpm(accelBpm);
    }
}

// Button event listener
document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (!playPauseBtn) throw new Error('no playPauseBtn');
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            isPlaying = false;
            playPauseBtn.textContent = 'play';
            setBpm(-1);
        } else {
            isPlaying = true;
            playPauseBtn.textContent = 'pause';
            setBpm(initialBpm);
            scaleSequence();
        }
    });
});
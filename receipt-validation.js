const steps = document.querySelectorAll('.device-step');
const dots = document.querySelectorAll('.device-dot');
let activeStep = 0;
let intervalId = null;

function activateStep(index) {
    steps.forEach((step, idx) => {
        const active = idx === index;
        step.classList.toggle('device-step--active', active);
    });
    dots.forEach((dot, idx) => {
        const active = idx === index;
        dot.classList.toggle('device-dot--active', active);
        dot.setAttribute('aria-selected', active);
    });
    activeStep = index;
}

function nextStep() {
    const next = (activeStep + 1) % steps.length;
    activateStep(next);
}

dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
        activateStep(idx);
        restartInterval();
    });
});

function restartInterval() {
    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(nextStep, 5000);
}

if (steps.length > 0) {
    activateStep(0);
    restartInterval();
}

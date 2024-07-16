let isTimerRunning = false;
let pauseTimeout;
let startTime;
let pausedTime = 0;
let animationFrameId;
let isFinishingsentence = false;

const TOTAL_TIME = 120000; // 120 seconds (2 minutes) in milliseconds

const progressBar = document.getElementById('progressBar');
const textArea = document.getElementById('textArea');
const actions = document.getElementById('actions');
const shareBtn = document.getElementById('shareBtn');
const printBtn = document.getElementById('printBtn');
const promptElement = document.getElementById('prompt');
const newPromptBtn = document.getElementById('newPromptBtn');

textArea.addEventListener('input', handleInput);
shareBtn.addEventListener('click', shareText);
printBtn.addEventListener('click', printText);
newPromptBtn.addEventListener('click', refreshPromptAndTextArea);

const prompts = [
    "Write about a childhood memory",
    "Describe your perfect day",
    "If you could have any superpower...",
    "The strangest dream you've ever had",
    "Write a letter to your future self",
    // ... (rest of the prompts)
];

function getRandomPrompt() {
    return prompts[Math.floor(Math.random() * prompts.length)];
}

function displayNewPrompt() {
    promptElement.textContent = getRandomPrompt();
}

function resetTextArea() {
    textArea.value = '';
    textArea.disabled = false;
    isTimerRunning = false;
    isFinishingsentence = false;
    pausedTime = 0;
    clearTimeout(pauseTimeout);
    cancelAnimationFrame(animationFrameId);
    progressBar.style.width = '100%';
    actions.classList.add('hidden');
}

function refreshPromptAndTextArea() {
    displayNewPrompt();
    resetTextArea();
}

// Display initial prompt when page loads
displayNewPrompt();

function handleInput(e) {
    if (!isTimerRunning && !isFinishingsentence) {
        startTimer();
    } else if (isTimerRunning) {
        clearTimeout(pauseTimeout);
        pauseTimeout = setTimeout(pauseTimer, 2000); // 2 seconds pause
    } else if (isFinishingsentence) {
        checkForPeriod();
    }
}

function startTimer() {
    isTimerRunning = true;
    startTime = Date.now() - pausedTime;
    cancelAnimationFrame(animationFrameId);
    updateProgress();
}

function pauseTimer() {
    isTimerRunning = false;
    pausedTime = Date.now() - startTime;
    cancelAnimationFrame(animationFrameId);
}

function updateProgress() {
    if (!isTimerRunning) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const remainingTime = Math.max(TOTAL_TIME - elapsedTime, 0);
    const progress = (remainingTime / TOTAL_TIME) * 100;

    progressBar.style.width = `${progress}%`;

    if (remainingTime > 0) {
        animationFrameId = requestAnimationFrame(updateProgress);
    } else {
        endTimer();
    }
}

function endTimer() {
    isTimerRunning = false;
    clearTimeout(pauseTimeout);
    isFinishingsentence = true;
    actions.classList.remove('hidden');
    alert("Time's up! You can finish your current sentence. Click 'Share' or 'Print' when done, or it will automatically finish when you type a period.");
}

function checkForPeriod() {
    if (textArea.value.slice(-1) === '.') {
        finalizeText();
    }
}

function finalizeText() {
    textArea.disabled = true;
    isFinishingsentence = false;
    progressBar.style.width = '0%';
}

function shareText() {
    if (navigator.share) {
        navigator.share({
            title: '2-Minute Typing Result',
            text: textArea.value
        }).then(() => console.log('Shared successfully'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
        alert('Web Share API not supported in your browser');
    }
}

function printText() {
    const printWindow = window.open('', '', 'height=400,width=800');
    printWindow.document.write('<html><head><title>2-Minute Typing Result</title></head><body>');
    printWindow.document.write('<h1>2-Minute Typing Result</h1>');
    printWindow.document.write('<pre>' + textArea.value + '</pre>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}
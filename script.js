let isTimerRunning = false;
let typingTimer;
let startTime;
let pausedTime = 0;
let animationFrameId;
let isFinishingsentence = false;

const TOTAL_TIME = 120000; // 120 seconds (2 minutes) in milliseconds
const TYPING_INTERVAL = 300; // 300ms pause to detect typing stop

const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
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
    "Your favorite place in the world",
    "A character who can't tell lies",
    "The last person you'd expect as a hero",
    "A world where sleep is obsolete",
    "The day the internet disappeared",
    "An unexpected visitor arrives",
    "The secret hidden in the attic",
    "A journey that changes everything",
    "The object that grants wishes",
    "A conversation with your younger self",
    "The day colors disappeared",
    "A world where animals can talk",
    "The last book in the world",
    "A door that leads anywhere",
    "The person who knows the future",
    "A day in reverse",
    "The message in a bottle",
    "A world without music",
    "The forgotten time capsule",
    "An impossible choice",
    "The day shadows came alive",
    "A world where lying is impossible",
    "The last sunset",
    "A character with an unusual phobia",
    "The day everyone swapped bodies",
    "A world where dreams come true",
    "The unexpected inheritance",
    "A letter that changes everything",
    "The day technology stopped working",
    "A character who can hear thoughts",
    "The abandoned amusement park",
    "A world where age works backwards",
    "The mysterious package",
    "A day without gravity",
    "The forgotten language",
    "Whisper in the wind",
    "Unexpected allies",
    "Time stands still",
    "Hidden talents revealed",
    "The unopened door",
    "Echoes from the past",
    "Secrets beneath the surface",
    "A world of endless night",
    "The last laugh",
    "Whisper",
    "Blue moon",
    "Forgotten melody",
    "Silk thread",
    "Echoes",
    "Stardust",
    "Shadows",
    "Ripples",
    "Mist",
    "Pulse",
    "Reflection",
    "Ember",
    "Labyrinth",
    "Cascade",
    "Nebula",
    "Luminescence",
    "Kaleidoscope",
    "Serendipity",
    "Velvet",
    "Ethereal",
    "Mellifluous"
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
    clearTimeout(typingTimer);
    cancelAnimationFrame(animationFrameId);
    progressFill.style.width = '100%';
    progressFill.style.backgroundPosition = '0% 0';
    actions.style.display = 'none';
    const finishBtn = actions.querySelector('button');
    if (finishBtn) {
        finishBtn.remove();
    }
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
        clearTimeout(typingTimer);
        typingTimer = setTimeout(pauseTimer, TYPING_INTERVAL);
    } else if (isFinishingsentence) {
        checkForPeriod();
    }
}

function startTimer() {
    isTimerRunning = true;
    startTime = Date.now() - pausedTime;
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

    progressFill.style.width = `${progress}%`;
    
    // Update color based on progress
    const colorProgress = 100 - progress;
    progressFill.style.backgroundPosition = `${colorProgress}% 0`;

    if (remainingTime > 0) {
        animationFrameId = requestAnimationFrame(updateProgress);
    } else {
        endTimer();
    }
}

function endTimer() {
    isTimerRunning = false;
    clearTimeout(typingTimer);
    isFinishingsentence = true;
    
    const finishBtn = document.createElement('button');
    finishBtn.textContent = 'Finish Sentence';
    finishBtn.onclick = finalizeText;
    actions.insertBefore(finishBtn, actions.firstChild);
    actions.style.display = 'block';
    
    alert("Time's up! You can finish your current sentence. Click 'Finish Sentence' when done, or it will automatically finish when you type a period.");
}

function checkForPeriod() {
    if (textArea.value.slice(-1) === '.') {
        finalizeText();
    }
}

function finalizeText() {
    textArea.disabled = true;
    isFinishingsentence = false;
    const finishBtn = actions.querySelector('button');
    if (finishBtn) {
        finishBtn.remove();
    }
    progressFill.style.width = '0%';
    progressFill.style.backgroundPosition = '100% 0';
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
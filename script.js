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
const promptElement = document.getElementById('prompt');
const newPromptBtn = document.getElementById('newPromptBtn');
const sharedContent = document.getElementById('sharedContent');
const sharedWritingContainer = document.getElementById('sharedWritingContainer');
const finishEarlyBtn = document.getElementById('finishEarlyBtn');
const nightModeToggle = document.getElementById('nightModeToggle');

textArea.addEventListener('input', handleInput);
shareBtn.addEventListener('click', shareResponse);
newPromptBtn.addEventListener('click', refreshPromptAndTextArea);
finishEarlyBtn.addEventListener('click', finishEarly);
nightModeToggle.addEventListener('click', toggleNightMode);

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
    "The day the internet disappeared"
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
    finishEarlyBtn.style.display = 'none';
    shareBtn.style.display = 'none';
    newPromptBtn.disabled = false;
}

function refreshPromptAndTextArea() {
    displayNewPrompt();
    resetTextArea();
    sharedContent.style.display = 'none';
    sharedWritingContainer.innerHTML = '';
}

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
    actions.style.display = 'block';
    finishEarlyBtn.style.display = 'inline-block';
    shareBtn.style.display = 'none';
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
    cancelAnimationFrame(animationFrameId);
    isFinishingsentence = true;
    finishEarlyBtn.style.display = 'none';
    
    alert("Time's up! You can finish your current sentence. Click 'Finish Early' when done, or it will automatically finish when you type a period.");
}

function checkForPeriod() {
    if (textArea.value.slice(-1) === '.') {
        finalizeText();
    }
}

function finishEarly() {
    if (confirm("Are you sure you want to finish early? You won't be able to continue writing.")) {
        endTimer();
        finalizeText();
    }
}

function finalizeText() {
    textArea.disabled = true;
    isFinishingsentence = false;
    progressFill.style.width = '0%';
    progressFill.style.backgroundPosition = '100% 0';
    saveAndShare();
}

function saveAndShare() {
    const combinedWriting = {
        prompt: promptElement.textContent,
        responses: []
    };

    if (textArea.value) {
        combinedWriting.responses.push(textArea.value);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const existingResponses = urlParams.get('responses');
    if (existingResponses) {
        combinedWriting.responses = [...JSON.parse(decodeURIComponent(existingResponses)), ...combinedWriting.responses];
    }

    const encodedPrompt = encodeURIComponent(combinedWriting.prompt);
    const encodedResponses = encodeURIComponent(JSON.stringify(combinedWriting.responses));
    const shareUrl = `${window.location.origin}${window.location.pathname}?prompt=${encodedPrompt}&responses=${encodedResponses}`;

    shareBtn.style.display = 'inline-block';
    shareBtn.dataset.shareUrl = shareUrl;

    displayResponses(combinedWriting.responses.slice(0, -1));
}

function shareResponse() {
    const shareUrl = shareBtn.dataset.shareUrl;
    const shareData = {
        title: 'Collaborate on our writing!',
        text: `We've been writing collaboratively. Continue the story or write your own response here:`,
        url: shareUrl
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Shared successfully'))
            .catch((error) => console.log('Error sharing:', error));
    } else {
        // Fallback for browsers that don't support Web Share API
        const emailBody = encodeURIComponent(`${shareData.text} ${shareUrl}`);
        window.location.href = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${emailBody}`;
    }
}

function displayResponses(responses) {
    if (responses.length > 0) {
        sharedContent.style.display = 'block';
        sharedWritingContainer.innerHTML = '';
        responses.forEach((response, index) => {
            const responseElement = document.createElement('p');
            responseElement.textContent = `Response ${index + 1}: ${response}`;
            sharedWritingContainer.appendChild(responseElement);
        });
    } else {
        sharedContent.style.display = 'none';
    }
}

function loadSharedWriting() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPrompt = urlParams.get('prompt');
    const sharedResponses = urlParams.get('responses');

    if (sharedPrompt && sharedResponses) {
        promptElement.textContent = decodeURIComponent(sharedPrompt);
        const responses = JSON.parse(decodeURIComponent(sharedResponses));
        displayResponses(responses);
        textArea.value = '';
        newPromptBtn.disabled = true;
    }
}

function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    localStorage.setItem('nightMode', document.body.classList.contains('night-mode'));
}

function loadNightModeState() {
    if (localStorage.getItem('nightMode') === 'true') {
        document.body.classList.add('night-mode');
    }
}

// Initialize the app
function initApp() {
    loadSharedWriting();
    loadNightModeState();
    displayNewPrompt();
}

// Call initApp when the page loads
window.addEventListener('load', initApp);

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
const emailShareBtn = document.getElementById('emailShareBtn');
const sharedContent = document.getElementById('sharedContent');
const sharedWriting = document.getElementById('sharedWriting');

textArea.addEventListener('input', handleInput);
shareBtn.addEventListener('click', shareText);
printBtn.addEventListener('click', printText);
newPromptBtn.addEventListener('click', refreshPromptAndTextArea);
emailShareBtn.addEventListener('click', shareViaEmail);

const prompts = [
    "Write about a childhood memory",
    "Describe your perfect day",
    "If you could have any superpower...",
    "The strangest dream you've ever had",
    "Write a letter to your future self",
    // ... (include all your prompts here)
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
    emailShareBtn.style.display = 'none';
    const finishBtn = actions.querySelector('button:first-child');
    if (finishBtn && finishBtn.textContent === 'Finish Sentence') {
        finishBtn.remove();
    }
}

function refreshPromptAndTextArea() {
    displayNewPrompt();
    resetTextArea();
}

displayNewPrompt(); // Display initial prompt when page loads

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
    const finishBtn = actions.querySelector('button:first-child');
    if (finishBtn && finishBtn.textContent === 'Finish Sentence') {
        finishBtn.remove();
    }
    progressFill.style.width = '0%';
    progressFill.style.backgroundPosition = '100% 0';
    saveAndShare();
}

function saveAndShare() {
    const writing = {
        prompt: promptElement.textContent,
        text: textArea.value
    };

    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    localStorage.setItem(id, JSON.stringify(writing));

    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${id}`;
    emailShareBtn.style.display = 'inline-block';
    emailShareBtn.dataset.shareUrl = shareUrl;
}

function shareViaEmail() {
    const shareUrl = emailShareBtn.dataset.shareUrl;
    const subject = encodeURIComponent('Check out my writing!');
    const body = encodeURIComponent(`I've written something using this app. Continue the story here: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function loadSharedWriting() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        const savedWriting = localStorage.getItem(id);
        if (savedWriting) {
            const data = JSON.parse(savedWriting);
            promptElement.textContent = data.prompt;
            sharedContent.style.display = 'block';
            sharedWriting.textContent = data.text;
        }
    }
}

function shareText() {
    if (navigator.share) {
        navigator.share({
            title: 'My Writing',
            text: textArea.value
        }).then(() => console.log('Shared successfully'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
        alert('Web Share API not supported in your browser');
    }
}

function printText() {
    const printWindow = window.open('', '', 'height=400,width=800');
    printWindow.document.write('<html><head><title>My Writing</title></head><body>');
    printWindow.document.write('<h1>My Writing</h1>');
    printWindow.document.write('<pre>' + textArea.value + '</pre>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

loadSharedWriting(); // Load shared writing when the page loads
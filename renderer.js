const { ipcRenderer } = require('electron');

// Application state
let questionsData = {};
let currentQuestion = null;

// DOM elements
const questionDisplay = document.getElementById('questionDisplay');
const generateBtn = document.getElementById('generateBtn');
const toggleBtn = document.getElementById('toggleBtn');
const toggleLabel = document.getElementById('toggleLabel');
const toggleIcon = document.getElementById('toggleIcon');
const totalQuestions = document.getElementById('totalQuestions');
const attemptedCount = document.getElementById('attemptedCount');
const unattemptedCount = document.getElementById('unattemptedCount');

// Load data from JSON file
async function loadData() {
    try {
        questionsData = await ipcRenderer.invoke('load-data');
        updateStats();
        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data to JSON file
async function saveData() {
    try {
        const success = await ipcRenderer.invoke('save-data', questionsData);
        if (success) {
            console.log('Data saved successfully');
        } else {
            console.error('Failed to save data');
        }
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Get array of unattempted question numbers
function getUnattemptedQuestions() {
    const unattempted = [];
    
    for (let i = 1; i <= 151; i++) {
        if (!questionsData[i] || !questionsData[i].attempted) {
            unattempted.push(i);
        }
    }
    
    return unattempted;
}

// Generate random question from unattempted pool
function generateRandom() {
    const unattempted = getUnattemptedQuestions();
    
    if (unattempted.length === 0) {
        handleAllQuestionsCompleted();
        return;
    }
    
    // Select random question from unattempted pool
    const randomIndex = Math.floor(Math.random() * unattempted.length);
    currentQuestion = unattempted[randomIndex];
    
    // Update UI
    questionDisplay.textContent = currentQuestion;
    toggleBtn.disabled = false;
    
    updateToggleButton();
    
    // Add visual feedback
    questionDisplay.style.transform = 'scale(1.1)';
    setTimeout(() => {
        questionDisplay.style.transform = 'scale(1)';
    }, 200);
}

// Handle when all questions are completed
function handleAllQuestionsCompleted() {
    questionDisplay.textContent = '🎉 All Done!';
    generateBtn.disabled = true;
    toggleBtn.disabled = true;
    
    // Add celebration effect
    questionDisplay.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    questionDisplay.style.color = 'white';
}

// Toggle the status of current question
async function toggleQuestionStatus() {
    if (currentQuestion === null) return;
    
    // Initialize question data if it doesn't exist
    if (!questionsData[currentQuestion]) {
        questionsData[currentQuestion] = { attempted: false };
    }
    
    // Toggle the attempted status
    questionsData[currentQuestion].attempted = !questionsData[currentQuestion].attempted;
    
    // Save to file and update UI
    await saveData();
    updateStats();
    updateToggleButton();
    
    // Visual feedback
    const button = toggleBtn;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 100);
}

// Update toggle button appearance and text
function updateToggleButton() {
    if (!currentQuestion) {
        toggleLabel.textContent = 'Question Status:';
        toggleBtn.className = 'toggle-switch';
        toggleIcon.textContent = '❌';
        return;
    }
    
    const isAttempted = questionsData[currentQuestion] && questionsData[currentQuestion].attempted;
    
    if (isAttempted) {
        toggleLabel.textContent = `Question ${currentQuestion}: Completed`;
        toggleBtn.className = 'toggle-switch attempted';
        toggleIcon.textContent = '✅';
    } else {
        toggleLabel.textContent = `Question ${currentQuestion}: Not Attempted`;
        toggleBtn.className = 'toggle-switch';
        toggleIcon.textContent = '❌';
    }
}

// Update statistics display
function updateStats() {
    let attempted = 0;
    
    // Count attempted questions
    for (let i = 1; i <= 151; i++) {
        if (questionsData[i] && questionsData[i].attempted) {
            attempted++;
        }
    }
    
    const unattempted = 151 - attempted;
    
    // Update DOM
    attemptedCount.textContent = attempted;
    unattemptedCount.textContent = unattempted;
    
    // Handle UI state based on completion
    if (unattempted === 0 && !generateBtn.disabled) {
        handleAllQuestionsCompleted();
    } else if (unattempted > 0) {
        generateBtn.disabled = false;
        // Reset question display styling if it was completed before
        questionDisplay.style.background = '';
        questionDisplay.style.color = '';
    }
}

// Reset all questions to unattempted (for testing/development)
async function resetAllQuestions() {
    const confirmReset = confirm('Are you sure you want to reset all questions to unattempted?');
    
    if (confirmReset) {
        for (let i = 1; i <= 151; i++) {
            questionsData[i] = { attempted: false };
        }
        
        await saveData();
        updateStats();
        
        // Reset UI
        currentQuestion = null;
        questionDisplay.textContent = 'Click Generate!';
        toggleBtn.disabled = true;
        generateBtn.disabled = false;
        
        console.log('All questions reset to unattempted');
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'g':
        case 'G':
            if (!generateBtn.disabled) {
                generateRandom();
            }
            break;
        case 't':
        case 'T':
        case ' ': // Spacebar
            if (!toggleBtn.disabled) {
                toggleQuestionStatus();
            }
            break;
        case 'r':
        case 'R':
            if (event.ctrlKey) {
                event.preventDefault();
                resetAllQuestions();
            }
            break;
    }
});

// Add double-click to reset (hidden feature)
questionDisplay.addEventListener('dblclick', () => {
    if (event.ctrlKey) {
        resetAllQuestions();
    }
});

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Add helpful tooltip
    generateBtn.title = 'Keyboard shortcut: G';
    toggleBtn.title = 'Keyboard shortcuts: T or Spacebar';
    
    console.log('Question Tracker initialized');
    console.log('Keyboard shortcuts:');
    console.log('- G: Generate random question');
    console.log('- T or Space: Toggle question status');
    console.log('- Ctrl+R: Reset all questions');
});
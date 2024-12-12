const ERROR_MESSAGE = 'Error :(';
const HISTORY_KEY = 'history';
const PREVIOUS_KEY = 'previous';

let calcHistory = getLocalStorageData(HISTORY_KEY, {});
let prevEntries = getLocalStorageData(PREVIOUS_KEY, []);
let currentHistoryIndex = prevEntries.length;

let isDark = false;
updateTheme();

document.addEventListener('DOMContentLoaded', () => {
    const result = document.getElementById('result');
    const buttons = document.querySelectorAll('.btn');
    const themeToggle = document.getElementById('theme-toggle');

    buttons.forEach(button => {
        button.addEventListener('click', () => handleButtonClick(button, result));
    });

    themeToggle.addEventListener('click', toggleTheme);

    document.addEventListener('keydown', event => handleKeyDown(event, result));
});

function getLocalStorageData(key, defaultValue) {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
}

function updateLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function handleButtonClick(button, result) {
    const value = button.getAttribute('data-value');

    switch (value) {
        case 'C':
            clearResult(result);
            break;

        case '%':
            applyPercentage(result);
            break;

        case '=':
            evaluateResult(result);
            break;

        default:
            appendValue(result, value);
            break;
    }
}

function clearResult(result) {
    result.value = '';
}

function applyPercentage(result) {
    result.value = `(${result.value})*0.01`;
}

function evaluateResult(result) {
    const input = result.value;

    if (isErrorMessage(input) || input === '') {
        result.value = '';
        return;
    }

    if (input !== '' && input !== prevEntries[prevEntries.length - 1]) {
        prevEntries.push(input);
        updateLocalStorage(PREVIOUS_KEY, prevEntries);
    }

    try {
        result.value = new Function(`return ${result.value}`)();
        if (!isErrorMessage(result.value)) {
            if (prevEntries[prevEntries.length - 1] !== result.value) {
                prevEntries.push(result.value);
                updateLocalStorage(PREVIOUS_KEY, prevEntries);
            }
        }
        currentHistoryIndex = prevEntries.length - 1;
    } catch {
        result.value = ERROR_MESSAGE;
        currentHistoryIndex = prevEntries.length;
    }

    calcHistory[input] = result.value;
    updateLocalStorage(HISTORY_KEY, calcHistory);
}

function appendValue(result, value) {
    if (isErrorMessage(result.value)) {
        result.value = '';
    }
    result.value += value;
}

function isErrorMessage(message) {
    return (
        message === ERROR_MESSAGE ||
        message.includes('Infinity') ||
        message === 'NaN' ||
        message === 'undefined'
    );
}

function handleKeyDown(event, result) {
    const key = event.key;
    const button = document.querySelector(`button[data-value="${key}"]`);

    if (button) {
        button.click();
        return;
    }

    switch (key) {
        case 'Enter':
        case '=':
            event.preventDefault();
            document.querySelector('button[data-value="="]').click();
            break;

        case 'Backspace':
        case 'Delete':
            handleBackspace(result);
            break;

        case 'Escape':
        case 'c':
        case 'C':
            document.querySelector('button[data-value="C"]').click();
            break;

        case 'ArrowUp':
            navigateHistoryUp(result);
            break;

        case 'ArrowDown':
            navigateHistoryDown(result);
            break;

        default:
            break;
    }
}

function handleBackspace(result) {
    if (isErrorMessage(result.value)) {
        result.value = '';
    } else {
        result.value = result.value.slice(0, -1);
    }
}

function navigateHistoryUp(result) {
    if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        result.value = prevEntries[currentHistoryIndex];
    }
}

function navigateHistoryDown(result) {
    if (currentHistoryIndex < prevEntries.length - 1) {
        currentHistoryIndex++;
        result.value = prevEntries[currentHistoryIndex];
    } else {
        result.value = '';
        currentHistoryIndex = prevEntries.length;
    }
}

function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(PREVIOUS_KEY);
    calcHistory = {};
    prevEntries = [];
}

function updateTheme() {
    const theme = localStorage.getItem('theme');
    isDark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme();
}

function toggleTheme() {
    isDark = !isDark;
    applyTheme();
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function applyTheme() {
    document.body.dataset.theme = isDark ? 'dark' : 'light';
}
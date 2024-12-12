const ERROR_MESSAGE = 'Error :(';
const HISTORY_KEY = 'history';
const PREVIOUS_KEY = 'previous';
const modifiers = ['+', '-', '*', '/'];

let calcHistory = getLocalStorageData(HISTORY_KEY, {});
let prevEntries = getLocalStorageData(PREVIOUS_KEY, []);
let currentHistoryIndex = prevEntries.length;

let isDark = false;
updateTheme();

document.addEventListener('DOMContentLoaded', () => {
    const result = document.getElementById('result');
    const buttons = document.querySelectorAll('.btn');
    const themeToggle = document.getElementById('theme-toggle');
    const clearHistoryBtn = document.getElementById('clear-history');

    buttons.forEach(button => {
        button.addEventListener('click', () => handleButtonClick(button, result));
    });

    clearHistoryBtn.addEventListener('click', clearHistory.bind(null, result));

    themeToggle.addEventListener('click', toggleTheme);

    document.addEventListener('keydown', event => handleKeyDown(event, result));

    renderHistory();
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

    button.blur();
}

function validateInput(result) {
    try {
        if (result.value && !isErrorMessage(result.value)) {
            new Function(`return ${result.value}`)();
            result.classList.remove('error-glow')
        }
    } catch {
        console.log('Invalid input detected!');
        result.classList.add('error-glow');
    }
}

function clearResult(result) {
    result.value = '';
    currentHistoryIndex = prevEntries.length;
    result.classList.remove('error-glow');
}

function applyPercentage(result) {
    const currentValue = result.value;

    if (currentValue && !isErrorMessage(currentValue)) {
        result.value = `(${currentValue})*0.01`;
    }

    validateInput(result);
}

function evaluateResult(result) {
    const input = result.value;

    if (isErrorMessage(input) || input === '') {
        result.value = '';
        result.classList.remove('error-glow');
        return;
    }

    if (prevEntries[prevEntries.length - 1] !== input && input !== '') {
        prevEntries.push(input);
        updateLocalStorage(PREVIOUS_KEY, prevEntries);
    }

    try {
        const evalResult = new Function(`return ${input}`)();
        result.value = evalResult;

        result.classList.remove('error-glow');
        result.classList.add('glow');

        setTimeout(() => {
            result.classList.remove('glow');
        }, 3000)

        prevEntries.push(evalResult);
        currentHistoryIndex = prevEntries.length - 1;

    } catch {
        result.value = ERROR_MESSAGE;
        result.classList.add('error-glow');
        currentHistoryIndex = prevEntries.length;
    }
    addToHistory(input, result.value);
}

function appendValue(result, value) {
    if (isErrorMessage(result.value)) {
        result.value = '';
    }

    result.classList.remove('error-glow', 'glow');

    const currentValue = result.value;

    if (modifiers.includes(currentValue.slice(-1)) && modifiers.includes(value)) {
        result.value = currentValue.slice(0, -1) + value;
    } else {
        result.value += value;
    }

    validateInput(result);
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
    const ctrl = event.ctrlKey;

    const button = document.querySelector(`button[data-value="${key}"]`);

    if (button) {
        button.click();
        return;
    }

    if (ctrl && key === 'c') {
        navigator.clipboard.writeText(result.value).then();
        return;
    }

    if (ctrl && key === 'ArrowUp') {
        navigateHistoryUp(result);
        return;
    }

    if (ctrl && key === 'ArrowDown') {
        navigateHistoryDown(result);
        return;
    }

    if (ctrl && key === 'Backspace') {
        document.querySelector('button[data-value="C"]').click();
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

function addToHistory(input, result) {
    calcHistory[input] = result;
    updateLocalStorage(HISTORY_KEY, calcHistory);

    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    Object.keys(calcHistory).forEach((input) => {
        const result = calcHistory[input];

        const listItem = document.createElement('li');
        listItem.className = 'history-item';
        listItem.innerText = `${input} = ${result}`;

        const deleteButton = document.createElement('span');
        deleteButton.innerHTML = '🗑️';
        deleteButton.className = 'delete-btn';
        deleteButton.setAttribute('data-input', input);

        deleteButton.addEventListener('click', () => deleteHistoryEntry(input));

        listItem.appendChild(deleteButton);
        historyList.appendChild(listItem);
    });
}

function deleteHistoryEntry(input) {
    delete calcHistory[input];
    updateLocalStorage(HISTORY_KEY, calcHistory);

    renderHistory();
}

function clearHistory(result) {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(PREVIOUS_KEY);
    calcHistory = {};
    prevEntries = [];

    result.value = '';

    renderHistory();
}

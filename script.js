const ERROR_MESSAGE = 'Error :(';
const INVALID_INPUT_MESSAGE = 'Invalid input';
const HISTORY_KEY = 'history';
const PREVIOUS_KEY = 'previous';
const modifiers = ['+', '-', '*', '/', '%'];

let calcHistory = getLocalStorageData(HISTORY_KEY, {});
let prevEntries = getLocalStorageData(PREVIOUS_KEY, []);
let currentEntryIndex = prevEntries.length;

let isDark = false;
let isResult = false;

document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
    updateTheme();
});

function initCalculator() {
    const result = document.getElementById('result');

    attachListener('.btn', 'click', (button) => handleButtonInput(button, result));
    attachListener('#clear-history', 'click', () => clearHistory(result));
    attachListener('#theme-toggle', 'click', toggleTheme);

    document.addEventListener('keydown', (event) => handleKeyDown(event, result));

    renderHistory();
}

function getLocalStorageData(key, defaultValue) {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
}

function updateLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function attachListener(selector, event, handler) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
        element.addEventListener(event, (e) => handler(e.target));
    });
}

function handleButtonInput(button, result) {
    const value = button.getAttribute('data-value');
    const isOperator = modifiers.includes(value);

    // Clear input if result is displayed and pressed button is not an operator but a number
    // This allows the user to start a new calculation with the result by firstly pressing an operator button
    // But if is pressed button, then input will reset
    if (isResult) {
        if (!isOperator) {
            result.value = '';
        }
        isResult = false;
    }

    processInput(value, result);
    button.blur();
}

function processInput(value, result) {
    switch (value) {
        case 'C':
            clearInput(result);
            break;
        case '%':
            applyPercentage(result);
            break;
        case '=':
            evaluateExpression(result);
            break;
        default:
            appendValue(result, value);
            break;
    }
}

function validateInput(result) {
    const valid = isValidInput(result.value);
    toggleClass(result, 'error-glow', !valid);
    return valid;
}

function isValidInput(input) {
    try {
        new Function(`return ${input}`)();
        return !isError(input);
    } catch {
        return false;
    }
}

function clearInput(result) {
    result.value = '';
    currentEntryIndex = prevEntries.length;
    toggleClass(result, 'error-glow', false);
    isResult = false;
}

function applyPercentage(result) {
    const currentValue = result.value;
    if (currentValue && validateInput(result)) {
        result.value = `(${currentValue})*0.01`;
        validateInput(result);
    }
}

function evaluateExpression(result) {
    const input = result.value.trim();

    if (isError(input)) {
        clearInput(result);
        return;
    }

    addPreviousEntry(input);

    if (!validateInput(result) || !input) {
        return setErrorState(result, INVALID_INPUT_MESSAGE);
    }

    try {
        const evalResult = new Function(`return ${input}`)();
        setResultState(result, evalResult, input);
    } catch {
        setErrorState(result, ERROR_MESSAGE);
    }
}

function setResultState(result, output, input) {
    result.value = output;
    isResult = true;

    if (output !== input) {
        toggleClass(result, 'error-glow', false);
        animateGlow(result);
        addToHistory(input, output);
        addPreviousEntry(output); // Add result to previous entries
        currentEntryIndex = prevEntries.length - 1; // Set entry index to the last entry
    }
}

function setErrorState(result, message) {
    result.value = message;
    toggleClass(result, 'error-glow', !!message);
    currentEntryIndex = prevEntries.length;
}

function addPreviousEntry(input) {
    if (prevEntries[prevEntries.length - 1] !== input && input !== '') {
        prevEntries.push(input);
        updateLocalStorage(PREVIOUS_KEY, prevEntries);
    }
}

function appendValue(result, value) {
    if (isError(result.value)) {
        clearInput(result);
    }

    const currentValue = result.value;
    result.value = modifiers.includes(currentValue.slice(-1)) && modifiers.includes(value)
        ? currentValue.slice(0, -1) + value
        : currentValue + value;

    validateInput(result);
}

function isError(message) {
    return [ERROR_MESSAGE, INVALID_INPUT_MESSAGE, 'Infinity', 'NaN', 'undefined'].some((err) => message.includes(err));
    // TODO: maybe we should check if return value is a number?
}

function handleKeyDown(event, result) {
    const key = event.key;
    const ctrl = event.ctrlKey;
    const keyMapping = {
        Enter: '=', '=': '=',
        Backspace: 'Backspace', Delete: 'Backspace',
        Escape: 'C', c: 'C', C: 'C',
        ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown',
    };

    const mappedKey = keyMapping[key];
    if (!mappedKey) {
        const button = document.querySelector(`button[data-value="${key}"]`);
        button?.click();
        return;
    }

    event.preventDefault();

    if (ctrl && key === 'Backspace') {
        clearInput(result);
        return;
    }

    if (ctrl && key.toLowerCase() === 'c') {
        navigator.clipboard.writeText(result.value);
        return;
    }

    switch (mappedKey) {
        case '=':
            document.querySelector('button[data-value="="]').click();
            break;
        case 'Backspace':
            handleBackspace(result);
            break;
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
    if (isError(result.value)) {
        clearInput(result);
    } else {
        result.value = result.value.slice(0, -1);
    }
    validateInput(result);
}

function navigateHistoryUp(result) {
    if (currentEntryIndex > 0) result.value = prevEntries[--currentEntryIndex];
}

function navigateHistoryDown(result) {
    if (currentEntryIndex < prevEntries.length - 1) {
        currentEntryIndex++;
        result.value = prevEntries[currentEntryIndex];
    } else {
        clearInput(result);
        currentEntryIndex = prevEntries.length;
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

function clearHistory(result) {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(PREVIOUS_KEY);
    calcHistory = {};
    prevEntries = [];
    clearInput(result);
    renderHistory();
}

function addToHistory(input, result) {
    calcHistory[input] = result;
    updateLocalStorage(HISTORY_KEY, calcHistory);

    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    Object.entries(calcHistory).forEach(([input, output]) => {
        const listItem = createHistoryItem(input, output);
        historyList.appendChild(listItem);
    });
}

function createHistoryItem(input, output) {
    const listItem = document.createElement('li');
    listItem.className = 'history-item';
    listItem.innerText = `${input} = ${output}`;

    const deleteButton = document.createElement('span');
    deleteButton.innerHTML = '🗑️';
    deleteButton.className = 'delete-btn';
    deleteButton.setAttribute('data-input', input);
    deleteButton.addEventListener('click', () => deleteHistoryEntry(input));

    listItem.appendChild(deleteButton);
    return listItem;
}

function deleteHistoryEntry(input) {
    delete calcHistory[input];
    updateLocalStorage(HISTORY_KEY, calcHistory);
    renderHistory();
}

function animateGlow(element) {
    toggleClass(element, 'glow', true);
    setTimeout(() => toggleClass(element, 'glow', false), 3000);
}

function toggleClass(element, className, condition) {
    element.classList.toggle(className, condition);
}
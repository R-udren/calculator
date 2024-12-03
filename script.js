const errorMessage = 'Error :(';

let history = {};
if (localStorage.getItem('history')) {
    history = JSON.parse(localStorage.getItem('history'));
}

let previous = []; // Previous input and result (if not error)
if (localStorage.getItem('previous')) {
    previous = JSON.parse(localStorage.getItem('previous'));
}

let script = previous.length;

let isDark = false;
updateTheme();

document.addEventListener('DOMContentLoaded', () => {
    const result = document.getElementById('result');
    const buttons = document.querySelectorAll('.btn');
    const themeToggle = document.getElementById('theme-toggle');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');

            if (value === 'C') {
                result.value = '';
            } else if (value === '=') {
                if (isErrorMessage(result.value) || result.value === '') {
                    result.value = '';
                    return;
                }
                if (result.value !== '' && result.value !== previous[previous.length - 1]) {
                    previous.push(result.value);
                    localStorage.setItem('previous', JSON.stringify(previous));
                }

                const input = result.value;

                try {
                    result.value = new Function('return ' + result.value)();
                    if (!isErrorMessage(result.value)) {
                        if (previous[previous.length - 1] !== input) {
                            previous.push(result.value);
                            localStorage.setItem('previous', JSON.stringify(previous));
                        }
                    }
                    script = previous.length;
                } catch {
                    result.value = errorMessage;
                }

                history[input] = result.value;
                localStorage.setItem('history', JSON.stringify(history));

            } else {
                if (isErrorMessage(result.value)) {
                    result.value = '';
                }
                result.value += value;
            }
        });
    });

    themeToggle.addEventListener('click', () => {
        toggleTheme();
    });

    document.addEventListener('keydown', event => {
        const key = event.key;
        const button = document.querySelector(`button[data-value="${key}"]`);

        if (button) {
            button.click();
        }

        if (key === 'Enter' || key === '=') {
            event.preventDefault();
            document.querySelector('button[data-value="="]').click();
        }

        if (key === 'Backspace' || key === 'Delete') {
            if (isErrorMessage(result.value)) {
                result.value = '';
            }

            result.value = result.value.slice(0, -1);
        }

        if (key === 'Escape' || key === 'c' || key === 'C' || (event.ctrlKey && key === 'Backspace')) {
            document.querySelector('button[data-value="C"]').click();
        }

        // History navigation
        if (key === 'ArrowUp') {
            if (script > 0) {
                script--;
                result.value = previous[script];
            }
        }

        if (key === 'ArrowDown') {
            if (script < previous.length - 1) {
                script++;
                result.value = previous[script];
            } else {
                result.value = '';
            }
        }
    });
});

function isErrorMessage(message) {
    return message === errorMessage || message.includes('Infinity') || message === 'NaN' || message === 'undefined'
}

function clearHistory() {
    localStorage.removeItem('history');
    localStorage.removeItem('previous');
    history = {};
    previous = [];
}

function updateTheme() {
    const theme = localStorage.getItem("theme");
    if (theme) {
        isDark = theme === "dark";
    } else {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    applyTheme();
}

function toggleTheme() {
    isDark = !isDark;
    applyTheme();
    localStorage.setItem("theme", isDark ? "dark" : "light");
}

function applyTheme() {
    if (isDark) {
        document.body.dataset.theme = 'dark';
    } else {
        document.body.dataset.theme = 'light';
    }
}
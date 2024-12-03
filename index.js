const errorMessage = 'Error :(';

let history = {};
if (localStorage.getItem('history')) {
    history = JSON.parse(localStorage.getItem('history'));
}

let previous = []; // Previous input and result (if not error)
if (localStorage.getItem('previous')) {
    previous = JSON.parse(localStorage.getItem('previous'));
}

let index = previous.length;

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
                if (isErrorMessage(result.value)) {
                    result.value = '';
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
                    index = previous.length;
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
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    });

    document.addEventListener('keydown', event => {
        const key = event.key;
        const button = document.querySelector(`button[data-value="${key}"]`);

        if (button) {
            button.click();
        }

        if (key === 'Enter' || key === '=') {
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
            if (index > 0) {
                index--;
                result.value = previous[index];
            }
        }

        if (key === 'ArrowDown') {
            if (index < previous.length - 1) {
                index++;
                result.value = previous[index];
            } else {
                result.value = '';
            }
        }
    });
});

function isErrorMessage(message) {
    return message === errorMessage || message.includes('Infinity') || message === 'NaN' || message === 'undefined'
}
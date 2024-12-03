document.addEventListener('DOMContentLoaded', () => {
    const result = document.getElementById('result');
    const buttons = document.querySelectorAll('.btn');
    const themeToggle = document.getElementById('theme-toggle');

    let history = {};

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');

            if (value === 'C') {
                result.value = '';
            } else if (value === '=') {
                const input = result.value;
                try {
                    result.value = new Function('return ' + result.value)();
                    history[input] = result.value;
                } catch {
                    result.value = 'Error :(';
                    history[input] = input;
                }
                console.debug(history);
            } else {
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
            if (result.value === 'Error :(' || result.value === 'Infinity' || result.value === 'NaN' || result.value === 'undefined') {
                result.value = '';
            }

            result.value = result.value.slice(0, -1);
        }

        if (key === 'Escape' || key === 'c' || key === 'C' || (event.ctrlKey && key === 'Backspace')) {
            document.querySelector('button[data-value="C"]').click();
        }
    });
});
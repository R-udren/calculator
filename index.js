document.addEventListener('DOMContentLoaded', () => {
    const result = document.getElementById('result');
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');

            if (value === 'C') {
                result.value = '';
            } else if (value === '=') {
                try {
                    result.value = new Function('return ' + result.value)(); // safer than eval (I think so...)
                } catch {
                    result.value = 'Error :(';
                }
            } else {
                result.value += value;
            }
        });
    });

    // Keyboard support
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
            if (result.value === 'Error :(') {
                result.value = '';
            }
            result.value = result.value.slice(0, -1);
        }


        if (key === 'Escape' || key === 'c' || key === 'C') {
            document.querySelector('button[data-value="C"]').click();
        }
    });
});
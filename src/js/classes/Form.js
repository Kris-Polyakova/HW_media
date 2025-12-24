export class Form {
    constructor(element) {
        this.form = document.querySelector(element);
        this.input = this.form.querySelector('.coordinates-input');
        this.okButton = this.form.querySelector(".ok-btn");
        this.cancelButton = this.form.querySelector('.cancel-btn');
        this.successCallback = null;
        this._isSending = false;
        this.form.setAttribute("novalidate", "");
        this.connect();
        
    }
    
    connect() {
        this.form.addEventListener('submit', (e) => {
            this._handleSubmit(e);
        });

        this.input.addEventListener('input', (e) => {
            this._hideError(this.input);
        });

        this.cancelButton.addEventListener('click', () => {
            this.hide();
        });
    }
    
    show(onSuccess) {
        this.successCallback = onSuccess;
        this.form.parentElement.classList.remove('_hidden');
        this.input.focus();
    }
    
    hide() {
        this.form.parentElement.classList.add('_hidden');
        this.input.value = '';
        this._isSending = false;
    }

    _showError(field, message) {
        const errEl = field.parentElement.querySelector('.wrong-field');
        if (errEl) return
        const errorMessage = document.createElement('span');
        errorMessage.className = 'wrong-field';
        errorMessage.textContent = message;
        field.parentElement.append(errorMessage);
    }

    _hideError(field) {
        const errEl = field.parentElement.querySelector('.wrong-field');
        if (!errEl) return
        errEl.remove();
    }


    _handleSubmit(event) {
        event.preventDefault();
        
        if (this._isSending) return;

        this._hideError(this.input);

        if (!this._validateCoordinates()) {
            return;
        }
        
        this.send();
    }

    _validateCoordinates() {
        const value = this.input.value.trim();
        
        if (!value) {
            this._showError(this.input, 'Введите координаты');
            return false;
        }
        
        const patterns = [
            /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/,
            /^\[\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*\]$/,
            /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/,
            /^\[\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*\]$/
        ];

        const isValidFormat = patterns.some(pattern => pattern.test(value));
        
        if (!isValidFormat) {
            this._showError(this.input, 'Неверный формат. Пример: 51.50851, -0.12572');
            return false;
        }
        
        const coords = this._parseCoordinates(value);
        if (!coords || !this._areValidCoordinates(coords)) {
            this._showError(this.input, 'Недопустимые значения координат');
            return false;
        }
        
        return true;
    }

    _parseCoordinates(value) {
        const cleaned = value.replace(/^\[|\]$/g, '').trim();
        const parts = cleaned.split(',').map(part => part.trim());
        
        if (parts.length !== 2) return null;
        
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        
        if (isNaN(lat) || isNaN(lon)) return null;
        
        return { latitude: lat, longitude: lon };
    }

    _areValidCoordinates(coords) {
        const { latitude, longitude } = coords;
        
        if (latitude < -90 || latitude > 90) return false;
        if (longitude < -180 || longitude > 180) return false;
        
        return true;
    }

    _formatCoordinates(value) {
        const coords = this._parseCoordinates(value);
        if (!coords) return value;
        
        return `[${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}]`;
    }

    send() {
        this._isSending = true;
        const value = this.input.value.trim();

        const formattedValue = this._formatCoordinates(value);

        if (this.successCallback) {
            this.successCallback(formattedValue);
        }
        this.hide();
    }

}
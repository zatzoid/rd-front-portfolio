
export default class Form {
    /**
     *
     * @param {Element} formDomEl
     * @param {Function} submitFoo
     *
     */
    constructor(formDomEl, submitFoo) {
        this._form = formDomEl
        this._form.setAttribute('novalidate', true)
        this._inputContainerSelector = 'form-input'
        this._inputErrorMsgSelector = 'input-text-error-msg'
        this._inputErrorSelector = '_error'
        this._inputPlaceholderSelector = 'input-text-placeholder'
        this.submitForm = submitFoo
        this._inputs = this._form.querySelectorAll('input, textarea')
        this._inputsData = this._createInputData(this._inputs)
        this._passwordInput = Array.from(this._inputs).find(e => e.name === 'password')
        this._passwordRepeatInput = Array.from(this._inputs).find(e => e.name === 'passwordRepeat')
        this._submitBtn = this._form.querySelector('button[type="submit"]')
        /**
         * _inputsData: {[key: input.name] :{
         *                  value: any,
         *                  isValid: bool,
         *                  isRequired: bool
         *                  }
         *              }
         *  */

        /*  this._btnSubmit = this._form.querySelector('button[type="submit"]')
            this._btnSubmit.setAttribute('disabled', true) */

        this.initForm()
    }
    _inputHandler(inputTarget) {



        this._inputsData[inputTarget.name].value = inputTarget.value
        this._validation(inputTarget);

        if (!inputTarget.placeholder &&  inputTarget.closest('.' + this._inputContainerSelector)) return

        if (inputTarget.value) {
            inputTarget.closest('.' + this._inputContainerSelector)
                .querySelector('.' + this._inputPlaceholderSelector).style.display = 'none'
        } else {
            inputTarget.closest('.' + this._inputContainerSelector)
                .querySelector('.' + this._inputPlaceholderSelector).style.display = 'block'
        }



    }

    _validation(input) {
        //валидация инпутов

        switch (input.name) {
            case 'name':
                this._checkInputValid(input, /^[A-Za-zА-яЁё ]+$/, 'Допустим ввод только букв')
                break;

            case 'email':
                this._checkInputValid(input, /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Поле должно быть в формате email@domain.com')
                break;

            case 'phone':
                this._checkInputValid(input, /^\+(7|375) \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Формат номера телефона +7 (888) 888-88-88')
                break;
            case 'password':
                this._checkInputValid(input, /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Не корректный пароль')
                break;


            default:
                this._checkInputValid(input)
                break;
        }

    }

    _checkInputValid(target, regex = null, regexMsg = 'че то не так написал, исправляй') {

        if (!this._inputsData[target.name].isRequired) return


        const inputContainer = target.closest('.' + this._inputContainerSelector);
        const errorMsg = inputContainer.querySelector('.' + this._inputErrorMsgSelector);

        if (this._inputsData[target.name].isRequired && !this._inputsData[target.name].value) {
            //check requred
            console.log('required');
            inputContainer.classList.add(this._inputErrorSelector);
            errorMsg.textContent = 'Это поле обязательно.'
            this._inputsData[target.name].isValid = false


        } else if (target.name === 'passwordRepeat') {

            this._validation(this._passwordInput)
            if (target.value !== this._inputsData.password.value) {
                inputContainer.classList.add(this._inputErrorSelector);
                errorMsg.textContent = 'Пароли не совпадают'
                this._inputsData[target.name].isValid = false
            } else {
                this._inputsData[target.name].isValid = true
                inputContainer.classList.remove(this._inputErrorSelector)
                errorMsg.textContent = ' '
            }


        } else if (target.getAttribute('type') === 'checkbox' || target.getAttribute('type') === 'radio') {
            //check for checkbox and radio
            console.log('checkbox and radio');
            this._inputsData[target.name].isValid = !this._inputsData[target.name].isRequired ? true : target.checked
            if (!target.checked) {
                inputContainer.classList.add(this._inputErrorSelector);
            } else {
                inputContainer.classList.remove(this._inputErrorSelector);
            }


        } else if (regex && !regex.test(target.value)) {
            //check regex
            inputContainer.classList.add(this._inputErrorSelector);
            errorMsg.textContent = regexMsg
            this._inputsData[target.name].isValid = false


        } else {
            //validation successfully
            console.log('successfully');
            this._inputsData[target.name].isValid = true
            inputContainer.classList.remove(this._inputErrorSelector)
            errorMsg.textContent = ' '
        }


    }

    _onSubmit(evt) {
        let whatsUp = true
        for (const inp of this._inputs) {
            this._inputHandler(inp)
            if (!this._inputsData[inp.name].isValid) {
                whatsUp = false
            }
        }

        if (!whatsUp) return
        //сабмит
        this._form.dispatchEvent(new Event('submit'));
    }



    _createInputData(inputs) {

        let echo = {}

        for (const input of inputs) {

            input.setAttribute('autocomplete', 'off')
            if (input.placeholder && input.closest('.' + this._inputContainerSelector)) {

                const plcaholder = input.closest('.' + this._inputContainerSelector)
                    .querySelector('.' + this._inputPlaceholderSelector)

                plcaholder.textContent = input.placeholder
                if (input.dataset.required) {
                    plcaholder.setAttribute('data-end', ' *')
                }

            }


            if (input.name === 'password') {
                const passbtn = input.closest('.' + this._inputContainerSelector)
                    .querySelector('.input-text-password')

                if (passbtn) {
                    passbtn.addEventListener('click', (e) => {
                        e.preventDefault()
                        this._passowrHide()
                    })
                }
            }

            if (input.type === 'file') {

                input.addEventListener('change', (e) => { this._fileHandler(e) })
            }


            if (!echo[input.name]) {
                const isValid = !input.dataset.required,
                    isRequired = !!input.dataset.required

                let value = input.dataset.defaultv || input.checked || input.value || ''

                if (input.type === 'checkbox' || input.type === 'radio') {
                    value = input.checked
                }

                echo[input.name] = { value, isValid, isRequired }
            }
        }


        return echo

    }

    _fileHandler(evt) {
        const inputContainer = evt.target.closest('.' + this._inputContainerSelector);
        if (evt.target.value) {
            inputContainer.classList.add('_active')
            inputContainer.querySelector('.input-file-got')
                .querySelector('.input-file-text')
                .textContent = evt.target.value.split('\\').slice(-1)


        } else {
            inputContainer.classList.remove('_active')
        }
    }

    _passowrHide() {
       
        if (this._passwordInput.type === 'text') {
            this._passwordInput.setAttribute('type', 'password')
            if (this._passwordRepeatInput) {
                this._passwordRepeatInput.setAttribute('type', 'password')
            }
        } else {
            this._passwordInput.setAttribute('type', 'text')
            if (this._passwordRepeatInput) {
                this._passwordRepeatInput.setAttribute('type', 'text')
            }
        }
    }


    initForm() {
        this._form.noValidate = true


        this._inputs.forEach(el => {
            el.addEventListener('input', (e) => this._inputHandler(e.target))
            el.addEventListener('blur', (e) => this._inputHandler(e.target))
            el.addEventListener('change', (e) => this._inputHandler(e.target))
        })

        if (this._submitBtn) {
            this._submitBtn.setAttribute('type', 'button')
            this._submitBtn.addEventListener('click', (e) => { this._onSubmit(e) })
        }

    }

}

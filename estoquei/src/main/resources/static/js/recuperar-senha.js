document.addEventListener("DOMContentLoaded", function() {

    const esqueciForm = document.getElementById('esqueci-form');
    if (esqueciForm) {
        const btn = document.getElementById('esqueci-btn');
        const icon = document.getElementById('esqueci-icon');
        const text = document.getElementById('esqueci-text');

        esqueciForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            btn.disabled = true;
            icon.className = 'fa-solid fa-spinner fa-spin';
            text.textContent = 'Enviando';

            const email = document.getElementById('email').value;
            const formData = new FormData();
            formData.append('email', email);

            fetch('/admin/enviar-codigo-recuperacao', {
                method: 'POST',
                body: new URLSearchParams(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'sucesso') {
                    sessionStorage.setItem('email_recuperacao', email);
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: data.message,
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = data.redirectUrl;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ocorreu um erro',
                        text: data.message,
                        timer: 2500,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                    document.getElementById('email').style.border = '2px solid #f27474';
                }
            }).catch(error => {
                console.error('Erro na requisição:', error);
                Swal.fire({ icon: 'error', title: 'Erro de comunicação', text: 'Não foi possível conectar ao servidor.' });
            }).finally(() => {
                btn.disabled = false;
                icon.className = 'fa-solid fa-paper-plane';
                text.textContent = 'Enviar Código';
            });
        });
    }

    const otpForm = document.getElementById('otp-form');
    if (otpForm) {
        const btn = document.getElementById('validar-btn');
        const icon = document.getElementById('validar-icon');
        const text = document.getElementById('validar-text');
        const inputs = document.querySelectorAll('.otp-input');
        
        inputs.forEach((input, index) => {
            input.addEventListener('keyup', (e) => {
                if (e.key >= 0 && e.key <= 9 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === "Backspace" && index > 0 && input.value === '') {
                    inputs[index - 1].focus();
                }
            });
        });

        inputs[0].addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text').trim();
            if (/^\d{6}$/.test(pasteData)) {
                const digits = pasteData.split('');
                inputs.forEach((input, index) => {
                    input.value = digits[index] || '';
                });
                inputs[5].focus();
            }
        });

        otpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            btn.disabled = true;
            icon.className = 'fa-solid fa-spinner fa-spin';
            text.textContent = 'Validando...';

            let otpValue = '';
            inputs.forEach(input => { otpValue += input.value; });
            const formData = new FormData();
            formData.append('otp', otpValue);

            fetch('/admin/validar-codigo', {
                method: 'POST',
                body: new URLSearchParams(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'sucesso') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: data.message,
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = data.redirectUrl;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ocorreu um erro',
                        text: data.message,
                        timer: 2500,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                    inputs.forEach(input => input.style.border = '2px solid #f27474');
                }
            }).catch(error => console.error('Erro na requisição:', error))
            .finally(() => {
                btn.disabled = false;
                icon.className = 'fa-solid fa-check';
                text.textContent = 'Validar';
            });
        });

        const resendBtn = document.getElementById('resend-btn');
        if (resendBtn) {
            let timer = 20;
            const startTimer = () => {
                resendBtn.textContent = `Reenviar em ${timer}s`;
                resendBtn.disabled = true;
                const interval = setInterval(() => {
                    timer--;
                    if (timer >= 0) {
                        resendBtn.textContent = `Reenviar em ${timer}s`;
                    } else {
                        clearInterval(interval);
                        resendBtn.innerHTML = '<i class="fa-solid fa-paper-plane" id="esqueci-icon"></i> Reenviar';
                        resendBtn.disabled = false;
                        timer = 20;
                    }
                }, 1000);
            };
            startTimer();

            resendBtn.addEventListener('click', () => {
                if (resendBtn.disabled) return;

                const email = sessionStorage.getItem('email_recuperacao');
                if (!email) {
                    Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível encontrar o e-mail. Por favor, volte ao início' });
                    return;
                }
                
                startTimer();

                const formData = new FormData();
                formData.append('email', email);

                fetch('/admin/enviar-codigo-recuperacao', {
                    method: 'POST',
                    body: new URLSearchParams(formData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'sucesso') {
                        Swal.fire({ icon: 'success', title: 'Código enviado!', text: 'Verifique seu e-mail', timer: 2000, timerProgressBar: true, showConfirmButton: false });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Ocorreu um erro', text: data.message });
                    }
                }).catch(error => {
                    console.error('Erro ao reenviar:', error);
                    Swal.fire({ icon: 'error', title: 'Erro de comunicação', text: 'Não foi possível reenviar o código' });
                });
            });
        }
    }
    
    const redefinirForm = document.getElementById('redefinir-form');
    if (redefinirForm) {
        const btn = document.getElementById('redefinir-btn');
        const icon = document.getElementById('redefinir-icon');
        const text = document.getElementById('redefinir-text');
        const senhaInput = document.getElementById('nova-senha');
        const confirmarSenhaInput = document.getElementById('confirmar-senha');
        
        const togglePasswordVisibility = (inputId, eyeId) => {
            const input = document.getElementById(inputId);
            const eye = document.getElementById(eyeId);
            if (input.type === 'password') {
                input.type = 'text';
                eye.classList.remove('fa-eye-slash');
                eye.classList.add('fa-eye');
            } else {
                input.type = 'password';
                eye.classList.remove('fa-eye');
                eye.classList.add('fa-eye-slash');
            }
        };

        document.getElementById('fa-eye-toggle-1').addEventListener('click', () => togglePasswordVisibility('nova-senha', 'fa-eye-toggle-1'));
        document.getElementById('fa-eye-toggle-2').addEventListener('click', () => togglePasswordVisibility('confirmar-senha', 'fa-eye-toggle-2'));

        const reqs = {
            length: document.getElementById('req-length'),
            uppercase: document.getElementById('req-uppercase'),
            number: document.getElementById('req-number'),
            special: document.getElementById('req-special')
        };

        const validate = (element, isValid) => {
            const icon = element.querySelector('i');
            if (isValid) {
                element.classList.add('valid');
                icon.classList.remove('fa-circle-xmark');
                icon.classList.add('fa-check-circle');
            } else {
                element.classList.remove('valid');
                icon.classList.remove('fa-check-circle');
                icon.classList.add('fa-circle-xmark');
            }
        };

        senhaInput.addEventListener('input', () => {
            const value = senhaInput.value;
            validate(reqs.length, value.length >= 8);
            validate(reqs.uppercase, /[A-Z]/.test(value));
            validate(reqs.number, /[0-9]/.test(value));
            validate(reqs.special, /[^A-Za-z0-9]/.test(value));
        });
        
        redefinirForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const arePasswordsMatching = senhaInput.value === confirmarSenhaInput.value;
            const areReqsMet = document.querySelectorAll('.password-reqs .valid').length === 4;

            if (!arePasswordsMatching) {
                Swal.fire({ icon: 'error', title: 'As senhas não coincidem', text: 'Por favor, verifique se as senhas digitadas são iguais.', showConfirmButton: true });
                senhaInput.style.border = '2px solid #f27474';
                confirmarSenhaInput.style.border = '2px solid #f27474';
                return;
            }

            if (!areReqsMet) {
                Swal.fire({ icon: 'error', title: 'Senha inválida', text: 'Sua nova senha não cumpre todos os requisitos de segurança.', showConfirmButton: true });
                senhaInput.style.border = '2px solid #f27474';
                return;
            }

            btn.disabled = true;
            icon.className = 'fa-solid fa-spinner fa-spin';
            text.textContent = 'Salvando...';

            const formData = new FormData(redefinirForm);

            fetch('/admin/redefinir-senha', {
                method: 'POST',
                body: new URLSearchParams(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'sucesso') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: data.message,
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                    }).then(() => {
                        window.location.href = data.redirectUrl;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ocorreu um erro',
                        text: data.message,
                        showConfirmButton: true
                    });
                }
            }).catch(error => console.error('Erro na requisição:', error))
            .finally(() => {
                btn.disabled = false;
                icon.className = 'fa-solid fa-check';
                text.textContent = 'Confirmar';
            });
        });
    }

    if (typeof window.successMessage !== 'undefined' && window.successMessage) {
        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: window.successMessage,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            scrollbarPadding: false
        });
    }

    if (typeof window.errorMessage !== 'undefined' && window.errorMessage) {
        Swal.fire({
            icon: 'error',
            title: 'Ocorreu um erro',
            text: window.errorMessage,
            timer: 2500,
            timerProgressBar: true,
            showConfirmButton: false,
            scrollbarPadding: false
        });
    }
});
document.getElementById("fa-eye-slash").addEventListener("click", function() {
    const senhaInput = document.getElementById("senha");
    const eyeIcon = document.getElementById("fa-eye-slash");
    if (senhaInput.type === "password") {
        senhaInput.type = "text";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    } else {
        senhaInput.type = "password";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    }
});

if (typeof window.erro !== "undefined" && window.erro) {
    Swal.fire({
        icon: 'error',
        title: 'Erro ao logar',
        text: 'Email ou senha inválidos. Tente novamente',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
        scrollbarPadding: false,
    });
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");
    if (emailInput) emailInput.style.border = '2px solid #f27474';
    if (senhaInput) senhaInput.style.border = '2px solid #f27474';
}
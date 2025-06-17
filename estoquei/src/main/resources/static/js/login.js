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

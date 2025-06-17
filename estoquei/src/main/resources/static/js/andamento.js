    let progress = 0;
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = progressBar.parentElement;
    const backButton = document.getElementsByClassName('btn-voltar')[0];

    backButton.style.display = 'none';

    function animateProgress() {
        if (progress <= 80) {
            progressBar.style.width = progress + '%';
            progressBar.textContent = progress + '%';
            progress++;
            setTimeout(animateProgress, 30);
                } else if (progress > 80) {
                    setTimeout(() => {
                    progressBar.style.display = 'none';
                    backButton.style.display = 'block'; 
                    document.getElementsByClassName('progress-bar-bg')[0].style.backgroundColor = 'white';
                    document.getElementsByClassName('progress-bar-bg')[0].style.margin = '0';
                    }, 1500);
                }
    }
    animateProgress();

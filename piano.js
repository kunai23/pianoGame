document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const notesContainer = document.querySelector('.falling-notes');
    const gameOverMessage = document.querySelector('.game-over');
    const scoreDisplay = document.querySelector('.score');
    const bestScoreDisplay = document.querySelector('.best-score');
    let gameInterval;
    let isGameOver = false;
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0; // Récupère le meilleur score depuis le localStorage
    let activeKeys = new Set();
    let speed = 1000; // Délai initial entre chaque création de note en millisecondes

    // Affichage du meilleur score initial
    bestScoreDisplay.textContent = `Best Score: ${bestScore}`;

    // Objets contenant les chemins des fichiers audio correspondant à chaque touche
    const soundPaths = {
        '65': 'sounds/do.mp3', // A = Do
        '90': 'sounds/re.mp3', // Z = Ré
        '69': 'sounds/mi.mp3', // E = Mi
        '82': 'sounds/fa.mp3'  // R = Fa
    };

    // Chargement des fichiers audio dans des éléments Audio
    const sounds = {};
    for (let key in soundPaths) {
        sounds[key] = new Audio(soundPaths[key]);
    }

    function handleKeydown(e) {
        if (isGameOver && e.keyCode === 32) {
            restartGame();
            return;
        }

        if (isGameOver) {
            return;
        }

        const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);
        const note = document.querySelector(`.note[data-key="${e.keyCode}"]`);

        if (!key) return;

        if (activeKeys.size >= 3 && !activeKeys.has(e.keyCode)) {
            gameOver();
            return;
        }

        key.classList.add('active');
        activeKeys.add(e.keyCode);

        // Jouer le son correspondant
        playSound(e.keyCode);

        if (note && isNoteOnKey(note, key)) {
            note.remove();
            updateScore();
            increaseSpeed();
        }
    }

    function handleKeyup(e) {
        if (isGameOver) return;

        const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);
        if (key) key.classList.remove('active');
        activeKeys.delete(e.keyCode);
    }

    function isNoteOnKey(note, key) {
        const noteRect = note.getBoundingClientRect();
        const keyRect = key.getBoundingClientRect();
        const noteBottom = noteRect.bottom;
        const keyTop = keyRect.top;
        const keyBottom = keyRect.bottom;
        return noteBottom >= keyTop && noteBottom <= keyBottom;
    }

    function createRandomNote() {
        if (isGameOver) return;

        const note = document.createElement('div');
        note.classList.add('note');
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        note.setAttribute('data-key', randomKey.getAttribute('data-key'));
        notesContainer.appendChild(note);

        note.addEventListener('animationend', () => {
            if (!isNoteOnKey(note, randomKey)) {
                gameOver();
            }
        });
    }

    function updateScore() {
        score += 100;
        scoreDisplay.textContent = `Score: ${score}`;

        // Met à jour le meilleur score si nécessaire
        if (score > bestScore) {
            bestScore = score;
            bestScoreDisplay.textContent = `Best Score: ${bestScore}`;
            localStorage.setItem('bestScore', bestScore); // Sauvegarde du meilleur score dans le localStorage
        }
    }

    function gameOver() {
        isGameOver = true;
        gameOverMessage.classList.remove('hidden');
        clearInterval(gameInterval);
        resetKeys();
        notesContainer.innerHTML = '';
    }

    function resetKeys() {
        keys.forEach(key => {
            key.classList.remove('active');
        });
        activeKeys.clear();
    }

    function restartGame() {
        isGameOver = false;
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        gameOverMessage.classList.add('hidden');
        notesContainer.innerHTML = '';
        resetKeys();
        speed = 1000; // Réinitialisation de la vitesse
        gameInterval = setInterval(createRandomNote, speed);
    }

    function increaseSpeed() {
        // Augmenter la vitesse toutes les 12 notes capturées
        if (score % 1200 === 0) { // Augmenter la vitesse toutes les 1200 points
            speed -= 50; // Diminuer la vitesse de 50 ms
            clearInterval(gameInterval);
            gameInterval = setInterval(createRandomNote, speed);
        }
    }

    function playSound(keyCode) {
        const sound = sounds[keyCode.toString()];
        if (sound) {
            sound.currentTime = 0; // Réinitialise la lecture au début pour permettre la répétition rapide du son
            sound.play();
        }
    }

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);

    gameInterval = setInterval(createRandomNote, speed);
});

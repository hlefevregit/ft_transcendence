/// <reference path="./global.d.ts" />
var socket = new WebSocket('ws://localhost:3000/ws');
socket.addEventListener('open', function () {
    console.log('Connexion WebSocket établie');
    // Envoyer un message pour tester
    socket.send('Hello serveur!');
});
socket.addEventListener('message', function (event) {
    console.log('Message du serveur:', event.data);
});
function enterMuseum() {
    var form = document.getElementById("log_form");
    var museumScene = document.getElementById("scene-museum");
    var overlay = document.getElementById("transition-overlay");
    var museumBackground = document.getElementById("museum-background");
    console.log("Début de la transition (fondu au noir)");
    // Active le fondu au noir
    overlay.classList.add("fade-to-black");
    setTimeout(function () {
        console.log("Ville cachée, affichage du musée.");
        // ⚠️ Force l'affichage du musée
        form.classList.add("hidden");
        museumScene.classList.remove("hidden");
        // 🔹 Ajoute une courte pause pour éviter un bug d'affichage
        setTimeout(function () {
            museumScene.classList.add("fade-in");
            museumBackground.style.display = "block"; // Assure que l'image du musée est bien visible
            console.log("Transition terminée, entrée dans le musée.");
        }, 100); // Délai court pour éviter les conflits CSS
        // Retirer le fondu au noir
        setTimeout(function () {
            overlay.classList.remove("fade-to-black");
            overlay.classList.add("fade-from-black");
            setTimeout(function () {
                overlay.classList.remove("fade-from-black");
            }, 500);
        }, 500);
    }, 500);
}
function createForm() {
    var cityScene = document.getElementById("scene-city");
    var form = document.getElementById("log_form");
    var overlay = document.getElementById("transition-overlay");
    console.log("Création du formulaire de connexion");
    overlay.classList.add("fade-to-black");
    setTimeout(function () {
        cityScene.classList.add("hidden");
        form.classList.remove("hidden");
        setTimeout(function () {
            overlay.classList.remove("fade-to-black");
            overlay.classList.add("fade-from-black");
            setTimeout(function () {
                overlay.classList.remove("fade-from-black");
            }, 500);
        }, 500);
    }, 500);
}
function showGoogleLogin(idToken) {
    console.log('Affichage de la modale de connexion avec Google.');
    fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
        credentials: 'include'},
        body: JSON.stringify({ id_token: idToken }),
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error('Erreur de connexion Google.');
        }
        return response.json();
    })
        .then(function (data) {
        if (data.success) {
            console.log('Connexion Google réussie !');
            localStorage.setItem('authToken', data.token);
            enterMuseum();
        }
        else {
            alert("Erreur : ".concat(data.message));
        }
    })
        .catch(function (error) {
        console.error('Erreur :', error);
        alert('Une erreur est survenue lors de la connexion avec Google.');
    });
}
document.addEventListener("DOMContentLoaded", function () {
    var logBtn = document.getElementById("login-btn");
    var registerLink = document.getElementById("register-link");
    var forgotPasswordLink = document.getElementById("forgot-password-link");
    var googleLoginBtn = document.getElementById("google-login-btn");
    logBtn.addEventListener("click", function () {
        var emailInput = document.querySelector("input[name='email']");
        var passwordInput = document.querySelector("input[name='password']");
        var email = emailInput.value;
        var password = passwordInput.value;
        handleEmailLogin(email, password);
    });
    registerLink.addEventListener("click", function (e) {
        var _a, _b;
        e.preventDefault();
        console.log("Redirection vers la page d'inscription");
        (_a = document.getElementById("log_form")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        (_b = document.getElementById("register_form")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
        showRegistrationForm();
    });
    forgotPasswordLink.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Redirection vers la page de réinitialisation du mot de passe");
        showForgotPasswordForm();
    });
    google.accounts.id.initialize({
        client_id: "930883947615-3ful7pfe6k38qbdqfph7ja2lp76spahf.apps.googleusercontent.com",
        callback: function (response) {
            console.log("Réponse Google :", response);
            // response.credential contient le id_token généré par Google
            showGoogleLogin(response.credential);
        }
    });
    // Rendre le bouton Google (ceci remplacera l'appel manuel à showGoogleLogin)
    google.accounts.id.renderButton(googleLoginBtn, { theme: "outline", size: "large" } // options de personnalisation
    );
});
function showForgotPasswordForm() {
    console.log('Affichage de la modale de réinitialisation du mot de passe.');
}
function showRegistrationForm() {
    var _a;
    // Attache l'écouteur sur le lien de retour au login
    (_a = document.getElementById('reg-login-link')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
        var _a, _b;
        event.preventDefault();
        (_a = document.getElementById('register_form')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
        (_b = document.getElementById('log_form')) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
    });
    // Attache directement l'écouteur sur le bouton "Create Account"
    var registerBtn = document.getElementById("reg-create-btn");
    if (registerBtn) {
        registerBtn.addEventListener("click", function (event) {
            event.preventDefault(); // Empêche le comportement par défaut (soumission du formulaire)
            handleRegister();
        });
    }
}
// Fonction qui gère l'inscription
function handleRegister() {
    // Récupérer les valeurs du formulaire
    var nameInput = document.getElementById('reg-name');
    var emailInput = document.getElementById('reg-email');
    var passwordInput = document.getElementById('reg-password');
    if (!nameInput || !emailInput || !passwordInput) {
        console.error("Un ou plusieurs champs sont introuvables.");
        return;
    }
    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    var password = passwordInput.value; // On peut aussi faire .trim() si nécessaire
    // Vérification simple (on peut ajouter d'autres validations)
    if (!name || !email || !password) {
        alert("Veuillez remplir tous les champs.");
        if (!name)
            alert("Le champ 'Nom' est obligatoire.");
        if (!email)
            alert("Le champ 'Email' est obligatoire.");
        if (!password)
            alert("Le champ 'Mot de passe' est obligatoire.");
        return;
    }
    // Envoi de la requête POST vers le backend
    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,
        credentials: 'include'},
        body: JSON.stringify({ name: name, email: email, password: password }),
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error('Erreur lors de l’inscription');
        }
        return response.json();
    })
        .then(function (data) {
        var _a, _b;
        if (data.success) {
            console.log('Inscription réussie !');
            (_a = document.getElementById('register_form')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
            (_b = document.getElementById('log_form')) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
        }
        else {
            console.error('Erreur d’inscription :', data.message);
            alert("Erreur : ".concat(data.message));
        }
    })
        .catch(function (error) {
        console.error('Erreur lors de l’inscription :', error);
        alert('Une erreur est survenue lors de l’inscription. Veuillez réessayer.');
    });
}
// Attacher l'écouteur d'événement au bouton d'inscription
function handleEmailLogin(email, password) {
    console.log("Email :", email);
    var loginUrl = '/api/auth/sign_in';
    var loginData = {
        email: email,
        password: password,
    };
    fetch(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            credentials: 'include' // Assurez-vous d'inclure les cookies
        },
        body: JSON.stringify(loginData),
    })
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        else {
            throw new Error('Erreur de connexion.');
        }
    })
        .then(function (data) {
        if (data.success) {
            console.log('Connexion réussie !');
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            // Masquer le message d'erreur si présent
            var errorMessage = document.getElementById('error-message');
            if (errorMessage)
                errorMessage.classList.add('hidden');
            enterMuseum();
        }
        else {
            console.error('Échec de la connexion :', data.message);
            showErrorMessage('Email ou mot de passe invalide');
        }
    })
        .catch(function (error) {
        console.error('Erreur :', error);
        showErrorMessage('Email ou mot de passe invalide');
    });
}
function showErrorMessage(message) {
    var errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
}
var scaleFactor = 1.7;
document.addEventListener("DOMContentLoaded", function () {
    var characterContainer = document.getElementById("character-container");
    var character = document.getElementById("character");
    var museumZone = document.getElementById("museum-zone");
    var positionX = 40;
    var speed = 30;
    var screenWidth = window.innerWidth;
    character.style.transform = "scale(".concat(scaleFactor, ")");
    // Pour le déplacement, on agit sur le conteneur
    document.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            // Si le sprite n'est pas déjà en mode "move", passe-le en mode mouvement
            if (!character.classList.contains("sprite-move")) {
                character.classList.remove("sprite-idle");
                character.classList.add("sprite-move");
            }
        }
        if (event.key === "ArrowRight" && positionX + speed < screenWidth - characterContainer.clientWidth) {
            positionX += speed;
        }
        else if (event.key === "ArrowLeft" && positionX - speed > 0) {
            positionX -= speed;
        }
        characterContainer.style.transform = "translateX(".concat(positionX, "px)");
        // Optionnel : vérifier la zone du musée
        var charRect = characterContainer.getBoundingClientRect();
        var zoneRect = museumZone.getBoundingClientRect();
        if (charRect.right > zoneRect.left && charRect.left < zoneRect.right) {
            console.log("Le joueur est dans la zone du musée !");
            createForm();
            // enterMuseum();
        }
    });
    document.addEventListener("keyup", function (event) {
        // Lorsqu'on relâche la touche, on repasse en mode idle
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            character.classList.remove("sprite-move");
            character.classList.add("sprite-idle");
        }
    });
});
document.getElementById("exit-museum").addEventListener("click", exitMuseum);
function exitMuseum() {
    var cityScene = document.getElementById("scene-city");
    var museumScene = document.getElementById("scene-museum");
    var overlay = document.getElementById("transition-overlay");
    console.log("Sortie du musée, fondu au noir");
    overlay.classList.add("fade-to-black");
    setTimeout(function () {
        museumScene.classList.add("hidden");
        cityScene.classList.remove("hidden");
        setTimeout(function () {
            overlay.classList.remove("fade-to-black");
            overlay.classList.add("fade-from-black");
            setTimeout(function () {
                overlay.classList.remove("fade-from-black");
            }, 500);
        }, 500);
    }, 500);
}

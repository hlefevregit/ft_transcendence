/// <reference path="./global.d.ts" />

const socket = new WebSocket('ws://localhost:3000/ws');

socket.addEventListener('open', () => {
  console.log('Connexion WebSocket établie');
  // Envoyer un message pour tester
  socket.send('Hello serveur!');
});

socket.addEventListener('message', (event) => {
  console.log('Message du serveur:', event.data);
});

function enterMuseum() {
    const form = document.getElementById("log_form")!;
    const museumScene = document.getElementById("scene-museum")!;
    const overlay = document.getElementById("transition-overlay")!;
    const museumBackground = document.getElementById("museum-background")!;

    console.log("Début de la transition (fondu au noir)");

    // Active le fondu au noir
    overlay.classList.add("fade-to-black");

    setTimeout(() => {
        console.log("Ville cachée, affichage du musée.");

        // ⚠️ Force l'affichage du musée
        form.classList.add("hidden");
        museumScene.classList.remove("hidden");

        // 🔹 Ajoute une courte pause pour éviter un bug d'affichage
        setTimeout(() => {
            museumScene.classList.add("fade-in");
            museumBackground.style.display = "block"; // Assure que l'image du musée est bien visible
            console.log("Transition terminée, entrée dans le musée.");
        }, 100); // Délai court pour éviter les conflits CSS

        // Retirer le fondu au noir
        setTimeout(() => {
            overlay.classList.remove("fade-to-black");
            overlay.classList.add("fade-from-black");

            setTimeout(() => {
                overlay.classList.remove("fade-from-black");
            }, 500);
        }, 500);
    }, 500);
}


function createForm() {
    const cityScene = document.getElementById("scene-city")!;
    const form = document.getElementById("log_form")!;
    const overlay = document.getElementById("transition-overlay")!;

    console.log("Création du formulaire de connexion");

    overlay.classList.add("fade-to-black");

    setTimeout(() => {
        cityScene.classList.add("hidden");
        form.classList.remove("hidden");

        setTimeout(() => {
            overlay.classList.remove("fade-to-black");
            overlay.classList.add("fade-from-black");

            setTimeout(() => {
                overlay.classList.remove("fade-from-black");
            }, 500);
        }, 500);
    }, 500);
}

function showGoogleLogin(idToken: string) {
    console.log('Affichage de la modale de connexion avec Google.');
    fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
    })
    .then(response => {
    if (!response.ok) {
        throw new Error('Erreur de connexion Google.');
    }
    return response.json();
    })
    .then(data => {
    if (data.success) {
        console.log('Connexion Google réussie !');
        localStorage.setItem('authToken', data.token);
        enterMuseum();
    } else {
        alert(`Erreur : ${data.message}`);
    }
    })
    .catch(error => {
    console.error('Erreur :', error);
    alert('Une erreur est survenue lors de la connexion avec Google.');
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const logBtn = document.getElementById("login-btn") as HTMLElement;
    const registerLink = document.getElementById("register-link") as HTMLElement;
    const forgotPasswordLink = document.getElementById("forgot-password-link") as HTMLElement;
    const googleLoginBtn = document.getElementById("google-login-btn") as HTMLElement;

    logBtn.addEventListener("click", () => {
        const emailInput = document.querySelector("input[name='email']") as HTMLInputElement;
        const passwordInput = document.querySelector("input[name='password']") as HTMLInputElement;
        const email = emailInput.value;
        const password = passwordInput.value;

        handleEmailLogin(email, password);
    });

    registerLink.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Redirection vers la page d'inscription");
        document.getElementById("log_form")?.classList.add("hidden");
        document.getElementById("register_form")?.classList.remove("hidden");
        showRegistrationForm();
    });

    forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Redirection vers la page de réinitialisation du mot de passe");
        showForgotPasswordForm();
    });
    
    
    google.accounts.id.initialize({
        client_id: "930883947615-3ful7pfe6k38qbdqfph7ja2lp76spahf.apps.googleusercontent.com", 
        callback: (response: any) => {
            console.log("Réponse Google :", response);
            // response.credential contient le id_token généré par Google
            showGoogleLogin(response.credential);
        }
    });
    // Rendre le bouton Google (ceci remplacera l'appel manuel à showGoogleLogin)
    google.accounts.id.renderButton(
        googleLoginBtn, 
        { theme: "outline", size: "large" } // options de personnalisation
    );

});

function showForgotPasswordForm() {
    console.log('Affichage de la modale de réinitialisation du mot de passe.');
}

function showRegistrationForm() {
    // Attache l'écouteur sur le lien de retour au login
    document.getElementById('reg-login-link')?.addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('register_form')?.classList.add('hidden');
        document.getElementById('log_form')?.classList.remove('hidden');
    });
    
    // Attache directement l'écouteur sur le bouton "Create Account"
    const registerBtn = document.getElementById("reg-create-btn");
    if (registerBtn) {
        registerBtn.addEventListener("click", (event) => {
            event.preventDefault(); // Empêche le comportement par défaut (soumission du formulaire)
            handleRegister();
        });
    }
}

// Fonction qui gère l'inscription
function handleRegister() {
    // Récupérer les valeurs du formulaire
    const nameInput = document.getElementById('reg-name') as HTMLInputElement;
    const emailInput = document.getElementById('reg-email') as HTMLInputElement;
    const passwordInput = document.getElementById('reg-password') as HTMLInputElement;
    
    if (!nameInput || !emailInput || !passwordInput) {
        console.error("Un ou plusieurs champs sont introuvables.");
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value; // On peut aussi faire .trim() si nécessaire

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de l’inscription');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('Inscription réussie !');
            document.getElementById('register_form')?.classList.add('hidden');
            document.getElementById('log_form')?.classList.remove('hidden');
        } else {
            console.error('Erreur d’inscription :', data.message);
            alert(`Erreur : ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erreur lors de l’inscription :', error);
        alert('Une erreur est survenue lors de l’inscription. Veuillez réessayer.');
    });
}

// Attacher l'écouteur d'événement au bouton d'inscription

function handleEmailLogin(email: string, password: string) {
    console.log("Email :", email);

    const loginUrl = '/api/auth/sign_in';
    const loginData = {
        email: email,
        password: password,
    };

    fetch(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Erreur de connexion.');
        }
    })
    .then(data => {
        if (data.success) {
            console.log('Connexion réussie !');
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            // Masquer le message d'erreur si présent
            const errorMessage = document.getElementById('error-message');
            if(errorMessage) errorMessage.classList.add('hidden');
            enterMuseum();
        } else {
            console.error('Échec de la connexion :', data.message);
            showErrorMessage('Email ou mot de passe invalide');
        }
    })
    .catch(error => {
        console.error('Erreur :', error);
        showErrorMessage('Email ou mot de passe invalide');
    });
}

function showErrorMessage(message: string) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
}
const scaleFactor = 1.7;


document.addEventListener("DOMContentLoaded", () => {
    const characterContainer = document.getElementById("character-container") as HTMLElement;
    const character = document.getElementById("character") as HTMLElement;
    const museumZone = document.getElementById("museum-zone") as HTMLElement;
    let positionX = 40;
    const speed = 30;
    const screenWidth = window.innerWidth;

    character.style.transform = `scale(${scaleFactor})`;

  
    // Pour le déplacement, on agit sur le conteneur
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        // Si le sprite n'est pas déjà en mode "move", passe-le en mode mouvement
        if (!character.classList.contains("sprite-move")) {
          character.classList.remove("sprite-idle");
          character.classList.add("sprite-move");
        }
      }
      if (event.key === "ArrowRight" && positionX + speed < screenWidth - characterContainer.clientWidth) {
        positionX += speed;
      } else if (event.key === "ArrowLeft" && positionX - speed > 0) {
        positionX -= speed;
      }
      characterContainer.style.transform = `translateX(${positionX}px)`;
  
      // Optionnel : vérifier la zone du musée
      const charRect = characterContainer.getBoundingClientRect();
      const zoneRect = museumZone.getBoundingClientRect();
      if (charRect.right > zoneRect.left && charRect.left < zoneRect.right) {
        console.log("Le joueur est dans la zone du musée !");
        createForm();
        // enterMuseum();
      }
    });
  
    document.addEventListener("keyup", (event) => {
      // Lorsqu'on relâche la touche, on repasse en mode idle
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        character.classList.remove("sprite-move");
        character.classList.add("sprite-idle");
      }
    });
  });

document.getElementById("exit-museum")!.addEventListener("click", exitMuseum);

function exitMuseum() {
    const cityScene = document.getElementById("scene-city")!;
    const museumScene = document.getElementById("scene-museum")!;
    const overlay = document.getElementById("transition-overlay")!;

    console.log("Sortie du musée, fondu au noir");

    overlay.classList.add("fade-to-black");

    setTimeout(() => {
        museumScene.classList.add("hidden");
        cityScene.classList.remove("hidden");

        setTimeout(() => {
            overlay.classList.remove("fade-to-black");
            overlay.classList.add("fade-from-black");

            setTimeout(() => {
                overlay.classList.remove("fade-from-black");
            }, 500);
        }, 500);
    }, 500);
}
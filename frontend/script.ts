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
        showRegistrationForm();
    });

    forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Redirection vers la page de réinitialisation du mot de passe");
        showForgotPasswordForm();
    });

    googleLoginBtn.addEventListener("click", () => {
        console.log("Connexion avec Google");
        // showGoogleLogin();
    });

});

function showForgotPasswordForm() {
    console.log('Affichage de la modale de réinitialisation du mot de passe.');
}

function showRegistrationForm() {
    console.log('Affichage du formulaire d\'inscription.');
}

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
                enterMuseum();
            }
            else {
                console.error('Échec de la connexion :', data.message);
                alert('Échec de la connexion : ${data.message}');
            }
        })
        .catch(error => {
            console.error('Erreur :', error);
    })
}
const scaleFactor = 1.7;

// document.addEventListener("DOMContentLoaded", () => {
//     const characterContainer = document.getElementById("character-container") as HTMLElement;
//     const character = document.getElementById("character") as HTMLElement;
//     const museumZone = document.getElementById("museum-zone") as HTMLElement;
//     const app = document.getElementById("app") as HTMLElement;
//     let positionX = 40;
//     const speed = 20;
//     const screenWidth = window.innerWidth;

//     character.style.transform = `scale(${scaleFactor})`;

//     // Déplacement du personnage
//     document.addEventListener("keydown", (event) => {
//         if (event.key === "ArrowRight" && positionX + speed < screenWidth - character.clientWidth) {
//             positionX += speed;
//         } else if (event.key === "ArrowLeft" && positionX - speed > 0) {
//             positionX -= speed;
//         }
//         characterContainer.style.transform = `translateX(${positionX}px)`;
        

//         // Vérifier si le joueur est dans la zone du musée
//         const charRect = character.getBoundingClientRect();
//         const zoneRect = museumZone.getBoundingClientRect();
//         if (
//             charRect.right > zoneRect.left &&
//             charRect.left < zoneRect.right
//         ) {
//             console.log("Le joueur est dans la zone du musée !");
//             createForm();
//             // enterMuseum();
//         }
//     });
// });

document.addEventListener("DOMContentLoaded", () => {
    const characterContainer = document.getElementById("character-container") as HTMLElement;
    const character = document.getElementById("character") as HTMLElement;
    const museumZone = document.getElementById("museum-zone") as HTMLElement;
    let positionX = 40;
    const speed = 10;
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
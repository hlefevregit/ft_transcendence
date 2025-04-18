export const enterMuseum = () => {
    const form = document.getElementById("log_form")!;
    const museumScene = document.getElementById("scene-museum")!;
    const museumBackground = document.getElementById("museum-background")!;
    const overlay = document.getElementById("transition-overlay")!;
  
    overlay.classList.add("fade-to-black");
    setTimeout(() => {
            form.classList.add("hidden");
            museumScene.classList.remove("hidden");
            setTimeout(() => {
            museumScene.classList.add("fade-in");
            museumBackground.style.display = "block";
        }, 100);
        setTimeout(() => {
            overlay.classList.remove("fade-to-black");
            overlay.classList.add("fade-from-black");
            setTimeout(() => overlay.classList.remove("fade-from-black"), 500);
        }, 500);
    }, 500);
};
  
export const exitMuseum = () => {
    const cityScene = document.getElementById("scene-city")!;
    const museumScene = document.getElementById("scene-museum")!;
    const overlay = document.getElementById("transition-overlay")!;

    overlay.classList.add("fade-to-black");
    setTimeout(() => {
        museumScene.classList.add("hidden");
        cityScene.classList.remove("hidden");
        setTimeout(() => {
        overlay.classList.remove("fade-to-black");
        overlay.classList.add("fade-from-black");
        setTimeout(() => overlay.classList.remove("fade-from-black"), 500);
        }, 500);
    }, 500);
};
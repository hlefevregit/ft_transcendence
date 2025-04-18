export const useSceneTransition = () => {
    const fade = (callback: () => void) => {
        const overlay = document.getElementById("transition-overlay")!;
        overlay.classList.add("fade-to-black");

        setTimeout(() => {
        callback();
        overlay.classList.remove("fade-to-black");
        overlay.classList.add("fade-from-black");

        setTimeout(() => {
            overlay.classList.remove("fade-from-black");
        }, 500);
        }, 500);
    };
  
    return { fade };
};
const usernameDisplay = document.getElementById("usernameDisplay");
const signupUser = document.getElementById("signupUser");
const user = document.getElementById("user");
const heroPlay = document.getElementById("heroPlay");
const navPlay = document.getElementById("navPlay");
const navStats = document.getElementById("navStats");

// Temporal para probar UI — comenta el fetch y pon esto:
//document.getElementById('usernameDisplay').textContent = 'UserTest';
//document.getElementById('signupUser').style.display = 'none';
//document.getElementById('user').style.display = 'flex';

// Si quieren PROBAR el juego sin necesidad de la base de datos
// Pongan este comando en DEV Tools en console
// Simula que acabas de iniciar sesión
//localStorage.setItem('token', 'fake-token-123');
//localStorage.setItem('username', 'TEST');

// Recarga la página
//location.reload();

// Si quieren borrar el acceso solo pongan
//localStorage.clear()

// Ask if user log in account before
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      // Get token of user data
      const response = await fetch("http://localhost:3001/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Check if data is valid
      if (response.ok) {
        const userData = await response.json();
        usernameDisplay.textContent = userData.username;
        signupUser.style.display = "none";
        user.style.display = "flex";
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Validation token error", error);
    }
  }
});

heroPlay.addEventListener("click", (event) => {
  event.preventDefault();
  navigateToGame();
});

navPlay.addEventListener("click", (event) => {
  event.preventDefault();
  navigateToGame();
});

navStats.addEventListener("click", (event) => {
    event.preventDefault();
    navigateToStats();
})

function navigateToGame() {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "frontend/HTML/game.html";
  } else {
    localStorage.setItem("redirectAfter", "frontend/HTML/game.html");
    window.location.href = "frontend/HTML/login.html";
  }
}

function navigateToStats() {
    const token = localStorage.getItem("token");
    if (token) {
        window.location.href = "frontend/HTML/stats.html";
    } else {
        localStorage.setItem("redirectAfter", "frontend/HTML/game.html");
        window.location.href = "frontend/HTML/login.html";
    }
}

// Header scroll
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");

  if (window.scrollY > 60) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

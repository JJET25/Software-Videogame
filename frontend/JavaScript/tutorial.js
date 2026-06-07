const usernameDisplay = document.getElementById("usernameDisplay");
const usernameInitial = document.getElementById("usernameInitial");
const userAvatar = document.getElementById("userAvatar");
const userDropdown = document.getElementById("userDropdown");
const signupUser = document.getElementById("signupUser");
const user = document.getElementById("user");
const logoutBtn = document.getElementById("logoutBtn");
const tutPlayBtn = document.getElementById("tutPlayBtn");

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const response = await fetch("http://localhost:3001/users/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        if (usernameDisplay) usernameDisplay.textContent = userData.username;
        if (usernameInitial)
          usernameInitial.textContent = userData.username.charAt(0).toUpperCase();
        if (signupUser) signupUser.style.display = "none";
        if (user) user.style.display = "flex";
      } else {
        localStorage.removeItem("token");
      }
    } catch {
      // silently ignore if backend is unreachable
    }
  }
});

userAvatar?.addEventListener("click", (e) => {
  e.stopPropagation();
  userDropdown?.classList.toggle("open");
});

document.addEventListener("click", () => {
  userDropdown?.classList.remove("open");
});

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  if (user) user.style.display = "none";
  if (signupUser) signupUser.style.display = "flex";
});

tutPlayBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "/frontend/HTML/game.html";
  } else {
    localStorage.setItem("redirectAfter", "/frontend/HTML/game.html");
    window.location.href = "/frontend/HTML/login.html";
  }
});

window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 60);
});

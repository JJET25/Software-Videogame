const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const errorLogin = document.getElementById("errorMsgLogin");
const errorSignup = document.getElementById("errorMsgSignup");
const tabs = document.querySelectorAll(".tabs__container button");
const overlay = document.querySelector(".loading-overlay");

// ==== TABS LOGIC ==== //
tabs.forEach((tab) => {
  tab.addEventListener("click", (event) => {
    tabs.forEach((tab) => {
      tab.classList.remove("tab-active");
      tab.classList.add("tab");
    });

    tab.classList.add("tab-active");

    if (tab.dataset.tab === "login") {
      loginForm.style.display = "flex";
      signupForm.style.display = "none";
    } else {
      loginForm.style.display = "none";
      signupForm.style.display = "flex";
    }
  });
});

// ==== LOG IN ==== //
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username.length === 0 || password.length === 0) {
    errorLogin.classList.add("visible");
    return;
  }

  errorLogin.classList.remove("visible");
  overlay.classList.add("active");

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      window.location.href = "../HTML/game.html";
    } else {
      overlay.classList.remove("active");
      errorLogin.classList.add("visible");
    }
  } catch (error) {
    overlay.classList.remove("active");
    errorLogin.classList.add("visible");
  }
});

// ==== SIGN UP ==== //
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (username.length === 0 || email.length === 0 || password.length === 0 ) {
    errorSignup.classList.add("visible");
    return;
  }

  errorSignup.classList.remove("visible");
  overlay.classList.add("active");

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      overlay.classList.remove("active");
      tabs[0].click();
    } else {
      overlay.classList.remove("active");
      errorSignup.classList.add("visible");
    }
  } catch (error) {
    overlay.classList.remove("active");
    errorSignup.classList.add("visible");
  }
});
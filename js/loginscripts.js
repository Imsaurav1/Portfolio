const loginBtn = document.getElementById("loginBtn");
const authPopup = document.getElementById("authPopup"); // ✅ fixed id
const closePopup = document.getElementById("closePopup");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const exclusiveSection = document.getElementById("exclusive-section");
const exclusiveSection1 = document.getElementById("cv-section");
const exclusivesection12 = document.getElementById("exclusive-section2");

// Open popup
function openAuthPopup() {
  authPopup.style.display = "flex";
  showLoginForm(); // default to login
}

// Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiry");
  exclusiveSection.style.display = "none";
  exclusiveSection1.style.display = "none";
  exclusivesection12.style.display = "none";
  loginBtn.textContent = "Login";
  loginBtn.removeEventListener("click", logout);
  loginBtn.addEventListener("click", openAuthPopup);
}

// Show exclusive content and switch login button to logout
function showExclusiveContent() {
  const exclusiveSection = document.getElementById("exclusiveSection");
  const exclusiveSection1 = document.getElementById("exclusiveSection1");
  const exclusiveSection12 = document.getElementById("exclusiveSection12");
  const loginBtn = document.getElementById("loginBtn");

  if (exclusiveSection) exclusiveSection.style.display = "block";
  if (exclusiveSection1) exclusiveSection1.style.display = "block";
  if (exclusiveSection12) exclusiveSection12.style.display = "block";

  if (loginBtn) {
    loginBtn.textContent = "Logout";
    loginBtn.removeEventListener("click", openAuthPopup);
    loginBtn.addEventListener("click", logout);
  }
}

// Check login on page load
window.onload = function () {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("tokenExpiry");

  if (!token || !expiry || Date.now() > expiry) {
    openAuthPopup();
  } else {
    showExclusiveContent();
  }
};

// Login button click
loginBtn.addEventListener("click", openAuthPopup);

// Close popup
closePopup.addEventListener("click", () => {
  authPopup.style.display = "none";
});

// Switch Tabs
loginTab.addEventListener("click", showLoginForm);
registerTab.addEventListener("click", showRegisterForm);

function showLoginForm() {
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
}

function showRegisterForm() {
  loginForm.classList.remove("active");
  registerForm.classList.add("active");
  loginTab.classList.remove("active");
  registerTab.classList.add("active");
}

// Handle login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value; // ✅ fixed id

  try {
    const res = await fetch("https://login-backend-bude.onrender.com/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24h
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenExpiry", expiry);

      authPopup.style.display = "none";
      showExclusiveContent();
    } else {
      alert("Login failed: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
});

// Handle register
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const res = await fetch("https://login-backend-bude.onrender.com/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Registration successful! Please login.");
      showLoginForm();
    } else {
      alert("Registration failed: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
});

// Auto logout if token expired
setInterval(() => {
  const expiry = localStorage.getItem("tokenExpiry");
  if (expiry && Date.now() > expiry) {
    logout();
  }
}, 60 * 1000); // check every 1 min






const API = "https://studymaterial-1heb.onrender.com/api/admin/login";

function login() {
  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("adminToken", data.token);
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("error").innerText = "Invalid credentials";
    }
  });
}

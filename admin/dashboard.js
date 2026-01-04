const API = "https://studymaterial-1heb.onrender.com/api/study-materials";
const token = localStorage.getItem("adminToken");

if (!token) {
  window.location.href = "login.html";
}

// Load data
fetch(API)
  .then(res => res.json())
  .then(data => {
    const table = document.getElementById("materialTable");
    data.forEach(item => {
      table.innerHTML += `
        <tr>
          <td>${item.title}</td>
          <td><a href="${item.pdfUrl}" target="_blank">View</a></td>
          <td>
            <button onclick="deleteMaterial('${item._id}')">Delete</button>
          </td>
        </tr>
      `;
    });
  });

function addMaterial() {
  fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      title: title.value,
      imageUrl: imageUrl.value,
      pdfUrl: pdfUrl.value,
      description: description.value
    })
  }).then(() => location.reload());
}

function deleteMaterial(id) {
  fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  }).then(() => location.reload());
}

function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

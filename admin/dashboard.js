const API = "https://studymaterial-1heb.onrender.com/api/materials";
const token = localStorage.getItem("adminToken");

/* 🔐 Auth Guard */
if (!token) {
  window.location.href = "login.html";
}

/* 📥 Load all materials */
/* 📥 Load all materials (PUBLIC API) */
function loadMaterials() {
  fetch(API)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load materials");
      }
      return res.json();
    })
    .then(data => {
      const table = document.getElementById("materialTable");
      table.innerHTML = "";

      if (!data.length) {
        table.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center;">No materials found</td>
          </tr>
        `;
        return;
      }

      data.forEach(item => {
        table.innerHTML += `
          <tr>
            <td>${item.title}</td>
            <td>${item.date || "-"}</td>
            <td>
              <a href="${item.pdfUrl}" target="_blank">View</a>
            </td>
            <td>
              <button class="action-btn edit"
                onclick="editMaterial('${item._id}', '${item.title.replace(/'/g, "\\'")}')">
                Edit
              </button>
              <button class="action-btn delete"
                onclick="deleteMaterial('${item._id}')">
                Delete
              </button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      console.error("Load error:", err);
      alert("Unable to load materials. Please refresh.");
    });
}


/* ➕ Add material */
function addMaterial() {
  if (!title.value || !pdfUrl.value) {
    alert("Title and PDF URL are required");
    return;
  }

  fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      title: title.value,
      date: date.value,
      description: description.value,
      pdfUrl: pdfUrl.value,
      imageUrl: imgUrl.value
    })
  })
    .then(res => res.json())
    .then(() => {
      alert("Material Added Successfully");
      clearForm();
      loadMaterials();
    })
    .catch(err => console.error("Add error:", err));
}

/* 🗑 Delete material */
function deleteMaterial(id) {
  if (!confirm("Are you sure you want to delete this material?")) return;

  fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
    .then(() => loadMaterials())
    .catch(err => console.error("Delete error:", err));
}

/* ✏️ Edit material (title only – simple & safe) */
function editMaterial(id, oldTitle) {
  const newTitle = prompt("Enter new title", oldTitle);
  if (!newTitle || newTitle === oldTitle) return;

  fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ title: newTitle })
  })
    .then(() => loadMaterials())
    .catch(err => console.error("Edit error:", err));
}

/* 🧹 Clear form */
function clearForm() {
  title.value = "";
  description.value = "";
  pdfUrl.value = "";
  imgUrl.value = "";
}

/* 🚪 Logout */
function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

/* 🚀 Init */
loadMaterials();


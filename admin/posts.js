const API = "https://studymaterial-1heb.onrender.com/api/posts";
const token = localStorage.getItem("adminToken");

/* 🔐 Auth Guard */


if (!token) {
  alert("Session expired. Please login again.");
  window.location.href = "login.html";
  throw new Error("No admin token found");
}


/* 📥 Load posts */
function loadPosts() {
  fetch(API)
    .then(res => res.json())
    .then(posts => {
      const table = document.getElementById("postTable");
      table.innerHTML = "";

      if (!posts.length) {
        table.innerHTML = `
          <tr>
            <td colspan="3" style="text-align:center;">No posts found</td>
          </tr>
        `;
        return;
      }

      posts.forEach(p => {
        table.innerHTML += `
          <tr>
            <td>${p.title}</td>
            <td>${p.status}</td>
            <td>
              <button class="action-btn edit"
                onclick="editPost('${p._id}', '${p.title.replace(/'/g, "\\'")}')">
                Edit
              </button>
              <button class="action-btn delete"
                onclick="deletePost('${p._id}')">
                Delete
              </button>
            </td>
          </tr>
        `;
      });
    });
}

/* ➕ Add Post */
function addPost() {
  if (!postTitle.value || !postContent.value) {
    alert("Title and Content are required");
    return;
  }

  fetch(API, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  },
  body: JSON.stringify({
    title: postTitle.value,
    excerpt: postExcerpt.value,
    content: postContent.value,
    status: postStatus.value
  })
})
  .then(res => {
    if (!res.ok) {
      throw new Error("Failed to add post");
    }
    return res.json();
  })
  .then(() => {
    alert("Post Added");
    clearPostForm();
    loadPosts();
  })
  .catch(err => {
    console.error(err);
    alert("Error adding post. Check console.");
  });

}

/* ✏️ Edit Post (title only for safety) */
function editPost(id, oldTitle) {
  const newTitle = prompt("Edit Post Title", oldTitle);
  if (!newTitle || newTitle === oldTitle) return;

  fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ title: newTitle })
  })
    .then(() => loadPosts());
}

/* 🗑 Delete Post */
function deletePost(id) {
  if (!confirm("Delete this post?")) return;

  fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
    .then(() => loadPosts());
}

/* 🧹 Clear */
function clearPostForm() {
  postTitle.value = "";
  postExcerpt.value = "";
  postContent.value = "";
}

/* 🚪 Logout */
function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

/* 🚀 Init */
loadPosts();

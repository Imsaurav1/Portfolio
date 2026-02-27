const API = "https://studymaterial-1heb.onrender.com/api";
const POSTS_API = `${API}/posts`;
const ADMIN_API = `${API}/admin/posts`; // ✅ Use admin route (includes drafts)

/* ================================
   🔐 AUTH GUARD
================================ */
const token = localStorage.getItem("adminToken");

if (!token) {
  alert("Session expired. Please login again.");
  window.location.href = "login.html";
  throw new Error("No admin token found");
}

/* ================================
   🔑 AUTH HEADERS HELPER
================================ */
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
});

/* ================================
   🔁 HANDLE EXPIRED TOKEN GLOBALLY
================================ */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);

  // Auto-logout on 401 (expired/invalid token)
  if (res.status === 401) {
    alert("Session expired. Please login again.");
    localStorage.removeItem("adminToken");
    window.location.href = "login.html";
    throw new Error("Unauthorized");
  }

  return res;
}

/* ================================
   📥 LOAD POSTS
================================ */
async function loadPosts() {
  const table = document.getElementById("postTable");
  table.innerHTML = `<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>`;

  try {
    const res = await apiFetch(ADMIN_API, {
      headers: authHeaders()
    });

    const data = await res.json();

    // ✅ Handle both paginated { posts: [] } and plain array responses
    const posts = Array.isArray(data) ? data : data.posts ?? [];

    table.innerHTML = "";

    if (!posts.length) {
      table.innerHTML = `<tr><td colspan="4" style="text-align:center;">No posts found</td></tr>`;
      return;
    }

    posts.forEach(p => {
      const tr = document.createElement("tr"); // ✅ Use DOM, not innerHTML (XSS safe)

      const titleTd = document.createElement("td");
      titleTd.textContent = p.title; // ✅ textContent prevents XSS

      const statusTd = document.createElement("td");
      statusTd.textContent = p.status;

      const viewsTd = document.createElement("td");
      viewsTd.textContent = p.views ?? 0;

      const actionTd = document.createElement("td");

      const editBtn = document.createElement("button");
      editBtn.className = "action-btn edit";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => editPost(p._id, p.title);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "action-btn delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deletePost(p._id, p.title);

      actionTd.append(editBtn, deleteBtn);
      tr.append(titleTd, statusTd, viewsTd, actionTd);
      table.appendChild(tr);
    });

  } catch (err) {
    if (err.message !== "Unauthorized") {
      console.error("Load posts error:", err);
      table.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Failed to load posts. Try refreshing.</td></tr>`;
    }
  }
}

/* ================================
   ➕ ADD POST
================================ */
async function addPost() {
  const titleEl   = document.getElementById("postTitle");
  const excerptEl = document.getElementById("postExcerpt");
  const contentEl = document.getElementById("postContent");
  const statusEl  = document.getElementById("postStatus");
  const tagsEl    = document.getElementById("postTags");
  const addBtn    = document.getElementById("addPostBtn");

  const title   = titleEl.value.trim();
  const content = contentEl.value.trim();

  if (!title || !content) {
    alert("Title and Content are required.");
    return;
  }

  const tags = tagsEl.value
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  // ✅ Disable button to prevent double submit
  if (addBtn) addBtn.disabled = true;

  try {
    const res = await apiFetch(POSTS_API, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title,
        excerpt: excerptEl.value.trim(),
        content,
        status: statusEl.value,
        tags
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to add post");
    }

    alert("✅ Post added successfully!");
    clearPostForm();
    loadPosts();

  } catch (err) {
    if (err.message !== "Unauthorized") {
      console.error("Add post error:", err);
      alert(`❌ Error: ${err.message}`);
    }
  } finally {
    if (addBtn) addBtn.disabled = false; // ✅ Always re-enable
  }
}

/* ================================
   ✏️ EDIT POST
   Full edit: title + status (not just title)
================================ */
async function editPost(id, currentTitle) {
  // ✅ Better than chained prompts — but works without a modal
  const newTitle = prompt("Edit Post Title:", currentTitle);
  if (!newTitle || newTitle.trim() === currentTitle.trim()) return;

  try {
    const res = await apiFetch(`${POSTS_API}/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ title: newTitle.trim() })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update post");
    }

    loadPosts();

  } catch (err) {
    if (err.message !== "Unauthorized") {
      console.error("Edit post error:", err);
      alert(`❌ Error: ${err.message}`);
    }
  }
}

/* ================================
   🗑 DELETE POST
================================ */
async function deletePost(id, title = "this post") {
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

  try {
    const res = await apiFetch(`${POSTS_API}/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to delete post");
    }

    loadPosts();

  } catch (err) {
    if (err.message !== "Unauthorized") {
      console.error("Delete post error:", err);
      alert(`❌ Error: ${err.message}`);
    }
  }
}

/* ================================
   🧹 CLEAR FORM
================================ */
function clearPostForm() {
  ["postTitle", "postExcerpt", "postContent", "postTags"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const statusEl = document.getElementById("postStatus");
  if (statusEl) statusEl.value = "published"; // Reset to default
}

/* ================================
   🚪 LOGOUT
================================ */
function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

/* ================================
   🚀 INIT
================================ */
loadPosts();
/*********************************
 * CONFIG
 *********************************/
const API      = "https://studymaterial-1heb.onrender.com/api";
const POSTS    = `${API}/posts`;
const ADMIN_POSTS = `${API}/admin/posts`; // ✅ Use admin route — includes drafts

/*********************************
 * AUTH GUARD
 *********************************/
const token = localStorage.getItem("adminToken");

if (!token) {
  alert("Session expired. Please login again.");
  window.location.href = "login.html";
  throw new Error("No admin token found");
}

/*********************************
 * ELEMENT REFS
 * ✅ Fixed: was using bare variable names like `postTitle`
 *    which only work if the element has a global `name` attr.
 *    Always use getElementById for reliability.
 *********************************/
const postTitleEl   = document.getElementById("postTitle");
const postExcerptEl = document.getElementById("postExcerpt");
const postContentEl = document.getElementById("postContent");
const postStatusEl  = document.getElementById("postStatus");
const postTagsEl    = document.getElementById("postTags");

/*********************************
 * LOAD POSTS
 * ✅ Fixed: was calling public /api/posts which returns
 *    { posts: [], pagination: {} } — not a plain array.
 *    Now uses /api/admin/posts with auth token so drafts
 *    are also visible, and handles paginated response correctly.
 *********************************/
function loadPosts() {
  const table = document.getElementById("postTable");
  table.innerHTML = `<tr><td colspan="4" style="text-align:center;">Loading…</td></tr>`;

  fetch(ADMIN_POSTS, {
    headers: { "Authorization": "Bearer " + token }
  })
    .then(res => {
      if (res.status === 401) {
        alert("Session expired. Please login again.");
        window.location.href = "login.html";
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    })
    .then(data => {
      // ✅ Fixed: handle paginated response shape { posts: [], pagination: {} }
      const posts = Array.isArray(data) ? data : data.posts ?? [];

      table.innerHTML = "";

      if (!posts.length) {
        table.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center;">No posts found</td>
          </tr>`;
        return;
      }

      // ✅ Fixed: use createElement instead of innerHTML += to avoid XSS
      //    and avoid the known performance issue of re-parsing the entire
      //    table on every iteration.
      const fragment = document.createDocumentFragment();

      posts.forEach(p => {
        const tr = document.createElement("tr");

        // Title cell
        const tdTitle = document.createElement("td");
        tdTitle.textContent = p.title; // ✅ textContent, never innerHTML for user data

        // Status cell
        const tdStatus = document.createElement("td");
        tdStatus.textContent = p.status;

        // Views cell
        const tdViews = document.createElement("td");
        tdViews.textContent = `👁️ ${p.views ?? 0}`;

        // Actions cell
        const tdActions = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.className = "action-btn edit";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => editPost(p._id, p.title));

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "action-btn delete";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deletePost(p._id, deleteBtn));

        tdActions.append(editBtn, deleteBtn);
        tr.append(tdTitle, tdStatus, tdViews, tdActions);
        fragment.appendChild(tr);
      });

      table.appendChild(fragment);
    })
    .catch(err => {
      if (err.message === "Unauthorized") return; // Already redirected
      console.error("loadPosts error:", err);
      table.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Failed to load posts</td></tr>`;
    });
}

/*********************************
 * ADD POST
 * ✅ Fixed: element refs, missing tags clear on reset,
 *    added loading state on button during fetch
 *********************************/
function addPost() {
  if (!postTitleEl.value.trim() || !postContentEl.value.trim()) {
    alert("Title and Content are required");
    return;
  }

  // Parse comma-separated tags into a clean array
  const tags = postTagsEl.value
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const addBtn = document.getElementById("addPostBtn");
  if (addBtn) { addBtn.disabled = true; addBtn.textContent = "Saving…"; }

  fetch(POSTS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      title:   postTitleEl.value.trim(),
      excerpt: postExcerptEl.value.trim(),
      content: postContentEl.value.trim(),
      status:  postStatusEl.value,
      tags
    })
  })
    .then(res => {
      if (!res.ok) throw new Error(`Failed to add post: ${res.status}`);
      return res.json();
    })
    .then(() => {
      alert("✅ Post added successfully!");
      clearPostForm();
      loadPosts();
    })
    .catch(err => {
      console.error("addPost error:", err);
      alert("❌ Error adding post. Check console.");
    })
    .finally(() => {
      if (addBtn) { addBtn.disabled = false; addBtn.textContent = "Add Post"; }
    });
}

/*********************************
 * EDIT POST
 * ✅ Fixed: was using inline onclick with fragile string escaping.
 *    Now uses addEventListener (set in loadPosts above).
 *    Still prompt-based for title — extend this to a modal if needed.
 *********************************/
function editPost(id, currentTitle) {
  const newTitle = prompt("Edit Post Title:", currentTitle);
  if (!newTitle || newTitle.trim() === currentTitle.trim()) return;

  fetch(`${POSTS}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ title: newTitle.trim() })
  })
    .then(res => {
      if (!res.ok) throw new Error(`Failed to update post: ${res.status}`);
      return res.json();
    })
    .then(() => {
      loadPosts();
    })
    .catch(err => {
      console.error("editPost error:", err);
      alert("❌ Failed to update post. Check console.");
    });
}

/*********************************
 * DELETE POST
 * ✅ Fixed: added error handling + visual feedback on button
 *********************************/
function deletePost(id, btn) {
  if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;

  if (btn) { btn.disabled = true; btn.textContent = "Deleting…"; }

  fetch(`${POSTS}/${id}`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) throw new Error(`Failed to delete post: ${res.status}`);
      return res.json();
    })
    .then(() => {
      loadPosts();
    })
    .catch(err => {
      console.error("deletePost error:", err);
      alert("❌ Failed to delete post. Check console.");
      if (btn) { btn.disabled = false; btn.textContent = "Delete"; }
    });
}

/*********************************
 * CLEAR FORM
 * ✅ Fixed: now also clears tags field
 *********************************/
function clearPostForm() {
  postTitleEl.value   = "";
  postExcerptEl.value = "";
  postContentEl.value = "";
  postTagsEl.value    = "";
  if (postStatusEl) postStatusEl.value = "published"; // Reset to default
}

/*********************************
 * LOGOUT
 *********************************/
function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

/*********************************
 * INIT
 *********************************/
loadPosts();
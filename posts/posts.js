const API_BASE = "https://studymaterial-1heb.onrender.com/api";

/* ============================
   POSTS LIST PAGE
============================ */
if (document.getElementById("postsContainer")) {
  fetch(`${API_BASE}/posts`)
    .then(res => res.json())
    .then(posts => {
      const container = document.getElementById("postsContainer");
      container.innerHTML = "";

      if (!posts.length) {
        container.innerHTML = "<p>No posts available.</p>";
        return;
      }

      posts.forEach(post => {
        container.innerHTML += `
          <div class="post-card">
            <h2>
              <a href="post.html?slug=${post.slug}">
                ${post.title}
              </a>
            </h2>
            <div class="meta">
              ${new Date(post.createdAt).toDateString()}
            </div>
            <p>${post.excerpt || ""}</p>
          </div>
        `;
      });
    })
    .catch(() => {
      document.getElementById("postsContainer").innerHTML =
        "<p>Failed to load posts.</p>";
    });
}

/* ============================
   SINGLE POST PAGE
============================ */
if (document.getElementById("postContainer")) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    document.getElementById("postContainer").innerHTML =
      "<p>Post not found.</p>";
  } else {
    fetch(`${API_BASE}/posts/${slug}`)
      .then(res => res.json())
      .then(post => {
        document.getElementById("pageTitle").innerText =
          post.title + " | SaurabhJha.live";

        document.getElementById("metaDesc").content =
          post.excerpt || post.title;

        document.getElementById("postContainer").innerHTML = `
          <h1>${post.title}</h1>
          <div class="meta">
            By ${post.author || "Saurabh Jha"} • 
            ${new Date(post.createdAt).toDateString()}
          </div>
          <hr>
          ${post.content}
        `;
      })
      .catch(() => {
        document.getElementById("postContainer").innerHTML =
          "<p>Unable to load post.</p>";
      });
  }
}

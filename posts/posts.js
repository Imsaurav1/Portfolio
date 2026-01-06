const API_BASE = "https://studymaterial-1heb.onrender.com/"; 
// change if backend domain is different

// ------------------------------
// POSTS LIST PAGE
// ------------------------------
if (window.location.pathname.endsWith("/posts/") || 
    window.location.pathname.endsWith("/posts/index.html")) {

  fetch(`${API_BASE}/api/posts`)
    .then(res => res.json())
    .then(posts => {
      const container = document.getElementById("posts-container");
      container.innerHTML = "";

      posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post-card";

        div.innerHTML = `
          <h2>
            <a href="/posts/post.html?slug=${post.slug}">
              ${post.title}
            </a>
          </h2>
          <p>${post.excerpt || ""}</p>
          <small>Published on ${new Date(post.createdAt).toDateString()}</small>
        `;

        container.appendChild(div);
      });
    })
    .catch(() => {
      document.getElementById("posts-container").innerHTML =
        "<p>Failed to load posts.</p>";
    });
}

// ------------------------------
// SINGLE POST PAGE
// ------------------------------
if (window.location.pathname.includes("post.html")) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    document.getElementById("post-container").innerHTML =
      "<p>Post not found.</p>";
  } else {
    fetch(`${API_BASE}/api/posts/${slug}`)
      .then(res => res.json())
      .then(post => {
        document.getElementById("page-title").innerText =
          post.title + " | SaurabhJha.live";

        document.getElementById("meta-description").content =
          post.excerpt || post.title;

        document.getElementById("post-container").innerHTML = `
          <h1>${post.title}</h1>
          <p>
            <strong>${post.author}</strong> • 
            ${new Date(post.createdAt).toDateString()}
          </p>
          <hr>
          ${post.content}
        `;
      })
      .catch(() => {
        document.getElementById("post-container").innerHTML =
          "<p>Unable to load post.</p>";
      });
  }
}

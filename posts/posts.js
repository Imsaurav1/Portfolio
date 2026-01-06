/*************************************************
 * CONFIG
 *************************************************/
const API_BASE = "https://studymaterial-1heb.onrender.com/api";

/*************************************************
 * POSTS LIST PAGE  →  /posts
 *************************************************/
(function loadPostsList() {
  const container = document.getElementById("postsContainer");
  if (!container) return; // not on list page

  fetch(`${API_BASE}/posts`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    })
    .then(posts => {
      container.innerHTML = "";

      if (!Array.isArray(posts) || posts.length === 0) {
        container.innerHTML = "<p>No posts available.</p>";
        return;
      }

      posts.forEach(post => {
        container.innerHTML += `
          <div class="post-card">
            <h2>
              <a href="/posts/${post.slug}">
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
    .catch(err => {
      console.error("Post list error:", err);
      container.innerHTML = "<p>Failed to load posts.</p>";
    });
})();

/*************************************************
 * SINGLE POST PAGE  →  /posts/:slug
 *************************************************/
(function loadSinglePost() {
  const container = document.getElementById("postContainer");
  if (!container) return; // not on single post page

  /* Extract slug from URL
     Example URL:
     https://saurabhjha.live/posts/infosys-specialist-programmer-interview-experience
  */
  const path = window.location.pathname;

  // Remove "/posts/" from path
  const slug = path.startsWith("/posts/")
    ? path.replace("/posts/", "").replace("/", "")
    : null;

  if (!slug) {
    container.innerHTML = "<p>Post not found.</p>";
    return;
  }

  fetch(`${API_BASE}/posts/${slug}`)
    .then(res => {
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    })
    .then(post => {
      // SEO
      const titleEl = document.getElementById("pageTitle");
      if (titleEl) {
        titleEl.innerText = `${post.title} | SaurabhJha.live`;
      }

      const metaDesc = document.getElementById("metaDesc");
      if (metaDesc) {
        metaDesc.content = post.excerpt || post.title;
      }

      // Render post
      container.innerHTML = `
        <h1>${post.title}</h1>
        <div class="meta">
          By ${post.author || "Saurabh Jha"} •
          ${new Date(post.createdAt).toDateString()}
        </div>
        <hr>
        ${post.content}
      `;
    })
    .catch(err => {
      console.error("Single post error:", err);
      container.innerHTML = "<p>Unable to load post.</p>";
    });
})();

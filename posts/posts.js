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
  if (!container) return;

  /*
    Valid URLs:
    /posts/my-slug
    NOT:
    /posts
    /posts/
    /posts/posts.html
  */

  const path = window.location.pathname;

  let slug = null;

  if (path.startsWith("/posts/")) {
    slug = path.replace("/posts/", "").replace("/", "");
  }

  // ❌ Block invalid slug
  if (!slug || slug === "posts.html" || slug === "index.html") {
    container.innerHTML = "<p>Post not found.</p>";
    return;
  }

  fetch(`${API_BASE}/posts/${slug}`)
    .then(res => {
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    })
    .then(post => {
      document.getElementById("pageTitle").innerText =
        `${post.title} | SaurabhJha.live`;

      document.getElementById("metaDesc").content =
        post.excerpt || post.title;

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
      container.innerHTML = "<p>Post not found.</p>";
    });
})();

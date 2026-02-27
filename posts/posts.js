/*************************************************
 * CONFIG
 *************************************************/
const API_BASE = "https://studymaterial-1heb.onrender.com/api";

/*************************************************
 * HELPERS
 *************************************************/

/**
 * Safely escape a string for use inside HTML.
 * Prevents XSS from untrusted API data like titles, authors, tags.
 */
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Format a date string safely — falls back to empty string if invalid.
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? "" : date.toDateString();
}

/*************************************************
 * POSTS LIST PAGE  →  /posts
 *************************************************/
(function loadPostsList() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  // Show loading state
  container.innerHTML = "<p>Loading posts…</p>";

  fetch(`${API_BASE}/posts`)
    .then(res => {
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    })
    .then(data => {
      // ✅ Handle both plain array and paginated { posts: [] } response
      const posts = Array.isArray(data) ? data : data.posts ?? [];

      container.innerHTML = "";

      if (!posts.length) {
        container.innerHTML = "<p>No posts available.</p>";
        return;
      }

      // ✅ Build DOM nodes instead of innerHTML to avoid XSS on title/excerpt
      const fragment = document.createDocumentFragment();

      posts.forEach(post => {
        const card = document.createElement("div");
        card.className = "post-card";

        // Title link — slug in href is safe (URL-encoded), title uses textContent
        const h2 = document.createElement("h2");
        const a  = document.createElement("a");
        a.href        = `/posts/${encodeURIComponent(post.slug)}`;
        a.textContent = post.title; // ✅ textContent, never innerHTML

        // Meta
        const meta = document.createElement("div");
        meta.className   = "meta";
        meta.textContent = formatDate(post.createdAt);

        // Excerpt — plain text only, no HTML rendering
        const excerpt = document.createElement("p");
        excerpt.textContent = post.excerpt || "";

        h2.appendChild(a);
        card.append(h2, meta, excerpt);
        fragment.appendChild(card);
      });

      container.appendChild(fragment);
    })
    .catch(err => {
      console.error("Post list error:", err);
      container.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
    });
})();

/*************************************************
 * SINGLE POST PAGE  →  /posts/:slug
 *************************************************/
(function loadSinglePost() {
  const container = document.getElementById("postContainer");
  if (!container) return;

  // ✅ Robust slug extraction — works for /posts/my-slug and /posts/my-slug/
  const pathParts = window.location.pathname
    .split("/")
    .filter(Boolean); // removes empty strings from leading/trailing slashes

  // Expect: ["posts", "my-slug"]
  const slug = pathParts[0] === "posts" && pathParts[1]
    ? pathParts[1]
    : null;

  if (!slug) {
    container.innerHTML = "<p>Post not found.</p>";
    return;
  }

  // Show loading state
  container.innerHTML = "<p>Loading post…</p>";

  // ✅ COUNT VIEW (once per browser session using sessionStorage, not localStorage)
  // Using sessionStorage: counts once per tab session, not permanently forever
  const viewKey = `viewed_${slug}`;
  if (!sessionStorage.getItem(viewKey)) {
    fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}/view`, { method: "POST" })
      .then(() => sessionStorage.setItem(viewKey, "true"))
      .catch(() => {}); // Silent — view count is non-critical
  }

  // ✅ FETCH POST DATA
  fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`)
    .then(res => {
      if (res.status === 404) throw new Error("not_found");
      if (!res.ok) throw new Error(`server_error_${res.status}`);
      return res.json();
    })
    .then(post => {

      // ── SEO ──────────────────────────────────────────────
      const pageTitle = document.getElementById("pageTitle");
      if (pageTitle) {
        pageTitle.textContent = `${post.title} | SaurabhJha.live`;
      }

      const metaDesc = document.getElementById("metaDesc");
      if (metaDesc) {
        // ✅ Use setAttribute, not .content = ... for safety
        metaDesc.setAttribute("content", post.excerpt || post.title);
      }

      // ── BUILD DOM (safe, no XSS) ─────────────────────────
      container.innerHTML = ""; // Clear loading state

      // Title
      const h1 = document.createElement("h1");
      h1.textContent = post.title;

      // Meta line
      const meta = document.createElement("div");
      meta.className   = "meta";
      meta.textContent = [
        `By ${post.author || "Saurabh Jha"}`,
        formatDate(post.createdAt),
        `👁️ ${post.views ?? 0} views`
      ].join(" • ");

      // Tags
      const tagsEl = document.createElement("div");
      if (post.tags && post.tags.length > 0) {
        tagsEl.className = "tags";
        post.tags.forEach(tag => {
          const span = document.createElement("span");
          span.textContent = `#${tag}`; // ✅ textContent, not innerHTML
          tagsEl.appendChild(span);
        });
      }

      const hr = document.createElement("hr");

      // ✅ Post content: This is the ONE place where innerHTML is intentional —
      // your content is HTML authored by you (the admin), not user-submitted data.
      // If you ever allow user-submitted content, sanitize with DOMPurify first.
      const contentEl = document.createElement("div");
      contentEl.className = "post-content";
      contentEl.innerHTML = post.content;

      container.append(h1, meta, tagsEl, hr, contentEl);
    })
    .catch(err => {
      console.error("Single post error:", err);
      const msg = err.message === "not_found"
        ? "Post not found."
        : "Failed to load post. Please try again later.";
      container.innerHTML = `<p>${msg}</p>`;
    });
})();
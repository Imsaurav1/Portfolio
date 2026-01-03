const pageUrl = window.location.pathname;
const pageTitle = document.title;

// Submit comment
document.getElementById('commentForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const comment = document.getElementById('comment').value.trim();

  if (!name || !comment) {
    alert('Please fill all fields');
    return;
  }

  fetch('https://commnets.onrender.com/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      comment,
      pageUrl,
      pageTitle
    })
  })
    .then(() => {
      loadComments();
      document.getElementById('commentForm').reset();
    })
    .catch(err => console.error(err));
});

// Load comments (by pageTitle)
function loadComments() {
  fetch(
    `https://commnets.onrender.com/comments?pageTitle=${encodeURIComponent(pageTitle)}`
  )
    .then(res => res.json())
    .then(comments => {
      const list = document.getElementById('commentList');
      list.innerHTML = '';

      if (!comments.length) {
        list.innerHTML = '<p>No comments yet.</p>';
        return;
      }

      comments.forEach(c => {
        let time = 'Just now';

        if (c.createdAt) {
          const d = new Date(c.createdAt);
          if (!isNaN(d)) time = d.toLocaleString();
        }

        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `
          <h4>${c.name}</h4>
          <p>${c.comment}</p>
          <small>🕒 ${time}</small>
        `;
        list.appendChild(div);
      });
    })
    .catch(err => console.error(err));
}

window.onload = loadComments;

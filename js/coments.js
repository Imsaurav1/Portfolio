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
    .then(res => res.json())
    .then(data => {
      console.log('Comment posted:', data);
      loadComments(); // Reload after posting
      document.getElementById('commentForm').reset();
    })
    .catch(err => {
      console.error('Error posting comment:', err);
      alert('Failed to post comment');
    });
});

// Load comments (by pageTitle)
function loadComments() {
  const queryParam = encodeURIComponent(pageTitle);
  console.log('Fetching comments for page:', pageTitle);
  
  fetch(`https://commnets.onrender.com/comments?pageTitle=${queryParam}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(comments => {
      console.log('Comments received:', comments);
      const list = document.getElementById('commentList');
      list.innerHTML = '';

      if (!comments || comments.length === 0) {
        list.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
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
    .catch(err => {
      console.error('Error loading comments:', err);
      document.getElementById('commentList').innerHTML = 
        '<p style="color: red;">Error loading comments. Please refresh the page.</p>';
    });
}

// Load comments when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadComments();
  
  // Optional: Auto-refresh comments every 5 seconds
  // setInterval(loadComments, 5000);
});
// Submit comment
document.getElementById('commentForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const name = document.getElementById('name').value;
    const comment = document.getElementById('comment').value;
  
    if (!name || !comment) {
      alert('Please fill out both fields');
      return;
    }
  
    const commentData = {
      name: name,
      comment: comment,
    };
  
    fetch('https://commnets.onrender.com/comments', { // Update with your backend API
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    })
    .then(response => response.json())
    .then(data => {
      loadComments(); // Reload comments after submission
      document.getElementById('commentForm').reset();  // Clear the form
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });
  
  // Load comments
  function loadComments() {
    fetch('https://commnets.onrender.com/comments') // Fetch comments from your backend
      .then(response => response.json())
      .then(comments => {
        const commentList = document.getElementById('commentList');
        commentList.innerHTML = ''; // Clear previous comments
  
        comments.forEach(comment => {
          const commentDiv = document.createElement('div');
          commentDiv.classList.add('comment');
          commentDiv.innerHTML = `
            <h4>${comment.name}</h4>
            <p>${comment.comment}</p>
          `;
          commentList.appendChild(commentDiv);
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
  // Load comments on page load
  window.onload = loadComments;
  
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var fullName = document.getElementById('fullName').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    var subject = document.getElementById('subject').value;
    var message = document.getElementById('message').value;

    // Basic validation
    if (!fullName || !email || !phone || !subject || !message) {
        alert("All fields must be filled out.");
        return;
    }

    // Email validation
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    Email.send({
        SecureToken: "a4d476b6-e6cf-4a95-8f52-e13894195cec",
        
        To: 'bt21eee036@gmail.com',
        From: 'bt21eee036@gmail.com',
        Subject: ' ${subject}',
        Body: `<b>Name:</b> ${fullName} <br>
               <b>Email:</b> ${email} <br>
               <b>Phone:</b> ${phone} <br>
               <b>Message:</b> <br>${message}`
    }).then(
        response => {
            Swal.fire({
            icon: 'success',
            title: 'Message Sent',
            text: 'Your message has been sent successfully!'

        })

        document.getElementById('contactForm').reset();
    }
    ).catch(
        error => Swal.fire({
            icon: 'error',
            title: 'Failed to Send',
            text: 'Failed to send message. Please try again later.'
        })
    );
});

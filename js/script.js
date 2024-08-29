const form = document.getElementById('contactForm')
const formStatus = document.getElementById('formStatus')

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const recaptchaResponse = grecaptcha.getResponse();

    if (recaptchaResponse.length === 0) {
        formStatus.textContent = 'Please complete the reCAPTCHA.';
        return;
    }

    const formData = new FormData(event.target);
    const params = new URLSearchParams(formData);

    fetch('/submit', {
        method: "POST",
        body: params
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sendMessage(formData);
        } else {
            setStatusMessage('reCAPTCHA verification failed. Please try again.');
        }
    })
    .catch(error => {
        setStatusMessage('There was a problem submitting your form.');
        console.error(error);
    });

});

function sendMessage(formData) {
    fetch("https://formspree.io/f/mqkryedn", {
        method: "POST",
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            setStatusMessage("Thanks for your submission!");
            form.reset();
        } else {
            response.json().then(data => {
                if (Object.hasOwn(data, 'errors')) {
                    setStatusMessage(data["errors"].map(error => error["message"]).join(", "))
                } else {
                    setStatusMessage("There was a problem submitting your form.")
                }
            });
        }
    })
    .catch((error) => {
        setStatusMessage("There was a problem submitting your form.");
        console.error(error);
    });
}

// Set the status message for the form and remove it after 3 seconds
function setStatusMessage(content) {
    formStatus.textContent = content;
    setTimeout(() => {
        document.getElementById("formStatus").innerHTML = ""
    }, 3000);
}
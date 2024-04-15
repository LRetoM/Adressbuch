document.addEventListener('DOMContentLoaded', function() {
    const newContactForm = document.getElementById('newContactForm') as HTMLFormElement;
    newContactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const first_name = (document.getElementById('first_name') as HTMLInputElement).value;
        const last_name = (document.getElementById('last_name') as HTMLInputElement).value;
        const city = (document.getElementById('city') as HTMLInputElement).value;
        const street = (document.getElementById('street') as HTMLInputElement).value;
        const house_number = (document.getElementById('house_number') as HTMLInputElement).value;
        const phone_number = (document.getElementById('phone_number') as HTMLInputElement).value;

        const newContact = {
            first_name,
            last_name,
            city,
            street,
            house_number,
            phone_number
        };

        fetch('/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newContact),
        })
        .then(response => {
            if (!response.ok) {
                // Wenn die Antwort nicht ok ist, wird das JSON verarbeitet und ein Fehler geworfen
                return response.json().then(data => Promise.reject(new Error(data.error)));
            }
            return response.json();
        })
        .then(data => {
            alert('Kontakt hinzugefügt!');
            newContactForm.reset();
        })
        .catch(error => {
            console.error('Fehler beim Hinzufügen des Kontakts:', error);
            alert(error.message);
        });
    });
});

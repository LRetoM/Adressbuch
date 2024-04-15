document.addEventListener('DOMContentLoaded', function () {
    var newContactForm = document.getElementById('newContactForm');
    newContactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var first_name = document.getElementById('first_name').value;
        var last_name = document.getElementById('last_name').value;
        var city = document.getElementById('city').value;
        var street = document.getElementById('street').value;
        var house_number = document.getElementById('house_number').value;
        var phone_number = document.getElementById('phone_number').value;
        var newContact = {
            first_name: first_name,
            last_name: last_name,
            city: city,
            street: street,
            house_number: house_number,
            phone_number: phone_number
        };
        fetch('/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newContact),
        })
            .then(function (response) {
            if (!response.ok) {
                // Wenn die Antwort nicht ok ist, wird das JSON verarbeitet und ein Fehler geworfen
                return response.json().then(function (data) { return Promise.reject(new Error(data.error)); });
            }
            return response.json();
        })
            .then(function (data) {
            alert('Kontakt hinzugefügt!');
            newContactForm.reset();
        })
            .catch(function (error) {
            console.error('Fehler beim Hinzufügen des Kontakts:', error);
            alert(error.message);
        });
    });
});

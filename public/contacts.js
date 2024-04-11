document.addEventListener('DOMContentLoaded', function() {
    function addContactToTable(contact) {
        const tableBody = document.getElementById('contactsTable').getElementsByTagName('tbody')[0];
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${contact.id}</td>
            <td contenteditable="true" data-field="first_name">${contact.first_name}</td>
            <td contenteditable="true" data-field="last_name">${contact.last_name}</td>
            <td contenteditable="true" data-field="city">${contact.city}</td>
            <td contenteditable="true" data-field="street">${contact.street}</td>
            <td contenteditable="true" data-field="house_number">${contact.house_number}</td>
            <td contenteditable="true" data-field="phone_number">${contact.phone_number}</td>
            <td>
                <button class="saveEdit" data-id="${contact.id}">Speichern</button>
                <button class="deleteContact" data-id="${contact.id}">Löschen</button>
            </td>
        `;
        tableBody.appendChild(row);
    }

    document.getElementById('contactsTable').addEventListener('click', function(event) {
        const contactId = event.target.dataset.id;

        if (event.target.className === 'deleteContact') {
            if (confirm('Möchten Sie diesen Kontakt wirklich löschen?')) {
                fetch(`/contacts/${contactId}`, {
                    method: 'DELETE',
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Kontakt gelöscht') {
                        event.target.closest('tr').remove();
                    } else {
                        alert('Es gab ein Problem beim Löschen des Kontakts.');
                    }
                })
                .catch(error => console.error('Fehler:', error));
            }
        } else if (event.target.className === 'saveEdit') {
            const updatedContact = {
                first_name: event.target.closest('tr').querySelector('[data-field="first_name"]').textContent,
                last_name: event.target.closest('tr').querySelector('[data-field="last_name"]').textContent,
                city: event.target.closest('tr').querySelector('[data-field="city"]').textContent,
                street: event.target.closest('tr').querySelector('[data-field="street"]').textContent,
                house_number: event.target.closest('tr').querySelector('[data-field="house_number"]').textContent,
                phone_number: event.target.closest('tr').querySelector('[data-field="phone_number"]').textContent
            };

            fetch(`/contacts/${contactId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedContact)
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Kontakt aktualisiert') {
                    alert('Kontakt aktualisiert!');
                } else {
                    alert('Es gab ein Problem beim Aktualisieren des Kontakts.');
                }
            })
            .catch(error => console.error('Fehler:', error));
        }
    });

    fetch('/contacts')
    .then(response => response.json())
    .then(data => {
        data.forEach(contact => addContactToTable(contact));
    })
    .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
});

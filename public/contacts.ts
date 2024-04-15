document.addEventListener('DOMContentLoaded', function() {
    function addContactToTable(contact: {
        id: number,
        first_name: string,
        last_name: string,
        city: string,
        street: string,
        house_number: string,
        phone_number: string
    }) {
        const tableBody = document.getElementById('contactsTable')?.getElementsByTagName('tbody')[0];
        if (!tableBody) return; // Abbrechen, wenn tableBody null ist
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

    document.getElementById('contactsTable')?.addEventListener('click', function(event) {
        const target = event.target as HTMLElement;
        const contactId = target.dataset.id;

        if (!contactId) return;

        if (target instanceof HTMLButtonElement) {
            if (target.classList.contains('deleteContact')) {
                if (confirm('Möchten Sie diesen Kontakt wirklich löschen?')) {
                    fetch(`/contacts/${contactId}`, {
                        method: 'DELETE',
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message === 'Kontakt gelöscht') {
                            target.closest('tr')?.remove();
                        } else {
                            alert('Es gab ein Problem beim Löschen des Kontakts.');
                        }
                    })
                    .catch(error => console.error('Fehler:', error));
                }
            } else if (target.classList.contains('saveEdit')) {
                const updatedContact = {
                    first_name: target.closest('tr')?.querySelector('[data-field="first_name"]')?.textContent,
                    last_name: target.closest('tr')?.querySelector('[data-field="last_name"]')?.textContent,
                    city: target.closest('tr')?.querySelector('[data-field="city"]')?.textContent,
                    street: target.closest('tr')?.querySelector('[data-field="street"]')?.textContent,
                    house_number: target.closest('tr')?.querySelector('[data-field="house_number"]')?.textContent,
                    phone_number: target.closest('tr')?.querySelector('[data-field="phone_number"]')?.textContent
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
        }
    });

    fetch('/contacts')
    .then(response => response.json())
    .then((data: Array<{
        id: number,
        first_name: string,
        last_name: string,
        city: string,
        street: string,
        house_number: string,
        phone_number: string
    }>) => {
        data.forEach(contact => addContactToTable(contact));
    })
    .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
});

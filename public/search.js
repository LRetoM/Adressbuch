document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const searchValues = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            city: document.getElementById('city').value,
            street: document.getElementById('street').value,
            house_number: document.getElementById('house_number').value,
            phone_number: document.getElementById('phone_number').value
        };
        const queryString = Object.entries(searchValues)
            .filter(([_, value]) => value.trim() !== '')
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        fetch(`/search?${queryString}`)
            .then(response => response.json())
            .then(displaySearchResults)
            .catch(error => console.error('Fehler bei der Suchanfrage:', error));
    });
});

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Keine Kontakte gefunden.</p>';
        return;
    }
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Vorname</th>
                <th>Nachname</th>
                <th>Stadt</th>
                <th>Straße</th>
                <th>Hausnummer</th>
                <th>Telefonnummer</th>
                <th>Aktionen</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');
    results.forEach(contact => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${contact.id}</td>
            <td contenteditable="true" data-field="first_name">${contact.first_name}</td>
            <td contenteditable="true" data-field="last_name">${contact.last_name}</td>
            <td contenteditable="true" data-field="city">${contact.city}</td>
            <td contenteditable="true" data-field="street">${contact.street}</td>
            <td contenteditable="true" data-field="house_number">${contact.house_number}</td>
            <td contenteditable="true" data-field="phone_number">${contact.phone_number}</td>
            <td>
                <button class="saveEdit" data-contact-id="${contact.id}">Speichern</button>
                <button class="deleteContact" data-contact-id="${contact.id}">X</button>
            </td>
        `;
    });
    resultsContainer.appendChild(table);
    addListenersToButtons();
}

function addListenersToButtons() {
    document.querySelectorAll('.deleteContact').forEach(button => {
        button.addEventListener('click', function(event) {
            const contactId = event.target.dataset.contactId;
            if (confirm('Möchten Sie diesen Kontakt wirklich löschen?')) {
                fetch(`/contacts/${contactId}`, { method: 'DELETE' })
                    .then(response => {
                        if (!response.ok) throw new Error('Löschen fehlgeschlagen');
                        return response.json();
                    })
                    .then(data => {
                        if (data.message === 'Kontakt gelöscht') {
                            event.target.closest('tr').remove();
                        } else {
                            alert('Es gab ein Problem beim Löschen des Kontakts.');
                        }
                    })
                    .catch(error => alert(error.message));
            }
        });
    });

    document.querySelectorAll('.saveEdit').forEach(button => {
        button.addEventListener('click', function(event) {
            const contactId = event.target.dataset.contactId;
            const row = event.target.closest('tr');
            const updatedContact = {
                first_name: row.cells[1].innerText,
                last_name: row.cells[2].innerText,
                city: row.cells[3].innerText,
                street: row.cells[4].innerText,
                house_number: row.cells[5].innerText,
                phone_number: row.cells[6].innerText
            };
            fetch(`/contacts/${contactId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedContact)
            })
            .then(response => {
                if (!response.ok) throw new Error('Aktualisierung fehlgeschlagen');
                return response.json();
            })
            .then(data => {
                if (data.message === 'Kontakt aktualisiert') {
                    alert('Kontakt aktualisiert!');
                } else {
                    throw new Error('Aktualisierung fehlgeschlagen');
                }
            })
            .catch(error => alert(error.message));
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var searchValues = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            city: document.getElementById('city').value,
            street: document.getElementById('street').value,
            house_number: document.getElementById('house_number').value,
            phone_number: document.getElementById('phone_number').value
        };
        var queryString = Object.entries(searchValues)
            .filter(function (_a) {
            var _ = _a[0], value = _a[1];
            return value.trim() !== '';
        })
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value));
        })
            .join('&');
        fetch("/search?".concat(queryString))
            .then(function (response) { return response.json(); })
            .then(displaySearchResults)
            .catch(function (error) { return console.error('Fehler bei der Suchanfrage:', error); });
    });
});
function displaySearchResults(results) {
    var resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer)
        return;
    resultsContainer.innerHTML = '';
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Keine Kontakte gefunden.</p>';
        return;
    }
    var table = document.createElement('table');
    table.innerHTML = "\n        <thead>\n            <tr>\n                <th>ID</th>\n                <th>Vorname</th>\n                <th>Nachname</th>\n                <th>Stadt</th>\n                <th>Stra\u00DFe</th>\n                <th>Hausnummer</th>\n                <th>Telefonnummer</th>\n                <th>Aktionen</th>\n            </tr>\n        </thead>\n        <tbody>\n        </tbody>\n    ";
    var tbody = table.querySelector('tbody');
    if (!tbody)
        return;
    results.forEach(function (contact) {
        var row = tbody.insertRow();
        row.innerHTML = "\n            <td>".concat(contact.id, "</td>\n            <td contenteditable=\"true\" data-field=\"first_name\">").concat(contact.first_name, "</td>\n            <td contenteditable=\"true\" data-field=\"last_name\">").concat(contact.last_name, "</td>\n            <td contenteditable=\"true\" data-field=\"city\">").concat(contact.city, "</td>\n            <td contenteditable=\"true\" data-field=\"street\">").concat(contact.street, "</td>\n            <td contenteditable=\"true\" data-field=\"house_number\">").concat(contact.house_number, "</td>\n            <td contenteditable=\"true\" data-field=\"phone_number\">").concat(contact.phone_number, "</td>\n            <td>\n                <button class=\"saveEdit\" data-contact-id=\"").concat(contact.id, "\">Speichern</button>\n                <button class=\"deleteContact\" data-contact-id=\"").concat(contact.id, "\">X</button>\n            </td>\n        ");
    });
    resultsContainer.appendChild(table);
    addListenersToButtons();
}
function addListenersToButtons() {
    document.querySelectorAll('.deleteContact').forEach(function (button) {
        button.addEventListener('click', function (event) {
            var contactId = event.target.dataset.contactId;
            if (confirm('Möchten Sie diesen Kontakt wirklich löschen?')) {
                fetch("/contacts/".concat(contactId), { method: 'DELETE' })
                    .then(function (response) {
                    if (!response.ok)
                        throw new Error('Löschen fehlgeschlagen');
                    return response.json();
                })
                    .then(function (data) {
                    if (data.message === 'Kontakt gelöscht') {
                        event.target.closest('tr').remove();
                    }
                    else {
                        alert('Es gab ein Problem beim Löschen des Kontakts.');
                    }
                })
                    .catch(function (error) { return alert(error.message); });
            }
        });
    });
    document.querySelectorAll('.saveEdit').forEach(function (button) {
        button.addEventListener('click', function (event) {
            var contactId = event.target.dataset.contactId;
            var row = event.target.closest('tr');
            var updatedContact = {
                first_name: row.cells[1].innerText,
                last_name: row.cells[2].innerText,
                city: row.cells[3].innerText,
                street: row.cells[4].innerText,
                house_number: row.cells[5].innerText,
                phone_number: row.cells[6].innerText
            };
            fetch("/contacts/".concat(contactId), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedContact)
            })
                .then(function (response) {
                if (!response.ok)
                    throw new Error('Aktualisierung fehlgeschlagen');
                return response.json();
            })
                .then(function (data) {
                if (data.message === 'Kontakt aktualisiert') {
                    alert('Kontakt aktualisiert!');
                }
                else {
                    throw new Error('Aktualisierung fehlgeschlagen');
                }
            })
                .catch(function (error) { return alert(error.message); });
        });
    });
}

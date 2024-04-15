document.addEventListener('DOMContentLoaded', function () {
    var _a;
    function addContactToTable(contact) {
        var tableBody = document.getElementById('contactsTable').getElementsByTagName('tbody')[0];
        var row = document.createElement('tr');
        row.innerHTML = "\n            <td>".concat(contact.id, "</td>\n            <td contenteditable=\"true\" data-field=\"first_name\">").concat(contact.first_name, "</td>\n            <td contenteditable=\"true\" data-field=\"last_name\">").concat(contact.last_name, "</td>\n            <td contenteditable=\"true\" data-field=\"city\">").concat(contact.city, "</td>\n            <td contenteditable=\"true\" data-field=\"street\">").concat(contact.street, "</td>\n            <td contenteditable=\"true\" data-field=\"house_number\">").concat(contact.house_number, "</td>\n            <td contenteditable=\"true\" data-field=\"phone_number\">").concat(contact.phone_number, "</td>\n            <td>\n                <button class=\"saveEdit\" data-id=\"").concat(contact.id, "\">Speichern</button>\n                <button class=\"deleteContact\" data-id=\"").concat(contact.id, "\">L\u00F6schen</button>\n            </td>\n        ");
        tableBody.appendChild(row);
    }
    (_a = document.getElementById('contactsTable')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        var target = event.target;
        var contactId = target.dataset.id;
        if (!contactId)
            return;
        if (target instanceof HTMLButtonElement) {
            if (target.classList.contains('deleteContact')) {
                if (confirm('Möchten Sie diesen Kontakt wirklich löschen?')) {
                    fetch("/contacts/".concat(contactId), {
                        method: 'DELETE',
                    })
                        .then(function (response) { return response.json(); })
                        .then(function (data) {
                        var _a;
                        if (data.message === 'Kontakt gelöscht') {
                            (_a = target.closest('tr')) === null || _a === void 0 ? void 0 : _a.remove();
                        }
                        else {
                            alert('Es gab ein Problem beim Löschen des Kontakts.');
                        }
                    })
                        .catch(function (error) { return console.error('Fehler:', error); });
                }
            }
            else if (target.classList.contains('saveEdit')) {
                var updatedContact = {
                    first_name: (_b = (_a = target.closest('tr')) === null || _a === void 0 ? void 0 : _a.querySelector('[data-field="first_name"]')) === null || _b === void 0 ? void 0 : _b.textContent,
                    last_name: (_d = (_c = target.closest('tr')) === null || _c === void 0 ? void 0 : _c.querySelector('[data-field="last_name"]')) === null || _d === void 0 ? void 0 : _d.textContent,
                    city: (_f = (_e = target.closest('tr')) === null || _e === void 0 ? void 0 : _e.querySelector('[data-field="city"]')) === null || _f === void 0 ? void 0 : _f.textContent,
                    street: (_h = (_g = target.closest('tr')) === null || _g === void 0 ? void 0 : _g.querySelector('[data-field="street"]')) === null || _h === void 0 ? void 0 : _h.textContent,
                    house_number: (_k = (_j = target.closest('tr')) === null || _j === void 0 ? void 0 : _j.querySelector('[data-field="house_number"]')) === null || _k === void 0 ? void 0 : _k.textContent,
                    phone_number: (_m = (_l = target.closest('tr')) === null || _l === void 0 ? void 0 : _l.querySelector('[data-field="phone_number"]')) === null || _m === void 0 ? void 0 : _m.textContent
                };
                fetch("/contacts/".concat(contactId), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedContact)
                })
                    .then(function (response) { return response.json(); })
                    .then(function (data) {
                    if (data.message === 'Kontakt aktualisiert') {
                        alert('Kontakt aktualisiert!');
                    }
                    else {
                        alert('Es gab ein Problem beim Aktualisieren des Kontakts.');
                    }
                })
                    .catch(function (error) { return console.error('Fehler:', error); });
            }
        }
    });
    fetch('/contacts')
        .then(function (response) { return response.json(); })
        .then(function (data) {
        data.forEach(function (contact) { return addContactToTable(contact); });
    })
        .catch(function (error) { return console.error('Fehler beim Abrufen der Daten:', error); });
});

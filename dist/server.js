"use strict";
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './database.db';
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Statische Dateien im Verzeichnis "public" ausliefern
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Fehler beim Öffnen der Datenbank:', err.message);
    }
    else {
        console.log('Erfolgreich mit der SQLite-Datenbank verbunden');
        createContactsTable();
    }
});
function createContactsTable() {
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name TEXT,
            city TEXT,
            street TEXT,
            house_number TEXT,
            phone_number TEXT
        )`, (err) => {
        if (err) {
            console.error('Fehler beim Erstellen der Tabelle:', err.message);
        }
        else {
            console.log('Tabelle erfolgreich erstellt');
            importContactsFromCSV(); // CSV-Daten importieren, nachdem die Tabelle erstellt wurde
        }
    });
}
function removeDuplicateContacts() {
    const sql = `
        DELETE FROM contacts
        WHERE id NOT IN (
            SELECT MIN(id)
            FROM contacts
            GROUP BY first_name, last_name, city, street, house_number, phone_number
        )
    `;
    db.run(sql, [], (err) => {
        if (err) {
            console.error('Fehler beim Entfernen von Duplikaten:', err.message);
        }
        else {
            console.log('Duplikate wurden erfolgreich entfernt');
        }
    });
}
function importContactsFromCSV() {
    const csvFilePath = 'data.csv'; // Pfad zu Ihrer CSV-Datei
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
        const { vorname, nachname, ort, strasse, hausnummer, telefonnummer } = row;
        db.run(`INSERT INTO contacts (first_name, last_name, city, street, house_number, phone_number) VALUES (?, ?, ?, ?, ?, ?)`, [vorname, nachname, ort, strasse, hausnummer, telefonnummer], (err) => {
            if (err) {
                console.error('Fehler beim Einfügen:', err.message);
            }
        });
    })
        .on('end', () => {
        console.log('CSV-Datei erfolgreich importiert.');
        removeDuplicateContacts(); // Duplikate entfernen, nachdem die Daten importiert wurden
    });
}
// Route, um das Frontend auszuliefern
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Beispielroute zum Abrufen aller Kontakte
app.get('/contacts', (req, res) => {
    db.all('SELECT * FROM contacts', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});
app.delete('/contacts/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM contacts WHERE id = ?`, id, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Kontakt gelöscht', contactId: id });
    });
});
app.put('/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, city, street, house_number, phone_number } = req.body;
    const sql = `
        UPDATE contacts
        SET first_name = ?, 
            last_name = ?, 
            city = ?, 
            street = ?, 
            house_number = ?, 
            phone_number = ?
        WHERE id = ?
    `;
    const values = [first_name, last_name, city, street, house_number, phone_number, id];
    db.run(sql, values, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Kontakt aktualisiert', contact: Object.assign({ id }, req.body) });
    });
});
// Route zum Suchen von Kontakten
app.get('/search', (req, res) => {
    const { first_name, last_name, city, street, house_number, phone_number } = req.query;
    // Erstellen Sie ein SQL-Statement, das alle übergebenen Suchkriterien berücksichtigt
    let sql = `SELECT * FROM contacts WHERE 1 = 1`;
    let parameters = [];
    if (first_name) {
        sql += ` AND first_name LIKE ?`;
        parameters.push('%' + first_name + '%');
    }
    if (last_name) {
        sql += ` AND last_name LIKE ?`;
        parameters.push('%' + last_name + '%');
    }
    if (city) {
        sql += ` AND city LIKE ?`;
        parameters.push('%' + city + '%');
    }
    if (street) {
        sql += ` AND street LIKE ?`;
        parameters.push('%' + street + '%');
    }
    if (house_number) {
        sql += ` AND house_number LIKE ?`;
        parameters.push('%' + house_number + '%');
    }
    if (phone_number) {
        sql += ` AND phone_number LIKE ?`;
        parameters.push('%' + phone_number + '%');
    }
    // Führen Sie die Suchabfrage aus und geben Sie die Ergebnisse zurück
    db.all(sql, parameters, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        }
        else {
            res.json(rows);
        }
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

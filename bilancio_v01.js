const firebaseConfig = {
    apiKey: "AIzaSyC4XXGXXYsM0QHkbgiEPBAWdzh-iuFmOFs",
    authDomain: "login-bea17.firebaseapp.com",
    projectId: "login-bea17",
    storageBucket: "login-bea17.appspot.com",
    messagingSenderId: "429822202272",
    appId: "1:429822202272:web:1e319cc3a8bbccac2d54c5",
    measurementId: "G-C04Y90CSMG"
};

// Inizializzazione Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const modal = document.getElementById('modal');
const apriModalButton = document.getElementById('apriModalButton');
const chiudiModalButton = document.getElementById('chiudiModalButton');
const aggiungiTransazioneButton = document.getElementById('aggiungiTransazioneButton'); // Get the button by its ID

apriModalButton.onclick = function() {
    modal.style.display = 'block';
};

chiudiModalButton.onclick = function() {
    modal.style.display = 'none';
};

aggiungiTransazioneButton.onclick = function() { // Attach the event listener here
    const data = document.getElementById('data').value;
    const descrizione = document.getElementById('descrizione').value;
    const tipo = document.getElementById('tipo').value;
    const CDC = document.getElementById('CDC').value;
    const importo = parseFloat(document.getElementById('importo').value);

    if (!data || !descrizione || isNaN(importo) || importo <= 0) {
        alert('Per favore, compila tutti i campi correttamente.');
        return;
    }

    // Aggiungi la transazione all'array
    transazioni.push({ data, descrizione, tipo, CDC, importo }); // Include CDC

    if (tipo === 'entrata') {
        totaleEntrate += importo;
    } else {
        totaleUscite += importo;
    }

    aggiornaTotali();
    aggiornaElencoTransazioni();
    salvaDati();
    modal.style.display = 'none'; // Close the modal after adding
};

let transazioni = JSON.parse(localStorage.getItem('transazioni')) || [];
let totaleEntrate = 0;
let totaleUscite = 0;
let categorie = JSON.parse(localStorage.getItem('categorie')) || [];

// Funzione per aggiornare i totali
function aggiornaTotali() {
    const saldo = totaleEntrate - totaleUscite;
    document.getElementById('totaleEntrate').textContent = totaleEntrate.toFixed(2);
    document.getElementById('totaleUscite').textContent = totaleUscite.toFixed(2);
    document.getElementById('saldo').textContent = saldo.toFixed(2);
}
// Funzione per aggiornare l'elenco delle transazioni
function aggiornaElencoTransazioni() {
    const elencoTransazioni = document.getElementById('elencoTransazioni').getElementsByTagName('tbody')[0];
    elencoTransazioni.innerHTML = '';

    transazioni.forEach((transazione, index) => {
        const row = elencoTransazioni.insertRow();
        row.innerHTML = `
            <td>${transazione.data}</td>
            <td>${transazione.descrizione}</td>
            <td>${transazione.tipo}</td>
            <td>${transazione.CDC}</td>
            <td>${transazione.importo.toFixed(2)} €</td>
            <td><button onclick="eliminaTransazione(${index})">Elimina</button></td>
        `;
    });
}

// Funzione per eliminare una transazione
function eliminaTransazione(index) {
    const transazione = transazioni[index];
    if (transazione.tipo === 'entrata') {
        totaleEntrate -= transazione.importo;
    } else {
        totaleUscite -= transazione.importo;
    }
    transazioni.splice(index, 1); // Rimuove la transazione
    aggiornaTotali();
    aggiornaElencoTransazioni();
    salvaDati();
}

// Funzione per visualizzare l'immagine caricata
function previewImage() {
    const fileInput = document.getElementById('fileInput');
    const headerImage = document.getElementById('headerImage');

    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            headerImage.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

// Funzione per salvare i dati in localStorage
function salvaDati() {
    localStorage.setItem('transazioni', JSON.stringify(transazioni));
    localStorage.setItem('categorie', JSON.stringify(categorie));
}

// Carica i dati al caricamento della pagina
window.onload = () => {
    aggiornaTotali();
    aggiornaElencoTransazioni();
};

function esportaInExcel() {
    const datiTransazioni = transazioni.map(transazione => {
        return {
            Data: transazione.data,
            Descrizione: transazione.descrizione,
            Tipo: transazione.tipo,
            CDC: transazione.CDC,
            Importo: transazione.importo.toFixed(2) + ' €'
        };
    });

    datiTransazioni.push({
        Data: 'Totali',
        Descrizione: '',
        Tipo: '',
        CDC: '',
        Importo: 'Entrate Totali: ' + totaleEntrate.toFixed(2) + ' € / Uscite Totali: ' + totaleUscite.toFixed(2) + ' € / Saldo: ' + (totaleEntrate - totaleUscite).toFixed(2) + ' €'
    });

    const ws = XLSX.utils.json_to_sheet(datiTransazioni);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transazioni');
    XLSX.writeFile(wb, 'Bilancio_di_Cassa.xlsx');
}
function disconnettiUtente() {
    firebase.auth().signOut().then(() => {
        console.log('Utente disconnesso da Firebase.');
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Errore durante la disconnessione da Firebase:', error);
    });
}


if (disconnettiButton) {
    disconnettiButton.addEventListener('click', disconnettiUtente);
}
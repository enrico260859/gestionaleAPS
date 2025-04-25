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

// Database IndexdDB
let db;
let request = indexedDB.open('transazioniDB', 1);
let transazioni = [];

request.onerror = function(event) {
    console.error('Database error:', event.target.errorCode);
};
request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('transazioni')) {
        const transazioniStore = db.createObjectStore('transazioni', { autoIncrement: true });
        // Puoi creare un indice per la data se prevedi di filtrare o ordinare per data
        transazioniStore.createIndex('data', 'data');
    }
    if (!db.objectStoreNames.contains('pagina')) {
        db.createObjectStore('pagina', { keyPath: 'id' });
    }
};
request.onsuccess = function(event) {
    db = event.target.result;
    loadData();
};

function loadData() {
    loadBilancio();
    loadPagina();
    loadCategorie(); // Carica le categorie all'avvio
}

function loadBilancio() {
    const transaction = db.transaction(['transazioni'], 'readonly');
    const objectStore = transaction.objectStore('transazioni');
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = function(event) {
        transazioni = event.target.result || [];
        totaleEntrate = 0;
        totaleUscite = 0;
        transazioni.forEach(transazione => {
            if (transazione.tipo === 'entrata') {
                totaleEntrate += transazione.importo;
            } else {
                totaleUscite += transazione.importo;
            }
        });
        aggiornaTotali();
        aggiornaElencoTransazioni();
    };

    getAllRequest.onerror = function(event) {
        console.error('Errore durante il caricamento delle transazioni:', event.target.errorCode);
    };
}

function loadPagina() {
    const transaction = db.transaction(['pagina'], 'readonly');
    const objectStore = transaction.objectStore('pagina');
    const getRequest = objectStore.get(1);

    getRequest.onsuccess = function(event) {
        const pagina = event.target.result;
        if (pagina && pagina.headerImage) {
            document.getElementById('headerImage').src = pagina.headerImage;
        }
    };

    getRequest.onerror = function(event) {
        console.error('Errore durante il caricamento della pagina:', event.target.errorCode);
    };
}

let categorieDB; // Database per le categorie
const categorieRequest = indexedDB.open("CategorieBilancioDB", 1);

categorieRequest.onupgradeneeded = function (event) {
    categorieDB = event.target.result;
    if (!categorieDB.objectStoreNames.contains("categorie")) {
        categorieDB.createObjectStore("categorie", { keyPath: "id", autoIncrement: true });
    }
};

categorieRequest.onsuccess = function (event) {
    categorieDB = event.target.result;
    loadCategorie(); // Carica le categorie dopo l'apertura del database
};

categorieRequest.onerror = function (event) {
    console.error("Errore IndexedDB Categorie:", event.target.errorCode);
};

function loadCategorie() {
    const tx = categorieDB.transaction("categorie", "readonly");
    const store = tx.objectStore("categorie");
    const richiesta = store.getAll();

    richiesta.onsuccess = function () {
        const categorie = richiesta.result;
        aggiornaSelectDescrizione(categorie); // Passa le categorie caricate alla funzione
    };
    richiesta.onerror = function (event){
        console.error("Errore caricamento categorie", event.target.errorCode);
    }
}


const modal = document.getElementById('modal');
const apriModalButton = document.getElementById('apriModalButton');
const chiudiModalButton = document.getElementById('chiudiModalButton');
const aggiungiTransazioneButton = document.getElementById('aggiungiTransazioneButton'); // Get the button by its ID

if (apriModalButton) {
    apriModalButton.onclick = function() {
        modal.style.display = 'block';
    };
}

if (chiudiModalButton) {
    chiudiModalButton.onclick = function() {
        modal.style.display = 'none';
    };
}

if (aggiungiTransazioneButton) {
    aggiungiTransazioneButton.onclick = function() {
        const data = document.getElementById('data').value;
        const descrizione = document.getElementById('descrizione').value;
        const tipo = document.getElementById('tipo').value;
        const CDC = document.getElementById('CDC').value;
        const importo = parseFloat(document.getElementById('importo').value);

        if (!data || !descrizione || isNaN(importo) || importo <= 0) {
            alert('Per favore, compila tutti i campi correttamente.');
            return;
        }

        const nuovaTransazione = { data, descrizione, tipo, CDC, importo };

        const transaction = db.transaction(['transazioni'], 'readwrite');
        const objectStore = transaction.objectStore('transazioni');
        const addRequest = objectStore.add(nuovaTransazione);

        addRequest.onsuccess = function(event) {
            console.log('Transazione salvata in IndexedDB con ID:', event.target.result);
            nuovaTransazione.id = event.target.result; // Memorizza l'ID generato
            transazioni.push(nuovaTransazione);
            if (tipo === 'entrata') {
                totaleEntrate += importo;
            } else {
                totaleUscite += importo;
            }
            aggiornaTotali();
            aggiornaElencoTransazioni();
            modal.style.display = 'none';
        };

        addRequest.onerror = function(event) {
            console.error('Errore durante il salvataggio della transazione:', event.target.errorCode);
        };
    };
}


let totaleEntrate = 0;
let totaleUscite = 0;

// Funzione per aggiornare i totali
function aggiornaTotali() {
    const saldo = totaleEntrate - totaleUscite;
    const totaleEntrateElement = document.getElementById('totaleEntrate');
    const totaleUsciteElement = document.getElementById('totaleUscite');
    const saldoElement = document.getElementById('saldo');

    if (totaleEntrateElement) totaleEntrateElement.textContent = totaleEntrate.toFixed(2);
    if (totaleUsciteElement) totaleUsciteElement.textContent = totaleUscite.toFixed(2);
    if (saldoElement) saldoElement.textContent = saldo.toFixed(2);
}
// Funzione per aggiornare l'elenco delle transazioni
function aggiornaElencoTransazioni() {
    const elencoTransazioniTBody = document.getElementById('elencoTransazioni')?.getElementsByTagName('tbody')[0];
    if (!elencoTransazioniTBody) return;
    elencoTransazioniTBody.innerHTML = '';

    transazioni.forEach((transazione, index) => {
        const row = elencoTransazioniTBody.insertRow();
        row.innerHTML = `
            <td>${transazione.data}</td>
            <td>${transazione.descrizione}</td>
            <td>${transazione.tipo}</td>
            <td>${transazione.CDC}</td>
            <td>${transazione.importo.toFixed(2)} €</td>
            <td><button onclick="eliminaTransazione(${transazione.id})">Elimina</button></td>
        `;
    });
}

// Funzione per eliminare una transazione
function eliminaTransazione(id) {
    const transaction = db.transaction(['transazioni'], 'readwrite');
    const objectStore = transaction.objectStore('transazioni');
    const deleteRequest = objectStore.delete(id);

    deleteRequest.onsuccess = function() {
        console.log('Transazione con ID', id, 'eliminata da IndexedDB.');
        // Rimuovi la transazione anche dall'array locale e aggiorna la visualizzazione
        const indexToRemove = transazioni.findIndex(transazione => transazione.id === id);
        if (indexToRemove !== -1) {
            const transazioneEliminata = transazioni.splice(indexToRemove, 1)[0];
            if (transazioneEliminata.tipo === 'entrata') {
                totaleEntrate -= transazioneEliminata.importo;
            } else {
                totaleUscite -= transazioneEliminata.importo;
            }
            aggiornaTotali();
            aggiornaElencoTransazioni();
        }
    };

    deleteRequest.onerror = function(event) {
        console.error('Errore durante l\'eliminazione della transazione con ID', id, ':', event.target.errorCode);
    };
}

// Funzione per visualizzare l'immagine caricata e salvarla in IndexedDB
function previewImage() {
    const fileInput = document.getElementById('fileInput');
    const headerImage = document.getElementById('headerImage');

    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (headerImage) headerImage.src = e.target.result;

            // Salva l'URL dell'immagine in IndexedDB
            const transaction = db.transaction(['pagina'], 'readwrite');
            const objectStore = transaction.objectStore('pagina');
            const putRequest = objectStore.put({ id: 1, headerImage: e.target.result }); // Usa 'put' per aggiornare o aggiungere

            putRequest.onsuccess = function() {
                console.log('Immagine dell\'header salvata in IndexedDB.');
            };
            putRequest.onerror = function(event) {
                console.error('Errore durante il salvataggio dell\'immagine dell\'header:', event.target.errorCode);
            };
        }
        reader.readAsDataURL(file);
    }
}

function aggiornaSelectDescrizione(categorie) {
    const select = document.getElementById('descrizione');
    if (!select) return;

    select.innerHTML = '';

    const mappa = {};
    categorie.forEach(v => v.figli = []);
    categorie.forEach(v => mappa[v.id] = v);
    categorie.forEach(v => {
        if (v.padre && mappa[v.padre]) {
            mappa[v.padre].figli.push(v);
        }
    });

    const radici = categorie.filter(v => !v.padre);
    radici.forEach(r => aggiungiOpzione(select, r, 0));
}

function aggiungiOpzione(select, voce, livello) {
    const option = document.createElement('option');
    option.value = voce.nome;  // Usa il nome come valore
    option.textContent = `${'—'.repeat(livello)} ${voce.nome} (${voce.tipo})`;
    select.appendChild(option);

    if (voce.figli && voce.figli.length > 0) {
        voce.figli.forEach(figlio => aggiungiOpzione(select, figlio, livello + 1));
    }
}
// Carica i dati al caricamento della pagina
window.onload = () => {
    loadData();
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

const disconnettiButton = document.getElementById('disconnettiButton');
if (disconnettiButton) {
    disconnettiButton.addEventListener('click', disconnettiUtente);
}

function disconnettiUtente() {
    firebase.auth().signOut().then(() => {
        console.log('Utente disconnesso da Firebase.');
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Errore durante la disconnessione da Firebase:', error);
    });
}
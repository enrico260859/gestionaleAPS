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

let db;
let request = indexedDB.open('sociDB', 1);
let soci = []; // Initialize an empty array to hold the socio data

request.onerror = function(event) {
    console.error('Database error:', event.target.errorCode);
};
request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('soci')) {
        db.createObjectStore('soci', { autoIncrement: true });
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
    loadSoci();
    loadPagina();
}
function loadSoci() {
    const transaction = db.transaction(['soci'], 'readonly');
    const objectStore = transaction.objectStore('soci');
    const getAllRequest = objectStore.getAll();
    getAllRequest.onsuccess = function(event) {
        soci = event.target.result || [];
        aggiornaElencoSoci();
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
const modal = document.getElementById('modal');
const apriModalButton = document.getElementById('apriModalButton');
const chiudiModalButton = document.getElementById('chiudiModalButton');
const aggiungiSocioButton = document.getElementById('aggiungiSocioButton');
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
aggiungiSocioButton.onclick = function() {
    const data = document.getElementById('data').value;
    const tessera = document.getElementById('tessera').value;
    const cognome = document.getElementById('cognome').value;
    const nome = document.getElementById('nome').value;
    const indirizzo = document.getElementById('indirizzo').value;
    const codicepostale = document.getElementById('codicepostale').value;
    const comune = document.getElementById('comune').value;
    const città = document.getElementById('città').value;

    if (!data || !tessera || !cognome || !nome || !indirizzo || !codicepostale || !comune || !città) {
        alert('Per favore, compila tutti i campi correttamente.');
        return;
    }
    const transaction = db.transaction(['soci'], 'readwrite');
    const objectStore = transaction.objectStore('soci');
    objectStore.add({ data, tessera, cognome, nome, indirizzo, codicepostale, comune, città }).onsuccess = function() {
        loadSoci(); // Reload the data to update the table
        modal.style.display = 'none';
        // Clear the form fields after successful addition (optional)
        document.getElementById('data').value = '';
        document.getElementById('tessera').value = '';
        document.getElementById('cognome').value = '';
        document.getElementById('nome').value = '';
        document.getElementById('indirizzo').value = '';
        document.getElementById('codicepostale').value = '';
        document.getElementById('comune').value = '';
        document.getElementById('città').value = '';
    };
};
function aggiornaElencoSoci() {
    const elencoSoci = document.getElementById('elencoSoci').getElementsByTagName('tbody')[0];
    elencoSoci.innerHTML = '';
    soci.forEach((socio, index) => {
        const row = elencoSoci.insertRow();
        row.innerHTML = `
            <td>${socio.data}</td>
            <td>${socio.tessera}</td>
            <td>${socio.cognome}</td>
            <td>${socio.nome}</td>
            <td>${socio.indirizzo}</td>
            <td>${socio.codicepostale}</td>
            <td>${socio.comune}</td>
            <td>${socio.città}</td>
            <td><button onclick="eliminaSoci(${index})">Elimina</button></td>
        `;
    });
}
function eliminaSoci(index) {
    const transaction = db.transaction(['soci'], 'readwrite');
    const objectStore = transaction.objectStore('soci');
    const getAllRequest = objectStore.getAll();
    getAllRequest.onsuccess = function(event) {
        const allSoci = event.target.result;
        if (index >= 0 && index < allSoci.length) {
            const socioToDelete = allSoci[index];
            const deleteRequest = objectStore.delete(socioToDelete.id); 
            deleteRequest.onsuccess = function() {
                loadSoci();
            };
        }
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
function savePagina() {
    const transaction = db.transaction(['pagina'], 'readwrite');
    const objectStore = transaction.objectStore('pagina');
    objectStore.put({ id: 1, headerImage: document.getElementById('headerImage').src });
}
function esportaInExcel() {
    const datiSoci = soci.map(socio => {
        return {
            Data: socio.data,
            Tessera: socio.tessera,
            Cognome: socio.cognome,
            Nome: socio.nome,
            indirizzo: socio.indirizzo,
            CodicePostale: socio.codicepostale,
            Comune: socio.comune,
            Città: socio.città,
        };
    });
    const ws = XLSX.utils.json_to_sheet(datiSoci);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Soci');
    XLSX.writeFile(wb, 'Elenco_Soci.xlsx');
}
window.onload = () => {
    loadData();
};
function disconnettiUtente() {
    firebase.auth().signOut().then(() => {
        console.log('Utente disconnesso da Firebase.');
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Errore durante la disconnessione da Firebase:', error);
    });
}


const disconnettiButton = document.getElementById('disconnettiButton');
if (disconnettiButton) {
    disconnettiButton.addEventListener('click', disconnettiUtente);
}
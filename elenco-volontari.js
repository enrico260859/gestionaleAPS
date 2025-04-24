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
        let request = indexedDB.open('volontariDB', 1);
        request.onerror = function(event) {
            console.error('Database error:', event.target.errorCode);
        };
        request.onupgradeneeded = function(event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains('volontari')) {
                db.createObjectStore('volontari', { autoIncrement: true });
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
            loadVolontari();
            loadPagina();
        }
        function loadVolontari() {
            const transaction = db.transaction(['volontari'], 'readonly');
            const objectStore = transaction.objectStore('volontari');
            objectStore.getAll().onsuccess = function(event) {
                volontari = event.target.result || [];
                aggiornaElencoVolontari();
            };
        }
        function loadPagina() {
            const transaction = db.transaction(['pagina'], 'readonly');
            const objectStore = transaction.objectStore('pagina');
            objectStore.get(1).onsuccess = function(event) {
                const pagina = event.target.result;
                if (pagina) {
                    document.getElementById('headerImage').src = pagina.headerImage;
                }
            };
        }
        const modal = document.getElementById('modal');
        const apriModalButton = document.getElementById('apriModalButton');
        const chiudiModalButton = document.getElementById('chiudiModalButton');
        const aggiungiVolontarioButton = document.getElementById('aggiungiVolontarioButton');
        apriModalButton.onclick = function() {
            modal.style.display = 'block';
        };
        chiudiModalButton.onclick = function() {
            modal.style.display = 'none';
        };
        aggiungiVolontarioButton.onclick = function() {
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
            const transaction = db.transaction(['volontari'], 'readwrite');
            const objectStore = transaction.objectStore('volontari');
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
        function aggiornaElencoVolontari() {
            const elencoVolontari = document.getElementById('elencoVolontari').getElementsByTagName('tbody')[0];
            elencoVolontari.innerHTML = '';

            volontari.forEach((volontario, index) => {
                const row = elencoVolontari.insertRow();
                row.innerHTML = `
                    <td>${volontario.data}</td>
                    <td>${volontario.tessera}</td>
                    <td>${volontario.cognome}</td>
                    <td>${volontario.nome}</td>
                    <td>${volontario.indirizzo}</td>
                    <td>${volontario.codicepostale}</td>
                    <td>${volontario.comune}</td>
                    <td>${volontario.città}</td>
                    <td><button onclick="eliminaVolontari(${index})">Elimina</button></td>
                `;
            });
        }
        function eliminaVolontari(index) {
            const transaction = db.transaction(['volontari'], 'readwrite');
            const objectStore = transaction.objectStore('volontari');
            const request = objectStore.openCursor();
            getAllRequest.onsuccess = function(event) {
                const allVolontari = event.target.result;
                if (index >= 0 && index < allVolontari.length) {
                    const volontarioToDelete = allVolontari[index];
                    const deleteRequest = objectStore.delete(volontarioToDelete.id); 
        
                    deleteRequest.onsuccess = function() {
                        loadVolontari();
                    };
                }
            };
        }
        function previewImage() {
            const fileInput = document.getElementById('fileInput');
            const headerImage = document.getElementById('headerImage');
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    headerImage.src = e.target.result;
                    savePagina();
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
            const datiVolontari = volontari.map(volontario => {
                return {
                    Data: volontario.data,
                    Tessera: volontario.tessera,
                    Cognome: volontario.cognome,
                    Nome: volontario.nome,
                    indirizzo: volontario.indirizzo,
                    CodicePostale: volontario.codicepostale,
                    Comune: volontario.comune,
                    Città: volontario.città,
                };
            });
            const ws = XLSX.utils.json_to_sheet(datiVolontari);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Volontari');
            XLSX.writeFile(wb, 'Elenco_Volontari.xlsx');
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

        
        if (disconnettiButton) {
            disconnettiButton.addEventListener('click', disconnettiUtente);
        }
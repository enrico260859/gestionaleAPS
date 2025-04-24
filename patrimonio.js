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
        let request = indexedDB.open('patrimonioDB', 1);
        request.onerror = function(event) {
            console.error('Database error:', event.target.errorCode);
        };
        request.onupgradeneeded = function(event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains('patrimonio')) {
                db.createObjectStore('patrimonio', { autoIncrement: true });
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
            loadPatrimonio();
            loadPagina();
        }
        function loadPatrimonio() {
            const transaction = db.transaction(['patrimonio'], 'readonly');
            const objectStore = transaction.objectStore('patrimonio');
            objectStore.getAll().onsuccess = function(event) {
                patrimonio = event.target.result || [];
                aggiornaElencoPatrimonio();
                aggiornaTotale();
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
        let patrimonio = [];
        let totalePatrimonio = 0;
        function aggiornaTotale() {
            totalePatrimonio = patrimonio.reduce((acc, item) => acc + item.importo, 0);
            document.getElementById('totalePatrimonio').textContent = totalePatrimonio.toFixed(2);
        }
        const modal = document.getElementById('modal');
        const apriModalButton = document.getElementById('apriModalButton');
        const chiudiModalButton = document.getElementById('chiudiModalButton');
        const aggiungiPatrimonioButton = document.getElementById('aggiungiPatrimonioButton');
        apriModalButton.onclick = function() {
            modal.style.display = 'block';
        };
        chiudiModalButton.onclick = function() {
            modal.style.display = 'none';
        };
        aggiungiPatrimonioButton.onclick = function() {
        const data = document.getElementById('data').value;
        const numero = document.getElementById('numero').value;
        const descrizione = document.getElementById('descrizione').value;
        const importo = parseFloat(document.getElementById('importo').value);
        const note = document.getElementById('note').value;
        if (!data || !numero || !descrizione || !importo <= 0 || !note) {
        alert('Per favore, compila tutti i campi correttamente.');
        return;
    }
        const transaction = db.transaction(['patrimonio'], 'readwrite');
        const objectStore = transaction.objectStore('patrimonio');
        objectStore.add({ data, numero, descrizione, importo, note}).onsuccess = function() {
        loadPatrimonio(); // Reload the data to update the table
        modal.style.display = 'none';
        // Clear the form fields after successful addition (optional)
        document.getElementById('data').value = '';
        document.getElementById('numero').value = '';
        document.getElementById('descrizione').value = '';
        document.getElementById('importo').value = '';
        document.getElementById('note').value = '';
    };
};
        function aggiornaElencoPatrimonio() {
            const elencoPatrimonio = document.getElementById('elencoPatrimonio').getElementsByTagName('tbody')[0];
            elencoPatrimonio.innerHTML = '';
            patrimonio.forEach((item, index) => {
                const row = elencoPatrimonio.insertRow();
                row.innerHTML = `
                    <td>${item.data}</td>
                    <td>${item.numero}</td>
                    <td>${item.descrizione}</td>
                    <td>${item.importo.toFixed(2)} €</td>
                    <td>${item.note}</td>
                    <td><button onclick="eliminaPatrimonio(${index})">Elimina</button></td>
                `;
            });
        }
        function eliminaPatrimonio(index) {
            const transaction = db.transaction(['patrimonio'], 'readwrite');
            const objectStore = transaction.objectStore('patrimonio');
            const request = objectStore.openCursor();
            let i = 0;
            request.onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    if (i === index) {
                        cursor.delete().onsuccess = function() {
                            loadPatrimonio();
                        };
                    } else {
                        i++;
                        cursor.continue();
                    }
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
            const datiPatrimonio = patrimonio.map(item => {
                return {
                    Data: item.data,
                    Numero: item.numero,
                    Descrizione: item.descrizione,
                    Importo: item.importo,
                    Note: item.note,
                };
            });
            const ws = XLSX.utils.json_to_sheet(datiPatrimonio);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Patrimonio');
            XLSX.writeFile(wb, 'Elenco_Patrimonio.xlsx');
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
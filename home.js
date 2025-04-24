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
        const request = indexedDB.open('myDataDB', 1);

        request.onerror = function(event) {
            console.error('Database error:', event.target.errorCode);
        };

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            const objectStore = db.createObjectStore('data', { keyPath: 'id' });
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            loadData();
        };

        function saveData() {
            const transaction = db.transaction(['data'], 'readwrite');
            const objectStore = transaction.objectStore('data');
            const data = {
                id: 1,
                companyName: document.getElementById('companyName').innerText,
                address: document.getElementById('address').innerText,
                city: document.getElementById('city').innerText,
                cf: document.getElementById('cf').innerText,
                vat: document.getElementById('vat').innerText,
                email: document.getElementById('email').innerText,
                social: document.getElementById('social').innerText,
                logo: document.getElementById('logoPreview').src,
                title: document.getElementById('title').value,
            };
            objectStore.put(data);
        }

        function loadData() {
            const transaction = db.transaction(['data'], 'readonly');
            const objectStore = transaction.objectStore('data');
            const request = objectStore.get(1);
            request.onsuccess = function(event) {
                const data = event.target.result;
                if (data) {
                    document.getElementById('companyName').innerText = data.companyName;
                    document.getElementById('address').innerText = data.address;
                    document.getElementById('city').innerText = data.city;
                    document.getElementById('cf').innerText = data.cf;
                    document.getElementById('vat').innerText = data.vat;
                    document.getElementById('email').innerText = data.email;
                    document.getElementById('social').innerText = data.social;
                    document.getElementById('logoPreview').src = data.logo;
                    document.getElementById('title').value = data.title;
                }
            };
        }

        function saveDataAndNavigate(url) {
            saveData();
            window.location.href = url;
        }

        const modal = document.getElementById('modal');
        const apriModalButton = document.getElementById('apriModalButton');
        const chiudiModalButton = document.getElementById('chiudiModalButton');
        const saveDataButton = document.getElementById('saveDataButton');
        const disconnettiButton = document.getElementById('disconnettiButton');

        apriModalButton.onclick = function() {
            modal.style.display = 'block';
        };

        chiudiModalButton.onclick = function() {
            modal.style.display = 'none';
        };

        saveDataButton.onclick = function() {
            document.getElementById('companyName').innerText = document.getElementById('modalCompanyName').value;
            document.getElementById('address').innerText = document.getElementById('modalAddress').value;
            document.getElementById('city').innerText = document.getElementById('modalCity').value;
            document.getElementById('cf').innerText = document.getElementById('modalCf').value;
            document.getElementById('vat').innerText = document.getElementById('modalVat').value;
            document.getElementById('email').innerText = document.getElementById('modalEmail').value;
            document.getElementById('social').innerText = document.getElementById('modalSocial').value;
            modal.style.display = 'none';
            saveData();
        };

        function previewLogo(event) {
            const reader = new FileReader();
            reader.onload = function () {
                document.getElementById('logoPreview').src = reader.result;
                saveData();
            };
            reader.readAsDataURL(event.target.files[0]);
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
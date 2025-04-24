// IndexedDB - Catalogo Voci
let dbCatalogo;
let catalogo = [];

const richiesta = indexedDB.open('catalogoDB', 1);

richiesta.onerror = function (event) {
    console.error('Errore DB:', event.target.errorCode);
};

richiesta.onupgradeneeded = function (event) {
    dbCatalogo = event.target.result;
    if (!dbCatalogo.objectStoreNames.contains('voci')) {
        dbCatalogo.createObjectStore('voci', { keyPath: 'id', autoIncrement: true });
    }
};

richiesta.onsuccess = function (event) {
    dbCatalogo = event.target.result;
    caricaCatalogo();
};

function aggiungiVoce(nome, padreId = null) {
    const transaction = dbCatalogo.transaction(['voci'], 'readwrite');
    const objectStore = transaction.objectStore('voci');
    const nuovaVoce = { nome, padreId };
    objectStore.add(nuovaVoce).onsuccess = function () {
        caricaCatalogo();
    };
}

document.getElementById('formAggiungiVoce').addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = document.getElementById('nomeVoce').value;
    const padreId = document.getElementById('padreVoce').value || null;
    aggiungiVoce(nome, padreId ? parseInt(padreId) : null);
    document.getElementById('modalAggiungi').style.display = 'none';
    this.reset();
});

// Apertura e chiusura del modal
document.getElementById('aggiungiVoceBtn').addEventListener('click', function() {
    document.getElementById('modalAggiungi').style.display = 'block';
});

document.querySelector('.close-button').addEventListener('click', function() {
    document.getElementById('modalAggiungi').style.display = 'none';
});

function caricaCatalogo() {
    const transaction = dbCatalogo.transaction(['voci'], 'readonly');
    const objectStore = transaction.objectStore('voci');
    objectStore.getAll().onsuccess = function(event) {
        catalogo = event.target.result || [];
        renderAlbero();
        aggiornaSelectPadre();
    };
}

function renderAlbero() {
    const ulRoot = document.querySelector('#catalogoAlbero ul');
    ulRoot.innerHTML = '';

    function creaNodo(voce) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = voce.nome;

        const modificaBtn = document.createElement('button');
        modificaBtn.innerHTML = '✏️';
        modificaBtn.classList.add('azione-button');
        modificaBtn.onclick = () => modificaVocePrompt(voce);

        const eliminaBtn = document.createElement('button');
        eliminaBtn.innerHTML = '🗑️';
        eliminaBtn.classList.add('azione-button');
        eliminaBtn.onclick = () => eliminaVoce(voce.id);

        li.appendChild(span);
        li.appendChild(modificaBtn);
        li.appendChild(eliminaBtn);

        const figli = catalogo.filter(v => v.padreId === voce.id);
        if (figli.length > 0) {
            const ul = document.createElement('ul');
            figli.forEach(f => ul.appendChild(creaNodo(f)));
            li.appendChild(ul);
        }

        return li;
    }

    const radici = catalogo.filter(v => !v.padreId);
    radici.forEach(voce => ulRoot.appendChild(creaNodo(voce)));
}

function aggiornaSelectPadre() {
    const select = document.getElementById('padreVoce');
    select.innerHTML = '<option value="">Nessuna</option>';
    catalogo.forEach(voce => {
        const option = document.createElement('option');
        option.value = voce.id;
        option.textContent = voce.nome;
        select.appendChild(option);
    });
}

function eliminaVoce(id) {
    const figli = catalogo.filter(v => v.padreId === id);
    if (figli.length > 0) {
        alert('Non puoi eliminare una voce che ha sottovoci.');
        return;
    }

    const transaction = dbCatalogo.transaction(['voci'], 'readwrite');
    const objectStore = transaction.objectStore('voci');
    objectStore.delete(id).onsuccess = function () {
        caricaCatalogo();
    };
}

function modificaVocePrompt(voce) {
    const nuovoNome = prompt('Modifica il nome della voce:', voce.nome);
    if (nuovoNome && nuovoNome.trim() !== '') {
        const transaction = dbCatalogo.transaction(['voci'], 'readwrite');
        const objectStore = transaction.objectStore('voci');
        voce.nome = nuovoNome.trim();
        objectStore.put(voce).onsuccess = function () {
            caricaCatalogo();
        };
    }
}

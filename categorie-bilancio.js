let db;

const request = indexedDB.open("CategorieBilancioDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("categorie")) {
    db.createObjectStore("categorie", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = function (event) {
  db = event.target.result;
  caricaCategorie();
};

request.onerror = function (event) {
  console.error("Errore IndexedDB:", event.target.errorCode);
};

function aggiungiCategoria() {
  const nome = prompt("Inserisci il nome della nuova voce:");
  if (!nome) return;

  const tipo = prompt("Tipo voce? (gruppo / sottogruppo / sub-sottogruppo):");
  if (!["gruppo", "sottogruppo", "sub-sottogruppo"].includes(tipo)) return alert("Tipo non valido");

  const padre = prompt("ID voce padre (lascia vuoto se è un gruppo principale):");

  const nuovaVoce = {
    nome: nome.trim(),
    tipo: tipo.trim(),
    padre: padre.trim() || null
  };

  const tx = db.transaction("categorie", "readwrite");
  const store = tx.objectStore("categorie");
  store.add(nuovaVoce);
  tx.oncomplete = () => caricaCategorie();
}

function caricaCategorie() {
  const tx = db.transaction("categorie", "readonly");
  const store = tx.objectStore("categorie");
  const richiesta = store.getAll();

  richiesta.onsuccess = function () {
    const categorie = richiesta.result;
    costruisciAlbero(categorie);
  };
}

function costruisciAlbero(categorie) {
  const tree = document.getElementById("categorie-tree");
  tree.innerHTML = "";

  const mappa = {};
  categorie.forEach(v => v.figli = []);
  categorie.forEach(v => mappa[v.id] = v);
  categorie.forEach(v => {
    if (v.padre && mappa[v.padre]) {
      mappa[v.padre].figli.push(v);
    }
  });

  const radici = categorie.filter(v => !v.padre);
  radici.forEach(r => tree.appendChild(creaNodo(r)));
}

function creaNodo(voce) {
  const div = document.createElement("div");
  div.classList.add("categoria-nodo");
  div.innerHTML = `
    <strong>${voce.nome}</strong> (${voce.tipo})
    <i class="fas fa-edit" title="Modifica" onclick="modificaCategoria(${voce.id})"></i>
    <i class="fas fa-trash" title="Elimina" onclick="eliminaCategoria(${voce.id})"></i>
  `;

  if (voce.figli.length) {
    const ul = document.createElement("ul");
    voce.figli.forEach(figlio => {
      const li = document.createElement("li");
      li.appendChild(creaNodo(figlio));
      ul.appendChild(li);
    });
    div.appendChild(ul);
  }

  return div;
}

function modificaCategoria(id) {
  const tx = db.transaction("categorie", "readwrite");
  const store = tx.objectStore("categorie");
  const richiesta = store.get(id);

  richiesta.onsuccess = function () {
    const voce = richiesta.result;
    const nuovoNome = prompt("Modifica nome voce:", voce.nome);
    if (!nuovoNome) return;

    voce.nome = nuovoNome.trim();
    store.put(voce);

    tx.oncomplete = () => caricaCategorie();
  };
}

function eliminaCategoria(id) {
  const tx = db.transaction("categorie", "readwrite");
  const store = tx.objectStore("categorie");

  store.getAll().onsuccess = function (event) {
    const tutte = event.target.result;
    const daEliminare = raccogliFigli(tutte, id);
    daEliminare.push(id); // anche la voce stessa

    daEliminare.forEach(voceId => store.delete(voceId));
    tx.oncomplete = () => caricaCategorie();
  };
}

function raccogliFigli(categorie, idPadre) {
  let figliDiretti = categorie.filter(v => v.padre == idPadre).map(v => v.id);
  let tuttiFigli = [...figliDiretti];
  figliDiretti.forEach(fid => {
    tuttiFigli = tuttiFigli.concat(raccogliFigli(categorie, fid));
  });
  return tuttiFigli;
}


        // Funzione di esempio per la preview dell'immagine (potrebbe necessitare implementazione CSS)
        function previewImage() {
            const fileInput = document.getElementById('fileInput');
            const headerImage = document.getElementById('headerImage');
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    headerImage.src = reader.result;
                }
                reader.read
            }
        } 
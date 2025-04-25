let db;

    const request = indexedDB.open("CatalogoLibreriaDB", 1);

    request.onupgradeneeded = function(event) {
      db = event.target.result;
      if (!db.objectStoreNames.contains("voci")) {
        db.createObjectStore("voci", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = function(event) {
      db = event.target.result;
      caricaVoci();
    };

    request.onerror = function(event) {
      console.error("IndexedDB errore:", event.target.errorCode);
    };

    function aggiungiVoce() {
      const nome = document.getElementById("nome").value.trim();
      const tipo = document.getElementById("tipo").value;
      const padre = document.getElementById("padre").value || null;

      if (!nome) return alert("Inserisci un nome.");

      const voce = { nome, tipo, padre };

      const tx = db.transaction("voci", "readwrite");
      const store = tx.objectStore("voci");
      store.add(voce);

      tx.oncomplete = () => caricaVoci();
    }

    function caricaVoci() {
      const tx = db.transaction("voci", "readonly");
      const store = tx.objectStore("voci");
      const richiesta = store.getAll();

      richiesta.onsuccess = function() {
        const voci = richiesta.result;
        aggiornaAlbero(voci);
        aggiornaSelectPadre(voci);
      };
    }

    function aggiornaSelectPadre(voci) {
      const select = document.getElementById("padre");
      select.innerHTML = '<option value="">(nessuno)</option>';
      voci.forEach(voce => {
        select.innerHTML += `<option value="${voce.id}">${voce.nome} (${voce.tipo})</option>`;
      });
    }

    function aggiornaAlbero(voci) {
      const mappa = {};
      voci.forEach(v => v.figli = []);
      voci.forEach(v => mappa[v.id] = v);
      voci.forEach(v => {
        if (v.padre && mappa[v.padre]) {
          mappa[v.padre].figli.push(v);
        }
      });

      const radici = voci.filter(v => !v.padre);
      const ul = document.getElementById("albero");
      ul.innerHTML = "";
      radici.forEach(r => ul.appendChild(creaNodo(r)));
    }

    function creaNodo(voce) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="tree-node">${voce.nome}</span>
        <span class="actions" onclick="modificaVoce(${voce.id})">✏️</span>
        <span class="actions" onclick="eliminaVoce(${voce.id})">🗑️</span>`;
      if (voce.figli.length) {
        const ul = document.createElement("ul");
        voce.figli.forEach(figlio => ul.appendChild(creaNodo(figlio)));
        li.appendChild(ul);
      }
      return li;
    }

    function modificaVoce(id) {
      const nuovoNome = prompt("Modifica nome:");
      if (!nuovoNome) return;

      const tx = db.transaction("voci", "readwrite");
      const store = tx.objectStore("voci");
      const getReq = store.get(id);

      getReq.onsuccess = function() {
        const voce = getReq.result;
        voce.nome = nuovoNome;
        store.put(voce);
        tx.oncomplete = () => caricaVoci();
      };
    }

    function eliminaVoce(id) {
      // Prima cancella anche eventuali figli
      const tx = db.transaction("voci", "readwrite");
      const store = tx.objectStore("voci");

      store.getAll().onsuccess = function(event) {
        const tutte = event.target.result;
        const daEliminare = raccogliFigli(tutte, id);
        daEliminare.push(id); // includi anche il nodo principale

        daEliminare.forEach(voceId => store.delete(voceId));
        tx.oncomplete = () => caricaVoci();
      };
    }

    function raccogliFigli(voci, idPadre) {
      let figliDiretti = voci.filter(v => v.padre == idPadre).map(v => v.id);
      let tuttiFigli = [...figliDiretti];
      figliDiretti.forEach(fid => {
        tuttiFigli = tuttiFigli.concat(raccogliFigli(voci, fid));
      });
      return tuttiFigli;
    }
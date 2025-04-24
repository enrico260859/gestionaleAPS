let categorie = JSON.parse(localStorage.getItem('categorie')) || [];
        let transazioni = JSON.parse(localStorage.getItem('transazioni')) || []; // Initialize transazioni

        // Funzione per confrontare due elementi (per l'ordinamento alfabetico)
        function compareByName(a, b) {
            const nameA = a.nome.toUpperCase();
            const nameB = b.nome.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        }

        // Funzione per aggiornare la visualizzazione delle categorie e sottocategorie come albero
        function aggiornaCatalogoCategorie() {
            const categorieTreeDiv = document.getElementById('categorie-tree');
            categorieTreeDiv.innerHTML = ''; // Pulisce l'elenco esistente

            // Ordina le categorie principali PRIMA di visualizzarle
            const sortedCategorie = [...categorie].sort(compareByName);

            const categorieList = document.createElement('ul');
            categorieList.className = 'categoria-tree';

            sortedCategorie.forEach((categoria, index) => {
                const categoriaItem = document.createElement('li');
                categoriaItem.className = 'categoria-item';

                const categoriaHeader = document.createElement('div');
                categoriaHeader.className = 'categoria-header';

                const categoriaName = document.createElement('strong');
                categoriaName.textContent = categoria.nome;
                categoriaHeader.appendChild(categoriaName);

                const categoriaActions = document.createElement('div');
                categoriaActions.className = 'categoria-actions';

                const modificaButton = document.createElement('button');
                modificaButton.innerHTML = '<i class="fas fa-pen"></i>';
                modificaButton.onclick = () => modificaCategoria(categorie.indexOf(categoria)); // Trova l'indice originale
                categoriaActions.appendChild(modificaButton);

                const eliminaButton = document.createElement('button');
                eliminaButton.innerHTML = '<i class="fas fa-trash"></i>';
                eliminaButton.onclick = () => eliminaCategoria(categorie.indexOf(categoria)); // Trova l'indice originale
                categoriaActions.appendChild(eliminaButton);

                categoriaHeader.appendChild(categoriaActions);
                categoriaItem.appendChild(categoriaHeader);

                const sottocategorieList = document.createElement('ul');
                sottocategorieList.className = 'sottocategorie-list';

                // Ordina le sottocategorie PRIMA di visualizzarle
                const sortedSottocategorie = [...categoria.sottocategorie].sort(compareByName);

                sortedSottocategorie.forEach((sottocategoria, subIndex) => {
                    const sottocategoriaItem = document.createElement('li');
                    sottocategoriaItem.className = 'sottocategoria-item';

                    const sottocategoriaHeader = document.createElement('div');
                    sottocategoriaHeader.style.display = 'flex';
                    sottocategoriaHeader.style.alignItems = 'center';

                    const sottocategoriaName = document.createElement('strong');
                    sottocategoriaName.textContent = sottocategoria.nome;
                    sottocategoriaHeader.appendChild(sottocategoriaName);

                    const sottocategoriaActions = document.createElement('div');
                    sottocategoriaActions.className = 'categoria-actions';

                    const modificaSottoButton = document.createElement('button');
                    modificaSottoButton.innerHTML = '<i class="fas fa-pen"></i>';
                    modificaSottoButton.onclick = () => modificaSottocategoria(categorie.indexOf(categoria), categoria.sottocategorie.indexOf(sottocategoria)); // Trova l'indice originale
                    sottocategoriaActions.appendChild(modificaSottoButton);

                    const eliminaSottoButton = document.createElement('button');
                    eliminaSottoButton.innerHTML = '<i class="fas fa-trash"></i>';
                    eliminaSottoButton.onclick = () => eliminaSottocategoria(categorie.indexOf(categoria), categoria.sottocategorie.indexOf(sottocategoria)); // Trova l'indice originale
                    sottocategoriaActions.appendChild(eliminaSottoButton);

                    sottocategoriaHeader.appendChild(sottocategoriaActions);
                    sottocategoriaItem.appendChild(sottocategoriaHeader);

                    const sottosottocategorieList = document.createElement('ul');
                    sottosottocategorieList.className = 'sottosottocategorie-list';

                    // Ordina le sottosottocategorie PRIMA di visualizzarle
                    const sortedSottosottocategorie = [...sottocategoria.sottosottocategorie].sort(); // Ordina alfabeticamente le stringhe

                    sortedSottosottocategorie.forEach((sottosottocategoria, sscIndex) => {
                        const sottosottocategoriaItem = document.createElement('li');
                        sottosottocategoriaItem.className = 'sottosottocategoria-item';
                        sottosottocategoriaItem.textContent = sottosottocategoria;

                        const sscActions = document.createElement('div');
                        sscActions.style.display = 'inline';
                        const modificaSSCButton = document.createElement('button');
                        modificaSSCButton.innerHTML = '<i class="fas fa-pen"></i>';
                        modificaSSCButton.onclick = () => modificaSottosottocategoria(categorie.indexOf(categoria), categoria.sottocategorie.indexOf(sottocategoria), sottocategoria.sottosottocategorie.indexOf(sottosottocategoria)); // Trova l'indice originale
                        sscActions.appendChild(modificaSSCButton);

                        const eliminaSSCButton = document.createElement('button');
                        eliminaSSCButton.innerHTML = '<i class="fas fa-trash"></i>';
                        eliminaSSCButton.onclick = () => eliminaSottosottocategoria(categorie.indexOf(categoria), categoria.sottocategorie.indexOf(sottocategoria), sottocategoria.sottosottocategorie.indexOf(sottosottocategoria)); // Trova l'indice originale
                        sscActions.appendChild(eliminaSSCButton);

                        sottosottocategoriaItem.appendChild(document.createTextNode(" ")); // Add space
                        sottosottocategoriaItem.appendChild(sscActions);

                        sottosottocategorieList.appendChild(sottosottocategoriaItem);
                    });
                    sottocategoriaItem.appendChild(sottosottocategorieList);

                    const aggiungiSottoSottoButton = document.createElement('button');
                    aggiungiSottoSottoButton.textContent = 'Aggiungi Sottosottocategoria';
                    aggiungiSottoSottoButton.onclick = () => aggiungiSottosottocategoria(categorie.indexOf(categoria), categoria.sottocategorie.indexOf(sottocategoria)); // Trova l'indice originale
                    sottocategoriaItem.appendChild(aggiungiSottoSottoButton);

                    sottocategorieList.appendChild(sottocategoriaItem);
                });

                const aggiungiSottoButton = document.createElement('button');
                aggiungiSottoButton.textContent = 'Aggiungi Sottocategoria';
                aggiungiSottoButton.onclick = () => aggiungiSottocategoria(categorie.indexOf(categoria)); // Trova l'indice originale
                categoriaItem.appendChild(aggiungiSottoButton);
                categoriaItem.appendChild(sottocategorieList);

                categorieList.appendChild(categoriaItem);
            });

            categorieTreeDiv.appendChild(categorieList);

            // Aggiorna anche l'elenco a discesa "Descrizione" in ordine crescente
            const descrizioneSelect = document.getElementById('descrizione');
            descrizioneSelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Seleziona una Categoria/Sottocategoria';
            descrizioneSelect.appendChild(defaultOption);

            sortedCategorie.forEach(categoria => {
                const optionCategoria = document.createElement('option');
                optionCategoria.value = categoria.nome;
                optionCategoria.textContent = categoria.nome;
                descrizioneSelect.appendChild(optionCategoria);

                const sortedSottocategorie = [...categoria.sottocategorie].sort(compareByName);
                sortedSottocategorie.forEach(sottocategoria => {
                    const optionSottocategoria = document.createElement('option');
                    optionSottocategoria.value = sottocategoria.nome;
                    optionSottocategoria.textContent = `-- ${sottocategoria.nome}`;
                    descrizioneSelect.appendChild(optionSottocategoria);

                    const sortedSottosottocategorie = [...sottocategoria.sottosottocategorie].sort();
                    sortedSottosottocategorie.forEach(ssc => {
                        const optionSSC = document.createElement('option');
                        optionSSC.value = ssc;
                        optionSSC.textContent = `---- ${ssc}`;
                        descrizioneSelect.appendChild(optionSSC);
                    });
                });
            });
        }

        aggiornaCatalogoCategorie();

        // Funzione per aggiungere una categoria
        function aggiungiCategoria() {
            const nomeCategoria = prompt('Nome della Categoria:');
            if (nomeCategoria) {
                const categoria = { nome: nomeCategoria, sottocategorie: [] };
                categorie.push(categoria);
                // Ordina l'array delle categorie dopo l'aggiunta
                categorie.sort(compareByName);
                aggiornaCatalogoCategorie();
                salvaDati();
            }
        }

        // Funzione per aggiungere una sottocategoria
        function aggiungiSottocategoria(categoriaIndex) {
            const nomeSottocategoria = prompt('Nome della Sottocategoria:');
            if (nomeSottocategoria) {
                categorie[categoriaIndex].sottocategorie.push({ nome: nomeSottocategoria, sottosottocategorie: [] });
                // Ordina l'array delle sottocategorie dopo l'aggiunta
                categorie[categoriaIndex].sottocategorie.sort(compareByName);
                aggiornaCatalogoCategorie();
                salvaDati();
            }
        }

        // Funzione per aggiungere una sottosottocategoria
        function aggiungiSottosottocategoria(categoriaIndex, sottocategoriaIndex) {
            const nomeSottosottocategoria = prompt('Nome della Sottosottocategoria:');
            if (nomeSottosottocategoria) {
                categorie[categoriaIndex].sottocategorie[sottocategoriaIndex].sottosottocategorie.push(nomeSottosottocategoria);
                // Ordina l'array delle sottosottocategorie dopo l'aggiunta
                categorie[categoriaIndex].sottocategorie[sottocategoriaIndex].sottosottocategorie.sort();
                aggiornaCatalogoCategorie();
                salvaDati();
            }
        }

        // Funzione per eliminare una categoria
        function eliminaCategoria(index) {
            if (confirm('Sei sicuro di voler eliminare questa categoria e tutte le sue sottocategorie?')) {
                categorie.splice(index, 1);
                aggiornaCatalogoCategorie();
                salvaDati();
            }
        }

        // Funzione per eliminare una sottocategoria
        function eliminaSottocategoria(categoriaIndex, sottocategoriaIndex) {
            if (confirm('Sei sicuro di voler eliminare questa sottocategoria e tutte le sue sottosottocategorie?')) {
                categorie[categoriaIndex].sottocategorie.splice(sottocategoriaIndex, 1);
                aggiornaCatalogoCategorie();
                salvaDati();
            }
        }

        // Funzione per eliminare una sottosottocategoria
        function eliminaSottosottocategoria(categoriaIndex, sottocategoriaIndex, sscIndex) {
            if (confirm('Sei sicuro di voler eliminare questa sottosottocategoria?')) {
                categorie[categoriaIndex].sottocategorie[sottocategoriaIndex].sottosottocategorie.splice(sscIndex, 1);
                aggiornaCatalogoCategorie();
                salvaDati();
            }
        }

        // Funzione per modificare una categoria
        function modificaCategoria(index) {
            const nuovoNome = prompt('Nuovo nome della categoria:', categorie[index].nome);
            if (nuovoNome) {
                categorie[index].nome = nuovoNome;
                // Ordina l'array delle categorie dopo la modifica
                categorie.sort(compareByName);
                aggiornaCatalogoCategorie();
                salvaDati();
            }
        }

        // Funzione per modificare una sottocategoria
        function modificaSottocategoria(categoriaIndex, sottocategoriaIndex) {
            const nuovoNome = prompt('Nuovo nome della sottocategoria:', categorie[categoriaIndex].sottocategorie[sottocategoriaIndex].nome);
            if (nuovoNome) {
                categorie[categoriaIndex].sottocategorie[sottocategoriaIndex].nome = nuovoNome;
                // Ordina l'array delle sottocategorie dopo la modifica
                categorie[categoriaIndex].sottocategorie.sort(compareByName);
                aggiornaCatalogoCategorie();
                salvaDati();
            }
        }

        // Funzione per modificare una sottosottocategoria
        function modificaSottosottocategoria(categoriaIndex, sottocategoriaIndex, sscIndex) {
            const nuovoNome = prompt('Nuovo nome della sottosottocategoria:', categorie[categoriaIndex].sottocategorie[sottocategoriaIndex].sottosottocategorie[sscIndex]);
            if (nuovoNome) {
                categorie[categoriaIndex].sottocategorie[sottocategoriaIndex].sottosottocategorie[sscIndex] = nuovoNome;
                // Ordina l'array delle sottosottocategorie dopo la modifica
                categorie[categoriaIndex].sottocategorie[sottocategoriaIndex].sottosottocategorie.sort();
                aggiornaCatalogoCategorie();
                salvaDati();
            }
        }

        // Funzione per salvare i dati in localStorage
        function salvaDati() {
            localStorage.setItem('transazioni', JSON.stringify(transazioni));
            localStorage.setItem('categorie', JSON.stringify(categorie));
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
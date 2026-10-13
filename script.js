document.addEventListener('DOMContentLoaded', () => {
  const ajouterBtn = document.getElementById('ajouter');
  const input = document.getElementById('nouvelle-tache');
  const liste = document.querySelector('#liste-taches ul');
  const citation = document.getElementById('citation');
  const sonValid = document.getElementById('audio-valid');
  const microBtn = document.getElementById('micro');
  const toast = document.getElementById('toast');

  // NOUVEAU : les éléments des catégories, dates, filtres et outils
  const selectCategorie = document.getElementById('categorie-nouvelle');
  const champDateNouvelle = document.getElementById('date-nouvelle');
  const filtresEl = document.getElementById('filtres');
  const videEl = document.getElementById('vide');

  const citations = [
    "Le voyage est un retour vers l’essentiel.",
    "Pars, explore, découvre…",
    "L’aventure t’attend juste après la liste !",
    "Chaque tâche cochée est un pas vers l’évasion."
  ];

  citation.textContent = citations[Math.floor(Math.random() * citations.length)];

  /* ==========================================================
     🏷️ CATÉGORIES
     Pour en ajouter ou renommer une, il suffit de modifier cette liste :
     le menu, les filtres et les couleurs se mettent à jour tout seuls.
     ========================================================== */
  const CATEGORIES = [
    { id: 'general', nom: 'Général',        couleur: '#e58e26' },
    { id: 'courses', nom: 'Courses',        couleur: '#00916e' },
    { id: 'rdv',     nom: 'Rdv',            couleur: '#0984e3' },
    { id: 'admin',   nom: 'Administratif',  couleur: '#6c5ce7' }
  ];
  // Retrouve une catégorie par son id (si inconnue → "Général")
  const catParId = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];

  // Remplit le menu déroulant d'ajout
  CATEGORIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nom;
    selectCategorie.appendChild(opt);
  });

  /* ==========================================================
     📅 DATES
     Les dates sont stockées au format "2026-10-11" (année-mois-jour).
     Ce format a un avantage : comparer deux dates comme du texte
     donne le bon résultat ("2026-10-09" < "2026-10-11").
     ========================================================== */
  function aujourdhuiISO() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const j = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + j;
  }

  // "2026-10-11" → "11/10"
  function dateCourte(iso) {
    const [, m, j] = iso.split('-');
    return j + '/' + m;
  }

  /* ==========================================================
     🔎 FILTRES + AFFICHAGE
     ========================================================== */
  let filtreActif = 'toutes';

  function dessinerFiltres() {
    filtresEl.innerHTML = '';
    [{ id: 'toutes', nom: 'Toutes', couleur: '#e58e26' }, ...CATEGORIES].forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'filtre' + (filtreActif === c.id ? ' actif' : '');
      b.textContent = c.nom;
      b.style.setProperty('--couleur', c.couleur);
      b.addEventListener('click', () => {
        filtreActif = c.id;
        dessinerFiltres();
        majAffichage();
      });
      filtresEl.appendChild(b);
    });
  }

  // Cache les tâches qui ne correspondent pas au filtre, et affiche
  // "Rien à faire" quand il n'y a rien à montrer.
  function majAffichage() {
    let visibles = 0;
    liste.querySelectorAll('li').forEach(li => {
      const cache = filtreActif !== 'toutes' && li.dataset.categorie !== filtreActif;
      li.classList.toggle('cache', cache);
      if (!cache && !li.classList.contains('fade-out')) visibles++;
    });
    videEl.classList.toggle('cache', visibles > 0);
  }

  dessinerFiltres();

  // ➕ Ajouter
  ajouterBtn.addEventListener('click', ajouterDepuisInput);
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') ajouterDepuisInput();
  });

  function ajouterDepuisInput() {
    const texte = input.value.trim();
    if (!texte) return;
    ajouterAvecOptions(texte);
    input.value = '';
  }

  // Ajoute une tâche avec la catégorie et la date choisies dans le formulaire,
  // puis vide la date (la catégorie reste, pratique pour enchaîner les courses).
  function ajouterAvecOptions(texte) {
    ajouterTache(texte, false, selectCategorie.value, champDateNouvelle.value);
    champDateNouvelle.value = '';
  }

  // 📝 Ajouter tâche
  function ajouterTache(texte, cochee = false, categorie = 'general', date = '') {
    const li = document.createElement('li');

    // On garde les infos de la tâche sur le <li> lui-même (attributs data-*).
    // C'est ce que lireTaches() relit pour sauvegarder et partager.
    li.dataset.texte = texte;
    li.dataset.date = date;

    // ⠿ POIGNÉE pour réorganiser (glisser-déposer)
    const poignee = document.createElement('span');
    poignee.textContent = '⠿';
    poignee.className = 'poignee';
    poignee.title = 'Maintenir et glisser pour déplacer';
    activerGlisser(poignee, li);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox-tache';
    checkbox.checked = cochee;

    const span = document.createElement('span');
    span.className = 'texte-tache';
    span.textContent = texte;
    if (cochee) span.classList.add('tache-barree');

    checkbox.addEventListener('change', () => {
      span.classList.toggle('tache-barree');
      // .catch : évite une erreur si le fichier son est absent
      if (checkbox.checked) sonValid.play().catch(() => {});
      majEtatDate();
      sauvegarderTaches();
    });

    // ✏️ BOUTON EDIT
    const btnEdit = document.createElement('span');
    btnEdit.textContent = '✏️';
    btnEdit.className = 'bouton-edit';

    btnEdit.addEventListener('click', () => lancerEdition());

    // ❌ BOUTON SUPPR
    const suppr = document.createElement('span');
    suppr.textContent = '❌';
    suppr.className = 'bouton-supprimer';

    suppr.addEventListener('click', () => supprimer(li));

    // 🏷️ + 📅 LIGNE DU BAS : catégorie (étiquette) et date
    const meta = document.createElement('div');
    meta.className = 'meta-tache';

    // Étiquette de catégorie : un appui = passe à la catégorie suivante
    const badge = document.createElement('span');
    badge.className = 'badge-cat';
    badge.tabIndex = 0;
    badge.setAttribute('role', 'button');
    badge.title = 'Toucher pour changer de catégorie';

    function appliquerCategorie(id) {
      const c = catParId(id);
      li.dataset.categorie = c.id;
      li.style.setProperty('--couleur', c.couleur); // colore le trait à gauche + l'étiquette
      badge.textContent = c.nom;
    }

    function changerCategorie() {
      const i = CATEGORIES.findIndex(c => c.id === li.dataset.categorie);
      appliquerCategorie(CATEGORIES[(i + 1) % CATEGORIES.length].id);
      sauvegarderTaches();
      majAffichage();
    }
    badge.addEventListener('click', changerCategorie);
    badge.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); changerCategorie(); }
    });

    // Champ date modifiable à tout moment
    const champDate = document.createElement('input');
    champDate.type = 'date';
    champDate.className = 'date-tache';
    champDate.value = date;
    champDate.setAttribute('aria-label', 'Date d’échéance');
    champDate.addEventListener('change', () => {
      li.dataset.date = champDate.value;
      majEtatDate();
      sauvegarderTaches();
    });

    // Petit texte "En retard" / "Aujourd'hui" (colore aussi la date via la classe du <li>)
    const etatDate = document.createElement('span');
    etatDate.className = 'etat-date';

    function majEtatDate() {
      const d = li.dataset.date;
      const auj = aujourdhuiISO();
      const active = d && !checkbox.checked;
      li.classList.toggle('en-retard', !!active && d < auj);
      li.classList.toggle('aujourdhui', !!active && d === auj);
      etatDate.textContent = li.classList.contains('en-retard') ? '⚠️ En retard'
                           : li.classList.contains('aujourdhui') ? '📌 Aujourd’hui' : '';
    }

    meta.appendChild(badge);
    meta.appendChild(champDate);
    meta.appendChild(etatDate);

    // ✏️ FONCTION EDIT
    function lancerEdition() {
      const inputEdit = document.createElement('input');
      inputEdit.value = span.textContent;
      inputEdit.className = 'input-edit';

      li.replaceChild(inputEdit, span);
      inputEdit.focus();

      // "Entrée" puis "blur" appelaient valider() deux fois : ce drapeau l'empêche.
      let termine = false;

      inputEdit.addEventListener('blur', valider);
      inputEdit.addEventListener('keypress', e => {
        if (e.key === 'Enter') valider();
      });

      function valider() {
        if (termine) return;
        termine = true;

        const val = inputEdit.value.trim();

        if (!val) {
          supprimer(li);
        } else {
          span.textContent = val;
          li.dataset.texte = val;
          if (checkbox.checked) span.classList.add('tache-barree');
          if (inputEdit.parentNode === li) li.replaceChild(span, inputEdit);
        }

        sauvegarderTaches();
      }
    }

    // ❌ FONCTION SUPPR AVEC ANIMATION
    function supprimer(element) {
      element.classList.add('fade-out');
      majAffichage();
      setTimeout(() => {
        element.remove();
        sauvegarderTaches();
        majAffichage();
      }, 300);
    }

    // 👉 ORDRE IMPORTANT
    li.appendChild(poignee);
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btnEdit);
    li.appendChild(suppr);
    li.appendChild(meta);

    appliquerCategorie(categorie);
    majEtatDate();

    liste.appendChild(li);

    sauvegarderTaches();
    majAffichage();
  }

  /* ==========================================================
     ↕️ GLISSER-DÉPOSER (réorganiser les tâches)
     On n'utilise pas le "drag & drop" classique du navigateur car il ne
     marche pas au doigt sur mobile. À la place on suit le doigt (pointer
     events) : tant qu'on garde la poignée ⠿ appuyée, on regarde quelle
     tâche est sous le doigt et on place la nôtre avant ou après.
     ========================================================== */
  function activerGlisser(poignee, li) {
    poignee.addEventListener('pointerdown', e => {
      e.preventDefault();
      poignee.setPointerCapture(e.pointerId); // on continue de suivre le doigt même hors de la poignée
      li.classList.add('en-deplacement');

      const bouger = ev => {
        // défilement automatique près des bords de l'écran
        if (ev.clientY < 80) window.scrollBy(0, -12);
        if (ev.clientY > window.innerHeight - 80) window.scrollBy(0, 12);

        const sous = document.elementFromPoint(ev.clientX, ev.clientY);
        const cible = sous && sous.closest('#liste-taches li');
        if (!cible || cible === li) return;

        const r = cible.getBoundingClientRect();
        const apres = ev.clientY > r.top + r.height / 2; // moitié basse = on passe après
        liste.insertBefore(li, apres ? cible.nextSibling : cible);
      };

      const fin = () => {
        li.classList.remove('en-deplacement');
        poignee.removeEventListener('pointermove', bouger);
        poignee.removeEventListener('pointerup', fin);
        poignee.removeEventListener('pointercancel', fin);
        sauvegarderTaches(); // le nouvel ordre est enregistré
      };

      poignee.addEventListener('pointermove', bouger);
      poignee.addEventListener('pointerup', fin);
      poignee.addEventListener('pointercancel', fin);
    });
  }

  // 📖 Lit la liste affichée et la renvoie sous forme de tableau
  // [{ texte, cochee, categorie, date }, ...]
  // Sert à la sauvegarde, au partage, aux rappels et à l'export.
  function lireTaches() {
    return [...liste.querySelectorAll('li')]
      .filter(li => !li.classList.contains('fade-out'))
      .map(li => ({
        texte: li.dataset.texte || '',
        cochee: li.querySelector('.checkbox-tache').checked,
        categorie: li.dataset.categorie || 'general',
        date: li.dataset.date || ''
      }));
  }

  // 💾 Sauvegarde automatique dans le navigateur
  function sauvegarderTaches() {
    localStorage.setItem('taches', JSON.stringify(lireTaches()));
  }

  // 🔁 Chargement (les anciennes tâches sans catégorie/date marchent toujours)
  let tachesSauvegardees = [];
  try {
    tachesSauvegardees = JSON.parse(localStorage.getItem('taches')) || [];
  } catch (e) { /* données illisibles : on repart d'une liste vide */ }

  tachesSauvegardees.forEach(t => {
    ajouterTache(t.texte, t.cochee, t.categorie || 'general', t.date || '');
  });
  majAffichage();

  /* ==========================================================
     🔔 Message de confirmation (toast)
     ========================================================== */
  let toastTimer;
  function afficherToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
  }

  /* ==========================================================
     🎤 DICTÉE VOCALE
     Utilise l'API "SpeechRecognition" du navigateur (gratuite).
     Fonctionne sur Chrome et Samsung Internet. Nécessite HTTPS.

     NOUVEAU : dictée de PLUSIEURS tâches d'un coup. On coupe la phrase
     aux mots "puis", "ensuite", "et aussi", "nouvelle tâche" et aux virgules.
     Exemple : « acheter du pain puis appeler le garage ensuite laver le van »
     → 3 tâches. (On ne coupe PAS sur "et" tout seul, sinon
     « du pain et du lait » serait coupé en deux.)
     ========================================================== */
  function decouperDictee(texte) {
    return texte
      .split(/\s*(?:,|;|\bpuis\b|\bensuite\b|\bet aussi\b|\bnouvelle tâche\b)\s*/i)
      .map(s => s.trim().replace(/[.!?]+$/, ''))
      .filter(Boolean)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1));
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    microBtn.style.display = 'none';
  } else {
    const reco = new SpeechRecognition();
    reco.lang = 'fr-FR';
    reco.interimResults = false;
    reco.maxAlternatives = 1;

    let enEcoute = false;

    microBtn.addEventListener('click', () => {
      if (enEcoute) {
        reco.stop();
      } else {
        try { reco.start(); } catch (e) { /* déjà en cours */ }
      }
    });

    reco.onstart = () => {
      enEcoute = true;
      microBtn.classList.add('ecoute');
      afficherToast('🎤 Je t’écoute…');
    };

    reco.onend = () => {
      enEcoute = false;
      microBtn.classList.remove('ecoute');
    };

    reco.onresult = (event) => {
      const morceaux = decouperDictee(event.results[0][0].transcript);
      if (!morceaux.length) return;

      // Chaque morceau devient une tâche (avec la catégorie / date choisies)
      const dateChoisie = champDateNouvelle.value;
      morceaux.forEach(t => ajouterTache(t, false, selectCategorie.value, dateChoisie));
      champDateNouvelle.value = '';

      afficherToast(morceaux.length === 1
        ? '✅ Ajouté : ' + morceaux[0]
        : '✅ ' + morceaux.length + ' tâches ajoutées');
    };

    reco.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        afficherToast('Micro refusé : autorise-le dans les réglages du navigateur');
      } else if (event.error === 'no-speech') {
        afficherToast('Je n’ai rien entendu, réessaie !');
      } else {
        afficherToast('Dictée impossible (' + event.error + ')');
      }
    };
  }

  /* ==========================================================
     📤 EXPORT / PARTAGE
     ========================================================== */

  // Fabrique le texte, par exemple :
  //    🌺 To do list Aurore – 11/10/2026
  //    ⬜ Faire les courses (Courses) 📅 12/10
  //    ✅ Réviser le van (Van)
  //    — 1/2 faites 🚐
  function genererTexte() {
    const taches = lireTaches();
    if (taches.length === 0) return '';

    const date = new Date().toLocaleDateString('fr-FR');
    const lignes = taches.map(t => {
      let ligne = (t.cochee ? '✅ ' : '⬜ ') + t.texte;
      if (t.categorie !== 'general') ligne += ' (' + catParId(t.categorie).nom + ')';
      if (t.date) ligne += ' 📅 ' + dateCourte(t.date);
      return ligne;
    });
    const faites = taches.filter(t => t.cochee).length;

    return '🌺 To do list Aurore – ' + date + '\n\n' +
           lignes.join('\n') + '\n\n' +
           '— ' + faites + '/' + taches.length + ' faites 🚐';
  }

  function texteOuAlerte() {
    const texte = genererTexte();
    if (!texte) afficherToast('La liste est vide, ajoute une tâche d’abord !');
    return texte;
  }

  // Menu de partage natif (Messenger, Instagram, Signal, Mail, SMS...)
  document.getElementById('btn-partager').addEventListener('click', async () => {
    const texte = texteOuAlerte();
    if (!texte) return;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'To do list Aurore', text: texte });
      } catch (e) { /* menu fermé : rien à faire */ }
    } else {
      copier(texte);
    }
  });

  // SMS : ouvre l'appli Messages avec le texte déjà écrit.
  // iPhone attend "sms:&body=", Android attend "sms:?body="
  document.getElementById('btn-sms').addEventListener('click', () => {
    const texte = texteOuAlerte();
    if (!texte) return;
    const separateur = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
    window.location.href = 'sms:' + separateur + 'body=' + encodeURIComponent(texte);
  });

  // WhatsApp : lien officiel qui pré-remplit le message
  document.getElementById('btn-whatsapp').addEventListener('click', () => {
    const texte = texteOuAlerte();
    if (!texte) return;
    window.open('https://wa.me/?text=' + encodeURIComponent(texte), '_blank');
  });

  document.getElementById('btn-copier').addEventListener('click', () => {
    const texte = texteOuAlerte();
    if (texte) copier(texte);
  });

  async function copier(texte) {
    try {
      await navigator.clipboard.writeText(texte);
      afficherToast('📋 Liste copiée !');
    } catch (e) {
      afficherToast('Copie impossible sur ce navigateur');
    }
  }

  /* ==========================================================
     🧹 NOUVEAU : EFFACER LES TÂCHES TERMINÉES
     ========================================================== */
  document.getElementById('btn-nettoyer').addEventListener('click', () => {
    const faites = [...liste.querySelectorAll('li')]
      .filter(li => li.querySelector('.checkbox-tache').checked);

    if (faites.length === 0) {
      afficherToast('Aucune tâche terminée à effacer');
      return;
    }
    if (!confirm('Effacer ' + faites.length + ' tâche(s) terminée(s) ?')) return;

    faites.forEach(li => li.classList.add('fade-out')); // même animation que ❌
    setTimeout(() => {
      faites.forEach(li => li.remove());
      sauvegarderTaches();
      majAffichage();
      afficherToast('🧹 ' + faites.length + ' tâche(s) effacée(s)');
    }, 300);
  });

  /* ==========================================================
     💾 NOUVEAU : SAUVEGARDE / RESTAURATION
     Les tâches ne vivent que dans le navigateur du téléphone. Si on vide
     les données du navigateur ou qu'on change de téléphone, elles
     disparaissent. Ce bouton crée un petit fichier .json (dossier
     "Téléchargements") qu'on peut garder, envoyer par mail, etc.
     ========================================================== */
  document.getElementById('btn-sauvegarder').addEventListener('click', () => {
    const contenu = JSON.stringify({ version: 1, date: aujourdhuiISO(), taches: lireTaches() }, null, 2);
    const blob = new Blob([contenu], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const lien = document.createElement('a');
    lien.href = url;
    lien.download = 'todo-aurore-' + aujourdhuiISO() + '.json';
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    afficherToast('💾 Sauvegarde enregistrée dans Téléchargements');
  });

  const fichierRestaurer = document.getElementById('fichier-restaurer');

  // Le bouton "Restaurer" ouvre le sélecteur de fichier (champ caché)
  document.getElementById('btn-restaurer').addEventListener('click', () => fichierRestaurer.click());

  fichierRestaurer.addEventListener('change', async () => {
    const fichier = fichierRestaurer.files[0];
    if (!fichier) return;

    try {
      const donnees = JSON.parse(await fichier.text());
      const taches = Array.isArray(donnees) ? donnees : donnees.taches;

      if (!Array.isArray(taches) || !taches.every(t => t && typeof t.texte === 'string')) {
        throw new Error('format');
      }
      if (!confirm('Remplacer la liste actuelle par les ' + taches.length + ' tâche(s) du fichier ?')) return;

      liste.innerHTML = '';
      taches.forEach(t => ajouterTache(t.texte, !!t.cochee, t.categorie || 'general', t.date || ''));
      sauvegarderTaches();
      majAffichage();
      afficherToast('📂 Liste restaurée (' + taches.length + ' tâches)');
    } catch (e) {
      afficherToast('Fichier invalide : choisis une sauvegarde Todo Aurore');
    } finally {
      fichierRestaurer.value = ''; // permet de rechoisir le même fichier
    }
  });

  /* ==========================================================
     🔔 NOUVEAU : RAPPELS
     Quand on ouvre l'appli (ou qu'on y revient), on regarde les tâches
     non terminées dont la date est aujourd'hui ou dépassée.
       • un message s'affiche toujours dans l'appli ;
       • si les rappels sont activés, une notification Android est aussi
         envoyée (une seule fois par jour).
     ⚠️ Limite honnête : une page web ne peut pas réveiller le téléphone
     toute seule quand elle est fermée (il faudrait un serveur).
     Le rappel se déclenche donc à l'ouverture de l'appli.
     ========================================================== */
  const btnRappels = document.getElementById('btn-rappels');

  const rappelsActifs = () =>
    'Notification' in window &&
    Notification.permission === 'granted' &&
    localStorage.getItem('rappels') === 'on';

  function majBoutonRappels() {
    btnRappels.textContent = rappelsActifs() ? '🔔 Rappels activés' : '🔔 Activer les rappels';
  }
  majBoutonRappels();

  btnRappels.addEventListener('click', async () => {
    if (!('Notification' in window)) {
      afficherToast('Notifications non disponibles sur ce navigateur');
      return;
    }
    if (rappelsActifs()) {                       // déjà actif → on désactive
      localStorage.setItem('rappels', 'off');
      majBoutonRappels();
      afficherToast('Rappels désactivés');
      return;
    }
    const permission = await Notification.requestPermission(); // Android demande l'autorisation
    if (permission === 'granted') {
      localStorage.setItem('rappels', 'on');
      afficherToast('🔔 Rappels activés');
      verifierRappels(true);
    } else {
      afficherToast('Autorisation refusée : active les notifications dans les réglages');
    }
    majBoutonRappels();
  });

  // Envoie une notification (via le service worker, obligatoire sur Android)
  async function notifier(titre, corps) {
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) {
        await reg.showNotification(titre, { body: corps, icon: 'icons/icon-192.png' });
      } else {
        new Notification(titre, { body: corps, icon: 'icons/icon-192.png' });
      }
    } catch (e) { /* tant pis : le message dans l'appli reste affiché */ }
  }

  function verifierRappels(forcer = false) {
    const auj = aujourdhuiISO();
    const aFaire = lireTaches().filter(t => !t.cochee && t.date && t.date <= auj);
    if (aFaire.length === 0) return;

    const retard = aFaire.filter(t => t.date < auj).length;
    const jour = aFaire.length - retard;
    const morceaux = [];
    if (jour) morceaux.push(jour + ' pour aujourd’hui');
    if (retard) morceaux.push(retard + ' en retard');
    const message = '📅 ' + morceaux.join(' et ');

    afficherToast(message);

    // Notification : une seule fois par jour (sauf quand on vient d'activer)
    if (rappelsActifs() && (forcer || localStorage.getItem('dernierRappel') !== auj)) {
      localStorage.setItem('dernierRappel', auj);
      notifier('🌺 To do list Aurore', message + ' : ' + aFaire.slice(0, 3).map(t => t.texte).join(', '));
    }
  }

  verifierRappels();
  // Quand on revient sur l'appli après l'avoir mise en arrière-plan
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      verifierRappels();
    }
  });

  /* ==========================================================
     📲 NOUVEAU : INSTALLATION SUR L'ÉCRAN D'ACCUEIL (PWA)
     Chrome / Samsung Internet envoient un évènement quand l'appli est
     installable : on garde cet évènement et on affiche le bouton 📲.
     ========================================================== */
  const btnInstaller = document.getElementById('btn-installer');
  let invitationInstall = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();          // on évite la bannière automatique
    invitationInstall = e;
    btnInstaller.hidden = false; // on montre notre bouton
  });

  btnInstaller.addEventListener('click', async () => {
    if (!invitationInstall) return;
    invitationInstall.prompt();
    await invitationInstall.userChoice;
    invitationInstall = null;
    btnInstaller.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    btnInstaller.hidden = true;
    afficherToast('🚐 Appli installée !');
  });

  // Enregistre le service worker (appli hors-ligne + notifications). Nécessite HTTPS.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

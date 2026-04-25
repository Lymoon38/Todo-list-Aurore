document.addEventListener('DOMContentLoaded', () => {
  const ajouterBtn = document.getElementById('ajouter');
  const input = document.getElementById('nouvelle-tache');
  const liste = document.querySelector('#liste-taches ul');
  const citation = document.getElementById('citation');
  const sonValid = document.getElementById('audio-valid');

  const citations = [
    "Le voyage est un retour vers l’essentiel.",
    "Pars, explore, découvre…",
    "L’aventure t’attend juste après la liste !",
    "Chaque tâche cochée est un pas vers l’évasion."
  ];

  citation.textContent = citations[Math.floor(Math.random() * citations.length)];

  // ➕ Ajouter
  ajouterBtn.addEventListener('click', ajouterDepuisInput);
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') ajouterDepuisInput();
  });

  function ajouterDepuisInput() {
    const texte = input.value.trim();
    if (!texte) return;
    ajouterTache(texte);
    input.value = '';
  }

  // 📝 Ajouter tâche
  function ajouterTache(texte, cochee = false) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox-tache';
    checkbox.checked = cochee;

    const span = document.createElement('span');
    span.textContent = texte;
    if (cochee) span.classList.add('tache-barree');

    checkbox.addEventListener('change', () => {
      span.classList.toggle('tache-barree');
      if (checkbox.checked) sonValid.play();
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

    // ✏️ FONCTION EDIT
    function lancerEdition() {
      const inputEdit = document.createElement('input');
      inputEdit.value = span.textContent;
      inputEdit.className = 'input-edit';

      li.replaceChild(inputEdit, span);
      inputEdit.focus();

      inputEdit.addEventListener('blur', valider);
      inputEdit.addEventListener('keypress', e => {
        if (e.key === 'Enter') valider();
      });

      function valider() {
        const val = inputEdit.value.trim();

        if (!val) {
          supprimer(li);
        } else {
          span.textContent = val;
          if (checkbox.checked) span.classList.add('tache-barree');
          li.replaceChild(span, inputEdit);
        }

        sauvegarderTaches();
      }
    }

    // ❌ FONCTION SUPPR AVEC ANIMATION
    function supprimer(element) {
      element.classList.add('fade-out');
      setTimeout(() => {
        element.remove();
        sauvegarderTaches();
      }, 300);
    }

    // 👉 ORDRE IMPORTANT
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btnEdit);
    li.appendChild(suppr);

    liste.appendChild(li);

    sauvegarderTaches();
  }

  // 💾 Sauvegarde SAFE (corrigée)
  function sauvegarderTaches() {
    const taches = [];
    liste.querySelectorAll('li').forEach(li => {
      const texte = li.querySelector('span:not(.bouton-edit):not(.bouton-supprimer)')?.textContent || '';
      const cochee = li.querySelector('input[type="checkbox"]')?.checked || false;
      taches.push({ texte, cochee });
    });
    localStorage.setItem('taches', JSON.stringify(taches));
  }

  // 🔁 Chargement
  const tachesSauvegardees = JSON.parse(localStorage.getItem('taches')) || [];
  tachesSauvegardees.forEach(t => {
    ajouterTache(t.texte, t.cochee);
  });
});
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

  // ➕ Clic sur bouton Ajouter
  ajouterBtn.addEventListener('click', () => {
    const texte = input.value.trim();
    if (texte === '') return;
    ajouterTache(texte);
    input.value = '';
  });

  // 📝 Ajouter une tâche à la liste
  function ajouterTache(texte, cochee = false) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox-tache';
    checkbox.checked = cochee;

    const texteTache = document.createElement('span');
    texteTache.textContent = texte;
    if (cochee) texteTache.classList.add('tache-barree');

    checkbox.addEventListener('change', () => {
      texteTache.classList.toggle('tache-barree');
      if (checkbox.checked) sonValid.play();
      sauvegarderTaches();
    });

    const boutonSuppr = document.createElement('span');
    boutonSuppr.textContent = '❌';
    boutonSuppr.className = 'bouton-supprimer';
    boutonSuppr.addEventListener('click', () => {
      li.remove();
      sauvegarderTaches();
    });

    li.appendChild(checkbox);
    li.appendChild(texteTache);
    li.appendChild(boutonSuppr);
    liste.appendChild(li);

    sauvegarderTaches();
  }

  // 💾 Sauvegarder les tâches dans localStorage
  function sauvegarderTaches() {
    const taches = [];
    liste.querySelectorAll('li').forEach(li => {
      const texte = li.querySelector('span')?.textContent || '';
      const cochee = li.querySelector('input[type="checkbox"]')?.checked || false;
      taches.push({ texte, cochee });
    });
    localStorage.setItem('taches', JSON.stringify(taches));
  }

  // 🔁 Charger les tâches existantes
  const tachesSauvegardees = JSON.parse(localStorage.getItem('taches')) || [];
  tachesSauvegardees.forEach(t => {
    ajouterTache(t.texte, t.cochee);
  });
});
# 🌺 Todo Aurore

Une application de **to-do list simple, stylée et mobile-friendly**, développée en HTML / CSS / JavaScript pur.

👉 Objectif : organiser ses tâches avec une interface fluide, légère et agréable à utiliser.

---

## 🚀 Fonctionnalités

- ➕ Ajout de tâches rapide
- 🎤 Dictée vocale (une ou **plusieurs tâches d'un coup** : « pain **puis** appeler le garage **ensuite** laver le van »)
- 🏷️ Catégories colorées (Général, Courses, Van, Administratif) + filtres
- 📅 Date d'échéance (⚠️ en retard / 📌 aujourd'hui)
- ↕️ Réorganisation par glisser-déposer (poignée ⠿)
- ✔️ Coche des tâches terminées
- ✏️ Modification des tâches (édition en direct)
- ❌ Suppression animée
- 🧹 Effacer toutes les tâches terminées
- 📤 Export / partage de la liste (menu de partage, SMS, WhatsApp, copier)
- 💾 Sauvegarde / restauration dans un fichier
- 🔔 Rappels des tâches du jour et en retard
- 📲 Installable sur l'écran d'accueil, fonctionne sans internet
- 💾 Sauvegarde automatique (localStorage) et restauration au rechargement
- 🎵 Petit son de validation
- 📱 Interface adaptée mobile

---

## 🛠️ Technologies utilisées

- HTML5, CSS3 (animations + responsive), JavaScript vanilla
- LocalStorage (sauvegarde locale)
- Web Speech API (dictée vocale), Web Share API (partage)
- PWA : manifest + service worker (installation, hors-ligne, notifications)

---

## 📁 Structure du projet

```
todo-aurore/
├── index.html
├── styles.css
├── script.js
├── manifest.json     (infos d'installation : nom, couleurs, icônes)
├── sw.js             (hors-ligne + notifications)
├── README.md
├── oiseau.mp3        (son de validation — à ajouter)
├── Images/
│   └── van.png
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## 🌐 Mettre en ligne (obligatoire pour le micro, l'installation et les rappels)

Ces fonctions exigent **HTTPS**. Le plus simple : glisser le dossier sur
https://app.netlify.com/drop (gratuit), ou utiliser GitHub Pages.

## 📲 Installer sur Samsung

Ouvrir le lien dans Chrome ou Samsung Internet → bouton « 📲 Installer l'appli »
(ou menu ⋮ → « Ajouter à l'écran d'accueil » / « Installer »).

## 🔄 Après une modification

Changer `todo-aurore-v1` en `v2` dans `sw.js` pour que le téléphone récupère la nouvelle version.

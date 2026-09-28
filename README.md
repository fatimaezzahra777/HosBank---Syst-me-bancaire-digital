# HosBank - Binôme B

Application Express/EJS de démonstration pour l'espace Chargé Client et l'espace Administrateur.

## Démarrer

```bash
npm install
npm start
```

Ouvrir http://localhost:3000/login. Une fois connecté, le tableau de bord est disponible sur http://localhost:3000/dashboard.

Comptes de démonstration (mot de passe commun `123456`) :

- Chargé Client : `ahmed@bank.com`
- Administrateur : `nadia@bank.com`

## Fonctions

### Chargé Client

- Consulter uniquement les clients qui lui sont affectés, leurs comptes, cartes, demandes et réclamations.
- Traiter les demandes RIB, compte épargne, carte virtuelle, PIN et opposition selon les transitions prévues.
- L'acceptation d'une demande épargne ou carte virtuelle crée le produit correspondant; une opposition traitée bloque une carte du client.
- Ouvrir et suivre des réclamations, ajouter une réponse/commentaire et consulter l'historique des interactions.

### Administrateur

- Consulter, créer, modifier et désactiver des utilisateurs; gérer leurs rôles.
- Affecter les clients aux chargés client.
- Créer et modifier les comptes, consulter les soldes et modifier leur statut.
- Consulter et modifier les statuts des cartes, y compris les oppositions.
- Superviser les virements, opérations, demandes, réclamations, activités et indicateurs.

## Écrans et code

- `src/views/login.ejs` : connexion de démonstration.
- `src/views/workspace.ejs` : espace Chargé Client et Admin avec navigation par sections.
- `src/public/css/workspace.css` : style responsive de l'espace équipe.
- `src/public/js/workspace.js` : chargement des données et actions de l'interface.
- `src/routes/route.js` et `src/controllers/bankController.js` : routes API et règles métier.
- `src/models/bankModel.js` : jeux de données initiaux de démonstration.

## Vérification

```bash
npm test
```

Le test d'intégration vérifie le login, les restrictions par rôle, l'affectation des clients, les transitions et effets des demandes, les réclamations/commentaires, les comptes, les cartes et la supervision.

## Limites de démonstration

Les données sont gardées en mémoire et reviennent aux exemples initiaux au redémarrage. Le mot de passe et les jetons sont simplifiés pour le projet scolaire. Cette version n'est pas adaptée à un usage bancaire réel et n'est pas encore reliée aux tables MySQL du fichier `database/db.sql`.

# HosBank - Système bancaire digital

Ce projet correspond au Binôme B : espace chargé client et espace administrateur.

## Objectif

Le but est de fournir une base simple et lisible d'API Express pour gérer :

- les clients et leurs comptes;
- les demandes (RIB, épargne, carte virtuelle, PIN, opposition);
- les réclamations et les commentaires;
- l'affectation des clients aux chargés client;
- la gestion des utilisateurs et des comptes côté admin;
- la supervision des opérations et des activités.

## Pourquoi ce code est simple

La logique a été organisée pour rester claire et compréhensible :

- les données sont centralisées dans un fichier de modèle;
- les contrôleurs gèrent la logique métier de chaque partie;
- les routes exposent les endpoints API de manière directe;
- l'application est prête pour une évolution vers une vraie base de données plus tard.

## Structure principale

- src/app.js : point d'entrée de l'application
- src/routes/route.js : toutes les routes API
- src/controllers : logique de gestion des clients et de l'admin
- src/models : données de test du système bancaire
- src/midllewars : middleware simple de sécurité

## Endpoints principaux

### Chargé client

- GET /api/clients
- GET /api/clients/:id
- GET /api/clients/:id/accounts
- GET /api/clients/:id/cards
- GET /api/clients/:id/requests
- GET /api/clients/:id/complaints
- PATCH /api/requests/:id/status
- POST /api/complaints
- PATCH /api/complaints/:id/status
- POST /api/comments

### Administration

- GET /api/admin/users
- POST /api/admin/users
- PATCH /api/admin/users/:id
- PATCH /api/admin/users/:id/status
- GET /api/admin/accounts
- PATCH /api/admin/accounts/:id/status
- GET /api/admin/cards
- PATCH /api/admin/cards/:id/status
- GET /api/admin/operations
- GET /api/admin/activities

## Exemple d'exécution

```bash
npm install
npm start
```

Puis ouvrir :

- http://localhost:3000/
- http://localhost:3000/api/clients

## Remarque

Ce projet est volontairement simple et pédagogique. Il ne contient pas de logique avancée, mais il couvre bien la structure fonctionnelle demandée pour le Binôme B.

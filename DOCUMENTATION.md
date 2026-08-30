# Equal Legal Aid - Documentation Complète

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation et Configuration](#installation-et-configuration)
4. [Démarrage de l'application](#démarrage-de-lapplication)
5. [Structure du projet](#structure-du-projet)
6. [Technologies principales](#technologies-principales)
7. [Règles métier](#règles-métier)
8. [Contribution et workflow Git](#contribution-et-workflow-git)
9. [Réutilisation et adaptation](#réutilisation-et-adaptation)
10. [Déploiement](#déploiement)
11. [Troubleshooting](#troubleshooting)
12. [Ressources utiles](#ressources-utiles)

---

## Vue d'ensemble

**Equal Legal Aid** est une plateforme web de visualisation et d'analyse de données relatives aux demandes d'asile en Grèce. Le projet est développé par [Data For Good](https://dataforgood.fr/) et fournit des tableaux de bord interactifs, des cartes géographiques et des analyses juridiques.

**URL en production** : https://equallegalaid.services.d4g.fr

---

## Architecture

Le projet suit une architecture full-stack avec séparation front-end/back-end :

```
14_EqualLegalAid
├── client/                 # Frontend React/TypeScript
│   ├── src/
│   │   ├── components/     # Composants React réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── redux/          # État global (Redux Toolkit)
│   │   ├── services/       # Services API (Airtable)
│   │   ├── utils/          # Fonctions utilitaires
│   │   ├── i18n/           # Configurations i18next
│   │   ├── types/          # Définitions TypeScript
│   │   ├── assets/         # Images, données statiques
│   │   └── main.tsx        # Point d'entrée
│   ├── Dockerfile          # Image Docker pour le client
│   ├── nginx.conf          # Configuration Nginx
│   └── package.json        # Dépendances npm
├── docker-compose.yml      # Orchestration des conteneurs
├── pyproject.toml          # Configuration Python (backend)
└── tox.ini                 # Configuration des tests
```

### Architecture générale

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATEUR (Browser)                 │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
                       ▼
        ┌──────────────────────────────────────┐
        │   Docker Container - Client (Nginx)   │
        │  ┌────────────────────────────────┐  │
        │  │  React + TypeScript + Vite    │  │
        │  │  - Dashboards                 │  │
        │  │  - Cartes interactives        │  │
        │  │  - Tables de données          │  │
        │  │  - Filtrage côté client       │  │
        │  └────────────────────────────────┘  │
        └──────────────────┬───────────────────┘
                           │ HTTP(S)
                           ▼
        ┌──────────────────────────────────────┐
        │       Services externes              │
        │  ┌────────────────────────────────┐  │
        │  │  Airtable API                 │  │
        │  │  (Base de données)             │  │
        │  │  - Cas juridiques              │  │
        │  │  - Statistiques d'asile        │  │
        │  │  - Options de filtrage         │  │
        │  └────────────────────────────────┘  │
        │  ┌────────────────────────────────┐  │
        │  │  MapLibre GL / Protomaps      │  │
        │  │  (Données cartographiques)     │  │
        │  │  - Limites géographiques       │  │
        │  │  - Données par région          │  │
        │  └────────────────────────────────┘  │
        └──────────────────────────────────────┘
```

### Flux de données détaillé

1. **À l'initialisation** :
   - React charge depuis Airtable : tables de jurisprudence, statistiques, options de filtres
   - Données cachées en Redux (`filtersSlice`, `chartSlice`)

2. **À chaque interaction utilisateur** :
   - Filtres appliqués côté frontend (Redux)
   - Pas de requête API supplémentaire (données déjà chargées)

3. **À la navigation** :
   - Les composants récupèrent les données du store Redux
   - Re-rendu en fonction des filtres actifs

**Important** : Actuellement, **toutes les requêtes API passent par le frontend**. Il n'y a pas de backend intermédiaire. Les clés Airtable doivent être configurées dans `.env`.

---

## Règles métier

### Domaine : Asile et protection internationale en Grèce

Le projet traite des données suivantes :

#### Jurisprudence
- **Source** : Base de cas juridiques Airtable
- **Contenu** : Décisions de tribunaux, jurisprudence, analyses légales
- **Traitement** : Recherche textuelle, filtrage par pays, date, type de décision
- **Export** : Téléchargement des sélections en ZIP (voir `downloadSelectedCaselawAsZip.ts`)

#### Statistiques d'asile
- **Demandes d'asile** : Évolution temporelle (graphiques)
- **Arrivées en Grèce** : Flux migratoires entrants
- **Décisions de protection** : Acceptations/refus par période
- **Taux de reconnaissance** : Pourcentage d'acceptation par nationalité/type
- **Camps** : Population dans les camps de réfugiés

#### Filtrage disponible
- Par **période** (date de la décision, arrivée, etc.)
- Par **nationalité** du demandeur
- Par **type de décision** (protection, rejet, etc.)
- Par **région géographique** en Grèce

#### Langues supportées
- Français (FR)
- Anglais (EN)
- Grec (EL)
- (Autres langues configurables via `locales/`)

### Points d'intégration critiques

Si tu réutilises le projet pour un autre contexte (autre pays, autre domaine) :

1. **Structure des données Airtable** - Doit correspondre aux schémas attendus dans `airtableService.ts`
2. **Types TypeScript** - Mettre à jour `types/` si la structure change
3. **Composants visuels** - Les noms de pays, régions, etc. sont en dur (à paramétrer)
4. **Traductions** - Ajouter les locales dans `i18n/locales/`

---

## Installation et Configuration

Voir **[client/README.md](client/README.md)** pour :
- Cloner le projet
- Installer les dépendances
- Configurer les variables d'environnement (clés Airtable, Protomaps)
- Extensions VS Code recommandées

**Résumé rapide** :
```bash
gh repo clone dataforgoodfr/14_EqualLegalAid
cd 14_EqualLegalAid/client
npm install
# Créer un fichier .env avec tes clés Airtable
npm run dev
```

---

## Démarrage de l'application

### Installation et commandes

Tous les détails d'installation et les commandes npm disponibles sont documentés dans **[client/README.md](client/README.md)**.

Pour démarrer rapidement :
```bash
cd client
npm install
npm run dev
```

L'application sera accessible à `http://localhost:5173`

---

## Structure du projet

### Dossier `/client/src`

#### Composants (`components/`)
- **Caselaws/** - Affichage de la jurisprudence
  - `CaselawList.tsx` - Liste des cas
  - `CaselawCard.tsx` - Carte de cas juridique
  - `DataTable.tsx` - Tableau de données
  - `Header.tsx` - En-tête avec filtres
  
- **Filter/** - Système de filtrage
  - `FilterPanel/` - Panneau de filtres
  - `FilterSearch/` - Recherche filtrée
  - `FilterAction/` - Actions de filtre
  - `filtersConfig/` - Configuration des filtres
  
- **Indicators/** - Tableaux de bord et graphiques
  - `ApplicationsEvolution*.tsx` - Évolution des demandes d'asile
  - `ArrivalsGreece*.tsx` - Arrivées en Grèce
  - `AsylumApplications.tsx` - Demandes d'asile
  - `ProtectionDecisions.tsx` - Décisions de protection
  - `RecognitionRates.tsx` - Taux de reconnaissance
  
- **Header/** - Navigation et en-tête
  - `HeaderComponent.tsx` - Composant principal
  - `HeaderNavigation.tsx` - Barre de navigation
  - `HeaderMobile.tsx` - Version mobile
  
- **LanguageSwitcher.tsx** - Sélecteur de langue
- **Loading.tsx** - Indicateur de chargement

#### Pages (`pages/`)
- **CaselawPage.tsx** - Page complète de jurisprudence
- **StatisticsPage/** - Tableau de bord statistique

#### Hooks (`hooks/`)
- `useAirtableCaselaw.ts` - Récupère les cas juridiques
- `useAirtableFilter.ts` - Récupère les options de filtrage
- `useApplicationsEvolution.ts` - Données d'évolution des demandes
- `useApplyFilters.ts` - Logique de filtrage
- `useDebounce.ts` - Débounce pour les entrées utilisateur

#### Services (`services/`)
- `airtableService.ts` - Gestion des requêtes Airtable
  - `getCaselaws()` - Récupère tous les cas juridiques
  - `getFilterOptions()` - Récupère les options disponibles pour les filtres
  - `searchCaselaws()` - Recherche textuelle dans les cas
  - Pas de backend intermédiaire : appels directs à l'API Airtable depuis le frontend

#### État global (`redux/`)
- `store.ts` - Configuration du store Redux
- `chartSlice.ts` - État des graphiques
- `filtersSlice.ts` - État des filtres

#### Internationalisation (`i18n/`)
- `i18n.ts` - Configuration i18next
- `locales/` - Fichiers de traduction (EN, FR, EL, etc.)

#### Styles et assets
- `index.css` - Styles globaux (avec Tailwind)
- `assets/` - Données GeoJSON et images
  - `countries.geojson` - Limites de pays
  - `gr.json` - Données géographiques de la Grèce

---

## Technologies principales

### Frontend

| Technologie | Version | Utilité |
|-------------|---------|---------|
| **React** | 19.2.0 | Framework UI |
| **TypeScript** | 5.9.3 | Typage statique |
| **Vite** | 7.2.4 | Build tool et dev server |
| **Tailwind CSS** | 4.2.0 | Framework CSS utility-first |
| **Redux Toolkit** | 2.11.2 | État global |
| **React Router** | 7.15.0 | Routage |
| **Recharts** | 3.8.0 | Graphiques et visualisations |
| **MapLibre GL** | 5.21.1 | Cartes interactives |
| **Airtable** | 0.12.2 | API pour données |
| **i18next** | 26.0.4 | Internationalisation |

### Backend & Infrastructure

| Technologie | Utilité |
|-------------|---------|
| **Python 3.12** | Traitement de données |
| **Docker** | Containerisation |
| **Nginx** | Serveur web / reverse proxy |
| **Traefik** | Orchestration DNS/TLS |

---

## Contribution et workflow Git

### Avant de commencer

1. Ouvrez VS Code à partir du **répertoire racine** (pas du dossier `client`)
2. Les extensions VS Code doivent être activées automatiquement
3. Installez les dépendances : `npm install`

### Workflow de contribution

```bash
# 1. Créer une branche de fonctionnalité
git branch feature/mon-feature
git checkout feature/mon-feature

# Ou en une seule commande
git checkout -b feature/mon-feature

# 2. Effectuer les changements
# (Prettier et ESLint s'exécutent automatiquement à la sauvegarde)

# 3. Vérifier le formatage et la qualité du code
npm run lint:fix
npm run format

# 4. Commiter les changements
git add .
git commit -m "feat: ajouter une nouvelle fonctionnalité"

# Utiliser les conventions de commit :
# - feat: nouvelle fonctionnalité
# - fix: correction de bug
# - docs: documentation
# - style: formatage
# - refactor: restructuration
# - test: tests
# - chore: maintenance

# 5. Pousser la branche
git push origin feature/mon-feature

# 6. Créer une Pull Request
gh pr create \
  --base main \
  --head feature/mon-feature \
  --title "feat: description de la fonctionnalité" \
  --body "Description détaillée des changements" \
  --reviewer @nom-du-reviewer
```

### Règles de code

- **Formatage** : Prettier (`npm run format`)
- **Linting** : ESLint (`npm run lint`)
- **CSS** : Stylelint (configuré automatiquement)
- **Langages** : TypeScript (typage strict)
- **Utilitaires CSS** : Tailwind CSS (éviter les CSS personnalisés quand possible)

---

## Réutilisation et adaptation

Ce projet peut être adapté pour :
- Un autre pays (remplacer les données Grèce par autre pays)
- Un autre domaine juridique (immigration, droit du travail, etc.)
- Une autre source de données (remplacer Airtable)

### Checklist de réutilisation

- [ ] **Adapter la source de données**
  - Créer une nouvelle base Airtable OU modifier `airtableService.ts` pour utiliser une autre API
  - S'assurer que les structures de données correspondent aux types TypeScript
  
- [ ] **Mettre à jour les types**
  - Vérifier/modifier `types/index.ts` et `types/filter.ts` selon la nouvelle structure de données
  
- [ ] **Adapter les composants**
  - Mettre à jour les noms de pays, régions, etc. (actuellement en dur dans les composants)
  - Modifier les graphiques si les métriques changent
  
- [ ] **Traductions**
  - Ajouter/modifier les fichiers dans `i18n/locales/`
  
- [ ] **Configuration visuelle**
  - Logos, couleurs, textes (voir composants `/Header`, `/Layout`)
  - Données géographiques : remplacer `assets/countries.geojson` et `assets/gr.json`

### Remplacer Airtable par une autre API

Si tu veux utiliser ta propre base de données :

1. Modifier `services/airtableService.ts` :
   ```typescript
   // Avant (Airtable)
   export async function getCaselaws() { 
     return await airtable./* Airtable SDK */ 
   }
   
   // Après (API personnalisée)
   export async function getCaselaws() { 
     const response = await fetch('https://ton-api.com/caselaws');
     return response.json();
   }
   ```

2. S'assurer que la réponse respecte les types définis dans `types/`

3. Mettre à jour les variables `.env` si nécessaire

---

## Déploiement

### Production

Le projet est automatiquement déployé sur **https://equallegalaid.services.d4g.fr** via CI/CD (infrastructure Data For Good).

### Prérequis

- Accès à Docker Registry
- Domaine configuré avec Traefik (ou infrastructure équivalente)
- Variables d'environnement dans le serveur

### Build production

```bash
# À partir du répertoire racine
docker-compose build

# Pousser vers le registre
docker-compose push
```

**Note** : La configuration `docker-compose.yml` suppose une infrastructure Traefik (reverse proxy). Pour un déploiement standard :
- Utiliser `docker build` seul
- Configurer Nginx manuellement ou en tant que service séparé
- Adapter le fichier `nginx.conf`

### Variables d'environnement en production

Les variables suivantes doivent être définies sur le serveur :

```bash
VITE_AIRTABLE_API_KEY=...
VITE_AIRTABLE_BASE_ID=...
VITE_AIRTABLE_TABLE_NAME=...
VITE_PROTOMAP_KEY=...
```

Tu peux passer ces variables :
- Via des **secrets Docker** (recommandé et sécurisé)
- Via des **fichiers .env** (moins sécurisé)
- Via des **variables d'environnement du serveur**

---

## Troubleshooting

### Le port 5173 est déjà utilisé

```bash
# Utiliser un port différent
npm run dev -- --port 3000
```

### Les clés Airtable ne fonctionnent pas

1. Vérifiez que le fichier `.env` existe dans `client/`
2. Vérifiez que les clés sont correctes sur [Airtable.com](https://airtable.com)
3. Redémarrez le serveur de développement après modification de `.env`

### Les modifications CSS ne s'appliquent pas

```bash
# Vider le cache Vite
rm -rf client/.vite

# Redémarrer le serveur
npm run dev
```

### ESLint ou Prettier refuse de passer

```bash
# Corriger automatiquement tous les problèmes
npm run lint:fix && npm run format

# Vérifier les erreurs restantes
npm run lint
```

---

## Ressources utiles

- 📚 [Documentation React](https://react.dev)
- 📚 [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- 📚 [Documentation Vite](https://vitejs.dev)
- 📚 [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- 📚 [Documentation Redux Toolkit](https://redux-toolkit.js.org)
- 📚 [Documentation Airtable API](https://airtable.com/developers/web/api/introduction)
- 📚 [Documentation MapLibre GL](https://maplibre.org/maplibre-gl-js)
- 📚 [Documentation i18next](https://www.i18next.com)

---

## Support et Contact

Pour toute question ou problème, veuillez :

1. Consulter les [issues GitHub](https://github.com/dataforgoodfr/14_EqualLegalAid/issues)
2. Créer une nouvelle issue avec :
   - Description du problème
   - Étapes pour reproduire
   - Environnement (OS, version Node.js, etc.)
3. Contacter l'équipe Data For Good

---

## Licence

Ce projet est sous licence [MIT](LICENSE).

---

**Dernière mise à jour** : Juin 2026  
**Mainteneur** : Data For Good

# Equal Legal Aid

<p align="center">
  <strong>Plateforme de visualisation et d'analyse de données sur l'asile en Grèce</strong>
</p>

<p align="center">
  Projet <a href="https://dataforgood.fr/">Data For Good</a> • 
  <a href="https://equallegalaid.services.d4g.fr/">Accès à la plateforme</a>
</p>

---

## 📖 Documentation

### Démarrage rapide

Pour développer localement, voir [client/README.md](client/README.md) :
```bash
cd client
npm install
npm run dev
```

### Documentation complète

Pour une documentation détaillée incluant :
- Architecture du projet
- Structure des fichiers
- Technologies utilisées
- Règles métier
- Guide de contribution
- Réutilisation et adaptation
- Déploiement
- Troubleshooting

Consultez **[DOCUMENTATION.md](DOCUMENTATION.md)**

---

## 🛠️ Technologies principales

- **Frontend** : React 19 + TypeScript + Vite + Tailwind CSS
- **Visualisations** : Recharts, MapLibre GL
- **État** : Redux Toolkit
- **Données** : Airtable API
- **Internationalisation** : i18next
- **Infrastructure** : Docker, Nginx, Traefik

---

## 👨‍💻 Contribution

voir [DOCUMENTATION.md - Contribution et workflow Git](DOCUMENTATION.md#contribution-et-workflow-git)

---

## 📝 Notes importantes

- Ouvrir VS Code depuis la **racine** du projet (pas depuis `client/`)
- Les fichiers `.env` ne doivent pas être committés
- Pour les détails de configuration, voir [client/README.md](client/README.md)

---

**Licence** : [MIT](LICENSE)  
**Mainteneur** : Data For Good

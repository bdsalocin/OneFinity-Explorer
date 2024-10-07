# Blockchain Explorer

## Description

Blockchain Explorer est une application React qui permet aux utilisateurs d'explorer les transactions sur le réseau OneFinity Testnet. L'application affiche des statistiques réseau, les transactions récentes, et un graphique des prix.

## Fonctionnalités

- Affichage des transactions récentes avec des détails tels que l'ID de transaction, l'expéditeur, le destinataire, le montant, l'horodatage, le statut et le gaz utilisé.
- Recherche de transactions par ID, expéditeur ou destinataire.
- Affichage de statistiques sur le réseau, y compris le nombre total de transactions, le temps moyen entre les blocs, l'époque actuelle et le nombre de validateurs actifs.
- Graphique des prix affichant les données des 30 derniers jours.

## Technologies Utilisées

- [React](https://reactjs.org/) - Bibliothèque JavaScript pour construire des interfaces utilisateur.
- [Recharts](https://recharts.org/en-US/) - Bibliothèque de graphiques pour React.
- [Lucide](https://lucide.dev/) - Icônes pour React.
- API de OneFinity Testnet pour récupérer les transactions et les statistiques.
- API de CoinGecko pour récupérer les données de prix.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé Node.js et npm sur votre machine.

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/bdsalocin/OneFinity-Explorer.git
   ```
2. Accédez au répertoire du projet :
   ```bash
   cd blockchain-explorer
   ```
3. Installez les dépendances :
   ```bash
   npm install
   ```

## Exécution

Pour exécuter l'application, utilisez la commande suivante :

```bash
npm start
```

Cela ouvrira l'application dans votre navigateur par défaut à l'adresse [http://localhost:3000](http://localhost:3000).

## Auteurs

- [bdsalocin](https://github.com/bdsalocin) - Développeur principal

## License

Ce projet est sous la licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

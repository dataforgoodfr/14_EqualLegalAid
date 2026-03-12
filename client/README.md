<h1 style="text-align:center">README</h1>
It is possible to run the client locally, directly from your computer or via a docker.

# Run the code directly

## Prerequisites

- Node.js (version 18 or higher)
- npm

## Installation

1. Navigate to the client directory:
```bash
  cd client
```

2. Install dependencies:
```bash
  npm install
```

3. Configure environment variables:
- The [.env](.env) file should contain your Airtable
credentials. This file should be put aside with the .env.example file, in the client folder :
```bash
VITE_AIRTABLE_API_KEY=your_api_key
VITE_AIRTABLE_BASE_ID=your_base_id
VITE_AIRTABLE_TABLE_NAME=your_table_name
```

## Recommended VS Code extensions
Most of the following extensions are used to keep the unity of the formatting rules

- EditorConfig
- ESLint
- Prettier - Code formatter
- Stylelint
- Tailwing CSS IntelliSense

Then, to make use the VS code configuration of this project, you should open VS Code on the root folder (not on the client sub-folder).

## Running the App

Start the development server :
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

*Nota* : You can type this code on the root directory and any sub directory such as the client sub directory.

## Other node commands

- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Run linter**: `npm run lint`
- **Format code**: `npm run format`

## Git commands
```sh
# get the code for the first time using the github cli
gh auth login
gh repo clone dataforgoodfr/14_EqualLegalAid
# get the updated code
git pull
# create a new branch and start working there
git branch name_of_the_new_branch
git checkout name_of_the_new_branch
# make a pull request
gh pr create --base main --head my-feature-branch --title "Add new feature" --body "This PR adds the new feature." --reviewer reviewer-name
```

# Run the code through the docker
TODO

# Local Development Setup

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
   - The [.env](.env) file should contain your Airtable credentials:
     ```
     VITE_AIRTABLE_API_KEY=your_api_key
     VITE_AIRTABLE_BASE_ID=your_base_id
     VITE_AIRTABLE_TABLE_NAME=your_table_name
     ```

## Running the App

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` 

## Other Commands

- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Run linter**: `npm run lint`
- **Format code**: `npm run format`

## Running from Root Directory

You can also run the app from the root directory:
```bash
npm run dev
```

# Student interest form

## Run locally

```sh
npm install
npm run dev
```

The page can be previewed without a Google Sheets connection, but submissions will stay disabled until the Apps Script web app is deployed and configured.

## Project structure

- `src/App.jsx` contains the form state and Google Sheets submission flow.
- `src/components/ApplicationForm.jsx` contains the focused student form.
- `src/main.jsx` starts the React app.
- `src/styles.css` imports Tailwind CSS and defines the shared theme and animations.
- `vite.config.js` enables the Tailwind Vite plugin.

## Connect a private Google Sheet

1. Create a Google Sheet for student interest submissions. Keep its sharing restricted to the course staff who need access; do not publish the sheet.
2. In that sheet, open **Extensions → Apps Script**. Replace the editor contents with [`apps-script/Code.gs`](./apps-script/Code.gs), then save.
3. In Apps Script, open **Project Settings → Script Properties** and add `SPREADSHEET_ID` with the ID from the sheet URL (`/spreadsheets/d/<ID>/edit`).
4. Choose **Deploy → New deployment → Web app**. Set **Execute as** to your account and **Who has access** to **Anyone**, then deploy and authorize it. The web app URL is needed so students can submit without signing in; keep the spreadsheet itself private. Only deploy code you trust.
5. Copy `.env.example` to `.env.local` and set the deployed URL ending in `/exec`:

   ```env
   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

6. Restart the development server or rebuild/redeploy the frontend. Whenever `apps-script/Code.gs` changes, open **Deploy > Manage deployments**, edit the existing web app deployment, select **New version**, and deploy it. This keeps the existing `/exec` URL and activates the updated server code. Submissions are written to the private `Student Interests` sheet; users of the form cannot read that sheet through this app.

The form collects a student's full name, email address, phone number, education/current work, laptop availability, and reason for being interested. The script validates the required fields on the server, serializes writes, and creates the `Student Interests` tab with matching headers. If the tab already exists with older headers, it reuses matching columns and adds missing columns without changing existing rows. User-entered text is stored as plain text to prevent spreadsheet formula injection. The deployment endpoint is public, so it includes basic input limits and a honeypot but is not an identity or abuse-proof system. Keep the sheet private and review access regularly.

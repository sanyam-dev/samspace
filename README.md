# samspace

Personal portfolio site — hand-coded HTML, CSS, and vanilla JavaScript. No framework, no build step.

## Structure

```
index.html          # the site
styles.css
script.js
assets/             # imagery
data/projects.json  # project data the site reads at runtime
prototypes/         # three header treatments from the wireframe
backend/            # local-only API + SQLite (not deployed)
```

The deployed site is fully static. `backend/` is a local authoring tool: projects live in SQLite,
and an export step writes `data/projects.json`, which the site fetches in the browser.

## Local development

Serve the root directory over HTTP (opening `index.html` via `file://` will block the `fetch`
for `projects.json`):

```bash
python3 -m http.server 5500
```

Then visit http://localhost:5500, or http://localhost:5500/prototypes/ for the header options.

## Editing projects

Projects are stored in SQLite at `backend/data/samspace.db`.

```bash
cd backend
npm install          # first time only
npm run db:seed      # seed placeholder projects into an empty database
npm run db:export    # write data/projects.json for the static site
```

Edit rows however you like (any SQLite client works), then re-run `npm run db:export` and commit
the updated `data/projects.json`.

The optional local API (`npm start`) serves the same data at `/api/projects` and accepts contact
submissions. It is useful for development but is not part of the deployment.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which copies `index.html`, `styles.css`,
`script.js`, `data/`, and `assets/` into a `_site` directory and publishes it to GitHub Pages.

Enable this once under **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### Contact form

The contact section uses a `mailto:` link, which needs no server. To collect submissions in a form
instead, point a `<form>` at a hosted form service such as Formspree — GitHub Pages cannot run
server-side code.

## Notes

All asset paths are relative, so the site works both at a custom domain and at a project URL like
`https://<user>.github.io/<repo>/`.

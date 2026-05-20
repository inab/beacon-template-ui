# Beacon UI

**Beacon UI** is the React-based front-end for the ELIXIR Beacon Network. It lets researchers query clinical data stored in an OMOP-CDM database through a Beacon v2 API.

---

## Installation

```bash
git clone -b docs/local-setup https://github.com/inab/beacon-template-ui.git
cd beacon-template-ui
```

---

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose installed

- The **database** running — start it from `database/` with `docker compose up -d`. This creates a Docker network named after that folder (`<folder-name>_beacon-network`). If your folder is not called `database`, update `docker-compose.yml` to match:

  ```yaml
  networks:
    beacon-api-network:
      external: true
      name: <your-folder-name>_beacon-network
  ```

- The **Beacon API** running — start it from `impd-beacon_omopcdm/beacon2-ri-api-main/` with `docker compose up --build -d`. The UI uses Nginx to forward browser requests to the API container internally. Nginx identifies the API container by its Docker-assigned name, which is derived from the folder where you run the API. If you placed the API in a folder called `beacon2-ri-api-main`, no changes are needed. Otherwise, run `docker ps` to find the actual container name and update `nginx.conf`:

  ```nginx
  location /api/ {
      proxy_pass http://<your-container-name>:5050/api/;
      ...
  }
  ```

Both services must be up before starting the UI.

---

## Start

```bash
docker compose up --build -d
```

The UI will be available at **http://localhost:8080**.

> Always use `--build`. Source files are copied into the image at build time, so changes to `src/` or `public/` will not appear until you rebuild.

---

## Customization

All UI behaviour is controlled by `public/config/config.json`. After editing this file, rebuild:

```bash
docker compose up --build -d
```

### Entry types

By default the UI shows all entry types returned by the API (`individuals`, `biosamples`, `cohorts`, etc.). To restrict which ones appear, set `visibleEntryTypes` inside the `ui` block:

```json
"ui": {
  "visibleEntryTypes": ["individuals"]
}
```

Only the entry types listed here will be shown. The order of the buttons follows `entryTypesOrder` (also inside `ui`). To show everything, set an empty array or remove the key entirely:

```json
"ui": {
  "visibleEntryTypes": []
}
```

### Filter modules

Enable or disable the filter panels in the sidebar:

```json
"omop": true,   // OMOP Filters panel
"hpo": true     // HPO Filters panel
```

Common Filters are always shown if `ui.commonFilters` is defined.

### Colors and logos

```json
"ui": {
  "colors": {
    "primary": "#023452",
    "secondary": "#f47d20"
  },
  "logos": {
    "main": "/assets/logos/elixir.png"
  }
}
```

### API URL

```json
"apiUrl": "/api"
```

Leave as `/api` when running with Docker (Nginx proxies internally). Set to a full URL (e.g. `http://localhost:5050/api`) only when developing without Docker.

---

## Development (without Docker)

```bash
yarn install
yarn start
```

The app runs at http://localhost:3000. Note that without Nginx, the `/api/` proxy is not available — you will need to set a full API URL in `public/config/config.json` and ensure the API has CORS configured.

---

## Project structure

```
beacon-ui/
├── public/
│   └── config/
│       └── config.json       # Runtime configuration (API URL, filters, colors…)
├── src/                      # React source code
├── nginx.conf                # Nginx config — includes the /api/ proxy block
├── docker-compose.yml
└── Dockerfile
```

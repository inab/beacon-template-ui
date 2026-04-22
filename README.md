# Beacon UI

**Beacon UI** is the front-end of the ELIXIR Beacon Network.  
It provides a user-friendly React-based interface to interact with Beacon API endpoints, enabling researchers to query genomic data across federated datasets through the [Beacon Specifications](https://docs.genomebeacons.org/).

This project is containerized with Docker and configured through JSON files, making it easy to deploy and adapt to specific organizational needs.

---

## Features

- 🌐 **React-based front-end** for the Beacon API  
- ⚡ Integrates directly with Beacon API endpoints  
- 🐳 Dockerized deployment for easy setup and portability  
- ⚙️ Configurable through `envs/default/config.json`  
- 🎨 Customizable look and feel to fit organizational requirements  

---


## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started) and Docker Compose installed
- The OMOP-CDM database running (see [IMPaCT-Data tutorial](https://impact-data-ref-imp.readthedocs.io/es/latest/content/ref-imp/components/local/synthetic-data-generator.html))
- The [Beacon OMOP-CDM API](https://gitlab.bsc.es/impact-data/impd-beacon_omopcdm) running

### Installation

Clone the repository:

```bash
git clone https://github.com/elixir-europe/beacon-ui.git
cd beacon-ui
```

### Configuration

The UI proxies all `/api/` requests through Nginx to the Beacon API container. Two values depend on your local setup:

**1. Docker network name** (`docker-compose.yml`)

The UI joins the Docker network created by the database `docker-compose.yml`. That network is named `<folder-name>_beacon-network`, where `<folder-name>` is the name of the directory where you placed the database `docker-compose.yml`.

If your database folder is **not** called `database`, create a `.env` file in this directory:

```env
DB_NETWORK=your-folder-name_beacon-network
```

If your database folder is called `database`, no `.env` file is needed.

**2. API container name** (`nginx.conf`)

The Nginx proxy forwards requests to the API container by name. The default is:

```
beacon2-ri-api-main-beacon-omopcdm-alchemy-1
```

This name is generated from the folder where the API `docker-compose.yml` is run (`beacon2-ri-api-main`) plus the service name. If you run the API from a different folder, update line 28 of `nginx.conf` accordingly.

### Build and run

```bash
docker compose up --build -d
```

The UI will be available at: http://localhost:8080


## Configuration
All configuration is handled through `public/config/config.json`.

To customize:

1. Edit `public/config/config.json`.

2. Rebuild the Docker image:
```bash
docker compose up --build -d
```

## Development
If you want to run the app locally without Docker:

```bash
yarn install
yarn start
```

The app will be available at http://localhost:3000


## Project structure
```php
├── envs/
│   └── default/
│       └── config.json
├── src/
├── public/
├── docker-compose.yml
└── README.md

```
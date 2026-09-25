# Infra local

`compose.yaml` levanta la infra de desarrollo (hoy: PostgreSQL 16).

```sh
cp .env.example .env                 # contraseñas locales
podman compose up -d                 # o: docker compose up -d
cp backend/.env.example backend/.env
cp backend/.env.pruebas.example backend/.env.pruebas.local
```

- **Puerto 5433**, no 5432: evita chocar con un PostgreSQL instalado en la
  máquina. Se cambia con `POSTGRES_PORT` en `.env`.
- **Bases**: `nexo` (desarrollo) y `nexo_pruebas` (tests de integración,
  se limpia entre suites). Roles `nexo_migrador` y `nexo_app` (ADR-0001).
- Los scripts de `infra/postgres/init/` solo corren al crear el volumen.
  `02-base-pruebas.sh` es idempotente y se puede correr a mano:
  `podman exec nexo_postgres_1 sh /docker-entrypoint-initdb.d/02-base-pruebas.sh`
  (en Git Bash, anteponer `MSYS_NO_PATHCONV=1`).

## Podman en Windows (WSL, rootful)

Con la máquina de Podman en modo *rootful*, los puertos publicados pueden no
llegar a `localhost` de Windows: se implementan con reglas nftables dentro de
la VM, no con un socket que el reenvío de WSL detecte. En ese caso, apuntar
los `.env` locales a la IP de la VM:

```sh
podman machine ssh -- "ip -4 -o addr show eth0"   # p. ej. 172.24.184.121
```

La IP puede cambiar al reiniciar Windows o WSL.

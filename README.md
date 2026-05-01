# Stock Market API

REST API for managing a stock market simulation

## Running

### Linux

```bash
sudo bash ./start.sh XXXX
```

### Windows

```bat
start.bat XXXX
```

Where XXXX = port

The port argument is optional, defaults to 8080 if omitted.

## Stack

- Node.js
- Fastify + TypeBox (schema validation)
- PostgreSQL via Drizzle ORM
- Docker, Traefik (load balancer)

## Endpoints
 
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/stocks` | Returns current state of the bank |
| `POST` | `/stocks` | Replace stock inventory |
| `GET` | `/wallets/:wallet_id` | Returns current state of the particular wallet |
| `POST` | `/wallets/:wallet_id/stocks/:stock_name` | Simulates sell or buy of a single stock |
| `GET` | `/wallets/:wallet_id/stocks/:stock_name` | Returns quantity of the specified stock in the specified wallet|
| `GET` | `/log` | Get full audit log |
| `POST` | `/chaos` | Kills an instance that serves this request|
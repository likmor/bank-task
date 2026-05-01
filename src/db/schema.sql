CREATE TABLE IF NOT EXISTS bank_stocks (
    stock_name  TEXT PRIMARY KEY,
    quantity    INTEGER NOT NULL CHECK (quantity >= 0)
);

CREATE TABLE IF NOT EXISTS wallet_stocks (
    wallet_id   TEXT    NOT NULL,
    stock_name  TEXT    NOT NULL,
    quantity    INTEGER NOT NULL CHECK (quantity >= 0),
    PRIMARY KEY (wallet_id, stock_name)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id          SERIAL  PRIMARY KEY,
    type        TEXT    NOT NULL CHECK (type IN ('buy', 'sell')),
    wallet_id   TEXT    NOT NULL,
    stock_name  TEXT    NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

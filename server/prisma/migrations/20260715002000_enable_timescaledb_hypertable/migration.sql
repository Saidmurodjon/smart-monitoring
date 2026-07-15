-- CLAUDE.md #5.1: sensor_readings jadvali vaqt seriyali samaradorlik uchun
-- TimescaleDB hypertable sifatida ishlatiladi. Bu Neon Postgres instansida
-- timescaledb kengaytmasi mavjud va yoqilishi mumkinligi tekshirilgan.
CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable('sensor_readings', 'recordedAt', if_not_exists => TRUE, migrate_data => TRUE);

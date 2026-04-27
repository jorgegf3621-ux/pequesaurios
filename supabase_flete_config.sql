-- ─── Configuración de flete ────────────────────────────────────────────────────
-- Ejecuta este SQL en Supabase → SQL Editor

-- 1. Tabla de parámetros del vehículo (fila única, id = 1)
CREATE TABLE IF NOT EXISTS flete_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  precio_gasolina NUMERIC(8,2) NOT NULL DEFAULT 24.50,
  rendimiento_kmpl NUMERIC(8,2) NOT NULL DEFAULT 14.00,
  margen_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  direccion_base TEXT DEFAULT 'San Nicolás de los Garza, Nuevo León, México',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Si la tabla ya existe, agregar la columna:
ALTER TABLE flete_config ADD COLUMN IF NOT EXISTS direccion_base TEXT DEFAULT 'San Nicolás de los Garza, Nuevo León, México';

-- Fila inicial (si no existe)
INSERT INTO flete_config (id, precio_gasolina, rendimiento_kmpl, margen_pct)
VALUES (1, 24.50, 14.00, 20.00)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabla de municipios con distancia desde tu base (San Nicolás)
CREATE TABLE IF NOT EXISTS municipios_flete (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  distancia_km NUMERIC(8,2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 99
);

-- Municipios con distancias aproximadas desde San Nicolás de los Garza
INSERT INTO municipios_flete (nombre, distancia_km, sort_order) VALUES
  ('San Nicolás de los Garza', 0,   1),
  ('Monterrey',                12,  2),
  ('Guadalupe',                15,  3),
  ('San Pedro Garza García',   22,  4),
  ('Escobedo',                 18,  5),
  ('Apodaca',                  20,  6),
  ('Santa Catarina',           28,  7),
  ('General Zuazua',           35,  8),
  ('García',                   48,  9),
  ('Otro municipio',           0,  10)
ON CONFLICT (nombre) DO NOTHING;

-- 3. RLS: lectura pública (el cotizador la necesita sin login)
ALTER TABLE flete_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read flete_config" ON flete_config;
CREATE POLICY "Public read flete_config" ON flete_config FOR SELECT USING (true);

ALTER TABLE municipios_flete ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read municipios_flete" ON municipios_flete;
CREATE POLICY "Public read municipios_flete" ON municipios_flete FOR SELECT USING (true);

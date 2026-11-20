-- TABLA PROFILES
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    nombres TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT CHECK (rol IN ('ciudadano', 'reciclador', 'admin')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA REQUESTS
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ciudadano_id UUID REFERENCES profiles(id) NOT NULL,
    reciclador_id UUID REFERENCES profiles(id),
    material TEXT NOT NULL,
    cantidad TEXT NOT NULL,
    direccion TEXT,
    latitud NUMERIC,
    longitud NUMERIC,
    estado TEXT CHECK (estado IN ('Pendiente', 'Aceptada', 'En proceso', 'Completada', 'Cancelada')) DEFAULT 'Pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- POLITICAS PROFILES
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- POLITICAS REQUESTS
-- Ciudadanos ven sus solicitudes, recicladores ven todas.
CREATE POLICY "View requests" ON requests FOR SELECT USING (true);
-- Solo los ciudadanos insertan solicitudes
CREATE POLICY "Insert requests" ON requests FOR INSERT WITH CHECK (auth.uid() = ciudadano_id);
-- Ciudadano actualiza sus propias, o reciclador actualiza si no tiene otro reciclador asignado
CREATE POLICY "Update requests" ON requests FOR UPDATE USING (auth.uid() = ciudadano_id OR auth.uid() = reciclador_id OR (estado = 'Pendiente' AND (SELECT rol FROM profiles WHERE id = auth.uid()) = 'reciclador'));

-- NOTA: Para el primer administrador, se debe registrar como usuario normal y luego ejecutar en Supabase SQL:
-- UPDATE profiles SET rol = 'admin' WHERE email = 'tu_correo_admin@email.com';

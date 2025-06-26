#!/usr/bin/env python3
import requests
import json

# Configurações do Supabase
SUPABASE_URL = "https://bqeaiftiwpxqjmsdwlbz.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZWFpZnRpd3B4cWptc2R3bGJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDg4MDM1MSwiZXhwIjoyMDY2NDU2MzUxfQ.UR3x4yVxWWe5bPYBUp4vt-w-VU7pRZMihv5hXMON--c"

def execute_sql(sql_command):
    """Executa um comando SQL no Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "sql": sql_command
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        return response.status_code, response.text
    except Exception as e:
        return 500, str(e)

def execute_direct_sql(sql_command):
    """Executa SQL diretamente via API REST"""
    url = f"{SUPABASE_URL}/rest/v1/"
    
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Para comandos DDL, usamos uma abordagem diferente
    # Vamos tentar executar via função personalizada
    
    print(f"Executando: {sql_command[:50]}...")
    
    # Como não temos uma função exec_sql, vamos usar psycopg2 diretamente
    import psycopg2
    
    try:
        conn = psycopg2.connect(
            host="bqeaiftiwpxqjmsdwlbz.supabase.co",
            database="postgres",
            user="postgres",
            password="UR3x4yVxWWe5bPYBUp4vt-w-VU7pRZMihv5hXMON--c",
            port=5432
        )
        
        cur = conn.cursor()
        cur.execute(sql_command)
        conn.commit()
        cur.close()
        conn.close()
        
        return 200, "Sucesso"
        
    except Exception as e:
        return 500, str(e)

def main():
    print("🔧 Executando script de atualização do schema...")
    
    # Comandos SQL para executar
    sql_commands = [
        # 1. Atualizar user_profiles
        """ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'common_user' CHECK (user_type IN ('common_user', 'contractor', 'admin')),
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS nif TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';""",

        # 2. Criar tabela material_categories
        """CREATE TABLE IF NOT EXISTS material_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES material_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);""",

        # 3. Criar tabela materials
        """CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES material_categories(id),
    basic_price DECIMAL(10,2) DEFAULT 0,
    medium_price DECIMAL(10,2) DEFAULT 0,
    luxury_price DECIMAL(10,2) DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'unidade',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);""",

        # 4. Habilitar RLS
        "ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE materials ENABLE ROW LEVEL SECURITY;",

        # 5. Criar políticas
        'CREATE POLICY "Anyone can view categories" ON material_categories FOR SELECT USING (true);',
        'CREATE POLICY "Users can manage materials" ON materials FOR ALL USING (created_by = auth.uid() OR created_by IS NULL);',

        # 6. Inserir dados iniciais
        """INSERT INTO material_categories (name, description, sort_order) VALUES
('Cerâmica', 'Azulejos, pavimentos cerâmicos', 1),
('Tintas', 'Tintas interiores e exteriores', 2),
('Pavimentos', 'Laminados, parquet, vinílicos', 3),
('Mão de Obra', 'Serviços de instalação', 4)
ON CONFLICT DO NOTHING;""",

        # 7. Inserir material de exemplo
        """INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 'Azulejo Cerâmico 30x60', 'Azulejo para paredes', id, 8.50, 15.00, 35.00, 'm²'
FROM material_categories WHERE name = 'Cerâmica'
ON CONFLICT DO NOTHING;"""
    ]
    
    success_count = 0
    error_count = 0
    
    for i, sql_command in enumerate(sql_commands, 1):
        print(f"\n[{i}/{len(sql_commands)}] Executando comando...")
        status_code, response = execute_direct_sql(sql_command)
        
        if status_code == 200:
            print(f"✅ Sucesso: {response}")
            success_count += 1
        else:
            print(f"❌ Erro: {response}")
            error_count += 1
    
    print(f"\n🎯 Resumo:")
    print(f"✅ Sucessos: {success_count}")
    print(f"❌ Erros: {error_count}")
    
    if error_count == 0:
        print("🚀 Schema atualizado com sucesso!")
    else:
        print("⚠️ Alguns comandos falharam. Verifique os erros acima.")

if __name__ == "__main__":
    main()


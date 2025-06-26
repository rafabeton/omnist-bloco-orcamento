#!/usr/bin/env python3
import psycopg2
import sys
import time

# Configurações de conexão
DB_CONFIG = {
    'host': 'bqeaiftiwpxqjmsdwlbz.supabase.co',
    'database': 'postgres',
    'user': 'postgres',
    'password': 'UR3x4yVxWWe5bPYBUp4vt-w-VU7pRZMihv5hXMON--c',
    'port': 5432,
    'connect_timeout': 10
}

def execute_sql_command(sql_command, description=""):
    """Executa um comando SQL individual"""
    try:
        print(f"🔧 Executando: {description}")
        
        # Conectar ao banco
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        
        # Executar comando
        cur = conn.cursor()
        cur.execute(sql_command)
        
        # Fechar conexões
        cur.close()
        conn.close()
        
        print(f"✅ Sucesso: {description}")
        return True
        
    except Exception as e:
        print(f"❌ Erro: {description} - {str(e)}")
        return False

def main():
    print("🚀 Iniciando execução automática do schema SQL...")
    
    # Lista de comandos SQL para executar
    sql_commands = [
        # 1. Atualizar user_profiles
        ("""ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'common_user',
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';""", "Atualizar user_profiles"),

        # 2. Criar material_categories
        ("""CREATE TABLE IF NOT EXISTS material_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);""", "Criar material_categories"),

        # 3. Criar materials
        ("""CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES material_categories(id),
    basic_price DECIMAL(10,2) DEFAULT 0,
    medium_price DECIMAL(10,2) DEFAULT 0,
    luxury_price DECIMAL(10,2) DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'unidade',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);""", "Criar materials"),

        # 4. Habilitar RLS
        ("ALTER TABLE material_categories ENABLE ROW LEVEL SECURITY;", "Habilitar RLS categories"),
        ("ALTER TABLE materials ENABLE ROW LEVEL SECURITY;", "Habilitar RLS materials"),

        # 5. Criar políticas
        ('CREATE POLICY "Anyone can view categories" ON material_categories FOR SELECT USING (true);', "Política categories"),
        ('CREATE POLICY "Users can manage materials" ON materials FOR ALL USING (true);', "Política materials"),

        # 6. Inserir categorias
        ("""INSERT INTO material_categories (name, description, sort_order) VALUES
('Cerâmica', 'Azulejos e pavimentos', 1),
('Tintas', 'Tintas e vernizes', 2),
('Pavimentos', 'Laminados e parquet', 3),
('Mão de Obra', 'Serviços', 4)
ON CONFLICT DO NOTHING;""", "Inserir categorias"),

        # 7. Inserir materiais
        ("""INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 'Azulejo 30x60', 'Azulejo cerâmico', id, 8.50, 15.00, 35.00, 'm²'
FROM material_categories WHERE name = 'Cerâmica'
ON CONFLICT DO NOTHING;""", "Inserir material azulejo"),

        ("""INSERT INTO materials (name, description, category_id, basic_price, medium_price, luxury_price, unit) 
SELECT 'Tinta Interior', 'Tinta para paredes', id, 12.00, 25.00, 45.00, 'L'
FROM material_categories WHERE name = 'Tintas'
ON CONFLICT DO NOTHING;""", "Inserir material tinta"),
    ]
    
    success_count = 0
    total_commands = len(sql_commands)
    
    for i, (sql_command, description) in enumerate(sql_commands, 1):
        print(f"\n[{i}/{total_commands}]", end=" ")
        
        if execute_sql_command(sql_command, description):
            success_count += 1
        
        # Pequena pausa entre comandos
        time.sleep(0.5)
    
    print(f"\n🎯 RESUMO FINAL:")
    print(f"✅ Sucessos: {success_count}/{total_commands}")
    print(f"❌ Falhas: {total_commands - success_count}/{total_commands}")
    
    if success_count == total_commands:
        print("🚀 SCHEMA ATUALIZADO COM SUCESSO!")
        print("✅ Todas as funcionalidades estão agora disponíveis!")
    elif success_count > 0:
        print("⚠️ Parcialmente concluído. Algumas funcionalidades podem não estar disponíveis.")
    else:
        print("❌ Falha completa. Verifique a conectividade com o Supabase.")
    
    return success_count == total_commands

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


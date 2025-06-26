#!/usr/bin/env python3
import psycopg2
import sys

# Configurações de conexão
DB_CONFIG = {
    'host': 'bqeaiftiwpxqjmsdwlbz.supabase.co',
    'database': 'postgres',
    'user': 'postgres',
    'password': 'UR3x4yVxWWe5bPYBUp4vt-w-VU7pRZMihv5hXMON--c',
    'port': 5432
}

def add_columns():
    try:
        # Conectar à base de dados
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        print("Conectado ao Supabase com sucesso!")
        
        # Adicionar colunas necessárias
        columns_to_add = [
            "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'common_user';",
            "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company_name TEXT;",
            "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city TEXT;",
            "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;",
            "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS nif TEXT;",
            "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';"
        ]
        
        for sql in columns_to_add:
            print(f"Executando: {sql}")
            cur.execute(sql)
            
        # Confirmar mudanças
        conn.commit()
        print("✅ Todas as colunas foram adicionadas com sucesso!")
        
        # Verificar colunas existentes
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_profiles'
            ORDER BY ordinal_position;
        """)
        
        columns = cur.fetchall()
        print("\n📋 Colunas na tabela user_profiles:")
        for col_name, col_type in columns:
            print(f"  - {col_name}: {col_type}")
            
        cur.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    success = add_columns()
    sys.exit(0 if success else 1)


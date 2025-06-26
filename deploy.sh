#!/bin/bash

# =============================================================================
# SCRIPT DE DEPLOY AUTOMATIZADO - OMNIST BLOCO DE ORÇAMENTO
# Desenvolvido seguindo melhores práticas de DevOps
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Project configuration
PROJECT_NAME="omnist-bloco-orcamento"
VERCEL_URL="https://omnist-manus-v2.vercel.app"
BUILD_DIR=".next"

log_info "🚀 Iniciando deploy automatizado do $PROJECT_NAME"
log_info "📅 $(date)"

# =============================================================================
# STEP 1: Environment Verification
# =============================================================================
log_info "🔍 STEP 1: Verificando ambiente..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado. Execute o script no diretório raiz do projeto."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
log_info "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
log_info "npm version: $NPM_VERSION"

log_success "Ambiente verificado com sucesso"

# =============================================================================
# STEP 2: Clean Previous Build
# =============================================================================
log_info "🧹 STEP 2: Limpando builds anteriores..."

if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
    log_info "Diretório $BUILD_DIR removido"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf "node_modules/.cache"
    log_info "Cache do node_modules limpo"
fi

log_success "Limpeza concluída"

# =============================================================================
# STEP 3: Install Dependencies
# =============================================================================
log_info "📦 STEP 3: Instalando dependências..."

npm ci --silent
if [ $? -eq 0 ]; then
    log_success "Dependências instaladas com sucesso"
else
    log_error "Falha na instalação das dependências"
    exit 1
fi

# =============================================================================
# STEP 4: TypeScript Type Checking
# =============================================================================
log_info "🔍 STEP 4: Verificando tipos TypeScript..."

npx tsc --noEmit
if [ $? -eq 0 ]; then
    log_success "Verificação de tipos bem-sucedida"
else
    log_error "Erros de TypeScript encontrados"
    exit 1
fi

# =============================================================================
# STEP 5: Build Production
# =============================================================================
log_info "🏗️ STEP 5: Fazendo build de produção..."

npm run build
if [ $? -eq 0 ]; then
    log_success "Build de produção concluído"
else
    log_error "Falha no build de produção"
    exit 1
fi

# Verify build output
if [ ! -d "$BUILD_DIR" ]; then
    log_error "Diretório de build não foi criado"
    exit 1
fi

BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
log_info "Tamanho do build: $BUILD_SIZE"

# =============================================================================
# STEP 6: Git Status Check
# =============================================================================
log_info "📝 STEP 6: Verificando status do Git..."

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    log_warning "Há mudanças não commitadas"
    git status --porcelain
    
    read -p "Deseja fazer commit das mudanças? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "🚀 Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
        log_success "Commit realizado"
    fi
fi

# =============================================================================
# STEP 7: Deploy to Vercel
# =============================================================================
log_info "🚀 STEP 7: Fazendo deploy para Vercel..."

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    log_warning "Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Deploy using git push (triggers automatic deployment)
git push origin main
if [ $? -eq 0 ]; then
    log_success "Código enviado para GitHub"
else
    log_error "Falha no push para GitHub"
    exit 1
fi

log_info "Aguardando deploy automático do Vercel..."

# =============================================================================
# STEP 8: Health Check
# =============================================================================
log_info "🏥 STEP 8: Verificando saúde da aplicação..."

# Wait for deployment to complete
sleep 30

# Function to check URL
check_url() {
    local url=$1
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Tentativa $attempt/$max_attempts: Verificando $url"
        
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
        
        if [ "$response" = "200" ]; then
            log_success "URL respondendo corretamente (HTTP $response)"
            return 0
        else
            log_warning "URL retornou HTTP $response"
            sleep 10
            ((attempt++))
        fi
    done
    
    log_error "URL não está respondendo após $max_attempts tentativas"
    return 1
}

# Check main URL
if check_url "$VERCEL_URL"; then
    log_success "Deploy verificado com sucesso!"
else
    log_error "Deploy falhou na verificação"
    exit 1
fi

# =============================================================================
# STEP 9: Final Report
# =============================================================================
log_info "📊 STEP 9: Relatório final..."

echo
echo "=================================="
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "=================================="
echo "📅 Data: $(date)"
echo "🌐 URL: $VERCEL_URL"
echo "📦 Build Size: $BUILD_SIZE"
echo "🔗 Git Commit: $(git rev-parse --short HEAD)"
echo "=================================="
echo

log_success "Script de deploy executado com sucesso!"
log_info "A aplicação está agora disponível em: $VERCEL_URL"

# =============================================================================
# STEP 10: Post-Deploy Verification
# =============================================================================
log_info "🔍 STEP 10: Verificação pós-deploy..."

# Test critical endpoints
ENDPOINTS=(
    "/"
    "/login"
    "/dashboard"
    "/calculadora"
)

for endpoint in "${ENDPOINTS[@]}"; do
    url="$VERCEL_URL$endpoint"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "200" ] || [ "$response" = "302" ]; then
        log_success "✅ $endpoint (HTTP $response)"
    else
        log_warning "⚠️ $endpoint (HTTP $response)"
    fi
done

echo
log_success "🎊 DEPLOY AUTOMATIZADO CONCLUÍDO!"
echo "Acesse: $VERCEL_URL"


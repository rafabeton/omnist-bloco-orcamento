// DADOS MOCK PARA DESENVOLVIMENTO
// Estes dados simulam as tabelas que serão criadas no futuro

export interface MaterialCategory {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  icon?: string;
}

export interface Material {
  id: string;
  name: string;
  description: string;
  category_id: string;
  basic_price: number;
  medium_price: number;
  luxury_price: number;
  unit: string;
  brand?: string;
  supplier?: string;
  image_url?: string;
}

export interface QualityLevel {
  level: 'basic' | 'medium' | 'luxury';
  title: string;
  description: string;
  icon: string;
  multiplier: number;
  features: string[];
}

// CATEGORIAS DE MATERIAIS
export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: '1',
    name: 'Cerâmica',
    description: 'Azulejos, pavimentos cerâmicos, louças sanitárias',
    sort_order: 1,
    icon: '🏺'
  },
  {
    id: '2',
    name: 'Tintas e Vernizes',
    description: 'Tintas interiores, exteriores, primers, vernizes',
    sort_order: 2,
    icon: '🎨'
  },
  {
    id: '3',
    name: 'Pavimentos',
    description: 'Laminados, parquet, vinílicos, pedra natural',
    sort_order: 3,
    icon: '🏠'
  },
  {
    id: '4',
    name: 'Elétrica',
    description: 'Cabos, tomadas, interruptores, quadros elétricos',
    sort_order: 4,
    icon: '⚡'
  },
  {
    id: '5',
    name: 'Canalização',
    description: 'Tubos, conexões, torneiras, sanitas, bidés',
    sort_order: 5,
    icon: '🚿'
  },
  {
    id: '6',
    name: 'Carpintaria',
    description: 'Madeiras, ferragens, portas, janelas',
    sort_order: 6,
    icon: '🪵'
  },
  {
    id: '7',
    name: 'Mão de Obra',
    description: 'Serviços de instalação e aplicação',
    sort_order: 7,
    icon: '🔨'
  }
];

// MATERIAIS COM PREÇOS POR PADRÃO
export const MATERIALS: Material[] = [
  // CERÂMICA
  {
    id: '1',
    name: 'Azulejo Cerâmico 30x60',
    description: 'Azulejo cerâmico para paredes, várias cores disponíveis',
    category_id: '1',
    basic_price: 8.50,
    medium_price: 15.00,
    luxury_price: 35.00,
    unit: 'm²',
    brand: 'Cerâmica Nacional'
  },
  {
    id: '2',
    name: 'Pavimento Cerâmico 60x60',
    description: 'Pavimento cerâmico antiderrapante para casas de banho',
    category_id: '1',
    basic_price: 12.00,
    medium_price: 22.00,
    luxury_price: 45.00,
    unit: 'm²',
    brand: 'Cerâmica Nacional'
  },
  {
    id: '3',
    name: 'Sanita Suspensa',
    description: 'Sanita suspensa com autoclismo embutido',
    category_id: '1',
    basic_price: 180.00,
    medium_price: 350.00,
    luxury_price: 650.00,
    unit: 'unidade',
    brand: 'Roca'
  },

  // TINTAS
  {
    id: '4',
    name: 'Tinta Plástica Interior',
    description: 'Tinta lavável para interiores, várias cores',
    category_id: '2',
    basic_price: 12.00,
    medium_price: 25.00,
    luxury_price: 45.00,
    unit: 'L',
    brand: 'CIN'
  },
  {
    id: '5',
    name: 'Tinta Exterior Fachadas',
    description: 'Tinta resistente às intempéries para exteriores',
    category_id: '2',
    basic_price: 18.00,
    medium_price: 32.00,
    luxury_price: 55.00,
    unit: 'L',
    brand: 'Robbialac'
  },

  // PAVIMENTOS
  {
    id: '6',
    name: 'Pavimento Laminado AC4',
    description: 'Pavimento laminado resistente, várias cores',
    category_id: '3',
    basic_price: 15.00,
    medium_price: 35.00,
    luxury_price: 65.00,
    unit: 'm²',
    brand: 'Quick-Step'
  },
  {
    id: '7',
    name: 'Parquet Carvalho',
    description: 'Parquet em madeira maciça de carvalho',
    category_id: '3',
    basic_price: 45.00,
    medium_price: 85.00,
    luxury_price: 150.00,
    unit: 'm²',
    brand: 'Boen'
  },

  // ELÉTRICA
  {
    id: '8',
    name: 'Cabo Elétrico 2.5mm',
    description: 'Cabo elétrico para instalações domésticas',
    category_id: '4',
    basic_price: 1.20,
    medium_price: 1.80,
    luxury_price: 2.50,
    unit: 'm',
    brand: 'Cabelte'
  },
  {
    id: '9',
    name: 'Tomada Schuko',
    description: 'Tomada com terra para aparelhos elétricos',
    category_id: '4',
    basic_price: 3.50,
    medium_price: 8.00,
    luxury_price: 15.00,
    unit: 'unidade',
    brand: 'Legrand'
  },

  // CANALIZAÇÃO
  {
    id: '10',
    name: 'Tubo PVC 32mm',
    description: 'Tubo PVC para águas residuais',
    category_id: '5',
    basic_price: 2.80,
    medium_price: 4.20,
    luxury_price: 6.50,
    unit: 'm',
    brand: 'Nicoll'
  },
  {
    id: '11',
    name: 'Torneira Misturadora',
    description: 'Torneira misturadora para lavatório',
    category_id: '5',
    basic_price: 45.00,
    medium_price: 120.00,
    luxury_price: 280.00,
    unit: 'unidade',
    brand: 'Grohe'
  },

  // CARPINTARIA
  {
    id: '12',
    name: 'Porta Interior Lisa',
    description: 'Porta interior em MDF com alizares',
    category_id: '6',
    basic_price: 85.00,
    medium_price: 150.00,
    luxury_price: 280.00,
    unit: 'unidade',
    brand: 'Leroy Merlin'
  },

  // MÃO DE OBRA
  {
    id: '13',
    name: 'Aplicação de Azulejo',
    description: 'Serviço de aplicação de azulejo em paredes',
    category_id: '7',
    basic_price: 12.00,
    medium_price: 18.00,
    luxury_price: 25.00,
    unit: 'm²'
  },
  {
    id: '14',
    name: 'Pintura de Paredes',
    description: 'Serviço de pintura de paredes interiores',
    category_id: '7',
    basic_price: 8.00,
    medium_price: 12.00,
    luxury_price: 18.00,
    unit: 'm²'
  },
  {
    id: '15',
    name: 'Instalação Pavimento',
    description: 'Serviço de instalação de pavimento laminado',
    category_id: '7',
    basic_price: 6.00,
    medium_price: 10.00,
    luxury_price: 15.00,
    unit: 'm²'
  },
  {
    id: '16',
    name: 'Instalação Elétrica',
    description: 'Serviço de instalação elétrica completa',
    category_id: '7',
    basic_price: 25.00,
    medium_price: 35.00,
    luxury_price: 50.00,
    unit: 'ponto'
  }
];

// PADRÕES DE QUALIDADE
export const QUALITY_LEVELS: QualityLevel[] = [
  {
    level: 'basic',
    title: 'Básico',
    description: 'Materiais económicos, boa relação qualidade-preço',
    icon: '🥉',
    multiplier: 1.0,
    features: [
      'Materiais standard',
      'Acabamentos básicos',
      'Garantia 1 ano',
      'Opção mais económica'
    ]
  },
  {
    level: 'medium',
    title: 'Médio',
    description: 'Materiais de qualidade intermédia, durabilidade superior',
    icon: '🥈',
    multiplier: 1.4,
    features: [
      'Materiais de qualidade',
      'Acabamentos superiores',
      'Garantia 2 anos',
      'Melhor durabilidade'
    ]
  },
  {
    level: 'luxury',
    title: 'Luxo',
    description: 'Materiais premium, máxima qualidade e design',
    icon: '🥇',
    multiplier: 2.2,
    features: [
      'Materiais premium',
      'Acabamentos de luxo',
      'Garantia 3 anos',
      'Design exclusivo'
    ]
  }
];

// TIPOS DE PROJETO
export const PROJECT_TYPES = [
  {
    id: 'kitchen',
    title: 'Cozinha',
    description: 'Renovação completa ou parcial da cozinha',
    icon: '🍳',
    estimatedTime: '2-4 semanas',
    basePrice: 5000,
    categories: ['1', '2', '3', '4', '5', '6', '7'] // Todas as categorias
  },
  {
    id: 'bathroom',
    title: 'Casa de Banho',
    description: 'Remodelação de casa de banho completa',
    icon: '🚿',
    estimatedTime: '1-3 semanas',
    basePrice: 3000,
    categories: ['1', '2', '4', '5', '7'] // Cerâmica, Tintas, Elétrica, Canalização, Mão de Obra
  },
  {
    id: 'living_room',
    title: 'Sala de Estar',
    description: 'Renovação de sala com pintura e pavimentos',
    icon: '🛋️',
    estimatedTime: '1-2 semanas',
    basePrice: 2500,
    categories: ['2', '3', '4', '7'] // Tintas, Pavimentos, Elétrica, Mão de Obra
  },
  {
    id: 'bedroom',
    title: 'Quarto',
    description: 'Remodelação de quarto com armários',
    icon: '🛏️',
    estimatedTime: '1-2 semanas',
    basePrice: 2000,
    categories: ['2', '3', '4', '6', '7'] // Tintas, Pavimentos, Elétrica, Carpintaria, Mão de Obra
  },
  {
    id: 'exterior',
    title: 'Exterior',
    description: 'Pintura exterior e reparações',
    icon: '🏠',
    estimatedTime: '1-2 semanas',
    basePrice: 3500,
    categories: ['2', '7'] // Tintas, Mão de Obra
  },
  {
    id: 'custom',
    title: 'Personalizado',
    description: 'Projeto personalizado às suas necessidades',
    icon: '⚙️',
    estimatedTime: 'Variável',
    basePrice: 0,
    categories: ['1', '2', '3', '4', '5', '6', '7'] // Todas as categorias
  }
];

// FUNÇÕES UTILITÁRIAS
export function getMaterialsByCategory(categoryId: string): Material[] {
  return MATERIALS.filter(material => material.category_id === categoryId);
}

export function getCategoryById(categoryId: string): MaterialCategory | undefined {
  return MATERIAL_CATEGORIES.find(category => category.id === categoryId);
}

export function getMaterialById(materialId: string): Material | undefined {
  return MATERIALS.find(material => material.id === materialId);
}

export function getQualityLevel(level: 'basic' | 'medium' | 'luxury'): QualityLevel | undefined {
  return QUALITY_LEVELS.find(quality => quality.level === level);
}

export function calculateMaterialPrice(material: Material, qualityLevel: 'basic' | 'medium' | 'luxury'): number {
  switch (qualityLevel) {
    case 'basic':
      return material.basic_price;
    case 'medium':
      return material.medium_price;
    case 'luxury':
      return material.luxury_price;
    default:
      return material.medium_price;
  }
}

export function getProjectType(projectTypeId: string) {
  return PROJECT_TYPES.find(type => type.id === projectTypeId);
}


// TIPOS DE PROJETO
export interface ProjectType {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: {
    basic: number;
    medium: number;
    luxury: number;
  };
  duration: string;
}

export const mockProjectTypes: ProjectType[] = [
  {
    id: 'kitchen',
    name: 'Cozinha',
    description: 'Renovação completa ou parcial da cozinha',
    icon: '🍳',
    basePrice: {
      basic: 200,
      medium: 350,
      luxury: 600
    },
    duration: '2-4 semanas'
  },
  {
    id: 'bathroom',
    name: 'Casa de Banho',
    description: 'Remodelação de casa de banho completa',
    icon: '🚿',
    basePrice: {
      basic: 180,
      medium: 300,
      luxury: 500
    },
    duration: '1-3 semanas'
  },
  {
    id: 'living_room',
    name: 'Sala de Estar',
    description: 'Renovação de sala com pintura e pavimentos',
    icon: '🛋️',
    basePrice: {
      basic: 120,
      medium: 200,
      luxury: 350
    },
    duration: '1-2 semanas'
  },
  {
    id: 'bedroom',
    name: 'Quarto',
    description: 'Remodelação de quarto com armários',
    icon: '🛏️',
    basePrice: {
      basic: 100,
      medium: 180,
      luxury: 300
    },
    duration: '1-2 semanas'
  },
  {
    id: 'office',
    name: 'Escritório',
    description: 'Adaptação de espaço para escritório',
    icon: '💼',
    basePrice: {
      basic: 90,
      medium: 150,
      luxury: 250
    },
    duration: '1 semana'
  },
  {
    id: 'balcony',
    name: 'Varanda',
    description: 'Renovação e impermeabilização de varanda',
    icon: '🌿',
    basePrice: {
      basic: 80,
      medium: 140,
      luxury: 220
    },
    duration: '1 semana'
  }
];


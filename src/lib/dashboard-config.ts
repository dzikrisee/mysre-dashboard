// src/lib/dashboard-config.ts - KONFIGURASI FITUR DASHBOARD
// File ini mengatur fitur mana yang aktif berdasarkan ketersediaan table di database

export interface FeatureConfig {
  enabled: boolean;
  reason?: string;
  comingSoon?: boolean;
}

export interface DashboardConfig {
  features: {
    userManagement: FeatureConfig;
    articleManagement: FeatureConfig;
    assignmentManagement: FeatureConfig;
    profileManagement: FeatureConfig;
    // FITUR YANG DISABLED KARENA TABLE BELUM ADA
    projectWriter: FeatureConfig;
    brainstormingSession: FeatureConfig;
    nodeEdgeManagement: FeatureConfig;
    analyticsAdvanced: FeatureConfig;
    tokenUsageBilling: FeatureConfig;
    annotationSystem: FeatureConfig;
    draftEditor: FeatureConfig;
  };
  ui: {
    showDisabledFeatures: boolean;
    showComingSoonBadge: boolean;
  };
}

// ✅ KONFIGURASI BERDASARKAN SCHEMA PRISMA YANG ADA
export const dashboardConfig: DashboardConfig = {
  features: {
    // ✅ FITUR YANG BISA DIGUNAKAN (Table ada di Prisma)
    userManagement: {
      enabled: true,
    },
    articleManagement: {
      enabled: true,
    },
    assignmentManagement: {
      enabled: true,
    },
    profileManagement: {
      enabled: true,
    },

    // ❌ FITUR YANG DISABLED (Table ada di Prisma tapi belum diimplementasi)
    projectWriter: {
      enabled: false,
      reason: 'Table WriterSession dan Draft tersedia di database',
      comingSoon: true,
    },
    brainstormingSession: {
      enabled: false,
      reason: 'Table BrainstormingSession dan ChatMessage tersedia di database',
      comingSoon: true,
    },
    nodeEdgeManagement: {
      enabled: false,
      reason: 'Table Node dan Edge tersedia di database',
      comingSoon: true,
    },
    analyticsAdvanced: {
      enabled: false,
      reason: 'Table Analytics tersedia di database',
      comingSoon: true,
    },
    tokenUsageBilling: {
      enabled: false,
      reason: 'Table TokenUsage tersedia di database',
      comingSoon: true,
    },
    annotationSystem: {
      enabled: false,
      reason: 'Table Annotation tersedia di database',
      comingSoon: true,
    },
    draftEditor: {
      enabled: false,
      reason: 'Table Draft dan DraftSection tersedia di database',
      comingSoon: true,
    },
  },
  ui: {
    showDisabledFeatures: true, // Show disabled features with "Coming Soon" badge
    showComingSoonBadge: true,
  },
};

// ✅ HELPER FUNCTIONS
export const isFeatureEnabled = (featureName: keyof DashboardConfig['features']): boolean => {
  return dashboardConfig.features[featureName].enabled;
};

export const getFeatureStatus = (featureName: keyof DashboardConfig['features']) => {
  return dashboardConfig.features[featureName];
};

export const getEnabledFeatures = () => {
  return Object.entries(dashboardConfig.features)
    .filter(([_, config]) => config.enabled)
    .map(([name, _]) => name);
};

export const getDisabledFeatures = () => {
  return Object.entries(dashboardConfig.features)
    .filter(([_, config]) => !config.enabled)
    .map(([name, config]) => ({ name, ...config }));
};

// ✅ NAVIGATION MENU CONFIGURATION
export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  href: string;
  enabled: boolean;
  comingSoon?: boolean;
  badge?: string;
  description?: string;
}

export const navigationMenu: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'IconDashboard',
    href: '/dashboard',
    enabled: true,
    description: 'Overview dan statistik sistem',
  },
  {
    key: 'users',
    label: 'Manajemen User',
    icon: 'IconUsers',
    href: '/dashboard/users',
    enabled: isFeatureEnabled('userManagement'),
    description: 'Kelola data pengguna dan admin',
  },
  {
    key: 'articles',
    label: 'Manajemen Artikel',
    icon: 'IconFileText',
    href: '/dashboard/articles',
    enabled: isFeatureEnabled('articleManagement'),
    description: 'Kelola dokumen dan artikel akademik',
  },
  {
    key: 'assignments',
    label: 'Manajemen Tugas',
    icon: 'IconClipboardList',
    href: '/dashboard/assignments',
    enabled: isFeatureEnabled('assignmentManagement'),
    description: 'Kelola tugas dan submission mahasiswa',
  },
  {
    key: 'profile',
    label: 'Profil Admin',
    icon: 'IconUser',
    href: '/dashboard/profile',
    enabled: isFeatureEnabled('profileManagement'),
    description: 'Kelola profil dan pengaturan admin',
  },

  // ❌ DISABLED FEATURES (Show with Coming Soon badge)
  {
    key: 'project-writer',
    label: 'Project Writer',
    icon: 'IconPencil',
    href: '/dashboard/project-writer',
    enabled: isFeatureEnabled('projectWriter'),
    comingSoon: !isFeatureEnabled('projectWriter'),
    badge: 'Soon',
    description: 'Kelola project dan draft penulisan',
  },
  {
    key: 'brainstorming',
    label: 'Brainstorming',
    icon: 'IconBulb',
    href: '/dashboard/brainstorming',
    enabled: isFeatureEnabled('brainstormingSession'),
    comingSoon: !isFeatureEnabled('brainstormingSession'),
    badge: 'Soon',
    description: 'Session brainstorming dan chat AI',
  },
  {
    key: 'analytics',
    label: 'Analytics Advanced',
    icon: 'IconChartBar',
    href: '/dashboard/analytics',
    enabled: isFeatureEnabled('analyticsAdvanced'),
    comingSoon: !isFeatureEnabled('analyticsAdvanced'),
    badge: 'Soon',
    description: 'Analisis mendalam aktivitas pengguna',
  },
  {
    key: 'billing',
    label: 'Token Usage',
    icon: 'IconCoins',
    href: '/dashboard/billing',
    enabled: isFeatureEnabled('tokenUsageBilling'),
    comingSoon: !isFeatureEnabled('tokenUsageBilling'),
    badge: 'Soon',
    description: 'Monitoring penggunaan token AI',
  },
];

// ✅ DASHBOARD STATS CONFIGURATION
export const dashboardStats = {
  // Stats yang bisa diambil dari table yang ada
  available: [
    'totalUsers',
    'totalAdmins',
    'totalStudents', // sebenarnya USER role
    'totalArticles',
    'totalAssignments',
    'activeAssignments',
  ],
  // Stats yang tidak bisa diambil karena table belum ada
  unavailable: ['totalBrainstormingSessions', 'totalDrafts', 'totalAnnotations', 'totalTokenUsage', 'monthlyActiveUsers'],
};

// ✅ EXPORT CONFIG
export default dashboardConfig;

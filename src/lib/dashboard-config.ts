// src/lib/dashboard-config.ts - UPDATED dengan project writer enabled
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
    // FITUR YANG SEKARANG ENABLED
    projectWriter: FeatureConfig;
    // FITUR YANG MASIH DISABLED
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

    // ✅ NEWLY ENABLED - Project Writer & Brainstorming
    projectWriter: {
      enabled: true, // ENABLED karena WriterSession table ready
    },
    brainstormingSession: {
      enabled: true, // ENABLED karena BrainstormingSession table ready
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
    showDisabledFeatures: true,
    showComingSoonBadge: true,
  },
};

// Helper function untuk check feature enabled
export const isFeatureEnabled = (featureName: keyof DashboardConfig['features']): boolean => {
  return dashboardConfig.features[featureName].enabled;
};

// Navigation menu configuration
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

  // ✅ ENABLED FEATURES
  {
    key: 'project-writer',
    label: 'Project Writer',
    icon: 'IconPencil',
    href: '/dashboard/project-writer',
    enabled: isFeatureEnabled('projectWriter'), // Now enabled!
    description: 'Kelola project dan draft penulisan',
  },
  {
    key: 'brainstorming',
    label: 'Brainstorming',
    icon: 'IconBulb',
    href: '/dashboard/project-brainstorm', // Updated route
    enabled: isFeatureEnabled('brainstormingSession'), // Now enabled!
    description: 'Session brainstorming dan ide penelitian',
  },

  // ❌ DISABLED FEATURES (Show with Coming Soon badge)
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
    'totalWriterSessions', // Added for writer sessions
    'totalBrainstormingSessions', // Added for brainstorming sessions
  ],
  // Stats yang tidak bisa diambil karena table belum ada
  unavailable: ['totalBrainstormingSessions', 'totalDrafts', 'totalAnnotations', 'totalTokenUsage', 'monthlyActiveUsers'],
};

// ✅ EXPORT CONFIG
export default dashboardConfig;

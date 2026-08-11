export const queryKeys = {
  inventory: {
    items: ['inventory', 'items'] as const,
    entries: ['inventory', 'entries'] as const,
  },
  sessions: {
    history: ['sessions', 'history'] as const,
    orders: (sessionId: string) => ['sessions', sessionId, 'orders'] as const,
  },
} as const

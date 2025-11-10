// Mock Supabase client para desarrollo frontend
// TODO: Reemplazar con llamadas al backend Java

export const supabase = {
  auth: {
    signUp: async (options: any) => ({ data: null, error: null }),
    signInWithPassword: async (credentials: any) => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    resetPasswordForEmail: async (email: string, options?: any) => ({ error: null }),
    onAuthStateChange: (callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } }
    })
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
        then: async (resolve: any) => resolve({ data: [], error: null })
      }),
      order: (column: string, options?: any) => ({
        then: async (resolve: any) => resolve({ data: [], error: null })
      }),
      then: async (resolve: any) => resolve({ data: [], error: null })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: async () => ({ data: null, error: null }),
        then: async (resolve: any) => resolve({ data: null, error: null })
      }),
      then: async (resolve: any) => resolve({ data: null, error: null })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        then: async (resolve: any) => resolve({ error: null })
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: async (resolve: any) => resolve({ error: null })
      })
    })
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any, options?: any) => ({ 
        data: { path }, 
        error: null 
      }),
      getPublicUrl: (path: string) => ({ 
        data: { publicUrl: `/mock-storage/${path}` } 
      }),
      remove: async (paths: string[]) => ({ error: null })
    })
  },
  rpc: async (functionName: string, params?: any) => ({ 
    data: null, 
    error: null 
  }),
  functions: {
    invoke: async (functionName: string, options?: any) => ({ 
      data: null, 
      error: null 
    })
  }
};

export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6aa0bddf000dab7eaad5',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'apistack',
  
  // Collections
  collections: {
    profiles: 'profiles',
    apis: 'apis',
    apiEndpoints: 'api_endpoints',
    favorites: 'favorites',
  }
}

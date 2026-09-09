import { Client, Databases, ID, IndexType } from 'node-appwrite'
import 'dotenv/config'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6aa0bddf000dab7eaad5'
const apiKey = process.env.APPWRITE_API_KEY
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'apistack'

if (!apiKey) {
  console.error('Missing APPWRITE_API_KEY in .env.local')
  process.exit(1)
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey)

const databases = new Databases(client)

async function setupDatabase() {
  try {
    console.log('Creating database...')
    try {
      await databases.create(databaseId, 'ApiStack DB')
      console.log('Database created.')
    } catch (e: any) {
      if (e.code === 409) console.log('Database already exists.')
      else throw e
    }

    // Profiles Collection
    console.log('Creating profiles collection...')
    try {
      await databases.createCollection(databaseId, 'profiles', 'Profiles')
      console.log('Profiles collection created.')
      await databases.createStringAttribute(databaseId, 'profiles', 'email', 255, true)
      await databases.createStringAttribute(databaseId, 'profiles', 'display_name', 100, false)
      await databases.createStringAttribute(databaseId, 'profiles', 'avatar_url', 500, false)
      await databases.createStringAttribute(databaseId, 'profiles', 'role', 50, true, 'user')
    } catch (e: any) {
      if (e.code === 409) console.log('Profiles collection already exists.')
      else throw e
    }

    // Apis Collection
    console.log('Creating apis collection...')
    try {
      await databases.createCollection(databaseId, 'apis', 'APIs')
      console.log('APIs collection created.')
      await databases.createStringAttribute(databaseId, 'apis', 'owner_id', 255, true)
      await databases.createStringAttribute(databaseId, 'apis', 'name', 255, true)
      await databases.createStringAttribute(databaseId, 'apis', 'slug', 255, true)
      await databases.createStringAttribute(databaseId, 'apis', 'description', 500, false)
      await databases.createStringAttribute(databaseId, 'apis', 'long_description', 5000, false)
      await databases.createStringAttribute(databaseId, 'apis', 'category', 255, true)
      await databases.createStringAttribute(databaseId, 'apis', 'tags', 255, false, undefined, true) // array
      await databases.createStringAttribute(databaseId, 'apis', 'base_url', 500, true)
      await databases.createStringAttribute(databaseId, 'apis', 'auth_type', 100, true, 'none')
      await databases.createStringAttribute(databaseId, 'apis', 'auth_header', 100, false)
      await databases.createBooleanAttribute(databaseId, 'apis', 'is_public', true, true)
      await databases.createBooleanAttribute(databaseId, 'apis', 'is_featured', true, false)
      await databases.createIntegerAttribute(databaseId, 'apis', 'endpoint_count', true, 0)
      await databases.createStringAttribute(databaseId, 'apis', 'version', 50, true, '1.0.0')
      await databases.createStringAttribute(databaseId, 'apis', 'documentation_url', 500, false)
      
      // Index for slug
      await new Promise(r => setTimeout(r, 2000)) // Wait for attributes to be created
      try { await databases.createIndex(databaseId, 'apis', 'slug_idx', IndexType.Unique, ['slug']) } catch (e) {}
    } catch (e: any) {
      if (e.code === 409) console.log('APIs collection already exists.')
      else throw e
    }

    // API Endpoints Collection
    console.log('Creating api_endpoints collection...')
    try {
      await databases.createCollection(databaseId, 'api_endpoints', 'API Endpoints')
      console.log('API Endpoints collection created.')
      await databases.createStringAttribute(databaseId, 'api_endpoints', 'api_id', 255, true)
      await databases.createStringAttribute(databaseId, 'api_endpoints', 'method', 20, true)
      await databases.createStringAttribute(databaseId, 'api_endpoints', 'path', 500, true)
      await databases.createStringAttribute(databaseId, 'api_endpoints', 'summary', 500, false)
      await databases.createStringAttribute(databaseId, 'api_endpoints', 'description', 2000, false)
      await databases.createStringAttribute(databaseId, 'api_endpoints', 'request_body', 10000, false)
      await databases.createStringAttribute(databaseId, 'api_endpoints', 'response_example', 10000, false)
      await databases.createStringAttribute(databaseId, 'api_endpoints', 'parameters', 10000, false)
      
      await new Promise(r => setTimeout(r, 2000))
      try { await databases.createIndex(databaseId, 'api_endpoints', 'api_id_idx', IndexType.Key, ['api_id']) } catch (e) {}
    } catch (e: any) {
      if (e.code === 409) console.log('API Endpoints collection already exists.')
      else throw e
    }

    // Favorites Collection
    console.log('Creating favorites collection...')
    try {
      await databases.createCollection(databaseId, 'favorites', 'Favorites')
      console.log('Favorites collection created.')
      await databases.createStringAttribute(databaseId, 'favorites', 'user_id', 255, true)
      await databases.createStringAttribute(databaseId, 'favorites', 'api_id', 255, true)
      
      await new Promise(r => setTimeout(r, 2000))
      try { await databases.createIndex(databaseId, 'favorites', 'user_api_idx', IndexType.Unique, ['user_id', 'api_id']) } catch (e) {}
    } catch (e: any) {
      if (e.code === 409) console.log('Favorites collection already exists.')
      else throw e
    }

    console.log('Setup complete! Note: You may need to wait a few seconds for all attributes to be fully available.')

  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

setupDatabase()

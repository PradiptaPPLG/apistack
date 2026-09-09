import { Client, Account, Databases, Users } from 'node-appwrite'
import { cookies } from 'next/headers'
import { appwriteConfig } from './config'

// Use this client when making requests as an authenticated user via SSR
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(`a_session_${appwriteConfig.projectId}`)

  if (sessionCookie && sessionCookie.value) {
    client.setSession(sessionCookie.value)
  }

  return {
    get account() {
      return new Account(client)
    },
    get databases() {
      return new Databases(client)
    },
    client
  }
}

// Use this client for administrative tasks requiring the API key
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(process.env.APPWRITE_API_KEY || '')

  return {
    get account() {
      return new Account(client)
    },
    get databases() {
      return new Databases(client)
    },
    get users() {
      return new Users(client)
    },
    client
  }
}

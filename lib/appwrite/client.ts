import { Client, Account, Databases, Avatars } from 'appwrite'
import { appwriteConfig } from './config'

export function createBrowserClient() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)

  return {
    get account() {
      return new Account(client)
    },
    get databases() {
      return new Databases(client)
    },
    get avatars() {
      return new Avatars(client)
    },
    client
  }
}

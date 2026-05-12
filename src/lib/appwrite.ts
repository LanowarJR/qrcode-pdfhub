import { Client, Account, Databases, Storage, ID } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  console.error('Appwrite environment variables are missing!');
}

const client = new Client()
  .setEndpoint(endpoint || 'https://sfo.cloud.appwrite.io/v1') // Fallback to avoid crash
  .setProject(projectId || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID };

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const DOCUMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
export const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

export default client;

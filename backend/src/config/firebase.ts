import admin from 'firebase-admin';
import dotenv from 'dotenv';

// This module is imported while routes are being created, before server.ts
// loads its environment variables.
dotenv.config();

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'ats-ai-db463';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          project_id: projectId,
          client_email: clientEmail,
          private_key: privateKey,
        } as admin.ServiceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      admin.initializeApp({
        projectId: projectId,
      });
    }
  } catch (err) {
    console.warn('Firebase Admin safe init warning:', err);
  }
}

export const auth: admin.auth.Auth = admin.apps.length ? admin.auth() : ({} as any);
export const storage: admin.storage.Storage = admin.apps.length ? admin.storage() : ({} as any);
export default admin;

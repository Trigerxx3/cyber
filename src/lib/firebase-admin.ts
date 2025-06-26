import admin from 'firebase-admin';

// Cache the admin instance.
let adminInstance: typeof admin | null = null;

export function getFirebaseAdmin() {
    if (adminInstance) {
        return adminInstance;
    }

    // If there's an existing app, use it.
    if (admin.apps.length > 0) {
        adminInstance = admin;
        return adminInstance;
    }
    
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!privateKey || !projectId || !clientEmail) {
        console.warn('Firebase Admin environment variables not set. Firestore features will be disabled.');
        return null;
    }
  
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            })
        });
        adminInstance = admin;
    } catch (error) {
        console.error('Failed to initialize Firebase Admin SDK:', error);
        adminInstance = null;
    }
  
    return adminInstance;
}

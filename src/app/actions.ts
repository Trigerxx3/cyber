'use server';

import { getFirebaseAdmin } from '@/lib/firebase-admin';
import type { AnalyzeSocialMediaContentOutput } from '@/ai/flows/analyze-social-media-content';
import type { AssessDrugTraffickingRiskOutput } from '@/ai/flows/assess-drug-trafficking-risk';
import type { IdentifySuspectedUserOutput } from '@/ai/flows/identify-suspected-user';
import { createHash } from 'crypto';

export type FirestoreAnalysisData = {
    platform: string;
    channel: string;
    content: string;
    analysisResult: AnalyzeSocialMediaContentOutput;
    riskResult: AssessDrugTraffickingRiskOutput;
};

export type FirestoreSuspectedUserData = {
    username: string;
    platform: string;
    analysisResult: IdentifySuspectedUserOutput;
};

export async function saveAnalysisToFirestore(data: FirestoreAnalysisData) {
    const firebaseAdmin = getFirebaseAdmin();

    if (!firebaseAdmin) {
        const message = 'Firebase is not configured, skipping save to Firestore. Please set Firebase environment variables.';
        console.warn(message);
        return { success: true, message };
    }

    if (data.riskResult.riskLevel === 'Low') {
        console.log('Low risk, not saving to Firestore.');
        return { success: true, message: 'Low risk, not saving.' };
    }

    const db = firebaseAdmin.firestore();
    const FieldValue = firebaseAdmin.firestore.FieldValue;

    try {
        const docRef = db.collection('flagged_posts').doc();
        
        const dataToSave = {
            platform: data.platform,
            channel: data.channel || null,
            text: data.content,
            detected_keywords: data.analysisResult.matchedKeywords,
            matched_emojis: data.analysisResult.matchedEmojis,
            riskScore: data.riskResult.riskScore,
            riskLevel: data.riskResult.riskLevel,
            status: 'flagged',
            timestamp: FieldValue.serverTimestamp(),
            full_analysis: {
                analysis: data.analysisResult,
                risk: data.riskResult,
            }
        };

        await docRef.set(dataToSave);

        console.log('Analysis saved to Firestore with ID:', docRef.id);
        return { success: true, message: 'Analysis saved successfully.', docId: docRef.id };
    } catch (error) {
        console.error('Error saving to Firestore:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to save analysis: ${errorMessage}` };
    }
}

export async function saveSuspectedUserToFirestore(data: FirestoreSuspectedUserData) {
    const firebaseAdmin = getFirebaseAdmin();

    if (!firebaseAdmin) {
        const message = 'Firebase is not configured, skipping save to Firestore. Please set Firebase environment variables.';
        console.warn(message);
        return { success: true, message };
    }

    const db = firebaseAdmin.firestore();

    try {
        const docRef = db.collection('suspected_users').doc(data.username);
        
        // Create a copy to avoid mutating the original data
        const analysisForDb = { ...data.analysisResult };
        let emailHash = null;

        if (analysisForDb.email) {
            emailHash = createHash('sha256').update(analysisForDb.email).digest('hex');
            // Replace the email in the analysis blob with its hash for secure storage
            analysisForDb.email = emailHash;
        }

        const dataToSave = {
            username: data.username,
            platform: data.platform,
            linked_profiles: analysisForDb.linkedProfiles,
            email_hash: emailHash, // Store only the hash at the top level
            risk_level: analysisForDb.riskLevel,
            last_seen: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            full_analysis: analysisForDb, // This now contains the hashed email
        };

        await docRef.set(dataToSave, { merge: true });

        console.log('Suspected user saved to Firestore with ID:', docRef.id);
        return { success: true, message: 'Suspected user saved successfully.', docId: docRef.id };
    } catch (error) {
        console.error('Error saving to Firestore:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to save user data: ${errorMessage}` };
    }
}


export async function getDashboardData() {
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
        console.warn('Firebase is not configured, returning empty dashboard data.');
        return {
            flaggedPosts: [],
            suspectedUsers: [],
            stats: {
                riskLevelCounts: {},
                platformCounts: {},
                keywordCounts: {},
            }
        };
    }

    const db = firebaseAdmin.firestore();

    try {
        // Get flagged posts
        const postsSnapshot = await db.collection('flagged_posts').orderBy('timestamp', 'desc').limit(10).get();
        const flaggedPosts = postsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                platform: data.platform,
                channel: data.channel,
                text: data.text,
                riskLevel: data.riskLevel,
                riskScore: data.riskScore,
                detected_keywords: data.detected_keywords,
                timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
            };
        });

        // Get suspected users
        const usersSnapshot = await db.collection('suspected_users').orderBy('last_seen', 'desc').limit(10).get();
        const suspectedUsers = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                username: data.username,
                platform: data.platform,
                risk_level: data.risk_level,
                linked_profiles: data.linked_profiles || [],
                last_seen: data.last_seen?.toDate().toISOString() || new Date().toISOString(),
            };
        });
        
        const allPostsSnapshot = await db.collection('flagged_posts').get();
        const riskLevelCounts: Record<string, number> = {};
        const platformCounts: Record<string, number> = {};
        const keywordCounts: Record<string, number> = {};

        allPostsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.riskLevel) {
                riskLevelCounts[data.riskLevel] = (riskLevelCounts[data.riskLevel] || 0) + 1;
            }
            if (data.platform) {
                platformCounts[data.platform] = (platformCounts[data.platform] || 0) + 1;
            }
            if (data.detected_keywords && Array.isArray(data.detected_keywords)) {
                data.detected_keywords.forEach((keyword: string) => {
                    keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
                });
            }
        });
        
        const topKeywords = Object.fromEntries(
            Object.entries(keywordCounts).sort(([, a], [, b]) => b - a).slice(0, 10)
        );

        return { 
            flaggedPosts, 
            suspectedUsers, 
            stats: {
                riskLevelCounts,
                platformCounts,
                keywordCounts: topKeywords
            } 
        };

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return {
            flaggedPosts: [],
            suspectedUsers: [],
            stats: {
                riskLevelCounts: {},
                platformCounts: {},
                keywordCounts: {},
            }
        };
    }
}

export async function seedDatabase() {
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
        return { success: false, message: 'Firebase is not configured. Please set Firebase environment variables.' };
    }

    const db = firebaseAdmin.firestore();
    const FieldValue = firebaseAdmin.firestore.FieldValue;
    const batch = db.batch();

    try {
        // Sample Flagged Posts
        const posts = [
            {
                platform: 'Telegram',
                channel: '@thegoodstuff',
                text: '🔥 New batch just dropped! Top quality MDMA pills (ecstasy) and pure crystal meth available now. Discreet shipping worldwide. DM for prices and menu. 💊🚀 #mdma #crystal #deals',
                detected_keywords: ['MDMA', 'pills', 'crystal meth'],
                matched_emojis: ['🔥', '💊', '🚀'],
                riskScore: 95,
                riskLevel: 'High',
            },
            {
                platform: 'Instagram',
                channel: 'partysupplies_uk',
                text: 'Weekend forecast: 100% chance of rolling. Hmu if you need party favours for the festival. 🍬😉 Special powders ready. #weekendvibes #partytime',
                detected_keywords: ['rolling', 'party favours', 'powders'],
                matched_emojis: ['🍬', '😉'],
                riskScore: 75,
                riskLevel: 'High',
            },
            {
                platform: 'WhatsApp',
                channel: 'Secret Rave Group',
                text: 'Got some fire molly for this weekend. Hit me up before it\'s all gone!',
                detected_keywords: ['molly'],
                matched_emojis: [],
                riskScore: 80,
                riskLevel: 'High',
            },
             {
                platform: 'Telegram',
                channel: '@chemcentral',
                text: 'Testing out some new chemicals. Looking for psychonauts to give feedback. Message for details. #researchchem',
                detected_keywords: ['chemicals', 'psychonauts'],
                matched_emojis: [],
                riskScore: 65,
                riskLevel: 'Medium',
            }
        ];

        posts.forEach(post => {
            const docRef = db.collection('flagged_posts').doc();
            batch.set(docRef, { ...post, status: 'flagged', timestamp: FieldValue.serverTimestamp() });
        });

        // Sample Suspected Users
        const users = [
            {
                username: 'coke_dealer_nyc',
                platform: 'Telegram',
                linked_profiles: ['Instagram:nycsnowman', 'WhatsApp:coke_dealer_nyc'],
                email: 'tony@montana.com',
                risk_level: 'Critical',
            },
            {
                username: 'rave_dave23',
                platform: 'Instagram',
                linked_profiles: [],
                email: null,
                risk_level: 'Medium',
            }
        ];

        users.forEach(user => {
            const docRef = db.collection('suspected_users').doc(user.username);
            let emailHash = null;
            if (user.email) {
                emailHash = createHash('sha256').update(user.email).digest('hex');
            }
            batch.set(docRef, {
                username: user.username,
                platform: user.platform,
                linked_profiles: user.linked_profiles,
                email_hash: emailHash,
                risk_level: user.risk_level,
                last_seen: FieldValue.serverTimestamp(),
            }, { merge: true });
        });

        await batch.commit();
        return { success: true, message: 'Database seeded successfully with sample data.' };

    } catch (error) {
        console.error('Error seeding database:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to seed database: ${errorMessage}` };
    }
}

export async function isFirebaseConfigured(): Promise<boolean> {
    return !!getFirebaseAdmin();
}

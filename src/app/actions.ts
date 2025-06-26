'use server';

import { getFirebaseAdmin } from '@/lib/firebase-admin';
import type { AnalyzeSocialMediaContentOutput } from '@/ai/flows/analyze-social-media-content';
import type { AssessDrugTraffickingRiskOutput } from '@/ai/flows/assess-drug-trafficking-risk';

export type FirestoreAnalysisData = {
    platform: string;
    channel: string;
    content: string;
    analysisResult: AnalyzeSocialMediaContentOutput;
    riskResult: AssessDrugTraffickingRiskOutput;
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
            detected_keywords: data.riskResult.indicators,
            riskScore: data.riskResult.riskScore,
            riskLevel: data.riskResult.riskLevel,
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

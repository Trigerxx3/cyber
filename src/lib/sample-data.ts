// A collection of sample data and a helper function to format it for the dashboard.
// This allows for a "demo mode" when Firebase is not configured.

const samplePostsData = [
    {
        platform: 'Telegram',
        channel: '@thegoodstuff',
        text: '🔥 New batch just dropped! Top quality MDMA pills (ecstasy) and pure crystal meth available now. Discreet shipping worldwide. DM for prices and menu. 💊🚀 #mdma #crystal #deals',
        detected_keywords: ['MDMA', 'pills', 'crystal meth'],
        riskScore: 95,
        riskLevel: 'High',
    },
    {
        platform: 'Instagram',
        channel: 'partysupplies_uk',
        text: 'Weekend forecast: 100% chance of rolling. Hmu if you need party favours for the festival. 🍬😉 Special powders ready. #weekendvibes #partytime',
        detected_keywords: ['rolling', 'party favours', 'powders'],
        riskScore: 75,
        riskLevel: 'High',
    },
    {
        platform: 'WhatsApp',
        channel: 'Secret Rave Group',
        text: 'Got some fire molly for this weekend. Hit me up before it\'s all gone!',
        detected_keywords: ['molly'],
        riskScore: 80,
        riskLevel: 'High',
    },
    {
        platform: 'Telegram',
        channel: '@chemcentral',
        text: 'Testing out some new chemicals. Looking for psychonauts to give feedback. Message for details. #researchchem',
        detected_keywords: ['chemicals', 'psychonauts'],
        riskScore: 65,
        riskLevel: 'Medium',
    }
];

const sampleUsersData = [
    {
        username: 'coke_dealer_nyc',
        platform: 'Telegram',
        linked_profiles: ['Instagram:nycsnowman', 'WhatsApp:coke_dealer_nyc'],
        risk_level: 'Critical',
    },
    {
        username: 'rave_dave23',
        platform: 'Instagram',
        linked_profiles: [],
        risk_level: 'Medium',
    }
];

/**
 * Processes the raw sample data into the format expected by the LiveDashboard component.
 * This includes generating timestamps and calculating summary statistics.
 */
export function getSampleDashboardData() {
    const flaggedPosts = samplePostsData.map((post, i) => ({
        id: `sample-post-${i}`,
        ...post,
        timestamp: new Date().toISOString(),
    }));

    const suspectedUsers = sampleUsersData.map((user, i) => ({
        id: `sample-user-${i}`,
        username: user.username,
        platform: user.platform,
        risk_level: user.risk_level,
        linked_profiles: user.linked_profiles || [],
        last_seen: new Date().toISOString(),
    }));

    const riskLevelCounts: Record<string, number> = {};
    const platformCounts: Record<string, number> = {};
    const keywordCounts: Record<string, number> = {};

    flaggedPosts.forEach(post => {
        if (post.riskLevel) {
            riskLevelCounts[post.riskLevel] = (riskLevelCounts[post.riskLevel] || 0) + 1;
        }
        if (post.platform) {
            platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1;
        }
        if (post.detected_keywords && Array.isArray(post.detected_keywords)) {
            post.detected_keywords.forEach((keyword: string) => {
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
}

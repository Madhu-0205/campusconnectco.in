/**
 * Calculates the distance between two points in kilometers using the Haversine formula.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calculates a radius-based score (Uber/Rapido style)
 * Uses an exponential decay: 1 / (1 + distance^1.5)
 */
export function calculateRadiusScore(distance: number | null): number {
    if (distance === null) return 0.5; // Neutral for remote
    if (distance <= 1) return 1; // Perfect score for within 1km

    // Exponential decay: Score drops quickly after 5km
    const score = 1 / (1 + Math.pow(distance / 2, 1.5));
    return Math.max(score, 0);
}

/**
 * Calculates a match score between user skills and gig tags (Netflix/Amazon style)
 * Includes contextual matching for synonyms and descriptions.
 */
export function calculateMatchScore(userSkills: string | null, gigTags: string | null, description?: string): number {
    if (!userSkills) return 0;
    if (!gigTags && !description) return 0;

    const userSkillsArr = userSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const gigTagsArr = (gigTags || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const descLower = (description || '').toLowerCase();

    if (userSkillsArr.length === 0) return 0;

    let matches = 0;
    userSkillsArr.forEach(skill => {
        // Direct tag match
        if (gigTagsArr.includes(skill)) {
            matches += 1.0;
        }
        // Contextual match in description
        else if (descLower.includes(skill)) {
            matches += 0.5;
        }
    });

    // Normalize score (0-100)
    // We divide by a factor that prevents 100% being too hard to reach
    const divisor = Math.max(gigTagsArr.length, 1);
    const rawScore = (matches / divisor) * 100;

    return Math.min(Math.round(rawScore), 100);
}

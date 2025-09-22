//starSearch.js is a function that searches for a star by name.


let starSearchIndex = null; 

/**
 * Loads the star search index from the JSON file.
 */

export async function loadStarSearchIndex() {
    try {
        const response = await fetch('/public/search_index.json');
        if (!response.ok) {
            throw new Error('HTTP Error! Status: ${response.status}');
    }
        starSearchIndex = await response.json();
        console.log('Loaded search index with ${Object.keys(starSearchIndex).length} stars');
        return true
    } catch (error) {
        console.error('Error loading star search index:', error);
        return false;
    }
}

/**
 * Searches for a star by name.
*@param {string} query - the search query
*@param {number} maxResults - Maximum number of results to return
*@returns {Array} - An array of star objects
*/


export function searchStars(query, maxResults = 5) {
    if (!starSearchIndex) {
        console.error('Star search index not loaded'); // if the star search index is not loaded, return an empty array
        return [];
    }
    if (!query || query.trim().length < 2) { //if the query is less than 2 characters, return an empty array
        return [];
    }

    const queryLower = query.toLowerCase().trim();
    const results = []

    // Strategy 1: Exact match
    if (starSearchIndex[queryLower]) {
        results.push(starSearchIndex[queryLower]);
    }
    
    // Strategy 2: Partial matches
    for (const [name, starData] of Object.entries(starSearchIndex)) {
        if (name.includes(queryLower) && !results.includes(starData)) {
            results.push(starData);
            if (results.length >= maxResults) break;
        }
    }
    
    return results;
}


/**
 * Get star data by exact name
 * @param {string} name - Exact star name (case-insensitive)
 * @returns {Object|null} Star data or null if not found
 */
export function getStarByName(name) {
    if (!starSearchIndex) return null;
    return starSearchIndex[name.toLowerCase()] || null;
}
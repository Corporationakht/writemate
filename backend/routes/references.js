const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// POST /api/references/search
router.post('/search', async (req, res) => {
    const { query, minYear } = req.body;
    if (!query) return res.status(400).json({ error: 'Query wajib diisi.' });

    // Use provided minYear or default to 4 years ago
    const currentYear = new Date().getFullYear();
    const filterYear = minYear !== undefined ? minYear : (currentYear - 4);

    try {
        const [openAlexResults, crossrefResults, elsevierResults] = await Promise.allSettled([
            searchOpenAlex(query, filterYear),
            searchCrossref(query, filterYear),
            searchElsevier(query, filterYear),
        ]);

        const results = [];
        const seenDois = new Set();
        const seenTitles = new Set();

        const addResults = (items) => {
            for (const item of items) {
                const doi = item.doi;
                const titleLower = item.title ? item.title.toLowerCase() : null;

                if (doi && seenDois.has(doi)) continue;
                if (titleLower && seenTitles.has(titleLower)) continue;

                if (doi) seenDois.add(doi);
                if (titleLower) seenTitles.add(titleLower);

                results.push(item);
            }
        };

        if (elsevierResults.status === 'fulfilled') addResults(elsevierResults.value); // Depan agar Scopus prioritas
        if (openAlexResults.status === 'fulfilled') addResults(openAlexResults.value);
        if (crossrefResults.status === 'fulfilled') addResults(crossrefResults.value);

        res.json({ results: results.slice(0, 20) });
    } catch (err) {
        console.error('Reference search error:', err);
        res.status(500).json({ error: 'Gagal mencari referensi.' });
    }
});

async function searchOpenAlex(query, minYear) {
    const filterParts = []
    if (minYear) filterParts.push(`from_publication_date:${minYear}-01-01`)
    const filterQS = filterParts.length > 0 ? `&filter=${filterParts.join(',')}` : ''

    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}${filterQS}&per-page=10&select=title,authorships,publication_year,doi`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'WriteMate/1.0 (mailto:admin@writemate.id)' } });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.results || []).map((w) => ({
        title: w.title || 'Tanpa Judul',
        authors: (w.authorships || []).map((a) => a.author?.display_name).filter(Boolean).join(', ') || 'Unknown',
        year: w.publication_year || '-',
        doi: w.doi ? w.doi.replace('https://doi.org/', '') : null,
        source: 'OpenAlex',
    }));
}

async function searchCrossref(query, minYear) {
    const filterParts = []
    if (minYear) filterParts.push(`from-pub-date:${minYear}-01-01`)
    const filterQS = filterParts.length > 0 ? `&filter=${filterParts.join(',')}` : ''

    const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}${filterQS}&rows=10&select=title,author,published,DOI`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'WriteMate/1.0 (mailto:admin@writemate.id)' } });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.message?.items || []).map((w) => ({
        title: (w.title || ['Tanpa Judul'])[0],
        authors: (w.author || []).map((a) => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean).join(', ') || 'Unknown',
        year: w.published?.['date-parts']?.[0]?.[0] || '-',
        doi: w.DOI || null,
        source: 'Crossref',
    }));
}

async function searchElsevier(query, minYear) {
    const apiKey = process.env.ELSEVIER_API_KEY;
    if (!apiKey) return [];

    let scopusQuery = query;
    if (minYear) scopusQuery += ` AND PUBYEAR > ${minYear - 1}`;

    const url = `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(scopusQuery)}&count=10`;
    try {
        const resp = await fetch(url, { headers: { 'X-ELS-APIKey': apiKey, 'Accept': 'application/json' } });
        if (!resp.ok) return [];
        const data = await resp.json();
        const entries = data['search-results']?.entry || [];

        return entries.map((w) => {
            const authors = w['dc:creator'] ? w['dc:creator'] : 'Unknown';
            const year = w['prism:coverDate'] ? w['prism:coverDate'].substring(0, 4) : '-';
            return {
                title: w['dc:title'] || 'Tanpa Judul',
                authors: authors,
                year: year,
                doi: w['prism:doi'] || null,
                source: 'Scopus',
            };
        });
    } catch (err) {
        console.error("Elsevier API Error:", err);
        return [];
    }
}

module.exports = router;

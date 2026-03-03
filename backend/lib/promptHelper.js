const fs = require('fs');
const path = require('path');

// Load all chapter prompt files and merge them
function loadAllPrompts() {
    const templatesDir = path.join(__dirname, '..', 'templates');
    const files = ['chapter_prompts.json', 'chapter_prompts_2.json', 'chapter_prompts_3.json'];
    let allPrompts = {};

    for (const file of files) {
        try {
            const filePath = path.join(templatesDir, file);
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                // chapter_prompts.json has nested structure with meta/global_rules/chapter_prompts
                if (data.chapter_prompts) {
                    allPrompts = { ...allPrompts, ...data.chapter_prompts };
                } else {
                    // chapter_prompts_2.json and _3.json are flat: { type: { subbab: {...} } }
                    allPrompts = { ...allPrompts, ...data };
                }
            }
        } catch (e) {
            console.error(`Error loading prompt file ${file}:`, e.message);
        }
    }
    return allPrompts;
}

// Load global rules
function loadGlobalRules() {
    try {
        const filePath = path.join(__dirname, '..', 'templates', 'chapter_prompts.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            return data.global_rules || null;
        }
    } catch (e) { }
    return null;
}

/**
 * Get the specific prompt for a chapter/subsection.
 * @param {string} type - Document type (e.g. 'makalah', 'skripsi_kualitatif')
 * @param {string} chapterName - Chapter/subsection title from the outline
 * @param {object} vars - Variables to replace: { topic, audience, language, word_count, references }
 * @returns {string|null} - The resolved prompt, or null if no specific prompt found
 */
function getSubbabPrompt(type, chapterName, vars = {}) {
    const allPrompts = loadAllPrompts();
    const typePrompts = allPrompts[type];
    if (!typePrompts) return null;

    // Try to find the best matching prompt by normalizing the chapter name
    const normalized = chapterName
        .toLowerCase()
        .replace(/^bab\s+[ivxlcdm]+[:\s]*/i, '')  // Remove "BAB I:", "BAB II:", etc.
        .replace(/^\d+\.\s*/, '')                     // Remove "1.", "2.", etc.
        .trim();

    let bestMatch = null;
    let bestScore = 0;

    for (const [key, promptData] of Object.entries(typePrompts)) {
        const label = (promptData.label || '').toLowerCase();

        // Exact label match
        if (label === normalized) {
            bestMatch = promptData;
            bestScore = 100;
            break;
        }

        // Partial match: check if normalized contains the label or vice versa
        if (normalized.includes(label) || label.includes(normalized)) {
            const score = label.length; // Longer match = better
            if (score > bestScore) {
                bestMatch = promptData;
                bestScore = score;
            }
        }

        // Keyword matching for more flexible matching
        const labelWords = label.split(/\s+/);
        const normalizedWords = normalized.split(/\s+/);
        const commonWords = labelWords.filter(w => normalizedWords.includes(w));
        const keywordScore = commonWords.length / Math.max(labelWords.length, 1) * 50;
        if (keywordScore > bestScore) {
            bestMatch = promptData;
            bestScore = keywordScore;
        }
    }

    if (!bestMatch) return null;

    // Replace variables in the prompt
    let prompt = bestMatch.prompt;
    const replacements = {
        '{{topic}}': vars.topic || '',
        '{{audience}}': vars.audience || 'S1',
        '{{language}}': vars.language || 'formal',
        '{{word_count}}': vars.word_count || '500',
        '{{references}}': vars.references || '(Tidak ada referensi)',
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
        prompt = prompt.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return prompt;
}

/**
 * Get global rules with variables replaced.
 */
function getGlobalRulesText(vars = {}) {
    const globalRules = loadGlobalRules();
    if (!globalRules) return '';

    let rules = globalRules.rules.join('\n');
    const replacements = {
        '{{topic}}': vars.topic || '',
        '{{audience}}': vars.audience || 'S1',
        '{{language}}': vars.language || 'formal',
        '{{word_count}}': vars.word_count || '500',
        '{{references}}': vars.references || '(Tidak ada referensi)',
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
        rules = rules.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return rules;
}

module.exports = { getSubbabPrompt, getGlobalRulesText };

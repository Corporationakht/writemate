const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const { getSubbabPrompt, getGlobalRulesText } = require('../lib/promptHelper');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-flash-lite-preview-09-2025';

async function callOpenRouter(messages, stream = false) {
    const resp = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'WriteMate',
        },
        body: JSON.stringify({ model: MODEL, messages, stream, max_tokens: 4000 }),
    });

    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`OpenRouter error ${resp.status}: ${err}`);
    }

    return resp;
}

// POST /api/generate/titles
router.post('/titles', async (req, res) => {
    const { topic, type, language, audience, prodi } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topik wajib diisi.' });

    const gaya = language === 'formal' ? 'formal dan akademis' : 'semi-formal';
    const pembaca = audience === 'sma' ? 'tingkat SMA' : audience === 's2' ? 'pascasarjana (S2)' : 'mahasiswa S1';
    const prodiText = prodi ? ` untuk Program Studi: ${prodi}` : '';

    const messages = [
        {
            role: 'system',
            content: 'Kamu adalah asisten akademis profesional yang membantu mahasiswa Indonesia membuat karya tulis ilmiah.',
        },
        {
            role: 'user',
            content: `Buatkan 5 pilihan judul ${type}${prodiText} tentang topik: "${topic}".
Gaya bahasa: ${gaya}. Target pembaca: ${pembaca}.
Judul harus spesifik, ilmiah, dan tidak lebih dari 20 kata.
Format respons HANYA berupa daftar nomor 1-5, masing-masing satu judul per baris, tanpa penjelasan tambahan.`,
        },
    ];

    try {
        const resp = await callOpenRouter(messages);
        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content || '';

        const titles = content
            .split('\n')
            .map((l) => l.replace(/^\d+[\.\)]\s*/, '').trim())
            .filter((l) => l.length > 5)
            .slice(0, 5);

        res.json({ titles });
    } catch (err) {
        console.error('Generate titles error:', err);
        res.status(500).json({ error: 'Gagal generate judul. Pastikan API key valid.' });
    }
});

// POST /api/generate/outline
router.post('/outline', async (req, res) => {
    const { title, type, references, prodi } = req.body;
    if (!title) return res.status(400).json({ error: 'Judul wajib diisi.' });

    const refList = (references || [])
        .map((r) => `- ${r.title} (${r.authors}, ${r.year})`)
        .join('\n') || '(Tidak ada referensi)';

    // Load indores_standards if exists
    let standards = '';
    try {
        const standardsPath = path.join(__dirname, '..', 'templates', 'indores_standards.json');
        if (fs.existsSync(standardsPath)) {
            const data = JSON.parse(fs.readFileSync(standardsPath, 'utf-8'));
            const cat = data.core_writing_logic[type];
            if (cat) {
                standards = `Patuhi standar penulisan berikut:\n${JSON.stringify(cat, null, 2)}\n`;
            }
        }
    } catch (e) { }

    const messages = [
        {
            role: 'system',
            content: 'Kamu adalah asisten akademis profesional yang membantu mahasiswa Indonesia membuat karya tulis ilmiah.',
        },
        {
            role: 'user',
            content: `Buatkan kerangka (outline) ${type} dengan judul: "${title}".
${prodi ? `Karya ini untuk Program Studi: ${prodi}\n` : ''}
${standards}
PENTING: JANGAN sertakan cover, kata pengantar, daftar isi, atau lampiran. Fokus HANYA pada konten inti akademik (BAB-BAB utama dan Daftar Pustaka).
Referensi yang digunakan:\n${refList}

Buat kerangka yang sesuai dengan standar akademis Indonesia.
Format respons: daftar bab dan subbab dalam format JSON array seperti ini:
[
  { "id": "bab1", "title": "Bab 1 Pendahuluan", "subsections": ["Latar Belakang", "Rumusan Masalah", "Tujuan"] },
  { "id": "bab2", "title": "Bab 2 ...", "subsections": [...] }
]
Hanya kembalikan JSON array, tanpa penjelasan lain.`,
        },
    ];

    try {
        const resp = await callOpenRouter(messages);
        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content || '[]';

        // Extract JSON from response
        const match = content.match(/\[[\s\S]*\]/);
        const outline = match ? JSON.parse(match[0]) : [];

        res.json({ outline });
    } catch (err) {
        console.error('Generate outline error:', err);
        res.status(500).json({ error: 'Gagal generate kerangka.' });
    }
});

// POST /api/generate/chapter  (streaming)
router.post('/chapter', async (req, res) => {
    const { title, type, chapterName, subsections, outline, references, wordCount, language, audience } = req.body;
    if (!title || !chapterName) return res.status(400).json({ error: 'Judul dan nama bab wajib diisi.' });

    const gaya = language === 'formal' ? 'formal dan akademis' : 'semi-formal';
    const pembaca = audience === 'sma' ? 'SMA' : audience === 's2' ? 'S2' : 'S1';
    const tWord = wordCount || 500;

    const refList = (references || [])
        .map((r) => `- ${r.title} (${r.authors}, ${r.year}${r.doi ? ', doi:' + r.doi : ''})`)
        .join('\n') || '(Tidak ada referensi)';

    // Try to get a specific prompt for this subsection from templates
    const vars = { topic: title, audience: pembaca, language: gaya, word_count: String(tWord), references: refList };
    const specificPrompt = type ? getSubbabPrompt(type, chapterName, vars) : null;
    const globalRules = getGlobalRulesText(vars);

    let userContent;
    if (specificPrompt) {
        // Use the tailored per-subbab prompt
        userContent = `${specificPrompt}

ATURAN TAMBAHAN:
${globalRules}
- JANGAN gunakan karakter markdown seperti bintang (* atau **) di dalam paragraf. Tulis teks polos saja.
- Jika ada subbab, gunakan heading H3 (###) untuk setiap subbab
- Jangan sertakan judul bab utama di awal (sudah ada di atas)
- Tulis HANYA isi konten, tidak perlu penjelasan meta`;
    } else {
        // Fallback to generic prompt
        const subsectionText = subsections && subsections.length
            ? `Subbab yang harus dibahas: ${subsections.join(', ')}.`
            : '';
        userContent = `Tulis isi lengkap dari "${chapterName}" untuk ${title}.
${subsectionText}
Target jumlah kata: sekitar ${tWord} kata.
Referensi yang bisa dikutip:\n${refList}

Panduan:
- Tulis paragraf kohesif dan akademis
- JANGAN gunakan karakter markdown seperti bintang (* atau **) di dalam paragraf. Tulis teks polos saja.
- Gunakan gaya kutipan sesuai standar (Nama Penulis, Tahun).
- Jika ada subbab, gunakan heading H3 (###) untuk setiap subbab
- Jangan sertakan judul bab utama di awal (sudah ada di atas)
- Tulis HANYA isi bab, tidak perlu penjelasan meta`;
    }

    const messages = [
        {
            role: 'system',
            content: `Kamu adalah penulis akademis profesional Indonesia. Tulis dengan gaya ${gaya} untuk pembaca ${pembaca}. Gunakan Bahasa Indonesia yang baik dan benar.`,
        },
        {
            role: 'user',
            content: userContent,
        },
    ];

    try {
        const resp = await callOpenRouter(messages, true);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = resp.body;
        let buffer = '';

        reader.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') {
                        res.write('data: [DONE]\n\n');
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const token = parsed.choices?.[0]?.delta?.content;
                        if (token) {
                            res.write(`data: ${JSON.stringify({ token })}\n\n`);
                        }
                    } catch (e) {
                        // ignore parse errors
                    }
                }
            }
        });

        reader.on('end', () => {
            res.write('data: [DONE]\n\n');
            res.end();
        });

        reader.on('error', (err) => {
            console.error('Stream error:', err);
            res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
            res.end();
        });
    } catch (err) {
        console.error('Generate chapter error:', err);
        res.status(500).json({ error: 'Gagal generate bab.' });
    }
});

module.exports = router;

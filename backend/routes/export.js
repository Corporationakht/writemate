const express = require('express');
const router = express.Router();
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageOrientation } = require('docx');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// POST /api/export/doc
router.post('/doc', async (req, res) => {
    const { title, chapters } = req.body;
    if (!title || !chapters) return res.status(400).json({ error: 'Data tidak lengkap.' });

    try {
        // Load standards for formatting
        let margins = { top: 2268, left: 2268, bottom: 1701, right: 1701 }; // cm to twips (1cm = 567 twips)
        let spacing = 1.5;
        try {
            const stdPath = path.join(__dirname, '..', 'templates', 'indores_standards.json');
            if (fs.existsSync(stdPath)) {
                const std = JSON.parse(fs.readFileSync(stdPath, 'utf-8'));
                const m = std.writing_standards_template.formatting_rules.margins.standard_indo_en;
                margins = { top: m.top * 567, left: m.left * 567, bottom: m.bottom * 567, right: m.right * 567 };
                spacing = std.writing_standards_template.formatting_rules.typography.latin.spacing_standard;
            }
        } catch (e) { }

        const children = [];

        // Title
        children.push(
            new Paragraph({
                text: title,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
            })
        );

        // Chapters
        for (const chapter of chapters) {
            children.push(
                new Paragraph({
                    text: chapter.title,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                })
            );

            const paragraphs = (chapter.content || '').split('\n').filter((p) => p.trim());
            for (const para of paragraphs) {
                if (para.startsWith('### ')) {
                    children.push(
                        new Paragraph({
                            text: para.replace(/^###\s*/, ''),
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 200, after: 100 },
                        })
                    );
                } else if (para.startsWith('## ')) {
                    children.push(
                        new Paragraph({
                            text: para.replace(/^##\s*/, ''),
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 300, after: 100 },
                        })
                    );
                } else {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: para.replace(/[*_~`]/g, ''),
                                    size: 24, // 12pt
                                    font: 'Times New Roman',
                                }),
                            ],
                            alignment: AlignmentType.JUSTIFIED,
                            spacing: { line: spacing * 240, after: 200 }, // line spacing in twips (1 line = 240 twips)
                            indent: { firstLine: 720 },
                        })
                    );
                }
            }
        }

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: margins,
                    },
                },
                children
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        const safeTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 60);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.docx"`);
        res.send(buffer);
    } catch (err) {
        console.error('Export DOC error:', err);
        res.status(500).json({ error: 'Gagal export DOC.' });
    }
});

// POST /api/export/pdf
router.post('/pdf', async (req, res) => {
    const { title, chapters } = req.body;
    if (!title || !chapters) return res.status(400).json({ error: 'Data tidak lengkap.' });

    try {
        // Load standards for PDF formatting
        let margins = { top: 113.4, left: 113.4, bottom: 85.05, right: 85.05 }; // cm to points (1cm = 28.35 points)
        let fontSize = 11;
        try {
            const stdPath = path.join(__dirname, '..', 'templates', 'indores_standards.json');
            if (fs.existsSync(stdPath)) {
                const std = JSON.parse(fs.readFileSync(stdPath, 'utf-8'));
                const m = std.writing_standards_template.formatting_rules.margins.standard_indo_en;
                margins = {
                    top: m.top * 28.35,
                    left: m.left * 28.35,
                    bottom: m.bottom * 28.35,
                    right: m.right * 28.35
                };
                fontSize = std.writing_standards_template.formatting_rules.typography.latin.body_size - 1; // Slightly smaller for PDF
            }
        } catch (e) { }

        const doc = new PDFDocument({
            margins: margins,
            size: 'A4'
        });
        const safeTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 60);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
        doc.pipe(res);

        // Title page
        doc.fontSize(fontSize + 6).font('Helvetica-Bold').text(title, { align: 'center' });
        doc.moveDown(3);

        for (const chapter of chapters) {
            doc.addPage();
            doc.fontSize(fontSize + 2).font('Helvetica-Bold').text(chapter.title, { align: 'left' });
            doc.moveDown(0.5);

            const paragraphs = (chapter.content || '').split('\n').filter((p) => p.trim());
            for (const para of paragraphs) {
                if (para.startsWith('### ') || para.startsWith('## ')) {
                    const heading = para.replace(/^#{2,3}\s*/, '');
                    doc.moveDown(0.5);
                    doc.fontSize(fontSize + 1).font('Helvetica-Bold').text(heading);
                    doc.moveDown(0.3);
                } else {
                    const cleaned = para.replace(/[*_~`]/g, '');
                    doc.fontSize(fontSize).font('Helvetica').text(cleaned, {
                        align: 'justify',
                        indent: 30,
                    });
                    doc.moveDown(0.5);
                }
            }
        }

        doc.end();
    } catch (err) {
        console.error('Export PDF error:', err);
        res.status(500).json({ error: 'Gagal export PDF.' });
    }
});

module.exports = router;

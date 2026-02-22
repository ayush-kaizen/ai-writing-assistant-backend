const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ai-writing-assistant-frontend-one.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'AI Writing Assistant API is running!' });
});

// Grammar Checker endpoint
app.post('/api/check-grammar', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a professional grammar and spelling checker. Fix any grammar, spelling, or punctuation errors in the following text. Return ONLY the corrected text, with no explanations or additional commentary.

Text to check:
${text}`
      }]
    });

    const correctedText = message.content[0].text;

    res.json({
      original: text,
      corrected: correctedText,
      hasErrors: text !== correctedText
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to check grammar' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// Tone Analyzer endpoint
app.post('/api/analyze-tone', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze the tone of the following text. Identify:
1. Overall tone (e.g., formal, casual, friendly, professional, aggressive, neutral)
2. Emotion level (high, medium, low)
3. Formality level (very formal, formal, neutral, casual, very casual)
4. Key characteristics (2-3 brief points)

Respond in this exact JSON format:
{
  "tone": "primary tone here",
  "emotion": "emotion level",
  "formality": "formality level",
  "characteristics": ["point 1", "point 2", "point 3"]
}

Text to analyze:
${text}`
      }]
    });

    const analysis = message.content[0].text;
    
    // Try to parse as JSON, fallback to plain text
    try {
      const parsed = JSON.parse(analysis);
      res.json(parsed);
    } catch {
      res.json({ analysis });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to analyze tone' });
  }
});

// Text Improver endpoint
app.post('/api/improve-text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Improve the following text to make it clearer, more concise, and more impactful. 
Maintain the original meaning but enhance:
- Clarity and readability
- Conciseness (remove unnecessary words)
- Impact and persuasiveness
- Professional tone

Return ONLY the improved version, no explanations.

Text to improve:
${text}`
      }]
    });

    const improvedText = message.content[0].text;

    res.json({
      original: text,
      improved: improvedText
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to improve text' });
  }
});

// Style Transformer endpoint
app.post('/api/transform-style', async (req, res) => {
  try {
    const { text, targetStyle } = req.body;

    if (!text || !targetStyle) {
      return res.status(400).json({ error: 'Text and target style are required' });
    }

    const stylePrompts = {
      professional: 'Convert this text to a professional, formal business tone. Use proper grammar, remove slang, and maintain a respectful, corporate style.',
      casual: 'Convert this text to a casual, friendly tone. Make it conversational and approachable while keeping the main message.',
      formal: 'Convert this text to a very formal, academic tone. Use sophisticated vocabulary and proper structure.',
      friendly: 'Convert this text to a warm, friendly tone. Make it personable and engaging.',
      brief: 'Make this text as brief as possible while preserving all key information. Remove unnecessary words.',
      detailed: 'Expand this text with more detail, examples, and explanation. Make it comprehensive.'
    };

    const prompt = stylePrompts[targetStyle] || stylePrompts.professional;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `${prompt}

Return ONLY the transformed text, no explanations.

Text to transform:
${text}`
      }]
    });

    const transformedText = message.content[0].text;

    res.json({
      original: text,
      transformed: transformedText,
      style: targetStyle
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to transform style' });
  }
});
// Document Analyzer endpoint
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { documentText, question } = req.body;

    if (!documentText || !question) {
      return res.status(400).json({ error: 'Document text and question are required' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are analyzing a document. Answer the user's question based ONLY on the information in the document below. If the answer is not in the document, say so.

Document:
${documentText}

Question: ${question}

Provide a clear, concise answer:`
      }]
    });

    const answer = message.content[0].text;

    res.json({
      question,
      answer
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

// Meeting Notes Generator endpoint
app.post('/api/generate-meeting-notes', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Generate structured meeting notes from this transcript. Include:

1. **Meeting Summary** (2-3 sentences)
2. **Key Discussion Points** (bullet points)
3. **Decisions Made** (bullet points)
4. **Action Items** (bullet points with format: [Person] - [Action])
5. **Next Steps**

Format the output in clear markdown.

Transcript:
${transcript}`
      }]
    });

    const notes = message.content[0].text;

    res.json({
      notes
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate meeting notes' });
  }
});

// Email Draft Assistant endpoint
app.post('/api/draft-email', async (req, res) => {
  try {
    const { context, tone, recipient } = req.body;

    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }

    const toneGuidance = {
      professional: 'formal, respectful, and business-appropriate',
      friendly: 'warm, personable, but still professional',
      casual: 'relaxed and conversational',
      formal: 'very formal, traditional business style'
    };

    const selectedTone = toneGuidance[tone] || toneGuidance.professional;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Draft a ${selectedTone} email based on this context:

Context: ${context}
${recipient ? `Recipient: ${recipient}` : ''}

Generate:
1. Subject line
2. Email body (complete, ready to send)

Format as:
Subject: [subject line]

[email body]`
      }]
    });

    const draft = message.content[0].text;

    res.json({
      draft
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to draft email' });
  }
});
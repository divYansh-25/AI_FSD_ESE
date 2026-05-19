const https = require('https');
const Complaint = require('../models/Complaint');

const callOpenRouter = (prompt) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'openrouter/free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Smart Complaint System',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(`OpenRouter: ${parsed.error.message || JSON.stringify(parsed.error)}`));
          }
          if (!parsed.choices || !parsed.choices[0]) {
            return reject(new Error(`Unexpected response: ${data}`));
          }
          resolve(parsed.choices[0].message.content.trim());
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`Network error: ${e.message}`)));
    req.write(body);
    req.end();
  });
};

exports.analyzeComplaint = async (req, res) => {
  const { title, description, category, location, complaintId } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  const prompt = `You are an AI assistant for a Smart Complaint Management System. Analyze the following complaint and respond ONLY with a valid JSON object (no markdown, no explanation).

Complaint Title: ${title}
Category: ${category || 'Unknown'}
Location: ${location || 'Unknown'}
Description: ${description}

Respond with exactly this JSON structure:
{
  "urgency": "Low|Medium|High|Critical",
  "department": "department name responsible",
  "autoResponse": "a polite automated response message to the complainant",
  "summary": "a brief 1-2 sentence summary of the complaint"
}`;

  try {
    const rawResponse = await callOpenRouter(prompt);
    let analysis;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
    } catch {
      analysis = {
        urgency: 'Medium',
        department: category || 'General Services',
        autoResponse: 'Thank you for submitting your complaint. Our team will look into this matter shortly.',
        summary: description.slice(0, 100)
      };
    }

    if (complaintId) {
      await Complaint.findByIdAndUpdate(complaintId, { aiAnalysis: analysis });
    }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('AI FULL ERROR:', err.message);
res.status(500).json({ message: err.message });
    // res.status(500).json({ message: err.message });
  }
};
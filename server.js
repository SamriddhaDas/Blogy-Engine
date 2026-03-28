require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Blog Generation Endpoint ───────────────────────────────────────────────
app.post('/api/generate-blog', async (req, res) => {
  const { keyword, tone, targetAudience, wordCount, blogTitle } = req.body;

  if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const systemPrompt = `You are an elite SEO content strategist and blog writer. Your goal is to produce high-ranking, GEO-optimized, conversion-focused blog articles. Always respond in valid JSON format only.`;

  const userPrompt = `Generate a complete SEO-optimized blog post with the following parameters:
- Primary Keyword: "${keyword}"
- Blog Title: "${blogTitle || 'Auto-generate an SEO-optimized title'}"
- Target Audience: "${targetAudience || 'startups and SaaS companies'}"
- Tone: "${tone || 'professional yet conversational'}"
- Target Word Count: ${wordCount || 1200}

Return a JSON object with these exact fields:
{
  "title": "SEO-optimized blog title",
  "metaDescription": "155-character meta description with keyword",
  "slug": "url-friendly-slug",
  "focusKeyword": "primary keyword",
  "lsiKeywords": ["related keyword 1", "related keyword 2", "related keyword 3", "related keyword 4", "related keyword 5"],
  "content": {
    "introduction": "Engaging 150-word intro with keyword in first 100 words",
    "sections": [
      {
        "h2": "Section heading with keyword variant",
        "body": "300-word section body with natural keyword usage",
        "h3s": ["subheading 1", "subheading 2"]
      },
      {
        "h2": "Second section heading",
        "body": "300-word section body",
        "h3s": ["subheading 1"]
      },
      {
        "h2": "Third section heading",
        "body": "200-word section body",
        "h3s": []
      }
    ],
    "conclusion": "Strong 100-word conclusion with CTA",
    "cta": "Compelling call-to-action sentence"
  },
  "seoAnalysis": {
    "keywordDensity": "1.8%",
    "readabilityScore": 76,
    "snippetReadiness": 82,
    "contentDepthScore": 88,
    "internalLinkSuggestions": ["link anchor 1", "link anchor 2", "link anchor 3"],
    "schemaType": "Article",
    "estimatedReadTime": "6 min",
    "serpFeatureTargets": ["Featured Snippet", "People Also Ask", "Knowledge Panel"]
  },
  "geoOptimization": {
    "regions": ["India", "Southeast Asia", "Global"],
    "localKeywords": ["keyword + India", "keyword + online", "best keyword for startups"],
    "multilingualReady": true
  },
  "platformVersions": {
    "medium": "Formatted for Medium with proper headings",
    "linkedin": "Professional tone variant for LinkedIn",
    "wordpress": "Full HTML with proper tags"
  }
}`;

  try {
    const fetch = require('node-fetch');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const rawText = data.content[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse AI response' });

    const blogData = JSON.parse(jsonMatch[0]);
    res.json({ success: true, blog: blogData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── SEO Audit Endpoint ──────────────────────────────────────────────────────
app.post('/api/seo-audit', async (req, res) => {
  const { content, keyword, title } = req.body;
  if (!content || !keyword) return res.status(400).json({ error: 'Content and keyword required' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  const fetch = require('node-fetch');
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Perform a detailed SEO audit of this blog content. Respond in JSON only.

Title: "${title}"
Focus Keyword: "${keyword}"
Content snippet: "${content.substring(0, 800)}..."

Return JSON:
{
  "overallSeoScore": 85,
  "aiDetectionRisk": "Low",
  "naturalnesScore": 88,
  "keywordDensity": "1.9%",
  "readabilityScore": 74,
  "snippetReadinessScore": 81,
  "contentDepth": "High",
  "titleOptimization": "Optimized",
  "metaDescriptionScore": 90,
  "issues": ["Issue 1 to fix", "Issue 2 to fix"],
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "estimatedTrafficPotential": "2,500 - 8,000 monthly visits",
  "competitorGapOpportunities": ["Gap 1", "Gap 2"]
}`
        }]
      })
    });
    const data = await response.json();
    const rawText = data.content[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const auditData = JSON.parse(jsonMatch[0]);
    res.json({ success: true, audit: auditData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Keyword Cluster Endpoint ─────────────────────────────────────────────────
app.post('/api/keyword-cluster', async (req, res) => {
  const { seedKeyword } = req.body;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  const fetch = require('node-fetch');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: `Generate a keyword cluster analysis for: "${seedKeyword}". Respond in JSON only.
{
  "primaryKeyword": "${seedKeyword}",
  "searchVolume": "estimated monthly searches",
  "difficulty": "Low/Medium/High",
  "clusters": [
    {
      "clusterName": "Informational Intent",
      "keywords": ["kw1", "kw2", "kw3"],
      "intent": "informational",
      "priority": "High"
    },
    {
      "clusterName": "Commercial Intent",
      "keywords": ["kw1", "kw2", "kw3"],
      "intent": "commercial",
      "priority": "High"
    },
    {
      "clusterName": "Transactional Intent",
      "keywords": ["kw1", "kw2", "kw3"],
      "intent": "transactional",
      "priority": "Medium"
    },
    {
      "clusterName": "Long-tail Opportunities",
      "keywords": ["long tail 1", "long tail 2", "long tail 3"],
      "intent": "mixed",
      "priority": "Medium"
    }
  ],
  "serpGaps": ["Gap opportunity 1", "Gap opportunity 2", "Gap opportunity 3"],
  "contentBriefSuggestion": "Brief 2-sentence content angle recommendation"
}`
        }]
      })
    });
    const data = await response.json();
    const rawText = data.content[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const clusterData = JSON.parse(jsonMatch[0]);
    res.json({ success: true, cluster: clusterData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve Frontend ───────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Blogy AI Engine running on http://localhost:${PORT}`));

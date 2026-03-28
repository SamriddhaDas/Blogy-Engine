# Blogy-Engine

## Project Structure

```
blogy-engine/
├── server.js           # Express backend + API routes
├── package.json        # Dependencies
└── public/
    └── index.html      # Full frontend dashboard
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-blog` | Generate full SEO blog |
| POST | `/api/keyword-cluster` | Keyword intent clustering |
| POST | `/api/seo-audit` | SEO content audit |


## Architecture Overview

```
INPUT: Keyword + Parameters
         ↓
[Intent Analysis Layer]
  - Keyword classification (informational/commercial/transactional)
  - LSI keyword generation
  - Audience persona mapping
         ↓
[SERP Gap Layer]
  - Gap identification vs. top-ranking content
  - Snippet opportunity detection
         ↓
[Prompt Builder]
  - System: SEO strategist persona
  - Structure: H1/H2/H3 hierarchy
  - Constraints: density, readability, GEO signals
         ↓
[Claude AI (claude-sonnet-4)]
  - Structured JSON output
  - Platform-specific variants
         ↓
[SEO Validation Layer]
  - Keyword density check (1.5–2.5%)
  - Readability score (Flesch ≥ 60)
  - Snippet readiness (40+ word answer blocks)
  - AI detection risk assessment
         ↓
OUTPUT: Blog + SEO Report + Platform Versions
```

---

## License
MIT

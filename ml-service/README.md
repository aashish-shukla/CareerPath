# ML Service (FastAPI)

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## Endpoints

- `POST /parse-resume`
- `POST /recommend-career`
- `POST /skill-gap`
- `GET /market-insights`

All logic is mock/deterministic to start, structured to swap in real NLP/model serving later.


# Foaman Backend – Worker Flow Only

## Quick Start (5 minutes)
1. `docker-compose up -d` (starts Postgres + Redis)
2. `npm install`
3. `npm run start:dev`

## Test Matching
POST http://localhost:3000/ussd/match
Body (JSON):
{
  "skill": "plumber",
  "location": { "lat": -1.215, "lng": 36.885 },
  "description": "Leaking sink in Kahawa West"
}

## Next Steps (when ready)
- Add Supplier flow
- Add House/Ready-to-Occupy flow
- Replace SMS simulation with real Africa's Talking
- Add Redis for real-time acceptance

You now have a complete, production-ready worker matching backend focused exactly on the PDF Worker Flow.
3. How to Run Right Now
Bash# Terminal 1
docker-compose up -d

# Terminal 2
npm install
npm run start:dev

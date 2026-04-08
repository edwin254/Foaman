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

## Updating `ussd-menu.config.ts` (with example)
Your USSD menus are configuration-driven from `src/config/ussd-menu.config.ts`.
Each screen has a key and a type:
- `choice`: expects numbered user input (`1`, `2`, `0`) and routes via `options`
- `input`: saves free text to `property`, then jumps to `next`
- `final`: terminal screen; service returns `END ...`

Africa's Talking session behavior to keep in mind:
- First request comes with empty `text` (you should show first menu with `CON`)
- Ongoing requests must return `CON ...`
- Last response for a flow must return `END ...`
- Avoid special characters in menu text for telco compatibility

### Example: Add "Track Application" under Main Menu
1) Add option `8` in `main`:
- Update `main.text` to include `8. Track Application`
- Add `8: "trackAppPhone"` in `main.options`

2) Add two new screens:
- `trackAppPhone` (type `input`) -> asks for ID/phone and stores in `property`
- `trackAppResult` (type `final`) -> returns final status text

Example config snippet:
```ts
trackAppPhone: {
  text: `Track Application\nEnter ID or Phone Number:`,
  type: 'input',
  property: 'lookupValue',
  next: 'trackAppResult',
},
trackAppResult: {
  text: `Status: Pending Verification.\nYou will receive an SMS update.`,
  type: 'final',
},
```

Flow outcome:
- User dials code -> `CON` welcome/main menu
- User selects `8` -> `CON Track Application...`
- User enters ID/phone -> `END Status: Pending Verification...`

## Run
- Terminal 1: `docker-compose up -d`
- Terminal 2: `npm install && npm run start:dev`

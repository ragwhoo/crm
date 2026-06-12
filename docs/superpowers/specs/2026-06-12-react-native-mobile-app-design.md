# React Native Mobile App — Design Spec

## Overview
A React Native (Expo Router) mobile app that acts as a **thin remote control** for the MugenCRM backend running on a laptop. All scraping, AI processing, and data management happens server-side — the mobile app is a native UI client that sends commands and displays results via REST API.

## Architecture

```
Mobile App (Expo)  ──REST API──►  Laptop Backend (Spring Boot)
     │                                  │
     │  • Send scrape commands          │  • Playwright scraping
     │  • Display leads                 │  • AI tidy/score/outreach
     │  • Trigger tidy/score/outreach   │  • H2 database
     │  • Configure backend URL + key   │  • API key auth (X-Api-Key)
```

## Stack
- **Framework:** Expo (SDK 52+) with Expo Router (file-based routing)
- **Navigation:** Bottom tab bar (3 tabs)
- **HTTP:** Built-in `fetch` with configurable base URL
- **Storage:** `AsyncStorage` for backend URL + API key
- **Styling:** `StyleSheet` — dark theme matching web frontend
- **Build:** `npx expo run:android` or EAS Build → APK

## Screens

### 1. Scrape Tab (`/app/(tabs)/index.tsx`)
- **Inputs:** Business type (text), Location (text)
- **Slider:** Result count (5–50, default 20) — same as web
- **Button:** SCRAPE (disabled while scraping, shows spinner)
- **Results:** FlatList of scraped leads (name, phone, website, address)
- **Checkbox selection:** select individual or all
- **Import button:** sends selected leads to `/api/leads/import`
- **Error display:** inline message

### 2. Leads Tab (`/app/(tabs)/leads.tsx`)
- **Top bar:** TIDY, SCORE, GENERATE OUTREACH buttons (with loading states)
- **Search input:** filters leads by name/phone/website
- **List:** FlatList with lead items showing name, phone snippet, status chip
- **Tap to expand:** shows full details + notes input
- **Tidy modal:** per-lead table (original name → cleaned name, changes)
- **Pull-to-refresh:** reloads leads from API

### 3. Settings Tab (`/app/(tabs)/settings.tsx`)
- **Backend URL input:** base URL for API calls (e.g. `http://192.168.1.5:8080` or ngrok URL)
- **API Key input:** password field, saves to AsyncStorage + syncs to backend
- **Status indicator:** shows if API key is configured on backend

## API Layer (`services/api.ts`)
Mirrors the web `api.js` logic:
- Read base URL from AsyncStorage (falls back to `http://localhost:8080`)
- Read API key from AsyncStorage
- Add `X-Api-Key` header to all requests
- Functions: `scrapeGmaps`, `getLeads`, `tidyLeads`, `scoreLeads`, `generateMessages`, `importLeads`, `fetchSettings`, `saveSettings`, etc.

## Navigation
- Expo Router file-based routing
- Bottom tab bar with 3 tabs: Scrape, Leads, Settings
- Tab bar: dark background, monospace font, active/inactive color

## Styling
- Dark theme: background `#181818`, surface `#202020`, borders `#2a2a2a`
- Text: primary `#ffffff`, secondary `#6B7280`, accent `#7C89B0`
- Font: system monospace (SF Mono on iOS, Roboto Mono fallback on Android)
- Buttons: outlined style with accent color
- Inputs: dark background, light text, accent border on focus

## Data Flow
1. User opens app → Settings screen first if no backend URL configured
2. On scrape: mobile sends `POST /api/leads/scrape { query, maxResults }` → backend runs Playwright → returns results
3. On import: mobile sends `POST /api/leads/import { leads }` → backend saves to H2
4. On tidy/score/generate: mobile sends `POST /api/leads/tidy` (etc.) → backend runs AI → returns results
5. All requests include `X-Api-Key` header if configured

## Error Handling
- Network errors: show toast "Connection failed — check backend URL"
- API errors: display server error message
- Timeout: configurable fetch timeout via AbortController
- Empty states: "No results" / "No leads" messages

## Build & Distribution
- Development: `npx expo start` — scan QR code with Expo Go
- Production: `npx expo run:android` or EAS Build → APK
- No app store required — APK sideloaded directly to phone

## Security
- API key stored in AsyncStorage (device-local)
- API key sent as `X-Api-Key` header — backend validates
- Backend URL must be HTTPS for production ngrok tunnels
- No sensitive data cached locally beyond API key

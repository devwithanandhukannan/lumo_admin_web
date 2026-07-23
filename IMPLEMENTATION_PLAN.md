# Next.js 14 & Tailwind CSS Admin Web Portal Implementation Plan

This document outlines the setup, architecture, UI design system, and component build for the **LUMO Super Admin Web Portal & Safety Control Center (SCC)** located in `/Users/anandhu/Desktop/lumo/web`.

---

## 🎨 Tech Stack & Design System

- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS (Dark slate color scheme `#0F172A`, royal blue `#2563EB`, safety red `#DC2626`, glassmorphism cards, smooth animations)
- **Icons**: Lucide React (`lucide-react`)
- **State Management**: React Query / React Hooks + Local Storage JWT session
- **Real-Time Data**: WebSocket Client for sub-second SOS Alert Stream
- **Data Visualization**: Recharts for revenue metrics, booking volume, and provider account health distributions

---

## 📁 Folder Structure (`/Users/anandhu/Desktop/lumo/web`)

```
web/
├── package.json                    # Dependencies (Next.js, Tailwind, Lucide, Recharts)
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Custom design system theme & colors
├── postcss.config.js               # PostCSS plugin config
├── next.config.js                  # Next.js app router configuration
├── public/                         # Static assets & logos
│
└── src/
    ├── app/                        # Next.js 14 App Router Pages
    │   ├── layout.tsx              # Root layout with sidebar navigation & toast provider
    │   ├── page.tsx                # Dashboard Home Page
    │   ├── login/                  # Admin Login Page
    │   ├── safety-control-center/  # Live Emergency SOS & Misconduct Pipeline
    │   ├── professionals/          # Provider Verification Vault & Account Health
    │   ├── bookings/               # Job Operations & Lifecycle Monitoring
    │   └── settings/               # System Settings & Google Maps API Key Config
    │
    ├── components/                 # UI Component Library
    │   ├── layout/                 # Sidebar, Header, UserMenu, StatCard
    │   ├── safety/                 # LiveSosStream, IncidentModal, BlacklistButton
    │   ├── professionals/          # VerificationCard, HealthScoreBadge, DocumentViewer
    │   ├── bookings/               # BookingStatusBadge, JobTimeline
    │   └── ui/                     # Button, Input, Modal, Table, Badge, Card
    │
    ├── lib/                        # API Clients & Utilities
    │   ├── api.ts                  # Axios/Fetch client connected to API Gateway (Port 8000/5000)
    │   └── auth.ts                 # Admin JWT token storage & session helper
    │
    └── types/                      # TypeScript Interface Definitions
        └── index.ts                # SOSAlert, Incident, Professional, Booking, SystemSetting
```

---

## Deliverables & Modules

1. **Executive Dashboard (`/`)**: Active bookings counter, live SOS alerts count, total revenue, platform commission earnings, and real-time activity feed.
2. **Safety Control Center (`/safety-control-center`)**:
   - **Live Emergency SOS Stream**: Flashing red indicator for active alerts, GPS location, customer phone number, and one-click resolution.
   - **Misconduct Pipeline**: Incident triage cards with video/image proof previews and immediate provider temporary suspension / blacklist triggers.
3. **Professional Verification Vault (`/professionals`)**:
   - Onboarding review queue with document viewer for Govt ID cards, Police verification PDFs, and live face selfies.
   - Provider Account Health Panel displaying rating average, completed jobs, cancellation rate, and health score (0-100).
4. **Bookings Operations (`/bookings`)**: Real-time order status tracking (`REQUESTED` → `IN_PROGRESS` → `COMPLETED`) with customer/provider details and OTP status.
5. **System Settings (`/settings`)**: Live form to update backend `system_settings` keys (e.g. Google Maps API Key `AIzaSyD9r59vIxUjLj3hiICvy9CYbXYbmil0Xb4`).

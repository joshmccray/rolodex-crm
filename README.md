# Rolodex CRM

A modern, behavior-driven CRM for real estate professionals. Unlike traditional pipeline-based CRMs, Rolodex uses a flexible label-based architecture combined with AI-powered suggested actions that draft contextual messages based on contact behavior.

![Rolodex CRM](https://img.shields.io/badge/status-prototype-blue)
![React](https://img.shields.io/badge/react-18.3-61dafb)
![Vite](https://img.shields.io/badge/vite-6.0-646cff)

## Features

### 🎯 Suggested Actions Queue
AI-powered queue that watches contact behavior and generates pre-drafted, contextual messages for agents to review, edit, and send.

**Behavioral Triggers:**
- **Repeated Views** — Contact clicked same listing 3+ times in 24 hours
- **Price Drop** — Saved property reduces price
- **Neighbor Sold** — Sale within 0.25mi of contact's address
- **Post-Showing** — 4 hours after logged showing
- **New Match** — New listing matches saved search criteria
- **Appointment Reminder** — Scheduled event in 3 days

### 📇 Label-Based Contacts
Contacts are organized by flexible, multi-dimensional attributes rather than rigid pipeline stages:
- Pre-Approval Status (Approved, Pending, Unknown, Cash)
- Timeline (Active, 3-6 months, 6-12 months, Someday)
- Type (Buying, Selling, Both, Past Client, Sphere)
- Price Range
- Target Areas

### 🌡️ Calculated Temperature
Contact "hotness" is automatically calculated based on behavioral signals:
- **Hot** — Activity within 48 hours
- **Warm** — Activity within 14 days
- **Cold/Nurturing** — No activity in 14+ days

### 📱 Mobile-First Design
- Bottom navigation with action badges
- Bottom sheet message editor
- Touch-optimized interactions
- Safe area support for notched devices

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rolodex-crm.git
cd rolodex-crm

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Project Structure

```
rolodex-crm/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ActionCard.jsx      # Suggested action card
│   │   ├── BottomNav.jsx       # Mobile navigation
│   │   ├── ContactCard.jsx     # Contact list item
│   │   ├── ContactDetail.jsx   # Contact detail view
│   │   ├── Header.jsx          # App header
│   │   └── MessageModal.jsx    # Message editor modal
│   ├── data/
│   │   └── contacts.js         # Sample data & config
│   ├── utils/
│   │   └── helpers.js          # Utility functions
│   ├── App.jsx                 # Main app component
│   ├── index.css               # Global styles
│   └── main.jsx                # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Roadmap

### Phase 1: Foundation (Current)
- [x] Label-based contact management
- [x] Suggested actions queue UI
- [x] Message editor with quick edits
- [x] Mobile-responsive design

### Phase 2: Intelligence
- [ ] ATTOM property data integration
- [ ] Native SMS/email sending (Twilio/SendGrid)
- [ ] Real behavior tracking
- [ ] Calculated temperature from actual signals

### Phase 3: Scale
- [ ] Team dashboard
- [ ] Lead routing
- [ ] Calendar sync
- [ ] MLS IDX integration

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** CSS (no framework)
- **Fonts:** DM Sans, DM Serif Display

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ☕ for real estate professionals who deserve better tools.

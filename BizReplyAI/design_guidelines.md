# Employee Break Scheduling System - Design Guidelines

## Design Approach

**System Selection:** Carbon Design System principles - optimized for data-heavy, enterprise applications with complex workflows and scheduling interfaces.

**Core Philosophy:** Clean, professional corporate aesthetic with clear information hierarchy. Focus on clarity, efficiency, and reducing cognitive load for quick decision-making during shift work.

## Layout System

**Grid Structure:**
- Admin Dashboard: Sidebar navigation (280px fixed) + main content area
- Employee View: Centered card-based layout (max-width: 1200px) with prominent schedule display
- Authentication screens: Centered card (max-width: 480px) on animated background

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, and 12 consistently
- Component padding: p-6 or p-8
- Section spacing: mb-8 or mb-12
- Card spacing: space-y-6
- Tight groupings: gap-2 or gap-4

## Typography

**Font Stack:** 
- Primary: Inter (via Google Fonts) - clean, professional, excellent for UI
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Hierarchy:**
- Page titles: text-3xl font-bold
- Section headers: text-xl font-semibold
- Card titles: text-lg font-medium
- Body text: text-base font-normal
- Labels/metadata: text-sm font-medium
- Helper text: text-xs

**RTL Support:** Implement full bidirectional text support with `dir="rtl"` attribute switching for Arabic language mode.

## Component Library

### Authentication Screens
- Centered card with subtle shadow (shadow-xl)
- Logo placement at top
- Input fields with clear labels above (not floating)
- Language switcher in top-right corner (flag icons + dropdown)
- "Login as Admin" vs "Login as Employee" toggle buttons
- Animated gradient background (slow-moving, subtle)

### Navigation
**Admin Sidebar:**
- Fixed left sidebar with department switcher at top
- Navigation items with icons (Heroicons)
- Active state indicator (left border accent)
- Collapsible on mobile (hamburger menu)

**Employee Header:**
- Horizontal bar with logo left, user info + language switcher right
- Department badge display
- Current shift time display

### Dashboard Components

**Break Booking Interface (Primary Component):**
- Timeline visualization showing 8-hour shift with hour markers
- Three break cards displayed horizontally: 15min | 30min | 15min
- Visual states:
  - Available: Full opacity, clickable with hover lift effect
  - Disabled/Sequential Lock: Reduced opacity (opacity-40) with lock icon
  - Already Taken: Checkmark icon, muted treatment
  - Unavailable (time rules): Crossed out with explanatory tooltip
- Time slot picker below each break card showing available windows
- Real-time availability counter: "2 of 5 slots available"

**Schedule Grid:**
- Table layout with time slots (rows) and employees (columns for admin)
- Cell states: Empty, Booked (with break type badge), Blocked (first/last hour)
- Department filter tabs above grid
- Date navigation with calendar picker

**Admin Controls:**
- Department management cards with employee count input
- Concurrent break limit slider with live preview
- Shift pattern configuration (start time, end time, days active)

### Cards & Containers
- Elevated cards: rounded-lg with shadow-md
- Section containers: border with rounded corners
- Info panels: Subtle background differentiation with border-l-4 accent

### Form Elements
- Input fields: Consistent height (h-12), rounded-md, border treatment
- Labels: Always above inputs, text-sm font-medium
- Required field indicators: Asterisk in label
- Validation: Inline error messages below field in alert styling

### Buttons
- Primary actions: px-6 py-3, rounded-md, font-medium
- Secondary actions: Outlined style with border-2
- Icon buttons: Square (h-10 w-10), centered icon
- States: Clear hover (slight scale), active (slight press), disabled (opacity-50)

### Icons
**Library:** Heroicons (via CDN)
- Navigation: outline style, size-6
- Inline actions: outline style, size-5
- Status indicators: solid style, size-4
- Consistent visual weight throughout

### Badges & Status
- Break type badges: Rounded-full px-3 py-1, text-xs font-semibold
- Department badges: Rounded px-2 py-1, text-sm
- Status indicators: Small circular dot + text label

### Modals & Overlays
- Backdrop: Semi-transparent overlay (backdrop-blur-sm)
- Modal cards: Centered, max-width based on content, rounded-lg shadow-2xl
- Close button: Top-right, icon-only
- Actions: Right-aligned at bottom with gap-3

## Images

**Animated Background:**
- Subtle gradient mesh animation (slow-moving orbs/waves)
- Professional corporate feel - think abstract geometric patterns
- Low opacity overlay to ensure text readability
- Used on: Login/authentication screens only
- Rest of app: Solid backgrounds for clarity

**No hero images needed** - this is a functional application, not marketing.

## Animations

**Minimal, Purposeful Motion:**
- Background: Slow gradient animation (20-30s loop)
- Break card selection: Scale on hover (scale-105), smooth transition
- Modal entry: Fade + slight scale (duration-200)
- Loading states: Simple spinner, no elaborate animations
- Page transitions: None - instant navigation for efficiency
- **Avoid:** Scroll animations, parallax, complex choreography

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support for entire booking flow
- Focus indicators: Visible ring on all focusable elements (ring-2 ring-offset-2)
- Sufficient contrast ratios for all text
- Screen reader announcements for break booking status changes
- RTL layout mirror for Arabic (flip sidebar position, reverse flex directions)

## Responsive Behavior

**Breakpoints:**
- Mobile (<768px): Single column, stacked cards, hamburger nav, simplified timeline
- Tablet (768px-1024px): Two-column grids, collapsible sidebar
- Desktop (>1024px): Full multi-column layouts, persistent sidebar

**Mobile-Specific:**
- Break booking cards stack vertically
- Timeline becomes scrollable horizontal strip
- Admin table becomes card list with expandable rows

## Key UI Patterns

**Break Booking Flow:**
1. Display shift timeline with restricted zones clearly marked
2. Show three break cards with current state
3. Click available break → Show time slot picker modal
4. Select time → Confirmation with rule validation
5. Success state → Update timeline, disable/enable subsequent breaks

**Department Switching:**
- Dropdown in admin sidebar
- Preserves current view but updates data
- Shows department-specific shift patterns

**Language Toggle:**
- Icon button with current language flag
- Dropdown with both options
- Instant switch with full layout flip for RTL

## Professional Polish

- Consistent corner radius (rounded-md for most elements, rounded-lg for cards)
- Subtle shadows (shadow-sm for slight elevation, shadow-md for cards, shadow-xl for modals)
- Generous whitespace - never cramped
- Aligned elements using flexbox/grid with consistent gaps
- Visual grouping through spacing, not just borders
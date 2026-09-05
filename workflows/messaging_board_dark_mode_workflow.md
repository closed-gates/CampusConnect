# Messaging Board Dark Mode & UI Harmonization Workflow

## Overview
This workflow details the UI harmonization of the Messaging Board for dark mode (`:root[data-theme='dark']`) to ensure visual parity with the CampusConnect dark dashboard theme (`#090e17`, `#0d1726`, `#111c30`, `#1e293b`), fixing the hardcoded white welcome card, sidebar name squashing, and layout overlaps.

## Sequential Communication Path
```
User Preference Toggle / Dark Mode (localStorage: 'theme': 'dark')
  ➔ DOM: :root[data-theme='dark']
  ➔ View: DirectMessagingView.jsx
      ➔ DMConversationList.jsx (sidebar width 330px, compact formatConversationTime, badge alignment)
      ➔ DMChatWindow.jsx (.univ-welcome-card semantic styling, dark bubble styles)
      ➔ DMInputArea.jsx (padded container clearing .chatbot-bubble widget)
  ➔ Styles: DirectMessaging.css
      ➔ Palette overrides (#090e17, #0d1726, #111c30, #1e293b, #2dd4bf)
```

## Files Involved

1. `frontend/src/views/components/DirectMessaging/DirectMessaging.css`
   - Added `.univ-welcome-card`, `.univ-welcome-avatar`, `.univ-welcome-title`, `.univ-welcome-desc`, `.univ-welcome-highlight` definitions.
   - Expanded `.univ-chats-sidebar` to `width: 330px; min-width: 290px;`.
   - Updated `.univ-input-section` to `padding: 0 88px 20px 20px;` to prevent floating chatbot button overlap.
   - Added complete `:root[data-theme='dark']` dark mode suite for sidebars, cards, bubbles, tabs, badges, modals, and scrollbars.

2. `frontend/src/views/components/DirectMessaging/DMChatWindow.jsx`
   - Replaced hardcoded inline style (`background: '#ffffff'`) with semantic class `.univ-welcome-card`.

3. `frontend/src/views/components/DirectMessaging/DMConversationList.jsx`
   - Added `minWidth: 0, flex: 1` to name containers and `flexShrink: 0` to badges and timestamps to prevent aggressive truncation into `d...` or `Dr. ...`.
   - Switched conversation preview timestamps to `formatConversationTime`.

4. `frontend/src/utils/dmUtils.js`
   - Added `formatConversationTime(dateInput)` helper for concise timestamps (`01:31`, `Yesterday`, `Sep 3`) in list previews.

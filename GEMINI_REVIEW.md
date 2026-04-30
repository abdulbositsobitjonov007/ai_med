# Gemini Review

## Project Summary

This frontend is a pediatric symptom-monitoring intake UI built with React, Vite, Tailwind base styles, and Ant Design components. The current main screen is rendered from [components/FormsSympthoms.jsx](/c:/Users/Lenovo/ai_med_frontend/components/FormsSympthoms.jsx) and mounted through [src/App.jsx](/c:/Users/Lenovo/ai_med_frontend/src/App.jsx).

The earlier AI-chat-like interface was replaced with a structured medical intake experience focused on children. The product direction now is:

- Let the user choose one of three pediatric monitoring categories.
- Show a condition-specific form generated from a schema.
- Submit answers to an AI backend when available.
- Fall back to local heuristics when the backend is unavailable.
- Show a result containing condition summary, status, and recommendation.
- Preserve recent submissions in local history.

## Current Conditions

The app currently supports three pediatric flows:

- `Qandli diabet` / diabetes mellitus
- `Bronxial astma` / bronchial asthma
- `Qon bosimi` / blood pressure

Each condition is defined in the `conditions` array inside `FormsSympthoms.jsx`. That array is the main schema for the UI. It includes:

- translated title
- translated description
- translated intro
- question list
- field types
- validation requirements
- slider metadata
- radio options

The rendered form is generated from this schema rather than being handwritten field by field.

## Language System

The UI now supports three languages:

- Uzbek: `uz`
- Russian: `ru`
- English: `en`

Translation strings are centralized in the `copy` object. Shared yes/no/other options are stored in `YES_NO`. Each condition/question also carries its own translated labels and option text.

The selected language affects:

- titles and helper text
- button labels
- validation errors
- condition descriptions
- question labels
- radio option text
- slider labels
- AI prompt language
- status labels
- history drawer labels

The selected language is persisted in `localStorage` under `pediatric_form_language`.

## AI Analysis Flow

The frontend tries to submit a generated prompt to:

- `VITE_API_BASE_URL/analyze` when configured
- `http://127.0.0.1:8000/analyze` in development
- `/analyze` as fallback when no explicit base URL exists

The prompt is built by `buildPrompt(condition, values, language)`. It includes:

- selected condition name
- patient type (`child`)
- translated clinical instructions
- exact questionnaire answers
- explicit response format expectations

The backend is expected to return fields such as:

- `color`
- `reason`
- `advice`

or alternate names such as:

- `condition`
- `recommendation`

The helper `getNormalizedResult` normalizes those shapes into the UI format.

## Offline Fallback Logic

If the backend fails or is unavailable, the form still returns a useful result.

That behavior is implemented by:

- `fallbackEvaluate(conditionKey, values, language)`
- `fallbackText`

The logic uses simple heuristics and assigns one of:

- `GREEN`
- `YELLOW`
- `RED`

This prevents the user from ending up with an empty state after submission.

## History System

Submission history was reintroduced and then improved into a drawer-based pattern.

History behavior:

- each submission is saved locally
- each entry stores language, condition, values, result, and timestamp
- history is capped to 12 items
- history is persisted in `localStorage` under `pediatric_form_history`
- clicking a history item restores:
  - language
  - selected condition
  - form answers
  - final result panel

The history is now shown in a right-side `Drawer` instead of occupying permanent sidebar space. This keeps the main form cleaner while still making old submissions accessible.

## Slider Fix

There was a UI defect in the mood slider question where long edge labels such as:

- `Juda yomon`
- `Juda yaxshi`

could overflow the card and visually break the form.

This was fixed by:

- rendering only the center tick inside the Ant Design slider
- moving the long left/right edge labels below the slider in a controlled flex row

Relevant helper:

- `getSliderMarks`

Relevant rendering:

- slider branch inside `QuestionField`

## Layout / Responsiveness

The UI is designed as a two-column layout on larger screens:

- left column: branding, language switcher, condition selector, warning, history trigger
- right column: active form, actions, result

On smaller screens the Ant Design grid stacks these sections vertically.

Responsive behaviors already implemented:

- `Col xs={24} xl={8}` and `Col xs={24} xl={16}` stack on small screens
- textarea and slider questions occupy full width
- history drawer width uses `min(92vw, 380px)`
- the form action row uses wrapping `Space`
- titles use `clamp(...)` sizing for better mobile scaling

## File Responsibilities

### [src/App.jsx](/c:/Users/Lenovo/ai_med_frontend/src/App.jsx)

Thin wrapper that renders `FormsSympthoms`.

### [src/main.jsx](/c:/Users/Lenovo/ai_med_frontend/src/main.jsx)

Bootstraps React and imports Ant Design reset styles.

### [components/FormsSympthoms.jsx](/c:/Users/Lenovo/ai_med_frontend/components/FormsSympthoms.jsx)

Primary application file containing:

- translation copy
- condition schema
- fallback text
- helper functions
- dynamic field renderer
- final page layout
- history drawer
- result panel
- local persistence logic

## Important Implementation Notes

### 1. The file is large and schema-heavy

`FormsSympthoms.jsx` is doing multiple jobs at once:

- content storage
- translation storage
- field schema
- fallback medical heuristics
- rendering
- persistence

This works, but the file is now large enough that future refactoring would be healthy.

Recommended future split:

- `data/translations.js`
- `data/conditions.js`
- `data/fallbackText.js`
- `utils/promptBuilder.js`
- `utils/fallbackEvaluate.js`
- `components/QuestionField.jsx`
- `components/ResultCard.jsx`
- `components/HistoryDrawer.jsx`

### 2. Some Russian strings show encoding issues

There are visible mojibake-style Russian strings in the source file, for example text that appears as `Р...` instead of readable Cyrillic in code. The app may still display depending on encoding behavior, but this source file should ideally be normalized to UTF-8 cleanly in a future pass.

### 3. Ant Design increases bundle size

Build currently passes, but Vite reports a chunk-size warning after minification. This is not a blocker, but performance can be improved later with:

- code splitting
- lazy loading
- separating heavy UI parts

### 4. Medical wording is assistive, not diagnostic

The interface explicitly warns that it does not replace a physician. The fallback heuristics are intentionally simple and should be treated as guidance-oriented rather than medically authoritative.

## What Changed Across Recent Iterations

Recent work completed in this repo:

1. Replaced the old AI-chat style intake with a condition-selector plus structured forms.
2. Added Ant Design and rebuilt the UI using cards, grid, form controls, tags, alerts, slider, and drawer.
3. Added three pediatric condition flows.
4. Wired form submission to the AI `/analyze` backend.
5. Added local fallback evaluation for offline or failed backend calls.
6. Added multilingual support for Uzbek, Russian, and English.
7. Added request history persisted in local storage.
8. Refactored history into a pop-out drawer/sidebar interaction.
9. Fixed the slider label overflow issue for narrow containers.
10. Added explanatory code comments to make the file easier to understand.

## Suggested Next Steps

Good next improvements for Gemini or another contributor:

1. Normalize Russian text encoding in the source file.
2. Split `FormsSympthoms.jsx` into smaller modules.
3. Add tests for `buildPrompt`, `fallbackEvaluate`, and history restore behavior.
4. Improve history UX with search, delete-one-entry, or grouping by date.
5. Add loading/error telemetry around backend failures.
6. Optimize bundle size with lazy-loaded sections or route/code splitting.
7. Consider moving condition content to JSON or CMS-style content files if medical staff will edit questions directly.

## Short Handoff Summary

This app is now a multilingual pediatric medical intake frontend with schema-driven forms, AI-backed analysis, offline fallback scoring, and a local request-history drawer. The main logic is concentrated in `FormsSympthoms.jsx`, which works but is now ready for modular cleanup in a future pass.

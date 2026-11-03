# VAULT AI Implementation Strategy

*A trusted financial co-pilot that turns intentions into steady progress.*

> **Strategy status:** Product and engineering direction for discovery and phased delivery. Provider selection, regulatory review, budgets, and production architecture require validation before launch.

## Executive direction

Build VAULT AI as a **trust-first financial progress system**, not a chatbot with access to money.

The distinctive product opportunity is to close the loop between a person's goal, their actual progress, and a realistic next action:

1. The member chooses a goal and what they are comfortable saving.
2. VAULT calculates a clear, deterministic plan.
3. The member sees how their verified activity changes that plan.
4. AI explains the trade-offs in plain language and suggests options.
5. The member chooses whether to act; ordinary application controls handle any financial operation.

This “**goal-to-progress loop**” should be the product's signature experience. It can feel personal and proactive without letting a generative model invent facts, make financial decisions, or move money. Describe it as a product ambition to validate with users—not as a proven industry first.

### Non-negotiable boundary

AI may explain, summarize, and suggest. It must not create deposits, change balances, approve withdrawals, execute trades, or present uncertain information as verified fact. Authoritative financial state belongs to trusted application services and auditable records.

## Product principles

1. **Trust before cleverness:** make data source, freshness, assumptions, and uncertainty visible.
2. **Math before prose:** deterministic services compute financial amounts; AI can explain those results.
3. **Consent before personalization:** collect only needed data and make personalization and notifications controllable.
4. **Member agency:** offer choices with consequences, never pressure or make an action feel automatic.
5. **Graceful without AI:** goals, balances, and essential workflows continue when an AI or data provider is unavailable.
6. **Progress over prediction:** reward consistency and learning, not speculative return claims.
7. **Kenya-ready, not Kenya-assumed:** validate local languages, payment flows, market-data coverage, accessibility, and regulatory expectations with actual users and qualified advisers.

## A differentiated member experience

### The member-invoked guide

The assistant should be a **collapsible chat companion**, not an agent that takes over the screen or starts conversations unprompted. Keep a small, polished launcher available on signed-in dashboard pages; the member chooses when to expand it, taps a suggested prompt, or types a question. Minimize it without losing the conversation while navigating dashboard sections, and clear the in-memory conversation when the signed-in account changes.

The first release is a **visual, interactive prototype**: it may use clearly labeled guided responses for basic interface questions, but must never pretend those responses came from a live AI model or verified financial data. Show the preview status in the chat itself. The control remains useful and collapsible when no AI service is configured, while its design leaves room for future streamed, grounded answers.

Keep the interaction human-scaled: short bubbles, gentle motion, accessible keyboard and screen-reader behavior, user-controlled suggested prompts, and an obvious minimize action. No unsolicited messages, fake typing indicators, pressure tactics, or chat-triggered financial actions.

### The Progress Twin

Create a transparent, member-controlled projection of a savings goal—not a hidden behavioral score. It should show:

- Goal amount, target date, current verified contributions, and remaining amount.
- A mathematically derived contribution schedule at useful cadences.
- A range of achievable scenarios based on member-entered affordability assumptions.
- The assumptions behind each scenario and what changes when the member adjusts one.
- A short explanation of progress since the last check-in, with a clear link to the underlying records.

Members can change or remove their assumptions. Avoid opaque labels such as “financial health score,” inferred creditworthiness, or judgments about personal spending.

### Ask VAULT

When a real AI service is ready, the member-invoked chat can answer practical questions such as “What weekly contribution would keep me on track?” The system first obtains the minimum permitted account context, computes financial facts with tested functions, and only then asks a language model to explain them. Until then, keep the current helper explicitly identified as a guided visual preview.

Responses should distinguish:

- **Your records:** data retrieved from the signed-in member's authorized account.
- **Calculated:** output from a versioned, deterministic calculation.
- **Suggested:** optional, AI-generated ideas based on disclosed assumptions.

Every answer should be concise, dated where freshness matters, and actionable without implying guaranteed outcomes.

### Gold: evidence-first market briefings

Treat Gold market intelligence as a separate research product, not an extension of a savings recommendation engine. Each briefing should make it easy to inspect the original source, publisher, publication time, relevant market, and what remains uncertain. Provide education and sourced summaries—not personalized buy/sell directions or return predictions.

## Current-state fit

The app has Firebase Authentication, but profile and savings data are currently stored in browser `localStorage`. That is suitable only as a prototype. It is not a shared, server-verified financial record, and client-side values must not be represented to AI as verified facts.

The project is currently a small static JavaScript application without an established package manifest or backend service. The strategy is therefore **incremental**:

1. Establish persistent, access-controlled data and tested application boundaries.
2. Ship reliable non-AI savings planning.
3. Add a constrained AI explanation service.
4. Explore licensed market intelligence as a separately gated product.

Do not begin with a model choice or a full rewrite.

## Target architecture

```text
Web / mobile clients
        |
        | Firebase Authentication ID token
        v
Authenticated application API (Cloud Functions or Cloud Run)
   |            |                 |
   |            |                 +--> AI orchestration adapter
   |            |                       model gateway, schemas, safety, evals
   |            +--> Deterministic savings domain
   |                   goal calculator, projections, reminders
   +--> Firestore
          profiles, goals, preferences, append-only financial events

Scheduled ingestion (later, Gold only)
   approved sources --> normalize/deduplicate --> dated evidence store
                                                  |
                                                  +--> cited summaries
                                                       --> notification queue
```

### Client

- Keep Firebase Authentication for identity; send Firebase ID tokens to authenticated backend endpoints.
- Treat the current SPA as a prototype surface. Add a build/dependency workflow before the feature set or SDK complexity grows; use an explicit Firebase SDK dependency and lockfile rather than accumulating production dependencies from CDN imports.
- Keep secrets, model credentials, privileged service credentials, and provider API keys out of browser code.
- Render source metadata and calculation assumptions alongside AI-generated text.
- Preserve access to core savings features if AI calls time out or fail.

### Identity, profiles, and data

- Migrate user-owned profiles and goals to Firestore, scoped by Firebase UID and protected by Security Rules.
- Use backend services with narrowly scoped service identities for privileged operations. Do not rely on Firestore client rules alone for operations needing validation, audit, or atomic business logic.
- Model financial activity as attributable, timestamped events. Derive displayed totals from accepted records; do not let an AI response or a client-supplied total become the source of truth.
- Distinguish **member-entered**, **app-recorded**, and **externally verified** information. Label demo or simulated balances clearly until they are connected to trustworthy sources.
- Partition sensitive data and minimize what is sent to AI. A typical savings prompt needs a goal, current verified total, cadence, and date—not identity documents or unrelated profile details.
- Plan a deliberate migration path for current local profiles. Do not silently promote locally stored balances or transactions to verified records.

### Backend and AI boundary

Expose narrow, authenticated operations such as:

- `calculateGoalPlan` — deterministic contribution amounts and scenarios.
- `getProgressSummary` — authorized, source-linked facts for a member.
- `explainSavingsPlan` — schema-constrained explanation of calculated results.
- `manageReminderPreferences` — explicit opt-in and frequency limits.
- Later: `getMarketBriefing` — dated, source-grounded summaries.

The AI service must not have direct database write access to balances, ledger events, withdrawals, orders, or trading operations. Validate inputs and outputs, enforce rate and cost limits, log operational metadata without unnecessary prompt contents, and return a clear service-unavailable experience on failure.

Use a provider-neutral application interface so models can be evaluated or replaced without coupling client code to a single model vendor. Select the model only after a representative quality, latency, privacy, region, safety, and cost evaluation.

### Savings calculation contract

Keep arithmetic in a typed, deterministic domain module that:

- Defines currency, rounding, contribution timing, goal-date, and calendar assumptions.
- Calculates the remaining amount and contribution targets for supported cadences.
- Handles already-met goals, past dates, zero or negative amounts, irregular periods, and rounding remainders explicitly.
- Returns a versioned result with inputs and assumptions, suitable for unit and property-based tests.
- Does not claim investment growth unless the member explicitly selects a clearly labeled hypothetical scenario with disclosed assumptions.

AI may explain a calculation result; it may not change the result. If it detects missing or contradictory inputs, ask the member or return an explicit limitation.

### Gold evidence pipeline

Before building, validate each data source's exchange coverage, licensing, redistribution rights, freshness, permitted caching, and price. Candidate providers in the original brief are leads to investigate, not approved choices.

If approved, ingest on the server:

1. Fetch from licensed APIs and authorized official sources on a schedule.
2. Normalize publisher, URL, market, instrument identifiers, publication time, and retrieval time.
3. Deduplicate and retain provenance and freshness information.
4. Retrieve relevant evidence for a member's configured watchlist.
5. Generate a structured summary whose claims map back to retrieved sources.
6. Reject unsupported claims and clearly label conflicting, stale, or unavailable evidence.
7. Queue opt-in notifications according to member preferences and quiet hours.

Never imply that sentiment is a forecast. Price-event alerts must be computed from an approved market-data feed, not inferred from article tone.

## Delivery roadmap and decision gates

Work in small releases. Each phase has an explicit “go/no-go” gate; do not advance because an AI demo looks impressive.

### Phase 0 — Product and trust foundation

**Build**

- Confirm goals, member journeys, data definitions, and the difference between demo and verified financial records.
- Map current `localStorage` data and define safe migration, export, and reset behavior.
- Establish environments, application build tooling, automated tests, Firebase emulator use, and error monitoring.
- Draft a data inventory, consent language, retention policy, threat model, and abuse cases.
- Agree on baseline metrics and support ownership.

**Gate:** Account ownership, data provenance, migration behavior, and incident responsibilities are reviewed before personal financial data is sent to any model.

### Phase 1 — Reliable savings core (AI optional)

**Build**

- User-scoped Firestore profiles and goals with tested Security Rules.
- Backend-validated goal creation and deterministic contribution calculations.
- Transparent Progress Twin scenarios and progress summaries derived from authorized records.
- Opt-in reminders with deduplication, quiet hours, frequency caps, and easy opt-out.
- Preserve non-AI workflows and a clearly labeled demo mode where data is still simulated.

**Gate:** Users cannot read or modify another test user's records; calculation edge cases and migration behavior pass automated tests.

### Phase 2 — Constrained savings coach

**Build**

- A backend-only Ask VAULT endpoint with authenticated, minimal context.
- Structured input and output contracts, validated against the calculation service.
- Grounded explanations, clear fact/calculation/suggestion labels, and uncertainty handling.
- Retrieval from a member's own permitted data only; no cross-user memory.
- AI-off fallback to calculation results and ordinary UI.
- A versioned evaluation set covering numeric accuracy, grounding, clarity, unsafe advice, privacy leakage, and refusal behavior.

**Gate:** The coach cannot alter state; it passes agreed evaluation thresholds on a held-out test set; service failure does not block savings functionality.

### Phase 3 — Member-approved proactive intelligence

**Build**

- Optional check-ins based on explicit goal preferences—not covert behavioral inference.
- “Why this reminder?” explanations, snooze controls, quiet hours, frequency caps, and consent withdrawal.
- A review screen where members can adjust an AI-suggested plan before saving it.
- Monitoring for notification fatigue, opt-outs, false personalization, and uneven performance.

**Gate:** Proactive features demonstrate member value without increasing unwanted notifications, pressure, or inequitable outcomes.

### Phase 4 — Gold research pilot

**Build**

- A limited set of exchanges and instruments selected after licensing review.
- Watchlists, a dated daily briefing, source-linked summaries, and explicit data-freshness labels.
- Source retrieval and claim-to-source validation; no automatic trading.
- A private pilot with clear “informational, not investment advice” language and a feedback path.

**Gate:** Data rights are documented; source attribution and stale-data behavior are reliable; compliance and product counsel approve the pilot scope.

### Phase 5 — Expand carefully

Evaluate Swahili support with fluent reviewers, voice accessibility, richer comparisons, and broader coverage only when there is validated demand, quality data, and an operating plan. Treat each as a separately measured release, not a bundled promise.

## Evaluation, observability, and safety

### Product success measures

Measure outcomes, not chat volume:

- Goal setup completion and the percentage of plans members judge understandable and feasible.
- On-time progress toward self-selected goals, with cohort context and no claim of causal impact without suitable analysis.
- Reminder opt-in, snooze, disable, and complaint rates.
- Member-rated usefulness and correction rate for AI explanations.
- Gold briefing source-open rate, freshness compliance, and unsupported-claim rate.
- Availability and latency of core non-AI savings functions.

Set numeric targets after measuring a baseline and a research pilot; avoid inventing success thresholds before observing real usage.

### Quality and release controls

- Version prompts, calculation rules, retrieval settings, and model configuration.
- Evaluate a curated dataset before launch and on every meaningful prompt, model, or retrieval change.
- Include adversarial cases: prompt injection in news, misleading sources, conflicting reports, stale prices, unrealistic savings assumptions, and requests to execute transactions.
- Review samples under controlled access; redact or avoid sensitive data in logs.
- Use feature flags, small pilots, rollback controls, and a kill switch for AI and notifications.
- Track timeouts, cost per successful response, provider errors, grounding failures, and escalation events.

### Privacy, security, and responsible use

- Apply least privilege, server-side authorization, input validation, rate limiting, encryption, and auditable administrative access.
- Obtain informed consent before optional use of personal financial data, spending data, voice, or push notifications.
- Define retention and deletion behavior for account data, prompts, model logs, market content, and generated summaries.
- Do not use member conversations to train or fine-tune models without a separate, explicit, revocable opt-in and legal review.
- Test account isolation, privilege escalation, data export/deletion, and prompt-injection defenses.
- Review applicable Kenyan and other relevant privacy, consumer-protection, financial-services, market-data, and investment-promotion obligations with qualified counsel before launch.

## Product and engineering ownership

- **Product:** scope, user research, trust language, consent, and outcome metrics.
- **Engineering:** domain correctness, identity, authorization, reliability, migrations, and operational readiness.
- **Data/AI:** evaluation, grounding, model quality, latency, cost, and safety monitoring.
- **Security/privacy:** threat model, access controls, retention, incident response, and vendor review.
- **Compliance/legal:** jurisdiction, data licensing, financial product wording, and launch approval.

One accountable owner should approve each phase gate. No phase should rely on “the model seemed right” as its acceptance test.

## First implementation backlog

1. Inventory all current browser-stored profile, balance, goal, and transaction fields; label demo versus trustworthy data.
2. Define Firestore schemas, security rules, user isolation tests, and a reversible migration plan.
3. Extract goal arithmetic from UI code into a pure module with explicit currency/date rules and edge-case tests.
4. Add authenticated backend endpoints for profile, goals, and calculation results.
5. Migrate one read/write workflow end-to-end before migrating all dashboard features.
6. Add service and data provenance labels to the UI.
7. Build the AI evaluation set and baseline before implementing the coach endpoint.
8. Launch a small savings-coach pilot behind a feature flag; measure, review, and iterate.
9. Start Gold provider and licensing discovery in parallel, but do not build ingestion until the rights and target markets are confirmed.

## Explicitly out of scope for the first release

- AI-controlled balances, deposits, withdrawals, payments, or trades.
- Banknote/cash identification.
- Unlicensed scraping, redistribution of market data, or undisclosed source reuse.
- Claims of guaranteed savings outcomes, investment returns, predictive accuracy, or autonomous financial advice.
- Treating client-side browser storage as an authoritative ledger.

## Relationship to the feature brief

This strategy operationalizes the features and acceptance criteria in [VAULT_AI_Integration_Developer_Brief.md](./VAULT_AI_Integration_Developer_Brief.md). The brief describes the product opportunity; this document adds implementation order, architecture boundaries, decision gates, and operational controls.

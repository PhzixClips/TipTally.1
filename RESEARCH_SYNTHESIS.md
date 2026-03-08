# TipTally Market Research Synthesis
## Compiled from 5 profession-specific research reports | March 2026

---

## 1. Universal Feature Rankings

Features requested across 3+ professions, ranked by cross-profession demand.

| Rank | Feature | Professions (5 max) | TipTally Status |
|------|---------|---------------------|-----------------|
| 1 | **Tax compliance & $25K deduction tracker** | Servers, Bartenders, Drivers, Salon, Hotel/Misc | NOT BUILT |
| 2 | **Cash vs credit tip separation** | Servers, Bartenders, Drivers, Salon | NOT BUILT (single "tips" field) |
| 3 | **Expense/deduction tracking** | Drivers, Salon, Hotel/Misc, Bartenders | NOT BUILT |
| 4 | **Configurable tip-out calculator** | Servers, Bartenders, Salon (commission split) | PARTIAL (% tips, % sales, $ modes exist) |
| 5 | **Quick entry UX (<30 seconds)** | Servers, Bartenders, Hotel/Misc | PARTIAL (form exists, no presets) |
| 6 | **Multi-job / multi-venue support** | Servers, Bartenders, Drivers, Salon | NOT BUILT (single wage/profile) |
| 7 | **Seasonal & day-of-week trend analytics** | Servers, Bartenders, Salon, Hotel/Misc | NOT BUILT |
| 8 | **Goal setting** | Bartenders, Salon, Drivers | NOT BUILT |
| 9 | **Shift notes / tagging** | Servers, Bartenders, Hotel/Misc | NOT BUILT |
| 10 | **Data export for tax preparers** | Servers, Bartenders, Salon, Drivers | NOT BUILT |
| 11 | **Custom work-week start day** | Servers, Bartenders | PARTIAL (weeklySummaryDay exists) |
| 12 | **Per-hour / per-unit metrics** | Servers, Bartenders, Drivers | NOT BUILT |
| 13 | **Client/customer tracking** | Salon, Hotel/Misc, Drivers | NOT BUILT |
| 14 | **Photo/note attachments** | Bartenders, Hotel/Misc | NOT BUILT |
| 15 | **Daily reminders to log tips** | Servers, Bartenders | PARTIAL (notifications exist) |

**Key finding**: Of the top 15 universal features, TipTally currently has ZERO fully built and only 3 partially addressed. The biggest universal gap is tax compliance -- every single profession needs it, and the 2026 "No Tax on Tips" law creates urgent demand.

---

## 2. Profession Clusters

### Cluster A: "Restaurant Floor Workers" -- Servers & Bartenders
**Shared needs**: Tip-out formulas, cash/credit/auto-grat separation, CC reconciliation delays, shift-type tagging (AM/PM, bar/floor), sales totals for upselling metrics, section tracking, custom work week, dark mode.

**Key difference**: Bartenders emphasize auto-gratuity as a separate category (does NOT qualify for $25K deduction), photo attachments for cash drawer counts, and event/holiday tagging with YoY comparison.

**User behavior**: Shift-based logging, 1-3 entries per day, want sub-30-second entry. High trust issues with employers (want independent records). Currently using ServerLife or TipSee and actively frustrated.

### Cluster B: "Gig Economy / Delivery & Rideshare" -- DoorDash, Uber, Grubhub drivers
**Unique needs**: Multi-platform earnings consolidation, per-order analytics ($/mile, $/minute), automatic mileage tracking, tip baiting detection (shown vs actual tips), simultaneous multi-app time tracking, accept/decline decision helper, restaurant/customer flagging, P&L statements, completion rate tracking.

**Key difference**: These users are 1099 independent contractors by default. They need expense categorization (gas, phone, tolls), not tip-out calculators. Their "shift" is really a continuous stream of individual orders. They are extremely price-sensitive (thin margins) and privacy-conscious (no SSN collection). Low battery/data usage is critical.

**Competitive landscape**: Gridwise, Everlance, and Stride exist but none combine tip tracking + mileage + multi-platform analytics well.

### Cluster C: "Appointment-Based / Beauty" -- Salon, Spa, Tattoo Artists
**Shared needs**: Per-client tip history, service-type categorization, employment type toggle (W-2 vs 1099 booth renter vs commission), recurring expense tracking (booth rent, insurance), net income dashboard, commission split calculator, retail/product sales alongside tips, calendar view.

**Key difference**: Tattoo artists need multi-session project tracking (e.g., a sleeve across 4 months). Salon workers need client VIP flagging. All need Schedule C export.

**User behavior**: Appointment-based, not shift-based. Fewer entries but higher per-entry complexity. Many are self-employed and need full business accounting lite.

### Cluster D: "High-Volume Cash Tip" -- Hotel staff, Valets, Tour Guides, Movers, Baristas
**Shared needs**: Quick-log presets ($1, $2, $5 buttons), per-interaction tracking (not per-shift), batch entry ("42 cars x $3.50"), group size/volume fields, tip pool verification, weather/condition tagging, job-based (not shift-based) logging for movers.

**Key difference**: These workers receive many small cash tips throughout a shift. Current apps force per-shift totals which loses valuable per-interaction data. They need the fastest possible entry UX.

---

## 3. Competitive Gaps -- What No Existing App Does Well

### Gap 1: 2026 Tax Law Compliance (CRITICAL -- TIME-SENSITIVE)
No tip tracking app has implemented support for the "No Tax on Tips Act" taking effect in 2026. Requirements:
- Cash vs credit tip separation (cash tips qualify differently)
- Auto-gratuity exclusion (does NOT qualify for the $25K deduction)
- Running deduction tracker against the $25K cap
- Quarterly estimated tax payment calculator
- Treasury occupation codes for W-2
- Export format compatible with tax preparers

**Opportunity**: First-mover advantage. Every tipped worker in America needs this. This alone could drive massive adoption.

### Gap 2: Multiple Shifts Per Day (Doubles)
ServerLife and TipSee both struggle with logging AM + PM shifts on the same date. This is the #1 unmet need for restaurant servers. TipTally's current data model uses date as a primary organizer but the `id` field is unique per shift, so multiple shifts per date should be technically feasible already -- the UI just needs to support it explicitly.

### Gap 3: Reliable Data Persistence
TipSee has had catastrophic data loss events. ServerLife locks basic features behind paywalls. Users have deep distrust. An app that guarantees data safety (with cloud backup and local-first storage) and keeps core features free wins significant goodwill. TipTally already has Supabase sync infrastructure -- this is an advantage to lean into.

### Gap 4: Configurable Tip-Out Beyond Simple Percentage
Real-world tip-outs are complex: points-based systems, percentage of sales (not tips), tiered structures, multiple tip-out recipients (busser gets 2%, bar gets 1%, host gets 0.5%). No app handles multi-recipient tip-outs well. TipTally has basic % tips / % sales / $ modes -- extending to multi-recipient and points-based would be a strong differentiator.

### Gap 5: Cross-Profession Flexibility
Every existing app targets ONE profession (ServerLife = servers, Everlance = drivers). No app serves the full tipped-worker market with profession-aware profiles that adapt the UI/fields to the user's job type. A single app with "profession profiles" that show relevant fields would own the entire market.

### Gap 6: Employer-Independent Record Keeping
Workers across all professions expressed distrust of employer-provided records. They want an independent, private record they control. Apps that require employer integration or collect SSNs lose trust. TipTally's local-first, no-SSN approach is already aligned with this need.

---

## 4. Monetization Matrix

### FREE TIER (Drive adoption -- must be generous)
| Feature | Rationale |
|---------|-----------|
| Unlimited shift/tip logging | Core value prop; competitors paywall this and users hate it |
| Cash vs credit separation | Basic data entry; needed for tax features to work |
| Basic analytics (weekly/monthly totals, averages) | Table stakes |
| Tip-out calculator (single recipient) | Already partially built |
| Data export (CSV) | Trust builder; users need to feel data isn't trapped |
| Daily reminders | Low cost to serve, high retention impact |
| Dark mode | Zero cost, high demand from bartenders |
| Quick-log presets | Essential for high-volume cash workers |
| Local data storage + basic backup | Trust and reliability |

### PREMIUM TIER ($4.99/month or $39.99/year)
| Feature | Willingness to Pay Signal |
|---------|--------------------------|
| **Tax Dashboard** (deduction tracker, quarterly estimates, Schedule C export) | High -- saves hundreds in tax prep fees; drivers/salon already pay for tax tools |
| **Advanced Analytics** (day-of-week trends, seasonal patterns, YoY comparison, per-hour/per-cover metrics) | Medium -- power users want this; casual users don't |
| **Multi-job/multi-venue profiles** | Medium -- subset of users but very sticky |
| **Multi-recipient tip-out formulas** (points-based, tiered) | Medium -- complex feature, niche but high value |
| **Cloud sync across devices** | Medium -- already have Supabase infra |
| **Photo attachments** | Low-medium -- storage costs justify premium |
| **Goal setting + progress tracking** | Low-medium -- motivational, not essential |
| **CC tip reconciliation workflow** | Medium -- bartender-specific but high pain point |

### POTENTIAL PRO TIER ($9.99/month) -- Future
| Feature | Rationale |
|---------|-----------|
| Multi-platform earnings consolidation (gig workers) | High development cost (API integrations) |
| Automatic mileage tracking | GPS/battery intensive; high value |
| Accept/decline decision helper with AI | Differentiated; high perceived value |
| Per-client history and CRM features (salon) | Niche but very sticky |

### Revenue Estimate
- Free-to-premium conversion rate for finance apps: 3-7%
- At 100K free users, 5K premium ($4.99/mo) = ~$300K ARR
- At 500K free users, 25K premium = ~$1.5M ARR
- Adding Pro tier could push ARPU higher for gig/salon segments

---

## 5. Market Sizing

| Profession | US Workers (est.) | Smartphone Penetration | Addressable Market | Price Sensitivity | Priority |
|-----------|-------------------|----------------------|-------------------|-------------------|----------|
| **Restaurant servers** | ~2.6M | 95%+ | ~2.5M | Medium | **#1** |
| **Bartenders** | ~680K | 95%+ | ~650K | Medium | **#2** |
| **Delivery/rideshare drivers** | ~2.0M active | 99% | ~2.0M | Very High (want free) | #3 (volume) |
| **Hairdressers/barbers/cosmetologists** | ~850K | 90%+ | ~765K | Medium | #4 |
| **Other salon/spa (nails, massage, estheticians)** | ~500K | 90%+ | ~450K | Medium | #5 |
| **Hotel staff (bellhops, housekeeping, concierge)** | ~350K | 85%+ | ~300K | Medium-High | #6 |
| **Valets** | ~150K | 90%+ | ~135K | Medium | #7 |
| **Tattoo artists** | ~50K | 95%+ | ~47K | Low (higher income) | #8 |
| **Tour guides** | ~60K | 90%+ | ~54K | Medium | #9 |
| **Baristas** | ~400K | 95%+ | ~380K | High | #10 |
| **Movers (tipped)** | ~100K | 85%+ | ~85K | High | #11 |
| | | | **TOTAL: ~7.4M** | | |

**Primary beachhead**: Restaurant servers (2.5M) + bartenders (650K) = 3.15M users. Same cluster, same UX, same data model. Capture this first.

**Secondary expansion**: Salon/spa/beauty (1.2M combined). Requires per-client tracking and employment-type toggle but shares core tip logging.

**Tertiary/opportunistic**: Gig workers (2M) represent huge volume but require fundamentally different architecture (per-order vs per-shift, mileage, multi-platform). High development cost, price-sensitive users. Consider as Phase 2.

---

## 6. Priority Recommendations: The Next 10 Features

Ranked by: (cross-profession demand) x (competitive gap) x (monetization potential) x (feasibility given current codebase).

### Must-Build (Next 4-6 weeks)

**1. Cash vs Credit Tip Separation**
- Impact: Affects ALL professions. Required for tax compliance. Unlocks the #1 gap.
- Scope: Add `cashTips` and `creditTips` fields to `Shift` type. Update ShiftForm with a toggle or two fields. Sum to existing `tips` field for backward compatibility.
- Monetization: FREE (drives adoption; required for premium tax features to work).

**2. Tax Dashboard with $25K Deduction Tracker**
- Impact: Every tipped profession. First-mover advantage on 2026 law. Massive PR/marketing hook.
- Scope: New screen. Track cumulative qualifying tips (credit only, excluding auto-grat), show remaining deduction, quarterly estimate calculator. Requires cash/credit separation (#1) to be built first.
- Monetization: PREMIUM. This is the #1 revenue driver.

**3. Shift Notes & Tags**
- Impact: Servers, bartenders, hotel, valets. Low effort, high UX value.
- Scope: Add optional `notes: string` and `tags: string[]` fields to `Shift`. Add a collapsible notes/tags section to ShiftForm. Predefined tags: shift type (AM/PM/Double), section, weather, event.
- Monetization: FREE (basic tags), PREMIUM (custom tags + tag-based analytics).

**4. Multi-Job / Multi-Venue Profiles**
- Impact: Servers, bartenders, salon, drivers. Users with 2+ jobs currently cannot use TipTally accurately.
- Scope: Add `Job` entity (name, hourlyWage, tipOutDefaults). Each Shift links to a Job. Settings become per-job. Job switcher in header.
- Monetization: PREMIUM (first job free, additional jobs require subscription).

### Should-Build (Next 2-3 months)

**5. Quick-Log Presets & Batch Entry**
- Impact: Hotel, valets, baristas, tour guides. Opens Cluster D.
- Scope: Preset buttons ($1, $2, $5, $10, $20) on a quick-log screen. Batch mode: "X interactions at $Y avg = $Z total." Saves as single shift with metadata.
- Monetization: FREE (essential for Cluster D adoption).

**6. Advanced Analytics: Day-of-Week, Seasonal Trends, Per-Hour Metrics**
- Impact: All professions. Turns TipTally from a logger into an insights tool.
- Scope: New analytics tab. Charts: earnings by day-of-week, monthly trend line, $/hour over time, best/worst days. Use existing shift data -- no new data entry needed.
- Monetization: PREMIUM. High perceived value, low marginal cost.

**7. Data Export (CSV + Tax-Ready PDF)**
- Impact: All professions. Trust builder + practical tax need.
- Scope: CSV export of all shifts (date, hours, cash tips, credit tips, tip-out, total). Tax-ready summary PDF with Schedule C categories.
- Monetization: CSV = FREE, Tax PDF = PREMIUM.

**8. Configurable Tip-Out: Multi-Recipient & Points-Based**
- Impact: Servers, bartenders primarily. Strong differentiator vs competitors.
- Scope: Extend tip-out from single amount to array of recipients (name, method, value). Points-based mode. Save presets per job.
- Monetization: Single recipient = FREE, multi-recipient/points = PREMIUM.

### Nice-to-Have (Next 6 months)

**9. Dark Mode**
- Impact: Bartenders specifically requested it. Generally popular.
- Scope: TipTally already uses dark colors (C.card, C.surface suggest dark theme). Verify full dark mode support, add system theme toggle.
- Monetization: FREE.

**10. Per-Client Tip Tracking**
- Impact: Salon, tattoo, some hotel. Opens Cluster C properly.
- Scope: Optional `clientName` field on Shift. Client list with tip history, averages, VIP flagging. Multi-session project support for tattoo artists.
- Monetization: PREMIUM (CRM-adjacent feature).

---

## Appendix: What NOT to Build (Yet)

| Feature | Reason to Defer |
|---------|-----------------|
| Automatic mileage tracking | Requires GPS, battery drain, different user base. Phase 2+ |
| Multi-platform API integration (DoorDash, Uber) | High development cost, API instability, TOS risk. Phase 2+ |
| Accept/decline decision helper | AI-intensive, niche to gig workers. Phase 3 |
| Commission split calculator | Niche to salon. Can approximate with tip-out calculator |
| Photo attachments | Storage costs, moderate demand. Phase 2 |
| Tip pool verification | Complex math, niche. Phase 2 |
| CC tip reconciliation workflow | Bartender-specific. Phase 2 |

---

## Strategic Summary

**TipTally's winning move is tax compliance.** The 2026 "No Tax on Tips" law creates a once-in-a-decade demand spike. Every tipped worker in America (7.4M) needs to track cash vs credit tips and understand their deduction. No existing app does this. Build cash/credit separation (free) + tax dashboard (premium) in the next 6 weeks and own the narrative.

**Beachhead market**: Restaurant servers + bartenders (3.15M). They are the most vocal, most frustrated with existing tools, and have the most overlap with TipTally's current architecture.

**Monetization**: Generous free tier (unlimited logging, basic analytics, CSV export) to drive adoption. Premium at $4.99/month for tax dashboard, advanced analytics, multi-job, and multi-recipient tip-outs. Target 5% conversion = $1.5M ARR at 500K users.

**Data model changes needed immediately**: Add `cashTips`, `creditTips`, `notes`, `tags`, and `jobId` fields to the `Shift` interface. Add `Job` and `TaxSummary` entities. These changes are backward-compatible with existing data.

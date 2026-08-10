# DRAFT — Terms section: subscription payment, non-payment and forfeiture

**Status: draft for review. Not published, not legal advice.**

Written 2026-08-10 from rules stated by the business owner. It needs review by
someone qualified in Moroccan consumer law (and, if the issuing entity is
elsewhere, that jurisdiction too) before it goes anywhere near the site.

## Why this exists

The published terms in `src/lib/service-policy.ts` have no non-payment clause.
Searching all of them for *suspend*, *unpaid*, *overdue*, *late payment* or
*arrears* returns only:

- §4 — outstanding amounts must be paid before a **cancellation** takes effect
- §4b — an approved **pause** suspends billing
- §4 — a subscription begins only after payment **succeeds**

None of that covers a failed recurring payment, suspension of service, or a
forfeited visit. Meanwhile the customer portal is being built to state that
visits are forfeited when an invoice is unpaid, and to cite these terms as the
authority. **That copy must not ship until a clause like the one below is
published**, or the portal will assert a contractual term that does not exist.

## Rules this is drafted from

Stated by the owner, 2026-08-10:

| Rule | Value |
| --- | --- |
| Recurring charge is attempted | 7 days before the new month begins |
| Service proceeds | once that payment is realized |
| First retry | 2 days after the failed attempt, with a payment-link email |
| Second notice | 1 week after: pay-to-continue **or** terminate, with a link to these terms |
| Termination path | offset against a shorter subscription term, difference calculated, new payment order raised |
| No payment after 2 weeks | subscription continues tacitly |
| Appointment held | if paid **outside** 48h of the appointment, unless routing/personnel efficiency justifies moving it |
| Appointment is a placeholder | **inside** 48h of the appointment |
| Displaced placeholder moves | by at most 3 days |
| Turn forfeited | if payment lands after the appointment moment has passed |

## Draft clause

### 5. Subscription payment, non-payment and service continuity

**5.1 Payment timing.** The recurring subscription charge for each service
month is attempted seven (7) days before that month begins, using the payment
method held on file. Cleaning visits for that month are planned on the basis
that this payment will be realized.

**5.2 Service proceeds on payment.** Once the payment for the service month is
realized, the planned visits for that month are confirmed and proceed in the
normal cycle.

**5.3 Failed payment and reminders.** If the payment is not realized, a further
attempt is made two (2) days later. You will receive an email containing a
secure payment link, and the amount due is also payable through the customer
portal. If the amount remains unpaid one (1) week after the first failed
attempt, a second notice is sent setting out two options: settle the
outstanding amount so that work continues, or terminate the subscription. That
notice links to these Terms and to this section.

**5.4 Termination following non-payment.** Where you choose to terminate under
5.3, the subscription is recalculated against the shorter term actually served.
Any duration discount applied on the basis of the original term is adjusted to
the discount applicable to the term served, the difference is calculated, and a
final payment order is issued for the resulting balance. Amounts already due
remain payable.

**5.5 Tacit continuation.** If no payment and no termination request is
received within two (2) weeks of the first failed attempt, the subscription
continues tacitly on its existing terms, and the outstanding amount remains
due.

**5.6 Planned visits during non-payment.** While a subscription payment is
outstanding, planned visits for the affected period are provisional and do not
reserve capacity:

  (a) Where payment is realized **more than 48 hours before** a planned visit,
      that visit is retained at its planned time, unless it can be materially
      more efficiently served at another time given travel distance and
      personnel scheduling, in which case it may be moved and you will be
      informed of the new time through the customer portal.

  (b) Within **48 hours before** a planned visit, that visit is provisional. It
      may be released so that the capacity can be used for another customer.

  (c) Where a provisional visit is released under (b) and payment is
      subsequently realized, the visit is rescheduled to a new time no more
      than three (3) days after the originally planned date, subject to
      availability.

  (d) Where payment is realized **after** the planned visit time has passed,
      that visit is forfeited. It is not performed later, no replacement visit,
      refund or credit is due for it, and the subscription continues with the
      next visit in the normal cycle.

**5.7 Each visit is assessed on its own.** The 48-hour period in 5.6 runs
separately for every planned visit. Visits are not released in advance as a
block: a visit becomes provisional only when it enters its own 48-hour window.
Settling the outstanding amount at any time restores every visit that has not
yet entered that window.

**5.8 Continued non-payment and recovery.** Where the subscription continues
tacitly under 5.5 and the outstanding amount is still not settled, you will be
notified by email that the matter will be referred to an external party if the
account is not brought up to date. If the account remains unsettled for three
(3) months from that notice, Dar Tahara may refer the debt to a bailiff or
other external recovery agent. At that point Dar Tahara may terminate the
subscription unilaterally, and the amount claimed is calculated over the full
contracted term. Dar Tahara records the customer and the property concerned in
its systems so that the outstanding matter is visible when any future service
is requested.

**5.9 Relationship to other sections.** This section governs changes made by
Dar Tahara because a payment is outstanding. Changes requested by you are
governed by §3 (Scheduling, rescheduling and visit cancellation). The 48-hour
period in this section is separate from, and does not extend, the 48-hour
customer cancellation window in §3.

## Points a reviewer should look at

**The two highest-risk clauses are 5.8's full-term acceleration and the
customer/property flag. Both are new, both are the kind of term a regulator or
court looks at closely, and neither should be published on my drafting alone.**

**A. Accelerating the full contracted term (5.8).** Claiming the whole year on a
monthly subscription after three months of non-payment is an acceleration
clause. In consumer contracts these are frequently reduced or struck out unless
the amount is a genuine pre-estimate of loss rather than a deterrent - and here
the service for the unserved months is never delivered, which makes it look
like a penalty. It also sits awkwardly beside §4a, which already says early
cancellation does not release the customer from the remaining term: a reviewer
should decide whether 5.8 restates that or goes further than it.

**B. Recording the customer and the property (5.8).** This is personal-data
processing with a real compliance surface, and the draft deliberately says
"records… so that the outstanding matter is visible" rather than describing a
blocklist, because the stronger version needs decisions first:

- a stated lawful basis and purpose
- a retention period, and deletion once the debt is settled or time-barred
- a route for the person to see, contest and correct the record
- whether the *property* flag survives a change of occupant. Flagging an address
  can affect a future customer who has no connection to the debt, which is the
  part most likely to cause a real problem.

**C. Three-month runway before referral.** Confirm this runs from the notice in
5.8, not from the original failed charge, or the two are easily conflated in
implementation.

1. **5.6(d) forfeiture** is the clause most likely to be challenged. It removes
   a paid-for service without refund. In several consumer-law regimes a term
   that forfeits prepaid value can be unenforceable, particularly where the
   customer cures the default shortly afterwards. §4 already carries a "subject
   to mandatory law" qualifier for the cancellation fee; this section probably
   needs the same.
2. **5.4 recalculation** must be reconcilable with the existing early
   termination logic (`src/lib/early-termination-calculator.ts`) and the
   duration-discount terms in §4a, which already state that cancelling a
   fixed-term subscription early does not release you from the remaining term.
   5.4 and §4a can be read as conflicting.
3. **5.5 tacit continuation** interacts with consumer rules on automatic
   renewal in some jurisdictions; the notice given in 5.3 may need to say
   explicitly that silence results in continuation.
4. **Numbering.** §5 is currently unused in the published set (§3, §4, §4a, §4b,
   §9 exist). Confirm nothing else is planned for §5 before taking it.
5. **Translation.** Terms are published in seven locales. Once approved in
   English, all seven need the clause, and a mistranslation in a payment clause
   is worse than none.

## What is blocked until this is published

- `portalCopy.invoices.suspensionTermsNote` — states that visits are forfeited
  and cites the terms
- `portalCopy.appointments.forfeitedNote` — the same claim on the appointment
  detail page
- the `forfeited` appointment state shown to customers

All three exist in the working tree and are **not** committed or deployed.

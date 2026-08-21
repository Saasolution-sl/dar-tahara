# Proposed ISMS scope

Status: **PROPOSED — MANAGEMENT DECISION REQUIRED**

## Scope statement

The proposed Dar Tahara ISMS covers the people, processes, information and technology used to design, develop, operate and support Dar Tahara's customer-facing property-services platform and the associated cleaning/property operations. This includes customer and employee portals, public APIs and webhooks, software development and release activities, production VPS and container infrastructure, Supabase/PostgreSQL/Auth/Storage, operational scheduling and service records, support and messaging, billing references and invoices, marketing data, property access instructions and photographs, backups, monitoring, incident response, and the security management of suppliers that process or protect in-scope information.

The organizational boundary should be the Dar Tahara business function and the roles that administer or deliver Dar Tahara services. Shared corporate/group services are included only to the extent they provide identity, development, finance, HR, legal, hosting, support or other security-relevant services to Dar Tahara.

## In-scope locations and activities

- Production and staging hosting used by Dar Tahara.
- Source repositories, build/release processes and developer/admin workstations.
- Remote work and any office used to administer Dar Tahara systems.
- Customer properties while personnel handle access credentials, keys, photographs or service records.
- Supplier services that store, transmit or secure in-scope information.

## Proposed exclusions

| Exclusion | Justification | Decision needed |
| --- | --- | --- |
| Unrelated products and legal entities in a wider corporate group | They need not be certified if they do not administer, host, employ for, or process Dar Tahara information | Confirm legal entity and shared-service dependencies |
| Suppliers' internal control environments | Dar Tahara can govern contracts, due diligence, access and monitoring but cannot operate supplier controls | Confirm supplier responsibility model and obtain assurance |
| Customer-owned home networks and devices | Dar Tahara does not administer them; interface and access risks remain in scope | Confirm smart-lock/customer-device operating model |
| Payment-card primary account data held exclusively by Stripe | Dar Tahara code uses Stripe-hosted payment flows and stores provider references; integration and supplier risk remain in scope | Verify no PAN/CVC is logged or otherwise collected |

No Annex A control is excluded merely because it is difficult or not evidenced. Applicability remains provisional until management approves the scope, risk criteria and SoA.

## Scope approval questions

1. What legal entity will hold the certificate?
2. Which countries, offices, teams and customer-service locations are included?
3. Which group functions and contractors can access Dar Tahara systems or data?
4. Which source repository and production environment are authoritative?
5. Are cleaners employees, contractors or supplier personnel, and who owns screening/training/device controls?
6. Does Dar Tahara issue or manage physical keys, lock codes or smart locks?
7. Which production suppliers and sub-processors are approved?

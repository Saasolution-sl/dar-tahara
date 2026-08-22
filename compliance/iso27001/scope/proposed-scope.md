# Proposed ISMS scope

Status: **MANAGEMENT DIRECTION RECORDED — LEGAL NAME/LOCATIONS TBD**

Canonical organization data is maintained in `organization-profile.md`; exact
sites are maintained in `location-register.csv`.

## Scope statement

The Dar Tahara ISMS covers the people, processes, information and technology used to design, develop, operate and support Dar Tahara's customer-facing property-services platform and the associated cleaning/property operations in Morocco. This includes customer and employee portals, public APIs and webhooks, software development and release activities, Vercel production, managed Supabase/PostgreSQL/Auth/Storage, protected VPS staging/security services, operational scheduling and service records, support and messaging, billing references and invoices, marketing data, property access instructions and photographs, backups, monitoring, incident response, and the security management of suppliers that process or protect in-scope information.

The organizational boundary is the Moroccan Dar Tahara operating business and the roles that administer or deliver Dar Tahara services. The exact registered legal name remains `DAR_TAHARA_LEGAL_ENTITY_TBD`. Other group entities and products are excluded; any service they provide is governed as an external or shared-service dependency.

## In-scope locations and activities

- Production and staging hosting used by Dar Tahara.
- Source repositories, build/release processes and developer/admin workstations.
- Distributed work and any confirmed Moroccan office used to administer Dar Tahara systems.
- Customer properties while personnel handle access credentials, keys, photographs or service records.
- Supplier services that store, transmit or secure in-scope information.
- Cleaners as employees, including onboarding, training, access, devices, discipline, offboarding and asset return.

## Proposed exclusions

| Exclusion | Justification | Decision needed |
| --- | --- | --- |
| Unrelated products and legal entities in a wider corporate group | Management directed that SaaSolution, Paradox and unrelated Hospitality products remain outside unless a documented dependency requires inclusion | Verify and govern each shared-service dependency |
| Suppliers' internal control environments | Dar Tahara can govern contracts, due diligence, access and monitoring but cannot operate supplier controls | Confirm supplier responsibility model and obtain assurance |
| Customer-owned home networks and devices | Dar Tahara does not administer them; interface and access risks remain in scope | Confirm smart-lock/customer-device operating model |
| Payment-card primary account data held exclusively by Stripe | Dar Tahara code uses Stripe-hosted payment flows and stores provider references; integration and supplier risk remain in scope | Verify no PAN/CVC is logged or otherwise collected |

No Annex A control is excluded merely because it is difficult or not evidenced. Applicability remains provisional until management approves the scope, risk criteria and SoA.

## Scope approval questions

1. Confirm the final registered legal entity name and address.
2. Confirm cities, branches and operational locations in Morocco.
3. Verify every group/shared-service dependency and privileged user.
4. Confirm the final approved production supplier/sub-processor list and CNDP transfer position.
5. Appoint Legal/Privacy, Finance, HR and Operations owners.

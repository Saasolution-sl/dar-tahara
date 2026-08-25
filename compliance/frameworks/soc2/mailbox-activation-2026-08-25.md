# Security reporting mailbox activation evidence

Evidence date: **2026-08-25**

Control: `DT-GOV-001`

Address: `security@dartahara.com`

## Verification performed

1. DNS MX resolution confirmed that `dartahara.com` mail is handled by the
   managed `mail.saasolution.es` service.
2. The mail account and alias configuration were checked; the address did not
   exist before the request.
3. A mailbox request with a 5 GB quota was submitted through the mail
   administration service's controlled Telegram-approval workflow.
4. After approval, the docker-mailserver account listing and Dovecot user lookup
   confirmed that the mailbox exists with a 5 GB quota.
5. The account synchronization job was run and the SOGo user directory returned
   exactly one record for `security@dartahara.com`.
6. A controlled activation test message with message ID
   `cc1-1-activation-20260825@saasolution.es` was delivered locally. Dovecot
   reported one message in the new INBOX after delivery.
7. The mail administration workflow sent the generated login details to
   `o.deraz@saasolution.es`. No password was displayed in this record, written
   to the repository or retained by the implementation session.

## Remaining operating evidence

Othman Deraz is the approved temporary mailbox owner. A first authorized login,
monitoring-cadence confirmation, independent alternate/deputy appointment and a
later reporting-route exercise remain required. The activation test contains no
allegation or personal information and is not evidence that reports were made
during a future Type II observation period.

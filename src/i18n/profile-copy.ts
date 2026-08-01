import type { Locale } from "./config";

export type ProfileCopy = {
  contactTitle: string;
  accountTitle: string;
  billingTitle: string;
  securityTitle: string;
  paymentTitle: string;
  accountCompletion: string;
  accountComplete: string;
  accountIncomplete: string;
  paymentRequired: string;
  paymentRequiredBody: string;
  addPaymentDetails: string;
  openingSecurePayment: string;
  paymentSetupError: string;
  paymentSetupNotConfigured: string;
  paymentSetupSuccess: string;
  paymentSetupCancelled: string;
  paymentIntro: string;
  paymentLocked: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  preferredLanguage: string;
  countryOfResidence: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  countryCode: string;
  marketingConsent: string;
  status: string;
  emailVerified: string;
  accountCreated: string;
  lastSignIn: string;
  lastUpdated: string;
  save: string;
  saving: string;
  saved: string;
  saveError: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  changePassword: string;
  changingPassword: string;
  passwordChanged: string;
  passwordMismatch: string;
  passwordTooShort: string;
  passwordError: string;
  resetPassword: string;
  resetPasswordHelp: string;
  credentialsIntro: string;
  revealPaymentDetails: string;
  checkingCredentials: string;
  invalidCredentials: string;
  paymentUnavailable: string;
  noPaymentMethod: string;
  defaultPaymentMethod: string;
  expires: string;
  billingName: string;
  changePaymentMethod: string;
  secureStripeNote: string;
  yes: string;
  no: string;
  notAvailable: string;
};

const en: ProfileCopy = {
  contactTitle: "Contact details",
  accountTitle: "Account information",
  billingTitle: "Billing address",
  securityTitle: "Password and security",
  paymentTitle: "Payment details",
  accountCompletion: "Account completion",
  accountComplete: "Complete",
  accountIncomplete: "Incomplete",
  paymentRequired: "Payment details are required",
  paymentRequiredBody:
    "Your account cannot be completed until a reusable payment method has been securely verified. Adding it does not charge you.",
  addPaymentDetails: "Add payment details",
  openingSecurePayment: "Opening secure payment setup...",
  paymentSetupError:
    "Secure payment setup could not be opened. Please try again.",
  paymentSetupNotConfigured:
    "Stripe test payments are not configured on this localhost yet. Add the Stripe test keys to the server configuration, then restart localhost.",
  paymentSetupSuccess:
    "Payment details were received. Account completion will update after Stripe verifies them.",
  paymentSetupCancelled:
    "Payment setup was cancelled. Your account remains incomplete.",
  paymentIntro:
    "For your security, re-enter your account credentials before viewing your saved payment method.",
  paymentLocked: "Your payment details are hidden.",
  firstName: "First name",
  lastName: "Last name",
  email: "Email address",
  phone: "Phone number",
  whatsapp: "WhatsApp number",
  preferredLanguage: "Preferred communication language",
  countryOfResidence: "Country of residence",
  addressLine1: "Billing address",
  addressLine2: "Address line 2",
  city: "City",
  postalCode: "Postal code",
  countryCode: "Country code",
  marketingConsent: "I agree to receive marketing communications.",
  status: "Account status",
  emailVerified: "Email verified",
  accountCreated: "Account created",
  lastSignIn: "Last sign-in",
  lastUpdated: "Profile last updated",
  save: "Save profile",
  saving: "Saving…",
  saved: "Profile saved.",
  saveError: "The profile could not be saved. Please review the fields and try again.",
  currentPassword: "Current password",
  newPassword: "New password",
  confirmPassword: "Confirm new password",
  changePassword: "Change password",
  changingPassword: "Changing password…",
  passwordChanged: "Your password has been changed.",
  passwordMismatch: "The new passwords do not match.",
  passwordTooShort: "Use at least 12 characters for the new password.",
  passwordError: "The password could not be changed. Check your current password and try again.",
  resetPassword: "Reset password by email",
  resetPasswordHelp:
    "Forgot your current password? Request a secure reset link instead.",
  credentialsIntro: "Enter the email address and password for this account.",
  revealPaymentDetails: "View payment details",
  checkingCredentials: "Checking credentials…",
  invalidCredentials: "The email address or password is incorrect.",
  paymentUnavailable: "Payment details are temporarily unavailable.",
  noPaymentMethod: "No saved payment method is available.",
  defaultPaymentMethod: "Saved payment method",
  expires: "Expires",
  billingName: "Billing name",
  changePaymentMethod: "Change payment details",
  secureStripeNote:
    "Changes open in Stripe’s secure customer portal. Dar Tahara never displays or stores your full card number.",
  yes: "Yes",
  no: "No",
  notAvailable: "Not available",
};

const nl: ProfileCopy = {
  contactTitle: "Contactgegevens",
  accountTitle: "Accountgegevens",
  billingTitle: "Factuuradres",
  securityTitle: "Wachtwoord en beveiliging",
  paymentTitle: "Betaalgegevens",
  accountCompletion: "Accountvoltooiing",
  accountComplete: "Voltooid",
  accountIncomplete: "Onvoltooid",
  paymentRequired: "Betaalgegevens zijn verplicht",
  paymentRequiredBody:
    "Uw account kan pas worden voltooid nadat een herbruikbare betaalmethode veilig is geverifieerd. Bij het toevoegen wordt niets afgeschreven.",
  addPaymentDetails: "Betaalgegevens toevoegen",
  openingSecurePayment: "Beveiligde betaalinstellingen openen...",
  paymentSetupError:
    "De beveiligde betaalinstellingen konden niet worden geopend. Probeer het opnieuw.",
  paymentSetupNotConfigured:
    "Stripe-testbetalingen zijn nog niet ingesteld op deze localhost. Voeg de Stripe-testsleutels toe aan de serverconfiguratie en start localhost opnieuw.",
  paymentSetupSuccess:
    "De betaalgegevens zijn ontvangen. De accountstatus wordt bijgewerkt nadat Stripe ze heeft geverifieerd.",
  paymentSetupCancelled:
    "Het instellen van de betaling is geannuleerd. Uw account blijft onvoltooid.",
  paymentIntro:
    "Voer voor uw veiligheid opnieuw uw accountgegevens in voordat uw opgeslagen betaalmethode zichtbaar wordt.",
  paymentLocked: "Uw betaalgegevens zijn verborgen.",
  firstName: "Voornaam",
  lastName: "Achternaam",
  email: "E-mailadres",
  phone: "Telefoonnummer",
  whatsapp: "WhatsApp-nummer",
  preferredLanguage: "Voorkeurstaal voor communicatie",
  countryOfResidence: "Woonland",
  addressLine1: "Factuuradres",
  addressLine2: "Adresregel 2",
  city: "Plaats",
  postalCode: "Postcode",
  countryCode: "Landcode",
  marketingConsent: "Ik ga akkoord met het ontvangen van marketingberichten.",
  status: "Accountstatus",
  emailVerified: "E-mail geverifieerd",
  accountCreated: "Account aangemaakt",
  lastSignIn: "Laatste aanmelding",
  lastUpdated: "Profiel laatst bijgewerkt",
  save: "Profiel opslaan",
  saving: "Opslaan…",
  saved: "Profiel opgeslagen.",
  saveError: "Het profiel kon niet worden opgeslagen. Controleer de velden en probeer opnieuw.",
  currentPassword: "Huidig wachtwoord",
  newPassword: "Nieuw wachtwoord",
  confirmPassword: "Bevestig nieuw wachtwoord",
  changePassword: "Wachtwoord wijzigen",
  changingPassword: "Wachtwoord wijzigen…",
  passwordChanged: "Uw wachtwoord is gewijzigd.",
  passwordMismatch: "De nieuwe wachtwoorden komen niet overeen.",
  passwordTooShort: "Gebruik minimaal 12 tekens voor het nieuwe wachtwoord.",
  passwordError: "Het wachtwoord kon niet worden gewijzigd. Controleer uw huidige wachtwoord en probeer opnieuw.",
  resetPassword: "Wachtwoord herstellen via e-mail",
  resetPasswordHelp:
    "Uw huidige wachtwoord vergeten? Vraag dan een beveiligde herstellink aan.",
  credentialsIntro: "Voer het e-mailadres en wachtwoord van dit account in.",
  revealPaymentDetails: "Betaalgegevens bekijken",
  checkingCredentials: "Accountgegevens controleren…",
  invalidCredentials: "Het e-mailadres of wachtwoord is onjuist.",
  paymentUnavailable: "De betaalgegevens zijn tijdelijk niet beschikbaar.",
  noPaymentMethod: "Er is geen opgeslagen betaalmethode beschikbaar.",
  defaultPaymentMethod: "Opgeslagen betaalmethode",
  expires: "Geldig tot",
  billingName: "Naam voor facturering",
  changePaymentMethod: "Betaalgegevens wijzigen",
  secureStripeNote:
    "Wijzigingen worden geopend in het beveiligde klantenportaal van Stripe. Dar Tahara toont of bewaart nooit uw volledige kaartnummer.",
  yes: "Ja",
  no: "Nee",
  notAvailable: "Niet beschikbaar",
};

export const profileCopy: Record<Locale, ProfileCopy> = {
  en,
  nl,
  fr: en,
  ar: en,
  es: en,
  de: en,
  pt: en,
};

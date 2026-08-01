import {
  CustomerProfileForm,
  PasswordChangeForm,
  PaymentDetailsGate,
  type EditableCustomerProfile,
} from "@/components/portal/AccountProfileForms";
import {
  PortalCard,
  StatusBadge,
} from "@/components/portal/portal-shell";
import {
  CompanyProfileForm,
  type EditableCompanyProfile,
} from "@/components/portal/CompanyProfileForm";
import { isLocale } from "@/i18n/config";
import { portalCopy } from "@/i18n/portal-copy";
import { profileCopy } from "@/i18n/profile-copy";
import { isAccountComplete } from "@/lib/account-completion";
import { requireCustomerPortal } from "@/lib/feature-flags";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { createClient } from "@/lib/supabase/server";

type BillingAddress = Record<string, unknown>;

function addressValue(address: BillingAddress, ...keys: string[]) {
  for (const key of keys) {
    const value = address[key];
    if (typeof value === "string") return value;
  }
  return "";
}

function profileDate(value: string | null | undefined, locale: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function AccountDetail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  await requireCustomerPortal();
  const context = await requireAuth();
  const locale = await getRequestLocale();
  const portal = portalCopy[locale];
  const copy = profileCopy[locale];
  const db = await createClient();
  const customerId = context.customerId || "00000000-0000-0000-0000-000000000000";
  const isCompany = context.roles.includes("customer_company");
  const [{ data }, { data: companyProfile }] = await Promise.all([
    db
      .from("customers")
      .select(
        "email,full_name,first_name,last_name,phone,whatsapp_number,preferred_language,billing_address,country_of_residence,status,email_verified_at,last_login_at,marketing_consent,created_at,updated_at,stripe_customer_id,payment_method_ready_at,account_completed_at",
      )
      .eq("id", customerId)
      .single(),
    isCompany
      ? db
          .from("company_profiles")
          .select(
            "legal_name,trade_name,chamber_of_commerce_number,tax_identification_number,registration_country,registered_address,billing_email,billing_phone,authorized_representative_name,authorized_representative_title,website,employee_count",
          )
          .eq("customer_id", customerId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!data) {
    return (
      <div>
        <h1 className="font-serif text-4xl">{portal.nav.profile}</h1>
        <div className="mt-7">
          <PortalCard title={portal.nav.profile}>
            <p className="text-sm text-muted-foreground">
              {portal.dashboard.empty}
            </p>
          </PortalCard>
        </div>
      </div>
    );
  }

  const billingAddress =
    data.billing_address &&
    typeof data.billing_address === "object" &&
    !Array.isArray(data.billing_address)
      ? (data.billing_address as BillingAddress)
      : {};
  const preferredLanguage = isLocale(data.preferred_language)
    ? data.preferred_language
    : locale;
  const fullNameParts = data.full_name.trim().split(/\s+/);
  const initial: EditableCustomerProfile = {
    firstName: data.first_name || fullNameParts[0] || "",
    lastName:
      data.last_name ||
      (fullNameParts.length > 1 ? fullNameParts.slice(1).join(" ") : ""),
    phone: data.phone,
    whatsapp: data.whatsapp_number || "",
    preferredLanguage,
    countryOfResidence: data.country_of_residence || "",
    billingAddressLine1: addressValue(
      billingAddress,
      "line1",
      "address_line1",
    ),
    billingAddressLine2: addressValue(
      billingAddress,
      "line2",
      "address_line2",
    ),
    billingCity: addressValue(billingAddress, "city"),
    billingPostalCode: addressValue(
      billingAddress,
      "postal_code",
      "postalCode",
    ),
    billingCountryCode: addressValue(
      billingAddress,
      "country",
      "country_code",
      "countryCode",
    ),
    marketingConsent: data.marketing_consent,
  };
  const accountEmail = context.user.email || data.email;
  const verifiedAt =
    data.email_verified_at || context.user.email_confirmed_at || null;
  const lastSignInAt =
    data.last_login_at || context.user.last_sign_in_at || null;
  const paymentProfileComplete = isAccountComplete({
    stripeCustomerId: data.stripe_customer_id,
    paymentMethodReadyAt: data.payment_method_ready_at,
    accountCompletedAt: data.account_completed_at,
  });
  const accountComplete = paymentProfileComplete && (!isCompany || Boolean(companyProfile));
  const registeredAddress =
    companyProfile?.registered_address &&
    typeof companyProfile.registered_address === "object" &&
    !Array.isArray(companyProfile.registered_address)
      ? (companyProfile.registered_address as BillingAddress)
      : {};
  const companyInitial: EditableCompanyProfile = {
    legalName: companyProfile?.legal_name || "",
    tradeName: companyProfile?.trade_name || "",
    chamberOfCommerceNumber: companyProfile?.chamber_of_commerce_number || "",
    taxIdentificationNumber: companyProfile?.tax_identification_number || "",
    registrationCountry: companyProfile?.registration_country || "MA",
    registeredAddressLine1: addressValue(registeredAddress, "line1"),
    registeredAddressLine2: addressValue(registeredAddress, "line2"),
    registeredCity: addressValue(registeredAddress, "city"),
    registeredPostalCode: addressValue(registeredAddress, "postal_code"),
    billingEmail: companyProfile?.billing_email || accountEmail,
    billingPhone: companyProfile?.billing_phone || data.phone,
    representativeName: companyProfile?.authorized_representative_name || data.full_name,
    representativeTitle: companyProfile?.authorized_representative_title || "",
    website: companyProfile?.website || "",
    employeeCount: companyProfile?.employee_count ? String(companyProfile.employee_count) : "",
  };

  return (
    <div>
      <h1 className="font-serif text-4xl">{portal.nav.profile}</h1>
      <div className="mt-7 grid min-w-0 gap-5">
        <PortalCard title={copy.accountTitle}>
          <dl className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AccountDetail label={copy.email} value={accountEmail} />
            <AccountDetail
              label={copy.status}
              value={<StatusBadge value={data.status} />}
            />
            <AccountDetail
              label={copy.accountCompletion}
              value={
                <span
                  className={
                    accountComplete ? "text-primary" : "text-amber-700"
                  }
                >
                  {accountComplete
                    ? copy.accountComplete
                    : copy.accountIncomplete}
                </span>
              }
            />
            <AccountDetail
              label={copy.emailVerified}
              value={verifiedAt ? copy.yes : copy.no}
            />
            <AccountDetail
              label={copy.accountCreated}
              value={
                profileDate(data.created_at, locale) || copy.notAvailable
              }
            />
            <AccountDetail
              label={copy.lastSignIn}
              value={
                profileDate(lastSignInAt, locale) || copy.notAvailable
              }
            />
            <AccountDetail
              label={copy.lastUpdated}
              value={
                profileDate(data.updated_at, locale) || copy.notAvailable
              }
            />
          </dl>
        </PortalCard>

        {isCompany ? (
          <PortalCard title={locale === "nl" ? "Bedrijfsprofiel" : "Company profile"}>
            <CompanyProfileForm locale={locale} initial={companyInitial} />
          </PortalCard>
        ) : null}

        <PortalCard title={copy.contactTitle}>
          <CustomerProfileForm copy={copy} initial={initial} />
        </PortalCard>

        <PortalCard title={copy.securityTitle}>
          <PasswordChangeForm copy={copy} />
        </PortalCard>

        <PortalCard title={copy.paymentTitle}>
          <PaymentDetailsGate
            copy={copy}
            accountEmail={accountEmail}
            paymentMethodReady={Boolean(data.payment_method_ready_at)}
          />
        </PortalCard>
      </div>
    </div>
  );
}

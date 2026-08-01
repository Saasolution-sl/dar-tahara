import { PortalCard, StatusBadge } from "@/components/portal/portal-shell";
import type { ReactNode } from "react";
import { ProposalAction as ProposalCheckoutAction } from "@/components/portal/portal-forms";
import { PauseRequestButton } from "@/components/portal/PauseRequestModal";
import { DeepCleanRequestButton } from "@/components/portal/DeepCleanRequestModal";
import {
  CancellationButton,
  DisableRenewalButton,
} from "@/components/portal/CancellationModal";
import { InfoTooltip } from "@/components/portal/InfoTooltip";
import {
  SubscriptionPropertyAccordion,
  type SubscriptionPropertySummary,
} from "@/components/portal/SubscriptionPropertyAccordion";
import { AddSubscriptionModal } from "@/components/portal/AddSubscriptionModal";
import { getDictionary } from "@/i18n/dictionaries";
import { portalCopy } from "@/i18n/portal-copy";
import type { Locale } from "@/i18n/config";
import { calculateDeepCleanPriceCents } from "@/lib/deep-clean-pricing";
import {
  featureEnabled,
  requireCustomerPortal,
} from "@/lib/feature-flags";
import { money, shortDate } from "@/lib/portal-format";
import { requireAuth } from "@/lib/portal-auth";
import { getRequestLocale } from "@/lib/request-locale";
import { nextFridayPaymentAt } from "@/lib/subscription-activation";
import { findDurationTier } from "@/lib/subscription-duration";
import { getDurationTiers } from "@/lib/subscription-duration-config";
import { createClient } from "@/lib/supabase/server";

type PropertyRef = {
  id: string;
  address_line1: string;
  city: string;
  property_type: string | null;
  declared_size_m2: number;
};

type SubscriptionRow = {
  id: string;
  property_id: string;
  status: string;
  frequency: string;
  billing_interval: string;
  billed_price_cents: number;
  currency: string;
  activated_at: string | null;
  current_period_end: string | null;
  first_payment_scheduled_for: string | null;
  cancel_at_period_end: boolean;
  auto_renew: boolean;
  renewal_status: string | null;
  pause_eligible: boolean;
  pause_used: boolean;
  contract_duration_months: number | null;
  deep_clean_free_used: boolean;
  deep_clean_free_used_at: string | null;
  cancellation_status: string | null;
  properties: PropertyRef[] | PropertyRef | null;
};

type SubscriptionWithTier = SubscriptionRow & {
  includesFreeDeepClean: boolean;
};

type ProposalRow = {
  id: string;
  property_id: string;
  status: string;
  billing_interval: string;
  frequency: string;
  recurring_amount_cents: number;
  initial_amount_cents: number;
  additional_fees_cents: number;
  currency: string;
  expires_at: string | null;
  terms_summary: string | null;
  properties: PropertyRef[] | PropertyRef | null;
};

type PropertyGroup = {
  id: string;
  property: PropertyRef;
  subscriptions: SubscriptionWithTier[];
  proposals: ProposalRow[];
};

type ProposalActionProps = {
  id: string;
  label: string;
  consentLabel: string;
  scheduleText: string;
  serviceWindowText: string;
  submittingLabel: string;
  successLabel: string;
  errorLabel: string;
};

function firstProperty(properties: PropertyRef[] | PropertyRef | null) {
  return Array.isArray(properties) ? properties[0] : properties;
}

async function ProposalAction(props: ProposalActionProps) {
  return (await featureEnabled("subscription_checkout_enabled")) ? (
    <ProposalCheckoutAction {...props} />
  ) : null;
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">{children}</dd>
    </div>
  );
}

function ActionPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-4">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PauseAction({
  subscription,
  copy,
}: {
  subscription: Pick<
    SubscriptionRow,
    "id" | "status" | "pause_eligible" | "pause_used"
  >;
  copy: (typeof portalCopy)["en"]["pause"];
}) {
  if (subscription.status !== "active") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  if (subscription.pause_used) {
    return (
      <p className="text-xs text-muted-foreground">{copy.usedMessage}</p>
    );
  }
  if (!subscription.pause_eligible) {
    return (
      <p className="text-xs text-muted-foreground">
        {copy.ineligibleMessage}
      </p>
    );
  }
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {copy.eligibleNote}
        <InfoTooltip text={copy.eligibleNoteInfo} />
      </p>
      <div className="mt-3">
        <PauseRequestButton
          copy={copy}
          subscriptionId={subscription.id}
        />
      </div>
    </div>
  );
}

function DeepCleanAction({
  subscription,
  copy,
  locale,
}: {
  subscription: SubscriptionWithTier;
  copy: (typeof portalCopy)["en"]["deepClean"];
  locale: Locale;
}) {
  if (subscription.status !== "active") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  const isFree =
    subscription.includesFreeDeepClean &&
    !subscription.deep_clean_free_used;
  if (isFree) {
    return (
      <div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {copy.freeBadge}
        </span>
        <div className="mt-3">
          <DeepCleanRequestButton
            copy={copy}
            subscriptionId={subscription.id}
            isFree
            priceLabel={copy.freePriceLabel}
          />
        </div>
      </div>
    );
  }

  const usedFreeOne =
    subscription.includesFreeDeepClean &&
    subscription.deep_clean_free_used;
  const property = firstProperty(subscription.properties);
  const priceCents = property?.declared_size_m2
    ? calculateDeepCleanPriceCents(property.declared_size_m2)
    : null;

  if (priceCents === null) {
    return usedFreeOne ? (
      <p className="text-xs text-muted-foreground">
        {subscription.deep_clean_free_used_at
          ? copy.usedOnMessage.replace(
              "{date}",
              shortDate(subscription.deep_clean_free_used_at, locale),
            )
          : copy.usedMessage}
      </p>
    ) : (
      <span className="text-sm text-muted-foreground">—</span>
    );
  }

  return (
    <div>
      {usedFreeOne ? (
        <>
          <p className="text-xs text-muted-foreground">
            {subscription.deep_clean_free_used_at
              ? copy.usedOnMessage.replace(
                  "{date}",
                  shortDate(subscription.deep_clean_free_used_at, locale),
                )
              : copy.usedMessage}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {copy.upsellNote}
          </p>
          <div className="mt-3">
            <DeepCleanRequestButton
              copy={copy}
              subscriptionId={subscription.id}
              isFree={false}
              priceLabel={money(
                priceCents,
                subscription.currency,
                locale,
              )}
            />
          </div>
        </>
      ) : (
        <DeepCleanRequestButton
          copy={copy}
          subscriptionId={subscription.id}
          isFree={false}
          priceLabel={money(
            priceCents,
            subscription.currency,
            locale,
          )}
        />
      )}
    </div>
  );
}

function CancellationAction({
  subscription,
  copy,
  locale,
  autoOpenId,
}: {
  subscription: Pick<
    SubscriptionRow,
    | "id"
    | "status"
    | "billing_interval"
    | "contract_duration_months"
    | "cancellation_status"
    | "current_period_end"
    | "auto_renew"
    | "renewal_status"
  >;
  copy: (typeof portalCopy)["en"]["cancellation"];
  locale: Locale;
  autoOpenId: string;
}) {
  if (
    !subscription.contract_duration_months ||
    subscription.status === "cancelled"
  ) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  if (subscription.billing_interval === "annual") {
    return (
      <DisableRenewalButton
        copy={copy}
        subscriptionId={subscription.id}
        locale={locale}
        currentTermEnd={subscription.current_period_end}
        renewalDisabled={
          !subscription.auto_renew ||
          subscription.renewal_status === "disabled"
        }
      />
    );
  }
  if (subscription.cancellation_status === "confirmed") {
    return (
      <p className="text-xs text-muted-foreground">
        {copy.alreadyPendingMessage}
      </p>
    );
  }
  if (subscription.cancellation_status === "settled") {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <CancellationButton
      copy={copy}
      subscriptionId={subscription.id}
      locale={locale}
      autoOpen={subscription.id === autoOpenId}
    />
  );
}

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ requestCancellation?: string }>;
}) {
  await requireCustomerPortal();
  const context = await requireAuth();
  const locale = await getRequestLocale();
  const { requestCancellation = "" } = await searchParams;
  const copy = portalCopy[locale];
  const dict = await getDictionary(locale);
  const db = await createClient();
  const customerId =
    context.customerId || "00000000-0000-0000-0000-000000000000";
  const nextFriday = nextFridayPaymentAt(new Date());

  const [subscriptions, proposals, tiers] = await Promise.all([
    db
      .from("subscriptions")
      .select(
        "id,property_id,status,frequency,billing_interval,billed_price_cents,currency,activated_at,current_period_end,first_payment_scheduled_for,cancel_at_period_end,auto_renew,renewal_status,pause_eligible,pause_used,contract_duration_months,deep_clean_free_used,deep_clean_free_used_at,cancellation_status,properties(id,address_line1,city,property_type,declared_size_m2)",
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    db
      .from("subscription_proposals")
      .select(
        "id,property_id,status,billing_interval,frequency,recurring_amount_cents,initial_amount_cents,additional_fees_cents,currency,expires_at,terms_summary,properties(id,address_line1,city,property_type,declared_size_m2)",
      )
      .eq("customer_id", customerId)
      .in("status", ["ready", "accepted"])
      .order("created_at", { ascending: false }),
    getDurationTiers(),
  ]);

  const subscriptionRows = ((subscriptions.data || []) as SubscriptionRow[]).map(
    (subscription): SubscriptionWithTier => ({
      ...subscription,
      includesFreeDeepClean: subscription.contract_duration_months
        ? (findDurationTier(
            tiers,
            subscription.contract_duration_months,
          )?.includesFreeDeepClean ?? false)
        : false,
    }),
  );
  const proposalRows = (proposals.data || []) as ProposalRow[];
  const groupsByProperty = new Map<string, PropertyGroup>();

  const ensureGroup = (
    propertyId: string,
    property: PropertyRef | undefined,
  ) => {
    const existing = groupsByProperty.get(propertyId);
    if (existing) return existing;
    const group: PropertyGroup = {
      id: propertyId,
      property: property || {
        id: propertyId,
        address_line1: copy.properties.pendingLabel,
        city: "",
        property_type: null,
        declared_size_m2: 0,
      },
      subscriptions: [],
      proposals: [],
    };
    groupsByProperty.set(propertyId, group);
    return group;
  };

  for (const subscription of subscriptionRows) {
    ensureGroup(
      subscription.property_id,
      firstProperty(subscription.properties) || undefined,
    ).subscriptions.push(subscription);
  }
  for (const proposal of proposalRows) {
    ensureGroup(
      proposal.property_id,
      firstProperty(proposal.properties) || undefined,
    ).proposals.push(proposal);
  }

  const groups = Array.from(groupsByProperty.values());
  const summaries: SubscriptionPropertySummary[] = groups.map((group) => ({
    id: group.id,
    addressLine1: group.property.address_line1,
    city: group.property.city,
    propertyType:
      group.property.property_type || copy.properties.pendingLabel,
    subscriptionCount: group.subscriptions.length,
    proposalCount: group.proposals.length,
    statuses: Array.from(
      new Set([
        ...group.subscriptions.map((subscription) => subscription.status),
        ...group.proposals.map((proposal) => proposal.status),
      ]),
    ),
  }));
  const initiallyExpandedGroup = requestCancellation
    ? groups.find((group) =>
        group.subscriptions.some(
          (subscription) => subscription.id === requestCancellation,
        ),
      )?.id
    : undefined;

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-serif text-4xl">{copy.nav.subscriptions}</h1>
        <AddSubscriptionModal
          locale={locale}
          dict={{ booking: dict.booking, calculator: dict.calculator }}
          durationTiers={tiers}
        />
      </div>

      <div className="mt-7">
        {groups.length ? (
          <SubscriptionPropertyAccordion
            rows={summaries}
            initialExpandedId={initiallyExpandedGroup}
            subscriptionLabel={copy.nav.subscriptions.toLocaleLowerCase(
              locale,
            )}
            proposalLabel={copy.dashboard.pendingProposals.toLocaleLowerCase(
              locale,
            )}
          >
            {groups.map((group) => (
              <div key={group.id} className="space-y-4">
                {group.proposals.map((proposal) => {
                  const firstAmount =
                    proposal.recurring_amount_cents +
                    proposal.initial_amount_cents +
                    proposal.additional_fees_cents;
                  const paymentDate = shortDate(
                    nextFriday.toISOString(),
                    locale,
                  );
                  const consentLabel = copy.dashboard.automaticPaymentConsent
                    .replace(
                      "{firstAmount}",
                      money(firstAmount, proposal.currency, locale),
                    )
                    .replace("{date}", paymentDate)
                    .replace(
                      "{recurringAmount}",
                      money(
                        proposal.recurring_amount_cents,
                        proposal.currency,
                        locale,
                      ),
                    )
                    .replace(
                      "{interval}",
                      proposal.billing_interval === "annual"
                        ? copy.dashboard.annual.toLowerCase()
                        : copy.dashboard.monthly.toLowerCase(),
                    );

                  return (
                    <section
                      key={proposal.id}
                      className="rounded-xl border border-border bg-card p-4 md:p-5"
                    >
                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {copy.dashboard.pendingProposals}
                          </p>
                          <p className="mt-1 capitalize text-sm text-muted-foreground">
                            {proposal.frequency}
                          </p>
                        </div>
                        <StatusBadge value={proposal.status} />
                      </div>

                      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Detail label={copy.dashboard.billing}>
                          {proposal.billing_interval === "annual"
                            ? copy.dashboard.annual
                            : copy.dashboard.monthly}
                        </Detail>
                        <Detail label={copy.dashboard.amount}>
                          {money(
                            proposal.recurring_amount_cents,
                            proposal.currency,
                            locale,
                          )}
                        </Detail>
                        <Detail label={copy.dashboard.nextPayment}>
                          {money(firstAmount, proposal.currency, locale)}
                        </Detail>
                        <Detail label={copy.dashboard.due}>
                          {shortDate(proposal.expires_at, locale)}
                        </Detail>
                      </dl>

                      {proposal.terms_summary ? (
                        <p className="mt-4 text-sm">
                          {proposal.terms_summary}
                        </p>
                      ) : null}

                      {proposal.status === "ready" ? (
                        <div className="mt-5">
                          <ProposalAction
                            id={proposal.id}
                            label={copy.dashboard.acceptProposal}
                            consentLabel={consentLabel}
                            scheduleText={copy.dashboard.automaticPaymentSchedule.replace(
                              "{date}",
                              paymentDate,
                            )}
                            serviceWindowText={
                              copy.dashboard.automaticPaymentServiceWindow
                            }
                            submittingLabel={
                              copy.dashboard.automaticPaymentSubmitting
                            }
                            successLabel={
                              copy.dashboard.automaticPaymentScheduled
                            }
                            errorLabel={
                              copy.dashboard.automaticPaymentError
                            }
                          />
                        </div>
                      ) : null}
                    </section>
                  );
                })}

                {group.subscriptions.map((subscription) => (
                  <section
                    key={subscription.id}
                    className="rounded-xl border border-border bg-card p-4 md:p-5"
                  >
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold capitalize">
                          {subscription.frequency}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {copy.dashboard.subscriptionDetails}
                        </p>
                      </div>
                      <StatusBadge value={subscription.status} />
                    </div>

                    <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Detail label={copy.dashboard.frequency}>
                        <span className="capitalize">
                          {subscription.frequency}
                        </span>
                      </Detail>
                      <Detail label={copy.dashboard.billing}>
                        {subscription.billing_interval === "annual"
                          ? copy.dashboard.annual
                          : copy.dashboard.monthly}
                      </Detail>
                      <Detail label={copy.dashboard.duration}>
                        {subscription.contract_duration_months
                          ? `${subscription.contract_duration_months} ${copy.dashboard.months}`
                          : copy.properties.pendingLabel}
                      </Detail>
                      <Detail label={copy.dashboard.amount}>
                        {money(
                          subscription.billed_price_cents,
                          subscription.currency,
                          locale,
                        )}
                      </Detail>
                      <Detail label={copy.dashboard.activated}>
                        {subscription.activated_at
                          ? shortDate(subscription.activated_at, locale)
                          : copy.properties.pendingLabel}
                      </Detail>
                      <Detail label={copy.dashboard.nextPayment}>
                        {subscription.current_period_end ||
                        subscription.first_payment_scheduled_for
                          ? shortDate(
                              subscription.current_period_end ||
                                subscription.first_payment_scheduled_for,
                              locale,
                            )
                          : copy.properties.pendingLabel}
                      </Detail>
                      <Detail label={copy.dashboard.automaticRenewal}>
                        {subscription.auto_renew &&
                        !subscription.cancel_at_period_end
                          ? copy.properties.yesLabel
                          : copy.properties.noLabel}
                      </Detail>
                      <Detail label={copy.dashboard.renewal}>
                        {subscription.renewal_status?.replaceAll("_", " ") ||
                          (subscription.auto_renew
                            ? copy.properties.yesLabel
                            : copy.properties.noLabel)}
                      </Detail>
                    </dl>

                    <div className="mt-5 grid min-w-0 gap-3 lg:grid-cols-3">
                      <ActionPanel title={copy.pause.requestButton}>
                        <PauseAction
                          subscription={subscription}
                          copy={copy.pause}
                        />
                      </ActionPanel>
                      <ActionPanel title={copy.deepClean.requestButton}>
                        <DeepCleanAction
                          subscription={subscription}
                          copy={copy.deepClean}
                          locale={locale}
                        />
                      </ActionPanel>
                      <ActionPanel title={copy.cancellation.requestButton}>
                        <CancellationAction
                          subscription={subscription}
                          copy={copy.cancellation}
                          locale={locale}
                          autoOpenId={requestCancellation}
                        />
                      </ActionPanel>
                    </div>
                  </section>
                ))}
              </div>
            ))}
          </SubscriptionPropertyAccordion>
        ) : (
          <PortalCard title={copy.nav.subscriptions}>
            <p className="text-sm text-muted-foreground">
              {copy.dashboard.empty}
            </p>
          </PortalCard>
        )}
      </div>
    </div>
  );
}

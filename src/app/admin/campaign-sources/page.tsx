import { CampaignSourcesClient } from "./client";

export const metadata = {
  title: "Campaign links · Dar Tahara",
  robots: { index: false, follow: false },
};

export default function CampaignSourcesPage() {
  return <CampaignSourcesClient />;
}

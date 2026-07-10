import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dar Tahara — House of Purity",
    short_name: "Dar Tahara",
    description:
      "Premium home care & property concierge across Morocco. Always arrive home to comfort.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f3",
    theme_color: "#2f4a29",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
    lang: "en",
    categories: ["lifestyle", "business"],
  };
}

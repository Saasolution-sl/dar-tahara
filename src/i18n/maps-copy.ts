import type { AddressAutocompleteCopy } from "@/components/maps/address-autocomplete";
import type { Locale } from "./config";

export const addressAutocompleteCopy = {
  en: {
    searchPlaceholder: "Start typing an address",
    searching: "Searching addresses…",
    noResults: "No matching address found. You can enter it manually.",
    manualLink: "Enter address manually",
    unavailable: "Enter the address manually",
  },
  nl: {
    searchPlaceholder: "Begin met het typen van een adres",
    searching: "Adressen zoeken…",
    noResults: "Geen passend adres gevonden. U kunt het handmatig invoeren.",
    manualLink: "Adres handmatig invoeren",
    unavailable: "Voer het adres handmatig in",
  },
  fr: {
    searchPlaceholder: "Commencez à saisir une adresse",
    searching: "Recherche d’adresses…",
    noResults: "Aucune adresse correspondante. Vous pouvez la saisir manuellement.",
    manualLink: "Saisir l’adresse manuellement",
    unavailable: "Saisissez l’adresse manuellement",
  },
  ar: {
    searchPlaceholder: "ابدأ بكتابة العنوان",
    searching: "جارٍ البحث عن العناوين…",
    noResults: "لم يتم العثور على عنوان مطابق. يمكنك إدخاله يدويًا.",
    manualLink: "إدخال العنوان يدويًا",
    unavailable: "أدخل العنوان يدويًا",
  },
  es: {
    searchPlaceholder: "Empiece a escribir una dirección",
    searching: "Buscando direcciones…",
    noResults: "No se encontró una dirección. Puede introducirla manualmente.",
    manualLink: "Introducir dirección manualmente",
    unavailable: "Introduzca la dirección manualmente",
  },
  de: {
    searchPlaceholder: "Beginnen Sie mit der Eingabe einer Adresse",
    searching: "Adressen werden gesucht…",
    noResults: "Keine passende Adresse gefunden. Sie können sie manuell eingeben.",
    manualLink: "Adresse manuell eingeben",
    unavailable: "Geben Sie die Adresse manuell ein",
  },
  pt: {
    searchPlaceholder: "Comece a escrever uma morada",
    searching: "A procurar moradas…",
    noResults: "Nenhuma morada correspondente. Pode introduzi-la manualmente.",
    manualLink: "Introduzir morada manualmente",
    unavailable: "Introduza a morada manualmente",
  },
} satisfies Record<Locale, AddressAutocompleteCopy>;

import "../app.css";

import { registerLocale } from "@cospired/i18n-iso-languages";
import en from "@cospired/i18n-iso-languages/langs/en.json";

registerLocale(en);

export const prerender = true;
export const ssr = false;
export const trailingSlash = "always";

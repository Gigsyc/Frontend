/** Rwandan mobile numbers: 9 digits after the country code, starting 72/73/78/79. */
export const RW_MOBILE_RE = /^7[2389]\d{7}$/;

/** Strip spaces, the +250 country code and a leading 0 so "+250 788 123 456" and "0788123456" compare equal. */
export const normaliseRwMobile = (raw: string) => raw.replace(/\D/g, "").replace(/^250/, "").replace(/^0/, "");

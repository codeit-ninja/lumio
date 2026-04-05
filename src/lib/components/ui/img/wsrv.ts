/** All query parameters supported by the wsrv.nl image proxy. */
export type WsrvParams = {
    // --- Size ---
    /** Width in pixels or percentage (e.g. `300` or `"50%"`). */
    w?: number | string;
    /** Height in pixels or percentage (e.g. `300` or `"50%"`). */
    h?: number | string;
    /** Device pixel ratio, 1–8. */
    dpr?: number;

    // --- Fit ---
    /** How the image is fitted to its target dimensions. */
    fit?: "inside" | "outside" | "cover" | "fill" | "contain";
    /** Background color for `fit=contain` letterboxing. */
    cbg?: string;
    /** Do not enlarge if already smaller than target dimensions. */
    we?: boolean;

    // --- Crop / Alignment ---
    /**
     * Alignment / crop strategy when using fit=cover or fit=contain.
     * Can be a position keyword, `"focal"`, `"entropy"`, or `"attention"`,
     * or a manual crop offset like `"crop-22-0"`.
     */
    a?:
        | "center"
        | "top"
        | "right"
        | "bottom"
        | "left"
        | "top-left"
        | "bottom-left"
        | "bottom-right"
        | "top-right"
        | "focal"
        | "entropy"
        | "attention"
        | string;
    /** Horizontal focal-point offset (0.0–1.0). Used with `a=focal`. */
    fpx?: number;
    /** Vertical focal-point offset (0.0–1.0). Used with `a=focal`. */
    fpy?: number;
    /** Rectangle crop: x offset in pixels or percentage. */
    cx?: number | string;
    /** Rectangle crop: y offset in pixels or percentage. */
    cy?: number | string;
    /** Rectangle crop: width in pixels or percentage. */
    cw?: number | string;
    /** Rectangle crop: height in pixels or percentage. */
    ch?: number | string;
    /** Apply rectangle crop before resizing. */
    precrop?: boolean;
    /** Trim similar-color pixels from edges. Value is tolerance 1–254, or `true` for default (10). */
    trim?: number | boolean;
    /** Background color used when trimming. */
    tbg?: string;

    // --- Mask ---
    /** Mask shape. */
    mask?:
        | "circle"
        | "ellipse"
        | "triangle"
        | "triangle-180"
        | "pentagon"
        | "pentagon-180"
        | "hexagon"
        | "square"
        | "star"
        | "heart";
    /** Remove remaining whitespace after masking. */
    mtrim?: boolean;
    /** Background color of the mask. */
    mbg?: string;

    // --- Orientation ---
    /** Mirror the image vertically about the x-axis. */
    flip?: boolean;
    /** Mirror the image horizontally about the y-axis. */
    flop?: boolean;
    /** Rotate the image by the given angle in degrees. */
    ro?: number;
    /** Background color for non-right-angle rotations. */
    rbg?: string;

    // --- Adjustment ---
    /** Background color (supports hex and named colors). */
    bg?: string;
    /** Gaussian blur sigma (0.3–1000), or `true` for fast mild blur. */
    blur?: number | boolean;
    /** Contrast adjustment, -100 to +100. */
    con?: number;
    /** Filter effect. */
    filt?: "greyscale" | "sepia" | "duotone" | "negate";
    /** Duotone start color (used with `filt=duotone`). */
    start?: string;
    /** Duotone stop color (used with `filt=duotone`). */
    stop?: string;
    /** Gamma correction (1.0–3.0), or `true` for default (2.2). */
    gam?: number | boolean;
    /** Brightness/saturation/hue as `"brightness,saturation,hue"`. */
    mod?: string | number;
    /** Saturation multiplier. */
    sat?: number;
    /** Hue rotation in degrees. */
    hue?: number;
    /** Sharpen sigma (0.000001–10), or `true` for fast mild sharpen. */
    sharp?: number | boolean;
    /** Sharpen flat-area level (0–1000000). Used with `sharp`. */
    sharpf?: number;
    /** Sharpen jagged-area level (0–1000000). Used with `sharp`. */
    sharpj?: number;
    /** Tint color. */
    tint?: string;

    // --- Format ---
    /** Use adaptive row filtering (PNG only). */
    af?: boolean;
    /** Encode image as base64 data URL. Pass `"base64"`. */
    encoding?: "base64";
    /** Browser cache max-age, e.g. `"31d"`, `"2w"`, `"1M"`, `"1y"`. */
    maxage?: string;
    /** zlib compression level 0–9 (PNG only). */
    l?: number;
    /** Enable lossless compression (jxl, tiff, webp only). */
    ll?: boolean;
    /** URL of fallback image when the source fails to load. */
    default?: string;
    /** Filename for Content-Disposition header. */
    filename?: string;
    /** Add interlacing to GIF/PNG; make JPEG progressive. */
    il?: boolean;
    /** Number of pages to render; -1 for all. */
    n?: number;
    /** Output format. */
    output?: "jpg" | "jxl" | "png" | "gif" | "tiff" | "webp" | "json";
    /** Page index to load (zero-based; -1 largest, -2 smallest). */
    page?: number;
    /** Output quality 1–100 (jpg, jxl, tiff, webp only). */
    q?: number;
};

/**
 * Build a wsrv.nl URL from a source image URL and optional params.
 *
 * @example
 * wsrv("https://image.tmdb.org/t/p/original/abc.jpg", { w: 300, output: "webp", q: 80 })
 * // => "https://wsrv.nl/?url=image.tmdb.org/t/p/original/abc.jpg&w=300&output=webp&q=80"
 */
export function wsrv(src: string, params?: WsrvParams): string {
    // Strip the protocol so wsrv.nl can proxy it
    const qs = new URLSearchParams({ url: src });

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === null) continue;
            if (value === true) {
                qs.set(key, "");
            } else if (value !== false) {
                qs.set(key, String(value));
            }
        }
    }

    return `https://wsrv.nl/?${qs.toString()}`;
}

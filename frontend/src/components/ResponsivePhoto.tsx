/**
 * A full-bleed photo with a real srcset.
 *
 * `images.unoptimized` is on for this deployment (see next.config.js), so
 * next/image emits a single full-size source and ignores `sizes` — a phone
 * ends up downloading the desktop file. `scripts/optimize-images.js` writes a
 * `-800` variant next to every photo, and this component points the browser at
 * both so it can pick.
 *
 * Set `priority` on the one photo that is the page's LCP element; everything
 * else stays lazy.
 */
type Props = {
  /** Path to the wide variant, e.g. `/images/cappadocia-tours-hero.webp`. */
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  /** Matches Tailwind's object-position utilities, e.g. `object-[60%_center]`. */
  positionClassName?: string;
  /**
   * Overrides the default full-bleed `100vw` hint. Fixed-width contexts
   * (carousel cards, grid tiles) should pass their real CSS width so the
   * browser doesn't assume the image spans the viewport and fetch a
   * bigger source than it needs.
   */
  sizes?: string;
};

export function ResponsivePhoto({ src, alt, priority = false, className = '', positionClassName = '', sizes = '100vw' }: Props) {
  const cloudinary = src.includes('/image/upload/');
  const cloudinaryUrl = (width: number) => src.replace('/image/upload/', `/image/upload/c_limit,w_${width}/f_auto/q_auto/`);
  const xsmall = cloudinary ? cloudinaryUrl(400) : undefined;
  const small = cloudinary ? cloudinaryUrl(800) : src.replace(/\.webp$/, '-800.webp');
  const large = cloudinary ? cloudinaryUrl(1600) : src;
  // Cloudinary transforms are just URL params, so a card-sized tier costs
  // nothing extra to offer; local assets only have the two pre-generated
  // widths from scripts/optimize-images.js.
  const srcSet = xsmall ? `${xsmall} 400w, ${small} 800w, ${large} 1600w` : `${small} 800w, ${large} 1600w`;

  return (
    <img
      src={large}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      /* Fills the nearest positioned ancestor, the same contract next/image's
         `fill` had — every call site already provides one. */
      className={`absolute inset-0 h-full w-full object-cover ${positionClassName} ${className}`}
    />
  );
}

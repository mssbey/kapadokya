import Image from 'next/image';

/**
 * The logo file's real pixel size (2.606:1). next/image wants the intrinsic
 * ratio here, not the display size — five call sites had each invented their
 * own pair (165×48, 180×50, 200×55), and once CSS pins the width and lets
 * `h-auto` derive the height, a wrong ratio means one axis matches the
 * attribute and the other does not, which is exactly what next/image warns
 * about. Declaring the true size and sizing only in CSS keeps that quiet.
 */
const INTRINSIC = { width: 1186, height: 455 };

type Props = {
  /** Must set a width (and `h-auto`); the intrinsic size is far too large to render raw. */
  className: string;
  priority?: boolean;
};

export function SiteLogo({ className, priority = false }: Props) {
  return (
    <Image
      src="/logo.webp"
      alt="Discovery Cappadocia"
      width={INTRINSIC.width}
      height={INTRINSIC.height}
      priority={priority}
      // `priority` alone doesn't reliably add fetchpriority="high" when
      // images.unoptimized is on (confirmed on production: the preload link
      // Next emits for this image had no fetchPriority), so it's set
      // explicitly for the one call site that's the actual LCP element.
      fetchPriority={priority ? 'high' : undefined}
      className={className}
    />
  );
}

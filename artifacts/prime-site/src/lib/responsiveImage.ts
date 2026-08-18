type ResponsiveImageProps = {
  src: string;
  srcSet?: string;
  sizes?: string;
};

/**
 * Add browser-selected image widths for media-library uploads.
 * The API serves ?w=... as a cached WebP variant; imported build assets and
 * external URLs keep their original behavior.
 */
export function responsiveImageProps(url: string): ResponsiveImageProps {
  if (!url || !/^\/(?:api\/)?uploads\//.test(url) || url.includes("?")) {
    return { src: url };
  }

  return {
    src: url,
    srcSet: `${url}?w=320 320w, ${url}?w=500 500w`,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px",
  };
}
export const PHOTO_REF_URL = "https://picsum.photos/seed/{NAME}/800/600";

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_BASE = "https://api.unsplash.com";

const FALLBACK_FALLBACK = "travel";

function normaliseText(rawValue, fallback = FALLBACK_FALLBACK) {
  let text = String(rawValue ?? "").trim();
  if (text.length === 0) {
    text = fallback;
  }

  try {
    text = decodeURIComponent(text);
  } catch {
    // ignore decode issues
  }

  const cleaned = text
    .replace(/[^\w\s,-@.&()'/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const safeText = cleaned || fallback;
  const fallbackSeed = safeText.replace(/\s+/g, "-").toLowerCase();

  return {
    searchQuery: safeText,
    fallbackSeed: fallbackSeed || fallback.replace(/\s+/g, "-").toLowerCase(),
    altText: safeText,
  };
}

function buildFallbackUrl(seed) {
  const safeSeed = encodeURIComponent(seed || FALLBACK_FALLBACK);
  return PHOTO_REF_URL.replace("{NAME}", safeSeed);
}

async function triggerUnsplashDownload(downloadLocation) {
  if (!downloadLocation || !UNSPLASH_ACCESS_KEY) return;

  try {
    const url = new URL(downloadLocation);
    if (!url.searchParams.has("client_id")) {
      url.searchParams.set("client_id", UNSPLASH_ACCESS_KEY);
    }
    await fetch(url.toString(), { method: "GET", mode: "cors" });
  } catch (error) {
    console.warn("[GlobalApi] Unable to trigger Unsplash download", error);
  }
}

export function buildFallbackPhoto(seed, fallback = FALLBACK_FALLBACK) {
  const { fallbackSeed, altText } = normaliseText(seed, fallback);
  const url = buildFallbackUrl(fallbackSeed);
  return {
    id: `fallback-${fallbackSeed}`,
    url,
    fallbackUrl: url,
    alt: altText,
    credit: null,
    fallback: true,
    source: "placeholder",
  };
}

export async function GetPhotoForQuery({
  textQuery,
  fallback = FALLBACK_FALLBACK,
  orientation = "landscape",
} = {}) {
  const { searchQuery, fallbackSeed, altText } = normaliseText(
    textQuery,
    fallback
  );

  const fallbackPhoto = buildFallbackPhoto(fallbackSeed, fallback);

  if (!UNSPLASH_ACCESS_KEY || !searchQuery) {
    return fallbackPhoto;
  }

  try {
    const params = new URLSearchParams({
      query: searchQuery,
      per_page: "1",
      orientation,
      content_filter: "high",
    });

    const resp = await fetch(`${UNSPLASH_API_BASE}/search/photos?${params}`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!resp.ok) {
      throw new Error(
        `Unsplash search failed with status ${resp.status}: ${resp.statusText}`
      );
    }

    const json = await resp.json();
    const photo = json?.results?.[0];

    if (!photo) {
      return fallbackPhoto;
    }

    const photoUrl =
      photo.urls?.regular ||
      photo.urls?.full ||
      photo.urls?.small ||
      photo.urls?.raw;

    if (!photoUrl) {
      return fallbackPhoto;
    }

    await triggerUnsplashDownload(photo.links?.download_location);

    const photographerProfile =
      photo.user?.links?.html ||
      (photo.user?.username
        ? `https://unsplash.com/@${photo.user.username}`
        : undefined);

    return {
      id: photo.id,
      url: photoUrl,
      fallbackUrl: fallbackPhoto.fallbackUrl,
      alt: photo.alt_description || photo.description || altText,
      credit: photo.user
        ? {
            photographerName:
              photo.user.name ||
              photo.user.username ||
              "Unsplash photographer",
            photographerProfileUrl: photographerProfile,
            unsplashLink:
              photo.links?.html || `https://unsplash.com/photos/${photo.id}`,
          }
        : null,
      fallback: false,
      source: "unsplash",
    };
  } catch (error) {
    console.warn("[GlobalApi] Unsplash image lookup failed", error);
    return fallbackPhoto;
  }
}

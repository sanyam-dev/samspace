/*
  Artwork seam.

  This module runs in the browser, so the endpoint has to be a literal — there is
  no process.env here. Both open-access collection APIs below are public and
  unauthenticated, so a visible URL is fine. Anything needing a key would have to
  go through the backend instead.

  Set ARTWORK_ENDPOINT to null to keep the flat swatch placeholders the wireframe
  specifies. Slots also stay untouched if the request fails or returns no image.

  Three response shapes are understood:
    - already normalised: { imageUrl, title, artist, date, objectId }
    - Cleveland Open Access: data[].images.web.url, creators[].description
    - Met Collection: primaryImageSmall / primaryImage, artistDisplayName

  Filters are passed straight through as query parameters.
*/

const ARTWORK_ENDPOINT = "https://openaccess-api.clevelandart.org/api/artworks";

const DEFAULT_FILTERS = {
  type: "Painting",
  has_image: 1,
  limit: 1,
};

// add other filtering config/options here

function normalise(raw) {
  if (!raw) return null;

  const list = Array.isArray(raw) ? raw : raw.data ?? null;
  const source = list ? list[0] : raw.object ?? raw;

  if (!source) return null;

  const imageUrl =
    source.imageUrl ??
    source.images?.web?.url ??
    source.primaryImageSmall ??
    source.primaryImage;

  if (!imageUrl) return null;

  return {
    imageUrl,
    title: source.title ?? "Untitled",
    artist:
      source.artist ??
      source.creators?.[0]?.description ??
      source.artistDisplayName ??
      "Unknown",
    date: source.date ?? source.creation_date ?? source.objectDate ?? "",
    objectId: source.objectId ?? source.id ?? source.objectID ?? null,
  };
}

async function fetchArtwork(filters = DEFAULT_FILTERS) {
  if (!ARTWORK_ENDPOINT) return null;

  const url = new URL(ARTWORK_ENDPOINT, window.location.href);
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`Artwork request failed with ${response.status}`);
  }

  return normalise(await response.json());
}

/*
  Fills every [data-artwork-slot] with a real image and updates any
  [data-artwork-caption] to credit the piece. Leaves the placeholder untouched
  when no endpoint is configured or the request fails.
*/
export async function loadArtwork(filters) {
  const slots = document.querySelectorAll("[data-artwork-slot]");
  if (!slots.length) return;

  let artwork = null;

  try {
    artwork = await fetchArtwork(filters);
  } catch (error) {
    console.warn("Artwork unavailable, keeping placeholder", error);
  }

  if (!artwork) return;

  for (const slot of slots) {
    const image = document.createElement("img");
    image.src = artwork.imageUrl;
    image.alt = `${artwork.title} — ${artwork.artist}`;
    image.loading = "eager";
    slot.replaceChildren(image);
  }

  const credit = [artwork.title, artwork.artist, artwork.date]
    .filter(Boolean)
    .join(" · ");

  for (const caption of document.querySelectorAll("[data-artwork-caption]")) {
    caption.textContent = credit;
  }
}

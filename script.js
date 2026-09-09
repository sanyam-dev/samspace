(() => {
  const year = document.querySelector("[data-year]");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const list = document.querySelector("[data-work-list]");
  const status = document.querySelector("[data-work-status]");

  const createTitle = (project) => {
    const heading = document.createElement("h2");
    heading.className = "work-title";
    const url = project.demoUrl || project.sourceUrl;

    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = project.title;
      heading.append(link);
    } else {
      heading.textContent = project.title;
    }

    return heading;
  };

  // Meta reads like the wireframe: "Rust · Postgres · 2025—  ·  Read →"
  const createMeta = (project) => {
    const meta = document.createElement("p");
    meta.className = "work-meta";

    const parts = [...(project.tags ?? [])];
    if (project.year) parts.push(project.year);

    meta.append(document.createTextNode(parts.join(" · ")));

    const url = project.demoUrl || project.sourceUrl;
    if (url) {
      if (parts.length) meta.append(document.createTextNode("  ·  "));
      const read = document.createElement("a");
      read.className = "read";
      read.href = url;
      read.target = "_blank";
      read.rel = "noopener noreferrer";
      read.textContent = "Read →";
      meta.append(read);
    }

    return meta;
  };

  const createItem = (project) => {
    const item = document.createElement("article");
    item.className = "work-item";

    const description = document.createElement("p");
    description.className = "work-desc";
    description.textContent = project.description;

    item.append(createTitle(project), description, createMeta(project));
    return item;
  };

  const renderWork = async () => {
    if (!list) return;

    try {
      const response = await fetch("./data/projects.json", { cache: "no-cache" });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const projects = await response.json();

      if (!projects.length) {
        if (status) status.textContent = "No work published yet.";
        return;
      }

      const fragment = document.createDocumentFragment();
      for (const project of projects) {
        fragment.append(createItem(project));
      }

      list.append(fragment);
      status?.remove();
    } catch (error) {
      console.error("Could not load work", error);
      if (status) {
        status.textContent = "Work couldn’t be loaded right now.";
      }
    } finally {
      list.setAttribute("aria-busy", "false");
    }
  };

  const ARTWORK_ENDPOINT = "https://openaccess-api.clevelandart.org/api/artworks";

  const ARTWORK_FILTERS = {
    type: "Painting",
    has_image: 1,
    limit: 1,
  };

  const normaliseArtwork = (raw) => {
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
    };
  };

  const loadArtwork = async () => {
    const slot = document.querySelector("[data-artwork-slot]");
    const caption = document.querySelector("[data-artwork-caption]");

    if (!slot) return;

    try {
      const url = new URL(ARTWORK_ENDPOINT);
      for (const [key, value] of Object.entries(ARTWORK_FILTERS)) {
        url.searchParams.set(key, String(value));
      }

      const response = await fetch(url, { cache: "no-cache" });

      if (!response.ok) {
        throw new Error(`Artwork request failed with ${response.status}`);
      }

      const artwork = normaliseArtwork(await response.json());

      if (!artwork) {
        throw new Error("Artwork response had no image");
      }

      const image = document.createElement("img");
      image.src = artwork.imageUrl;
      image.alt = `${artwork.title} — ${artwork.artist}`;
      image.loading = "eager";
      slot.replaceChildren(image);

      if (caption) {
        caption.textContent = [artwork.title, artwork.artist, artwork.date]
          .filter(Boolean)
          .join(" · ");
      }
    } catch (error) {
      console.warn("Artwork unavailable, keeping placeholder", error);
      if (caption) caption.textContent = "artwork unavailable";
    }
  };

  renderWork();
  loadArtwork();
})();

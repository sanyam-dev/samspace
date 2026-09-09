import { loadArtwork } from "./artwork.js";

const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

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
  const list = document.querySelector("[data-work-list]");
  const status = document.querySelector("[data-work-status]");

  if (!list) return;

  try {
    const response = await fetch("../data/projects.json", { cache: "no-cache" });

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
    if (status) status.textContent = "Work couldn’t be loaded right now.";
  } finally {
    list.setAttribute("aria-busy", "false");
  }
};

renderWork();
loadArtwork();

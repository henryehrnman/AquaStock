import { useState, useEffect, useRef } from "react";
import { SPECIES_WIKIPEDIA_SEARCH_TERMS } from "../../../config/speciesWikipediaSearchTerms.js";

/** Cached Wikipedia thumbnail URLs per species name (`NONE` = no image found). */
const wikipediaImageCache = {};

/**
 * Resolve a thumbnail via Wikipedia REST summary, then action=query pageimages,
 * then generator search with "aquarium" (CORS-friendly with origin=* on api.php).
 */
async function fetchWikipediaThumbnail(displayName) {
  const searchTerm = SPECIES_WIKIPEDIA_SEARCH_TERMS[displayName] || displayName;

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.thumbnail?.source) {
        return data.thumbnail.source.replace(/\/\d+px-/, "/300px-");
      }
    }

    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(searchTerm)}&prop=pageimages&format=json&pithumbsize=300&origin=*`
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const pages = searchData.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0];
        if (page?.thumbnail?.source) return page.thumbnail.source;
      }
    }

    const qRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm + " aquarium")}&gsrlimit=3&prop=pageimages&format=json&pithumbsize=300&origin=*`
    );
    if (qRes.ok) {
      const qData = await qRes.json();
      const pages = qData.query?.pages;
      if (pages) {
        for (const page of Object.values(pages)) {
          if (page?.thumbnail?.source) return page.thumbnail.source;
        }
      }
    }
  } catch {
    /* network / parse */
  }
  return null;
}

function SpeciesImage({ name, photo, size = 44, borderRadius = 12, style = {}, onLoad }) {
  const dbUrl = typeof photo === "string" && photo.trim() ? photo.trim() : null;
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);
  const triedWikiAfterDbFail = useRef(false);

  useEffect(() => {
    triedWikiAfterDbFail.current = false;
    setFailed(false);

    if (dbUrl) {
      setSrc(dbUrl);
      return;
    }

    if (wikipediaImageCache[name] === "NONE") {
      setFailed(true);
      setSrc(null);
      return;
    }
    if (wikipediaImageCache[name]) {
      setSrc(wikipediaImageCache[name]);
      return;
    }

    let cancelled = false;
    (async () => {
      const url = await fetchWikipediaThumbnail(name);
      if (cancelled) return;
      if (url) {
        wikipediaImageCache[name] = url;
        setSrc(url);
      } else {
        wikipediaImageCache[name] = "NONE";
        setFailed(true);
        setSrc(null);
      }
    })();
    return () => { cancelled = true; };
  }, [name, dbUrl]);

  const handleError = () => {
    if (dbUrl && src === dbUrl && !triedWikiAfterDbFail.current) {
      triedWikiAfterDbFail.current = true;
      if (wikipediaImageCache[name] && wikipediaImageCache[name] !== "NONE") {
        setSrc(wikipediaImageCache[name]);
        return;
      }
      (async () => {
        const url = await fetchWikipediaThumbnail(name);
        if (url) {
          wikipediaImageCache[name] = url;
          setSrc(url);
        } else {
          wikipediaImageCache[name] = "NONE";
          setSrc(null);
          setFailed(true);
        }
      })();
      return;
    }
    wikipediaImageCache[name] = "NONE";
    setFailed(true);
  };

  if (failed || !src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      style={{
        height: size,
        width: "auto",
        maxWidth: size * 2,
        borderRadius,
        display: "block",
        flexShrink: 0,
        ...style,
      }}
      onLoad={onLoad}
      onError={handleError}
    />
  );
}

export function SpeciesAvatar({ species, size = 44, borderRadius = 12 }) {
  const dbUrl = typeof species.photo === "string" && species.photo.trim() ? species.photo.trim() : "";
  const wikiReady = wikipediaImageCache[species.name] && wikipediaImageCache[species.name] !== "NONE";
  const [hasImage, setHasImage] = useState(!!dbUrl || !!wikiReady);

  return (
    <div style={{
      height: size, width: "auto", minWidth: size, maxWidth: size * 2, borderRadius,
      background: `${species.color || "#00e5ff"}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size > 60 ? 36 : 22, flexShrink: 0,
      border: `1px solid ${species.color || "#00e5ff"}30`,
      overflow: "hidden",
      position: "relative",
    }}>
      <SpeciesImage
        name={species.name}
        photo={species.photo}
        size={size}
        borderRadius={0}
        onLoad={() => setHasImage(true)}
      />
      {!hasImage && <span style={{ position: "absolute" }}>{species.img}</span>}
    </div>
  );
}

import { useState, useEffect } from "react";
import { SPECIES_WIKIPEDIA_SEARCH_TERMS } from "../../../config/speciesWikipediaSearchTerms.js";

const imageCache = {};

function SpeciesImage({ name, photo, size = 44, borderRadius = 12, style = {}, onLoad }) {
  if (photo && !imageCache[name]) imageCache[name] = photo;

  const [imgUrl, setImgUrl] = useState(imageCache[name] || null);
  const [failed, setFailed] = useState(imageCache[name] === "NONE");

  useEffect(() => {
    if (imageCache[name] === "NONE") { setFailed(true); return; }
    if (imageCache[name]) { setImgUrl(imageCache[name]); return; }

    let cancelled = false;
    const searchTerm = SPECIES_WIKIPEDIA_SEARCH_TERMS[name] || name;

    const fetchImage = async () => {
      try {
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`
        );
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.thumbnail?.source) {
            const hiRes = data.thumbnail.source.replace(/\/\d+px-/, "/300px-");
            imageCache[name] = hiRes;
            setImgUrl(hiRes);
            return;
          }
        }

        const searchRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(searchTerm)}&prop=pageimages&format=json&pithumbsize=300&origin=*`
        );
        if (!cancelled && searchRes.ok) {
          const searchData = await searchRes.json();
          const pages = searchData.query?.pages;
          if (pages) {
            const page = Object.values(pages)[0];
            if (page?.thumbnail?.source) {
              imageCache[name] = page.thumbnail.source;
              setImgUrl(page.thumbnail.source);
              return;
            }
          }
        }

        const qRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm + " aquarium")}&gsrlimit=3&prop=pageimages&format=json&pithumbsize=300&origin=*`
        );
        if (!cancelled && qRes.ok) {
          const qData = await qRes.json();
          const pages = qData.query?.pages;
          if (pages) {
            for (const page of Object.values(pages)) {
              if (page?.thumbnail?.source) {
                imageCache[name] = page.thumbnail.source;
                setImgUrl(page.thumbnail.source);
                return;
              }
            }
          }
        }

        if (!cancelled) {
          imageCache[name] = "NONE";
          setFailed(true);
        }
      } catch {
        if (!cancelled) {
          imageCache[name] = "NONE";
          setFailed(true);
        }
      }
    };

    fetchImage();
    return () => { cancelled = true; };
  }, [name]);

  if (failed || !imgUrl) {
    return null;
  }

  return (
    <img
      src={imgUrl}
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
      onError={() => {
        imageCache[name] = "NONE";
        setFailed(true);
      }}
    />
  );
}

export function SpeciesAvatar({ species, size = 44, borderRadius = 12 }) {
  const cached = imageCache[species.name];
  const [hasImage, setHasImage] = useState(!!cached && cached !== "NONE");

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
      <SpeciesImage name={species.name} photo={species.photo} size={size} borderRadius={0} onLoad={() => setHasImage(true)} />
      {!hasImage && <span style={{ position: "absolute" }}>{species.img}</span>}
    </div>
  );
}

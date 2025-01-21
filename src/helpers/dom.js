import { useState, useEffect } from "react";

export function useMediaQuery(query) {

  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => window.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
};

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowDimensions;
};

export function getSubDomain(h) {
  let parts = h.split(".");
  let subdomain = 'none';
  if (parts.length === 1) { // localhost:3000
    subdomain = 'none';
  }
  if (parts.length === 2) { // www.localhost:3000 or hello.localhost:3000 or nikos.ai
    if (parts[1] === 'localhost:3000') {
      if (parts[0] !== 'www') {
        subdomain = parts[0];
      } else {
        subdomain = 'none';
      }
    } else {
      subdomain = 'none';
    }
  }
  if (parts.length === 3) { // www.nikos.ai or hello.nikos.ai
    if (parts[0] === 'www') {
      subdomain = 'none';
    } else {
      subdomain = parts[0];
    }
  }
  return subdomain;
}

export function convertToSlug(t) {
  return t.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

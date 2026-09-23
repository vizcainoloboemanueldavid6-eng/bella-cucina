'use client';

import { useEffect, useState } from 'react';

/**
 * Renders the current year in the footer.
 *
 * The site is statically exported, so a server-side `new Date()` bakes the build year into the
 * HTML and the notice would still read that year long after it stopped being true. The build
 * year is the server-rendered fallback — correct on the day it ships, and correct for anyone
 * without JavaScript — and the real year replaces it on mount. Starting state matches the
 * server render, so hydration stays clean.
 */
export default function CopyrightYear({ buildYear }: { buildYear: number }) {
  const [year, setYear] = useState(buildYear);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <>{year}</>;
}

"use client";

import { useEffect, useRef } from "react";

/**
 * Records one view per page mount. Guarded by a ref because React strict mode
 * mounts twice in development, which would otherwise double every count.
 */
const ViewTracker = ({ slug }: { slug: string }) => {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch(`/api/blog/${slug}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);

  return null;
};

export default ViewTracker;

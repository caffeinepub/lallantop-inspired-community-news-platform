import { useEffect, useRef } from 'react';
import { useActor } from '../hooks/useActor';

/**
 * AppInitializer — Calls actor.initialize() whenever the actor becomes available.
 *
 * The backend's initialize() function:
 * 1. Seeds article data (idempotent — only runs once due to isInitialized guard)
 * 2. Bootstraps the hardcoded admin principal into the user registry
 *
 * Must be called at least once per canister startup. Without it, no articles
 * appear and the admin principal has no role assigned.
 */
export default function AppInitializer() {
  const { actor, isFetching } = useActor();
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!actor || isFetching) return;

    // Use a key that changes when actor changes (actor object reference itself)
    // so we re-initialize if the user logs in/out and gets a new actor
    const actorKey = String(actor);
    if (initializedRef.current === actorKey) return;
    initializedRef.current = actorKey;

    actor.initialize().catch(() => {
      // initialize() is idempotent — failures are non-critical
    });
  }, [actor, isFetching]);

  return null;
}

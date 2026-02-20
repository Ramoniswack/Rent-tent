// Type definitions for Background Sync API
// https://wicg.github.io/background-sync/spec/

interface SyncManager {
  /**
   * Registers a sync event with the given tag.
   * @param tag A unique identifier for this sync event
   */
  register(tag: string): Promise<void>;
  
  /**
   * Gets a list of registered sync tags.
   */
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistration {
  /**
   * The sync manager for this service worker registration.
   * Only available in browsers that support Background Sync API.
   */
  readonly sync?: SyncManager;
}

interface SyncEvent extends ExtendableEvent {
  /**
   * The tag of the sync event.
   */
  readonly tag: string;
  
  /**
   * Returns the last chance boolean, which is true if the user agent will not make further synchronization attempts after the current attempt.
   */
  readonly lastChance: boolean;
}

interface ServiceWorkerGlobalScopeEventMap {
  'sync': SyncEvent;
}

declare global {
  interface WindowEventMap {
    'sync': SyncEvent;
  }
}

export {};

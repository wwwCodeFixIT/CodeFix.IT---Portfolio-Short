import type { ServiceLandingCatalog } from '../data/service-landings';

let serviceLandingCatalogPromise: Promise<ServiceLandingCatalog> | null = null;

export function loadServiceLandingCatalog(): Promise<ServiceLandingCatalog> {
  if (!serviceLandingCatalogPromise) {
    serviceLandingCatalogPromise = fetch('/data/service-landings.json', {
      cache: 'force-cache',
      headers: { Accept: 'application/json' },
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Nie udało się załadować katalogu usług (HTTP ${response.status}).`);
      }
      return (await response.json()) as ServiceLandingCatalog;
    });
  }

  return serviceLandingCatalogPromise;
}

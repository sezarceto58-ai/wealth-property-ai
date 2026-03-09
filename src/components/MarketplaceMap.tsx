import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { DbProperty } from "@/types/database";

interface MarketplaceMapProps {
  properties: DbProperty[];
}

const iraqCityCoords: Record<string, [number, number]> = {
  Baghdad: [33.3152, 44.3661],
  Erbil: [36.1911, 44.0092],
  Basra: [30.5085, 47.7804],
  Sulaymaniyah: [35.5613, 45.4302],
  Mosul: [36.3407, 43.1186],
  Kirkuk: [35.4681, 44.3922],
  Najaf: [32.0003, 44.3333],
  Karbala: [32.616, 44.0249],
};

function getPropertyCoords(property: DbProperty): [number, number] | null {
  const hasCoords = Number.isFinite(property.latitude) && Number.isFinite(property.longitude);
  if (hasCoords && property.latitude !== null && property.longitude !== null) {
    return [Number(property.latitude), Number(property.longitude)];
  }

  if (property.city && iraqCityCoords[property.city]) {
    return iraqCityCoords[property.city];
  }

  return null;
}

function formatPrice(price: number) {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${Math.round(price / 1_000)}K`;
  return `$${price}`;
}

function createPriceIcon(price: number) {
  return L.divIcon({
    className: "tv-price-pin-wrapper",
    html: `<div class="tv-price-pin">${formatPrice(price)}</div>`,
    iconSize: [74, 30],
    iconAnchor: [37, 30],
  });
}

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();

  return L.divIcon({
    className: "tv-cluster-wrapper",
    html: `<div class="tv-cluster">${count}</div>`,
    iconSize: [42, 42],
  });
}

export default function MarketplaceMap({ properties }: MarketplaceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(iraqCityCoords.Baghdad, 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      iconCreateFunction: createClusterIcon,
    });

    map.addLayer(clusterGroup);

    mapRef.current = map;
    clusterRef.current = clusterGroup;

    return () => {
      clusterGroup.clearLayers();
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !clusterRef.current) return;

    clusterRef.current.clearLayers();

    const bounds: L.LatLngTuple[] = [];

    properties.forEach((property) => {
      const coords = getPropertyCoords(property);
      if (!coords) return;

      const marker = L.marker(coords, { icon: createPriceIcon(property.price) });
      marker.bindPopup(
        `
          <div class="space-y-1">
            <p><strong>${property.title}</strong></p>
            <p>${property.district ? `${property.district}, ` : ""}${property.city}</p>
            <p><strong>${property.price.toLocaleString()} USD</strong></p>
            <a href="/property/${property.id}" style="text-decoration:underline;">View property</a>
          </div>
        `,
      );

      clusterRef.current?.addLayer(marker);
      bounds.push(coords);
    });

    if (bounds.length === 1) {
      mapRef.current.setView(bounds[0], 12);
    } else if (bounds.length > 1) {
      mapRef.current.fitBounds(bounds, { padding: [36, 36] });
    } else {
      mapRef.current.setView(iraqCityCoords.Baghdad, 6);
    }
  }, [properties]);

  return (
    <>
      <style>{`
        .tv-price-pin {
          background: hsl(var(--card));
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          border-radius: 999px;
          height: 30px;
          min-width: 56px;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          box-shadow: var(--shadow-md);
          white-space: nowrap;
        }

        .tv-cluster {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: 3px solid hsl(var(--background));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          box-shadow: var(--shadow-lg);
        }
      `}</style>
      <div ref={mapContainerRef} className="h-[62vh] min-h-[420px] w-full rounded-xl border border-border overflow-hidden" />
      <p className="mt-3 text-xs text-muted-foreground">Pins use exact coordinates when available, otherwise city-level Iraqi location fallbacks.</p>
    </>
  );
}

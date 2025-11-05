import { useMemo } from "react";
import AsyncSelect from "react-select/async";

/* -------------------------------------------------
   LocationSelect
   -------------------------------------------------
   - Frontend hanya call endpoint lokal /api/osm-search?q=...
   - Jadi browser TIDAK langsung call nominatim.org (hindari CORS).
   - Kalau /api/osm-search belum proper (misal balikin HTML, bukan JSON),
     kita catch & return [] biar gak meledak.
*/
const mapToOptions = (data = []) =>
  data.map((item) => ({
    label: item.display_name,
    value: {
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      osm_id: item.osm_id,
      osm_type: item.osm_type,
      boundingbox: item.boundingbox,
      raw: item,
    },
  }));

const fetchDirectFromNominatim = async (query) => {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    limit: "8",
    extratags: "0",
  });

  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    if (!resp.ok) {
      console.warn("[OSM fallback] upstream status", resp.status);
      return [];
    }
    const data = await resp.json();
    return mapToOptions(data);
  } catch (error) {
    console.warn("[OSM fallback] error", error);
    return [];
  }
};

function LocationSelect({ value, onChange }) {
  const search = async (query) => {
    if (!query || query.trim().length < 2) return [];

    try {
      const resp = await fetch(
        "/api/osm-search?" +
          new URLSearchParams({
            q: query,
          }).toString(),
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      // Ambil raw text dulu, karena kadang proxy kamu masih balikin HTML
      const text = await resp.text();

      let data = [];
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("[OSM proxy] Not JSON yet (probably not wired).");
        if (import.meta.env.DEV) {
          return fetchDirectFromNominatim(query);
        }
        return [];
      }

      // Map ke format react-select
      return mapToOptions(data || []);
    } catch (err) {
      console.warn("[osm-search FE error]", err);
      if (import.meta.env.DEV) {
        return fetchDirectFromNominatim(query);
      }
      return [];
    }
  };

  // Debounce loader untuk AsyncSelect
  const loadOptions = useMemo(() => {
    let timeout;
    return (inputValue, callback) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const results = await search(inputValue);
        callback(results);
      }, 350);
    };
  }, []);

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={false}
      loadOptions={loadOptions}
      placeholder="Search destination"
      value={value}
      onChange={onChange}
      classNamePrefix="osm-select"
    />
  );
}

export default LocationSelect;

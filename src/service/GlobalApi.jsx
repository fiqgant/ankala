// Tanpa API key. Balikin foto dari Unsplash Source (selalu ada).
// Tips: gunakan kata kunci yang "manusiawi" (bukan %20).
export const PHOTO_REF_URL = "https://picsum.photos/seed/{NAME}/800/600";

// Stub aman agar komponen lama tetap jalan.
// Ambil textQuery → kembalikan struktur mirip Google Places.
export async function GetPlaceDetails(payload = {}) {
  const textQuery =
    payload?.textQuery || payload?.query || payload?.name || "travel";

  // Simpan versi encoded untuk “name”; tapi nanti kita decode waktu pakai.
  const encoded = encodeURIComponent(String(textQuery).trim() || "travel");

  const photos = [
    { name: `${encoded}` },
    { name: `${encoded}-a` },
    { name: `${encoded}-b` },
    { name: `${encoded}-c` }, // index [3]
    { name: `${encoded}-d` },
    { name: `${encoded}-e` },
  ];

  return Promise.resolve({
    data: {
      places: [
        {
          id: `stub-${encoded}`,
          displayName: { text: decodeURIComponent(encoded) },
          photos,
        },
      ],
    },
  });
}

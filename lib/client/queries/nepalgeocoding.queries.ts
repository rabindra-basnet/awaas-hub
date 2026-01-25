import { useQuery } from "@tanstack/react-query";

const USER_AGENT = "AawasHub/1.0 (rabindraabasnet@gmail.com)";

async function fetchNepalCoords(city: string): Promise<[number, number] | null> {
    if (!city?.trim()) return null;

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                city + ", Nepal"
            )}&format=json&limit=1`,
            { headers: { "User-Agent": USER_AGENT } }
        );

        if (!res.ok) return null;
        const data = await res.json();
        return data[0] ? [Number(data[0].lat), Number(data[0].lon)] : null;
    } catch {
        return null;
    }
}

export function useNepalGeocoding(city: string) {
    return useQuery({
        queryKey: ["nepal-coords", city.toLowerCase().trim()],
        queryFn: () => fetchNepalCoords(city),
        enabled: !!city.trim(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}

async function reverseGeocode({ lat, lon }: { lat: number; lon: number }) {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14&addressdetails=1`,
        { headers: { "User-Agent": USER_AGENT } }
    );

    if (!res.ok) throw new Error("Reverse geocoding failed");

    const data = await res.json();

    const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.suburb ||
        data.address?.county ||
        "Near me";

    return city;
}

export function useReverseGeocode(lat: number | null, lon: number | null) {
    return useQuery({
        queryKey: ["reverse-geocode", lat, lon],
        queryFn: () => reverseGeocode({ lat: lat!, lon: lon! }),
        enabled: lat !== null && lon !== null,
        staleTime: 10 * 60 * 1000,
        retry: 1,
    });
}
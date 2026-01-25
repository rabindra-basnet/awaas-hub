import MapClient from "../../_components/map-client";

type PageProps = {
  params: Promise<{
    lat: string;
    lng: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { lat: latitude, lng: longitude } = await params;

  const lat = Number(latitude);
  const lng = Number(longitude);

  return <MapClient lat={lat} lng={lng} />;
}

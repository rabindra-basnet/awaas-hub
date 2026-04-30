import { notFound } from "next/navigation";
import { getServerSession } from "@/lib/server/getSession";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getDb } from "@/lib/server/db";
import { Property } from "@/lib/models/Property";
import Files from "@/lib/models/Files";
import { getSignedUrlForDownload } from "@/lib/server/r2-client";
import PropertyPageClient from "./property-page-client";
// import PropertyPageClient from "./_components/property-page-client";
// import PropertyPageSkeleton from "./_components/property-page-skeleton";

async function getPropertyWithImages(id: string) {
  await getDb();

  const [property, files] = await Promise.all([
    Property.findById(id).lean(),
    Files.find({
      propertyId: id,
      isDeleted: false,
      mimetype: { $regex: /^image\// },
    })
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  if (!property) return null;

  const images = await Promise.all(
    files.map(async (file: any) => {
      let url: string | null = null;
      try {
        url = await getSignedUrlForDownload(file.storedName);
      } catch {
        url = null;
      }
      return {
        url,
      };
    }),
  );

  return {
    property: JSON.parse(JSON.stringify(property)),
    images: images.filter((img) => img.url !== null),
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [session, result] = await Promise.all([
    getServerSession(),
    getPropertyWithImages(id),
  ]);

  if (!result) notFound();

  const { property, images } = result;

  const role = session?.user?.role as Role;
  const isOwner = property.sellerId === session?.user?.id;
  const isAdmin = role === Role.ADMIN;
  const canManage =
    hasPermission(role, Permission.MANAGE_PROPERTIES) && (isAdmin || isOwner);
  const isAnonymous = session?.user?.isAnonymous === true;

  return (
    // <Suspense fallback={<PropertyPageSkeleton />}>
    <PropertyPageClient
      id={id}
      property={property}
      initialImages={images}
      session={session}
      isAdmin={isAdmin}
      canManage={canManage}
      isAnonymous={isAnonymous}
    />
    // </Suspense>
  );
}

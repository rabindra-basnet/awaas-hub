// "use client";

// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { hasPermission, Permission, Role } from "@/lib/rbac";
// import { getSession } from "@/lib/client/auth-client";
// import { useEffect, useState } from "react";
// import AccessDeniedPage from "@/components/access-denied";
// import { use } from "react";
// import PropertyForm from "../../_components/property-form";
// import {
//   useProperty,
//   useUpdateProperty,
// } from "@/lib/client/queries/properties.queries";

// export default function EditPropertyPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = use(params);
//   const router = useRouter();
//   const { data: property, isLoading } = useProperty(id);
//   const update = useUpdateProperty();
//   const [authorized, setAuthorized] = useState<boolean | null>(null);

//   useEffect(() => {
//     getSession().then(({ data: session }) => {
//       if (
//         !session?.user ||
//         !hasPermission(session.user.role as Role, Permission.MANAGE_PROPERTIES)
//       ) {
//         setAuthorized(false);
//         router.replace(!session?.user ? "/login" : "/access-denied");
//       } else {
//         setAuthorized(true);
//       }
//     });
//   }, [router]);

//   if (authorized === null || isLoading)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading...
//       </div>
//     );
//   if (authorized === false || !property) return <AccessDeniedPage />;

//   return (
//     <div className="max-w-2xl mx-auto py-12 px-4">
//       <h1 className="text-3xl font-bold mb-8">Edit Property</h1>
//       <PropertyForm
//         initialData={property}
//         onSubmit={(values: any) =>
//           update.mutate(
//             { id, ...values },
//             {
//               onSuccess: () => {
//                 toast.success("Property updated successfully");
//                 router.push(`/properties/${id}`);
//               },
//               onError: () => toast.error("Failed to update property"),
//             },
//           )
//         }
//         isSubmitting={update.isPending}
//         buttonText="Update Property"
//       />
//     </div>
//   );
// }

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { hasPermission, Permission, Role } from "@/lib/rbac";
import { getSession } from "@/lib/client/auth-client";
import { useEffect, useState } from "react";
import AccessDeniedPage from "@/components/access-denied";
import { use } from "react";
import PropertyForm from "../../_components/property-form";
import {
  useProperty,
  useUpdateProperty,
} from "@/lib/client/queries/properties.queries";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: property, isLoading } = useProperty(id);
  const update = useUpdateProperty();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    getSession().then(({ data: session }) => {
      if (
        !session?.user ||
        !hasPermission(session.user.role as Role, Permission.MANAGE_PROPERTIES)
      ) {
        setAuthorized(false);
        router.replace(!session?.user ? "/login" : "/access-denied");
      } else {
        setAuthorized(true);
      }
    });
  }, [router]);

  if (authorized === null || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (authorized === false || !property) return <AccessDeniedPage />;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Property</h1>
      <PropertyForm
        initialData={property}
        propertyId={id}
        onSubmit={(values) =>
          update.mutate(
            { id, ...values },
            {
              onSuccess: () => {
                toast.success("Property updated successfully");
                router.push(`/properties/${id}`);
              },
              onError: () => toast.error("Failed to update property"),
            },
          )
        }
        isSubmitting={update.isPending}
        buttonText="Update Property"
      />
    </div>
  );
}

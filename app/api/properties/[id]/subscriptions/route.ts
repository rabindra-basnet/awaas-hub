// // // import { NextRequest, NextResponse } from "next/server";

// // // import { Subscription } from "@/lib/models/Subscription";
// // // import { getServerSession } from "@/lib/server/getSession";
// // // import { getDb } from "@/lib/server/db";
// // // import { internalServerError } from "@/lib/error";

// // // export async function GET(
// // //   req: NextRequest,
// // //   { params }: { params: Promise<{ propertyId: string }> },
// // // ) {
// // //   try {
// // //     const session = await getServerSession();

// // //     if (!session?.user?.id) {
// // //       return NextResponse.json(
// // //         {
// // //           hasAccess: false,
// // //           totalCredits: 0,
// // //           totalPaidSubscriptions: 0,
// // //           subscriptions: [],
// // //         },
// // //         { status: 200 },
// // //       );
// // //     }

// // //     const { propertyId } = await params;

// // //     await getDb();

// // //     const subscriptions = await Subscription.find({
// // //       userId: session.user.id,
// // //       status: "paid",
// // //       paymentMethod: "esewa",
// // //     })
// // //       .sort({ createdAt: -1 })
// // //       .lean();

// // //     const totalCredits = subscriptions.reduce((sum, sub) => {
// // //       return sum + (Number(sub.credits) || 0);
// // //     }, 0);

// // //     const propertySubscriptions = subscriptions.filter(
// // //       (sub) => String(sub.propertyId) === String(propertyId),
// // //     );

// // //     return NextResponse.json(
// // //       {
// // //         hasAccess: totalCredits > 0,
// // //         propertyId,
// // //         totalCredits,
// // //         totalPaidSubscriptions: subscriptions.length,
// // //         propertySubscriptionsCount: propertySubscriptions.length,
// // //         latestPropertySubscription: propertySubscriptions[0]
// // //           ? {
// // //               id: String(propertySubscriptions[0]._id),
// // //               propertyId: String(propertySubscriptions[0].propertyId),
// // //               userId: String(propertySubscriptions[0].userId),
// // //               status: propertySubscriptions[0].status,
// // //               credits: propertySubscriptions[0].credits,
// // //               amount: propertySubscriptions[0].amount,
// // //               paymentMethod: propertySubscriptions[0].paymentMethod,
// // //               transactionId: propertySubscriptions[0].transactionId,
// // //               transactionUuid: propertySubscriptions[0].transactionUuid,
// // //               paymentDate: propertySubscriptions[0].paymentDate,
// // //               createdAt: propertySubscriptions[0].createdAt,
// // //             }
// // //           : null,
// // //         subscriptions: subscriptions.map((sub) => ({
// // //           id: String(sub._id),
// // //           propertyId: String(sub.propertyId),
// // //           userId: String(sub.userId),
// // //           status: sub.status,
// // //           credits: sub.credits,
// // //           amount: sub.amount,
// // //           paymentMethod: sub.paymentMethod,
// // //           transactionId: sub.transactionId,
// // //           transactionUuid: sub.transactionUuid,
// // //           paymentDate: sub.paymentDate,
// // //           createdAt: sub.createdAt,
// // //         })),
// // //       },
// // //       { status: 200 },
// // //     );
// // //   } catch (error) {
// // //     console.error("Get property subscription error:", error);
// // //     return internalServerError("Failed to fetch subscription");
// // //   }
// // // }

// // import { NextRequest, NextResponse } from "next/server";
// // import mongoose from "mongoose";

// // import { Subscription } from "@/lib/models/Subscription";
// // import { PropertyContactAccess } from "@/lib/models/PropertyContactAccess";
// // import { getServerSession } from "@/lib/server/getSession";
// // import { getDb } from "@/lib/server/db";
// // import { internalServerError } from "@/lib/error";

// // export async function GET(
// //   req: NextRequest,
// //   { params }: { params: Promise<{ id: string }> },
// // ) {
// //   try {
// //     const session = await getServerSession();

// //     if (!session?.user?.id) {
// //       return NextResponse.json(
// //         {
// //           hasAccess: false,
// //           alreadyUnlocked: false,
// //           totalCredits: 0,
// //         },
// //         { status: 200 },
// //       );
// //     }

// //     const { id: propertyId } = await params;

// //     await getDb();

// //     const existingAccess = await PropertyContactAccess.findOne({
// //       userId: session.user.id,
// //       propertyId,
// //     }).lean();

// //     const creditsResult = await Subscription.aggregate([
// //       {
// //         $match: {
// //           userId: new mongoose.Types.ObjectId(session.user.id),
// //           status: "paid",
// //           paymentMethod: "esewa",
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           totalCredits: { $sum: "$credits" },
// //         },
// //       },
// //     ]);

// //     const totalCredits = creditsResult[0]?.totalCredits ?? 0;
// //     const hasAccess = !!existingAccess || totalCredits > 0;

// //     return NextResponse.json(
// //       {
// //         hasAccess,
// //         alreadyUnlocked: !!existingAccess,
// //         totalCredits,
// //       },
// //       { status: 200 },
// //     );
// //   } catch (error) {
// //     console.error("Get property subscription error:", error);
// //     return internalServerError("Failed to fetch subscription");
// //   }
// // }

// import { NextRequest, NextResponse } from "next/server";

// import { Subscription } from "@/lib/models/Subscription";
// import { PropertyContactAccess } from "@/lib/models/PropertyContactAccess";
// import { getServerSession } from "@/lib/server/getSession";
// import { getDb } from "@/lib/server/db";
// import { internalServerError } from "@/lib/error";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const session = await getServerSession();

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         {
//           alreadyUnlocked: false,
//           availableCredits: 0,
//           totalPurchasedCredits: 0,
//           usedCredits: 0,
//           propertyId: null,
//         },
//         { status: 200 },
//       );
//     }

//     const { id: propertyId } = await params;

//     await getDb();

//     const existingAccess = await PropertyContactAccess.findOne({
//       userId: session.user.id,
//       propertyId,
//     }).lean();

//     const subscriptions = await Subscription.find({
//       userId: session.user.id,
//       status: "paid",
//       paymentMethod: "esewa",
//     }).lean();

//     const totalPurchasedCredits = subscriptions.reduce((sum, sub) => {
//       return sum + (Number(sub.credits) || 0);
//     }, 0);

//     const usedCredits = await PropertyContactAccess.countDocuments({
//       userId: session.user.id,
//     });

//     const availableCredits = Math.max(totalPurchasedCredits - usedCredits, 0);
//     const hasAccess = !!existingAccess || totalCredits > 0;
//     return NextResponse.json(
//       {
//         propertyId,
//         hasAccess,
//         alreadyUnlocked: !!existingAccess,
//         availableCredits,
//         totalPurchasedCredits,
//         usedCredits,
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     console.error("Get property subscription error:", error);
//     return internalServerError("Failed to fetch subscription");
//   }
// }

import { NextRequest, NextResponse } from "next/server";

import { Subscription } from "@/lib/models/Subscription";
import { PropertyContactAccess } from "@/lib/models/PropertyContactAccess";
import { getServerSession } from "@/lib/server/getSession";
import { getDb } from "@/lib/server/db";
import { internalServerError } from "@/lib/error";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          alreadyUnlocked: false,
          availableCredits: 0,
          totalPurchasedCredits: 0,
          usedCredits: 0,
          propertyId: null,
          hasAccess: false,
        },
        { status: 200 },
      );
    }

    const { id: propertyId } = await params;

    await getDb();

    const propertySubscriptions = await Subscription.find({
      userId: session.user.id,
      propertyId,
      status: "paid",
      paymentMethod: "esewa",
    }).lean();

    if (!propertySubscriptions.length) {
      return NextResponse.json(
        {
          message: "No paid subscription found for this property",
          propertyId,
          hasAccess: false,
          alreadyUnlocked: false,
          availableCredits: 0,
          totalPurchasedCredits: 0,
          usedCredits: 0,
        },
        { status: 404 },
      );
    }

    const existingAccess = await PropertyContactAccess.findOne({
      userId: session.user.id,
      propertyId,
    }).lean();

    const allPaidSubscriptions = await Subscription.find({
      userId: session.user.id,
      status: "paid",
      paymentMethod: "esewa",
    }).lean();

    const totalPurchasedCredits = allPaidSubscriptions.reduce((sum, sub) => {
      return sum + (Number(sub.credits) || 0);
    }, 0);

    const usedCredits = await PropertyContactAccess.countDocuments({
      userId: session.user.id,
    });

    const availableCredits = Math.max(totalPurchasedCredits - usedCredits, 0);
    const hasAccess = !!existingAccess || availableCredits > 0;

    return NextResponse.json(
      {
        propertyId,
        hasAccess,
        alreadyUnlocked: !!existingAccess,
        availableCredits,
        totalPurchasedCredits,
        usedCredits,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get property subscription error:", error);
    return internalServerError("Failed to fetch subscription");
  }
}

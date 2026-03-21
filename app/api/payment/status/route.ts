// import { NextRequest, NextResponse } from "next/server";
// import { Subscription } from "@/lib/models/Subscription";
// import { getDb } from "@/lib/server/db";

// type EsewaRedirectData = {
//   transaction_code: string;
//   status: "COMPLETE" | "PENDING" | "CANCELED" | "AMBIGUOUS" | "NOT_FOUND";
//   total_amount: string;
//   transaction_uuid: string;
//   product_code: string;
//   signed_field_names: string;
//   signature: string;
// };

// type EsewaStatusResponse = {
//   product_code: string;
//   transaction_uuid: string;
//   total_amount: number;
//   status:
//     | "PENDING"
//     | "COMPLETE"
//     | "FULL_REFUND"
//     | "PARTIAL_REFUND"
//     | "AMBIGUOUS"
//     | "NOT_FOUND"
//     | "CANCELED";
//   ref_id: string | null;
// };

// function mapEsewaStatus(
//   status: EsewaStatusResponse["status"] | EsewaRedirectData["status"],
// ): "pending" | "paid" | "failed" | "canceled" | "ambiguous" | "refunded" {
//   switch (status) {
//     case "COMPLETE":
//       return "paid";
//     case "PENDING":
//       return "pending";
//     case "CANCELED":
//       return "canceled";
//     case "AMBIGUOUS":
//       return "ambiguous";
//     case "FULL_REFUND":
//     case "PARTIAL_REFUND":
//       return "refunded";
//     case "NOT_FOUND":
//     default:
//       return "failed";
//   }
// }

// function decodeEsewaData(data: string): EsewaRedirectData | null {
//   try {
//     const json = Buffer.from(data, "base64").toString("utf-8");
//     return JSON.parse(json) as EsewaRedirectData;
//   } catch (error) {
//     console.error("Failed to decode eSewa data param:", error);
//     return null;
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     const dataParam = req.nextUrl.searchParams.get("data");

//     if (!dataParam) {
//       return NextResponse.redirect(
//         new URL(
//           "/payment/unknown?reason=missing_data",
//           process.env.NEXT_PUBLIC_BASE_URL,
//         ),
//       );
//     }

//     const decoded = decodeEsewaData(dataParam);
//     if (!decoded?.transaction_uuid) {
//       return NextResponse.redirect(
//         new URL(
//           "/payment/unknown?reason=invalid_data",
//           process.env.NEXT_PUBLIC_BASE_URL,
//         ),
//       );
//     }

//     await getDb();
//     const payment = await Subscription.findOne({
//       transactionUuid: decoded.transaction_uuid,
//       paymentMethod: "esewa",
//     });

//     if (!payment) {
//       return NextResponse.redirect(
//         new URL(
//           "/payment/unknown?reason=payment_not_found",
//           process.env.NEXT_PUBLIC_BASE_URL,
//         ),
//       );
//     }

//     // Store redirect response hints first
//     payment.refId = decoded.transaction_code ?? null;

//     // Verify with status API instead of trusting redirect payload alone
//     const baseUrl = "https://rc.esewa.com.np";

//     const params = new URLSearchParams({
//       product_code: decoded.product_code || process.env.ESEWA_MERCHANT_CODE!,
//       total_amount: String(decoded.total_amount || payment.amount),
//       transaction_uuid: decoded.transaction_uuid,
//     });

//     const response = await fetch(
//       `${baseUrl}/api/epay/transaction/status/?${params.toString()}`,
//       {
//         method: "GET",
//         cache: "no-store",
//       },
//     );

//     const statusData = await response.json();

//     if (response.ok && statusData?.status) {
//       payment.status = mapEsewaStatus(statusData.status);

//       if ("ref_id" in statusData) {
//         payment.refId = statusData.ref_id ?? payment.refId ?? null;
//       }

//       if (statusData.status === "COMPLETE") {
//         payment.paymentDate = new Date();
//       }

//       await payment.save();
//     } else {
//       // fallback to redirect payload if status API temporarily fails
//       payment.status = mapEsewaStatus(decoded.status);

//       if (decoded.status === "COMPLETE") {
//         payment.paymentDate = new Date();
//       }

//       await payment.save();
//     }

//     return NextResponse.redirect(
//       new URL(
//         `/payment/paid?paymentId=${payment._id.toString()}`,
//         process.env.NEXT_PUBLIC_BASE_URL,
//       ),
//     );
//   } catch (error) {
//     console.error("eSewa status route error:", error);

//     return NextResponse.redirect(
//       new URL(
//         "/payment/unknown?reason=server_error",
//         process.env.NEXT_PUBLIC_BASE_URL,
//       ),
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { Subscription } from "@/lib/models/Subscription";
import { getDb } from "@/lib/server/db";

type EsewaRedirectData = {
  transaction_code: string;
  status: "COMPLETE" | "PENDING" | "CANCELED" | "AMBIGUOUS" | "NOT_FOUND";
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
};

type EsewaStatusResponse = {
  product_code: string;
  transaction_uuid: string;
  total_amount: number;
  status:
    | "PENDING"
    | "COMPLETE"
    | "FULL_REFUND"
    | "PARTIAL_REFUND"
    | "AMBIGUOUS"
    | "NOT_FOUND"
    | "CANCELED";
  ref_id: string | null;
};

function mapEsewaStatus(
  status: EsewaStatusResponse["status"] | EsewaRedirectData["status"],
): "pending" | "paid" | "failed" | "canceled" | "ambiguous" | "refunded" {
  switch (status) {
    case "COMPLETE":
      return "paid";
    case "PENDING":
      return "pending";
    case "CANCELED":
      return "canceled";
    case "AMBIGUOUS":
      return "ambiguous";
    case "FULL_REFUND":
    case "PARTIAL_REFUND":
      return "refunded";
    case "NOT_FOUND":
    default:
      return "failed";
  }
}

function decodeEsewaData(data: string): EsewaRedirectData | null {
  try {
    const json = Buffer.from(data, "base64").toString("utf-8");
    return JSON.parse(json) as EsewaRedirectData;
  } catch (error) {
    console.error("Failed to decode eSewa data param:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const dataParam = req.nextUrl.searchParams.get("data");

    if (!dataParam) {
      return NextResponse.redirect(
        new URL(
          "/payment/unknown?reason=missing_data",
          process.env.NEXT_PUBLIC_BASE_URL,
        ),
      );
    }

    const decoded = decodeEsewaData(dataParam);
    if (!decoded?.transaction_uuid) {
      return NextResponse.redirect(
        new URL(
          "/payment/unknown?reason=invalid_data",
          process.env.NEXT_PUBLIC_BASE_URL,
        ),
      );
    }

    await getDb();

    const payment = await Subscription.findOne({
      transactionUuid: decoded.transaction_uuid,
      paymentMethod: "esewa",
    });

    if (!payment) {
      return NextResponse.redirect(
        new URL(
          "/payment/unknown?reason=payment_not_found",
          process.env.NEXT_PUBLIC_BASE_URL,
        ),
      );
    }

    payment.refId = decoded.transaction_code ?? null;

    const baseUrl = "https://rc.esewa.com.np";

    const params = new URLSearchParams({
      product_code: decoded.product_code || process.env.ESEWA_MERCHANT_CODE!,
      total_amount: String(decoded.total_amount || payment.amount),
      transaction_uuid: decoded.transaction_uuid,
    });

    const response = await fetch(
      `${baseUrl}/api/epay/transaction/status/?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    let finalStatus:
      | "pending"
      | "paid"
      | "failed"
      | "canceled"
      | "ambiguous"
      | "refunded";

    const statusData = await response.json();

    if (response.ok && statusData?.status) {
      finalStatus = mapEsewaStatus(statusData.status);

      payment.status = finalStatus;

      if ("ref_id" in statusData) {
        payment.refId = statusData.ref_id ?? payment.refId ?? null;
      }

      // only grant credits once
      if (statusData.status === "COMPLETE" && payment.status !== "paid") {
        payment.paymentDate = new Date();
      }
    } else {
      finalStatus = mapEsewaStatus(decoded.status);
      payment.status = finalStatus;

      if (decoded.status === "COMPLETE" && payment.status !== "paid") {
        payment.paymentDate = new Date();
      }
    }

    // grant credits only when payment is successful and not already granted
    if (finalStatus === "paid" && !payment.creditsGranted) {
      payment.credits = payment.creditsToAdd ?? 1;
      payment.creditsGranted = true;
      payment.paymentDate = payment.paymentDate ?? new Date();
    }

    await payment.save();

    const redirectPath =
      finalStatus === "paid"
        ? `/payment/paid?paymentId=${payment._id.toString()}`
        : finalStatus === "pending"
          ? `/payment/pending?paymentId=${payment._id.toString()}`
          : finalStatus === "canceled"
            ? `/payment/canceled?paymentId=${payment._id.toString()}`
            : `/payment/failed?paymentId=${payment._id.toString()}`;

    return NextResponse.redirect(
      new URL(redirectPath, process.env.NEXT_PUBLIC_BASE_URL),
    );
  } catch (error) {
    console.error("eSewa status route error:", error);

    return NextResponse.redirect(
      new URL(
        "/payment/unknown?reason=server_error",
        process.env.NEXT_PUBLIC_BASE_URL,
      ),
    );
  }
}

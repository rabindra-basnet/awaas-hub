import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "canceled"
  | "ambiguous"
  | "refunded"
  | "unknown";

type PaymentResponse = {
  payment: {
    id: string;
    propertyId: string;
    amount: number;
    credits: number;
    status: PaymentStatus;
    paymentMethod: string;
    transactionId: string;
    transactionUuid: string;
    paymentDate?: string;
    createdAt: string;
  };
};

const statusConfig: Record<
  PaymentStatus,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    badgeClass: string;
  }
> = {
  paid: {
    title: "Payment Successful",
    description:
      "Your payment was completed successfully. You can now view the contact details.",
    icon: <CheckCircle2 className="h-12 w-12 text-green-600" />,
    badgeClass: "bg-green-100 text-green-700",
  },
  pending: {
    title: "Payment Pending",
    description:
      "Your payment is still being processed. Please check again shortly.",
    icon: <Clock3 className="h-12 w-12 text-yellow-600" />,
    badgeClass: "bg-yellow-100 text-yellow-700",
  },
  failed: {
    title: "Payment Failed",
    description: "Your payment could not be completed. Please try again.",
    icon: <XCircle className="h-12 w-12 text-red-600" />,
    badgeClass: "bg-red-100 text-red-700",
  },
  canceled: {
    title: "Payment Canceled",
    description: "You canceled the payment before it was completed.",
    icon: <RotateCcw className="h-12 w-12 text-gray-600" />,
    badgeClass: "bg-gray-100 text-gray-700",
  },
  ambiguous: {
    title: "Payment Under Review",
    description:
      "We could not confirm the payment yet. Please check again in a moment.",
    icon: <AlertTriangle className="h-12 w-12 text-orange-600" />,
    badgeClass: "bg-orange-100 text-orange-700",
  },
  refunded: {
    title: "Payment Refunded",
    description: "This payment has been refunded.",
    icon: <RotateCcw className="h-12 w-12 text-blue-600" />,
    badgeClass: "bg-blue-100 text-blue-700",
  },
  unknown: {
    title: "Payment Unknown",
    description: "This payment status is unknown.",
    icon: <AlertTriangle className="h-12 w-12 text-blue-600" />,
    badgeClass: "bg-blue-100 text-blue-700",
  },
};

function normalizeStatus(id: string): PaymentStatus {
  if (
    id === "paid" ||
    id === "pending" ||
    id === "failed" ||
    id === "canceled" ||
    id === "ambiguous" ||
    id === "refunded" ||
    id === "unknown"
  ) {
    return id;
  }

  if (id === "success") return "paid";

  return "unknown";
}

async function getPaymentByTransactionUuid(
  transactionUuid?: string,
): Promise<PaymentResponse | null> {
  if (!transactionUuid) return null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/payment/${encodeURIComponent(transactionUuid)}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) return null;
  return res.json();
}

export default async function PaymentStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentId?: string; reason?: string }>;
}) {
  const { id } = await params;
  const { paymentId, reason } = await searchParams;

  const pageStatus = normalizeStatus(id);
  const data = await getPaymentByTransactionUuid(paymentId);
  const payment = data?.payment ?? null;

  const resolvedStatus = payment?.status ?? pageStatus;
  const config = statusConfig[resolvedStatus] ?? statusConfig.unknown;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm border">
        <div className="flex flex-col items-center text-center">
          {config.icon}
          <h1 className="mt-4 text-2xl font-bold">{config.title}</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-md">
            {resolvedStatus === "unknown" && reason
              ? `Reason: ${reason.replace(/_/g, " ")}`
              : config.description}
          </p>

          <span
            className={`mt-4 rounded-full px-3 py-1 text-sm font-medium capitalize ${config.badgeClass}`}
          >
            {resolvedStatus}
          </span>
        </div>

        {payment && (
          <div className="mt-8 space-y-4 rounded-xl border bg-gray-50 p-5">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Payment ID</span>
              <span className="font-medium">{payment.id}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium">NPR {payment.amount}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Credits</span>
              <span className="font-medium">{payment.credits}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-medium">{payment.transactionId}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium uppercase">
                {payment.paymentMethod}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {resolvedStatus === "paid" && payment?.propertyId && (
            <Link
              href={`/properties/${payment.propertyId}`}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              View Property Contact
            </Link>
          )}

          {(resolvedStatus === "failed" || resolvedStatus === "canceled") &&
            payment?.propertyId && (
              <Link
                href={`/properties/${payment.propertyId}`}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
              >
                Try Again
              </Link>
            )}

          {(resolvedStatus === "pending" ||
            resolvedStatus === "ambiguous" ||
            resolvedStatus === "unknown") &&
            paymentId && (
              <Link
                href={`/payment/${resolvedStatus}?paymentId=${encodeURIComponent(paymentId)}`}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Refresh Status
              </Link>
            )}

          {!payment && (
            <Link
              href={`/properties/${payment!.propertyId}`}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Back to Properties
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

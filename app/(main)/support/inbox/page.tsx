import { Suspense } from "react";
import SupportInbox from "./_components/support-inbox";

export const metadata = { title: "Support Inbox" };

export default function SupportInboxPage() {
  return (
    <Suspense>
      <SupportInbox />
    </Suspense>
  );
}

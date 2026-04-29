import SupportChat from "./_components/support-chat";

export const metadata = { title: "Support Chat" };

export default function SupportPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b px-6 py-4">
        <h1 className="font-semibold text-lg">Support</h1>
        <p className="text-sm text-muted-foreground">
          Chat with our team — we typically reply within a few hours.
        </p>
      </div>
      <SupportChat />
    </div>
  );
}

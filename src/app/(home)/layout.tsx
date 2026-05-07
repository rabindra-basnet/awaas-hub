import HomeHeader from "@/features/home/components/home-header";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AawasHub. All rights reserved.
      </footer>
    </div>
  );
}

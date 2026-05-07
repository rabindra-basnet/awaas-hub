import HomeHeader from "@/features/home/components/home-header";
import HomeFooter from "@/features/home/components/home-footer";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-1">{children}</main>
      <HomeFooter />
    </div>
  );
}

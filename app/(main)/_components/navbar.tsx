import { useSession } from "@/lib/client/auth-client"
import { Session } from "@/lib/server/auth"
import { NavUser } from "./nav-user"


export default function DashboardNavbar() {
    const { data: session, isPending } = useSession()

    if (isPending) {
        return (
            <div className="h-14 border-b flex items-center justify-end px-4">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            </div>
        )
    }

    const user = session?.user as Session["user"] | undefined

    // Transform user data to match NavUser's expected format
    const navUserData = user ? {
        name: user.name ?? "User",
        email: user.email ?? "",
        image: user.image ?? ""
    } : {
        name: "User",
        email: "",
        image: ""
    }

    return (
        <header className="h-14 border-b bg-background flex items-center justify-end px-4">
            <NavUser user={navUserData} />

        </header>
    )
}
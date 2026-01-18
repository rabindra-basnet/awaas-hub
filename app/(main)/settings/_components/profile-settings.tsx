export default function ProfileSettings({ user }: { user: any }) {
    return (
        <section className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-lg font-medium">Profile</h2>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <p className="font-medium">{user.name}</p>
                </div>

                <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{user.email}</p>
                </div>
            </div>
        </section>
    );
}

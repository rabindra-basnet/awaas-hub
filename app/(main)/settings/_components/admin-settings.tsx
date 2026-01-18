export default function AdminSettings() {
    return (
        <section className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-lg font-medium text-destructive">
                Admin Settings
            </h2>

            <ul className="space-y-2 text-sm">
                <li>User Management</li>
                <li>Role Permissions</li>
                <li>System Configuration</li>
            </ul>
        </section>
    );
}

"use client";

import Link from "next/link";
import { Users, ArrowRight, BarChart3 } from "lucide-react";

export default function AdminSettings() {
  return (
    <section className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60">
        <h2 className="font-semibold text-sm">Admin</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Platform management tools</p>
      </div>
      <div className="p-4 space-y-2">
        <Link
          href="/users"
          className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">User Management</p>
              <p className="text-xs text-muted-foreground">Ban, unban, change roles, impersonate</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link
          href="/analytics"
          className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Analytics</p>
              <p className="text-xs text-muted-foreground">Platform insights and metrics</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </section>
  );
}

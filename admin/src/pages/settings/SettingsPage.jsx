function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">Placeholder sections for store configuration.</p>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <h2 className="text-sm font-semibold text-zinc-200">Store</h2>
        <p className="mt-2 text-sm text-zinc-500">Name, currency, delivery zones — UI only.</p>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <h2 className="text-sm font-semibold text-zinc-200">Notifications</h2>
        <p className="mt-2 text-sm text-zinc-500">Email and webhook toggles — UI only.</p>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-6">
        <h2 className="text-sm font-semibold text-zinc-200">Admin users</h2>
        <p className="mt-2 text-sm text-zinc-500">Roles and invites — UI only.</p>
      </section>
    </div>
  );
}

export default SettingsPage;

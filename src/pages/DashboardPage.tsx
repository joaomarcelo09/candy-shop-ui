import { Link } from "react-router-dom";
import { StatCard } from "../components/StatCard";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { useCandiesQuery } from "../hooks/useCandies";
import { useCurrentSessionQuery } from "../hooks/useSession";
import { formatCurrency, formatShortDate } from "../utils/format";
import { buildTotals } from "../utils/session";

export function DashboardPage() {
  const candiesQuery = useCandiesQuery();
  const candies = candiesQuery.data ?? [];
  const sessionQuery = useCurrentSessionQuery(candies);
  const activeSession = sessionQuery.data ?? null;
  const totals = buildTotals(activeSession);

  if (
    (candiesQuery.isError && candiesQuery.data === undefined) ||
    (sessionQuery.isError && (sessionQuery.data === null || sessionQuery.data === undefined))
  ) {
    return (
      <div className="page-shell">
        <section className="glass-card p-5 sm:p-6">
          <h2 className="section-title">Unable to load the dashboard</h2>
          <p className="mt-3 text-sm text-cocoa-800/70">
            Check the connection before continuing with the selling flow.
          </p>
          <Button
            className="mt-5"
            disabled={candiesQuery.isFetching || sessionQuery.isFetching}
            onClick={() => {
              if (candiesQuery.isError && candiesQuery.data === undefined)
                void candiesQuery.refetch();
              if (
                sessionQuery.isError &&
                (sessionQuery.data === null || sessionQuery.data === undefined)
              )
                void sessionQuery.refetch();
            }}
          >
            {candiesQuery.isFetching || sessionQuery.isFetching
              ? "Trying again..."
              : "Try again"}
          </Button>
        </section>
      </div>
    );
  }

  if (candiesQuery.isPending || sessionQuery.isPending) {
    return (
      <div className="page-shell grid gap-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="glass-card overflow-hidden p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa-800/55">
          Live selling
        </p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="section-title">Counter view for fast sales</h2>
            <p className="mt-3 max-w-2xl text-sm text-cocoa-800/70">
              Built mobile-first so the operator can sell from the session
              screen with large controls and minimal typing.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/session">
              <Button>Open session screen</Button>
            </Link>
            <Link to="/candies">
              <Button variant="secondary">Manage candies</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          eyebrow="Status"
          title="Active session"
          value={activeSession ? "Open now" : "No session"}
          accent="◉"
        />
        <StatCard
          eyebrow="Units"
          title="Candies sold"
          value={String(totals.candiesSold)}
          accent="◌"
        />
        <StatCard
          eyebrow="Revenue"
          title="Live session total"
          value={formatCurrency(totals.estimatedTotal)}
          accent="◍"
        />
        <StatCard
          eyebrow="Catalog"
          title="Registered candies"
          value={String(candies.length)}
          accent="◎"
        />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article className="glass-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-cocoa-900">
                Session snapshot
              </h3>
              <p className="mt-1 text-sm text-cocoa-800/65">
                Quick summary for the current selling window.
              </p>
            </div>
            {sessionQuery.isFetching ? (
              <span className="text-xs font-bold text-cocoa-800/55">
                Syncing...
              </span>
            ) : null}
          </div>

          {activeSession ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-cream-50 p-4">
                <p className="text-sm text-cocoa-800/60">Session date</p>
                <p className="mt-1 text-lg font-bold text-cocoa-900">
                  {formatShortDate(activeSession.date)}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-cocoa-900/10 bg-white/70 p-4">
                  <p className="text-sm text-cocoa-800/60">Status</p>
                  <p className="mt-1 font-bold text-mint-500">
                    {activeSession.status}
                  </p>
                </div>
                <div className="rounded-3xl border border-cocoa-900/10 bg-white/70 p-4">
                  <p className="text-sm text-cocoa-800/60">Live total</p>
                  <p className="mt-1 font-bold text-cocoa-900">
                    {formatCurrency(totals.estimatedTotal)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-cocoa-900 p-5 text-white">
              <p className="text-sm text-white/70">No open session</p>
              <p className="mt-2 max-w-md text-lg font-semibold">
                Start a session from the selling screen when the shop opens.
              </p>
            </div>
          )}
        </article>

        <article className="glass-card p-5">
          <h3 className="text-lg font-bold text-cocoa-900">Quick actions</h3>
          <div className="mt-4 grid gap-3">
            <Link to="/session">
              <Button fullWidth>
                {activeSession ? "Continue selling" : "Start selling"}
              </Button>
            </Link>
            <Link to="/candies">
              <Button variant="secondary" fullWidth>
                Add or edit candies
              </Button>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

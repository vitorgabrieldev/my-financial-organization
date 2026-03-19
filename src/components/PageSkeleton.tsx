interface PageSkeletonProps {
  cards?: number
  lines?: number
  withForm?: boolean
  withTable?: boolean
}

export const PageSkeleton = ({
  cards = 3,
  lines = 4,
  withForm = false,
  withTable = true,
}: PageSkeletonProps) => {
  return (
    <div className="grid gap-4">
      <section className={`grid gap-3 ${cards > 1 ? 'md:grid-cols-3' : ''}`}>
        {Array.from({ length: cards }).map((_, index) => (
          <article key={index} className="border border-border bg-surface p-4 shadow-soft">
            <div className="skeleton mb-3 h-3 w-24" />
            <div className="skeleton h-7 w-36" />
          </article>
        ))}
      </section>

      {withForm ? (
        <section className="border border-border bg-surface p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="skeleton h-5 w-36" />
            <div className="skeleton h-8 w-24" />
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <div className="skeleton mb-2 h-3 w-20" />
                <div className="skeleton h-11 w-full" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {withTable ? (
        <section className="border border-border bg-surface p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-4 w-20" />
          </div>
          <div className="grid gap-2">
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_auto] gap-3 border border-border bg-white/70 p-3"
              >
                <div className="skeleton h-4 w-52" />
                <div className="skeleton h-4 w-24 justify-self-end" />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

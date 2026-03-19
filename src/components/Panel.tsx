import type { PropsWithChildren, ReactNode } from 'react'

interface PanelProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export const Panel = ({
  title,
  subtitle,
  actions,
  children,
}: PropsWithChildren<PanelProps>) => {
  return (
    <section className="reveal border border-border bg-surface px-4 py-4 shadow-soft md:px-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>
      {children}
    </section>
  )
}

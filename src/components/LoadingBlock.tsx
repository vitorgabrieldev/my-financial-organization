export const LoadingBlock = ({ message }: { message: string }) => {
  return (
    <div className="border border-border bg-surface p-6 text-sm text-muted">
      {message}
    </div>
  )
}

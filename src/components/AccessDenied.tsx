interface AccessDeniedProps {
  moduleLabel: string
}

export const AccessDenied = ({ moduleLabel }: AccessDeniedProps) => {
  return (
    <section className="border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
      Você não tem permissão para acessar o módulo <strong>{moduleLabel}</strong>.
    </section>
  )
}

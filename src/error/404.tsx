

interface NotFoundProps {
  default?: boolean
}


export function NotFound({ default: _default }: NotFoundProps) {
  return (
    <div>
      <h1>404</h1>
      <p>Page not found</p>
    </div>
  )
}

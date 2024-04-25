

interface LoginProps {
  login: () => void
  id: string
  secretKey: string
  setId: (id: string) => void
  setSecretKey: (secretKey: string) => void
}


export function Login({login, id, secretKey, setId, setSecretKey}: LoginProps) {
  const onInputId = (e: Event) => {
    setId((e.target as HTMLInputElement).value)
  }

  const onInputSecretKey = (e: Event) => {
    setSecretKey((e.target as HTMLInputElement).value)
  }

  return (
    <form class="login" onSubmit={e => { e.preventDefault(); login() }}>
      <h1>Login</h1>
      <input id="id" type="text" placeholder="ID"
        value={id} onInput={onInputId} />
      <input id="password" type="password" placeholder="Secret Key"
        value={secretKey} onInput={onInputSecretKey} />
      <button type="submit" value="Login">Login</button>
    </form>
  )
}

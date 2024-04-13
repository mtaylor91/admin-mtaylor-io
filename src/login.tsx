

interface LoginProps {
  login: () => void
  email: string
  secretKey: string
  setEmail: (email: string) => void
  setSecretKey: (secretKey: string) => void
}


export function Login({login, email, secretKey, setEmail, setSecretKey}: LoginProps) {
  const onInputEmail = (e: Event) => {
    setEmail((e.target as HTMLInputElement).value)
  }

  const onInputSecretKey = (e: Event) => {
    setSecretKey((e.target as HTMLInputElement).value)
  }

  return (
    <form onSubmit={e => { e.preventDefault(); login() }}>
      <h1>Login</h1>
      <input id="email" type="text" placeholder="Email"
        value={email} onInput={onInputEmail} />
      <input id="password" type="password" placeholder="Secret Key"
        value={secretKey} onInput={onInputSecretKey} />
      <button type="submit" value="Login">Login</button>
    </form>
  )
}

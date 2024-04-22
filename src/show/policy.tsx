import axios, { AxiosError } from 'axios'
import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { Policy } from 'iam-mtaylor-io-js'


interface PolicyStatementsProps {
  policy: Policy
}


function PolicyStatements({ policy }: PolicyStatementsProps) {
  return (
    <table class="background-dark border-radius">
      <thead>
        <tr>
          <th><span>Effect</span></th>
          <th><span>Action</span></th>
          <th><span>Resource</span></th>
        </tr>
      </thead>
      <tbody>
        {policy.statements.map((statement) => {
          return (
            <tr>
              <td><span>{statement.effect}</span></td>
              <td><span>{statement.action}</span></td>
              <td><span>{statement.resource}</span></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}


interface ShowPolicyProps {
  client: IAM
  id?: string
  path?: string
}


export function ShowPolicy({ client, id }: ShowPolicyProps) {
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id === undefined) {
      return
    }

    const getPolicy = async () => {
      try {
        const policy = await client.policies.getPolicy(id)
        setPolicy(policy)
        setError(null)
      } catch (err) {
        const error = err as Error | AxiosError
        if (!axios.isAxiosError(error))
          throw error
        setError(error.response?.data?.error || error.message)
        throw error
      }
    }

    getPolicy()
  }, [id])

  if (id === undefined || policy === null) {
    return error ? <p class="error">{error}</p> : <p>Loading...</p>
  }

  const onClickDelete = async (event: Event) => {
    event.preventDefault()
    await client.policies.deletePolicy(id)
    route('/policies')
  }

  return (
    <>
      <div class="section">
        <h1>Policy</h1>
        {error && <p class="error">{error}</p>}
        <p>{policy.id}</p>
      </div>
      {policy.name && (
      <div class="section">
        <h3>Name</h3>
        <p class="background-dark border-radius">{policy.name}</p>
      </div>
      )}
      <div class="section">
        <h3>Hostname</h3>
        <p class="background-dark border-radius">{policy.hostname}</p>
      </div>
      <div class="section">
        <h3>Statements</h3>
        <PolicyStatements policy={policy} />
      </div>
      <button onClick={onClickDelete}>Delete</button>
    </>
  )
}

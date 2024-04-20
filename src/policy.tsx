import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { Policy } from 'iam-mtaylor-io-js'


interface PolicyStatementsProps {
  policy: Policy
}


function PolicyStatements({ policy }: PolicyStatementsProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Effect</th>
          <th>Action</th>
          <th>Resource</th>
        </tr>
      </thead>
      <tbody>
        {policy.statements.map((statement) => {
          return (
            <tr>
              <td>{statement.effect}</td>
              <td>{statement.action}</td>
              <td>{statement.resource}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}


interface PolicyViewProps {
  client: IAM
  id?: string
  path?: string
}


export function PolicyView({ client, id }: PolicyViewProps) {
  const [policy, setPolicy] = useState<Policy | null>(null)

  useEffect(() => {
    if (id === undefined) {
      return
    }

    const getPolicy = async () => {
      const policy = await client.policies.getPolicy(id)
      setPolicy(policy)
    }

    getPolicy()
  }, [id])

  if (id === undefined || policy === null) {
    return <div>Loading...</div>
  }

  const onClickDelete = async (event: Event) => {
    event.preventDefault()
    await client.policies.deletePolicy(id)
    route('/policies')
  }

  return (
    <>
      <h1>Policy</h1>
      <p>{policy.id}</p>
      {policy.name && (
      <>
        <h3>Name</h3>
        <p>{policy.name}</p>
      </>
      )}
      <h3>Hostname</h3>
      <p>{policy.hostname}</p>
      <h3>Statements</h3>
      <PolicyStatements policy={policy} />
      <button onClick={onClickDelete}>Delete</button>
    </>
  )
}

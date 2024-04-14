import { route } from 'preact-router'
import { useState, useEffect } from 'preact/hooks'
import IAM, { Policy } from 'iam-mtaylor-io-js'


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
  }, [])

  if (id === undefined || policy === null) {
    return <div>Loading...</div>
  }

  const onClickDelete = async (event: Event) => {
    event.preventDefault()
    await client.policies.deletePolicy(id)
    route('/policies')
  }

  return (
    <div>
      <h1>Policy</h1>
      <p>{policy.id}</p>
      <button onClick={onClickDelete}>Delete</button>
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
    </div>
  )
}


interface PolicyStatementsProps {
  policy: Policy
}


function PolicyStatements({ policy }: PolicyStatementsProps) {
  return (
    <div class="policy-statements">
    {policy.statements.map((statement, index) => {
      return (
        <div class="policy-statement" key={index}>
          <h3>{statement.effect}</h3>
          <h3>{statement.action}</h3>
          <h3>{statement.resource}</h3>
        </div>
      )
    })}
    </div>
  )
}

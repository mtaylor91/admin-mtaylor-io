import { User, Group, Policy } from 'iam-mtaylor-io-js'
import { UserIdentity, GroupIdentity, PolicyIdentity } from 'iam-mtaylor-io-js'


export function resolveUserIdentifier(user: User | UserIdentity): string {
  if (typeof user === 'string') {
    return user
  } else {
    return user.email || user.id
  }
}


export function resolveGroupIdentifier(group: Group | GroupIdentity): string {
  if (typeof group === 'string') {
    return group
  } else {
    return group.name || group.id
  }
}


export function resolvePolicyIdentifier(policy: Policy | PolicyIdentity): string {
  if (typeof policy === 'string') {
    return policy
  } else {
    return policy.name || policy.id
  }
}

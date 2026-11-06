import { ArrowUpRight } from 'lucide-react'
import type { Product } from './content'
import styles from './Family.module.css'

export default function FamilyLink({ from }: { from: Product }) {
  const operator = from === 'Embark'
  return <aside className={styles.bridge}>
    <small>The Portlink network</small>
    <h2>{operator ? 'Where the request begins.' : 'Meet the people running the tour.'}</h2>
    <p>{operator ? 'Cruise lines plan their calls in Portlink. Destination management companies build the shore programme there, using terms supplied by local operators through Embark.' : 'Embark is the Portlink product for local tour operators. On the other side of the DMC’s request is a person organising a guide, a boat and a departure.'}</p>
    <a href={operator ? '/' : '/embark/'}>Explore {operator ? 'Portlink' : 'Embark'} <ArrowUpRight size={19}/></a>
  </aside>
}

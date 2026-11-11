'use client'
/* eslint-disable react-hooks/set-state-in-effect -- Restore anonymous browser-only state after SSR. */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { defaultPreferences, readPreferences, resetPreferences, savePreferences, validatePreferences, type AcquisitionPreferences, type AcquisitionProduct } from '@/lib/acquisition-preferences'
import { topics } from './journey-content'
const ProductDemo = dynamic(() => import('./ProductDemo'), { ssr: false })
type Session = {
  product: AcquisitionProduct; preferences: AcquisitionPreferences; storageAvailable: boolean
  update: (value: AcquisitionPreferences) => boolean; resetPreferences: () => void
  progress: Record<string, boolean>; review: (topic: string) => void; resetDemo: () => void
  open: (topic: string, trigger?: HTMLElement) => void
}
const Context = createContext<Session | null>(null)
export const useProductSession = () => { const value = useContext(Context); if (!value) throw new Error('Product session missing'); return value }
export default function ProductSession({ product, children }: { product: AcquisitionProduct; children: ReactNode }) {
  const [preferences, setPreferences] = useState(defaultPreferences(product))
  const [storageAvailable, setStorageAvailable] = useState(true)
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [scene, setScene] = useState<string | null>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const scroll = useRef(0)
  const entry = useRef<string | null>(null)
  useEffect(() => {
    const value = readPreferences(product, () => localStorage)
    if (value) setPreferences({ ...value, audience: product === 'embark' ? 'operator' : value.audience === 'operator' ? 'cruise' : value.audience })
    function readView() {
      const hash = location.hash.slice(1)
      const id = hash.startsWith('demo-') ? hash.slice(5) : ''
      setScene(topics[product].some(t => t.id === id) ? id : null)
    }
    readView(); window.addEventListener('popstate', readView); window.addEventListener('hashchange', readView)
    return () => { window.removeEventListener('popstate', readView); window.removeEventListener('hashchange', readView) }
  }, [product])
  function update(value: AcquisitionPreferences) {
    const clean = validatePreferences(value)
    if (!clean || (product === 'embark' ? clean.audience !== 'operator' : clean.audience === 'operator')) return false
    setPreferences(clean); setStorageAvailable(savePreferences(product, clean, () => localStorage)); return true
  }
  function open(topic: string, element?: HTMLElement) {
    if (!topics[product].some(t => t.id === topic)) return
    if (!scene) {
      trigger.current = element ?? (document.activeElement as HTMLElement); scroll.current = window.scrollY
      entry.current = `${product}-${Date.now()}`
      history.pushState({ ...history.state, acquisitionDemo: entry.current }, '', `#demo-${topic}`)
    } else history.replaceState(history.state, '', `#demo-${topic}`)
    setScene(topic)
  }
  function close() {
    if (entry.current && history.state?.acquisitionDemo === entry.current) history.back()
    else { history.replaceState(history.state, '', location.pathname + location.search); setScene(null) }
  }
  return <Context.Provider value={{ product, preferences, storageAvailable, update,
    resetPreferences: () => { setPreferences(defaultPreferences(product)); setStorageAvailable(resetPreferences(product, () => localStorage)) },
    progress: Object.fromEntries(topics[product].map(t => [t.id, !!progress[`${preferences.audience}:${t.id}`]])), review: topic => setProgress(old => ({ ...old, [`${preferences.audience}:${topic}`]: true })), resetDemo: () => setProgress({}), open }}>
    {children}
    {scene && <ProductDemo topic={scene} onClose={close} onRestore={() => { window.scrollTo(0, scroll.current); trigger.current?.focus({ preventScroll: true }) }} />}
  </Context.Provider>
}

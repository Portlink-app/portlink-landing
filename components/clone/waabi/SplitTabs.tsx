'use client'
/** Phone version of the sticky split: Waabi's tabbed card with a progress rule and prev/next. */
import { useState } from 'react'
import { SPLIT } from './content'
import Film from '../Film'

export default function SplitTabs() {
  const [i, setI] = useState(0)
  const s = SPLIT[i]
  const go = (d: number) => setI((i + d + SPLIT.length) % SPLIT.length)
  return (
    <>
      <div className="rounded-calc relative aspect-square overflow-clip bg-cream">
        {s.video ? (
          <Film key={s.video} src={s.video} poster={s.poster ?? ""} alt={s.alt} />
        ) : (
          <img key={s.still} className="h-full w-full object-cover object-left-top" src={s.still} alt={s.alt} />
        )}
      </div>
      <div className="flex flex-col gap-20" aria-live="polite">
        <p className="type-z-24">{s.title}</p>
        <p className="text-s-14 text-pretty text-black/50 wbx-body">{s.body}</p>
        <div className="relative h-1 w-full overflow-clip bg-black/15">
          <div className="bg-pink absolute bottom-0 left-0 h-2 w-full wbx-rule" style={{ transform: `scaleX(${(i + 1) / SPLIT.length})` }} />
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-8">
            <button type="button" aria-label="Previous" onClick={() => go(-1)} className="flex-center size-32 rounded-full border-1 border-current/15 wbx-arrow wbx-arrow-l" />
            <button type="button" aria-label="Next" onClick={() => go(1)} className="flex-center size-32 rounded-full border-1 border-current/15 wbx-arrow" />
          </div>
          <span className="type-s-11 text-current/50 wbx-muted">{i + 1} of {SPLIT.length}</span>
        </div>
      </div>
    </>
  )
}

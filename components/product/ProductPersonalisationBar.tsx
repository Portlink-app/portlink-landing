'use client'

import Link from 'next/link'
import { useState } from 'react'
import { audienceLabels, productSlug } from '@/components/acquisition/journey-content'
import { useProductSession } from '@/components/acquisition/ProductSession'
import type { AcquisitionAudience } from '@/lib/acquisition-preferences'
import { customerBrand } from '@/lib/customer-brand'

const BRAND_SWATCHES: [string, string][] = [
  ['Ocean', '#173b57'],
  ['Teal', '#0f766e'],
  ['Copper', '#965a28'],
  ['Forest', '#24634b'],
  ['Night', '#0c1829'],
]

export function ProductPersonalisationBar({
  defaultTopic,
}: {
  defaultTopic?: string
}) {
  const s = useProductSession()
  const [nameError, setNameError] = useState('')
  const [colourError, setColourError] = useState('')

  const brand = customerBrand(s.preferences.brandColor)
  const fallbackCompany =
    s.product === 'embark'
      ? 'Fjordland Adventures AS'
      : s.preferences.audience === 'agent'
        ? 'Vestkyst Maritime Agency'
        : s.preferences.audience === 'tour'
          ? 'Fjordhaven Shorex DMC'
          : 'Nordkyst Cruise Line'
  const activeCompany = s.preferences.companyName || fallbackCompany
  const topicToOpen = defaultTopic ?? (s.product === 'embark' ? 'capacity' : 'planning')

  function applyColour(value: string) {
    const ok = s.update({ ...s.preferences, brandColor: value })
    setColourError(ok ? '' : 'Enter a 6-digit hex colour such as #173b57.')
  }

  function applyCompany(value: string) {
    const ok = s.update({ ...s.preferences, companyName: value })
    setNameError(ok ? '' : 'Use a plain-text company name (up to 100 characters).')
  }

  return (
    <aside className="pp-personalise-bar" aria-label="Make it yours workspace personalisation">
      <div className="pp-personalise-head">
        <div className="pp-personalise-title-group">
          <h3 className="pp-personalise-title">Make it yours</h3>
          <span className="pp-personalise-note">
            Live-themes the D14 workspaces below in this browser only; no account is created.
          </span>
        </div>

        <span
          className="pp-brand-badge"
          style={{ backgroundColor: brand.effective, color: brand.foreground }}
          data-testid="personalise-brand-preview"
        >
          <span>{activeCompany}</span>
          <span aria-hidden="true">·</span>
          <span>{audienceLabels[s.preferences.audience]}</span>
        </span>
      </div>

      <div className="pp-personalise-grid">
        <label className="pp-personalise-field">
          <span className="pp-personalise-label">Company name</span>
          <input
            key={s.preferences.companyName}
            type="text"
            className="pp-personalise-input"
            defaultValue={s.preferences.companyName}
            placeholder={fallbackCompany}
            maxLength={100}
            autoComplete="organization"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? 'pp-company-error' : undefined}
            onChange={(e) => {
              if (e.target.value.length <= 100) applyCompany(e.target.value)
            }}
            onBlur={(e) => applyCompany(e.target.value)}
          />
        </label>

        <div className="pp-personalise-field">
          <span className="pp-personalise-label" id="pp-brand-colour-label">
            Brand colour ({brand.effective})
          </span>
          <div className="pp-personalise-colour-row" role="group" aria-labelledby="pp-brand-colour-label">
            {BRAND_SWATCHES.map(([name, hex]) => (
              <button
                key={hex}
                type="button"
                className="pp-swatch-btn"
                aria-pressed={brand.effective.toLowerCase() === hex.toLowerCase()}
                onClick={() => applyColour(hex)}
              >
                <span className="pp-swatch-dot" style={{ backgroundColor: hex }} aria-hidden="true" />
                <span>{name}</span>
              </button>
            ))}
            <input
              type="color"
              className="pp-color-picker"
              aria-label="Brand colour picker"
              value={brand.effective}
              onChange={(e) => applyColour(e.target.value)}
            />
            <input
              key={s.preferences.brandColor}
              type="text"
              className="pp-hex-input"
              aria-label="Hex colour"
              defaultValue={s.preferences.brandColor}
              placeholder="#173b57"
              spellCheck={false}
              aria-invalid={!!colourError}
              aria-describedby={colourError ? 'pp-colour-error' : undefined}
              onBlur={(e) => applyColour(e.target.value)}
            />
          </div>
        </div>

        <div className="pp-personalise-field">
          <label htmlFor="pp-role-select" className="pp-personalise-label">
            Your role
          </label>
          {s.product === 'platform' ? (
            <select
              id="pp-role-select"
              className="pp-personalise-select"
              value={s.preferences.audience}
              onChange={(e) =>
                s.update({
                  ...s.preferences,
                  audience: e.target.value as AcquisitionAudience,
                })
              }
            >
              {(['cruise', 'agent', 'tour'] as const).map((a) => (
                <option key={a} value={a}>
                  {audienceLabels[a]}
                </option>
              ))}
            </select>
          ) : (
            <div className="pp-personalise-note" id="pp-role-select">
              <strong>Tour operator (Embark)</strong> ·{' '}
              <Link href="/portlink/" onClick={() => s.transfer('platform')} style={{ textDecoration: 'underline' }}>
                Switch to Portlink
              </Link>
            </div>
          )}
        </div>

        <div className="pp-personalise-actions">
          <a
            href={`/start/?product=${s.product}&audience=${s.preferences.audience}`}
            className="pp-cta-btn"
            style={{ minHeight: '42px', padding: '10px 16px', fontSize: '14px' }}
            data-cta={`trial-${s.product}-hero`}
          >
            Start my trial →
          </a>
          <button
            type="button"
            className="pp-personalise-btn"
            onClick={(e) => s.open(topicToOpen, e.currentTarget)}
          >
            Expand {topicToOpen} demo
          </button>
          <button
            type="button"
            className="pp-personalise-reset"
            onClick={() => {
              s.resetPreferences()
              setNameError('')
              setColourError('')
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {(nameError || colourError || !s.storageAvailable) && (
        <div className="pp-personalise-status">
          {nameError && (
            <span id="pp-company-error" className="pp-personalise-error" role="alert">
              {nameError}
            </span>
          )}
          {colourError && (
            <span id="pp-colour-error" className="pp-personalise-error" role="alert">
              {colourError}
            </span>
          )}
          {!s.storageAvailable && (
            <span role="status">
              Preferences stay in this page session only (browser localStorage is unavailable).
            </span>
          )}
        </div>
      )}
    </aside>
  )
}

export function ProductTopicBar({
  topicId,
  title,
  summary,
}: {
  topicId: string
  title: string
  summary: string
}) {
  const s = useProductSession()
  const slug = productSlug(s.product)

  return (
    <div className="pp-topic-bar">
      <div className="pp-topic-bar-info">
        <strong>{title}:</strong>
        <span>{summary}</span>
      </div>
      <div className="pp-topic-bar-actions">
        <Link href={`/${slug}/${topicId}/`} className="pp-topic-link">
          Read about {topicId} →
        </Link>
        <button
          type="button"
          className="pp-topic-modal-btn"
          onClick={(e) => s.open(topicId, e.currentTarget)}
        >
          Explore {topicId} demo
        </button>
      </div>
    </div>
  )
}

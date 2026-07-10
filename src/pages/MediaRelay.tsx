import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft, faCloudArrowUp, faCheck, faCopy, faTrash,
  faXmark, faCircleNotch, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import './MediaRelay.css'

const MAX_MB = 50
const MAX_BYTES = MAX_MB * 1024 * 1024
const UPLOAD_ENDPOINT = '/api/upload'
const HISTORY_KEY = 'nt_media_history'
const HISTORY_LIMIT = 40

type Stage = 'idle' | 'uploading' | 'done'

interface HistoryItem {
  id: string
  name: string
  url: string
  type: string
  size: number
  date: number
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function extOf(name: string, type: string): string {
  const m = String(name || '').toLowerCase().match(/\.[a-z0-9]+$/)
  if (m) return m[0]
  if (/gif/.test(type)) return '.gif'
  if (/png/.test(type)) return '.png'
  if (/jpe?g/.test(type)) return '.jpg'
  if (/webp/.test(type)) return '.webp'
  if (/mp4/.test(type)) return '.mp4'
  if (/webm/.test(type)) return '.webm'
  return ''
}

function kindOf(name: string, type: string): string {
  const e = extOf(name, type).replace('.', '')
  return (e || 'fichier').toUpperCase()
}

function fmtSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' Mo'
  return Math.max(1, Math.round(bytes / 1024)) + ' Ko'
}

function fmtDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
}

async function writeClip(text: string): Promise<void> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return
    }
  } catch {
    // fall through to legacy fallback
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  } catch {
    // clipboard unavailable — nothing more we can do
  }
}

export default function MediaRelay() {
  const [stage, setStage] = useState<Stage>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [mainCopied, setMainCopied] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mainCopyTimer = useRef<number | undefined>(undefined)
  const itemCopyTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const prevTitle = document.title
    document.title = 'Relais Média — Nouvelle Terre'
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed)) setHistory(parsed)
    } catch {
      // corrupted local history — ignore, start fresh
    }
    return () => { document.title = prevTitle }
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const persistHistory = (items: HistoryItem[]) => {
    setHistory(items)
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)) } catch { /* storage full/unavailable */ }
  }

  const openPicker = () => fileInputRef.current?.click()

  const fail = (msg: string) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setStage('idle')
    setFile(null)
    setPreviewUrl(null)
    setUrl(null)
    setProgress(0)
    setError(msg)
  }

  const finish = (uploadedFile: File, serverUrl: string) => {
    const item: HistoryItem = {
      id: makeId(),
      name: uploadedFile.name,
      url: serverUrl,
      type: uploadedFile.type,
      size: uploadedFile.size,
      date: Date.now(),
    }
    persistHistory([item, ...history].slice(0, HISTORY_LIMIT))
    setStage('done')
    setProgress(100)
    setUrl(serverUrl)
  }

  const startUpload = (uploadFile: File) => {
    const form = new FormData()
    form.append('file', uploadFile, uploadFile.name)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', UPLOAD_ENDPOINT)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.min(97, (e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      const status = xhr.status
      if (status >= 200 && status < 300) {
        try {
          const res = JSON.parse(xhr.responseText)
          if (res && res.url) { finish(uploadFile, res.url); return }
        } catch {
          // fall through to generic failure below
        }
        fail('Réponse du serveur invalide.')
        return
      }
      let msg = `Le téléversement a échoué (${status}).`
      try {
        const res = JSON.parse(xhr.responseText)
        if (res && res.error) msg = res.error
      } catch {
        // keep generic message
      }
      fail(msg)
    }
    xhr.onerror = () => fail('Impossible de contacter le serveur. Vérifie ta connexion et réessaie.')
    xhr.send(form)
  }

  const accept = (candidate: File) => {
    const okImage = /^image\//.test(candidate.type)
    const okVideo = /^video\//.test(candidate.type)
    if (!okImage && !okVideo) {
      setError('Format non pris en charge — images ou vidéos uniquement.')
      return
    }
    if (candidate.size > MAX_BYTES) {
      setError(`Fichier trop lourd (max ${MAX_MB} Mo).`)
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(candidate)
    setPreviewUrl(URL.createObjectURL(candidate))
    setStage('uploading')
    setProgress(0)
    setUrl(null)
    setError(null)
    setMainCopied(false)
    startUpload(candidate)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked) accept(picked)
    e.target.value = ''
  }
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) accept(dropped)
  }
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!dragOver) setDragOver(true)
  }
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }
  const onDropzoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker() }
  }

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setStage('idle')
    setFile(null)
    setPreviewUrl(null)
    setUrl(null)
    setProgress(0)
    setError(null)
    setMainCopied(false)
  }

  const copyMain = () => {
    if (!url) return
    writeClip(url)
    setMainCopied(true)
    window.clearTimeout(mainCopyTimer.current)
    mainCopyTimer.current = window.setTimeout(() => setMainCopied(false), 1700)
  }

  const copyItem = (item: HistoryItem) => {
    writeClip(item.url)
    setCopiedId(item.id)
    window.clearTimeout(itemCopyTimer.current)
    itemCopyTimer.current = window.setTimeout(() => setCopiedId(null), 1700)
  }

  const deleteHistory = (id: string) => {
    persistHistory(history.filter((h) => h.id !== id))
  }

  const isImage = file ? /^image\//.test(file.type) : false
  const isVideo = file ? /^video\//.test(file.type) : false

  return (
    <div className="relay">
      <div className="container relay-inner">
        <a href="/" className="relay-back">
          <FontAwesomeIcon icon={faArrowLeft} />
          Retour à l'accueil
        </a>

        <header className="relay-header">
          <div className="relay-eyebrow">
            <span className="relay-dot" />
            Nouvelle Terre · Relais WATERFrAMES
          </div>
          <h1 className="relay-title">Grave un média dans les archives.</h1>
          <p className="relay-sub">
            Dépose une image ou une vidéo. Tu reçois un lien direct et permanent, prêt à
            sceller dans tes Cadres et Projecteurs WATERFrAMES.
          </p>
        </header>

        <div className="relay-card">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={onInputChange}
            className="relay-file-input"
          />

          {stage === 'idle' && (
            <div
              className={`dropzone ${dragOver ? 'dropzone--drag' : ''}`}
              onClick={openPicker}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              role="button"
              tabIndex={0}
              onKeyDown={onDropzoneKeyDown}
              aria-label="Choisir un fichier à téléverser"
            >
              <div className="dropzone-icon">
                <FontAwesomeIcon icon={faCloudArrowUp} />
              </div>
              <div className="dropzone-title">Glisse un fichier ici</div>
              <div className="dropzone-sub">ou clique pour parcourir tes fichiers</div>
              <div className="dropzone-meta">PNG · JPG · GIF · WEBP · MP4 · WEBM — {MAX_MB} Mo max</div>
            </div>
          )}

          {stage !== 'idle' && file && (
            <div className="relay-file">
              <div className="relay-preview">
                {isImage && previewUrl && <img src={previewUrl} alt="aperçu" />}
                {isVideo && previewUrl && <video src={previewUrl} controls muted loop />}
              </div>

              <div className="relay-file-row">
                <span className="relay-badge">{kindOf(file.name, file.type)}</span>
                <span className="relay-file-name">{file.name}</span>
                <span className="relay-file-size">{fmtSize(file.size)}</span>
              </div>

              {stage === 'uploading' && (
                <div className="relay-progress">
                  <div className="relay-progress-head">
                    <span className="relay-progress-label">
                      <FontAwesomeIcon icon={faCircleNotch} spin />
                      Gravure en cours…
                    </span>
                    <span className="relay-progress-pct">{Math.round(progress)}%</span>
                  </div>
                  <div className="relay-progress-track">
                    <div className="relay-progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {stage === 'done' && url && (
                <div className="relay-done">
                  <div className="relay-done-head">
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Ton lien est prêt et permanent.</span>
                  </div>
                  <div className="relay-url-row">
                    <input
                      readOnly
                      value={url}
                      className="relay-url-input"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <button className="btn btn-primary relay-copy-btn" onClick={copyMain}>
                      {mainCopied ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCopy} />}
                      {mainCopied ? 'Copié' : 'Copier le lien'}
                    </button>
                  </div>
                  <div className="relay-done-actions">
                    <button className="btn btn-outline" onClick={() => setShowHelp(true)}>
                      Coller dans un Cadre →
                    </button>
                    <button className="relay-link-btn" onClick={reset}>Nouveau fichier</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="relay-error">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              {error}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <section className="relay-history">
            <div className="relay-history-head">
              <h2>Tes archives</h2>
              <span>Enregistrées sur cet appareil</span>
            </div>
            <div className="relay-history-list">
              {history.map((h) => (
                <div key={h.id} className="relay-history-item">
                  <span className="relay-badge relay-badge--sm">{kindOf(h.name, h.type)}</span>
                  <div className="relay-history-info">
                    <div className="relay-history-name">{h.name}</div>
                    <div className="relay-history-url">{h.url}</div>
                  </div>
                  <span className="relay-history-date">{fmtDate(h.date)}</span>
                  <button
                    className="relay-icon-btn"
                    title="Copier le lien"
                    onClick={() => copyItem(h)}
                  >
                    <FontAwesomeIcon icon={copiedId === h.id ? faCheck : faCopy} />
                  </button>
                  <button
                    className="relay-icon-btn relay-icon-btn--danger"
                    title="Retirer"
                    onClick={() => deleteHistory(h.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="relay-footer">
          <span>Nouvelle Terre · Relais WATERFrAMES</span>
          <span>Liens directs pour Cadres &amp; Projecteurs</span>
        </footer>
      </div>

      {showHelp && (
        <div className="relay-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="relay-modal" onClick={(e) => e.stopPropagation()}>
            <div className="relay-modal-head">
              <h3>Sceller le lien dans WATERFrAMES</h3>
              <button className="relay-icon-btn" onClick={() => setShowHelp(false)} aria-label="Fermer">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <p className="relay-modal-intro">
              Une fois le lien copié, retourne en jeu sur Nouvelle Terre.
            </p>
            <ol className="relay-modal-steps">
              <li>
                <span className="relay-step-num">1</span>
                <span>Place un <strong>Cadre</strong> ou un <strong>Projecteur</strong>, puis fais un clic droit dessus pour ouvrir son interface.</span>
              </li>
              <li>
                <span className="relay-step-num">2</span>
                <span>Colle le lien dans le champ <strong>URL</strong> du panneau.</span>
              </li>
              <li>
                <span className="relay-step-num">3</span>
                <span>Valide — ton média apparaît, gravé dans le monde. Ajuste rotation, luminosité et transparence à ta guise.</span>
              </li>
            </ol>
            <button className="btn btn-primary relay-modal-close" onClick={() => setShowHelp(false)}>
              C'est compris
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

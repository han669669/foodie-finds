import { useEffect, useRef, useState } from 'react'

const DISMISS_KEY = 'pwa_prompt_dismissed_at'
const DISMISS_COOLDOWN_DAYS = 7

function daysSince(ts) {
  if (!ts) return Infinity
  const diff = Date.now() - Number(ts)
  return diff / (1000 * 60 * 60 * 24)
}

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  const mq = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  const navStandalone = window.navigator && window.navigator.standalone
  return Boolean(mq || navStandalone)
}

export default function useA2HS() {
  const deferred = useRef(null)
  const [canInstall, setCanInstall] = useState(false)
  const [installed, setInstalled] = useState(isStandalone())
  const [ios, setIos] = useState(isIOS())

  // Track beforeinstallprompt for Android/Chrome
  useEffect(() => {
    function onBIP(e) {
      e.preventDefault()
      deferred.current = e
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', onBIP)
    return () => window.removeEventListener('beforeinstallprompt', onBIP)
  }, [])

  // Track appinstalled
  useEffect(() => {
    function onInstalled() {
      setInstalled(true)
      setCanInstall(false)
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [])

  // Frequency capping check
  const lastDismissed = typeof localStorage !== 'undefined' ? localStorage.getItem(DISMISS_KEY) : null
  const canReshow = daysSince(lastDismissed) >= DISMISS_COOLDOWN_DAYS

  async function promptInstall() {
    if (!deferred.current) return { outcome: 'unavailable' }
    deferred.current.prompt()
    const choice = await deferred.current.userChoice
    if (choice?.outcome === 'accepted') {
      setInstalled(true)
      setCanInstall(false)
    }
    return choice
  }

  function dismissPrompt() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {}
    setCanInstall(false)
  }

  return {
    canInstall: canInstall && !installed && canReshow,
    promptInstall,
    dismissPrompt,
    installed,
    isIOS: ios,
  }
}

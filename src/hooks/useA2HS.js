import { useEffect, useRef, useState } from 'react'

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
    setCanInstall(false)
  }

  return {
    canInstall: canInstall && !installed,
    promptInstall,
    dismissPrompt,
    installed,
    isIOS: ios,
  }
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import useA2HS from '../hooks/useA2HS'

function platform() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  return 'other'
}

export default function PWAInstallPrompt({ currentView }) {
  const { canInstall, promptInstall, dismissPrompt, installed, isIOS } = useA2HS()
  const [visible, setVisible] = useState(false)
  const [postInstall, setPostInstall] = useState(false)
  const isAndroidPlatform = useMemo(() => platform() === 'android', [])
  const prevInstalled = useRef(installed)

  // Show immediately on the results view (no 45s delay)
  useEffect(() => {
    if (installed) {
      setVisible(false)
      return
    }
    if (currentView === 'results' && (canInstall || isIOS)) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [currentView, canInstall, installed, isIOS])

  // Android: show a one-time toast right after installation completes
  useEffect(() => {
    if (!prevInstalled.current && installed && isAndroidPlatform) {
      setPostInstall(true)
      const t = setTimeout(() => setPostInstall(false), 10000)
      return () => clearTimeout(t)
    }
    prevInstalled.current = installed
  }, [installed, isAndroidPlatform])

  if (!visible && !postInstall) return null

  const onInstall = async () => {
    const choice = await promptInstall()
    if (!choice || choice.outcome !== 'accepted') {
      // Keep prompt available; let user try again later
    } else {
      setVisible(false)
    }
  }

  const onDismiss = () => {
    dismissPrompt()
    setVisible(false)
  }

  // iOS manual guidance
  if (isIOS && !installed) {
    return (
      <div className="fixed inset-x-0 bottom-3 px-4 z-50">
        <div className="mx-auto max-w-md rounded-2xl border border-pink-200 bg-white/95 backdrop-blur shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-3">
            <p className="font-semibold text-sm">Add imHungryAF to your Home Screen</p>
            <p className="text-xs opacity-90 mt-0.5">1-tap access, faster start, offline-friendly</p>
          </div>
          <div className="px-4 py-3 text-sm text-gray-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Tap <span className="font-medium">Share</span> <i className="fa-solid fa-arrow-up-from-bracket ml-1"></i></li>
              <li>Select <span className="font-medium">Add to Home Screen</span></li>
              <li>Confirm <span className="font-medium">imHungryAF</span></li>
            </ol>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
            <button onClick={onDismiss} className="text-gray-500 hover:text-gray-700 text-sm">Not now</button>
            <div className="text-[11px] text-gray-400">{platform()==='ios' ? 'iOS Safari' : 'Your browser'}</div>
          </div>
        </div>
      </div>
    )
  }

  // Android/Chrome native prompt via beforeinstallprompt
  if (canInstall && !installed) {
    return (
      <div className="fixed inset-x-0 bottom-3 px-4 z-50">
        <div className="mx-auto max-w-md rounded-2xl border border-pink-200 bg-white/95 backdrop-blur shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-3">
            <p className="font-semibold text-sm">Install imHungryAF</p>
            <p className="text-xs opacity-90 mt-0.5">Quick access from your Home Screen</p>
          </div>
          <div className="px-4 py-3 text-sm text-gray-700">
            <ul className="list-disc list-inside space-y-1">
              <li>Launches faster than a tab</li>
              <li>Works offline for last seen content</li>
              <li>Feels like a native app</li>
            </ul>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
            <button onClick={onDismiss} className="text-gray-500 hover:text-gray-700 text-sm">Not now</button>
            <button onClick={onInstall} className="icon-text bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-md transition-all">
              <i className="fa-solid fa-plus"></i> Add to home screen
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Android post-install toast
  if (postInstall && isAndroidPlatform) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[env(safe-area-inset-bottom)]" role="status" aria-live="polite">
        <div className="mx-auto max-w-md rounded-xl bg-gray-900 text-white shadow-2xl ring-1 ring-black/10">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-green-500 text-white flex items-center justify-center shadow">
              <span className="text-lg font-bold">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold leading-6">imHungryAF installed</p>
              <p className="mt-0.5 text-sm leading-5 text-gray-200">Find it in your app drawer.</p>
            </div>
            <button
              onClick={() => setPostInstall(false)}
              className="ml-2 inline-flex items-center rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-0"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

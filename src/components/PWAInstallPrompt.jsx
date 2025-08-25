import React, { useEffect, useMemo, useState } from 'react'
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

  // Timing/engagement heuristics: show on results view or after 45s engaged time
  useEffect(() => {
    if (installed) return setVisible(false)
    if (currentView === 'results' && (canInstall || isIOS)) {
      setVisible(true)
      return
    }
    const t = setTimeout(() => {
      if (canInstall || isIOS) setVisible(true)
    }, 45000)
    return () => clearTimeout(t)
  }, [currentView, canInstall, installed, isIOS])

  if (!visible) return null

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

  return null
}

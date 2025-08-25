import React, { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Optional: check periodically for updates
      r && setInterval(() => r.update(), 60 * 60 * 1000)
    },
    onRegisterError(error) {
      // eslint-disable-next-line no-console
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  // Auto-dismiss the non-critical "offline ready" notice after a short delay
  useEffect(() => {
    if (offlineReady && !needRefresh) {
      const t = setTimeout(() => setOfflineReady(false), 2800)
      return () => clearTimeout(t)
    }
  }, [offlineReady, needRefresh, setOfflineReady])

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed inset-x-0 bottom-3 px-4 z-[60]">
      {offlineReady && !needRefresh ? (
        // Subtle, self-dismissing snackbar
        <div className="mx-auto max-w-fit rounded-full bg-gray-900/85 text-white text-xs px-3 py-1.5 shadow-md animate-fade-in-out">
          Ready to work offline
        </div>
      ) : null}

      {needRefresh ? (
        <div className="mx-auto max-w-md rounded-2xl border border-pink-200 bg-white/95 backdrop-blur shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-3">
            <p className="font-semibold text-sm">New content available</p>
            <p className="text-xs opacity-90 mt-0.5">Reload to update to the latest version.</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
            <button onClick={close} className="text-gray-500 hover:text-gray-700 text-sm">Close</button>
            <button onClick={() => updateServiceWorker(true)} className="icon-text bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-md transition-all">
              <i className="fa-solid fa-rotate"></i> Reload
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

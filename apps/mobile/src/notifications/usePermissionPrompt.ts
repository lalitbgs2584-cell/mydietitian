import { useEffect, useState } from 'react'
import { usePrefsStore } from '@/store/prefs.store'
export function usePermissionPrompt(): { visible: boolean; close: () => void } {
  const [visible, setVisible] = useState(false)
  const prompt = usePrefsStore((state) => state.notificationPrompt)
  useEffect(() => {
    const now = Date.now()
    if (!prompt.outcome && (!prompt.deferredUntil || prompt.deferredUntil <= now)) setVisible(true)
  }, [prompt])
  return { visible, close: () => setVisible(false) }
}

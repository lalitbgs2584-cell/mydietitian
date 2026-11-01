import { Screen } from '@/components/ui/Screen'
import { HomeDashboard } from '@/components/home/HomeDashboard'
import { usePermissionPrompt } from '@/notifications/usePermissionPrompt'
import { NotificationPrePrompt } from '@/components/auth/NotificationPrePrompt'

export default function HomeScreen() {
  const notificationPrompt = usePermissionPrompt()
  return (
    <Screen edges={['left', 'right']}>
      <HomeDashboard />
      <NotificationPrePrompt visible={notificationPrompt.visible} onClose={notificationPrompt.close} />
    </Screen>
  )
}

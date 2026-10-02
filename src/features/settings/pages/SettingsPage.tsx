import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { ProfileForm } from '@/features/settings/components/ProfileForm'
import { SecurityForm } from '@/features/settings/components/SecurityForm'
import { NotificationsForm } from '@/features/settings/components/NotificationsForm'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Manage your profile, security and notifications." />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-5 font-semibold leading-none tracking-tight">Profile</h2>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-5 font-semibold leading-none tracking-tight">Security</h2>
              <SecurityForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-5 font-semibold leading-none tracking-tight">Notifications</h2>
              <NotificationsForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Outlet } from 'react-router'
import { BottomNav } from '../shared/ui/BottomNav'

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

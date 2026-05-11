import { createBrowserRouter } from 'react-router'
import { RootLayout } from './RootLayout'
import { OnboardingGate } from './OnboardingGate'
import { HomePage } from '../pages/HomePage'
import { HistoryPage } from '../pages/HistoryPage'
import { SettingsPage } from '../pages/SettingsPage'
import { OnboardingPage } from '../pages/OnboardingPage'

export const router = createBrowserRouter([
  { path: '/onboarding', element: <OnboardingPage /> },
  {
    path: '/',
    element: (
      <OnboardingGate>
        <RootLayout />
      </OnboardingGate>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

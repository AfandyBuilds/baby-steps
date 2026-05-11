import { NavLink } from 'react-router'

function Icon({ path }: { path: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

const items = [
  {
    to: '/',
    label: 'Home',
    end: true,
    icon: 'M3 12 12 3l9 9M5 10v10h14V10',
  },
  {
    to: '/history',
    label: 'History',
    end: false,
    icon: 'M12 8v4l3 2M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z',
  },
  {
    to: '/settings',
    label: 'Settings',
    end: false,
    icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4 0a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/90 backdrop-blur">
      <div className="max-w-md mx-auto grid grid-cols-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon path={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

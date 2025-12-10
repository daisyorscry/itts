import { HiInformationCircle, HiExclamationTriangle, HiCheckCircle, HiXCircle } from 'react-icons/hi2'

type CalloutType = 'info' | 'warning' | 'success' | 'error'

interface CalloutProps {
  type?: CalloutType
  children: React.ReactNode
}

const styles = {
  info: {
    container: 'border-blue-500/30 bg-blue-500/5',
    icon: <HiInformationCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  },
  warning: {
    container: 'border-yellow-500/30 bg-yellow-500/5',
    icon: <HiExclamationTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
  },
  success: {
    container: 'border-green-500/30 bg-green-500/5',
    icon: <HiCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
  },
  error: {
    container: 'border-red-500/30 bg-red-500/5',
    icon: <HiXCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
  },
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const style = styles[type]

  return (
    <div className={`my-6 flex gap-4 rounded-xl border p-4 ${style.container}`}>
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1 text-sm leading-relaxed [&>p]:m-0">{children}</div>
    </div>
  )
}

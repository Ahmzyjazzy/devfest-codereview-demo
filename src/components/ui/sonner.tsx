import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-xl! border-0! bg-surface! text-gray-900! shadow-none! ring-1! ring-hairline/[0.06]!',
          description: 'text-gray-500!',
          actionButton: 'rounded-full! bg-primary! text-white!',
          cancelButton: 'rounded-full! bg-gray-100! text-gray-600!',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

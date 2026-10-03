import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type ButtonHTMLAttributes } from 'react'

function cn(...entradas: ClassValue[]) {
  return twMerge(clsx(entradas))
}

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium uppercase tracking-[0.14em] transition-opacity disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-ink',
  {
    variants: {
      variant: {
        default: 'bg-ink text-paper',
        outline: 'border border-ink bg-transparent text-ink',
        ghost: 'bg-transparent text-ink underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 px-3',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

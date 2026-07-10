import { cva, type VariantProps } from 'class-variance-authority'
import { Ref } from 'react'
import { cn } from 'ui'

const sectionContainerVariants = cva('section-container relative', {
  variants: {
    height: {
      normal: 'py-16 md:py-18 lg:py-24',
      none: '',
    },
    spacing: {
      none: '',
      sections: 'space-y-8 md:space-y-16',
    },
  },
  defaultVariants: {
    height: 'normal',
    spacing: 'none',
  },
})

interface Props extends VariantProps<typeof sectionContainerVariants> {
  children: React.ReactNode
  className?: string
  id?: string
  ref?: Ref<HTMLDivElement>
}

const SectionContainer = ({ children, className, id, ref, height, spacing }: Props) => (
  <div
    ref={ref}
    id={id}
    className={cn(sectionContainerVariants({ height, spacing }), className)}
  >
    {children}
  </div>
)

export default SectionContainer

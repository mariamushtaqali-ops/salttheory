'use client'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: number
  showName?: boolean
  showTagline?: boolean
  href?: string
}

export default function Logo({
  size = 40,
  showName = true,
  showTagline = false,
  href = '/',
}: LogoProps) {
  return (
    <Link href={href} className="flex items-center gap-2.5 no-underline">
      <Image
        src="/logo.png"
        alt="Salt Theory"
        width={size}
        height={size}
        className="rounded-full object-contain"
        priority
      />
      {showName && (
        <div className="flex flex-col leading-none">
          <span className="font-serif text-[18px] text-ink">Salt Theory</span>
          {showTagline && (
            <span className="text-[9px] tracking-[0.15em] uppercase text-muted mt-0.5">
              Create · Sell · Grow
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

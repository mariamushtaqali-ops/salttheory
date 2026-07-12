// AppShell — simple content wrapper now that TopNav handles navigation globally
export default function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode
  userEmail?: string
}) {
  return (
    <main className="max-w-[860px] mx-auto px-5 pt-[84px] pb-10 md:px-8 md:pt-[92px]">
      {children}
    </main>
  )
}

// AppShell — simple content wrapper now that TopNav handles navigation globally
export default function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode
  userEmail?: string
}) {
  return (
    <main className="max-w-[860px] mx-auto px-5 py-6 md:px-8 md:py-8 pb-10">
      {children}
    </main>
  )
}

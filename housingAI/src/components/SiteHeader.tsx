import Link from 'next/link'

export default function SiteHeader() {
    return (
        <header className="flex items-center justify-between p-4 border-b bg-card z-50 shadow-sm relative shrink-0">
            <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-primary">Housing<span className="text-foreground">AI</span></span>
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium">
                <Link href="/" className="hover:text-primary transition-colors">Map Search</Link>
                <Link href="/dashboard" className="hover:text-primary transition-colors">Intelligence</Link>
                <Link href="/matchmaker" className="hover:text-primary transition-colors">Matchmaker</Link>
                <Link href="/lease-analyzer" className="hover:text-primary transition-colors">Analyze Lease</Link>
                <Link href="/sign-in" className="hover:text-primary transition-colors font-bold pl-4 border-l">Sign In</Link>
            </nav>
        </header>
    )
}

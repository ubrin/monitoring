'use client';

import { LayoutDashboard, Users, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ip-liar', label: 'IP Liar', icon: ShieldAlert },
];

const NavLinks = () => {
    const pathname = usePathname();
    return (
        <nav className="flex flex-col gap-2">
            {navLinks.map(link => (
                 <Button 
                    key={link.href}
                    variant={pathname === link.href ? 'default' : 'ghost'} 
                    className="justify-start gap-3" 
                    asChild
                >
                    <Link href={link.href}>
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                    </Link>
                </Button>
            ))}
        </nav>
    );
};

const Sidebar = () => {
    return (
        <>
            {/* Mobile Sidebar */}
            <div className="lg:hidden p-4 fixed top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-4 flex flex-col">
                         <div className="flex items-center gap-2 mb-8">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="p-2 bg-primary rounded-lg">
                                    <ShieldAlert className="text-primary-foreground" />
                                </div>
                                <h1 className="text-2xl font-headline font-bold text-foreground">TikWatch</h1>
                            </Link>
                        </div>
                        <NavLinks />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border p-4 space-y-8">
                <div className="flex items-center gap-2">
                     <Link href="/" className="flex items-center gap-2">
                        <div className="p-2 bg-primary rounded-lg">
                            <ShieldAlert className="text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-headline font-bold text-foreground">TikWatch</h1>
                    </Link>
                </div>
                <NavLinks />
            </aside>
        </>
    );
};

export default Sidebar;

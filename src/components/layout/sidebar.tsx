'use client';

import { Bot, LayoutDashboard, Users, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const NavLinks = () => (
    <nav className="flex flex-col gap-2">
        <Button variant="default" className="justify-start gap-3" asChild>
            <a href="#">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
            </a>
        </Button>
        <Button variant="ghost" className="justify-start gap-3" asChild>
             <a href="#">
                <Users className="h-5 w-5" />
                <span>Customers</span>
            </a>
        </Button>
         <Button variant="ghost" className="justify-start gap-3" asChild>
             <a href="#">
                <Bot className="h-5 w-5" />
                <span>Predictions</span>
            </a>
        </Button>
    </nav>
);

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
                            <div className="p-2 bg-primary rounded-lg">
                                <Wifi className="text-primary-foreground" />
                            </div>
                            <h1 className="text-2xl font-headline font-bold text-foreground">TikWatch</h1>
                        </div>
                        <NavLinks />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border p-4 space-y-8">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary rounded-lg">
                        <Wifi className="text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-headline font-bold text-foreground">TikWatch</h1>
                </div>
                <NavLinks />
            </aside>
        </>
    );
};

export default Sidebar;

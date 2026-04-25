import { Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Home, Library, MessageCircle, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function Layout() {
  const { userProfile, signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/courses', icon: Library },
    { name: 'AI Tutor', href: '/chat', icon: MessageCircle },
  ];

  const handleLanguageChange = async (lang: 'English' | 'Sheng' | 'Swahili') => {
    if (!userProfile) return;
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        languagePreference: lang
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users');
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      {/* Navigation Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-bold tracking-tight text-primary">UMILE</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Education Simplified</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link key={item.name} to={item.href}>
                <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-secondary text-primary font-medium' : 'text-muted-foreground hover:bg-muted font-medium'}`}>
                  <item.icon size={20} />
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="bg-gradient-to-br from-primary to-[#0044BB] p-4 rounded-2xl text-white">
            <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Learning Streak</p>
            <div className="flex items-end mt-2">
              <span className="text-3xl font-bold">{userProfile?.currentStreak || 0}</span>
              <span className="ml-1 text-sm pb-1">Days 🔥</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-background">
        {/* Top Header */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-10">
          <div className="flex items-center space-x-6">
             {/* Left side, search could go here */}
          </div>
          <div className="flex items-center space-x-4">
             <Dialog>
                <DialogTrigger render={
                  <button className="flex bg-muted p-1 rounded-lg text-[11px] font-bold cursor-pointer hover:bg-muted/80 transition-colors border-none outline-none">
                     <span className="px-3 py-1.5 bg-card shadow-sm rounded text-primary block">{userProfile?.languagePreference}</span>
                     <span className="px-3 py-1.5 text-muted-foreground hidden sm:inline-block">Change Language</span>
                  </button>
                } />
                <DialogContent className="sm:max-w-md rounded-[24px]">
                  <DialogHeader>
                    <DialogTitle>Select Language</DialogTitle>
                    <DialogDescription>
                      Choose how the AI Tutor communicates with you.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-2 mt-4">
                    {['English', 'Sheng', 'Swahili'].map((lang) => (
                      <Button 
                        key={lang} 
                        variant={userProfile?.languagePreference === lang ? 'default' : 'outline'}
                        onClick={() => handleLanguageChange(lang as any)}
                        className="rounded-full"
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
             </Dialog>

             <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground relative group">
                <Avatar className="h-10 w-10 border-2 border-card shadow-sm cursor-pointer group-hover:opacity-80 transition-opacity">
                  <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile?.uid}`} />
                  <AvatarFallback>{userProfile?.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
             </Button>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-10 flex flex-col flex-1 overflow-y-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
}

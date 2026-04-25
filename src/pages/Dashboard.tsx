import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Flame, Target, Award, BookOpen } from 'lucide-react';
import { useTranslation } from '../lib/translations';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const t = useTranslation();

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.jambo}, {userProfile?.displayName.split(' ')[0]}! 👋</h2>
          <p className="text-muted-foreground mt-1">{t.readyToExplore}</p>
        </div>
        <div className="text-sm text-muted-foreground hidden sm:block">
          {t.cloudStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-card rounded-[24px] p-8 border border-border shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[340px]">
          <div className="relative z-10">
            <span className="px-3 py-1 bg-[#FFF7ED] text-[#EA580C] text-[10px] font-bold uppercase rounded-full">{t.featuredTopic}</span>
            <h3 className="text-3xl font-bold mt-4 max-w-md">{t.historyPhilosophy}</h3>
            <p className="text-muted-foreground mt-2 max-w-sm leading-relaxed">{t.discoverIdeas}</p>
            <button className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center w-fit">
              {t.chatWithAI}
              <BookOpen className="w-4 h-4 ml-2" />
            </button>
          </div>
          {/* Abstract Graphic Overlay */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-center justify-center opacity-5 pointer-events-none">
            <Target className="w-64 h-64 text-primary" />
          </div>
        </div>

        {/* AI Recommendations Side Card */}
        <div className="bg-card rounded-[24px] p-6 border border-border shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-foreground">{t.vertexSuggested}</span>
          </div>
          <div className="space-y-4 flex-1 overflow-hidden mt-4">
            <div className="group cursor-pointer">
              <p className="text-[11px] text-purple-500 font-bold uppercase mb-1">{t.history}</p>
              <h4 className="font-bold text-sm">{t.renaissance}</h4>
              <div className="w-full bg-muted h-1 mt-2 rounded-full">
                <div className="bg-purple-400 w-1/3 h-1 rounded-full"></div>
              </div>
            </div>
            <div className="group cursor-pointer opacity-60">
              <p className="text-[11px] text-blue-500 font-bold uppercase mb-1">{t.economics}</p>
              <h4 className="font-bold text-sm">{t.macro101}</h4>
              <div className="w-full bg-muted h-1 mt-2 rounded-full"></div>
            </div>
            <div className="group cursor-pointer opacity-60">
              <p className="text-[11px] text-green-500 font-bold uppercase mb-1">{t.science}</p>
              <h4 className="font-bold text-sm">{t.crispr}</h4>
              <div className="w-full bg-muted h-1 mt-2 rounded-full"></div>
            </div>
          </div>
          <button className="mt-4 text-xs font-bold text-muted-foreground border-t border-border pt-4 text-center hover:text-primary transition-colors">{t.viewAllPaths}</button>
        </div>
      </div>

      {/* Footer Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-5 rounded-2xl border border-border flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary font-bold">1</div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t.language}</p>
            <p className="text-sm font-bold truncate max-w-[100px]">{userProfile?.languagePreference}</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 font-bold">0</div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t.badges}</p>
            <p className="text-sm font-bold">{t.knowledgeKing}</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-bold">0</div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">{t.inProgress}</p>
            <p className="text-sm font-bold">{t.activeUnits}</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border flex items-center justify-center space-x-4 group cursor-pointer hover:bg-muted/50 transition-colors shadow-sm">
           <p className="text-sm font-bold text-primary">{t.accessMaterials}</p>
           <Target className="w-4 h-4 text-primary" />
        </div>
      </div>
    </div>
  );
}

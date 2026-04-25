import { useParams, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();

  // Mock modules
  const modules = [
     { id: '1', title: 'Introduction & Basics' },
     { id: '2', title: 'Deep dive into the core concepts' },
     { id: '3', title: 'Historical perspectives' },
     { id: '4', title: 'Modern Applications' }
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
         <Link to="/courses" className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm mb-4">
            <ArrowLeft className="mr-2" size={16} /> Back to Courses
         </Link>
        <h2 className="text-2xl font-bold text-foreground">Course Overview</h2>
        <p className="text-muted-foreground mt-1">Mastering the concepts one module at a time.</p>
      </header>
      
      <div className="grid gap-4 max-w-3xl border-t border-border pt-6">
         {modules.map((mod, index) => (
             <div key={mod.id} className="rounded-2xl border border-border shadow-sm overflow-hidden flex flex-row items-center bg-card">
                <div className="p-6 bg-muted/50 border-r border-border/50 flex flex-col items-center justify-center min-w-24">
                   <span className="text-sm font-semibold uppercase text-muted-foreground">Module</span>
                   <span className="text-3xl font-light">{index + 1}</span>
                </div>
                <CardHeader className="flex-1 py-6">
                   <CardTitle className="text-xl font-medium">{mod.title}</CardTitle>
                </CardHeader>
                <div className="p-6">
                   <Button variant="outline" className="rounded-full">Start</Button>
                </div>
             </div>
         ))}
      </div>
    </div>
  );
}

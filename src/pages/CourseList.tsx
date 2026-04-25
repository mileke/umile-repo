import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, query, where, or } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { generateCourse } from '../services/aiService';
import { Loader2 } from 'lucide-react';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isPublished: boolean;
  creatorId: string;
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [depth, setDepth] = useState<'Summary' | 'Deep Dive'>('Summary');
  const [open, setOpen] = useState(false);

  const fetchCourses = async () => {
    try {
      if (!user) return;
      const q = query(
        collection(db, 'courses'), 
        or(
          where('isPublished', '==', true),
          where('creatorId', '==', user.uid)
        )
      );
      const querySnapshot = await getDocs(q);
      const fetchedCourses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
      setCourses(fetchedCourses);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleCreateCourse = async () => {
    if (!topic || !userProfile || !user) return;
    setGenerating(true);
    try {
      const courseId = await generateCourse(topic, difficulty, depth, user.uid, userProfile.languagePreference);
      setOpen(false);
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to generate course');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between mb-2 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Explore Courses</h2>
          <p className="text-muted-foreground mt-1">Ready to dive deeper into new topics?</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-all flex items-center border-none shadow-sm cursor-pointer whitespace-nowrap">
               Build New Course
            </button>
          } />
          <DialogContent className="sm:max-w-md rounded-3xl">
             <DialogHeader>
               <DialogTitle>AI Course Builder</DialogTitle>
               <DialogDescription>
                 Let Otieno build a custom course on any topic for you.
               </DialogDescription>
             </DialogHeader>
             <div className="flex flex-col gap-4 mt-4">
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium">Topic</label>
                 <input 
                   type="text" 
                   value={topic}
                   onChange={(e) => setTopic(e.target.value)}
                   placeholder="e.g. World War II, Quantum Physics, History of Music"
                   className="px-4 py-2 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary h-12"
                 />
               </div>
               
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium">Difficulty</label>
                 <div className="flex gap-2">
                   {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                     <Button 
                       key={d}
                       variant={difficulty === d ? 'default' : 'outline'}
                       onClick={() => setDifficulty(d as any)}
                       className="rounded-full flex-1"
                     >
                       {d}
                     </Button>
                   ))}
                 </div>
               </div>

               <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium">Depth</label>
                 <div className="flex gap-2">
                   {['Summary', 'Deep Dive'].map(d => (
                     <Button 
                       key={d}
                       variant={depth === d ? 'default' : 'outline'}
                       onClick={() => setDepth(d as any)}
                       className="rounded-full flex-1"
                     >
                       {d}
                     </Button>
                   ))}
                 </div>
               </div>
               
               <Button 
                 onClick={handleCreateCourse} 
                 disabled={generating || !topic.trim()}
                 className="w-full rounded-full h-12 mt-4 text-base font-semibold"
               >
                 {generating ? (
                   <><Loader2 className="mr-2 animate-spin h-5 w-5" /> Building...</>
                 ) : (
                   'Generate Course'
                 )}
               </Button>
             </div>
          </DialogContent>
        </Dialog>
      </header>
      
      {loading ? (
        <div className="flex items-center justify-center p-12">
           <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.length === 0 && (
            <div className="col-span-2 text-center text-muted-foreground p-8 bg-card rounded-3xl border border-border shadow-sm">
              No courses found. Build your first one!
            </div>
          )}
          {courses.map(course => (
            <Card key={course.id} className="rounded-[24px] shadow-sm border-border group flex flex-col justify-between overflow-hidden bg-card">
               <CardHeader className="pb-4">
                 <div className="flex justify-between items-start mb-4 gap-2">
                   <Badge variant="secondary" className="rounded-full px-3">{course.category}</Badge>
                   <span className="text-sm text-muted-foreground whitespace-nowrap">{course.difficulty}</span>
                 </div>
                 <CardTitle className="text-2xl leading-tight group-hover:text-primary transition-colors">
                    {course.title}
                 </CardTitle>
                 <CardDescription className="mt-4 text-base line-clamp-2">
                    {course.description}
                 </CardDescription>
               </CardHeader>
               <CardContent className="pt-0 relative mt-auto">
                 <Link to={`/courses/${course.id}`} className="mt-4 inline-block w-full">
                   <Button className="w-full rounded-full h-11" variant="outline">View Modules</Button>
                 </Link>
               </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

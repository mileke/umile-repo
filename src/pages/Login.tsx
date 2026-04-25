import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Login() {
  const { user, signInWithGoogle } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen grid items-center justify-center p-4">
      <Card className="w-full max-w-sm rounded-[24px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Umile</CardTitle>
          <CardDescription>
            Learn any complex topic across languages.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={signInWithGoogle} className="w-full rounded-full">
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 bg-background overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-50/50 dark:bg-blue-900/10 blur-3xl opacity-50" />
      </div>
    </div>
  );
}

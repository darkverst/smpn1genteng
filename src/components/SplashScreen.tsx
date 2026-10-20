import { GraduationCap, Database } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
      <div className="flex flex-col items-center gap-5 animate-pulse">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm shadow-2xl">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Portal Sekolah</h1>
          <p className="mt-1 text-sm text-primary-100">Website Resmi</p>
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs text-primary-100">
        <Database className="h-3.5 w-3.5 animate-bounce" />
        Menghubungkan database...
      </div>
    </div>
  );
}

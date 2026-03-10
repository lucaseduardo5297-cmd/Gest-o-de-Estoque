import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF9] p-4 text-center">
      <h2 className="text-4xl font-black text-[#5D3D4C] mb-4">404</h2>
      <p className="text-[#C5B49E] font-medium mb-8">Oops! Página não encontrada.</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-[#5D3D4C] text-white rounded-2xl font-bold hover:bg-[#5D3D4C]/90 transition-all shadow-lg shadow-[#5D3D4C]/20"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}

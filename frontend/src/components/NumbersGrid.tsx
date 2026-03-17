'use client';

interface NumbersGridProps {
  numbers: number[];
}

export default function NumbersGrid({ numbers }: NumbersGridProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {numbers.map((num, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-xs sm:text-sm rounded-lg p-2 text-center shadow-md hover:scale-105 transition-transform"
        >
          {String(num).padStart(5, '0')}
        </div>
      ))}
    </div>
  );
}

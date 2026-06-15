interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#eae8e3] p-6 flex items-start gap-4 shadow-[0_8px_30px_rgba(0,52,33,0.04)] hover:shadow-[0_12px_32px_rgba(0,52,33,0.07)] hover:border-[#c0c9c1] transition-all duration-300">
      <div className={`p-3 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-[#1b1c19] mt-1">{value}</p>
        {subtitle && <p className="text-xs text-[#414943] mt-1 font-light">{subtitle}</p>}
      </div>
    </div>
  );
}

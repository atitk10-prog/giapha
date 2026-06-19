import React, { useState, useMemo } from 'react';
import { ClanMember } from '../types';
import { MapPin, Globe, Compass, Grid, Users } from 'lucide-react';

interface DistributionMapProps {
  members: ClanMember[];
  onSelectMember: (memberId: string) => void;
}

export default function DistributionMap({ members, onSelectMember }: DistributionMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  // Compute stats per region
  const regionStatistics = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      const loc = m.locationName || 'Quảng Nam';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return counts;
  }, [members]);

  // Unique list of regions
  const regions = useMemo(() => {
    return Object.keys(regionStatistics);
  }, [regionStatistics]);

  // Filtered member lists
  const filteredMembers = useMemo(() => {
    if (selectedRegion === 'ALL') return members;
    return members.filter(m => (m.locationName || 'Quảng Nam') === selectedRegion);
  }, [selectedRegion, members]);

  // Custom coordinate plots for Vietnam/Global map nodes
  // Let's draw an artistic vector map of Asia-Pacific/Global representation
  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold font-sans text-gray-900 dark:text-zinc-100 flex items-center gap-2">
          🗺️ Bản Đồ Phân Bố Di Cư & Địa Dư Dòng Tộc
        </h2>
        <p className="text-xs text-gray-500">
          Số liệu thống kê địa sư, mật độ cư trú của bà con tộc viên tại các tỉnh thành Tổ quốc Việt Nam và lưu vong hải ngoại.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Regional count cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 border border-gray-150 dark:border-zinc-850 rounded-2xl bg-white dark:bg-zinc-900/40">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Thống kê mật độ địa dư</span>
            
            <div className="flex flex-col gap-2">
              <button type="button"
                onClick={() => setSelectedRegion('ALL')}
                className={`p-3 rounded-xl flex items-center justify-between text-left transition-all border ${selectedRegion === 'ALL' ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-transparent border-gray-100 dark:border-zinc-800 hover:bg-gray-150/40 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'}`}
              >
                <span className="text-xs font-bold font-sans flex items-center gap-2"><Compass className="h-4 w-4 text-amber-700" /> Toàn dòng họ Nguyễn Văn</span>
                <strong className="text-xs font-mono">{members.length} vóc</strong>
              </button>

              {regions.map((reg) => {
                const count = regionStatistics[reg];
                const percentage = Math.round((count / members.length) * 100);

                return (
                  <button type="button"
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`p-3 rounded-xl flex flex-col gap-1.5 text-left transition-all border ${selectedRegion === reg ? 'bg-amber-150 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-transparent border-gray-100 dark:border-zinc-800 hover:bg-gray-150/40 text-gray-700 dark:text-zinc-300'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-extrabold font-sans flex items-center gap-2">
                        📍 {reg}
                      </span>
                      <strong className="text-xs font-mono">{count} người ({percentage}%)</strong>
                    </div>

                    {/* Simple progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <div 
                        style={{ width: `${percentage}%` }} 
                        className="bg-amber-600 h-full rounded-full" 
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right columns: Visual SVG Locator and localized Member lists */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Sơ đồ radar di cư */}
          <div className="p-5 border border-gray-150 dark:border-zinc-850 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm flex flex-col md:flex-row gap-6 items-center">
            
            {/* Visual Vector Map Outline mockup */}
            <div className="w-56 h-64 relative bg-amber-500/5 dark:bg-zinc-950 rounded-2xl flex items-center justify-center border overflow-hidden">
              <svg className="w-full h-full p-2 text-amber-800 dark:text-amber-400" viewBox="0 0 100 120">
                {/* Simulated Vietnam S-curve map */}
                <path 
                  d="M48,15 C51,13 54,16 52,19 C50,22 45,20 44,24 C43,28 47,31 46,35 C45,39 42,42 45,46 C48,50 54,48 56,52 C58,56 50,60 52,64 C54,68 60,67 58,72 C56,77 48,80 47,85 C46,90 53,92 51,96 C49,100 42,103 40,100 C38,97 45,95 44,91 C43,87 35,84 38,80 C41,76 43,72 40,68 C37,64 33,68 31,64 C29,60 36,58 35,54 C34,50 25,48 26,44 C27,40 35,42 36,38 C37,34 33,31 35,27 C37,23 44,21 44,17 Z" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  className="stroke-amber-800/20 dark:stroke-amber-400/25"
                />
                
                {/* Plot Highlight Node: Quảng Nam (15.8, 108.2) -> Mapping coordinates */}
                <g className={`cursor-pointer transition-transform hover:scale-110 ${selectedRegion === 'Quảng Nam' ? 'scale-125' : ''}`} onClick={() => setSelectedRegion('Quảng Nam')}>
                  <circle cx="53" cy="51" r="5" className="fill-amber-600 animate-pulse" />
                  <text x="59" y="52" className="text-[6px] font-sans font-extrabold fill-amber-900 dark:fill-amber-400">Quảng Nam</text>
                </g>

                {/* Plot Highlight Node: Đà Nẵng (16.0, 108.2) */}
                <g className={`cursor-pointer transition-transform hover:scale-110 ${selectedRegion === 'Đà Nẵng' ? 'scale-125' : ''}`} onClick={() => setSelectedRegion('Đà Nẵng')}>
                  <circle cx="51" cy="46" r="4.5" className="fill-amber-600" />
                  <text x="57" y="47" className="text-[6px] font-sans font-bold fill-sky-800 dark:fill-sky-400">Đà Nẵng</text>
                </g>

                {/* Plot Highlight Node: TP. Hồ Chí Minh */}
                <g className={`cursor-pointer transition-transform hover:scale-110 ${selectedRegion === 'TP. Hồ Chí Minh' ? 'scale-125' : ''}`} onClick={() => setSelectedRegion('TP. Hồ Chí Minh')}>
                  <circle cx="43" cy="85" r="4.5" className="fill-emerald-600" />
                  <text x="49" y="86" className="text-[6px] font-sans font-bold fill-emerald-800 dark:fill-emerald-400">TP. HCM</text>
                </g>

                {/* Plot Global Links: USA & Japan as globe overlays */}
                <g className={`cursor-pointer ${selectedRegion === 'Mỹ' ? 'scale-110' : ''}`} onClick={() => setSelectedRegion('Mỹ')}>
                  <rect x="8" y="10" width="18" height="10" rx="2" className="fill-sky-100 dark:fill-zinc-800 stroke-sky-300" strokeWidth="0.5" />
                  <text x="17" y="17" textAnchor="middle" className="text-[5px] font-bold fill-sky-850 dark:fill-sky-300">✈️ Mỹ</text>
                </g>

                <g className={`cursor-pointer ${selectedRegion === 'Nhật Bản' ? 'scale-110' : ''}`} onClick={() => setSelectedRegion('Nhật Bản')}>
                  <rect x="74" y="15" width="22" height="10" rx="2" className="fill-pink-100 dark:fill-zinc-800 stroke-pink-300" strokeWidth="0.5" />
                  <text x="85" y="22" textAnchor="middle" className="text-[5px] font-bold fill-pink-850 dark:fill-pink-300">✈️ Nhật Bản</text>
                </g>
              </svg>
            </div>

            {/* Geographical details right info */}
            <div className="space-y-3.5 flex-1 text-xs">
              <span className="p-1 px-2.5 rounded bg-gray-100 dark:bg-zinc-800 text-[10px] uppercase font-bold text-gray-500 font-mono">
                Địa sư cư dân: {selectedRegion === 'ALL' ? 'Toàn thế giới' : selectedRegion}
              </span>
              
              <div className="space-y-2">
                <span className="font-sans font-bold text-gray-800 dark:text-zinc-200 block flex items-center gap-1">
                  <Grid className="h-4 w-4 text-amber-700" /> Danh sách bà con tại vùng này ({filteredMembers.length} người)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {filteredMembers.map(m => (
                    <button type="button"
                      key={m.id}
                      onClick={() => onSelectMember(m.id)}
                      className="p-2 border border-gray-150 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 text-left hover:border-amber-300 transition-colors block truncate dark:text-zinc-300"
                    >
                      <strong>{m.fullName}</strong>
                      <span className="block text-[8.5px] text-gray-400 font-sans">
                        Đời thứ {m.generation} • {m.profession || 'Trường bối dòng tộc'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

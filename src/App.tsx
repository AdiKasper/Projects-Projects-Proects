import React, { useState, useEffect, useMemo } from 'react';
import { format, addMinutes, startOfMinute } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { 
  Clock, 
  ArrowRightLeft, 
  Search, 
  MapPin, 
  Sun, 
  Moon, 
  Calendar,
  RefreshCw,
  Globe
} from 'lucide-react';
import { cn } from './lib/utils';

// Get all supported IANA timezones
const ALL_TIMEZONES = Intl.supportedValuesOf('timeZone');

interface TimeZoneOption {
  value: string;
  label: string;
  offset: string;
}

export default function App() {
  const [sourceTz, setSourceTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [targetTz, setTargetTz] = useState<string>('UTC');
  const [sourceDateTime, setSourceDateTime] = useState<Date>(startOfMinute(new Date()));
  const [searchSource, setSearchSource] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isTargetOpen, setIsTargetOpen] = useState(false);

  // Update time every minute if it's "live" (optional feature, but let's keep it simple for now)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-update if the user hasn't manually changed the time significantly? 
      // Actually, let's just provide a "Sync" button for simplicity.
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredSourceTz = useMemo(() => 
    ALL_TIMEZONES.filter(tz => tz.toLowerCase().includes(searchSource.toLowerCase())),
  [searchSource]);

  const filteredTargetTz = useMemo(() => 
    ALL_TIMEZONES.filter(tz => tz.toLowerCase().includes(searchTarget.toLowerCase())),
  [searchTarget]);

  const handleSwap = () => {
    setSourceTz(targetTz);
    setTargetTz(sourceTz);
  };

  const handleSync = () => {
    setSourceDateTime(startOfMinute(new Date()));
  };

  const getZonedInfo = (date: Date, tz: string) => {
    try {
      const zonedDate = toZonedTime(date, tz);
      const timeStr = formatInTimeZone(date, tz, 'HH:mm');
      const dateStr = formatInTimeZone(date, tz, 'EEE, MMM d, yyyy');
      const hour = parseInt(formatInTimeZone(date, tz, 'H'));
      const isDay = hour >= 6 && hour < 18;
      const offset = formatInTimeZone(date, tz, 'xxx'); // e.g. +08:00
      
      return { timeStr, dateStr, isDay, offset, zonedDate };
    } catch (e) {
      return { timeStr: '--:--', dateStr: 'Invalid TZ', isDay: true, offset: '+00:00', zonedDate: date };
    }
  };

  const sourceInfo = getZonedInfo(sourceDateTime, sourceTz);
  const targetInfo = getZonedInfo(sourceDateTime, targetTz);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Global Time Converter</h1>
          </div>
          <p className="text-slate-400 text-sm">Convert time across any time zone instantly.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] items-center gap-6">
            
            {/* Source Location */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">From Location</label>
              <div className="relative">
                <button 
                  onClick={() => setIsSourceOpen(!isSourceOpen)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all text-left"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                    <span className="font-medium truncate">{sourceTz.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 shrink-0 ml-2">{sourceInfo.offset}</span>
                </button>

                {isSourceOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-slate-100 bg-slate-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Search city or region..."
                          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          value={searchSource}
                          onChange={(e) => setSearchSource(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2">
                      {filteredSourceTz.map(tz => (
                        <button
                          key={tz}
                          onClick={() => {
                            setSourceTz(tz);
                            setIsSourceOpen(false);
                            setSearchSource('');
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors",
                            sourceTz === tz ? "bg-indigo-50 text-indigo-600 font-medium" : "hover:bg-slate-50 text-slate-700"
                          )}
                        >
                          {tz.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Set Time</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="datetime-local" 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      value={format(sourceDateTime, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setSourceDateTime(new Date(e.target.value))}
                    />
                  </div>
                  <button 
                    onClick={handleSync}
                    title="Sync with current time"
                    className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pt-6 lg:pt-0">
              <button 
                onClick={handleSwap}
                className="p-4 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-indigo-200"
              >
                <ArrowRightLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Target Location */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">To Location</label>
              <div className="relative">
                <button 
                  onClick={() => setIsTargetOpen(!isTargetOpen)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all text-left"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                    <span className="font-medium truncate">{targetTz.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 shrink-0 ml-2">{targetInfo.offset}</span>
                </button>

                {isTargetOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-slate-100 bg-slate-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Search city or region..."
                          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          value={searchTarget}
                          onChange={(e) => setSearchTarget(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2">
                      {filteredTargetTz.map(tz => (
                        <button
                          key={tz}
                          onClick={() => {
                            setTargetTz(tz);
                            setIsTargetOpen(false);
                            setSearchTarget('');
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors",
                            targetTz === tz ? "bg-indigo-50 text-indigo-600 font-medium" : "hover:bg-slate-50 text-slate-700"
                          )}
                        >
                          {tz.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Resulting Time</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-indigo-900 font-mono">{targetInfo.timeStr}</span>
                    <span className="text-sm font-medium text-indigo-600">{targetInfo.offset}</span>
                  </div>
                  <p className="text-sm text-indigo-700 mt-1">{targetInfo.dateStr}</p>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl",
                  targetInfo.isDay ? "bg-amber-100 text-amber-600" : "bg-indigo-900 text-indigo-100"
                )}>
                  {targetInfo.isDay ? <Sun className="w-8 h-8" /> : <Moon className="w-8 h-8" />}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison View */}
          <div className="pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Time Comparison</h2>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-400" /> Day
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-900" /> Night
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[sourceInfo, targetInfo].map((info, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      {idx === 0 ? 'SOURCE' : 'TARGET'}
                    </span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  <div className={cn(
                    "relative p-4 rounded-2xl border transition-all overflow-hidden",
                    info.isDay ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800 text-white shadow-lg shadow-slate-900/20"
                  )}>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold opacity-70">{idx === 0 ? sourceTz.split('/').pop()?.replace(/_/g, ' ') : targetTz.split('/').pop()?.replace(/_/g, ' ')}</span>
                        {info.isDay ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div className="text-2xl font-bold font-mono tracking-tight">{info.timeStr}</div>
                      <div className="text-xs opacity-60 mt-1">{info.dateStr}</div>
                    </div>
                    {!info.isDay && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-3xl rounded-full -mr-12 -mt-12" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock className="w-4 h-4" />
            <span>Updates automatically based on selected time</span>
          </div>
          <div className="text-slate-400 text-xs">
            Powered by IANA Time Zone Database
          </div>
        </div>
      </div>
    </div>
  );
}

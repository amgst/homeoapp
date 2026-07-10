import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

interface BusinessCardProps {
  className?: string;
  interactive?: boolean;
}

export default function BusinessCard({ className = '', interactive = true }: BusinessCardProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl aspect-[3/2] w-full max-w-lg bg-gradient-to-br from-[#12582f] via-[#1b7a43] to-[#0a381d] text-white p-6 md:p-8 shadow-2xl border border-emerald-500/30 transition-all duration-300 ${
        interactive ? 'hover:scale-[1.02] hover:shadow-emerald-900/20 hover:shadow-2xl' : ''
      } ${className}`}
    >
      {/* Wave Background Overlay Decorators */}
      <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-gradient-to-tr from-lime-400/20 to-emerald-500/0 blur-2xl pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#82df73]/10 blur-xl pointer-events-none animate-pulse" />
      
      {/* Swirling swoosh waves using SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-20 220C100 240 180 140 320 180C460 220 520 280 540 280V320H-20V220Z" fill="url(#wave-grad-1)" />
        <path d="M-20 250C120 270 200 190 350 220C500 250 520 310 540 310V320H-20V250Z" fill="url(#wave-grad-2)" />
        <defs>
          <linearGradient id="wave-grad-1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-grad-2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a3e635" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#166534" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Grid Content Layout */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        
        {/* Top Header Section */}
        <div className="text-center md:text-left mb-4">
          <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight italic font-serif text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center md:justify-start gap-1">
            Haris <span className="text-[#aaffaa] not-italic font-sans">Homeo Clinic</span>
          </h2>
          <div className="h-[2px] w-full bg-gradient-to-r from-lime-400 via-emerald-300 to-transparent mt-1 rounded-full" />
        </div>

        {/* Middle split section */}
        <div className="grid grid-cols-12 gap-4 items-center flex-1">
          
          {/* Left Side: Glowing Emblem */}
          <div className="col-span-5 flex justify-center items-center">
            <div className="relative w-28 h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-400/50 p-1 group overflow-hidden">
              {/* Inner ambient light */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-100 rounded-full z-0" />
              
              {/* Complex Homeopathic Illustration Container */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                {/* Green Cross background */}
                <div className="absolute w-12 h-12 bg-gradient-to-br from-[#16a34a] to-[#15803d] rounded-sm flex items-center justify-center shadow-md">
                  {/* Vertical bar */}
                  <div className="absolute w-3.5 h-9 bg-white/95 rounded-sm" />
                  {/* Horizontal bar */}
                  <div className="absolute w-9 h-3.5 bg-white/95 rounded-sm" />
                </div>

                {/* Overlapping leaf */}
                <div className="absolute top-2 right-4 w-9 h-9 transform rotate-[15deg] drop-shadow-sm pointer-events-none animate-pulse">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 22C2 22 6 14 14 12C14 12 11 11 9 11C7 11 2 15 2 22Z" fill="#22c55e" />
                    <path d="M22 2C22 2 14 4 11 11C8 18 10 21 10 21C10 21 11 19 13 16C15 13 22 2 22 2Z" fill="#4ade80" />
                    <path d="M11 11L14 14" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Mortar & Pestle in bottom half */}
                <div className="absolute bottom-1 w-16 h-11 flex flex-col items-center justify-end z-20">
                  {/* Pestle */}
                  <div className="absolute -top-3 left-4 w-2 h-7 bg-slate-300 rounded-full transform -rotate-[35deg] origin-bottom shadow-xs border border-slate-400/40" />
                  {/* Mortar */}
                  <div className="w-14 h-8 bg-gradient-to-b from-slate-100 to-slate-200 rounded-b-2xl rounded-t-sm border-t-2 border-slate-300 shadow-lg flex items-center justify-center">
                    <span className="text-[6px] font-black text-slate-400 tracking-widest uppercase scale-75">HOMEO</span>
                  </div>
                </div>

                {/* Dropping bottles & globules */}
                <div className="absolute bottom-2 left-1.5 flex space-x-0.5 items-end z-30">
                  {/* Bottle 1 */}
                  <div className="w-3 h-6 bg-amber-700 rounded-t-xs rounded-b-xs border border-amber-900 flex flex-col justify-between p-[1px] shadow-xs">
                    <div className="h-[2px] bg-white w-full rounded-xs" />
                    <div className="h-[2px] bg-green-500 w-full" />
                  </div>
                  {/* Bottle 2 */}
                  <div className="w-2.5 h-5 bg-emerald-800 rounded-t-xs rounded-b-xs border border-emerald-950 flex flex-col justify-between p-[1px] shadow-xs">
                    <div className="h-[1px] bg-white w-full rounded-xs" />
                    <div className="h-[2px] bg-amber-500 w-full" />
                  </div>
                </div>

                {/* Little White Pills / Globules on the ground */}
                <div className="absolute bottom-0 right-2 flex space-x-0.5 z-30">
                  <div className="w-1.5 h-1.5 bg-white rounded-full border border-slate-300 shadow-xs" />
                  <div className="w-1.2 h-1.2 bg-white rounded-full border border-slate-300 shadow-xs mt-1" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full border border-slate-300 shadow-xs" />
                </div>
              </div>

              {/* Ambient Green Ring */}
              <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-full scale-95 pointer-events-none animate-ping opacity-10" />
            </div>
          </div>

          {/* Right Side: Doctor Name & Practice Details */}
          <div className="col-span-7 space-y-2.5 text-left pl-2">
            {/* Dr. Name */}
            <div className="bg-[#0b3c1f]/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border-l-4 border-lime-400 shadow-md inline-block">
              <p className="text-sm md:text-base font-extrabold tracking-wide text-white font-sans uppercase">
                Dr. Haris Mehmood
              </p>
              <p className="text-[9px] text-lime-300 font-bold tracking-widest uppercase">
                Homeopathic Physician
              </p>
            </div>

            {/* Quick Details List */}
            <div className="space-y-1.5 text-xs font-semibold text-emerald-100">
              <a href="tel:+923037752900" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group">
                <span className="p-1 rounded-md bg-emerald-900/50 group-hover:bg-lime-500/20 text-lime-400 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <span className="font-mono tracking-wide">+92 303 7752900</span>
              </a>

              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-900/50 text-lime-400">
                  <MapPin className="w-3.5 h-3.5" />
                </span>
                <span className="leading-tight text-[11px]">Canal Park Muridke City</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-900/50 text-lime-400">
                  <Clock className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] font-bold">9:00 AM to 5:00 PM</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer / Clinic Motto */}
        <div className="mt-4 flex items-center justify-between border-t border-emerald-400/20 pt-2 text-[9px] text-emerald-200 uppercase tracking-widest font-bold">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-400 animate-pulse fill-red-400" /> Natural & Gentle Healing
          </span>
          <span className="flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3 text-lime-400" /> Verified EHR Gateway
          </span>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Brain, ChevronRight, Settings, Flame, Volume2, X, Check, Activity, Layers, Zap, RotateCcw, VolumeX, ArrowLeft, Lock } from 'lucide-react';
import { TONE_COLORS, TYPE_COLORS, FACTIONS } from '@/lib/constants';

const formatPinyin = (input) => {
    const map = {
        'a1': 'ā', 'a2': 'á', 'a3': 'ǎ', 'a4': 'à', 'a5': 'a',
        'e1': 'ē', 'e2': 'é', 'e3': 'ě', 'e4': 'è', 'e5': 'e',
        'i1': 'ī', 'i2': 'í', 'i3': 'ǐ', 'i4': 'ì', 'i5': 'i',
        'o1': 'ō', 'o2': 'ó', 'o3': 'ǒ', 'o4': 'ò', 'o5': 'o',
        'u1': 'ū', 'u2': 'ú', 'u3': 'ǔ', 'u4': 'ù', 'u5': 'u',
        'v1': 'ǖ', 'v2': 'ǘ', 'v3': 'ǚ', 'v4': 'ǜ', 'v5': 'ü',
        'an1': 'ān', 'an2': 'án', 'an3': 'ǎn', 'an4': 'àn',
    };
    let res = input.toLowerCase();
    Object.keys(map).forEach(key => {
        if (res.includes(key)) res = res.replace(key, map[key]);
    });
    return res;
};

export function FactionSelector({ onSelect }) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 animate-in">
            <div className="max-w-4xl w-full text-center mb-12">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-6">Choisissez votre Voie</h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Votre voie détermine votre style d'apprentissage et les caractères que vous rencontrerez en priorité.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                {Object.entries(FACTIONS).map(([key, faction]) => (
                    <button
                        key={key}
                        onClick={() => onSelect(key)}
                        className={`group relative overflow-hidden rounded-3xl border border-white/10 p-6 flex flex-col items-center text-center transition-all hover:scale-105 hover:border-white/30 bg-gradient-to-b ${faction.bg}`}
                    >
                        <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">{faction.icon}</div>
                        <h3 className={`text-2xl font-bold mb-2 ${faction.color}`}>{faction.name}</h3>
                        <p className="text-sm text-slate-300/80 leading-relaxed">{faction.description}</p>
                        <div className="mt-6 px-4 py-2 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest text-white group-hover:bg-white/20 transition-colors">
                            Rejoindre
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function SettingsModal({ onClose, onReset }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings size={20} className="text-indigo-400" /> Paramètres</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-3">
                            <VolumeX className="text-slate-400" />
                            <div>
                                <div className="font-bold text-slate-200">Audio (TTS)</div>
                                <div className="text-xs text-slate-500">Non disponible en local</div>
                            </div>
                        </div>
                        <div className="w-10 h-6 bg-slate-700 rounded-full relative opacity-50 cursor-not-allowed">
                            <div className="w-4 h-4 bg-slate-500 rounded-full absolute top-1 left-1"></div>
                        </div>
                    </div>
                    <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl">
                        <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2"><RotateCcw size={16} /> Zone de Danger</h4>
                        <p className="text-xs text-red-300/70 mb-4">Ceci réinitialisera toute votre progression.</p>
                        <button onClick={onReset} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-red-900/20">
                            Réinitialiser ma progression
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LevelDetail({ level, items, onBack, onStartPractice }) {
    const learnedItems = items.filter(i => i.assignment.srs_stage > 0);
    const [selectedItem, setSelectedItem] = useState(null);

    return (
        <div className="min-h-screen bg-slate-950 p-6 animate-in">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors font-bold"><ArrowLeft size={20} /> Retour au Dashboard</button>
                    <h1 className="text-3xl font-bold text-white">Niveau HSK {level}</h1>
                    <div className="w-32"></div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 flex justify-between items-center shadow-lg">
                    <div>
                        <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Progression</div>
                        <div className="text-2xl text-white font-bold">{learnedItems.length} / {items.length} <span className="text-sm text-slate-500 font-normal">items appris</span></div>
                    </div>

                    {/* MODIFICATION 1 SUITE : Bouton désactivé si 0 items appris */}
                    <button
                        onClick={() => onStartPractice(learnedItems)}
                        disabled={learnedItems.length === 0}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg 
                            ${learnedItems.length > 0
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
                    >
                        <Brain size={20} />
                        {learnedItems.length > 0 ? `S'entraîner (${learnedItems.length})` : "Rien à réviser"}
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {items.map(item => {
                        const isLocked = item.assignment.srs_stage === 0 && !item.assignment.unlocked;
                        const isLearned = item.assignment.srs_stage > 0;
                        const srsColor = isLearned ? (item.assignment.srs_stage >= 7 ? 'border-blue-500 bg-blue-900/20' : (item.assignment.srs_stage >= 5 ? 'border-green-500 bg-green-900/20' : 'border-pink-500 bg-pink-900/20')) : 'border-slate-800 bg-slate-900';
                        return (
                            <div
                                key={item.id}
                                onClick={() => isLearned && setSelectedItem(item)}
                                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 relative group transition-all ${srsColor} ${isLocked ? 'opacity-30 grayscale' : 'hover:scale-105 cursor-pointer'}`}
                            >
                                <span className={`text-3xl font-serif ${isLearned ? 'text-white' : 'text-slate-500'}`}>{item.char}</span>
                                <span className="text-xs text-slate-500 mt-1 font-mono">{item.pinyin || '-'}</span>
                                {isLocked && <div className="absolute inset-0 flex items-center justify-center"><div className="bg-slate-950/80 p-1 rounded"><Settings size={16} className="text-slate-600" /></div></div>}
                            </div>
                        );
                    })}
                </div>
            </div>
            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
}

function ItemDetailModal({ item, onClose }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => document.body.style.overflow = 'unset';
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase shadow-lg ${TYPE_COLORS[item.type] || "bg-slate-600"}`}>
                            {item.type}
                        </span>
                        <h2 className="text-white font-bold text-lg">Détails du caractère</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className={`text-9xl font-serif text-white mb-4 drop-shadow-2xl ${item.type !== 'radical' && item.tone && step >= 1 ? TONE_COLORS[Array.isArray(item.tone) ? item.tone[0] : item.tone]?.split(' ')[0] : ''}`}>
                            {item.char}
                        </div>
                    </div>

                    <div className="w-full bg-slate-950/30 rounded-3xl p-6 border border-white/5 min-h-[300px] flex flex-col">
                        <div className="flex gap-6 mb-8 border-b border-white/5 pb-4 justify-center">
                            {['Signification', 'Lecture', 'Mnémonique'].map((label, i) => (
                                <button
                                    key={i}
                                    onClick={() => setStep(i)}
                                    disabled={item.type === 'radical' && i === 1}
                                    className={`text-sm font-bold uppercase tracking-wider transition-all duration-300 pb-2 border-b-2 ${step === i ? 'text-white border-pink-500' : 'text-slate-600 border-transparent hover:text-slate-400'} ${(item.type === 'radical' && i === 1) ? 'opacity-20 cursor-not-allowed' : ''}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1">
                            {step === 0 && (
                                <div className="text-center">
                                    <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">{item.meaning.join(', ')}</h3>
                                    <div className="flex flex-wrap gap-2 mt-6 justify-center">
                                        <span className="text-slate-500 text-xs uppercase font-bold tracking-widest self-center mr-2">COMPOSITION</span>
                                        {item.components.length > 0 ? (
                                            <div className="flex gap-2">
                                                {item.components.map((comp, idx) => (
                                                    <span key={idx} className="text-slate-300 bg-white/5 px-2 py-1 rounded text-sm border border-white/5">{comp}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-500 italic text-sm">Élément fondamental (Radical)</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="text-center">
                                    {item.type !== 'radical' ? (
                                        <>
                                            <div className="flex items-center justify-center gap-4 mb-6">
                                                <h3 className="text-6xl font-mono text-white tracking-tighter">{item.pinyin}</h3>
                                                {item.tone && (
                                                    <div className={`px-3 py-1 rounded border text-xs font-bold uppercase ${TONE_COLORS[Array.isArray(item.tone) ? item.tone[0] : item.tone]}`}>
                                                        Ton {Array.isArray(item.tone) ? item.tone.join(' & ') : item.tone}
                                                    </div>
                                                )}
                                            </div>
                                            {item.example && (
                                                <div className="bg-slate-900/50 p-6 rounded-2xl border-l-4 border-pink-500 text-left mx-auto max-w-lg">
                                                    <p className="text-xl text-slate-200 font-serif italic">"{item.example}"</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-slate-500 italic">Les radicaux n'ont pas de lecture.</div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <h4 className="text-pink-400 text-xs font-bold uppercase tracking-widest mb-4">Histoire Mnémonique</h4>
                                    <p className="text-xl text-slate-200 leading-relaxed font-light border-l-2 border-white/10 pl-6">
                                        {item.mnemonic || "Aucune histoire disponible."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Dashboard({ user, lessonsCount, reviewsCount, hskStats, onStart, onOpenSettings, onOpenLevel }) {
    const userFaction = user.faction ? FACTIONS[user.faction] : null;
    const HSKCard = ({ level, stats, icon, colorClass, bgClass }) => {
        const isLocked = stats.locked;
        return (
            <div onClick={() => !isLocked && onOpenLevel(level)} className={`relative bg-slate-800/50 p-5 rounded-2xl border flex flex-col justify-between transition-all group shadow-lg ${isLocked ? 'border-slate-700 opacity-60 cursor-not-allowed grayscale' : 'border-white/5 hover:bg-slate-800 cursor-pointer hover:border-white/20 hover:-translate-y-1'}`}>
                {isLocked && <div className="absolute top-4 right-4 text-slate-500"><Lock size={20} /></div>}
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl border transition-colors ${colorClass} ${bgClass}`}>{icon}</div>
                    <span className="text-2xl font-bold text-white">{stats.percent}%</span>
                </div>
                <div>
                    <div className="text-slate-200 font-bold mb-1">HSK {level}</div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${colorClass.split(' ')[0].replace('text', 'bg')}`} style={{ width: `${stats.percent}%` }}></div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 flex justify-between">
                        <span>{stats.learned} / {stats.total}</span>
                        {!isLocked && <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 font-bold">Voir détails &rarr;</span>}
                        {isLocked && <span className="text-slate-600">Verrouillé</span>}
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-20 font-sans selection:bg-indigo-500 selection:text-white">
            <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 p-4 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 group cursor-default">
                        <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2 rounded-xl shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform"><Flame className="text-white fill-white" size={20} /></div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Hanzi Learning <span className="text-slate-500 text-xs font-medium ml-1 bg-slate-800 px-2 py-0.5 rounded-full">Local</span></h1>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onOpenSettings(); }} className="text-slate-400 hover:text-white transition-all p-2 hover:bg-white/10 rounded-full active:scale-95"><Settings size={24} /></button>
                </div>
            </nav>
            <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in">
                <div className={`relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r ${userFaction ? userFaction.bg : 'from-slate-800 to-slate-900'}`}>
                    <div className="relative z-10 shrink-0">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white border-4 border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">{user.level}</div>
                    </div>
                    <div className="relative z-10 text-center md:text-left flex-1">
                        <h2 className="text-3xl font-bold text-white mb-2">{user.username} {userFaction && <span className="ml-2">{userFaction.icon}</span>}</h2>
                        <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/10 text-sm text-slate-300 backdrop-blur-md mb-4"><span>{userFaction ? userFaction.name : "Disciple sans faction"}</span></div>

                        <div className="w-full max-w-md mx-auto md:mx-0">
                            <div className="flex justify-between text-xs text-slate-300 mb-1 font-bold uppercase tracking-wider">
                                <span>Progression Niveau {user.level}</span>
                                <span>{hskStats[user.level]?.percent || 0}%</span>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-3 border border-white/10 overflow-hidden backdrop-blur-sm">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${hskStats[user.level]?.percent || 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-20 -right-20 opacity-20 pointer-events-none mix-blend-overlay"><Flame size={400} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => lessonsCount > 0 && onStart('lessons')} disabled={lessonsCount === 0} className={`group relative overflow-hidden p-8 rounded-3xl border transition-all text-left shadow-2xl h-64 flex flex-col justify-between ${lessonsCount > 0 ? 'bg-gradient-to-br from-pink-600 to-rose-900 border-pink-400/30 hover:scale-[1.02] cursor-pointer hover:shadow-pink-500/30' : 'bg-slate-800/50 border-white/5 opacity-50 cursor-not-allowed grayscale'}`}>
                        <div className="relative z-10"><div className="flex justify-between items-start"><span className="block text-xl font-bold text-pink-100 uppercase tracking-widest bg-pink-900/50 px-3 py-1 rounded-lg w-fit">Leçons</span>{lessonsCount > 0 && <span className="animate-pulse w-3 h-3 bg-pink-400 rounded-full shadow-[0_0_10px_#f472b6]"></span>}</div><span className="block text-7xl font-black text-white mt-4 drop-shadow-lg">{lessonsCount}</span></div>
                        <div className="relative z-10">{lessonsCount > 0 ? <span className="text-sm font-medium text-pink-200 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">Nouveaux sujets</span> : <span className="text-sm text-slate-400">Aucune leçon.</span>}</div>
                        <BookOpen size={180} className="absolute -bottom-8 -right-8 p-4 opacity-10 group-hover:opacity-25 transition-all transform group-hover:rotate-12 text-white" />
                    </button>
                    <button onClick={() => reviewsCount > 0 && onStart('reviews')} disabled={reviewsCount === 0} className={`group relative overflow-hidden p-8 rounded-3xl border transition-all text-left shadow-2xl h-64 flex flex-col justify-between ${reviewsCount > 0 ? 'bg-gradient-to-br from-indigo-600 to-blue-900 border-indigo-400/30 hover:scale-[1.02] cursor-pointer hover:shadow-indigo-500/30' : 'bg-slate-800/50 border-white/5 opacity-50 cursor-not-allowed grayscale'}`}>
                        <div className="relative z-10"><div className="flex justify-between items-start"><span className="block text-xl font-bold text-indigo-100 uppercase tracking-widest bg-indigo-900/50 px-3 py-1 rounded-lg w-fit">Révisions</span>{reviewsCount > 0 && <span className="animate-pulse w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8]"></span>}</div><span className="block text-7xl font-black text-white mt-4 drop-shadow-lg">{reviewsCount}</span></div>
                        <div className="relative z-10">{reviewsCount > 0 ? <span className="text-sm font-medium text-indigo-200 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">Prêt à réviser</span> : <span className="text-sm text-slate-400">Tout est à jour.</span>}</div>
                        <Brain size={180} className="absolute -bottom-8 -right-8 p-4 opacity-10 group-hover:opacity-25 transition-all transform group-hover:-rotate-12 text-white" />
                    </button>
                </div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-8 mb-4">Progression HSK</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <HSKCard level={1} stats={hskStats[1] || { percent: 0, locked: false }} icon={<Activity size={24} />} colorClass="text-emerald-400 border-emerald-500/20" bgClass="bg-emerald-500/10 group-hover:bg-emerald-500/20" />
                    <HSKCard level={2} stats={hskStats[2] || { percent: 0, locked: true }} icon={<Layers size={24} />} colorClass="text-cyan-400 border-cyan-500/20" bgClass="bg-cyan-500/10 group-hover:bg-cyan-500/20" />
                    <HSKCard level={3} stats={hskStats[3] || { percent: 0, locked: true }} icon={<Layers size={24} />} colorClass="text-amber-400 border-amber-500/20" bgClass="bg-amber-500/10 group-hover:bg-amber-500/20" />
                </div>
            </div>
        </div>
    );
}

export function LessonSession({ items, onComplete }) {
    const [index, setIndex] = useState(0);
    const [step, setStep] = useState(0);
    const item = items[index];
    if (!item) return <div className="min-h-screen flex items-center justify-center text-white bg-slate-950">Chargement...</div>;

    const handleNext = async () => {
        if (step < 2) setStep(step + 1);
        else {
            await fetch('/api/study', { method: 'POST', body: JSON.stringify({ itemId: item.id, success: true }) });
            if (index < items.length - 1) { setIndex(index + 1); setStep(0); } else onComplete();
        }
    };
    const itemColorClass = TYPE_COLORS[item.type] || "bg-slate-600";
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col animate-in">
            <div className="bg-slate-900/50 p-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={onComplete} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors text-sm font-bold"><ArrowLeft size={16} /> Retour</button>
                    <span className="text-slate-400 font-mono text-sm ml-4">{index + 1} / {items.length}</span>
                    <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-pink-500 transition-all" style={{ width: `${((index) / items.length) * 100}%` }}></div></div>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase shadow-lg ${itemColorClass}`}>{item.type}</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
                <div className="mb-10 text-center relative group">
                    <div className={`text-9xl font-serif text-white mb-4 drop-shadow-2xl transition-all duration-500 ${item.type !== 'radical' && item.tone && step >= 1 ? TONE_COLORS[Array.isArray(item.tone) ? item.tone[0] : item.tone]?.split(' ')[0] : ''}`}>{item.char}</div>
                </div>
                <div className="w-full bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl min-h-[350px] flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent blur-lg"></div>
                    <div className="flex gap-6 mb-8 border-b border-white/5 pb-4">
                        {['Signification', 'Lecture', 'Mnémonique'].map((label, i) => (
                            <button key={i} onClick={() => setStep(i)} disabled={item.type === 'radical' && i === 1} className={`text-sm font-bold uppercase tracking-wider transition-all duration-300 pb-2 border-b-2 ${step === i ? 'text-white border-pink-500' : 'text-slate-600 border-transparent hover:text-slate-400'} ${(item.type === 'radical' && i === 1) ? 'opacity-20 cursor-not-allowed' : ''}`}>{label}</button>
                        ))}
                    </div>
                    <div className="flex-1 animate-in">
                        {step === 0 && (<div><h3 className="text-4xl font-bold text-white mb-4 tracking-tight">{item.meaning.join(', ')}</h3><div className="flex flex-wrap gap-2 mt-6"><span className="text-slate-500 text-xs uppercase font-bold tracking-widest">COMPOSITION</span>{item.components.length > 0 ? (<div className="flex gap-2">{item.components.map((comp, idx) => (<span key={idx} className="text-slate-300 bg-white/5 px-2 py-1 rounded text-sm border border-white/5">{comp}</span>))}</div>) : <span className="text-slate-500 italic text-sm">Élément fondamental (Radical)</span>}</div></div>)}
                        {step === 1 && (<div>{item.type !== 'radical' ? (<><div className="flex items-baseline gap-4 mb-6"><h3 className="text-6xl font-mono text-white tracking-tighter">{item.pinyin}</h3>{item.tone && (<div className={`px-3 py-1 rounded border text-xs font-bold uppercase ${TONE_COLORS[Array.isArray(item.tone) ? item.tone[0] : item.tone]}`}>Ton {Array.isArray(item.tone) ? item.tone.join(' & ') : item.tone}</div>)}</div>{item.example && (<div className="bg-slate-950/50 p-6 rounded-2xl border-l-4 border-pink-500"><p className="text-xl text-slate-200 font-serif italic">"{item.example}"</p></div>)}</>) : (<div className="text-slate-500 italic border-l-2 border-slate-700 pl-4">Les radicaux n'ont pas de lecture.</div>)}</div>)}
                        {step === 2 && (<div><h4 className="text-pink-400 text-xs font-bold uppercase tracking-widest mb-4">Histoire Mnémonique</h4><p className="text-xl text-slate-200 leading-relaxed font-light border-l-2 border-white/10 pl-6">{item.mnemonic || "Aucune histoire disponible."}</p></div>)}
                    </div>
                </div>
            </div>
            <div className="p-6 bg-slate-950 border-t border-white/5 flex justify-end">
                <button onClick={handleNext} className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-pink-500/20 hover:translate-x-1">{index === items.length - 1 && step >= 2 ? 'Terminer' : 'Suivant'} <ChevronRight size={24} /></button>
            </div>
        </div>
    );
}

export function ReviewSession({ items, onComplete, isPractice = false }) {
    const [index, setIndex] = useState(0);
    const [mode, setMode] = useState('meaning');
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('idle');
    const inputRef = useRef(null);
    const item = items[index];

    useEffect(() => {
        setInput(''); setStatus('idle');
    }, [item, index]);

    useEffect(() => { if (status !== 'success' && inputRef.current) inputRef.current.focus(); }, [item, status]);

    const handleInputChange = (e) => {
        const raw = e.target.value;
        const formatted = formatPinyin(raw);
        setInput(formatted);
    };

    const normalize = (str) => str ? str.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        const normInput = input.trim().toLowerCase();

        if (!normInput) return;

        const pinyinClean = item.pinyin ? item.pinyin.toLowerCase() : "";
        const matchesPinyin = normInput === pinyinClean;

        const matchesMeaning = item.meaning.some(m =>
            normalize(m) === normalize(input)
        );

        if (matchesPinyin || matchesMeaning) {
            setStatus('success');
            await fetch('/api/study', { method: 'POST', body: JSON.stringify({ itemId: item.id, success: true, isPractice }) });
            setTimeout(() => { if (index < items.length - 1) setIndex(index + 1); else onComplete(); }, 800);
        } else {
            setStatus('error');
            await fetch('/api/study', { method: 'POST', body: JSON.stringify({ itemId: item.id, success: false, isPractice }) });
        }
    };

    const bgColor = 'bg-slate-900 text-white';

    if (!item) return <div className="text-white text-center mt-10">Chargement...</div>;

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            {isPractice && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-50">MODE ENTRAÎNEMENT</div>}
            <div className="fixed top-0 left-0 w-full h-1 bg-slate-800"><div className="h-full bg-green-500 transition-all" style={{ width: `${(index / items.length) * 100}%` }}></div></div>

            <button onClick={onComplete} className="fixed top-4 left-4 flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white z-50 font-bold text-sm">
                <ArrowLeft size={16} /> Retour
            </button>

            <div className="w-full max-w-xl">
                <div className={`${TYPE_COLORS[item.type]} p-12 rounded-t-3xl flex flex-col items-center justify-center shadow-2xl relative`}>
                    <span className="text-9xl font-serif drop-shadow-lg">{item.char}</span>
                    <span className="uppercase tracking-widest mt-4 font-bold opacity-70 bg-black/20 px-2 py-1 rounded text-xs">{item.type}</span>
                </div>
                <div className={`${bgColor} p-10 rounded-b-3xl shadow-2xl transition-colors duration-300 border border-slate-700`}>
                    <div className="text-center mb-6 font-bold uppercase opacity-60 flex justify-center gap-2">
                        <Brain /> Signification OU Lecture (Pinyin)
                    </div>
                    <form onSubmit={handleSubmit}>
                        <input ref={inputRef} type="text" value={input} onChange={handleInputChange} disabled={status === 'success'}
                            className={`w-full text-center text-3xl p-4 rounded-xl border-4 outline-none transition-all ${status === 'error' ? 'border-red-500 bg-red-50 text-red-900' : status === 'success' ? 'border-green-500 bg-green-100 text-green-900' : 'border-slate-300/20 bg-white/10'}`}
                            placeholder="Tapez votre réponse..."
                        />
                    </form>
                    {status === 'error' && (
                        <div className="mt-6 text-center animate-in">
                            <div className="text-red-500 font-bold uppercase text-xs mb-1">Réponse correcte</div>
                            <div className="text-xl font-bold text-white">{item.meaning.join(', ')}</div>
                            <div className="text-lg text-slate-400 font-mono mt-1">{item.pinyin}</div>
                            <button onClick={() => { setIndex(index + 1); setStatus('idle'); }} className="text-slate-500 underline mt-4 hover:text-slate-800">Ignorer et continuer</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export { SettingsModal };

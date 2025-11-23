'use client';
import React, { useState, useEffect } from 'react';
import { Dashboard, LessonSession, ReviewSession, SettingsModal, LevelDetail, FactionSelector } from '@/components/UI';

export default function Home() {
  const [view, setView] = useState('dashboard')
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [sessionItems, setSessionItems] = useState([]);
  const [levelItems, setLevelItems] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isPractice, setIsPractice] = useState(false);

  const refreshDashboard = async () => {
    try {
      setError(null);
      const res = await fetch('/api/study?action=dashboard');
      if (res.ok) {
        setData(await res.json());
        setView('dashboard');
      } else {
        throw new Error("Erreur lors du chargement des données");
      }
    } catch (e) {
      console.error(e);
      setError("Impossible de charger les données. Vérifiez votre connexion ou réessayez.");
    }
  };

  useEffect(() => { refreshDashboard(); }, []);

  const handleFactionSelect = async (faction) => {
    await fetch('/api/study?action=set_faction', {
      method: 'POST',
      body: JSON.stringify({ faction })
    });
    refreshDashboard();
  };

  const startSession = async (type) => {
    setIsPractice(false);
    const res = await fetch(`/api/study?action=${type}`);
    const items = await res.json();
    if (items.length > 0) {
      setSessionItems(items);
      setView(type);
    } else {
      alert("Rien à étudier pour le moment !");
    }
  };

  const openLevel = async (level) => {
    setCurrentLevel(level);
    const res = await fetch(`/api/study?action=level_items&level=${level}`);
    const items = await res.json();
    setLevelItems(items);
    setView('level_detail');
  };

  const startPractice = (items) => {
    setSessionItems(items);
    setIsPractice(true);
    setView('reviews'); // On utilise l'interface de review mais en mode practice
  };

  const handleReset = async () => {
    if (confirm("Êtes-vous sûr de vouloir tout effacer ?")) {
      await fetch('/api/study?action=reset', { method: 'POST' });
      window.location.reload();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="text-red-400 text-xl font-bold mb-4">Oups ! Une erreur est survenue.</div>
        <p className="text-slate-400 mb-6">{error}</p>
        <button onClick={refreshDashboard} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors">
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Chargement...</div>;

  if (!data.user.faction) {
    return <FactionSelector onSelect={handleFactionSelect} />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {view === 'dashboard' && (
        <Dashboard
          user={data.user}
          lessonsCount={data.lessonsCount}
          reviewsCount={data.reviewsCount}
          hskStats={data.hskStats || {}}
          onStart={startSession}
          onOpenSettings={() => setShowSettings(true)}
          onOpenLevel={openLevel}
        />
      )}

      {view === 'level_detail' && (
        <LevelDetail
          level={currentLevel}
          items={levelItems}
          onBack={() => setView('dashboard')}
          onStartPractice={startPractice}
        />
      )}

      {(view === 'lessons' || view === 'reviews') && (
        view === 'lessons' ?
          <LessonSession items={sessionItems} onComplete={refreshDashboard} /> :
          <ReviewSession items={sessionItems} onComplete={refreshDashboard} isPractice={isPractice} />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onReset={handleReset}
        />
      )}
    </main>
  );
}

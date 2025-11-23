export const SRS_INTERVALS = { 
  1: 4, 2: 8, 3: 23, 4: 47, 5: 167, 6: 336, 7: 730, 8: 2920, 9: Infinity
};

export const calculateNextReview = (stage) => {
  const hours = SRS_INTERVALS[stage] || 4;
  const now = new Date();
  now.setHours(now.getHours() + hours);
  return now.toISOString();
};

export const TONE_COLORS = {
  1: "text-red-500 border-red-500",     
  2: "text-green-500 border-green-500", 
  3: "text-blue-500 border-blue-500",   
  4: "text-purple-500 border-purple-500", 
  5: "text-slate-500 border-slate-500"   
};

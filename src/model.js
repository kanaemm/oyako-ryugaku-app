export const categories = ['最初に決めること', 'パスポート', '母親の過ごし方', '子どもの学校', '運転・免許', 'お金・手続き'];
export const initialProfile = { duration: 'year', activity: 'guardian', children: ['preschool', 'elementary'], departure: '', driving: 'yes' };
export function matches(task, profile) {
  return Object.entries(task.conditions || {}).every(([key, values]) => Array.isArray(profile[key]) ? profile[key].some(value => values.includes(value)) : values.includes(profile[key]));
}
export function dueDate(departure, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(departure)) return null;
  const date = new Date(`${departure}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
export function progress(tasks, completed) { return { done: tasks.filter(t => completed[t.id]).length, total: tasks.length }; }
export function validProfile(p) {
 return p && ['short','year','move'].includes(p.duration) && ['work','nomad','study','guardian'].includes(p.activity) && Array.isArray(p.children) && p.children.length > 0 && p.children.every(c => ['preschool','elementary','secondary'].includes(c)) && ['yes','no'].includes(p.driving) && typeof p.departure === 'string' && (p.departure === '' || /^\d{4}-\d{2}-\d{2}$/.test(p.departure));
}

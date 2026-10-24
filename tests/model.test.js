import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { matches, dueDate, progress, initialProfile, validProfile } from '../src/model.js';
const tasks=JSON.parse(readFileSync(new URL('../public/tasks.json',import.meta.url)));
test('guardian family gets both school stages, but no employment/student tasks',()=>{
 const ids=tasks.filter(t=>matches(t,initialProfile)).map(t=>t.id);
 for(const id of ['guardian','nursery','transfer','learning']) assert.ok(ids.includes(id));
 for(const id of ['nomad','work','study','dependent','future']) assert.ok(!ids.includes(id));
});
test('all duration and parent choices retain matching tasks only',()=>{
 for(const duration of ['short','year','move']) for(const activity of ['work','nomad','study','guardian']) {
 const selected=tasks.filter(t=>matches(t,{...initialProfile,duration,activity,driving:'no'}));
 assert.ok(selected.length>0);
 assert.ok(!selected.some(t=>['license','international'].includes(t.id)));
 assert.equal(selected.some(t=>t.id==='learning'),duration==='year');
 assert.equal(selected.some(t=>t.id==='guardian'),activity==='guardian');
 }
});
test('calendar subtraction handles leap days and year boundaries',()=>{
 assert.equal(dueDate('2028-03-01',1),'2028-02-29');
 assert.equal(dueDate('2027-01-01',30),'2026-12-02');
 assert.equal(dueDate('',30),null);
});
test('progress ignores completed tasks excluded by current profile',()=>{
 assert.deepEqual(progress([{id:'a'},{id:'b'}],{a:true,hidden:true}),{done:1,total:2});
});
test('corrupt stored profiles are rejected',()=>{
 assert.ok(validProfile(initialProfile));assert.ok(!validProfile({}));assert.ok(!validProfile({...initialProfile,children:['bad']}));
});
test('editable data has unique ids, no false verification claims, and all six categories',()=>{
 assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
 assert.equal(new Set(tasks.map(t=>t.category)).size,6);
 for(const t of tasks){assert.ok(t.title&&t.description&&t.note);assert.ok(Number.isInteger(t.daysBefore));assert.equal(t.lastVerified,null);assert.equal(t.status,'needs-review');if(t.sourceUrl)assert.ok(t.sourceUrl.startsWith('https://'));}
});

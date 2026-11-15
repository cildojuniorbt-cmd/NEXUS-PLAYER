import test from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {buildLibraryBackup,parseLibraryBackup,replaceLibraryData} from './library-backup-core.mjs';

function openTestDB(name){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open(name,1);
  request.onupgradeneeded=()=>{
   request.result.createObjectStore('tracks',{keyPath:'id'});
   request.result.createObjectStore('playlists',{keyPath:'id'});
  };
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
}
function getAll(db,store){
 return new Promise((resolve,reject)=>{
  const request=db.transaction(store).objectStore(store).getAll();
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
}
test('IndexedDB restore atomically replaces old tracks and playlists',async()=>{
 const db=await openTestDB('nexus-backup-restore-test');
 await replaceLibraryData(db,[{id:'old-track',name:'Antiga'}],[{id:'old-list',name:'Antiga',trackIds:[]}]);
 const audio=new Blob([new Uint8Array([7,8,9])],{type:'audio/mp4'});
 const backup=await buildLibraryBackup([{id:'new-track',name:'Nova.m4a',favorite:true,blob:audio,coverBlob:null}],[{id:'new-list',name:'Nova',trackIds:['new-track'],createdAt:99}]);
 const restored=parseLibraryBackup(JSON.parse(JSON.stringify(backup)));
 await replaceLibraryData(db,restored.tracks,restored.playlists);
 const tracks=await getAll(db,'tracks'),playlists=await getAll(db,'playlists');
 assert.equal(tracks.length,1);
 assert.equal(tracks[0].id,'new-track');
 assert.equal(tracks[0].favorite,true);
 assert.deepEqual([...new Uint8Array(await tracks[0].blob.arrayBuffer())],[7,8,9]);
 assert.equal(playlists.length,1);
 assert.equal(playlists[0].id,'new-list');
 db.close();
});
test('invalid backup is rejected before IndexedDB replacement is called',async()=>{
 const db=await openTestDB('nexus-backup-invalid-test');
 await replaceLibraryData(db,[{id:'keep-me',name:'Preservada'}],[]);
 const before=await getAll(db,'tracks');
 assert.throws(()=>parseLibraryBackup({format:'nexus-player-library-backup',version:1,tracks:[{record:{id:'bad'},blob:{data:'!!!'},coverBlob:null}],playlists:[]}));
 assert.deepEqual(await getAll(db,'tracks'),before);
 db.close();
});

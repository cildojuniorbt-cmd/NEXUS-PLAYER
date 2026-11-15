import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLibraryBackup,parseLibraryBackup} from './library-backup-core.mjs';

test('round-trip preserves audio, cover, metadata, favorites and playlists',async()=>{
 const audio=new Blob([new Uint8Array([0,1,2,127,128,254,255])],{type:'audio/mpeg'});
 const cover=new Blob([new Uint8Array([255,216,255,0,1])],{type:'image/jpeg'});
 const tracks=[{id:'track-1',name:'Faixa teste.m4a',artist:'Artista',album:'Álbum',kind:'audio',favorite:true,addedAt:123,blob:audio,coverBlob:cover}];
 const playlists=[{id:'playlist-1',name:'Favoritas',trackIds:['track-1'],createdAt:456}];
 const backup=await buildLibraryBackup(tracks,playlists);
 const restored=parseLibraryBackup(JSON.parse(JSON.stringify(backup)));
 assert.equal(restored.tracks.length,1);
 assert.equal(restored.tracks[0].favorite,true);
 assert.equal(restored.tracks[0].name,'Faixa teste.m4a');
 assert.deepEqual([...new Uint8Array(await restored.tracks[0].blob.arrayBuffer())],[0,1,2,127,128,254,255]);
 assert.deepEqual([...new Uint8Array(await restored.tracks[0].coverBlob.arrayBuffer())],[255,216,255,0,1]);
 assert.equal(restored.tracks[0].blob.type,'audio/mpeg');
 assert.deepEqual(restored.playlists,playlists);
});
test('rejects an unknown backup format',()=>assert.throws(()=>parseLibraryBackup({format:'other',version:1,tracks:[],playlists:[]})));
test('rejects corrupted Base64 before any database write',()=>assert.throws(()=>parseLibraryBackup({format:'nexus-player-library-backup',version:1,tracks:[{record:{id:'x'},blob:{data:'%%%'} ,coverBlob:null}],playlists:[]})));
test('rejects duplicate track IDs',()=>assert.throws(()=>parseLibraryBackup({format:'nexus-player-library-backup',version:1,tracks:[{record:{id:'x'},blob:null,coverBlob:null},{record:{id:'x'},blob:null,coverBlob:null}],playlists:[]})));

// Browser-safe serialization and validation for NEXUS PLAYER library backups.
export function bytesToBase64(buffer){
 const bytes=new Uint8Array(buffer),chunk=0x8000;
 let binary='';
 for(let offset=0;offset<bytes.length;offset+=chunk)binary+=String.fromCharCode(...bytes.subarray(offset,Math.min(offset+chunk,bytes.length)));
 return btoa(binary);
}
export function base64ToBlob(encoded,type){
 if(typeof encoded!=='string')throw new Error('Conteúdo Base64 inválido no backup.');
 let binary;
 try{binary=atob(encoded);}catch{throw new Error('Um arquivo do backup está corrompido (Base64 inválido).');}
 const bytes=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 return new Blob([bytes],{type:type||'application/octet-stream'});
}
export async function serializeBackupTrack(track){
 const record={...track};
 delete record.blob;delete record.coverBlob;
 return {
  record,
  blob:track.blob?{type:track.blob.type||'application/octet-stream',data:bytesToBase64(await track.blob.arrayBuffer())}:null,
  coverBlob:track.coverBlob?{type:track.coverBlob.type||'application/octet-stream',data:bytesToBase64(await track.coverBlob.arrayBuffer())}:null
 };
}
export async function buildLibraryBackup(tracks,playlists){
 const payload={format:'nexus-player-library-backup',version:1,createdAt:new Date().toISOString(),trackCount:tracks.length,playlistCount:playlists.length,tracks:[],playlists};
 for(const track of tracks)payload.tracks.push(await serializeBackupTrack(track));
 return payload;
}
export function parseLibraryBackup(payload){
 if(!payload||payload.format!=='nexus-player-library-backup'||payload.version!==1||!Array.isArray(payload.tracks)||!Array.isArray(payload.playlists))throw new Error('Esse arquivo não é um backup válido do NEXUS PLAYER.');
 const ids=new Set();
 const tracks=payload.tracks.map(item=>{
  if(!item||!item.record||typeof item.record.id!=='string'||!item.record.id.trim())throw new Error('O backup contém uma faixa inválida.');
  if(ids.has(item.record.id))throw new Error('O backup contém identificadores de faixa duplicados.');
  ids.add(item.record.id);
  if(item.blob!==null&&item.blob!==undefined&&(!item.blob||typeof item.blob.data!=='string'))throw new Error('O áudio de uma faixa está inválido no backup.');
  if(item.coverBlob!==null&&item.coverBlob!==undefined&&(!item.coverBlob||typeof item.coverBlob.data!=='string'))throw new Error('A capa de uma faixa está inválida no backup.');
  return {...item.record,blob:item.blob?base64ToBlob(item.blob.data,item.blob.type):null,coverBlob:item.coverBlob?base64ToBlob(item.coverBlob.data,item.coverBlob.type):null};
 });
 if(payload.playlists.some(p=>!p||typeof p.id!=='string'||!p.id.trim()||!Array.isArray(p.trackIds)))throw new Error('O backup contém uma playlist inválida.');
 const playlistIds=new Set();
 for(const playlist of payload.playlists){if(playlistIds.has(playlist.id))throw new Error('O backup contém identificadores de playlist duplicados.');playlistIds.add(playlist.id);}
 return {tracks,playlists:payload.playlists};
}

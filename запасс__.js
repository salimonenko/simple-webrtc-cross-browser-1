
//          var MediaStream = window.MediaStream;
         if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
 MediaStream = webkitMediaStream;
 }
 // global MediaStream:true
 if (typeof MediaStream !== 'undefined') {
 if (!('getVideoTracks' in MediaStream.prototype)) {
 MediaStream.prototype.getVideoTracks = function() {
 if (!this.getTracks) {
 return [];
 }
 var tracks = [];
 this.getTracks.forEach(function(track) {
 if (track.kind.toString().indexOf('video') !== -1) {
 tracks.push(track);
 }
 });
 return tracks;
 };
 MediaStream.prototype.getAudioTracks = function() {
 if (!this.getTracks) {
 return [];
 }
 var tracks = [];
 this.getTracks.forEach(function(track) {
 if (track.kind.toString().indexOf('audio') !== -1) {
 tracks.push(track);
 }
 });
 return tracks;
 };
 }
 // override "stop" method for all browsers
 if (typeof MediaStream.prototype.stop === 'undefined') {
 MediaStream.prototype.stop = function() {
 this.getTracks().forEach(function(track) {
 track.stop();
 });
 };
 }
 }



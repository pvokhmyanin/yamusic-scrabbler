// Copyright 2018 Pavel Vokhmyanin <pavel.vokhmyanin@gmail.com>
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

// --------------------------------------------------------
// Tiny JavaScript code to export playlist from Yandex Music.
// Based on https://gist.github.com/jmiserez  export_google_music.js script
// --------------------------------------------------------

var allsongs = []
var outText = "";

var songsToText = function(){
  outText = "";
  var numEntries = 0;
  var seen = {};

  for (var i = 0; i < allsongs.length; i++) {
    var curr = "";
    var properTitle = allsongs[i].title.replace(/[\n\r!]/g, '').trim();
      curr = allsongs[i].artist + " - " + properTitle;
      if (!seen.hasOwnProperty(curr)){ // hashset
        outText = outText + curr + "\n";
        numEntries++;
        seen[curr] = true;
      } else {
        //console.log("Skipping (duplicate) " + curr);
      }
  }
  console.log("=============================================================");
  console.log(outText);
  console.log("=============================================================");
  try {
    copy(outText);
    console.log("copy(outText) to clipboard succeeded.");
  } catch (e) {
    console.log("copy(outText) to clipboard failed, please type copy(outText) on the console or copy the log output above.");
  }
  console.log("Done! " + numEntries + " lines in output. Used " + numEntries + " unique entries out of " + allsongs.length + ".");
};


var getPlaylistWindow = function(){
  return document.getElementsByClassName("page-playlist__tracks-list")[0];
}

function sleep(ms) {
  ms += new Date().getTime();
  while (new Date() < ms){}
}

var scrapeSongs = function(){
  var intervalms = 100; //in ms
  var timeoutms = 60000; //in ms
  var retries = timeoutms / intervalms;
  var total = [];
  var seen = {};
  var topId = "";

  // Scroll to bottom
  document.getElementsByClassName("page-playlist__recommends")[0].scrollIntoView(false);
  // Sleep to allow yandex load the playlist
  sleep(500);

  // Get last track ID
  var plbody = getPlaylistWindow();
  var songs = plbody.getElementsByClassName("d-track");
  var last_track_id = songs[songs.length-1].getElementsByClassName("d-track__id")[0].textContent;
  console.log("Total tracks: " + last_track_id);

  // Scroll back to top
  document.getElementsByClassName("page-playlist__tracks-list")[0].scrollIntoView();

  // Walk playlist
  var interval = setInterval(function(){
    var songs = getPlaylistWindow().getElementsByClassName("d-track");
    for (var i = 0; i < songs.length; i++) {
      var curr = {
        id:     parseInt(songs[i].getElementsByClassName("d-track__id")[0].textContent),
        artist: songs[i].getElementsByClassName("d-track__artists")[0].getElementsByTagName("a")[0].textContent,
        title:  songs[i].getElementsByClassName("d-track__title")[0].textContent
      }
      if (!seen.hasOwnProperty(curr.id)){
        total.push(curr);
        seen[curr.id] = true;
      }
      if (curr.id > 2 && !seen.hasOwnProperty(curr.id-1)){
        console.log("=============================================================");
        console.log("Shit went wrong! Detected song ID jump on " + curr.id);
        console.log("=============================================================");
      }
      if (curr.id == last_track_id) {
        clearInterval(interval);
        allsongs = total;
        console.log("Got " + total.length + " songs.");
        songsToText();
      }
    }
    songs[songs.length-1].scrollIntoView(true);
  
  }, intervalms);
};

scrapeSongs();


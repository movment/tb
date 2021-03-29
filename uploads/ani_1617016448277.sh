#!/bin/bash

AUTH="--auth slddhealr:ehddls94!K"

TORRENTLIST=`transmission-remote $AUTH --list | sed -e "1d;$d;s/^ *//" | cut -s -d " " -f 1`
for TORRENTID in $TORRENTLIST
do
  DL_COMPLETED=`transmission-remote $AUTH --torrent $TORRENTID --info | grep "Percent Done: 100%"`
  STATE_STOPPED=`transmission-remote $AUTH --torrent $TORRENTID --info | grep "State: Seeding\|Stopped\|Finished\|Idle"`
  if [ -n "$DL_COMPLETED" ] && [ -n "$STATE_STOPPED" ]; then
    transmission-remote $AUTH --torrent $TORRENTID --remove
  fi
done

while read in;
do
  out=$(echo $in | sed 's/- \([[:digit:]]\+\)\( END\)\? (.*)\.mp4/- \1\.mp4/')
  mv "${in}" "${out}"
done < <(find /data/Plex/애니 -name *.mp4)

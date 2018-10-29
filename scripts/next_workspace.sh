#!/usr/bin/env bash

#----------------------------------------------------------------------
# Creates a 'next workspace' button, which cycles through the
# available workspaces.
#----------------------------------------------------------------------

echo "| iconName=computer showMenu=false"

if [ "$ARGOS_CLICKED" == "true" ]; then
  # // https://askubuntu.com/a/176614
  D=$(wmctrl -d | awk '$2=="*"{cur=NR} END{print cur % NR}')
  wmctrl -s "$D"
fi

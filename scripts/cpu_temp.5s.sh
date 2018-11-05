#!/usr/bin/env bash

#----------------------------------------------------------------------
# Shows CPU temperature.
#
# Argos compatible
#----------------------------------------------------------------------

temp=$(cat /sys/class/thermal/thermal_zone0/temp | awk '{print $1/1000 }')
echo "$temp°"
echo "-----"
if [ "$ARGOS_MENU_OPEN" == "true" ]; then
  echo "$(sensors | awk 1 ORS="\\\\n") | font=monospace"
else
  echo "..."
fi

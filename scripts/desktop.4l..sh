#!/usr/bin/env bash

#----------------------------------------------------------------------
# Creates a 'Show Desktop' button, which toggles desktop view on
# and off when clicked.
#
# Depends on wmcrtl: https://sites.google.com/site/tstyblo/wmctrl
#----------------------------------------------------------------------

echo "| iconName=desktop showMenu=false "

if [ "$ARGOS_CLICKED" == "true" ]; then
    if wmctrl -m | grep -q "mode: ON"; then
        wmctrl -k off
    else
        wmctrl -k on
    fi
fi







#!/usr/bin/env bash

#----------------------------------------------------------------------
# Creates a configuration menu.
#
# Argos compatible
#----------------------------------------------------------------------

echo "| iconName=preferences-system"
echo "---"

echo "General | iconName=preferences-desktop bash=gnome-control-center terminal=false"

function entry() {
  if [ -x "$(command -v "$1")" ]; then
    echo "$2 | iconName=${3:-$1} bash=$1 terminal=false"
  fi
}

entry "gnome-tweaks" "Tweaks"
entry "dconf-editor" "Dconf editor"
entry "gconf-editor" "Gconf editor"
entry "pavucontrol" "Pulseaudio"
entry "galternatives" "Alternatives"
entry "ibus-setup" "IBus"
entry "gnome-session-properties" "Startup Apps" "system-run"
entry "systemadm" "Systemd" "system-run"
entry "gnome-software" "Software"
entry "synaptic-pkexec" "Synaptic"
entry "seahorse" "Passwords"
entry "nvidia-settings" "NVidia settings"
entry "gufw" "Firewall"
entry "gnome-nettool" "Nettool"
entry "gnome-boxes" "Boxes"
entry "gnome-logs" "Logs"
echo "Updates | iconName=system-software-update bash='gnome-software --mode updates' terminal=false"




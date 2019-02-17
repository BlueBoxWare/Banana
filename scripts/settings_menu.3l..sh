#!/usr/bin/env bash

#----------------------------------------------------------------------
# Creates a configuration menu.
#
# Argos compatible
#----------------------------------------------------------------------

echo "| iconName=preferences-system"
echo "---"

echo "General | iconName=preferences-desktop bash=gnome-control-center terminal=false"

# entry <command> <name> [icon] [full commandline]
function entry() {
  if [ -x "$(command -v "$1")" ]; then
    echo "$2 | iconName=${3:-$1} bash='${4:-$1}' terminal=false"
  fi
}

entry "gnome-tweaks" "Tweaks" "preferences-other"
entry "galternatives" "Alternatives"
entry "gnome-boxes" "Boxes"
entry "dconf-editor" "Dconf editor"
entry "gufw" "Firewall"
entry "gconf-editor" "Gconf editor"
entry "ibus-setup" "IBus"
entry "keepassx" "KeePassX"
entry "gnome-logs" "Logs"
entry "gnome-nettool" "Nettool"
entry "nvidia-settings" "NVidia settings"
entry "seahorse" "Passwords"
entry "pavucontrol" "Pulseaudio"
entry "gnome-software" "Software"
entry "software-properties-gtk" "Software settings"
entry "gnome-session-properties" "Startup Apps" "system-run"
entry "synaptic-pkexec" "Synaptic"
entry "systemadm" "Systemd" "system-run"
entry "gnome-software" "Updates" "system-software-update" "gnome-software --mode updates"




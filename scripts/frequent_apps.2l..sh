#!/usr/bin/env bash

#----------------------------------------------------------------------
# Creates a 'frequent apps' menu. Bash version.
#
# Argos compatible
#----------------------------------------------------------------------

#----------------------------------------------------------------------
# Configuration
#----------------------------------------------------------------------
INCLUDE_FAVORITES=false
NR_OF_ITEMS=15
EXCLUDE_WINE=true # whether or not to exclude Wine apps
SORT=true # whether or not to sort by name instead of by priority
#----------------------------------------------------------------------

echo "| iconName=applications-other"
echo "-----"

if [ "$INCLUDE_FAVORITES" = "false" ]; then
   FAVORITES=$(dconf read /org/gnome/shell/favorite-apps)
fi

if [ "$FAVORITES" = "" ]; then
    FAVORITES="[]"
fi

dbus-send --session --print-reply --type=method_call --dest=org.gnome.Shell /org/gnome/Shell org.gnome.Shell.Eval string:'
    let s = "";
    let favorites = '"$FAVORITES"';
    let mostUsed = imports.gi.Shell.AppUsage.get_default().get_most_used("");
    let count = 0;
    for (let i = 0; i < mostUsed.length; i++) {
        let shellApp = mostUsed[i]
        let appInfo = shellApp.get_app_info()
        if (appInfo != null && appInfo.should_show() && !favorites.includes(shellApp.get_id())) {
            let cmd = appInfo.get_commandline()
            if ("'"$EXCLUDE_WINE"'" == "true" && cmd.match(/\swine\s/g)) continue;
            let appName = shellApp.get_name()
            appName = appName.charAt(0).toUpperCase() + appName.slice(1);
            if (cmd != null) {
                let acmd = cmd.replace(/%\w/g, "").replace(/"/g, "#DQ#")
                let icon = appInfo.get_icon().to_string()
                if (icon.indexOf("/") > -1) {
                    icon="applications-other";
                }
                s += appName + " | bash=#Q#" + acmd + "#Q# iconName=" + icon + " terminal=false #N#";
                if (++count >= '"$NR_OF_ITEMS"') break;
            }
        }
    }
    s;
' | tail -1 | sed -r -e 's/\s*string\s*""//' -e 's/\&/&amp;/g' -e 's/#N#/\n/g' -e 's/^(\\?")*//g' -e 's/(\n|\\?")*$//g' -e "s/#Q#/'/g" -e 's/#DQ#/"/g' | ( [ "$SORT" == "true" ] && sort || cat )

echo "Other... | bash='dbus-send --session --type=method_call --dest=org.gnome.Shell /org/gnome/Shell org.gnome.Shell.ShowApplications' terminal=false"

#!/usr/bin/env python3

#----------------------------------------------------------------------
# Creates a 'frequent apps' menu. Python version.
#
# Depends on Python3, python3-pydbus and python3-gi
#
# Argos compatible
#----------------------------------------------------------------------

#----------------------------------------------------------------------
# Configuration
#----------------------------------------------------------------------
exclude_favorites = True
exclude_wine = False # whether or not to exclude Wine apps
nr_of_items = 10
#----------------------------------------------------------------------

import re
from pydbus import SessionBus
from gi.repository import Gio

bus = SessionBus()
shell = bus.get('org.gnome.Shell', '/org/gnome/Shell')

if (exclude_favorites):
  favorites = Gio.Settings.new('org.gnome.shell').get_value('favorite-apps')
else:
  favorites = []

result = re.sub(r"#N#", "\n", shell.Eval('''
    let s = "";
    let favorites = ''' + str(favorites) + ''';
    let mostUsed = imports.gi.Shell.AppUsage.get_default().get_most_used("");
    let count = 0;
    for (let i = 0; i < mostUsed.length; i++) {
        let shellApp = mostUsed[i]
        let appInfo = shellApp.get_app_info()
        if (appInfo != null && appInfo.should_show() && !favorites.includes(shellApp.get_id())) {
            let cmd = appInfo.get_commandline()
            if (''' + ('true' if exclude_wine else 'false') + ''' && cmd.match(/\swine\s/g)) continue;
            let appName = shellApp.get_name()
            appName = appName.charAt(0).toUpperCase() + appName.slice(1);
            if (cmd != null) {
                let acmd = cmd.replace(/%\w/g, "")
                let icon = appInfo.get_icon().to_string()
                if (icon.indexOf("/") > -1) {
                    icon="applications-other";
                }
                s += appName + " | bash='" + acmd + "' iconName=" + icon + " terminal=false #N#";
                if (++count >= ''' + str(nr_of_items) + ''') break;
            }
        }
    }
    s;
''')[1])


print('| iconName=applications-other')
print('-----')
print(result[1:-2])

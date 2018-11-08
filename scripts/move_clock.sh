#!/usr/bin/env bash

#----------------------------------------------------------------------
#
# Moves the clock to the right after the start of GNOME.
#
#----------------------------------------------------------------------

echo " "

exec 1>&-

# Trying to move too soon doesn't work. How long we have to wait
# is probably different on different systems and might need some
# experimentation.
sleep 5

dbus-send --session --print-reply --type=method_call --dest=org.gnome.Shell /org/gnome/Shell org.gnome.Shell.Eval string:'
    // Code from Frippery Move Clock by rmyorston
    // https://extensions.gnome.org/extension/2/move-clock/
    if ( imports.ui.main.sessionMode.panel.center.indexOf("dateMenu") != -1 ) {
      let centerBox = imports.ui.main.panel._centerBox;
      let rightBox = imports.ui.main.panel._rightBox;
      let dateMenu = imports.ui.main.panel.statusArea["dateMenu"];
      let children = centerBox.get_children();

      if ( children.indexOf(dateMenu.container) != -1 ) {
          centerBox.remove_actor(dateMenu.container);
          children = rightBox.get_children();
          rightBox.insert_child_at_index(dateMenu.container, children.length-1);
      }
    }
' > /dev/null

exit 0




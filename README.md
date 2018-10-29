***Banana*** is a fork of the great [***Argos***](https://github.com/p-e-w/argos) GNOME Shell extension.

Like Argos, Banana let's you create GNOME Shell extensions using Bash or your favorite language. See the [Argos manual](https://github.com/p-e-w/argos) for more information on how to use Argos (and Banana).

Differences between Banana and Argos:
* Banana makes it possible to attach actions to the panel icon itself. These actions are executed when the button is clicked.
* You can specify in the settings with which terminal emulator a _bash action_ should be executed. Any terminal which
supports the `-e` option in the same way as _gnome-terminal_ can be used.
* The name of the script is not shown at the bottom of the menu (at least by default, this can be changed in the settings).
* Banana looks in `~/.config/banana` for scripts, instead of `~/.config/argos`.

### Installation
1. Download or clone this repository and put the directory `banana@blueboxware.github.com` in `~/.local/share/gnome-shell/extensions`
2. Restart Gnome Shell: press <kbd>Alt-F2</kbd> and type `r` followed by <kbd>enter</kbd>.
3. ...
4. Profit

### Actions on panel icons
Actions on panel icons are specified the same way as for regular menu items and support the same options. Unlike Argos, Banana always runs the script when the panel icon is clicked and when the current active button has an action, this action is executed and no menu is shown. If you _do_ want a menu to be shown when a button with an action is clicked, use `showMenu=true`.

Here is an example of a panel icon which will run top when clicked:

```bash
#!/usr/bin/env bash

echo "| iconName=system-monitor bash=top"
```

Besides `ARGOS_MENU_OPEN` and `ARGOS_VERSION` Banana passes two additional environment variables when running a script: `ARGOS_IS_BANANA`, which is always `true`, and `ARGOS_CLICKED`, which is `true` when the script is run as a result of a click on the panel icon and `false` otherwise.

Here is another example (it depends on `wmctrl`), which adds a _show desktop_ icon to the panel. Note that it's not necessary to use `+` in the filename of the script because with Banana scripts are always executed when the icon is clicked:

```bash
#!/usr/bin/env bash

echo "| iconName=desktop showMenu=false"

if [ "$ARGOS_CLICKED" == "true" ]; then
    if wmctrl -m | grep -q "mode: ON"; then
        wmctrl -k off
    else
        wmctrl -k on
    fi
fi
```

The directory [`scripts`](scripts/) contains more scripts. If you like to use one of these scripts, put it in `~/.config/banana` and make it executable.

### Compatibility
Most, if not all, Argos scripts should run correctly with Banana. It is also possible to have Argos and Banana installed and active at the same time. I don't know if Banana is compatible with Gnome 3.30, but I assume it is.

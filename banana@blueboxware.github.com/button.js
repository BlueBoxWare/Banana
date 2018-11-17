/*
 * Banana
 *
 * Copyright (c) 2016-2018 Philipp Emanuel Weidmann <pew@worldwidemann.com>
 * Copyright (c) 2018 BlueBoxWare
 *
 * Nemo vir est qui mundum non reddat meliorem.
 *
 * Released under the terms of the GNU General Public License, version 3
 * (https://gnu.org/licenses/gpl.html)
 */

const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const BananaLineView = Extension.imports.lineview.BananaLineView;
const BananaMenuItem = Extension.imports.menuitem.BananaMenuItem;
const Utilities = Extension.imports.utilities;

var BananaButton = new Lang.Class({
  Name: "BananaButton",
  Extends: PanelMenu.Button,

  _init: function(file, settings) {
    this.parent(0, "", false);

    this._file = file;
    this._updateInterval = settings.updateInterval;

    this._lineView = new BananaLineView();
    this._lineView.setMarkup(
      "<small><i>" +
        GLib.markup_escape_text(file.get_basename(), -1) +
        " ...</i></small>"
    );
    this.actor.add_actor(this._lineView);

    this._isDestroyed = false;

    this._updateTimeout = null;
    this._cycleTimeout = null;

    this.connect(
      "destroy",
      Lang.bind(this, this._onDestroy)
    );

    this._updateRunning = false;

    this._update(false, false);
  },

  _onEvent: function(actor, event) {
    if (
      event.type() == Clutter.EventType.TOUCH_BEGIN ||
      event.type() == Clutter.EventType.BUTTON_PRESS
    ) {
      let line = this._lineView.line;
      let toggleMenu = false;

      if (this.menu && this.menu.isOpen) {
        this.update(true, false);
        toggleMenu = true;
      } else {
        this.update(true, true);
      }

      if (line.hasAction) {
        Utilities.execute(this, line);
        if (
          line.hasOwnProperty("showMenu") &&
          line.showMenu === "true" &&
          this.menu &&
          !this.menu.isOpen
        ) {
          toggleMenu = true;
        }
      } else if (
        !line.hasOwnProperty("showMenu") ||
        line.showMenu !== "false"
      ) {
        toggleMenu = true;
      }

      if (toggleMenu) {
        this.menu.toggle();
      }
    }

    return Clutter.EVENT_PROPAGATE;
  },

  _onDestroy: function() {
    this._isDestroyed = true;

    if (this._updateTimeout !== null) {
      Mainloop.source_remove(this._updateTimeout);
    }
    if (this._cycleTimeout !== null) {
      Mainloop.source_remove(this._cycleTimeout);
    }

    this.menu.removeAll();
  },

  update: function(clicked, willopen) {
    if (this._updateTimeout !== null) {
      Mainloop.source_remove(this._updateTimeout);
      this._updateTimeout = null;
    }

    this._update(clicked, willopen);
  },

  _update: function(clicked, willopen) {
    if (this._updateRunning) {
      return;
    }

    this._updateRunning = true;

    let envp = GLib.get_environ();
    envp.push("ARGOS_VERSION=2");
    envp.push("ARGOS_IS_BANANA=true");
    envp.push(
      "ARGOS_MENU_OPEN=" + (this.menu.isOpen || willopen ? "true" : "false")
    );
    envp.push("ARGOS_CLICKED=" + (clicked ? "true" : "false"));

    try {
      Utilities.spawnWithCallback(
        null,
        [this._file.get_path()],
        envp,
        0,
        null,
        Lang.bind(this, function(standardOutput) {
          this._updateRunning = false;

          if (this._isDestroyed) {
            return;
          }

          this._processOutput(standardOutput.split("\n"));

          if (this._updateInterval !== null) {
            this._updateTimeout = Mainloop.timeout_add_seconds(
              this._updateInterval,
              Lang.bind(this, function() {
                this._updateTimeout = null;
                this._update();
                return false;
              })
            );
          }
        })
      );
    } catch (error) {
      log(
        "Unable to execute file '" + this._file.get_basename() + "': " + error
      );
      this._updateRunning = false;
    }
  },

  _processOutput: function(output) {
    let buttonLines = [];
    let dropdownLines = [];

    let dropdownMode = false;

    for (let i = 0; i < output.length; i++) {
      if (output[i].length === 0) {
        continue;
      }

      let line = Utilities.parseLine(output[i]);

      if (!dropdownMode && line.isSeparator) {
        dropdownMode = true;
      } else if (dropdownMode) {
        dropdownLines.push(line);
      } else {
        buttonLines.push(line);
      }
    }

    this.menu.removeAll();

    if (this._cycleTimeout !== null) {
      Mainloop.source_remove(this._cycleTimeout);
      this._cycleTimeout = null;
    }

    this.actor.visible = buttonLines.length > 0 || !dropdownMode;

    if (!this.actor.visible)
      return;

    if (buttonLines.length === 0) {
      this._lineView.setMarkup(
        GLib.markup_escape_text(this._file.get_basename(), -1)
      );
    } else if (buttonLines.length === 1) {
      this._lineView.setLine(buttonLines[0]);
    } else {
      this._lineView.setLine(buttonLines[0]);
      let i = 0;
      this._cycleTimeout = Mainloop.timeout_add_seconds(
        3,
        Lang.bind(this, function() {
          i++;
          this._lineView.setLine(buttonLines[i % buttonLines.length]);
          return true;
        })
      );

      for (let j = 0; j < buttonLines.length; j++) {
        if (buttonLines[j].dropdown !== "false") {
          this.menu.addMenuItem(new BananaMenuItem(this, buttonLines[j]));
        }
      }
    }

    if (this.menu.numMenuItems > 0) {
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    }

    let menus = [];
    menus[0] = this.menu;

    for (let i = 0; i < dropdownLines.length; i++) {
      let menu;
      if (dropdownLines[i].menuLevel in menus) {
        menu = menus[dropdownLines[i].menuLevel];
      } else {
        log("Invalid menu level for line '" + dropdownLines[i].text + "'");
        menu = this.menu;
      }

      let menuItem;

      if (dropdownLines[i].isSeparator) {
        // Although not documented, BitBar appears to render additional "---" lines as separators
        menuItem = new PopupMenu.PopupSeparatorMenuItem();
      } else if (
        i + 1 < dropdownLines.length &&
        dropdownLines[i + 1].menuLevel > dropdownLines[i].menuLevel
      ) {
        // GNOME Shell actually supports only a single submenu nesting level
        // (deeper levels are rendered, but opening them closes the parent menu).
        // Since adding PopupSubMenuMenuItems to submenus does not trigger
        // an error or warning, this should be considered a bug in GNOME Shell.
        // Once it is fixed, this code will work as expected for nested submenus.
        menuItem = new PopupMenu.PopupSubMenuMenuItem("", false);
        let lineView = new BananaLineView(dropdownLines[i]);
        menuItem.actor.insert_child_below(lineView, menuItem.label);
        menuItem.label.visible = false;
        menus[dropdownLines[i + 1].menuLevel] = menuItem.menu;
      } else if (
        i + 1 < dropdownLines.length &&
        dropdownLines[i + 1].menuLevel === dropdownLines[i].menuLevel &&
        dropdownLines[i + 1].hasOwnProperty("alternate") &&
        dropdownLines[i + 1].alternate === "true"
      ) {
        menuItem = new BananaMenuItem(
          this,
          dropdownLines[i],
          dropdownLines[i + 1]
        );
        // Skip alternate line
        i++;
      } else {
        menuItem = new BananaMenuItem(this, dropdownLines[i]);
      }

      menu.addMenuItem(menuItem);
    }

    if (Utilities.getSettings().get_boolean("show-script")) {
      if (dropdownLines.length > 0) {
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
      }

      let menuItem = new PopupMenu.PopupMenuItem(this._file.get_basename(), {
        style_class: "banana-menu-item-edit"
      });
      menuItem.connect(
        "activate",
        Lang.bind(this, function() {
          Gio.AppInfo.launch_default_for_uri(
            "file://" + this._file.get_path(),
            null
          );
        })
      );
      this.menu.addMenuItem(menuItem);
    }
  }
});

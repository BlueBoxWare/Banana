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

const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const PopupMenu = imports.ui.popupMenu;
const AltSwitcher = imports.ui.status.system.AltSwitcher;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Utilities = Extension.imports.utilities;
const BananaLineView = Extension.imports.lineview.BananaLineView;

var BananaMenuItem = new Lang.Class({
  Name: "BananaMenuItem",
  Extends: PopupMenu.PopupBaseMenuItem,

  _init: function(button, line, alternateLine) {
    let hasAction =
      line.hasAction ||
      (typeof alternateLine !== "undefined" && alternateLine.hasAction);

    this.parent({
      activate: hasAction,
      hover: hasAction,
      can_focus: hasAction
    });

    let altSwitcher = null;

    let lineView = new BananaLineView(line);

    if (typeof alternateLine === "undefined") {
      this.actor.add_child(lineView);
    } else {
      let alternateLineView = new BananaLineView(alternateLine);
      altSwitcher = new AltSwitcher(lineView, alternateLineView);
      lineView.visible = true;
      alternateLineView.visible = true;
      this.actor.add_child(altSwitcher.actor);
    }

    if (hasAction) {
      this.connect(
        "activate",
        Lang.bind(this, function() {
          let activeLine =
            altSwitcher === null ? line : altSwitcher.actor.get_child().line;

          Utilities.execute(button, activeLine);
        })
      );
    }
  }
});

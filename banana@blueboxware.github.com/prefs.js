/*
 * Banana
 *
 * Copyright (c) 2018 BlueBoxWare
 *
 * Released under the terms of the GNU General Public License, version 3
 * (https://gnu.org/licenses/gpl.html)
 */

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Utilities = Extension.imports.utilities;

function init() {}

const BananaPrefsWidget = GObject.registerClass(
  class BananaPrefsWidget extends Gtk.Grid {
    _init(params) {
      super._init(params);

      let settings = Utilities.getSettings();

      this.margin = 12;
      this.row_spacing = this.column_spacing = 6;
      this.set_orientation(Gtk.Orientation.VERTICAL);

      let scriptBox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL
      });

      let scriptLabel = new Gtk.Label({
        label: "Show script name in menu",
        halign: Gtk.Align.START
      });
      let switchy = new Gtk.Switch({
        active: true
      });

      settings.bind(
        "show-script",
        switchy,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );

      scriptBox.pack_start(scriptLabel, true, true, 0);
      scriptBox.add(switchy);

      this.add(scriptBox);

      let terminalBox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL
      });
      let terminalLabel = new Gtk.Label({
        label: "Terminal",
        halign: Gtk.Align.START
      });
      let entry = new Gtk.Entry({
        hexpand: true,
        margin_bottom: 12
      });

      settings.bind("terminal", entry, "text", Gio.SettingsBindFlags.DEFAULT);

      terminalBox.pack_start(terminalLabel, true, true, 0);
      terminalBox.add(entry);

      this.add(terminalBox);

      this.add(
        new Gtk.Label({
          label:
            "<b>Note: the specified terminal must support the -e option as found in Gnome-Terminal.</b>",
          use_markup: true,
          halign: Gtk.Align.START
        })
      );
    }
  }
);

function buildPrefsWidget() {
  let widget = new BananaPrefsWidget();
  widget.show_all();

  return widget;
}

/* vim:set et sw=2: */

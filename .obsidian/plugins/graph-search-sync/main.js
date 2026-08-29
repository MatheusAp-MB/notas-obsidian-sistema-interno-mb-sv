var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => GraphSearchSyncPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  enabled: true,
  includeLocalGraph: false,
  clearOnEmpty: true,
  debounceMs: 250,
  hoverHighlight: true
};
var GraphSearchSyncPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.attachedInput = null;
    this.hoveredResultEl = null;
    this.highlightedRenderers = /* @__PURE__ */ new Set();
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new GraphSearchSyncSettingTab(this.app, this));
    this.rebuildDebounce();
    this.addCommand({
      id: "toggle-sync",
      name: "Toggle sync",
      callback: async () => {
        this.settings.enabled = !this.settings.enabled;
        await this.saveSettings();
        new import_obsidian.Notice(
          this.settings.enabled ? "Search - Graph Highlighting: enabled" : "Search - Graph Highlighting: disabled"
        );
        if (this.settings.enabled) this.syncNow();
      }
    });
    this.addCommand({
      id: "sync-now",
      name: "Apply search query to graph now",
      callback: () => this.syncNow(true)
    });
    this.app.workspace.onLayoutReady(() => {
      this.attachToSearch();
      this.syncNow();
    });
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.attachToSearch();
        this.syncNow();
      })
    );
  }
  rebuildDebounce() {
    this.applyDebounced = (0, import_obsidian.debounce)(
      (query) => this.applyToGraphs(query),
      Math.max(0, this.settings.debounceMs),
      true
    );
  }
  getSearchInput() {
    var _a, _b;
    const leaf = this.app.workspace.getLeavesOfType("search")[0];
    const view = leaf == null ? void 0 : leaf.view;
    return (_b = (_a = view == null ? void 0 : view.searchComponent) == null ? void 0 : _a.inputEl) != null ? _b : null;
  }
  attachToSearch() {
    var _a, _b, _c, _d;
    const leaf = this.app.workspace.getLeavesOfType("search")[0];
    const view = leaf == null ? void 0 : leaf.view;
    const input = (_a = view == null ? void 0 : view.searchComponent) == null ? void 0 : _a.inputEl;
    if (!input || input === this.attachedInput) return;
    this.attachedInput = input;
    this.registerDomEvent(input, "input", () => this.onQueryChanged());
    const clearBtn = (_b = view == null ? void 0 : view.searchComponent) == null ? void 0 : _b.clearButtonEl;
    if (clearBtn) {
      this.registerDomEvent(
        clearBtn,
        "click",
        () => this.onQueryChanged()
      );
    }
    const container = (_d = (_c = view == null ? void 0 : view.dom) == null ? void 0 : _c.el) != null ? _d : view == null ? void 0 : view.containerEl;
    if (container) {
      this.registerDomEvent(
        container,
        "mouseover",
        (e) => this.onResultHover(e, view)
      );
      this.registerDomEvent(
        container,
        "mouseleave",
        () => this.endResultHover()
      );
    }
  }
  onResultHover(e, searchView) {
    var _a, _b, _c;
    if (!this.settings.hoverHighlight) return;
    const el = (_c = (_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(
      _a,
      ".tree-item.search-result"
    )) != null ? _c : null;
    if (el === this.hoveredResultEl) return;
    this.hoveredResultEl = el;
    if (!el) {
      this.clearGraphHighlights();
      return;
    }
    const file = this.fileForResultEl(searchView, el);
    if (file == null ? void 0 : file.path) this.highlightInGraphs(file.path);
    else this.clearGraphHighlights();
  }
  endResultHover() {
    this.hoveredResultEl = null;
    this.clearGraphHighlights();
  }
  fileForResultEl(searchView, el) {
    var _a;
    const lookup = (_a = searchView == null ? void 0 : searchView.dom) == null ? void 0 : _a.resultDomLookup;
    if (!lookup) return null;
    for (const [file, item] of lookup) {
      if ((item == null ? void 0 : item.el) === el) return file;
    }
    return null;
  }
  highlightInGraphs(path) {
    var _a, _b;
    this.clearGraphHighlights();
    const types = ["graph"];
    if (this.settings.includeLocalGraph) types.push("localgraph");
    for (const type of types) {
      for (const leaf of this.app.workspace.getLeavesOfType(type)) {
        const renderer = (_a = leaf.view) == null ? void 0 : _a.renderer;
        const node = (_b = renderer == null ? void 0 : renderer.nodeLookup) == null ? void 0 : _b[path];
        if (!node) continue;
        renderer.mouseX = null;
        renderer.mouseY = null;
        renderer.highlightNode = node;
        renderer.changed();
        this.highlightedRenderers.add(renderer);
      }
    }
  }
  clearGraphHighlights() {
    for (const renderer of this.highlightedRenderers) {
      if (renderer == null ? void 0 : renderer.highlightNode) {
        renderer.highlightNode = null;
        renderer.changed();
      }
    }
    this.highlightedRenderers.clear();
  }
  onunload() {
    this.clearGraphHighlights();
  }
  onQueryChanged() {
    if (!this.settings.enabled) return;
    const input = this.attachedInput;
    if (!input) return;
    this.applyDebounced(input.value);
  }
  /**
   * Immediately applies the current search query to all open graphs --
   * including an empty one, so a reopened graph does not keep a stale
   * filter. If an empty search should leave the graph alone, the
   * "clearOnEmpty" setting in applyToGraphs takes care of it.
   */
  syncNow(force = false) {
    if (!this.settings.enabled && !force) return;
    const input = this.getSearchInput();
    if (!input) return;
    this.applyToGraphs(input.value);
  }
  applyToGraphs(query) {
    var _a, _b, _c;
    if (!this.settings.clearOnEmpty && query.trim() === "") return;
    const types = ["graph"];
    if (this.settings.includeLocalGraph) types.push("localgraph");
    for (const type of types) {
      for (const leaf of this.app.workspace.getLeavesOfType(type)) {
        const view = leaf.view;
        const engine = (_a = view == null ? void 0 : view.dataEngine) != null ? _a : view == null ? void 0 : view.engine;
        const search = (_b = engine == null ? void 0 : engine.filterOptions) == null ? void 0 : _b.search;
        const inputEl = search == null ? void 0 : search.inputEl;
        if (inputEl) {
          if (inputEl.value === query) continue;
          inputEl.value = query;
          inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        } else if (typeof (search == null ? void 0 : search.setValue) === "function") {
          search.setValue(query);
          (_c = engine == null ? void 0 : engine.updateSearch) == null ? void 0 : _c.call(engine);
        }
      }
    }
  }
  async loadSettings() {
    const saved = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var GraphSearchSyncSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  // Declarative settings for Obsidian 1.13+: used for rendering and for
  // the settings search index.
  getSettingDefinitions() {
    return [
      {
        name: "Sync enabled",
        desc: "Automatically applies the global search query to the graph view filter.",
        control: {
          type: "toggle",
          key: "enabled",
          defaultValue: DEFAULT_SETTINGS.enabled
        }
      },
      {
        name: "Also filter local graphs",
        desc: "Additionally applies the search query to open local graph views.",
        control: {
          type: "toggle",
          key: "includeLocalGraph",
          defaultValue: DEFAULT_SETTINGS.includeLocalGraph
        }
      },
      {
        name: "Highlight node on search result hover",
        desc: "Hovering a search result in the list highlights the corresponding note in the graph.",
        control: {
          type: "toggle",
          key: "hoverHighlight",
          defaultValue: DEFAULT_SETTINGS.hoverHighlight
        }
      },
      {
        name: "Clear graph filter when search is empty",
        desc: "When the search query is cleared, the graph filter is cleared as well. If disabled, the last filter is kept.",
        control: {
          type: "toggle",
          key: "clearOnEmpty",
          defaultValue: DEFAULT_SETTINGS.clearOnEmpty
        }
      },
      {
        name: "Debounce delay (ms)",
        desc: "How long to wait after the last keystroke before updating the graph.",
        control: {
          type: "number",
          key: "debounceMs",
          defaultValue: DEFAULT_SETTINGS.debounceMs,
          placeholder: "250",
          min: 0,
          validate: (value) => value >= 0 ? void 0 : "Must be 0 or greater."
        }
      }
    ];
  }
  async setControlValue(key, value) {
    Object.assign(this.plugin.settings, { [key]: value });
    await this.plugin.saveSettings();
    if (key === "enabled" && value === true) this.plugin.syncNow();
    if (key === "debounceMs") this.plugin.rebuildDebounce();
  }
  // Fallback for Obsidian versions older than 1.13.0. Not called on 1.13+,
  // where the tab is rendered from getSettingDefinitions() instead.
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Sync enabled").setDesc(
      "Automatically applies the global search query to the graph view filter."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
        this.plugin.settings.enabled = value;
        await this.plugin.saveSettings();
        if (value) this.plugin.syncNow();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Also filter local graphs").setDesc(
      "Additionally applies the search query to open local graph views."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.includeLocalGraph).onChange(async (value) => {
        this.plugin.settings.includeLocalGraph = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Highlight node on search result hover").setDesc(
      "Hovering a search result in the list highlights the corresponding note in the graph."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.hoverHighlight).onChange(async (value) => {
        this.plugin.settings.hoverHighlight = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Clear graph filter when search is empty").setDesc(
      "When the search query is cleared, the graph filter is cleared as well. If disabled, the last filter is kept."
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.clearOnEmpty).onChange(async (value) => {
        this.plugin.settings.clearOnEmpty = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Debounce delay (ms)").setDesc(
      "How long to wait after the last keystroke before updating the graph."
    ).addText(
      (text) => text.setPlaceholder("250").setValue(String(this.plugin.settings.debounceMs)).onChange(async (value) => {
        const num = Number(value);
        if (!Number.isNaN(num) && num >= 0) {
          this.plugin.settings.debounceMs = num;
          await this.plugin.saveSettings();
          this.plugin.rebuildDebounce();
        }
      })
    );
  }
};

/* nosourcemap */
Bug 1917937: The logic presented below is fragile but accurate to the pixel. As new tab experiments with layouts, we have a tech debt of competing styles and classes the slightly modify where the search bar sits on the page. The larger solution for this is to replace everything with an intersection observer, but would require a larger refactor of this file. In the interim, we can programmatically calculate when to fire the fixed-scroll event and account for the moved elements so that topsites/etc stays in the same place. The CSS this references has been flagged to reference this logic so (hopefully) keep them in sync. */

    let SCROLL_THRESHOLD = 0; // When the fixed-scroll event fires
    let MAIN_OFFSET_PADDING = 0; // The padding to compensate for the moved elements

    let layout = {
      outerWrapperPaddingTop: 30,
      searchWrapperPaddingTop: 34,
      searchWrapperPaddingBottom: 38,
      searchWrapperFixedScrollPaddingTop: 27,
      searchWrapperFixedScrollPaddingBottom: 27,
      searchInnerWrapperMinHeight: 52,
      logoAndWordmarkWrapperHeight: 64,
      logoAndWordmarkWrapperMarginBottom: 48
    };
    const CSS_VAR_SPACE_XXLARGE = 34.2; // Custom Acorn themed variable (8 * 0.267rem);

    // Experimental layouts
    // (Note these if statements are ordered to match the CSS cascade)
    if (thumbsUpDownLayoutEnabled || layoutsVariantAorB) {
      // Thumbs Compact View Layout
      if (thumbsUpDownLayoutEnabled) {
        layout.logoAndWordmarkWrapperMarginBottom = CSS_VAR_SPACE_XXLARGE;
        if (!logoAlwaysVisible) {
          layout.searchWrapperPaddingTop = CSS_VAR_SPACE_XXLARGE;
          layout.searchWrapperPaddingBottom = CSS_VAR_SPACE_XXLARGE;
        }
      }

      // Variant B Layout
      if (layoutsVariantAEnabled) {
        layout.outerWrapperPaddingTop = 24;
        if (!thumbsUpDownLayoutEnabled) {
          layout.searchWrapperPaddingTop = 0;
          layout.searchWrapperPaddingBottom = 32;
          layout.logoAndWordmarkWrapperMarginBottom = 32;
        }
      }

      // Variant B Layout
      if (layoutsVariantBEnabled) {
        layout.outerWrapperPaddingTop = 24;
        // Logo is positioned absolute, so remove it
        layout.logoAndWordmarkWrapperHeight = 0;
        layout.logoAndWordmarkWrapperMarginBottom = 0;
        layout.searchWrapperPaddingTop = 16;
        layout.searchWrapperPaddingBottom = CSS_VAR_SPACE_XXLARGE;
        if (!thumbsUpDownLayoutEnabled) {
          layout.searchWrapperPaddingBottom = 32;
        }
      }
    }

    // Logo visibility applies to all layouts
    if (!logoAlwaysVisible) {
      layout.logoAndWordmarkWrapperHeight = 0;
      layout.logoAndWordmarkWrapperMarginBottom = 0;
    }
    SCROLL_THRESHOLD = layout.outerWrapperPaddingTop + layout.searchWrapperPaddingTop + layout.logoAndWordmarkWrapperHeight + layout.logoAndWordmarkWrapperMarginBottom - layout.searchWrapperFixedScrollPaddingTop;
    MAIN_OFFSET_PADDING = layout.searchWrapperPaddingTop + layout.searchWrapperPaddingBottom + layout.searchInnerWrapperMinHeight + layout.logoAndWordmarkWrapperHeight + layout.logoAndWordmarkWrapperMarginBottom;

    // Edge case if logo and thums are turned off, but Var A is enabled
    if (SCROLL_THRESHOLD < 1) {
      SCROLL_THRESHOLD = 1;
    }
    if (__webpack_require__.g.scrollY > SCROLL_THRESHOLD && !this.state.fixedSearch) {
      this.setState({
        fixedSearch: true,
        fixedNavStyle: {
          paddingBlockStart: ${MAIN_OFFSET_PADDING}px
        }
      });
    } else if (__webpack_require__.g.scrollY <= SCROLL_THRESHOLD && this.state.fixedSearch) {
      this.setState({
        fixedSearch: false,
        fixedNavStyle: {}
      });
    }
  }
  openPreferences() {
    this.props.dispatch(actionCreators.OnlyToMain({
      type: actionTypes.SETTINGS_OPEN
    }));
    this.props.dispatch(actionCreators.UserEvent({
      event: "OPEN_NEWTAB_PREFS"
    }));
  }
  openCustomizationMenu() {
    this.props.dispatch({
      type: actionTypes.SHOW_PERSONALIZE
    });
    this.props.dispatch(actionCreators.UserEvent({
      event: "SHOW_PERSONALIZE"
    }));
  }
  closeCustomizationMenu() {
    if (this.props.App.customizeMenuVisible) {
      this.props.dispatch({
        type: actionTypes.HIDE_PERSONALIZE
      });
      this.props.dispatch(actionCreators.UserEvent({
        event: "HIDE_PERSONALIZE"
      }));
    }
  }
  handleOnKeyDown(e) {
    if (e.key === "Escape") {
      this.closeCustomizationMenu();
    }
  }
  setPref(pref, value) {
    this.props.dispatch(actionCreators.SetPref(pref, value));
  }
  renderWallpaperAttribution() {
    const {
      wallpaperList
    } = this.props.Wallpapers;
    const activeWallpaper = this.props.Prefs.values[newtabWallpapers.wallpaper-${this.state.colorMode}];
    const selected = wallpaperList.find(wp => wp.title === activeWallpaper);
    // make sure a wallpaper is selected and that the attribution also exists
    if (!selected?.attribution) {
      return null;
    }
    const {
      name: authorDetails,
      webpage
    } = selected.attribution;
    if (activeWallpaper && wallpaperList && authorDetails.url) {
      return /*#__PURE__*/external_React_default().createElement("p", {
        className: wallpaper-attribution,
        key: authorDetails.string,
        "data-l10n-id": "newtab-wallpaper-attribution",
        "data-l10n-args": JSON.stringify({
          author_string: authorDetails.string,
          author_url: authorDetails.url,
          webpage_string: webpage.string,
          webpage_url: webpage.url
        })
      }, /*#__PURE__*/external_React_default().createElement("a", {
        "data-l10n-name": "name-link",
        href: authorDetails.url
      }, authorDetails.string), /*#__PURE__*/external_React_default().createElement("a", {
        "data-l10n-name": "webpage-link",
        href: webpage.url
      }, webpage.string));
    }
    return null;
  }
  async updateWallpaper() {
    const prefs = this.props.Prefs.values;
    const wallpaperLight = prefs["newtabWallpapers.wallpaper-light"];
    const wallpaperDark = prefs["newtabWallpapers.wallpaper-dark"];
    const {
      wallpaperList
    } = this.props.Wallpapers;
    if (wallpaperList) {
      const lightWallpaper = wallpaperList.find(wp => wp.title === wallpaperLight) || "";
      const darkWallpaper = wallpaperList.find(wp => wp.title === wallpaperDark) || "";
      const wallpaperColor = darkWallpaper?.solid_color || lightWallpaper?.solid_color || "";
      __webpack_require__.g.document?.body.style.setProperty(--newtab-wallpaper-light, url(${lightWallpaper?.wallpaperUrl || ""}));
      __webpack_require__.g.document?.body.style.setProperty(--newtab-wallpaper-dark, url(${darkWallpaper?.wallpaperUrl || ""}));
      __webpack_require__.g.document?.body.style.setProperty(--newtab-wallpaper-color, wallpaperColor || "transparent");
      let wallpaperTheme = "";

      // If we have a solid colour set, let's see how dark it is.
      if (wallpaperColor) {
        const rgbColors = this.getRGBColors(wallpaperColor);
        const isColorDark = this.isWallpaperColorDark(rgbColors);
        wallpaperTheme = isColorDark ? "dark" : "light";
      } else {
        // Grab the contrast of the currently displayed wallpaper.
        const {
          theme
        } = this.state.colorMode === "light" ? lightWallpaper : darkWallpaper;
        if (theme) {
          wallpaperTheme = theme;
        }
      }

      // Add helper class to body if user has a wallpaper selected
      if (wallpaperTheme === "light") {
        __webpack_require__.g.document?.body.classList.add("lightWallpaper");
        __webpack_require__.g.document?.body.classList.remove("darkWallpaper");
      }
      if (wallpaperTheme === "dark") {
        __webpack_require__.g.document?.body.classList.add("darkWallpaper");
        __webpack_require__.g.document?.body.classList.remove("lightWallpaper");
      }
    }
  }

  // Contains all the logic to show the wallpapers Feature Highlight
  shouldShowWallpapersHighlight() {
    const prefs = this.props.Prefs.values;

    // If wallpapers (or v2 wallpapers) are not enabled, don't show the highlight.
    const wallpapersEnabled = prefs["newtabWallpapers.enabled"];
    const wallpapersV2Enabled = prefs["newtabWallpapers.v2.enabled"];
    if (!wallpapersEnabled || !wallpapersV2Enabled) {
      return false;
    }

    // If user has interacted/dismissed the highlight, don't show
    const wallpapersHighlightDismissed = prefs[Base_WALLPAPER_HIGHLIGHT_DISMISSED_PREF];
    if (wallpapersHighlightDismissed) {
      return false;
    }

    // If the user has selected a wallpaper, don't show the pop-up
    const activeWallpaperLight = prefs[newtabWallpapers.wallpaper-light];
    const activeWallpaperDark = prefs[newtabWallpapers.wallpaper-dark];
    if (activeWallpaperLight || activeWallpaperDark) {
      this.props.dispatch(actionCreators.SetPref(Base_WALLPAPER_HIGHLIGHT_DISMISSED_PREF, true));
      return false;
    }

    // If the user has seen* the highlight more than three times
    // *Seen means they loaded HNT page and the highlight was observed for more than 3 seconds
    const {
      highlightSeenCounter
    } = this.props.Wallpapers;
    if (highlightSeenCounter.value > 3) {
      return false;
    }

    // Show the highlight if available
    const wallpapersHighlightEnabled = prefs["newtabWallpapers.highlightEnabled"];
    if (wallpapersHighlightEnabled) {
      return true;
    }

    // Default return value
    return false;
  }
  getRGBColors(input) {
    if (input.length !== 7) {
      return [];
    }
    const r = parseInt(input.substr(1, 2), 16);
    const g = parseInt(input.substr(3, 2), 16);
    const b = parseInt(input.substr(5, 2), 16);
    return [r, g, b];
  }
  isWallpaperColorDark([r, g, b]) {
    return 0.2125 * r + 0.7154 * g + 0.0721 * b <= 110;
  }
  shouldDisplayTopicSelectionModal() {
    const prefs = this.props.Prefs.values;
    const pocketEnabled = prefs["feeds.section.topstories"] && prefs["feeds.system.topstories"];
    const topicSelectionOnboardingEnabled = prefs["discoverystream.topicSelection.onboarding.enabled"] && pocketEnabled;
    const maybeShowModal = prefs["discoverystream.topicSelection.onboarding.maybeDisplay"];
    const displayTimeout = prefs["discoverystream.topicSelection.onboarding.displayTimeout"];
    const lastDisplayed = prefs["discoverystream.topicSelection.onboarding.lastDisplayed"];
    const displayCount = prefs["discoverystream.topicSelection.onboarding.displayCount"];
    if (!maybeShowModal || !prefs["discoverystream.topicSelection.enabled"] || !topicSelectionOnboardingEnabled) {
      return;
    }
    const day = 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const timeoutOccured = now - parseFloat(lastDisplayed) > displayTimeout;
    if (displayCount < 3) {
      if (displayCount === 0 || timeoutOccured) {
        this.props.dispatch(actionCreators.BroadcastToContent({
          type: actionTypes.TOPIC_SELECTION_SPOTLIGHT_OPEN
        }));
        this.setPref("discoverystream.topicSelection.onboarding.displayTimeout", day);
      }
    }
  }
  render() {
    const {
      props
    } = this;
    const {
      App,
      DiscoveryStream
    } = props;
    const {
      initialized,
      customizeMenuVisible
    } = App;
    const prefs = props.Prefs.values;
    const layoutsVariantAEnabled = prefs["newtabLayouts.variant-a"];
    const layoutsVariantBEnabled = prefs["newtabLayouts.variant-b"];
    const layoutsVariantAorB = layoutsVariantAEnabled || layoutsVariantBEnabled;
    const activeWallpaper = prefs[newtabWallpapers.wallpaper-${this.state.colorMode}];
    const wallpapersEnabled = prefs["newtabWallpapers.enabled"];
    const wallpapersV2Enabled = prefs["newtabWallpapers.v2.enabled"];
    const weatherEnabled = prefs.showWeather;
    const {
      showTopicSelection
    } = DiscoveryStream;
    const mayShowTopicSelection = showTopicSelection && prefs["discoverystream.topicSelection.enabled"];
    const {
      pocketConfig
    } = prefs;
    const isDiscoveryStream = props.DiscoveryStream.config && props.DiscoveryStream.config.enabled;
    let filteredSections = props.Sections.filter(section => section.id !== "topstories");
    let spocMessageVariant = "";
    if (props.App.locale?.startsWith("en-") && pocketConfig?.spocMessageVariant === "variant-c") {
      spocMessageVariant = pocketConfig.spocMessageVariant;
    }
    const pocketEnabled = prefs["feeds.section.topstories"] && prefs["feeds.system.topstories"];
    const noSectionsEnabled = !prefs["feeds.topsites"] && !pocketEnabled && filteredSections.filter(section => section.enabled).length === 0;
    const searchHandoffEnabled = prefs["improvesearch.handoffToAwesomebar"];
    const enabledSections = {
      topSitesEnabled: prefs["feeds.topsites"],
      pocketEnabled: prefs["feeds.section.topstories"],
      highlightsEnabled: prefs["feeds.section.highlights"],
      showSponsoredTopSitesEnabled: prefs.showSponsoredTopSites,
      showSponsoredPocketEnabled: prefs.showSponsored,
      showRecentSavesEnabled: prefs.showRecentSaves,
      topSitesRowsCount: prefs.topSitesRows,
      weatherEnabled: prefs.showWeather
    };
    const pocketRegion = prefs["feeds.system.topstories"];
    const mayHaveSponsoredStories = prefs["system.showSponsored"];
    const mayHaveWeather = prefs["system.showWeather"];
    const {
      mayHaveSponsoredTopSites
    } = prefs;
    const supportUrl = prefs["support.url"];
    const hasThumbsUpDownLayout = prefs["discoverystream.thumbsUpDown.searchTopsitesCompact"];
    const hasThumbsUpDown = prefs["discoverystream.thumbsUpDown.enabled"];
    const sectionsEnabled = prefs["discoverystream.sections.enabled"];
    const featureClassName = [weatherEnabled && mayHaveWeather && "has-weather",
    // Show is weather is enabled/visible
    prefs.showSearch ? "has-search" : "no-search", layoutsVariantAEnabled ? "layout-variant-a" : "",
    // Layout experiment variant A
    layoutsVariantBEnabled ? "layout-variant-b" : "",
    // Layout experiment variant B
    pocketEnabled ? "has-recommended-stories" : "no-recommended-stories", sectionsEnabled ? "has-sections-grid" : ""].filter(v => v).join(" ");
    const outerClassName = ["outer-wrapper", isDiscoveryStream && pocketEnabled && "ds-outer-wrapper-search-alignment", isDiscoveryStream && "ds-outer-wrapper-breakpoint-override", prefs.showSearch && this.state.fixedSearch && !noSectionsEnabled && "fixed-search", prefs.showSearch && noSectionsEnabled && "only-search", prefs["feeds.topsites"] && !pocketEnabled && !prefs.showSearch && "only-topsites", noSectionsEnabled && "no-sections", prefs["logowordmark.alwaysVisible"] && "visible-logo", hasThumbsUpDownLayout && hasThumbsUpDown && "thumbs-ui-compact"].filter(v => v).join(" ");
    if (wallpapersEnabled || wallpapersV2Enabled) {
      this.updateWallpaper();
    }
    return /*#__PURE__*/external_React_default().createElement("div", {
      className: featureClassName
    }, /*#__PURE__*/external_React_default().createElement("menu", {
      className: "personalizeButtonWrapper"
    }, /*#__PURE__*/external_React_default().createElement(CustomizeMenu, {
      onClose: this.closeCustomizationMenu,
      onOpen: this.openCustomizationMenu,
      openPreferences: this.openPreferences,
      setPref: this.setPref,
      enabledSections: enabledSections,
      wallpapersEnabled: wallpapersEnabled,
      wallpapersV2Enabled: wallpapersV2Enabled,
      activeWallpaper: activeWallpaper,
      pocketRegion: pocketRegion,
      mayHaveSponsoredTopSites: mayHaveSponsoredTopSites,
      mayHaveSponsoredStories: mayHaveSponsoredStories,
      mayHaveWeather: mayHaveWeather,
      spocMessageVariant: spocMessageVariant,
      showing: customizeMenuVisible
    }), this.shouldShowWallpapersHighlight() && /*#__PURE__*/external_React_default().createElement(WallpaperFeatureHighlight, {
      position: "inset-block-end inset-inline-start",
      dispatch: this.props.dispatch
    })), /*#__PURE__*/external_React_default().createElement("div", {
      className: "weatherWrapper"
    }, weatherEnabled && /*#__PURE__*/external_React_default().createElement(ErrorBoundary, null, /*#__PURE__*/external_React_default().createElement(Weather_Weather, null))), /*#__PURE__*/external_React_default().createElement("div", {
      className: outerClassName,
      onClick: this.closeCustomizationMenu
    }, /*#__PURE__*/external_React_default().createElement("main", {
      className: "newtab-main",
      style: this.state.fixedNavStyle
    }, prefs.showSearch && /*#__PURE__*/external_React_default().createElement("div", {
      className: "non-collapsible-section"
    }, /*#__PURE__*/external_React_default().createElement(ErrorBoundary, null, /*#__PURE__*/external_React_default().createElement(Search_Search, Base_extends({
      showLogo: noSectionsEnabled || prefs["logowordmark.alwaysVisible"],
      handoffEnabled: searchHandoffEnabled
    }, props.Search)))), !prefs.showSearch && layoutsVariantAorB && !noSectionsEnabled && /*#__PURE__*/external_React_default().createElement(Logo, null), /*#__PURE__*/external_React_default().createElement("div", {
      className: body-wrapper${initialized ? " on" : ""}
    }, isDiscoveryStream ? /*#__PURE__*/external_React_default().createElement(ErrorBoundary, {
      className: "borderless-error"
    }, /*#__PURE__*/external_React_default().createElement(DiscoveryStreamBase, {
      locale: props.App.locale,
      mayHaveSponsoredStories: mayHaveSponsoredStories,
      firstVisibleTimestamp: this.state.firstVisibleTimestamp
    })) : /*#__PURE__*/external_React_default().createElement(Sections_Sections, null)), /*#__PURE__*/external_React_default().createElement(ConfirmDialog, null), wallpapersEnabled && this.renderWallpaperAttribution()), /*#__PURE__*/external_React_default().createElement("aside", null, this.props.Notifications?.showNotifications && /*#__PURE__*/external_React_default().createElement(ErrorBoundary, null, /*#__PURE__*/external_React_default().createElement(Notifications_Notifications, {
      dispatch: this.props.dispatch
    }))), mayShowTopicSelection && pocketEnabled && /*#__PURE__*/external_React_default().createElement(TopicSelection, {
      supportUrl: supportUrl
    })));
  }
}
BaseContent.defaultProps = {
  document: __webpack_require__.g.document
};
const Base = (0,external_ReactRedux_namespaceObject.connect)(state => ({
  App: state.App,
  Prefs: state.Prefs,
  Sections: state.Sections,
  DiscoveryStream: state.DiscoveryStream,
  Notifications: state.Notifications,
  Search: state.Search,
  Wallpapers: state.Wallpapers,
  Weather: state.Weather
}))(_Base);
;// CONCATENATED MODULE: ./content-src/lib/detect-user-session-start.mjs
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */




const detect_user_session_start_VISIBLE = "visible";
const detect_user_session_start_VISIBILITY_CHANGE_EVENT = "visibilitychange";

class DetectUserSessionStart {
  constructor(store, options = {}) {
    this._store = store;
    // Overrides for testing
    this.document = options.document || globalThis.document;
    this._perfService = options.perfService || perfService;
    this._onVisibilityChange = this._onVisibilityChange.bind(this);
  }

  /**
   * sendEventOrAddListener - Notify immediately if the page is already visible,
   *                    or else set up a listener for when visibility changes.
   *                    This is needed for accurate session tracking for telemetry,
   *                    because tabs are pre-loaded.
   */
  sendEventOrAddListener() {
    if (this.document.visibilityState === detect_user_session_start_VISIBLE) {
      // If the document is already visible, to the user, send a notification
      // immediately that a session has started.
      this._sendEvent();
    } else {
      // If the document is not visible, listen for when it does become visible.
      this.document.addEventListener(
        detect_user_session_start_VISIBILITY_CHANGE_EVENT,
        this._onVisibilityChange
      );
    }
  }

  /**
   * _sendEvent - Sends a message to the main process to indicate the current
   *              tab is now visible to the user, includes the
   *              visibility_event_rcvd_ts time in ms from the UNIX epoch.
   */
  _sendEvent() {
    this._perfService.mark("visibility_event_rcvd_ts");

    try {
      let visibility_event_rcvd_ts =
        this._perfService.getMostRecentAbsMarkStartByName(
          "visibility_event_rcvd_ts"
        );

      this._store.dispatch(
        actionCreators.AlsoToMain({
          type: actionTypes.SAVE_SESSION_PERF_DATA,
          data: {
            visibility_event_rcvd_ts,
            window_inner_width: window.innerWidth,
            window_inner_height: window.innerHeight,
          },
        })
      );
    } catch (ex) {
      // If this failed, it's likely because the privacy.resistFingerprinting
      // pref is true.  We should at least not blow up.
    }
  }

  /**
   * _onVisibilityChange - If the visibility has changed to visible, sends a notification
   *                      and removes the event listener. This should only be called once per tab.
   */
  _onVisibilityChange() {
    if (this.document.visibilityState === detect_user_session_start_VISIBLE) {
      this._sendEvent();
      this.document.removeEventListener(
        detect_user_session_start_VISIBILITY_CHANGE_EVENT,
        this._onVisibilityChange
      );
    }
  }
}

;// CONCATENATED MODULE: external "Redux"
const external_Redux_namespaceObject = Redux;
;// CONCATENATED MODULE: ./content-src/lib/init-store.mjs
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-env mozilla/remote-page */


// We disable import checking here as redux is installed via the npm packages
// at the newtab level, rather than in the top-level package.json.
// eslint-disable-next-line import/no-unresolved


const MERGE_STORE_ACTION = "NEW_TAB_INITIAL_STATE";
const OUTGOING_MESSAGE_NAME = "ActivityStream:ContentToMain";
const INCOMING_MESSAGE_NAME = "ActivityStream:MainToContent";

/**
 * A higher-order function which returns a reducer that, on MERGE_STORE action,
 * will return the action.data object merged into the previous state.
 *
 * For all other actions, it merely calls mainReducer.
 *
 * Because we want this to merge the entire state object, it's written as a
 * higher order function which takes the main reducer (itself often a call to
 * combineReducers) as a parameter.
 *
 * @param  {function} mainReducer reducer to call if action != MERGE_STORE_ACTION
 * @return {function}             a reducer that, on MERGE_STORE_ACTION action,
 *                                will return the action.data object merged
 *                                into the previous state, and the result
 *                                of calling mainReducer otherwise.
 */
function mergeStateReducer(mainReducer) {
  return (prevState, action) => {
    if (action.type === MERGE_STORE_ACTION) {
      return { ...prevState, ...action.data };
    }

    return mainReducer(prevState, action);
  };
}

/**
 * messageMiddleware - Middleware that looks for SentToMain type actions, and sends them if necessary
 */
const messageMiddleware = () => next => action => {
  const skipLocal = action.meta && action.meta.skipLocal;
  if (actionUtils.isSendToMain(action)) {
    RPMSendAsyncMessage(OUTGOING_MESSAGE_NAME, action);
  }
  if (!skipLocal) {
    next(action);
  }
};

const rehydrationMiddleware = ({ getState }) => {
  // NB: The parameter here is MiddlewareAPI which looks like a Store and shares
  // the same getState, so attached properties are accessible from the store.
  getState.didRehydrate = false;
  getState.didRequestInitialState = false;
  return next => action => {
    if (getState.didRehydrate || window.__FROM_STARTUP_CACHE__) {
      // Startup messages can be safely ignored by the about:home document
      // stored in the startup cache.
      if (
        window.__FROM_STARTUP_CACHE__ &&
        action.meta &&
        action.meta.isStartup
      ) {
        return null;
      }
      return next(action);
    }

    const isMergeStoreAction = action.type === MERGE_STORE_ACTION;
    const isRehydrationRequest = action.type === actionTypes.NEW_TAB_STATE_REQUEST;

    if (isRehydrationRequest) {
      getState.didRequestInitialState = true;
      return next(action);
    }

    if (isMergeStoreAction) {
      getState.didRehydrate = true;
      return next(action);
    }

    // If init happened after our request was made, we need to re-request
    if (getState.didRequestInitialState && action.type === actionTypes.INIT) {
      return next(actionCreators.AlsoToMain({ type: actionTypes.NEW_TAB_STATE_REQUEST }));
    }

    if (
      actionUtils.isBroadcastToContent(action) ||
      actionUtils.isSendToOneContent(action) ||
      actionUtils.isSendToPreloaded(action)
    ) {
      // Note that actions received before didRehydrate will not be dispatched
      // because this could negatively affect preloading and the the state
      // will be replaced by rehydration anyway.
      return null;
    }

    return next(action);
  };
};

/**
 * initStore - Create a store and listen for incoming actions
 *
 * @param  {object} reducers An object containing Redux reducers
 * @param  {object} intialState (optional) The initial state of the store, if desired
 * @return {object}          A redux store
 */
function initStore(reducers, initialState) {
  const store = (0,external_Redux_namespaceObject.createStore)(
    mergeStateReducer((0,external_Redux_namespaceObject.combineReducers)(reducers)),
    initialState,
    globalThis.RPMAddMessageListener &&
      (0,external_Redux_namespaceObject.applyMiddleware)(rehydrationMiddleware, messageMiddleware)
  );

  if (globalThis.RPMAddMessageListener) {
    globalThis.RPMAddMessageListener(INCOMING_MESSAGE_NAME, msg => {
      try {
        store.dispatch(msg.data);
      } catch (ex) {
        console.error("Content msg:", msg, "Dispatch error: ", ex);
        dump(
          Content msg: ${JSON.stringify(msg)}\nDispatch error: ${ex}\n${
            ex.stack
          }
        );
      }
    });
  }

  return store;
}

;// CONCATENATED MODULE: external "ReactDOM"
const external_ReactDOM_namespaceObject = ReactDOM;
var external_ReactDOM_default = /*#__PURE__*/__webpack_require__.n(external_ReactDOM_namespaceObject);
;// CONCATENATED MODULE: ./content-src/activity-stream.jsx
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */









const NewTab = ({
  store
}) => /*#__PURE__*/external_React_default().createElement(external_ReactRedux_namespaceObject.Provider, {
  store: store
}, /*#__PURE__*/external_React_default().createElement(Base, null));
function renderWithoutState() {
  const store = initStore(reducers);
  new DetectUserSessionStart(store).sendEventOrAddListener();

  // If this document has already gone into the background by the time we've reached
  // here, we can deprioritize requesting the initial state until the event loop
  // frees up. If, however, the visibility changes, we then send the request.
  let didRequest = false;
  let requestIdleCallbackId = 0;
  function doRequest() {
    if (!didRequest) {
      if (requestIdleCallbackId) {
        cancelIdleCallback(requestIdleCallbackId);
      }
      didRequest = true;
      store.dispatch(actionCreators.AlsoToMain({
        type: actionTypes.NEW_TAB_STATE_REQUEST
      }));
    }
  }
  if (document.hidden) {
    requestIdleCallbackId = requestIdleCallback(doRequest);
    addEventListener("visibilitychange", doRequest, {
      once: true
    });
  } else {
    doRequest();
  }
  external_ReactDOM_default().hydrate( /*#__PURE__*/external_React_default().createElement(NewTab, {
    store: store
  }), document.getElementById("root"));
}
function renderCache(initialState) {
  const store = initStore(reducers, initialState);
  new DetectUserSessionStart(store).sendEventOrAddListener();
  external_ReactDOM_default().hydrate( /*#__PURE__*/external_React_default().createElement(NewTab, {
    store: store
  }), document.getElementById("root"));
}
NewtabRenderUtils = __webpack_exports__;
/******/ })()
;

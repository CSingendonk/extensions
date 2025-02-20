class FUCK {
  constructor() {
    #off();
    return this;
  }
  #off() {
    Object.apply(this, document.style);
  }
  static off = (() => { console.warn(`FUCK OFF`})();
  static on = (() => { console.error(`FUCK OFF`})();
}
FUCK.off = FUCK.off;
FUCK.on = FUCK.on;
new FUCK();

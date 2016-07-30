'use strict';

describe('The main view', function () {
  var page;

  beforeEach(function () {
    browser.get('/index.html');
    page = require('./main.po');
  });

  it('should include angular-leaflet-map with correct data', function() {
    expect(page.leafletMap.isDisplayed()).toBe(true);
  });

  it('should list 3 awesome tracks', function () {
    expect(page.trackList.count()).toBe(3);
  });

});

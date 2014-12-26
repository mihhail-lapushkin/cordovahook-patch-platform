var fs = require('fs');
var path = require('path');
var xmlParser = require('node-xml-lite');

module.exports = {
  parseConfigXml: function() {
    return xmlParser.parseFileSync('config.xml');
  },
      
  getAppName: function(configXml) {
    return (configXml || this.parseConfigXml()).childs.filter(function(_) { return _.name == 'name'; }).map(function(_) { return _.childs[0]; })[0];
  },
      
  getAppPreferences: function(configXml) {
    var preferences = {};
        
    (configXml || this.parseConfigXml()).childs.filter(function(_) { return _.name == 'preference'; }).forEach(function(_) {
      preferences[_.attrib.name] = _.attrib.value;
    });
        
    return preferences;
  },
  
  toRegEx: function(str) {
    return new RegExp(str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), 'gi');
  },
  
  readTextFile: function(filePath) {
    return fs.readFileSync(filePath, { encoding: 'UTF-8' });
  },

  writeTextFile: function(filePath, data) {
    fs.writeFileSync(filePath, data, { encoding: 'UTF-8' });
  }
};
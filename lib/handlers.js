var fs = require('fs-extra');
var path = require('path');
var _ = require('./utils');

module.exports = {
  handleCopy: function(patchConfig, platformPatchDir, platformDir, resolveParams) {
    for (var relativeSrc in patchConfig) {
      var src = resolveParams(path.join(platformPatchDir, relativeSrc));
      var dest = resolveParams(path.join(platformDir, patchConfig[relativeSrc]));
      
      if (fs.existsSync(src)) {
        console.info('Copying "' + src + '" to "' + dest + '"');
        fs.copySync(src, dest);
      }
    }
  },
  
  handleDelete: function(patchConfig, platformPatchDir, platformDir, resolveParams) {
    var files = patchConfig.files;
    var lines = patchConfig.lines;
    
    if (files) {
      files.forEach(function(file) {
        var filePath = resolveParams(path.join(platformDir, file));
        
        if (fs.existsSync(filePath)) {
          console.info('Deleting "' + filePath + '"');
          fs.removeSync(filePath);
        }
      });
    }
    
    if (lines) {
      for (var file in lines) {
        var filePath = resolveParams(path.join(platformDir, file));
        var fileContents = _.readTextFile(filePath);
        var newFileContents = [];
        
        /* jshint loopfunc: true */
        fileContents.split(/[\n\r\f]+/).forEach(function(line) {
          var excludeLine = false;
          
          lines[file].forEach(function(markerSnippet) {
            if (excludeLine) {
              return;
            }
            
            excludeLine = line.indexOf(markerSnippet) >= 0;
          });
          
          if (!excludeLine) {
            newFileContents.push(line);
          }
        });
        
        console.info('Writing "' + filePath + '"');
        _.writeTextFile(filePath, newFileContents.join('\n'));
      }
    }
  },
  
  handleReplace: function(patchConfig, platformPatchDir, platformDir, resolveParams) {
    for (var file in patchConfig) {
      var replacements = patchConfig[file];
      var filePath = resolveParams(path.join(platformDir, file));
      var fileContents = _.readTextFile(filePath);
      
      for (var find in replacements) {
        var replacement = replacements[find];
        fileContents = fileContents.replace(_.toRegEx(find), replacement);
      }
      
      console.info('Writing "' + filePath + '"');
      _.writeTextFile(filePath, fileContents);
    }
  },
  
  handleInject: function(patchConfig, platformPatchDir, platformDir, resolveParams) {
    for (var file in patchConfig) {
      var injects = patchConfig[file];
      var filePath = resolveParams(path.join(platformDir, file));
      var fileContents = _.readTextFile(filePath);
      
      if (injects.before) {
        for (var injectMarker in injects.before) {
          var snippetFile = injects.before[injectMarker];
          var snippet = _.readTextFile(resolveParams(path.join(platformPatchDir, snippetFile)));
          
          fileContents = fileContents.replace(_.toRegEx(injectMarker), snippet + injectMarker);
        }
      }
      
      if (injects.after) {
        /* jshint shadow: true */
        for (var injectMarker in injects.after) {
          var snippetFile = injects.after[injectMarker];
          var snippet = _.readTextFile(resolveParams(path.join(platformPatchDir, snippetFile)));
          
          fileContents = fileContents.replace(_.toRegEx(injectMarker), injectMarker + snippet);
        }
      }
      
      console.info('Writing "' + filePath + '"');
      _.writeTextFile(filePath, fileContents);
    }
  }
};
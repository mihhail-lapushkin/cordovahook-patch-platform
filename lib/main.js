var fs = require('fs-extra');
var path = require('path');
var handlers = require('./handlers');
var _ = require('./utils');

var configXml = _.parseConfigXml();
var appName = _.getAppName(configXml);
var preferences = _.getAppPreferences(configXml);

function resolveParams(str) {
  return str.replace('{{appName}}', appName);
}

process.env.CORDOVA_PLATFORMS.split(',').forEach(function(platform) {
  console.info('\n> Patching "' + platform + '" platform\n');
  
  var platformPatchDir = path.join('patches', platform);
  var platformDir = path.join('platforms', platform);
  var platformPatches = fs.readJsonSync(path.join(platformPatchDir, 'patches.json'));
  
  for (var patchCondition in platformPatches) {
    if (patchCondition !== '*') {
      var conditionNameAndValue = patchCondition.split(':');
      var conditionName = conditionNameAndValue[0];
      var conditionValue = conditionNameAndValue[1];
      
      if (preferences[conditionName] !== conditionValue) {
        continue;
      }
    }
    
    var patchesUnderCondition = platformPatches[patchCondition];
    
    for (var patchType in patchesUnderCondition) {
      var patchConfig = patchesUnderCondition[patchType];
      
      switch (patchType) {
        case 'copy':
          handlers.handleCopy(patchConfig, platformPatchDir, platformDir, resolveParams);
          break;
        case 'delete':
          handlers.handleDelete(patchConfig, platformPatchDir, platformDir, resolveParams);
          break;
        case 'replace':
          handlers.handleReplace(patchConfig, platformPatchDir, platformDir, resolveParams);
          break;
        case 'inject':
          handlers.handleInject(patchConfig, platformPatchDir, platformDir, resolveParams);
          break;
        default:
          throw new Error('Unknown patch type: ' + patchType);
      }
    }
  }
  
  try {
    require(join('..', '..', platformPatchDir, 'patches.js'))(appName);
  } catch (e) {}
});
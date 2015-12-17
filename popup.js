PARAM_NAME_EL_ID  = 'param-name';
PARAM_VALUE_EL_ID = 'param-value';
PARAM_FORM_EL_ID  = 'param-form';
LAST_PARAM_STORAGE_NAME = 'last-param-name';

function getCurrentTab(callback) {
  var queryInfo = { active: true, currentWindow: true };

  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs[0]);
  });
}

function parseUrlParamsToHash(url) {
  var paramsHash = {};
  var paramsStartIndex = url.indexOf("?")

  if (paramsStartIndex != -1) {
    var paramValuePairs = url.substring(paramsStartIndex + 1, url.length).split("&") // ["foo=bar", "ge=ek"]

    for (var i = paramValuePairs.length - 1; i >= 0; i--) {
      var paramValuePair = paramValuePairs[i].split('=');

      if (paramValuePair.length == 2) {
        var paramName  = paramValuePair[0];
        var paramValue = paramValuePair[1] || '';

        paramsHash[paramName] = paramValue;
      }
    };
  }

  return paramsHash;
};

function createUrlWithParamsFromHash(url, paramsHash) {
  var paramsStartIndex = url.indexOf("?");

  if (paramsStartIndex != -1) {
    var paramsSubstring = url.substring(paramsStartIndex, url.length);
    url = url.replace(paramsSubstring, "");
  }

  url = url + "?";

  for (var paramName in paramsHash) {
    url = url + paramName + "=" + paramsHash[paramName] + "&";
  }

  url = url.substring(0, url.length -1) //remove last &

  return url;
};

function updateTabUrlWithNewParam(tab, paramName, newParamValue) {
  var paramsHash = parseUrlParamsToHash(tab.url);

  if (newParamValue.length > 0) {
    paramsHash[paramName] = newParamValue;
  } else {
    delete(paramsHash[paramName]);
  }

  var newUrl = createUrlWithParamsFromHash(tab.url, paramsHash);

  chrome.tabs.update(tab.id, {url: newUrl});
}

function onFormSubmit() {
  var paramNameEl = document.getElementById(PARAM_NAME_EL_ID);
  var paramValueEl = document.getElementById(PARAM_VALUE_EL_ID);
  var paramName = paramNameEl.value;

  if (paramName.length > 0) {
    getCurrentTab(function(tab) {
      updateTabUrlWithNewParam(tab, paramName, paramValueEl.value);
      saveLastParamName(paramName);
    });
  } else {
    paramNameEl.style.background = "red";
  }
};

function saveLastParamName(paramName) {
  var toSave = {};
  toSave[LAST_PARAM_STORAGE_NAME] = paramName;

  chrome.storage.local.set(toSave)
};

function loadLastParamName() {
  chrome.storage.local.get(LAST_PARAM_STORAGE_NAME, function(result) {
    value = result[LAST_PARAM_STORAGE_NAME] || '';

    if (value.length > 0) {
      document.getElementById(PARAM_NAME_EL_ID).value = value;      
    }
  })
};

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById(PARAM_NAME_EL_ID).focus();
  document.getElementById(PARAM_FORM_EL_ID).onsubmit = onFormSubmit;
  loadLastParamName();
});
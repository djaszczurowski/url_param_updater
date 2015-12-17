PARAM_ID = 'param';
VALUE_ID = 'value';
FORM_ID  = 'form';

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
    var paramValuePairs = url.substring(paramsStartIndex + 1, url.length).split("&")

    for (var i = paramValuePairs.length - 1; i >= 0; i--) {
      var pvp = paramValuePairs[i].split('=');

      if (pvp.length == 2) {
        paramsHash[pvp[0]] = (pvp[1] || '');
      }
    };
  }

  return paramsHash;
};

function createUrlWithParamsFromHash(url, paramsHash) {
  var paramsStartIndex = url.indexOf("?");

  if (paramsStartIndex != -1) {
    url = url.replace(url.substring(paramsStartIndex, url.length), "");
  }

  url = url + "?";

  for (var paramName in paramsHash) {
    url = url + paramName + "=" + paramsHash[paramName] + "&";
  }

  return url;
};

function updateTabUrl(tab, paramName, newParamValue) {
  var paramsHash = parseUrlParamsToHash(tab.url);
  paramsHash[paramName] = newParamValue;

  var newUrl = createUrlWithParamsFromHash(tab.url, paramsHash);

  chrome.tabs.update(tab.id, {url: newUrl});
}

function onFormSubmit() {
  var paramNameEl = document.getElementById(PARAM_ID);
  var paramValueEl = document.getElementById(VALUE_ID);
  var paramName = paramNameEl.value;

  if (paramName.length > 0) {
    getCurrentTab(function(tab) {
      updateTabUrl(tab, paramName, paramValueEl.value);
    });
  } else {
    paramNameEl.style.background = "red";
  }
};

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById(PARAM_ID).focus();
  document.getElementById(FORM_ID).onsubmit = onFormSubmit;
});
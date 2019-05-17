var serverUrl = {
  production: 'https://www.calherder.com/',
  staging: 'https://eventherder-staging.herokuapp.com/',
  development: 'https://kromatic.ngrok.io'
}

fetch(chrome.runtime.getURL('dev.json'))
    .then((response) => response.json())
    .then((json) => {
      serverUrl['development'] = json.development;
    });

$(document).ready(function() {
  // Server radio buttons
  // Restore server settings
  chrome.storage.local.get('server', function(data) { toggleServerButtons(data.server); });
  chrome.storage.local.get('debug',  function(data) { toggleDebugButton(data.debug);    });

  function toggleServerButtons(server) {
    if (server === 'production') {
      server = serverUrl.production;
    }

    var env = Object.keys(serverUrl).find((s) => serverUrl[s] === server);

    if (!server || $.inArray(server, Object.values(serverUrl)) < 0) {
      server = serverUrl.production;
      chrome.storage.local.set({server: server});
    }

    Object.keys(serverUrl).forEach(function(env) {
      $('#' + env + '-link').attr('href', serverUrl[env])
    });

    $('#' + env).prop("checked", true);
    checkIfLoggedIn();
  }

  function toggleDebugButton(debug) {
    if (!debug) {
      chrome.storage.local.set({debug: debug});
      $('#debug').prop('checked', false);
    }
    else { $('#debug').prop('checked', true); }
  }

  // Save server settings on user input
  $('.switch-input[name=server-option]').on('change', function() {
    chrome.storage.local.set({server: serverUrl[$(this).val()]});
    checkIfLoggedIn();
    refreshCurrentPage();
  });

  // Save server settings on user input
  $('.switch-input[name=debug]').on('change', function() {
    chrome.storage.local.set({debug: $(this).is(':checked')});
    refreshCurrentPage();
  });

  $('#sync').click(function() {
    chrome.storage.local.get('server', function (local_data) {
      $.get((local_data.server) + 'api/calendars/refresh');
    });
  });

  // Check if user is logged in
  function checkIfLoggedIn() {
    $('p.message').text('Checking if logged in...');
    chrome.storage.local.get('server', function (local_data) {
      chromeAjax({
        url:(local_data.server) + 'api/user_settings/show',
        type: 'get'
      }).then(function (settings_data) {
        $('p.message').text('Logged in successfully!');
        $('#sync').removeClass('is-hidden');
      }).catch(function(){
        $('p.message').html('<a href="' + (local_data.server) + '" target="_blank" class="button success">Log in</a>');
      });
    });
  }

  /**
   * Helper functions
   */

  function refreshCurrentPage() {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
      var code = 'window.location.reload();';
      chrome.tabs.executeScript(arrayOfTabs[0].id, {code: code});
    });
  }

});

function chromeAjax(data){
  return new Promise(function (resolve, reject) {
    chrome.runtime.sendMessage({action: 'chromeAjax', data: data}, function (response) {
      if(response&&!response.statusText){
        resolve(response);
      } else {
        reject(response)
      }
    });
  });
}

$(document).ready(function init() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action=="chromeAjax"){
      $.ajax({
        url: request.data.url,
        type: request.data.type,
        data: request.data.data,
        beforeSend: function(xhr) {
          if (request.data.token) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(request.data.token));
          }
        }
      }).then(sendResponse,sendResponse)
      return true
    }
  })
});

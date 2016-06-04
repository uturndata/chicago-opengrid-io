
function processGETReq(url, payLoad, force) {

  if(force) {
    url = url + "&" + new Date().getTime();
  }

  return $.ajax({
    type: 'GET',
    url: url
  });
}


function processPOSTeq(url, data, force) {

  if(force) {
    url = url + "?" + new Date().getTime();
  }

  return $.ajax({
    type: 'POST',
    url: url,
    data: data
  });
}

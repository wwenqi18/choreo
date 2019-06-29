// validate if input url is a valid YouTube video url
const validate = () => { 
  let input = document.getElementById('input-box').value.trim()
  let regex = new RegExp('^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+')
  if (!regex.test(input)) {
    $('#exampleModalCenter').modal('show')
    return false
  }
  let data = { 'url': input }
  console.log('returning', data)
  return data
}

const saveUrl = (data) => {
  console.log(data)
  $.ajax({
    type: "POST",
    url: "save_url",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),
    success: function (result) {
      console.log(result)
      window.location = './diagram'
    },
    error: function (request, status, error) {
      console.log("Error")
      console.log(request)
      console.log(status)
      console.log(error)
    }
  })
}

$(document).ready(function() {
  $('#load-btn').click(function() {
    let url = validate()
    if (url) {
      saveUrl(url)
    }
  })
})
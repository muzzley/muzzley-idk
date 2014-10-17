<!doctype html>
<html class="no-js" lang="">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>
    if(parent){
      parent.postMessage(JSON.stringify({location: window.location}), "*");
    }
  </script>
  <link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.1.0/css/font-awesome.min.css"
    type="text/css" rel="stylesheet" />
  <link href="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/css/bootstrap.min.css"
    type="text/css" rel="stylesheet" />
  <link href="{{ prefix }}/public/views/style.css"
    type="text/css" rel="stylesheet" />
</head>
<body>
  <div id="content" class="content">
    <div class="center">
      {% block content %}{% endblock %}
    </div>
  </div>
  <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"
    type="text/javascript"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/js/bootstrap.min.js"
    type="text/javascript"></script>
  <script>
    $(function () {
      $('#back').on('click', function () { window.history.back(); return false; });
      $('#content').height($(window).height());
      $('#btn-login').on('click', function(){
        if(parent){
          parent.postMessage(JSON.stringify({hide: true}), "*");
        }
      });
    });
  </script>
</body>
</html>

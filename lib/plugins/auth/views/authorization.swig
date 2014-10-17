{% extends "./layout/layout.swig" %}

{% block content %}
{% if permissions %}
<header class="page-header">
  <h2 class="text-center">Authorize <span class="text-danger">Muzzley</span> to use
    <br />your account?
  </h2>
</header>
{% if permissions.available %}
  {% for permission in permissions.available %}
    {% if loop.first %}
    <p>This application <span class="text-success">will be allowed to:</span>
    <ul class="available">
    {% endif %}
    <li>{{ permission }}</li>
    {% if loop.last %}
    </ul>
    {% endif %}
  {% endfor %}
{% endif %}
{% if permissions.unavailable %}
  {% for permission in permissions.unavailable %}
    {% if loop.first %}
    <p>This application <span class="text-danger">won't be allowed to:</span>
    <ul class="unavailable">
    {% endif %}
    <li>{{ permission }}</li>
    {% if loop.last %}
    </ul>
    {% endif %}
  {% endfor %}
{% endif %}
{% endif %}
<form method="post">
  <input type="hidden" name="crumb" value="{{ crumb }}"/>
  <div class="form-group">
    <div class="col-middle">
      <button  type="submit" name="choice" value="cancel"
        class="btn btn-lg btn-block btn-danger">Cancel</button>
    </div>
    <div class="col-middle">
      <button type="submit" name="choice" value="permit"
        class="btn btn-lg btn-block btn-success">Allow</button>
    </div>
  </div>
</form>
{% endblock %}

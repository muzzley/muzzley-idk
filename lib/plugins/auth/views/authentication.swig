{% extends "./layout/layout.swig" %}

{% block content %}

{% for input in inputs %}
  {% set name = input.name || loop.key %}
  {% set invalid = validation.length !== undefined &&
    validation.length !== 0 && validation.indexOf(loop.key) !== -1 %}

  {% if loop.first %}
    {% if image %}
    <div class="image-thing">
      <img src="{{ image }}"></img>
    </div>
    {% endif %}
    {% if subtitle %}
    <h3 class="lead text-center">{{ subtitle }}</h3>
    {% endif %}
    {% if message && validation.length === 0 %}
    <p class="text-danger text-center">{{ message }}</p>
    {% endif %}
  <form method="post">
    <input type="hidden" name="crumb" value="{{ crumb }}"/>
  {% endif %}
    <div class="form-group{% if invalid %} has-error{% endif %}">
      {% if input.label %}
      <label for="{{ loop.key }}-{{ loop.index }}">{{ input.label }}</label>
      {% endif %}
      <input
        id="{{ loop.key }}-{{ loop.index }}"
        type="{{ input.type || 'text' }}"
        placeholder="{{ input.placeholder || ''}}"
        name="{{ name }}"
        class="form-control"
        {% if input.value && input.type !== 'password' %}
        value="{{ input.value }}"
        {% endif%}>
      {% if invalid && input.description %}
      <p class="help-block">{{ input.description }}</p>
      {% endif %}
    </div>
    {% if loop.last %}
    <button type="submit" id="btn-login" class="btn btn-lg btn-block btn-danger btn-muzz" style="background-color: {{ color }}">
      {{ label }}</button>
    </form>
  {% endif %}
{% endfor %}
{% endblock %}

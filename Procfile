release: python manage.py migrate
web: daphne django_react_proj.asgi:application --port $PORT --bind 0.0.0.0 -u none
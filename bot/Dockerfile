FROM python:3.12-slim

WORKDIR /app

COPY bot/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY common /app/common
COPY bot/src /app/src

ENV PYTHONPATH=/app

# El bot simplemente ejecuta su script principal
CMD ["python", "src/main.py"]
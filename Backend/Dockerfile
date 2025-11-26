# Use the official Python image
FROM python:3.11-slim

# Set environment variables for MySQL
ENV MYSQL_HOST=db
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=password
ENV MYSQL_DATABASE=dashboard_db
ENV FLASK_APP=app.py

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ALL application files (not just app.py)
COPY . .

# Expose the port Flask runs on
EXPOSE 5000

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
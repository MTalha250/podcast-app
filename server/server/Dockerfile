# Use Python 3.11 as base image (like choosing which operating system to use)
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory inside the container
WORKDIR /app

# Install system dependencies (like installing programs on a computer)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first (this helps with faster rebuilds)
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire Django project
COPY . /app/

# Create media directory for file uploads
RUN mkdir -p /app/media

# Expose port 8000 (tell Docker our app runs on this port)
EXPOSE 8000

# Command to run when container starts
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"] 
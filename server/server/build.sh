#!/bin/bash
echo "Building the project..."
python3 -m pip install -r requirements.txt

echo "Collect Static..."
python3 manage.py collectstatic --noinput --clear
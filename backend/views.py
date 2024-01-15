from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from .models import Row
from .serializers import *
from .process_data import process

from django.shortcuts import render

import uuid

def index(request):
    user_id = request.session.get('user_id')

    if user_id is None:
        # This is a new user, create a new user_id and store it in the session
        user_id = str(uuid.uuid4())
        request.session['user_id'] = user_id

    return render(request, 'index.html', {'user_id': user_id})

    
@api_view(['GET', 'POST'])
def query_list(request):
    user_id = request.GET.get('user_id')
    task_id = request.GET.get('task_id')

    if request.method == 'GET':
        data = Row.objects.filter(user_id=user_id, task_id=task_id).order_by('-id')[:1]

        serializer = RowSerializer(data, context={'request': request}, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        processed_data = process(request.data)
        processed_data['user_id'] = user_id
        processed_data['task_id'] = task_id
        serializer = RowSerializer(data=processed_data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def query_detail(request, pk):
    try:
        query = Row.objects.get(pk=pk)
    except Row.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        processed_data = process(request.data)
        processed_data['user_id'] = request.data.get('user_id')
        processed_data['task_id'] = request.data.get('task_id')
        serializer = RowSerializer(query, data=processed_data,context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        query.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
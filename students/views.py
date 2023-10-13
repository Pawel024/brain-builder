from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from .models import Row
from .serializers import *
from .process_data import process

@api_view(['GET', 'POST'])
def query_list(request):
    if request.method == 'GET':
        data = Row.objects.all()

        serializer = RowSerializer(data, context={'request': request}, many=True)

        return Response(serializer.data)

    elif request.method == 'POST':
        processed_data = process(request.data)
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
        serializer = RowSerializer(query, data=processed_data,context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        query.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class Coach(AsyncWebsocketConsumer):
    connections = {}

    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['userId']
        self.task_id = self.scope['url_route']['kwargs']['taskId']
        self.connections[(self.user_id, self.task_id)] = self
        print("coach connected")
        await self.accept()

    async def disconnect(self, close_code):
        del self.connections[self.user_id]
        print("coach disconnected")
        
    # Receive message from WebSocket
    async def receive(self, data):
        print("coach received data, but is currently unequipped to handle it")
        # uncomment if we decide to send frontend data via the WebSocket as well
        """
        instructions = json.loads(data)
        task_type = instructions['title']
        print("instructions received, preparing for task ", task_type)
        from process_data import process
        process(instructions, root_link, pk, csrf_token, callback=self.send_data)
        """

    # Send an update to the frontend
    async def send_data(self, data):
        task_type = data['title']
        print("sending data for task ", task_type)
        await self.send(data=json.dumps(data))

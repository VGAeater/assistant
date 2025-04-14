from ollama import chat
from flask import Flask, send_file, stream_with_context, request
import random
from pathlib import Path

app = Flask(__name__)

@app.route('/')
def index():
    return send_file('index.html')

messages = [
    { 'role': 'system', 'content': 'You are a useful assistant.' }
]

@app.route('/send/text', methods = ['POST'])
def sendText():
    messages.append( { 'role': 'user', 'content': str(request.data) } )
    return "Ok."

@app.route('/send/image', methods = ['POST'])
def sendImage():
    mod_path = Path(__file__).parent
    paths = []
    for key in request.files.keys():
        file = request.files[key]
        path = (mod_path / f"temp/{random.randint(0, 0xFFFFFFFF):08x}").resolve()
        file.save(path)
        paths.append(path)
    messages.append( { 'role': 'user', 'images': paths } )
    return "Ok."

@app.route('/generate')
def generate():
    print(messages)
    def execute():
        stream = chat(
            model='llama3.2-vision:11B',
            messages=messages,
            stream=True,
        )

        response = ""
        for chunk in stream:
            yield chunk['message']['content']
            response += chunk['message']['content']

        messages.append( { 'role': 'assistant', 'content': response } )
    return app.response_class(stream_with_context(execute()))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    print("bye bye")

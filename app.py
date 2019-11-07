from flask import Flask
from flask import render_template
from flask import redirect, url_for
from flask import Response, request, jsonify
app = Flask(__name__)
import sys
import copy
import json

# data
url = ''

time_list = []
title_list = {}
diagram_list = {}

#routes
@app.route('/')
def index():
  return render_template('index.html')

@app.route('/diagram')
def diagram():
  return render_template('diagram.html', timeList=title_list, orderedTimeList=time_list, diagramList=diagram_list, url=url)

@app.route('/finish')
def finish():
  return render_template('finish.html', timeList=time_list, titleList=title_list, diagramList=diagram_list, url=url)

# @app.route('/save_url', methods=['POST', 'GET'])
# def save_url():
#   if request.method == 'POST':
#     return redirect(url_for('diagram'))
#   else:
#     global url
#     url = request.args['url']

#     return render_template('diagram.html')

@app.route('/save_list', methods=['POST'])
def save_list():
    global time_list
    global title_list
    global diagram_list

    data = request.get_json()

    time_list = data['timeList']
    title_list = data['titleList']
    
    temp = data['diagramList']
    for key in temp:
      diagram_list[key] = json.loads(temp[key])

    return jsonify(diagram_list)

@app.route('/save_url', methods=['POST'])
def save_url():
  global url
  
  data = request.get_json()
  url = data['url']
  print(data, file=sys.stderr)

  return jsonify(url)

# main
if __name__ == '__main__':
  app.run(debug = True)





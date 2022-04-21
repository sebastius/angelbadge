#!/usr/bin/python3
# This script is designed specifically for the Evolis Pebble 3 and New Pebble printers (and tested).

# either start it with no arguments and get a prompt, or pass as many nicknames as you want through the arguments
import io

import cups #printer connection https://pypi.org/project/pycups/
import sys
import re
import os
import socket
import json

from PIL import Image # https://python-pillow.org/
from PIL import ImageFont
from PIL import ImageDraw

from aztec_code_generator import AztecCode # https://github.com/delimitry/aztec_code_generator

from subprocess import run
import cairosvg

filename = "tmpbadge.png" #temporary filename, because PyCups can only print a file, not an object
printername = "Pebble" #printername in Cups

# Printer options
# Pleae note you can waste expensive ribbon (or destroy it) if you choose the wrong settings!
# Below settings are from 'lpoptions -p pebble -l'

ribbontype = "BlackWax" #YMCKO YMCKOS KO Black Blue Gold Green Red Silver White Scratch *BlackWax Hologram
mediatype = "Feeder" #Feeder Manual Auto
ejecttype = "Hopper" #Hopper Manual
brightness = "10" # 0~20, 10 is default
contrast = "10" # 0~20, 10 is default
blackin = "N" # Y N , Black Panel, Y = on all black dots
treatmentk = "G" # G L , Gray or LineMode
sensibilityk = "10" # 0~20 Intensity Black Panel, 10 is default
overlaypannel = "FO" # FO, SCI, SCA, MS, NO .Define: Full Overlay, SmartCard ISO, SmartCard Afnor, Magnetic Stripe, No Overlay, this is for the coating layer on top of your ink, you don't want to cover a chip with it ;)

printeroptions = {"Collate":"True","InkType":ribbontype,"MediaType":mediatype, "EjectType":ejecttype, "Brightness":brightness, "Contrast":contrast, "BlackIn":blackin, "TreatementK":treatmentk, "SensibilityK":sensibilityk,"OverlayPannel":overlaypannel,"EjectCard":"None","Coercivity":"None"}

# Card resolution
# Pebble3 PPD driver specs 243.84 x 155.52. That is at a standard 72 'point' raster, at 300 dpi
# So 243.84 / 72 * 300 = 1016 horizontal and 155.52 / 72 * 300 = 648 vertical
# More info: https://en.wikipedia.org/wiki/Point_(typography)
#
# Note: need to check if we can't fix the 1mm stripe at the beginning 
# and end of the card for Seamless printing

cardwidth = 1016
cardheight = 648

def request(data):
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as sock:
        sock.connect('./mch2021designgenerator/listen.sock')
        fp = sock.makefile()
        sock.send(str.encode(json.dumps(data) + '\n'))
        return json.loads(fp.readline())

def createbadge(nickname):
    # RegularExpression is based on the rules for the angel-system and compatible with the warehouse system
    if not re.match("^[A-Za-z0-9\-_.]+$", nickname):
        print ("Use up to 24 letters, numbers or connecting punctuations for your nickname.")
        return
    if len(nickname)>24:
        print ("Use up to 24 letters, numbers or connecting punctuations for your nickname.")
        return

    aztec_code = AztecCode("angel-"+nickname,size=23,compact=True)
    aztec_code.save('aztec_code.png', module_size=4, border=0)
    aztec = Image.open('aztec_code.png')
    aztec = aztec.convert('RGBA')
    aztec = aztec.resize((255,255), resample = Image.Dither.NONE)
    aztec = aztec.rotate(60, expand=True,fillcolor=None)

    data = request({
        'name': nickname,
        'width': cardwidth,
        'height': cardheight,
        'black': True,
        'remove_text': True,
        'geometry_x': 1.25,
        'geometry_y': 0.249,
        'close': True,
    })['data']
    png = cairosvg.svg2png(bytestring=data)
    background = Image.open(io.BytesIO(png))

    angelbadge = Image.new('RGBA', size=(cardwidth, cardheight), color='black')
    angelbadge.paste(background, (0,0),background)
    angelbadge.paste(aztec, ((cardwidth-102-250),50),aztec) #2nd 'aztec' reference is for the mask
    draw = ImageDraw.Draw(angelbadge)

    font = ImageFont.truetype("./Saira-Regular.ttf", 150)
    length,height=font.getsize(nickname)

    if length > (cardwidth-16): # if the nickname is too wide in the default font, scale it down
        font = ImageFont.truetype("./Saira-Regular.ttf", int(150/length*1000))
        length,height = font.getsize(nickname)

    draw.rectangle((0, 520-(height/2),cardwidth,520+(height/2)), fill="white", outline=None)
    draw.text((cardwidth/2,520), nickname, fill="black", anchor="mm", font=font) # https://pillow.readthedocs.io/en/stable/handbook/text-anchors.html
    angelbadge.save(filename, "PNG")

    try:
        pebble = cups.Connection()
        pebble.printFile (printername, filename, "angelbadge for "+nickname, printeroptions)
        print("Sent angelbadge for "+nickname+" to "+printername+"!")
    except Exception as e:
        print("printer error: "+str(e))
    os.remove("aztec_code.png")

if len(sys.argv)>1: #print all passed arguments as angel badges
    print("Hi! Gonna hit you up with some nice cards!")
    for nicks in sys.argv[1:]:
        createbadge(nicks)
else: #give a nice prompt
    while True:
        nickname = input("Enter nickname: ")
        createbadge(nickname)


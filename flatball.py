#!/usr/bin/python3
# This script is designed specifically for the Evolis Pebble 3 and New Pebble printers (and tested).

# either start it with no arguments and get a prompt, or pass as many nicknames as you want through the arguments
import io

import cups #printer connection https://pypi.org/project/pycups/
import sys
import re
import socket
import json
import os

from PIL import Image # https://python-pillow.org/
from PIL import ImageFont
from PIL import ImageDraw

import cairosvg

filename = "tmpbadge.png" #temporary filename, because PyCups can only print a file, not an object
printername = "EVOLIS_Pebble" #printername in Cups

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


def createbadge(code):
    # RegularExpression is based on the rules for pre-tix coupon codes
    if not re.match("^[abcdefghjkmnpqrstuvwxyz23456789]*$", code):
        print ("Code can only contain 'abcdefghjkmnpqrstuvwxyz23456789' and must be 32 characters")
        return
    if len(code)<32:
        print ("I need exactly 32 characters.")
        return        
    if len(code)>32:
        print ("I need exactly 32 characters.")
        return

    import qrcode
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(code)
    qr.make(fit=True)

    qrimg = qr.make_image(fill_color="black", back_color="white")
    qrimg = qrimg.convert('RGBA')
    qrimg = qrimg.resize((256,256), resample = Image.Dither.NONE)
    # qrimg = qrimg.rotate(60, expand=True,fillcolor=None)
    data = request({
        'name': code,
        'width': cardwidth,
        'height': cardheight,
        'black': True,
        'remove_text': True,
        'geometry_x': 1.25,
        'geometry_y': 0.249,
        'close': True,
    })

    if not data['success']:
        print('Template generation failed: %s' % data.msg)
        return

    png = cairosvg.svg2png(bytestring=data['data'])
    background = Image.open(io.BytesIO(png))

    angelbadge = Image.new('RGBA', size=(cardwidth, cardheight), color='black')
    angelbadge.paste(background, (0,0),background)
    angelbadge.paste(qrimg, (50,int((cardheight-256)/2)),qrimg) #2nd 'aztec' reference is for the mask
    draw = ImageDraw.Draw(angelbadge)

    font = ImageFont.truetype("./ShareTechMono-Regular.ttf", 25)
    
    #break the code in two segments to make it fit.
    draw.rectangle((50, (cardheight/2)+128,50+256,(cardheight/2)+128+52), fill="white", outline=None)
    draw.text((50+128,((cardheight/2)+128)), code[0:16], fill="black", anchor="mm", font=font) # https://pillow.readthedocs.io/en/stable/handbook/text-anchors.html
    draw.text((50+128,((cardheight/2)+128+26)), code[16:32], fill="black", anchor="mm", font=font) # https://pillow.readthedocs.io/en/stable/handbook/text-anchors.html
    
    angelbadge.save(filename, "PNG")

    try:
        pebble = cups.Connection()
        pebble.printFile (printername, filename, "paycard", printeroptions)
        print("Sent paycard to "+printername+"!")
    except Exception as e:
        print("printer error: "+str(e))
    #os.remove(filename) #for 'safety' delete the image.

if len(sys.argv)>1: #print all passed arguments as paycards
    print("Hi! Gonna hit you up with some nice cards!")
    for code in sys.argv[1:]:
        createbadge(code)
else: #give a nice prompt
    while True:
        code = input("Enter code: ")
        createbadge(code)

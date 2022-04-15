#!/usr/bin/python3
#either start it with no arguments and get a prompt, or pass as many nicknames as you want through the arguments

import cups
import sys

from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw
from aztec_code_generator import AztecCode

#temporary filename
filename="tmpbadge.png"

#printername
printername="Pebble"

# Card resolution
# Pebble3 PPD driver specs 243.84 x 155.52. That is at a standard 72 'point' raster, at 300 dpi
# So 243.84 / 72 * 300 = 1016 horizontal and 155.52 / 72 * 300 = 648 vertical
# More info: https://en.wikipedia.org/wiki/Point_(typography)
cardwidth = 1016 
cardheight = 648

def createbadge(nickname):
    aztec_code = AztecCode("angel"+nickname,size=23,compact=True)
    aztec_code.save('aztec_code.png', module_size=4, border=0)
    aztec = Image.open('aztec_code.png')
    aztec = aztec.convert('RGBA')
    aztec = aztec.resize((255,255), resample = Image.Dither.NONE)
    aztec = aztec.rotate(60, expand=True,fillcolor=None)

    background = Image.open('pasjeachterkant.png')

    angelbadge = Image.new('RGBA', size=(cardwidth, cardheight))
    angelbadge.paste(background, (0,0))
    angelbadge.paste(aztec, ((cardwidth-102-250),50),aztec) #2nd 'aztec' reference is for the mask
    draw = ImageDraw.Draw(angelbadge)

    font = ImageFont.truetype("./Saira-Regular.ttf", 150)
    length,height=font.getsize(nickname)

    if length > 1000: # if the nickname is too wide in the default font, scale it down
        font = ImageFont.truetype("./Saira-Regular.ttf", int(150/length*1000))
        length,height=font.getsize(nickname)

    draw.rectangle((0, 520-(height/2),cardwidth,520+(height/2)), fill="white", outline=None)
    draw.text((1016/2,520), nickname, fill="black", anchor="mm", font=font)

    angelbadge.save(filename, "PNG")

    pebble = cups.Connection()

    pebble.printFile (printername, filename, "angelbadge for "+nickname, {})
    print("Sent angelbadge for "+nickname+" to "+printername+"!")

if len(sys.argv)>1: #print all passed arguments as angel badges
    print("hi! Gonna hit you up with some nice cards!")
    del sys.argv[0]
    for nicks in sys.argv:
        createbadge(nicks)
else: #give a nice prompt
    while True:
        nickname = input("Enter nickname: ")
        createbadge(nickname)

#!/usr/bin/python3
# Made by Bas Oort (twitter @basoort, github.com/sebastius)
# Feel free to use this and hack it. 

import cups
import qrcode
import sys
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw

while True:
    nickname = input("Enter nickname: ")
    print ("gonna print: " + nickname)

    from aztec_code_generator import AztecCode
    aztec_code = AztecCode("angel"+nickname,size=23,compact=True) #angels get a prefix for Logistics Warehouse
    aztec_code.save('aztec_code.png', module_size=4, border=0)

    background = Image.open('background.png') # image size 1016 x 648
    aztec = Image.open('aztec_code.png')
    aztec = aztec.convert('RGBA')
    aztec = aztec.resize((255,255), resample = Image.Dither.NONE)
    aztec = aztec.rotate(60, expand=True,fillcolor=None)

    angelbadge = Image.new('RGBA', size=(1016, 648))
    angelbadge.paste(background, (0,0))
    angelbadge.paste(aztec, ((1016-102-250),50),aztec)
    draw = ImageDraw.Draw(angelbadge)

    font = ImageFont.truetype("./Saira-Regular.ttf", 150)
    length,height=font.getsize(nickname)

    if length > 1000: # if the nickname is too wide in the default font, scale it down
        font = ImageFont.truetype("./Saira-Regular.ttf", int(150/length*1000))
        length,height=font.getsize(nickname)

    draw.rectangle((0, 520-(height/2),1016,520+(height/2)), fill="white", outline=None)
    draw.text((1016/2,520), nickname, fill="black", anchor="mm", font=font)

    angelbadge.save("badge.png", "PNG")

    pebble = cups.Connection()
    file = "./badge.png"
    #pebble.printFile ("Pebble", file, "angelbadge", {}) #if you don't want to print a million cards during testing, comment this line
    print("Done!")

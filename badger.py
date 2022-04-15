#!/usr/bin/python3
import cups
import sys
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw
from aztec_code_generator import AztecCode

while True:
    nickname = input("Enter nickname: ")

    from aztec_code_generator import AztecCode
    aztec_code = AztecCode("angel"+nickname,size=23,compact=True)
    aztec = aztec_code.image(module_size=4, border=0)
    aztec = aztec.convert('RGBA')
    aztec = aztec.resize((255,255), resample = Image.Dither.NONE)
    aztec = aztec.rotate(60, expand=True,fillcolor=None)
    
    background = Image.open('pasjeachterkant.png')
    
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

    file = "./badge.png"
    
    pebble = cups.Connection()
    #pebble.printFile ("Pebble", file, "angelbadge", {})
    
    print("Done!")
